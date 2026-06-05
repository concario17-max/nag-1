from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_DATA_DIR = ROOT / "src" / "data"

NS = {
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def text_of(node: ET.Element) -> str:
    return normalize_text("".join(node.itertext()))


def is_online_marker(text: str) -> bool:
    return text.startswith("[") and "Mode" in text and "Online" in text or text.startswith("[") and "Offline" in text


def is_verse_heading(text: str) -> bool:
    return bool(re.match(r"^\d+\.\s+\S", text))


def strip_verse_number(text: str) -> str:
    return re.sub(r"^\d+\.\s*", "", text).strip()


def is_title(text: str) -> bool:
    if not text or is_online_marker(text) or is_verse_heading(text):
        return False

    if text == "Plaintext":
        return True

    if text.startswith("["):
        return True

    if re.match(r"^\d+\.\s*", text):
        return True

    return len(text) <= 80 and not re.search(r"[.!?]", text)


def parse_table(node: ET.Element) -> dict:
    rows = []
    for row in node.findall("./table:table-row", NS):
        cells = []
        for cell in row.findall("./table:table-cell", NS):
            cells.append(text_of(cell))
        if any(cells):
            rows.append(cells)

    if not rows:
        return {"headers": [], "rows": []}

    return {"headers": rows[0], "rows": rows[1:]}


def parse_list(node: ET.Element) -> list[str]:
    bullets: list[str] = []
    for list_item in node.findall("./text:list-item", NS):
        chunks = []
        for paragraph in list_item.findall(".//text:p", NS):
            paragraph_text = text_of(paragraph)
            if paragraph_text:
                chunks.append(paragraph_text)
        text = normalize_text(" ".join(chunks))
        if text:
            bullets.append(text)
    return bullets


def parse_odt(odt_path: Path, chapter_index: int) -> OrderedDict[str, list[dict]]:
    with zipfile.ZipFile(odt_path) as archive:
        root = ET.fromstring(archive.read("content.xml"))
        text_root = root.find(".//office:body//office:text", NS)
        if text_root is None:
            raise RuntimeError(f"Missing office:text in {odt_path.name}")

        verses: OrderedDict[str, list[dict]] = OrderedDict()
        current_blocks: list[dict] | None = None
        current_block: dict | None = None
        local_verse_index = 0

        for node in list(text_root):
            tag = node.tag.split("}")[-1]
            text = text_of(node)

            if not text or is_online_marker(text):
                continue

            if is_verse_heading(text):
                local_verse_index += 1
                verse_key = f"{chapter_index}.{local_verse_index}" if chapter_index in {1, 4} else str(local_verse_index)
                verse_title = strip_verse_number(text)

                current_blocks = [{"title": verse_title}]
                current_block = current_blocks[0]
                verses[verse_key] = current_blocks
                continue

            if current_blocks is None:
                continue

            if tag == "table":
                if current_block is None:
                    current_block = {"title": ""}
                    current_blocks.append(current_block)
                current_block["table"] = parse_table(node)
                continue

            if tag == "list":
                if current_block is None:
                    current_block = {"title": ""}
                    current_blocks.append(current_block)
                bullets = parse_list(node)
                if bullets:
                    current_block.setdefault("bullets", []).extend(bullets)
                continue

            if tag == "p":
                if is_title(text):
                    current_block = {"title": text}
                    current_blocks.append(current_block)
                else:
                    if current_block is None:
                        current_block = {"title": text}
                        current_blocks.append(current_block)
                    else:
                        current_block.setdefault("paragraphs", []).append(text)

        return verses


def render_ts(export_name: str, data: OrderedDict[str, list[dict]], include_types: bool) -> str:
    lines: list[str] = []

    if include_types:
        lines.extend(
            [
                "export type CommentaryTable = {",
                "  headers: string[];",
                "  rows: string[][];",
                "};",
                "",
                "export type CommentaryBlock = {",
                "  title: string;",
                "  paragraphs?: string[];",
                "  bullets?: string[];",
                "  table?: CommentaryTable;",
                "};",
                "",
            ]
        )
    else:
        lines.extend(
            [
                "import type { CommentaryBlock } from './chapter1Commentary';",
                "",
            ]
        )

    lines.append(f"export const {export_name} = {{")
    for verse_key, blocks in data.items():
        lines.append(f"  {json.dumps(verse_key, ensure_ascii=False)}: [")
        for block in blocks:
            lines.append("    {")
            lines.append(f"      \"title\": {json.dumps(block['title'], ensure_ascii=False)},")
            if block.get("paragraphs"):
                lines.append("      \"paragraphs\": [")
                for paragraph in block["paragraphs"]:
                    lines.append(f"        {json.dumps(paragraph, ensure_ascii=False)},")
                lines.append("      ],")
            if block.get("bullets"):
                lines.append("      \"bullets\": [")
                for bullet in block["bullets"]:
                    lines.append(f"        {json.dumps(bullet, ensure_ascii=False)},")
                lines.append("      ],")
            if block.get("table"):
                table = block["table"]
                lines.append("      \"table\": {")
                lines.append("        \"headers\": [")
                for header in table["headers"]:
                    lines.append(f"          {json.dumps(header, ensure_ascii=False)},")
                lines.append("        ],")
                lines.append("        \"rows\": [")
                for row in table["rows"]:
                    lines.append("          [")
                    for cell in row:
                        lines.append(f"            {json.dumps(cell, ensure_ascii=False)},")
                    lines.append("          ],")
                lines.append("        ]")
                lines.append("      },")
            lines.append("    },")
        lines.append("  ],")
    lines.append("} satisfies Record<string, CommentaryBlock[]>;")
    lines.append("")
    type_name = export_name[:1].upper() + export_name[1:] + "VerseKey"
    lines.append(f"export type {type_name} = keyof typeof {export_name};")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    chapter_files = [
        (1, ROOT / "1.odt", SRC_DATA_DIR / "chapter1Commentary.ts", True, "chapter1Commentary"),
        (2, ROOT / "2.odt", SRC_DATA_DIR / "chapter2Commentary.ts", False, "chapter2Commentary"),
        (3, ROOT / "3.odt", SRC_DATA_DIR / "chapter3Commentary.ts", False, "chapter3Commentary"),
        (4, ROOT / "4.odt", SRC_DATA_DIR / "chapter4Commentary.ts", False, "chapter4Commentary"),
    ]

    summary = []
    for chapter_index, odt_path, out_path, include_types, export_name in chapter_files:
        data = parse_odt(odt_path, chapter_index)
        out_path.write_text(render_ts(export_name, data, include_types), encoding="utf-8")
        summary.append(f"chapter {chapter_index}: {len(data)} verses -> {out_path.relative_to(ROOT)}")

    print("\n".join(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
