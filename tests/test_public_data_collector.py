import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

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


if __name__ == "__main__":
    unittest.main()
