import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import MagicMock, patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "collect_public_data.py"
SPEC = importlib.util.spec_from_file_location("collector", SCRIPT)
collector = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(collector)


class CollectorTests(unittest.TestCase):
    def test_market_relevance_uses_event_or_market_fields(self):
        self.assertTrue(collector.is_relevant_market({"question": "Who will win the Brazil presidential election?"}))
        self.assertTrue(collector.is_relevant_market({"title": "Eleição presidencial do Brasil"}))
        self.assertFalse(collector.is_relevant_market({"question": "Will it rain tomorrow?"}))

    def test_market_payload_shapes(self):
        self.assertEqual(collector.get_market_list([{"id": "1"}, "bad"]), [{"id": "1"}])
        self.assertEqual(collector.get_market_list({"markets": [{"id": "2"}]}), [{"id": "2"}])
        self.assertEqual(collector.get_market_list({"data": [{"id": "3"}, None]}), [{"id": "3"}])
        self.assertEqual(collector.get_market_list({"oops": []}), [])

    def test_csv_inventory_counts_rows_and_hashes(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "pesquisas.csv"
            path.write_text("id;nome\n1;Ana\n2;Bia\n", encoding="utf-8")
            result = collector.csv_inventory([path])
            self.assertEqual(result[0]["row_count"], 2)
            self.assertEqual(result[0]["columns"], ["id", "nome"])
            self.assertEqual(len(result[0]["sha256"]), 64)

    def test_safe_zip_extracts_valid_csv(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "ok.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("dados/pesquisas.csv", "id,nome\n1,Ana\n")
            files = collector.safe_extract_zip(archive, root / "out")
            self.assertEqual(len(files), 1)
            self.assertTrue((root / "out" / "dados" / "pesquisas.csv").is_file())

    def test_safe_zip_rejects_path_traversal(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "bad.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("../escape.txt", "should not be written")
            with self.assertRaises(ValueError):
                collector.safe_extract_zip(archive, root / "out")
            self.assertFalse((root / "escape.txt").exists())

    def test_safe_zip_rejects_absolute_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "absolute.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("/tmp/escape.txt", "no")
            with self.assertRaises(ValueError):
                collector.safe_extract_zip(archive, root / "out")
            self.assertFalse(Path("/tmp/escape.txt").exists())

    def test_safe_zip_rejects_too_many_members(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "many.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("one.txt", "1")
                zf.writestr("two.txt", "2")
            with patch.object(collector, "MAX_ZIP_MEMBERS", 1):
                with self.assertRaisesRegex(ValueError, "too many members"):
                    collector.safe_extract_zip(archive, root / "out")

    def test_safe_zip_rejects_declared_uncompressed_size_limit(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "large.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("large.txt", "123456789")
            with patch.object(collector, "MAX_UNCOMPRESSED_BYTES", 8):
                with self.assertRaisesRegex(ValueError, "size limit"):
                    collector.safe_extract_zip(archive, root / "out")

    def test_safe_zip_rejects_corrupt_archive(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive = Path(tmp) / "corrupt.zip"
            archive.write_bytes(b"not a zip archive")
            with self.assertRaises(zipfile.BadZipFile):
                collector.safe_extract_zip(archive, Path(tmp) / "out")

    def test_fetch_to_file_rejects_declared_oversize_without_writing(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            with patch.object(collector, "OUT", out), patch.object(collector, "MAX_DOWNLOAD_BYTES", 4):
                out.mkdir()
                response = MagicMock()
                response.__enter__.return_value = response
                response.__exit__.return_value = False
                response.status_code = 200
                response.headers = {"content-length": "5", "content-type": "application/octet-stream"}
                response.raise_for_status.return_value = None
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("large", "https://example.test/data", ".bin", manifest)
                self.assertIsNone(result)
                self.assertEqual(manifest["sources"][0]["result"], "failed")
                self.assertFalse((out / "large.bin").exists())

    def test_fetch_to_file_enforces_streaming_limit_and_cleans_partial_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            with patch.object(collector, "OUT", out), patch.object(collector, "MAX_DOWNLOAD_BYTES", 4):
                out.mkdir()
                response = MagicMock()
                response.__enter__.return_value = response
                response.__exit__.return_value = False
                response.status_code = 200
                response.headers = {"content-type": "application/octet-stream"}
                response.raise_for_status.return_value = None
                response.iter_content.return_value = [b"1234", b"56"]
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("large", "https://example.test/data", ".bin", manifest)
                self.assertIsNone(result)
                self.assertEqual(manifest["sources"][0]["result"], "failed")
                self.assertFalse((out / "large.bin").exists())

    def test_fetch_to_file_records_hash_and_byte_count(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            with patch.object(collector, "OUT", out), patch.object(collector, "MAX_DOWNLOAD_BYTES", 100):
                out.mkdir()
                response = MagicMock()
                response.status_code = 200
                response.headers = {"content-length": "5", "content-type": "text/plain"}
                response.raise_for_status.return_value = None
                response.iter_content.return_value = [b"hello"]
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("small", "https://example.test/data", ".txt", manifest)
                self.assertEqual(result.read_bytes(), b"hello")
                self.assertEqual(manifest["sources"][0]["bytes"], 5)
                self.assertEqual(len(manifest["sources"][0]["sha256"]), 64)

    def test_fetch_to_file_records_http_failure(self):
        import requests
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            with patch.object(collector, "OUT", out):
                out.mkdir()
                response = MagicMock()
                response.__enter__.return_value = response
                response.__exit__.return_value = False
                response.status_code = 503
                response.headers = {"content-type": "text/plain"}
                response.raise_for_status.side_effect = requests.HTTPError("503 Service Unavailable")
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("unavailable", "https://example.test/data", ".txt", manifest)
                self.assertIsNone(result)
                self.assertEqual(manifest["sources"][0]["result"], "failed")
                self.assertIn("HTTPError", manifest["sources"][0]["error"])


if __name__ == "__main__":
    unittest.main()
