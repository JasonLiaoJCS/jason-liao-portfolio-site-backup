from __future__ import annotations

import re
import sys
from pathlib import Path

import pymupdf


PATH_PATTERN = re.compile(r"/home/[^\s<>\]\[\)\(\}\{,;]+")


def redact_deployment_paths(source: Path, destination: Path) -> int:
    document = pymupdf.open(source)
    redactions: list[tuple[int, pymupdf.Rect]] = []

    for page_index, page in enumerate(document):
        matches = sorted(set(PATH_PATTERN.findall(page.get_text())))
        for value in matches:
            for rect in page.search_for(value):
                padded = pymupdf.Rect(rect.x0 - 1.5, rect.y0 - 1, rect.x1 + 1.5, rect.y1 + 1)
                page.add_redact_annot(padded, fill=(0.10, 0.12, 0.17))
                redactions.append((page_index, padded))

    if not redactions:
        raise RuntimeError("No deployment paths were found; refusing to emit an unchanged file.")

    for page in document:
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)

    for page_index, rect in redactions:
        page = document[page_index]
        page.insert_textbox(
            rect,
            "deployment path removed",
            fontname="helv",
            fontsize=max(5.0, min(7.0, rect.height * 0.52)),
            color=(0.96, 0.95, 0.91),
            align=pymupdf.TEXT_ALIGN_CENTER,
            overlay=True,
        )

    destination.parent.mkdir(parents=True, exist_ok=True)
    document.set_metadata({**document.metadata, "subject": "RedRHex undergraduate research report"})
    document.save(destination, garbage=4, deflate=True, clean=True)
    document.close()
    return len(redactions)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: redact_public_pdf.py SOURCE.pdf DESTINATION.pdf")
    count = redact_deployment_paths(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"Redacted {count} local deployment-path occurrences.")
