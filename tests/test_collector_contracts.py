"""Reusable contract tests for file-ingestion pipelines.

The cases intentionally use synthetic responses and temporary files, so they can
be adapted to other collectors without contacting live services or touching app data.
"""
import hashlib
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import requests

from test_public_data_collector import collector


class DownloadContractTests(unittest.TestCase):
    """Shared expectations for any collector that downloads source artifacts."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.out = Path(self.tmp.name) / "capture"
        self.out.mkdir()
        self.manifest = {"sources": []}
        self.out_patch = patch.object(collector, "OUT", self.out)
        self.out_patch.start()
        self.addCleanup(self.out_patch.stop)

    def response(self, *, status=200, headers=None, chunks=()):
        response = MagicMock()
        response.__enter__.return_value = response
        response.__exit__.return_value = False
        response.status_code = status
        response.headers = headers or {}
        response.raise_for_status.side_effect = (
            requests.HTTPError(f"HTTP {status}") if status >= 400 else None
        )
        response.iter_content.return_value = iter(chunks)
        return response

    def run_download(self, response, *, limit=1024, name="source"):
        with patch.object(collector, "MAX_DOWNLOAD_BYTES", limit), patch.object(
            collector.SESSION, "get", return_value=response
        ) as mocked_get:
            path = collector.fetch_to_file(
                name, "https://example.test/resource", ".bin", self.manifest
            )
        return path, mocked_get

    def test_successful_download_preserves_bytes_and_hash(self):
        payload = b"reusable fixture payload"
        path, mocked_get = self.run_download(
            self.response(headers={"content-length": str(len(payload))},
                          chunks=[payload[:5], payload[5:]])
        )
        self.assertIsNotNone(path)
        self.assertEqual(path.read_bytes(), payload)
        record = self.manifest["sources"][0]
        self.assertEqual(record["result"], "downloaded")
        self.assertEqual(record["bytes"], len(payload))
        self.assertEqual(record["sha256"], hashlib.sha256(payload).hexdigest())
        mocked_get.assert_called_once()
        self.assertTrue(mocked_get.call_args.kwargs.get("stream"))

    def test_empty_chunks_are_ignored(self):
        path, _ = self.run_download(
            self.response(chunks=[b"", b"data", b"", b"set"])
        )
        self.assertEqual(path.read_bytes(), b"dataset")

    def test_http_errors_are_recorded_without_artifact(self):
        path, _ = self.run_download(self.response(status=503))
        self.assertIsNone(path)
        self.assertEqual(self.manifest["sources"][0]["result"], "failed")
        self.assertFalse((self.out / "source.bin").exists())

    def test_transport_timeout_is_recorded_without_artifact(self):
        with patch.object(collector, "MAX_DOWNLOAD_BYTES", 1024), patch.object(
            collector.SESSION, "get", side_effect=requests.Timeout("simulated timeout")
        ):
            path = collector.fetch_to_file(
                "source", "https://example.test/resource", ".bin", self.manifest
            )
        self.assertIsNone(path)
        self.assertEqual(self.manifest["sources"][0]["result"], "failed")
        self.assertIn("Timeout", self.manifest["sources"][0]["error"])
        self.assertFalse((self.out / "source.bin").exists())

    def test_malformed_content_length_does_not_bypass_streaming_limit(self):
        path, _ = self.run_download(
            self.response(headers={"content-length": "not-a-number"},
                          chunks=[b"123", b"456"]),
            limit=5,
        )
        self.assertIsNone(path)
        self.assertEqual(self.manifest["sources"][0]["result"], "failed")
        self.assertFalse((self.out / "source.bin").exists())

    def test_download_boundary_exact_limit_is_allowed(self):
        path, _ = self.run_download(
            self.response(chunks=[b"1234"]), limit=4
        )
        self.assertIsNotNone(path)
        self.assertEqual(path.stat().st_size, 4)

    def test_download_limit_plus_one_is_rejected_and_partial_file_removed(self):
        path, _ = self.run_download(
            self.response(chunks=[b"1234", b"5"]), limit=4
        )
        self.assertIsNone(path)
        self.assertFalse((self.out / "source.bin").exists())


class ArchiveContractTests(unittest.TestCase):
    """Reusable archive safety cases using generated ZIP fixtures."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.archive = self.root / "fixture.zip"
        self.destination = self.root / "extracted"

    def make_zip(self, entries):
        with zipfile.ZipFile(self.archive, "w") as zf:
            for name, data in entries:
                zf.writestr(name, data)

    def test_nested_files_extract_and_remain_inside_destination(self):
        self.make_zip([("nested/one.csv", "a,b\n1,2\n"),
                       ("nested/two.txt", "notes")])
        extracted = collector.safe_extract_zip(self.archive, self.destination)
        self.assertEqual(len(extracted), 2)
        root = self.destination.resolve()
        self.assertTrue(all(root == p.resolve() or root in p.resolve().parents
                            for p in extracted))
        self.assertEqual((self.destination / "nested/one.csv").read_text(),
                         "a,b\n1,2\n")

    def test_all_members_are_checked_before_any_extraction(self):
        self.make_zip([("safe.txt", "safe"), ("../escape.txt", "unsafe")])
        with self.assertRaises(ValueError):
            collector.safe_extract_zip(self.archive, self.destination)
        self.assertFalse((self.destination / "safe.txt").exists())
        self.assertFalse((self.root / "escape.txt").exists())

    def test_backslash_traversal_is_not_written_outside_root(self):
        # ZIP names are POSIX paths by spec; this fixture guards against future
        # cross-platform path-handling regressions.
        self.make_zip([("..\\escape.txt", "unsafe")])
        try:
            collector.safe_extract_zip(self.archive, self.destination)
        except (ValueError, OSError):
            pass
        self.assertFalse((self.root / "escape.txt").exists())

    def test_declared_size_boundary_is_enforced(self):
        self.make_zip([("data.txt", "12345")])
        with patch.object(collector, "MAX_UNCOMPRESSED_BYTES", 5):
            result = collector.safe_extract_zip(self.archive, self.destination)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].read_text(), "12345")

    def test_corrupt_archive_fails_closed(self):
        self.archive.write_bytes(b"not-a-zip")
        with self.assertRaises(zipfile.BadZipFile):
            collector.safe_extract_zip(self.archive, self.destination)


class CsvInventoryContractTests(unittest.TestCase):
    """Schema-neutral CSV inventory checks for heterogeneous public datasets."""

    def test_supported_delimiters_and_utf8_bom(self):
        cases = [
            ("comma.csv", "\ufeffid,name\n1,Ana\n", ["id", "name"]),
            ("semicolon.csv", "id;name\n1;Ana\n", ["id", "name"]),
            ("tab.csv", "id\tname\n1\tAna\n", ["id", "name"]),
            ("pipe.csv", "id|name\n1|Ana\n", ["id", "name"]),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for filename, contents, expected_columns in cases:
                with self.subTest(filename=filename):
                    path = root / filename
                    path.write_text(contents, encoding="utf-8")
                    item = collector.csv_inventory([path])[0]
                    self.assertEqual(item["columns"], expected_columns)
                    self.assertEqual(item["row_count"], 1)
                    self.assertEqual(len(item["sha256"]), 64)

    def test_empty_file_is_inventoried_without_crashing(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "empty.csv"
            path.write_bytes(b"")
            item = collector.csv_inventory([path])[0]
            self.assertEqual(item["bytes"], 0)
            self.assertEqual(item["row_count"], 0)
            self.assertEqual(item["columns"], None)

    def test_non_csv_files_are_ignored(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            txt = root / "notes.md"
            txt.write_text("not tabular data", encoding="utf-8")
            self.assertEqual(collector.csv_inventory([txt]), [])


if __name__ == "__main__":
    unittest.main()
