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
            lines, line_details, languages, formats = [], [], set(), []
            for line in (node for node in block.iter() if local(node.tag) == "line"):
                parts = []
                for char in (node for node in line.iter() if local(node.tag) == "charParams"):
                    token = "".join(char.itertext())
                    if char.attrib.get("wordStart") == "true" and parts and not parts[-1].endswith(" "):
                        parts.append(" ")
                    parts.append(token)
                line_text = normalize("".join(parts), rules)
                line_sizes = []
                for fmt in (node for node in line.iter() if local(node.tag) == "formatting"):
                    language = fmt.attrib.get("lang")
                    if language:
                        languages.add(language)
                    try:
                        size = float(fmt.attrib.get("fs", "0"))
                    except ValueError:
                        size = 0.0
                    line_sizes.append(size)
                    formats.append({
                        "idioma": language, "fuente": fmt.attrib.get("ff"),
                        "tamano": fmt.attrib.get("fs"), "negrita": fmt.attrib.get("bold") == "1",
                        "cursiva": fmt.attrib.get("italic") == "1",
                    })
                if line_text:
                    lines.append(line_text)
                    line_details.append({
                        "texto": line_text, "izquierda": int_attr(line, "l"),
                        "arriba": int_attr(line, "t"), "derecha": int_attr(line, "r"),
                        "abajo": int_attr(line, "b"),
                        "tamano_max": max(line_sizes, default=0.0),
                    })
            text = normalize("\n".join(lines), rules)
            if text:
                blocks.append({
                    "tipo_abbyy": block.attrib.get("blockType"), "coordenadas": box,
                    "lineas": lines, "lineas_detalle": line_details, "texto": text, "idiomas": sorted(languages),
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



def convert_anchored_pages(pages: Iterable[dict[str, Any]], anchors: dict[str, Any],
                           expected_max: dict[tuple[str, int], int], volume: int) -> list[dict[str, Any]]:
    """Convierte paginas usando limites de capitulo revisados manualmente."""
    chapter_anchors = sorted(anchors["chapters"], key=lambda a: (int(a["page_digital"]), int(a["y"])))
    page_sequences = anchors.get("metadata", {}).get("chapter_page_sequences", {})
    book_ends = {
        str(code): (int(position["page_digital"]), int(position.get("y", 0)))
        for code, position in anchors.get("book_ends", {}).items()
    }
    marker_overrides = {
        (str(item["book_code"]), int(item["chapter"]), int(item["page_digital"]), int(item["y"])): item
        for item in anchors.get("marker_overrides", []) if item.get("reviewed")
    }
    ignored_lines = {
        (str(item["book_code"]), int(item["chapter"]), int(item["page_digital"]), int(item["y"]))
        for item in anchors.get("ignored_lines", []) if item.get("reviewed")
    }
    page_rows, verses = list(pages), []
    number_pattern = re.compile(r"^[^\w]*([1-9](?:\s?[0-9oO]){0,2})[^\w]*\s+(.+)$")
    ornamental_one = re.compile(r"^[IilJ]\s+(.+)$")
    for index, anchor in enumerate(chapter_anchors):
        book_code = str(anchor.get("book_code", anchors.get("book_code")))
        chapter = int(anchor["chapter"])
        start = (int(anchor["page_digital"]), int(anchor["y"]))
        end = None
        if anchor.get("end_page_digital") is not None:
            end = (int(anchor["end_page_digital"]), int(anchor.get("end_y", 0)))
        elif index + 1 < len(chapter_anchors):
            following = chapter_anchors[index + 1]
            end = (int(following["page_digital"]), int(following["y"]))
            if str(following.get("book_code", anchors.get("book_code"))) != book_code:
                end = book_ends.get(book_code, end)
        else:
            end = book_ends.get(book_code)
        sequence = page_sequences.get(f"{book_code}.{chapter}")
        sequence_limits = {
            int(item["page_digital"]): (
                int(item.get("start_y", 0)),
                int(item["end_y"]) if item.get("end_y") is not None else None,
            )
            for item in sequence or []
        }
        sequence_order = {
            int(item["page_digital"]): order for order, item in enumerate(sequence or [])
        }
        lines = []
        for page in page_rows:
            page_number, width, height = int(page["pagina_digital"]), int(page["ancho"]), int(page["alto"])
            if sequence:
                if page_number not in sequence_limits:
                    continue
            elif page_number < start[0] or (end and page_number > end[0]):
                continue
            for block in page["bloques"]:
                if block.get("clasificacion") == "numero_pagina":
                    continue
                details = sorted(block.get("lineas_detalle", []), key=lambda line: int(line["arriba"]))
                small_body_cutoff = None
                right_details = [line for line in details if int(line["izquierda"]) >= width * .45]
                small_ratio = (sum(float(line["tamano_max"]) <= 7.5 for line in right_details)
                               / len(right_details)) if right_details else 0
                if (len(right_details) >= 4 and int(right_details[0]["arriba"]) < height * .15
                        and small_ratio >= .9):
                    gaps = [(int(right_details[i + 1]["arriba"]) - int(right_details[i]["arriba"]), i)
                            for i in range(len(right_details) - 1)]
                    large_gaps = [(gap, i) for gap, i in gaps if gap >= 140]
                    if large_gaps:
                        _, split_index = max(large_gaps)
                        prefix = right_details[:split_index + 1]
                        numeric_prefixes = sum(bool(number_pattern.match(str(line["texto"]).strip())) for line in prefix)
                        if numeric_prefixes >= 1:
                            small_body_cutoff = int(right_details[split_index + 1]["arriba"])

                probable_note_starts: set[int] = set()
                if len(right_details) >= 9:
                    for index in range(4, len(right_details) - 4):
                        current_y = int(right_details[index]["arriba"])
                        prior_gaps = [int(right_details[pos + 1]["arriba"]) - int(right_details[pos]["arriba"])
                                      for pos in range(index - 4, index)]
                        following_gaps = [int(right_details[pos + 1]["arriba"]) - int(right_details[pos]["arriba"])
                                          for pos in range(index, index + 4)]
                        if (current_y > height * .55
                                and re.match(r"^\s*[1-9]\d?\s+\D", str(right_details[index]["texto"]))
                                and sum(prior_gaps) / len(prior_gaps) >= 78
                                and sum(following_gaps) / len(following_gaps) <= 75):
                            probable_note_starts.add(current_y)
                for line in details:
                    if int(line["arriba"]) in probable_note_starts:
                        line = {**line, "probable_note_start": True}
                    position, size = (page_number, int(line["arriba"])), float(line["tamano_max"])
                    forced = marker_overrides.get((book_code, chapter, page_number, int(line["arriba"])))
                    if (book_code, chapter, page_number, int(line["arriba"])) in ignored_lines:
                        continue

                    if sequence:
                        lower_y, upper_y = sequence_limits[page_number]
                        if int(line["arriba"]) < lower_y or (upper_y is not None and int(line["arriba"]) >= upper_y):
                            continue
                    elif position < start or (end and position >= end):
                        continue
                    if line.get("clasificacion") == "numero_pagina" and not forced:
                        continue
                    if int(line["izquierda"]) < width * .45 and not forced:
                        continue
                    regular_body = 8 <= size <= 12
                    degraded_body = small_body_cutoff is not None and size >= 7 and int(line["arriba"]) < small_body_cutoff
                    small_match = number_pattern.match(str(line["texto"]).strip())
                    embedded_small_marker = (size >= 7 and bool(small_match)
                                             and not re.match(r"^(?:MS\.?|Ferrar\.?)\b", small_match.group(2), re.I)
                                             and any(int(later["arriba"]) > int(line["arriba"])
                                                     and float(later["tamano_max"]) >= 8 for later in details))
                    if not regular_body and not degraded_body and not embedded_small_marker and not forced:
                        continue
                    if (int(line["arriba"]) < height * .07 or int(line["abajo"]) > height * .93) and not forced:
                        continue
                    lines.append((page_number, line))
        lines.sort(key=lambda item: (
            sequence_order.get(item[0], item[0]),
            int(item[1]["arriba"]),
            int(item[1]["izquierda"]),
        ))
        current_number, current_parts, current_page = None, [], None
        def flush() -> None:
            nonlocal current_number, current_parts, current_page
            if current_number is not None and current_parts:
                text = re.sub(r"\s+", " ", " ".join(current_parts)).strip()
                text = re.sub(r"\u00ac\s+", "", text)
                text = re.sub(r"-\s+(?=[a-z???????])", "", text, flags=re.I)
                verses.append(make_verse(book_code, chapter, current_number, text, volume,
                                          current_page, None, "ABBYY", "requiere_revision", .85))
            current_number, current_parts, current_page = None, [], None
        maximum = expected_max.get((book_code, chapter), 200)
        skipping_notes_page = None
        for page_number, line in lines:
            if skipping_notes_page == page_number:
                continue
            if skipping_notes_page is not None and skipping_notes_page != page_number:
                skipping_notes_page = None
            text = str(line["texto"]).strip()

            marker_text = re.sub(r"^f\s*\*", "", text, flags=re.I)
            match = number_pattern.match(marker_text)
            candidate = int(re.sub(r"\s", "", match.group(1)).replace("o", "0").replace("O", "0")) if match else None
            remainder = match.group(2) if match else ""
            forced = marker_overrides.get((book_code, chapter, page_number, int(line["arriba"])))
            if forced:
                candidate, remainder = int(forced["verse"]), str(forced["remainder"])
            if (not forced and current_number is not None and candidate is not None
                    and candidate > current_number + 1 and (float(line["tamano_max"]) <= 8
                                                            or float(line["tamano_max"]) > 12)):
                candidate, remainder = None, ""
            if current_number is not None and match and candidate is not None and " " in match.group(1) and candidate > current_number + 1:
                shortest = re.match(r"^[^\w]*([1-9])\s+(.+)$", marker_text)
                if shortest and int(shortest.group(1)) == current_number + 1:
                    candidate, remainder = current_number + 1, shortest.group(2)
            if current_number is None and match and match.group(1) == "1 1":
                candidate = 1
            if current_number == 29 and match and candidate == 36:
                candidate = 30
            if current_number is not None and match and candidate is not None and candidate <= current_number:
                structural_prefix = text[:text.find(match.group(2))]
                contextual = None
                if current_number == 11 and candidate == 11:
                    contextual = 12
                elif current_number == 29 and candidate == 36:
                    contextual = 30
                elif current_number == 34 and candidate == 3 and (")" in structural_prefix or "^" in structural_prefix):
                    contextual = 35
                elif current_number == 36 and candidate == 7 and "^" in structural_prefix:
                    contextual = 37
                elif current_number == 64 and candidate == 6 and ")" in structural_prefix:
                    contextual = 65
                elif current_number == 20 and candidate == 2 and "\\" in structural_prefix:
                    contextual = 21
                elif current_number == 24 and candidate == 2 and ")" in structural_prefix:
                    contextual = 25
                if contextual == current_number + 1:
                    candidate = contextual
            if (line.get("probable_note_start") and current_number is not None
                    and candidate is not None and candidate <= current_number):
                skipping_notes_page = page_number
                continue
            if current_number is None and not match:
                first = ornamental_one.match(text)
                candidate, remainder = (1, first.group(1)) if first else (1, text)
            if not match and current_number == 24 and re.match(r"^[^\w]*[).<]+[^\w]*Y\s+", text):
                candidate, remainder = 25, re.sub(r"^[^\w]*[).<]+[^\w]*", "", text)
            if not match and current_number is not None:
                confused = re.match(r"^[^\w]*(IJ|I\s*j|I\s*s|I\s*\^|j|2j|t\s*29|Xo|ro|JO|la|id|'ll|q|y|i6|iij|3\^|i)\s+(.+)$", text, re.I)
                if confused:
                    token = re.sub(r"\s", "", confused.group(1)).lower()
                    mapped = {"i": 11, "j": 5, "ij": 15, "is": 15, "i^": 15, "2j": 25, "t29": 29, "xo": 20, "ro": 10, "jo": 10, "la": 10, "id": 10,
                              "'ll": 11, "q": 3, "y": 7, "i6": 16, "iij": 17, "3^": 35}.get(token)
                    if token == "i" and chapter != 26:
                        mapped = None
                    if mapped == current_number + 1:
                        candidate, remainder = mapped, confused.group(2)
            if candidate is not None and candidate <= maximum and (current_number is None or candidate > current_number):
                flush(); current_number, current_parts, current_page = candidate, [remainder], page_number
            elif current_number is not None:
                current_parts.append(text)
        flush()
    return verses



def txt_fallback_verses(existing: list[dict[str, Any]], volume: int) -> list[dict[str, Any]]:
    """Agrega ?nicamente excepciones TXT revisadas y declaradas en configuraci?n."""
    corrections_path = CONFIG / "chapter-corrections.json"
    if not corrections_path.is_file():
        return []
    volume_config = load_json(corrections_path).get("volumes", {}).get(str(volume), {})
    if not volume_config:
        recovery_path = WORK / "recuperacion" / f"tomo_{volume:02d}" / f"anclas_tomo_{volume:02d}.json"
        if recovery_path.is_file():
            volume_config = load_json(recovery_path)
    occupied = {(row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])) for row in existing}
    rows = []
    for item in volume_config.get("txt_fallbacks", []):
        key = (item["book_code"], int(item["chapter"]), int(item["verse"]))
        if key in occupied or not item.get("reviewed"):
            continue
        text = str(item["text"]).strip()
        row = make_verse(key[0], key[1], key[2], text, volume, None, None, "TXT",
                         "requiere_revision_txt", float(item.get("confidence", .55)))
        row["fuente_archivo"] = item["source_file"]
        row["fuente_lineas"] = item["source_lines"]
        rows.append(row)
        occupied.add(key)
    return rows


def scan_fallback_verses(existing: list[dict[str, Any]], volume: int) -> list[dict[str, Any]]:
    """Agrega excepciones revisadas desde facsímiles públicos con procedencia explícita."""
    corrections_path = CONFIG / "chapter-corrections.json"
    if not corrections_path.is_file():
        return []
    volume_config = load_json(corrections_path).get("volumes", {}).get(str(volume), {})
    if not volume_config:
        recovery_path = WORK / "recuperacion" / f"tomo_{volume:02d}" / f"anclas_tomo_{volume:02d}.json"
        if recovery_path.is_file():
            volume_config = load_json(recovery_path)
    occupied = {(row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])) for row in existing}
    rows = []
    for item in volume_config.get("scan_fallbacks", []):
        key = (item["book_code"], int(item["chapter"]), int(item["verse"]))
        if key in occupied or not item.get("reviewed"):
            continue
        source_type = str(item.get("source_type", "WEB_SCAN"))
        row = make_verse(key[0], key[1], key[2], str(item["text"]).strip(), volume, None,
                         item.get("printed_page"), source_type,
                         "requiere_revision_facsimil", float(item.get("confidence", .75)))
        row["fuente_url"] = item["source_url"]
        row["fuente_imagen"] = item["source_image"]
        rows.append(row)
        occupied.add(key)
    return rows

def reviewed_fallback_verses(existing: list[dict[str, Any]], volume: int) -> list[dict[str, Any]]:
    """Completa claves ausentes con transcripciones revisadas y procedencia explícita."""
    corrections_path = CONFIG / "chapter-corrections.json"
    if not corrections_path.is_file():
        return []
    volume_config = load_json(corrections_path).get("volumes", {}).get(str(volume), {})
    if not volume_config:
        recovery_path = WORK / "recuperacion" / f"tomo_{volume:02d}" / f"anclas_tomo_{volume:02d}.json"
        if recovery_path.is_file():
            volume_config = load_json(recovery_path)
    occupied = {(row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])) for row in existing}
    rows = []
    for item in volume_config.get("reviewed_fallbacks", []):
        key = (item["book_code"], int(item["chapter"]), int(item["verse"]))
        if key in occupied or not item.get("reviewed"):
            continue
        source_type = str(item["source_type"])
        row = make_verse(key[0], key[1], key[2], str(item["text"]).strip(), volume,
                         item.get("page_digital"), item.get("printed_page"), source_type,
                         "requiere_revision_fuente", float(item.get("confidence", .9)))
        row["fuente_archivo"] = item.get("source_file")
        row["fuente_lineas"] = item.get("source_lines")
        row["fuente_evidencia"] = item.get("source_evidence")
        rows.append(row)
        occupied.add(key)
    return rows

def apply_reviewed_replacements(rows: list[dict[str, Any]], volume: int) -> None:
    """Sustituye solo claves existentes con transcripciones revisadas y trazables."""
    corrections_path = CONFIG / "chapter-corrections.json"
    if not corrections_path.is_file():
        return
    volume_config = load_json(corrections_path).get("volumes", {}).get(str(volume), {})
    if not volume_config:
        recovery_path = WORK / "recuperacion" / f"tomo_{volume:02d}" / f"anclas_tomo_{volume:02d}.json"
        if recovery_path.is_file():
            volume_config = load_json(recovery_path)
    by_key = {(row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])): index
              for index, row in enumerate(rows)}
    for item in volume_config.get("reviewed_replacements", []):
        key = (item["book_code"], int(item["chapter"]), int(item["verse"]))
        if key not in by_key or not item.get("reviewed"):
            continue
        original = rows[by_key[key]]
        row = make_verse(key[0], key[1], key[2], str(item["text"]).strip(), volume,
                         item.get("page_digital", original.get("pagina_digital")),
                         item.get("printed_page", original.get("pagina_impresa")),
                         str(item["source_type"]), "revisado_fuente", float(item.get("confidence", 1.0)))
        row["fuente_archivo"] = item.get("source_file")
        row["fuente_lineas"] = item.get("source_lines")
        row["fuente_evidencia"] = item.get("source_evidence")
        rows[by_key[key]] = row

def command_convert(args: argparse.Namespace) -> int:
    pages_path = PAGES / f"tomo_{args.tomo:02d}_paginas.jsonl"
    if not pages_path.is_file():
        raise ScioError(f"Ejecute primero extraer --tomo {args.tomo}")
    volumes = load_json(CONFIG / "volumes.json")
    codes = volumes[str(args.tomo)]["libros"]
    books_list = load_json(CONFIG / "books.json")
    books = {book["codigo"]: book for book in books_list}
    aliases = [(code, words(books[code]["nombre"])) for code in codes]
    reference_path = ROOT / "storage" / "biblia" / "spaplatense" / "procesado" / "versiculos.json"
    with reference_path.open("r", encoding="utf-8-sig") as stream:
        reference_rows = json.load(stream)
    expected_max: dict[tuple[str, int], int] = {}
    for row in reference_rows:
        key = (row["libro_codigo"], int(row["capitulo"]))
        expected_max[key] = max(expected_max.get(key, 0), int(row["versiculo"]))

    active_book = codes[0] if len(codes) == 1 else None
    chapter: int | None = None
    current_number: int | None = None
    current_parts: list[str] = []
    current_page: int | None = None
    verses, notes = [], []

    corrections_path = CONFIG / "chapter-corrections.json"
    correction_volume = None
    if corrections_path.is_file():
        corrections = load_json(corrections_path)
        correction_volume = corrections.get("volumes", {}).get(str(args.tomo))
    if not correction_volume:
        recovery_anchors = WORK / "recuperacion" / f"tomo_{args.tomo:02d}" / f"anclas_tomo_{args.tomo:02d}.json"
        if recovery_anchors.is_file():
            correction_volume = load_json(recovery_anchors)
    if correction_volume:
        for key, maximum in correction_volume.get("metadata", {}).get(
                "versification_overrides", {}).get("expected_max", {}).items():
            code, chapter = key.split(".", 1)
            expected_max[(code, int(chapter))] = int(maximum)
        anchor_sources = correction_volume.get("anchor_sources", [])
        page_rows = []
        if anchor_sources:
            for source_config in anchor_sources:
                source_tomo = int(source_config["source_tomo"])
                source_pages_path = PAGES / f"tomo_{source_tomo:02d}_paginas.jsonl"
                if not source_pages_path.is_file():
                    raise ScioError(f"Ejecute primero extraer --tomo {source_tomo}")
                source_pages = list(iter_jsonl(source_pages_path))
                source_rows = convert_anchored_pages(source_pages, source_config, expected_max, args.tomo)
                for row in source_rows:
                    row["tomo_fuente"] = source_tomo
                verses.extend(source_rows)
                page_rows.extend({**page, "tomo_fuente": source_tomo} for page in source_pages)
        else:
            page_rows = list(iter_jsonl(pages_path))
            verses = convert_anchored_pages(page_rows, correction_volume, expected_max, args.tomo)
        verses.extend(txt_fallback_verses(verses, args.tomo))
        verses.extend(scan_fallback_verses(verses, args.tomo))
        verses.extend(reviewed_fallback_verses(verses, args.tomo))
        apply_reviewed_replacements(verses, args.tomo)
        verses.sort(key=lambda row: (row["capitulo"], row["versiculo"]))
        for page in page_rows:
            for block in page["bloques"]:
                details = block.get("lineas_detalle", [])
                if block["clasificacion"] == "nota_scio" or (details and max(
                    (float(item["tamano_max"]) for item in details), default=0) <= 7.5):
                    notes.append({"tomo": args.tomo,
                                  "tomo_fuente": page.get("tomo_fuente", args.tomo),
                                  "pagina_digital": page["pagina_digital"],
                                  "texto": block["texto"].replace("\n", " ")})
        atomic_jsonl(STRUCTURED / f"tomo_{args.tomo:02d}_versiculos.jsonl", verses)
        atomic_jsonl(NOTES / f"tomo_{args.tomo:02d}_notas.jsonl", notes)
        logging.info("Tomo %02d convertido con anclas: %d candidatos, %d notas",
                     args.tomo, len(verses), len(notes))
        return 0

    def flush() -> None:
        nonlocal current_number, current_parts, current_page
        if active_book and chapter and current_number and current_parts:
            text = " ".join(current_parts)
            text = re.sub(r"\u00ac\s+", "", text)
            text = re.sub(r"-\s+(?=[a-z???????])", "", text, flags=re.I)
            text = re.sub(r"\s+", " ", text).strip()
            verses.append(make_verse(active_book, chapter, current_number, text, args.tomo,
                                      current_page, None, "ABBYY", "requiere_revision", 0.72))
        current_number, current_parts, current_page = None, [], None

    for page in iter_jsonl(pages_path):
        width, height = int(page["ancho"]), int(page["alto"])
        for block in page["bloques"]:
            heading = block["texto"].replace("\n", " ")
            heading_words = set(words(heading))
            for code, alias_words in aliases:
                if alias_words and set(alias_words) <= heading_words and ("libro" in heading_words or "profecia" in heading_words or len(codes) == 1):
                    if active_book != code:
                        flush()
                        active_book, chapter = code, None
            heading_box = block["coordenadas"]
            is_page_heading = (len(heading) <= 120 and int(heading_box["arriba"]) <= height * 0.24)
            detected = parse_chapter(heading) if is_page_heading else None
            if detected and active_book and 1 <= detected <= int(books[active_book]["capitulos"]):
                if chapter is None and detected == 1:
                    flush()
                    chapter = detected
                elif chapter is not None and detected == chapter + 1:
                    flush()
                    chapter = detected
                continue
            if not active_book or not chapter:
                continue
            box = block["coordenadas"]
            details = block.get("lineas_detalle", [])
            for line in details:
                # La edici?n biling?e coloca el espa?ol en la columna derecha; las notas usan cuerpo <= 7.5.
                if int(line["izquierda"]) < width * 0.48 or float(line["tamano_max"]) < 8.0:
                    continue
                if int(line["arriba"]) < height * 0.10 or int(line["abajo"]) > height * 0.93:
                    continue
                text = str(line["texto"]).strip()
                match = re.match(r"^([1-9](?:\s?\d){0,2})[.)??]?\s+(.+)$", text)
                if not match and current_number is None and re.match(r"^[Il]\s+", text):
                    match = re.match(r"^[Il]\s+(.+)$", text)
                    candidate, remainder = 1, match.group(1) if match else ""
                elif match:
                    candidate = int(re.sub(r"\s", "", match.group(1)))
                    remainder = match.group(2)
                else:
                    candidate, remainder = None, ""
                maximum = expected_max.get((active_book, chapter), 200)
                expected = 1 if current_number is None else current_number + 1
                if candidate is not None and candidate == expected and candidate <= maximum:
                    flush()
                    current_number, current_parts, current_page = candidate, [remainder], page["pagina_digital"]
                elif current_number is not None:
                    current_parts.append(text)
            if block["clasificacion"] == "nota_scio" or (details and max((float(x["tamano_max"]) for x in details), default=0) <= 7.5):
                notes.append({"tomo": args.tomo, "pagina_digital": page["pagina_digital"], "texto": heading})
    flush()
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


def validate(books: list[dict[str, Any]], verses: Iterable[dict[str, Any]], *, full_canon: bool = True) -> dict[str, Any]:
    errors, warnings = [], []
    codes = [book["codigo"] for book in books]
    if full_canon and len(books) != 73:
        errors.append(f"Se requieren 73 libros; hay {len(books)}")
    if full_canon and sum(book["testamento"] == "AT" for book in books) != 46:
        errors.append("El canon debe contener 46 libros AT")
    if full_canon and sum(book["testamento"] == "NT" for book in books) != 27:
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
            errors.append(f"Salto/versificación en {code}.{chapter}: esperado {expected}, encontrado {number}")
        previous[(code, chapter)] = number
        text = row.get("texto", "")
        if strange.search(text):
            errors.append(f"Unicode extraño en {code}.{chapter}.{number}")
        if latin_phrase.search(text):
            warnings.append(f"Posible latín mezclado en {code}.{chapter}.{number}")
        trusted_review = (row.get("estado_revision") == "revisado_fuente"
                          or str(row.get("fuente_tipo", "")).endswith("REVIEWED"))
        if note_phrase.search(text) and not trusted_review:
            warnings.append(f"Posible nota mezclada en {code}.{chapter}.{number}")
        if furniture.search(text) and not trusted_review:
            warnings.append(f"Posible encabezado/página en {code}.{chapter}.{number}")
    for book in books:
        code = book["codigo"]
        expected = set(range(1, int(book["capitulos"]) + 1))
        missing = expected - chapters[code]
        if missing:
            errors.append(f"Capítulos vacíos en {code}: {sorted(missing)}")
    nt_codes = {book["codigo"] for book in books if book["testamento"] == "NT"}
    if full_canon and len(nt_codes & source_books) != 27:
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


def command_validate(args: argparse.Namespace) -> int:
    books = load_json(CONFIG / "books.json")
    if args.tomo is not None:
        volume_codes = set(load_json(CONFIG / "volumes.json")[str(args.tomo)]["libros"])
        volume_books = [book for book in books if book["codigo"] in volume_codes]
        path = STRUCTURED / f"tomo_{args.tomo:02d}_versiculos.jsonl"
        if not path.is_file():
            raise ScioError(f"Falta convertir el tomo {args.tomo}")
        rows = list(iter_jsonl(path))
        report = validate(volume_books, rows, full_canon=False)
        reference_path = ROOT / "storage" / "biblia" / "spaplatense" / "procesado" / "versiculos.json"
        with reference_path.open("r", encoding="utf-8-sig") as stream:
            reference_rows = json.load(stream)
        actual_keys = {(row["libro_codigo"], int(row["capitulo"]), int(row["versiculo"])) for row in rows}
        recovery_path = WORK / "recuperacion" / f"tomo_{args.tomo:02d}" / f"anclas_tomo_{args.tomo:02d}.json"
        volume_config = load_json(recovery_path) if recovery_path.is_file() else {}
        versification = volume_config.get("metadata", {}).get("versification_overrides", {})
        allowed_missing = {
            (str(item["book_code"]), int(item["chapter"]), int(item["verse"]))
            for item in versification.get("allowed_missing", []) if item.get("reviewed")
        }
        expected_by_chapter: dict[tuple[str, int], set[int]] = defaultdict(set)
        for row in reference_rows:
            code = row["libro_codigo"]
            if code in volume_codes:
                expected_by_chapter[(code, int(row["capitulo"]))].add(int(row["versiculo"]))
        for (code, chapter), expected_numbers in sorted(expected_by_chapter.items()):
            missing = sorted(number for number in expected_numbers
                             if (code, chapter, number) not in actual_keys
                             and (code, chapter, number) not in allowed_missing)
            if missing:
                report["errors"].append(f"Vers?culos faltantes en {code}.{chapter}: {missing}")
        report["valid"] = not report["errors"]
        report["versification_differences"] = versification.get("differences", [])
        report["scope"] = {"tipo": "tomo", "tomo": args.tomo, "libros": sorted(volume_codes)}
        output = WORK / "validacion" / f"tomo_{args.tomo:02d}_reporte.json"
    else:
        report = validate(books, collect_work_verses())
        report["scope"] = {"tipo": "canon_completo"}
        output = WORK / "reporte-validacion.json"
    atomic_json(output, report)
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
    validation = sub.add_parser("validar")
    validation.add_argument("--tomo", type=int, choices=range(1, 12))
    validation.set_defaults(handler=command_validate)
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
