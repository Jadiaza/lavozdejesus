import json
import sqlite3
import tempfile
import unittest
import unicodedata
from pathlib import Path
from unittest.mock import patch

import process_scio as scio


class ScioTests(unittest.TestCase):
    def test_html_and_unicode_normalization(self):
        text = scio.normalize("A\u0301  &aacute; \n  texto", {"replacements": {}})
        self.assertEqual(text, "Á á\ntexto")
        self.assertTrue(unicodedata.is_normalized("NFC", text))

    def test_verse_key_duplicate_detection(self):
        books = [{"codigo": f"B{i}", "testamento": "AT" if i < 46 else "NT",
                  "capitulos": 1} for i in range(73)]
        verse = scio.make_verse("B0", 1, 1, "Texto", 1, 1, None, "ABBYY", "x", .5)
        report = scio.validate(books, [verse, verse])
        self.assertTrue(any("duplicado" in error for error in report["errors"]))

    def test_nt_count_validation(self):
        books = [{"codigo": f"B{i}", "testamento": "AT" if i < 46 else "NT",
                  "capitulos": 1} for i in range(73)]
        report = scio.validate(books, [])
        self.assertTrue(any("NT procesado" in error for error in report["errors"]))

    def test_atomic_json(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.object(scio, "SCIO", root):
                target = root / "result.json"
                scio.atomic_json(target, {"á": 1})
                self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"á": 1})
                self.assertEqual(list(root.glob("*.tmp")), [])

    def test_bblli_schema_fixture(self):
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "fixture.bbli"
            with sqlite3.connect(database) as db:
                db.execute("CREATE TABLE Bible (Book INT, Chapter INT, Verse INT, Scripture TEXT)")
                db.execute("CREATE TABLE Details (Title TEXT)")
            with sqlite3.connect(database) as db:
                tables = {row[0] for row in db.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'")}
            self.assertEqual(tables, {"Bible", "Details"})

    def test_abbyy_iterative_fixture(self):
        xml = "<document><page width='10' height='20'><block blockType='Text' l='1' t='2' r='9' b='8'><line><formatting lang='Spanish'><charParams wordStart='true'>Hola</charParams></formatting></line></block></page></document>"
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.xml"
            path.write_text(xml, encoding="utf-8")
            pages = [element for _, element in __import__("xml.etree.ElementTree", fromlist=["iterparse"]).iterparse(path, events=("end",)) if scio.local(element.tag) == "page"]
            self.assertEqual(len(pages), 1)

    def test_manifest_required_fields(self):
        required = {"schema_version", "codigo", "nombre", "idioma", "canon",
                    "versificacion", "approved_for_mysql", "errors", "warnings"}
        source = Path(scio.__file__).read_text(encoding="utf-8")
        for field in required:
            self.assertIn(f'"{field}"', source)


if __name__ == "__main__":
    unittest.main()
