import json
import sqlite3
import tempfile
import unittest
import unicodedata
from contextlib import closing
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
            with closing(sqlite3.connect(database)) as db:
                db.execute("CREATE TABLE Bible (Book INT, Chapter INT, Verse INT, Scripture TEXT)")
                db.execute("CREATE TABLE Details (Title TEXT)")
                db.commit()
            with closing(sqlite3.connect(database)) as db:
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


    def test_anchored_conversion_sorts_allows_gap_and_restarts_chapter(self):
        def line(text, left, top, size=9):
            return {"texto": text, "izquierda": left, "arriba": top, "derecha": left + 400,
                    "abajo": top + 40, "tamano_max": size}
        pages = [{"pagina_digital": 1, "ancho": 1000, "alto": 1000, "bloques": [
            {"clasificacion": "texto_espanol", "lineas_detalle": [line("?3 tercero", 520, 500),
             line("nota excluida", 520, 450, 7), line("I primero", 520, 200),
             line("continuacion", 520, 300), line("2 latino", 200, 350)]}]},
            {"pagina_digital": 2, "ancho": 1000, "alto": 1000, "bloques": [
            {"clasificacion": "texto_espanol", "lineas_detalle": [line("1 nuevo", 520, 300),
             line("2 segundo", 520, 400)]}]}]
        anchors = {"book_code": "GEN", "chapters": [
            {"chapter": 1, "page_digital": 1, "y": 100},
            {"chapter": 2, "page_digital": 2, "y": 200}]}
        rows = scio.convert_anchored_pages(pages, anchors, {("GEN", 1): 3, ("GEN", 2): 2}, 1)
        self.assertEqual([(r["capitulo"], r["versiculo"]) for r in rows],
                         [(1, 1), (1, 3), (2, 1), (2, 2)])
        self.assertEqual(rows[0]["texto"], "primero continuacion")
        self.assertEqual(rows[1]["texto"], "tercero")
        self.assertNotIn("nota", " ".join(r["texto"] for r in rows))


    def test_anchored_conversion_recovers_degraded_body_before_note_gap(self):
        def line(text, top, size=7.5):
            return {"texto": text, "izquierda": 520, "arriba": top, "derecha": 920,
                    "abajo": top + 40, "tamano_max": size}
        pages = [{"pagina_digital": 1, "ancho": 1000, "alto": 1000, "bloques": [{
            "clasificacion": "encabezado", "lineas_detalle": [line("1 primero", 100),
            line("2 segundo", 180), line("continuacion", 260), line("1 nota", 500)]}]}]
        anchors = {"book_code": "GEN", "chapters": [{"chapter": 1, "page_digital": 1, "y": 70}]}
        rows = scio.convert_anchored_pages(pages, anchors, {("GEN", 1): 2}, 1)
        self.assertEqual([(row["versiculo"], row["texto"]) for row in rows],
                         [(1, "primero"), (2, "segundo continuacion")])


    def test_txt_fallback_does_not_replace_abbyy_key(self):
        existing = [scio.make_verse("GEN", 37, 26, "ABBYY", 1, 1, None,
                                    "ABBYY", "requiere_revision", .85)]
        rows = scio.txt_fallback_verses(existing, 1)
        self.assertNotIn((37, 26), {(r["capitulo"], r["versiculo"]) for r in rows})
        self.assertEqual(len(rows), 15)

    def test_txt_fallback_has_explicit_provenance(self):
        rows = scio.txt_fallback_verses([], 1)
        self.assertEqual(len(rows), 16)
        row = next(r for r in rows if (r["capitulo"], r["versiculo"]) == (37, 26))
        self.assertEqual(row["fuente_tipo"], "TXT")
        self.assertEqual(row["estado_revision"], "requiere_revision_txt")
        self.assertLess(row["confianza_estructura"], .85)
        self.assertIn("fuente_lineas", row)


    def test_anchored_conversion_respects_reviewed_page_sequence(self):
        def line(text, top):
            return {"texto": text, "izquierda": 520, "arriba": top, "derecha": 920,
                    "abajo": top + 40, "tamano_max": 9}

        pages = [
            {"pagina_digital": page, "ancho": 1000, "alto": 1000, "bloques": [
                {"clasificacion": "texto_espanol", "lineas_detalle": [line(text, 200)]}
            ]}
            for page, text in ((1, "2 segundo"), (2, "3 tercero"), (3, "1 primero"))
        ]
        anchors = {
            "book_code": "JER",
            "chapters": [{"chapter": 46, "page_digital": 3, "y": 100,
                          "end_page_digital": 2, "end_y": 900}],
            "metadata": {"chapter_page_sequences": {"JER.46": [
                {"page_digital": 3, "start_y": 100},
                {"page_digital": 1},
                {"page_digital": 2, "end_y": 900},
            ]}},
        }
        rows = scio.convert_anchored_pages(pages, anchors, {("JER", 46): 3}, 9)
        self.assertEqual([(row["versiculo"], row["texto"]) for row in rows],
                         [(1, "primero"), (2, "segundo"), (3, "tercero")])
    def test_scan_fallback_has_explicit_provenance(self):
        rows = scio.scan_fallback_verses([], 1)
        self.assertEqual(len(rows), 24)
        row = next(r for r in rows if (r["capitulo"], r["versiculo"]) == (19, 30))
        self.assertEqual(row["fuente_tipo"], "UA_SCAN")
        self.assertEqual(row["estado_revision"], "requiere_revision_facsimil")
        self.assertEqual(row["pagina_impresa"], 53)
        self.assertIn("sirio.ua.es", row["fuente_url"])
        self.assertEqual(row["fuente_imagen"], "0091_s.jpg")

    def test_scan_fallback_does_not_replace_existing_key(self):
        existing = [scio.make_verse("GEN", 8, 5, "ABBYY", 1, 1, None,
                                    "ABBYY", "requiere_revision", .85)]
        rows = scio.scan_fallback_verses(existing, 1)
        self.assertNotIn((8, 5), {(r["capitulo"], r["versiculo"]) for r in rows})
        self.assertEqual(len(rows), 23)

    def test_reviewed_fallbacks_are_explicit_and_do_not_replace_existing(self):
        rows = scio.reviewed_fallback_verses([], 2)
        self.assertEqual(len(rows), 50)
        self.assertIn("ABBYY_COMBINED", {row["fuente_tipo"] for row in rows})
        self.assertIn("TXT", {row["fuente_tipo"] for row in rows})
        self.assertIn("SCIO_VULGATE_CROSSCHECK", {row["fuente_tipo"] for row in rows})
        self.assertTrue(all(row["fuente_archivo"] for row in rows))
        existing = [scio.make_verse("EXO", 13, 2, "ABBYY", 2, 1, None,
                                    "ABBYY", "requiere_revision", .85)]
        filtered = scio.reviewed_fallback_verses(existing, 2)
        self.assertEqual(len(filtered), 49)
        self.assertNotIn(("EXO", 13, 2), {(row["libro_codigo"], row["capitulo"], row["versiculo"])
                                         for row in filtered})

if __name__ == "__main__":
    unittest.main()
