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


class CollectorAdversarialTests(unittest.TestCase):
    def _response(self, *, headers=None, chunks=None, status=200, raise_error=None):
        response = MagicMock()
        response.__enter__.return_value = response
        response.__exit__.return_value = False
        response.status_code = status
        response.headers = headers or {}
        response.raise_for_status.side_effect = raise_error
        response.iter_content.return_value = chunks or []
        return response

    def test_malformed_content_length_does_not_bypass_streaming_limit(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            out.mkdir()
            with patch.object(collector, "OUT", out), patch.object(collector, "MAX_DOWNLOAD_BYTES", 4):
                response = self._response(
                    headers={"content-length": "not-a-number"},
                    chunks=[b"1234", b"5"],
                )
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("malformed-length", "https://example.test/data", ".bin", manifest)
                self.assertIsNone(result)
                self.assertEqual(manifest["sources"][0]["result"], "failed")
                self.assertFalse((out / "malformed-length.bin").exists())

    def test_download_exactly_at_limit_is_accepted(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            out.mkdir()
            with patch.object(collector, "OUT", out), patch.object(collector, "MAX_DOWNLOAD_BYTES", 4):
                response = self._response(headers={"content-length": "4"}, chunks=[b"1234"])
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response):
                    result = collector.fetch_to_file("at-limit", "https://example.test/data", ".bin", manifest)
                self.assertIsNotNone(result)
                self.assertEqual(result.read_bytes(), b"1234")

    def test_network_error_is_recorded_without_creating_file(self):
        import requests
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            out.mkdir()
            with patch.object(collector, "OUT", out):
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", side_effect=requests.Timeout("simulated timeout")):
                    result = collector.fetch_to_file("timeout", "https://example.test/data", ".bin", manifest)
                self.assertIsNone(result)
                self.assertEqual(manifest["sources"][0]["result"], "failed")
                self.assertIn("Timeout", manifest["sources"][0]["error"])
                self.assertFalse((out / "timeout.bin").exists())

    def test_zip_symlink_entry_is_not_materialized_as_filesystem_symlink(self):
        import stat
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / "symlink.zip"
            info = zipfile.ZipInfo("link.txt")
            info.create_system = 3
            info.external_attr = (stat.S_IFLNK | 0o777) << 16
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr(info, "../outside.txt")
            extracted = collector.safe_extract_zip(archive, root / "out")
            self.assertEqual(len(extracted), 1)
            self.assertFalse(extracted[0].is_symlink())
            self.assertEqual(extracted[0].read_text(encoding="utf-8"), "../outside.txt")
            self.assertFalse((root / "outside.txt").exists())

    def test_fetch_uses_configured_timeout_and_streaming(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            out.mkdir()
            with patch.object(collector, "OUT", out):
                response = self._response(chunks=[b"x"])
                manifest = {"sources": []}
                with patch.object(collector.SESSION, "get", return_value=response) as get:
                    result = collector.fetch_to_file("one-byte", "https://example.test/data", ".bin", manifest)
                self.assertIsNotNone(result)
                get.assert_called_once_with("https://example.test/data", timeout=collector.TIMEOUT, stream=True)


if __name__ == "__main__":
    unittest.main()
