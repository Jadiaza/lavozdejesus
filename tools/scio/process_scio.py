#!/usr/bin/env python3
"""Procesador local y auditable de la Biblia de Felipe Scío de San Miguel."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import logging
import os
import re
import sqlite3
import sys
import tempfile
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Iterator
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SCIO = (ROOT / "storage" / "biblia" / "scio").resolve()
CONFIG = SCIO / "config"
SOURCE = SCIO / "fuente"
WORK = SCIO / "trabajo"
PAGES = WORK / "paginas"
STRUCTURED = WORK / "estructurado"
NOTES = WORK / "notas"
PROCESSED = SCIO / "procesado"
LOGS = WORK / "logs"
EXPECTED_VOLUMES = tuple(range(1, 16))
FINAL_NAMES = ("libros.json", "versiculos.json", "manifiesto.json", "reporte-validacion.json")
CLASSES = {
    "titulo_libro", "titulo_capitulo", "texto_espanol", "texto_latino",
    "nota_scio", "encabezado", "pie_pagina", "numero_pagina",
    "referencia_marginal", "desconocido",
}
LATIN = set("et in est non qui quae quod deus dominus dixit autem cum ad de ex per super eius eum erat sunt filius".split())
SPANISH = set("el la los las y en que del dios señor dijo estaba para por con sus una fue como se al más había".split())


class ScioError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def confined(path: Path) -> Path:
    resolved = path.resolve()
    if resolved != SCIO and SCIO not in resolved.parents:
        raise ScioError(f"Ruta fuera de storage/biblia/scio: {resolved}")
    return resolved


def load_json(path: Path) -> Any:
    with confined(path).open("r", encoding="utf-8-sig") as stream:
        return json.load(stream)


def atomic_json(path: Path, data: Any) -> None:
    path = confined(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            json.dump(data, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    except BaseException:
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass
        raise


def atomic_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path = confined(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    count = 0
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
            for row in rows:
                stream.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
                count += 1
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
        return count
    except BaseException:
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass
        raise


def iter_jsonl(path: Path) -> Iterator[dict[str, Any]]:
    with confined(path).open("r", encoding="utf-8") as stream:
        for number, line in enumerate(stream, 1):
            if line.strip():
                try:
                    yield json.loads(line)
                except json.JSONDecodeError as error:
                    raise ScioError(f"JSONL inválido en {path.name}:{number}") from error


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize(text: str, rules: dict[str, Any]) -> str:
    value = html.unescape(text or "")
    for source, target in rules.get("replacements", {}).items():
        value = value.replace(source, target)
    value = unicodedata.normalize("NFC", value)
    value = re.sub(r"[\t \u00a0]+", " ", value)
    return re.sub(r"\s*\n\s*", "\n", value).strip()


def words(text: str) -> list[str]:
    folded = unicodedata.normalize("NFD", text.lower())
    folded = "".join(c for c in folded if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z]+", folded)


def classify(text: str, box: dict[str, int], page: dict[str, int], formats: list[dict[str, Any]],
             ignores: dict[str, Any]) -> str:
    clean = text.strip()
    if not clean:
        return "desconocido"
    for name, patterns in ignores.get("classification_patterns", {}).items():
        if name in CLASSES and any(re.search(pattern, clean, re.I) for pattern in patterns):
            return name
    height, width = page["alto"], page["ancho"]
    if re.fullmatch(r"[\divxlcdm.\- ]{1,12}", clean, re.I):
        return "numero_pagina"
    if box["arriba"] <= height * 0.10:
        return "encabezado"
    if box["abajo"] >= height * 0.92:
        return "pie_pagina"
    if box["derecha"] <= width * 0.22 or box["izquierda"] >= width * 0.78:
        return "referencia_marginal"
    tokens = words(clean)
    la = sum(token in LATIN for token in tokens)
    es = sum(token in SPANISH for token in tokens)
    if la >= 2 and la > es * 1.5:
        return "texto_latino"
    if es >= 1 or re.match(r"^\d{1,3}[ .]", clean):
        return "texto_espanol"
    if formats and max((float(f.get("tamano") or 0) for f in formats), default=0) >= 16:
        return "titulo_libro"
    return "desconocido"


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def int_attr(element: ET.Element, key: str) -> int:
    try:
        return int(float(element.attrib.get(key, "0")))
    except ValueError:
        return 0


def extract_pages(volume: int) -> Iterator[dict[str, Any]]:
    path = SOURCE / "abbyy" / f"scio_tomo_{volume:02d}_abbyy.xml"
    rules = load_json(CONFIG / "normalization.json")
    ignores = load_json(CONFIG / "ignore-patterns.json")
    page_number = 0
    context = ET.iterparse(confined(path), events=("end",))
    for _, element in context:
        if local(element.tag) != "page":
            continue
        page_number += 1
        page = {"ancho": int_attr(element, "width"), "alto": int_attr(element, "height")}
        blocks = []
        for block in (node for node in element.iter() if local(node.tag) == "block"):
            box = {
                "izquierda": int_attr(block, "l"), "arriba": int_attr(block, "t"),
                "derecha": int_attr(block, "r"), "abajo": int_attr(block, "b"),
            }
            lines, languages, formats = [], set(), []
            for line in (node for node in block.iter() if local(node.tag) == "line"):
                parts = []
                for char in (node for node in line.iter() if local(node.tag) == "charParams"):
                    token = "".join(char.itertext())
                    if char.attrib.get("wordStart") == "true" and parts and not parts[-1].endswith(" "):
                        parts.append(" ")
                    parts.append(token)
                line_text = normalize("".join(parts), rules)
                if line_text:
                    lines.append(line_text)
                for fmt in (node for node in line.iter() if local(node.tag) == "formatting"):
                    language = fmt.attrib.get("lang")
                    if language:
                        languages.add(language)
                    formats.append({
                        "idioma": language, "fuente": fmt.attrib.get("ff"),
                        "tamano": fmt.attrib.get("fs"), "negrita": fmt.attrib.get("bold") == "1",
                        "cursiva": fmt.attrib.get("italic") == "1",
                    })
            text = normalize("\n".join(lines), rules)
            if text:
                blocks.append({
                    "tipo_abbyy": block.attrib.get("blockType"), "coordenadas": box,
                    "lineas": lines, "texto": text, "idiomas": sorted(languages),
                    "formatos": formats, "clasificacion": classify(text, box, page, formats, ignores),
                })
        yield {
            "schema": "lvj.scio.abbyy-page.v2", "tomo": volume,
            "pagina_digital": page_number, **page, "bloques": blocks,
        }
        element.clear()


def command_diagnose(_: argparse.Namespace) -> int:
    result = {"timestamp": utc_now(), "xml": [], "bbli": {}, "errors": [], "warnings": []}
    for volume in EXPECTED_VOLUMES:
        path = SOURCE / "abbyy" / f"scio_tomo_{volume:02d}_abbyy.xml"
        entry = {"tomo": volume, "archivo": path.name, "existe": path.is_file()}
        if path.is_file():
            entry.update({"bytes": path.stat().st_size, "sha256": sha256_file(path)})
            try:
                for event, element in ET.iterparse(path, events=("start",)):
                    if local(element.tag) == "page":
                        break
            except ET.ParseError as error:
                result["errors"].append(f"{path.name}: XML inválido: {error}")
        else:
            result["errors"].append(f"Falta {path.name}")
        result["xml"].append(entry)
    bbli = SOURCE / "bbli" / "scio_nt_1797.bbli"
    if not bbli.is_file():
        result["errors"].append("Falta scio_nt_1797.bbli")
    else:
        uri = f"file:{bbli.as_posix()}?mode=ro"
        with sqlite3.connect(uri, uri=True) as db:
            tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            result["bbli"] = {"archivo": bbli.name, "tablas": sorted(tables), "sha256": sha256_file(bbli)}
            missing = {"Bible", "Details"} - tables
            if missing:
                result["errors"].append(f"BBLI sin tablas: {', '.join(sorted(missing))}")
            else:
                result["bbli"]["filas"] = db.execute("SELECT COUNT(*) FROM Bible").fetchone()[0]
                result["bbli"]["libros"] = db.execute("SELECT COUNT(DISTINCT Book) FROM Bible").fetchone()[0]
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result["errors"] else 0


def command_extract(args: argparse.Namespace) -> int:
    output = PAGES / f"tomo_{args.tomo:02d}_paginas.jsonl"
    count = atomic_jsonl(output, extract_pages(args.tomo))
    logging.info("Tomo %02d extraído: %d páginas -> %s", args.tomo, count, output)
    return 0


def parse_chapter(text: str) -> int | None:
    match = re.search(r"\b(?:CAP[IÍ]TULO|PSALMO)\s+([IVXLCDM]+|\d+)", text, re.I)
    if not match:
        return None
    token = match.group(1).upper()
    if token.isdigit():
        return int(token)
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for index, char in enumerate(token):
        value = values[char]
        total += -value if index + 1 < len(token) and value < values[token[index + 1]] else value
    return total


def command_convert(args: argparse.Namespace) -> int:
    pages_path = PAGES / f"tomo_{args.tomo:02d}_paginas.jsonl"
    if not pages_path.is_file():
        raise ScioError(f"Ejecute primero extraer --tomo {args.tomo}")
    volumes = load_json(CONFIG / "volumes.json")
    codes = volumes[str(args.tomo)]["libros"]
    books = {book["codigo"]: book for book in load_json(CONFIG / "books.json")}
    aliases = [(code, books[code]["nombre"]) for code in codes]
    active_book = codes[0] if len(codes) == 1 else None
    chapter = None
    verses, notes = [], []
    for page in iter_jsonl(pages_path):
        for block in page["bloques"]:
            text, kind = block["texto"].replace("\n", " "), block["clasificacion"]
            for code, name in aliases:
                if name.lower() in text.lower() and ("libro" in text.lower() or kind == "titulo_libro"):
                    active_book, chapter = code, None
            detected = parse_chapter(text)
            if detected:
                chapter = detected
                continue
            if kind == "nota_scio":
                notes.append({"tomo": args.tomo, "pagina_digital": page["pagina_digital"], "texto": text})
                continue
            if kind != "texto_espanol" or active_book is None or chapter is None:
                continue
            match = re.match(r"^\s*(\d{1,3})[.)º°]?\s+(.+)$", text)
            if not match:
                continue
            number, verse_text = int(match.group(1)), match.group(2).strip()
            verses.append(make_verse(active_book, chapter, number, verse_text, args.tomo,
                                      page["pagina_digital"], None, "ABBYY", "requiere_revision", 0.55))
    atomic_jsonl(STRUCTURED / f"tomo_{args.tomo:02d}_versiculos.jsonl", verses)
    atomic_jsonl(NOTES / f"tomo_{args.tomo:02d}_notas.jsonl", notes)
    logging.info("Tomo %02d convertido: %d candidatos, %d notas", args.tomo, len(verses), len(notes))
    return 0


def make_verse(code: str, chapter: int, verse: int, text: str, volume: int | None,
               digital: int | None, printed: str | None, source: str, status: str,
               confidence: float) -> dict[str, Any]:
    source_hash = hashlib.sha256(
        f"{source}|{code}|{chapter}|{verse}|{text}".encode("utf-8")
    ).hexdigest()
    return {
        "libro_codigo": code, "capitulo": chapter, "versiculo": verse, "texto": text,
        "titulo_seccion": None, "tiene_nota": 0, "tomo": volume,
        "pagina_digital": digital, "pagina_impresa": printed, "fuente_tipo": source,
        "estado_revision": status, "confianza_estructura": confidence, "hash_fuente": source_hash,
    }


def command_import_nt(_: argparse.Namespace) -> int:
    books = load_json(CONFIG / "books.json")
    nt = [book for book in books if book["testamento"] == "NT"]
    mapping = {40 + index: book["codigo"] for index, book in enumerate(nt)}
    rules = load_json(CONFIG / "normalization.json")
    bbli = SOURCE / "bbli" / "scio_nt_1797.bbli"
    uri = f"file:{confined(bbli).as_posix()}?mode=ro"
    rows = []
    with sqlite3.connect(uri, uri=True) as db:
        tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if not {"Bible", "Details"} <= tables:
            raise ScioError("El BBLI debe contener las tablas Bible y Details")
        source_books = {int(row[0]) for row in db.execute("SELECT DISTINCT Book FROM Bible")}
        if source_books != set(mapping):
            raise ScioError(f"El BBLI debe contener exactamente los 27 libros NT (40-66); contiene {sorted(source_books)}")
        for book, chapter, verse, scripture in db.execute(
                "SELECT Book, Chapter, Verse, Scripture FROM Bible ORDER BY Book, Chapter, Verse"):
            text = normalize(str(scripture or ""), rules)
            rows.append(make_verse(mapping[int(book)], int(chapter), int(verse), text,
                                   None, None, None, "BBLI", "fuente_estructurada", 1.0))
    atomic_jsonl(STRUCTURED / "nuevo_testamento_versiculos.jsonl", rows)
    logging.info("Nuevo Testamento importado a trabajo: %d versículos", len(rows))
    return 0


def validate(books: list[dict[str, Any]], verses: Iterable[dict[str, Any]]) -> dict[str, Any]:
    errors, warnings = [], []
    codes = [book["codigo"] for book in books]
    if len(books) != 73:
        errors.append(f"Se requieren 73 libros; hay {len(books)}")
    if sum(book["testamento"] == "AT" for book in books) != 46:
        errors.append("El canon debe contener 46 libros AT")
    if sum(book["testamento"] == "NT" for book in books) != 27:
        errors.append("El canon debe contener 27 libros NT")
    if len(codes) != len(set(codes)):
        errors.append("Existen libros duplicados")
    seen, chapters, source_books = set(), defaultdict(set), set()
    counts = Counter()
    strange = re.compile(r"[\uFFFD\u200B\u202A-\u202E]")
    latin_phrase = re.compile(r"\b(?:dominus|autem|dixit|filius|quæ|caelum)\b", re.I)
    note_phrase = re.compile(r"\b(?:nota|véase|cf\.|scío)\b", re.I)
    furniture = re.compile(r"(?:^\s*\d+\s*$|\b(?:tomo|página)\s+[ivxlcdm\d]+\b)", re.I)
    previous: dict[tuple[str, int], int] = {}
    for row in verses:
        code, chapter, number = row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])
        key = (code, chapter, number)
        if key in seen:
            errors.append(f"Versículo duplicado: {code}.{chapter}.{number}")
        seen.add(key); chapters[code].add(chapter); source_books.add(code)
        counts[row.get("fuente_tipo", "desconocida")] += 1
        expected = previous.get((code, chapter), 0) + 1
        if number != expected:
            warnings.append(f"Salto/versificación en {code}.{chapter}: esperado {expected}, encontrado {number}")
        previous[(code, chapter)] = number
        text = row.get("texto", "")
        if strange.search(text):
            errors.append(f"Unicode extraño en {code}.{chapter}.{number}")
        if latin_phrase.search(text):
            warnings.append(f"Posible latín mezclado en {code}.{chapter}.{number}")
        if note_phrase.search(text):
            warnings.append(f"Posible nota mezclada en {code}.{chapter}.{number}")
        if furniture.search(text):
            warnings.append(f"Posible encabezado/página en {code}.{chapter}.{number}")
    for book in books:
        code = book["codigo"]
        expected = set(range(1, int(book["capitulos"]) + 1))
        missing = expected - chapters[code]
        if missing:
            errors.append(f"Capítulos vacíos en {code}: {sorted(missing)}")
    nt_codes = {book["codigo"] for book in books if book["testamento"] == "NT"}
    if len(nt_codes & source_books) != 27:
        errors.append(f"El NT procesado contiene {len(nt_codes & source_books)} libros, no 27")
    return {
        "schema_version": "1.0", "generated_at": utc_now(), "valid": not errors,
        "counts": {"books": len(books), "verses": len(seen), "sources": dict(counts)},
        "special_versification": {
            "books": ["PSA", "EST", "DAN", "1SA", "2SA", "1KI", "2KI", "EZR", "NEH",
                      "TOB", "JDT", "WIS", "SIR", "BAR", "1MA", "2MA"],
            "policy": "reportar_diferencias_sin_corregir",
        },
        "errors": errors, "warnings": warnings,
    }


def collect_work_verses() -> list[dict[str, Any]]:
    paths = sorted(STRUCTURED.glob("tomo_*_versiculos.jsonl"))
    nt = STRUCTURED / "nuevo_testamento_versiculos.jsonl"
    if nt.is_file():
        paths.append(nt)
    return [row for path in paths for row in iter_jsonl(path) if row.get("fuente_tipo") != "ABBYY"
            or row.get("libro_codigo") in {b["codigo"] for b in load_json(CONFIG / "books.json") if b["testamento"] == "AT"}]


def command_validate(_: argparse.Namespace) -> int:
    report = validate(load_json(CONFIG / "books.json"), collect_work_verses())
    atomic_json(WORK / "reporte-validacion.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["errors"] else 0


def command_build(_: argparse.Namespace) -> int:
    books = load_json(CONFIG / "books.json")
    verses = collect_work_verses()
    report = validate(books, verses)
    if report["errors"]:
        atomic_json(WORK / "reporte-validacion.json", report)
        raise ScioError("Validación fallida; no se sobrescribieron archivos finales")
    order = {book["codigo"]: book["orden"] for book in books}
    verses.sort(key=lambda row: (order[row["libro_codigo"]], row["capitulo"], row["versiculo"]))
    stage = WORK / ".construccion"
    stage.mkdir(parents=True, exist_ok=True)
    atomic_json(stage / "libros.json", [
        {key: book[key] for key in ("testamento", "grupo", "orden", "nombre", "abreviatura", "codigo", "capitulos")}
        for book in books
    ])
    atomic_json(stage / "versiculos.json", verses)
    atomic_json(stage / "reporte-validacion.json", report)
    manifest = {
        "schema_version": "1.0", "codigo": "SCIO",
        "nombre": "Biblia de Felipe Scío de San Miguel", "idioma": "es", "canon": 73,
        "versificacion": "Vulgata", "uso": "comparativo", "tomos_esperados": 15,
        "tomos_procesados": sorted({row["tomo"] for row in verses if row["tomo"] is not None}),
        "fuente_nt": "scio_nt_1797.bbli", "conteos": report["counts"],
        "hashes_sha256": {}, "fecha_generacion": utc_now(), "approved_for_mysql": True,
        "errors": report["errors"], "warnings": report["warnings"],
    }
    for name in ("libros.json", "versiculos.json", "reporte-validacion.json"):
        manifest["hashes_sha256"][name] = sha256_file(stage / name)
    atomic_json(stage / "manifiesto.json", manifest)
    PROCESSED.mkdir(parents=True, exist_ok=True)
    for name in FINAL_NAMES:
        os.replace(confined(stage / name), confined(PROCESSED / name))
    logging.info("Paquete canónico construido en %s", PROCESSED)
    return 0


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    sub = result.add_subparsers(dest="command", required=True)
    sub.add_parser("diagnosticar").set_defaults(handler=command_diagnose)
    for name, handler in (("extraer", command_extract), ("convertir", command_convert)):
        command = sub.add_parser(name)
        command.add_argument("--tomo", type=int, choices=EXPECTED_VOLUMES, required=True)
        command.set_defaults(handler=handler)
    sub.add_parser("importar-nt").set_defaults(handler=command_import_nt)
    sub.add_parser("validar").set_defaults(handler=command_validate)
    sub.add_parser("construir").set_defaults(handler=command_build)
    return result


def main(argv: list[str] | None = None) -> int:
    LOGS.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[logging.FileHandler(LOGS / "process_scio.log", encoding="utf-8"), logging.StreamHandler()],
    )
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (ScioError, OSError, ET.ParseError, sqlite3.Error, json.JSONDecodeError) as error:
        logging.exception("Procesamiento abortado: %s", error)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
