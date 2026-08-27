#!/usr/bin/env python3
"""Build Jason Liao's bilingual, self-compiled public course record PDF.

The visitor-facing course rows come from ``lib/course-record.json``. GPA scope
figures come from ``lib/academic-record.json`` so the document stays aligned
with the website's reproducible academic-record model. The script writes one
canonical PDF, copies the identical bytes into ``public/documents``, renders
every page for visual QA, and derives metadata-free cover previews.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any, Iterable, Sequence

from PIL import Image
from pypdf import PdfReader
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


PROJECT_ROOT = Path(__file__).resolve().parents[1]
COURSE_RECORD_PATH = PROJECT_ROOT / "lib" / "course-record.json"
ACADEMIC_RECORD_PATH = PROJECT_ROOT / "lib" / "academic-record.json"
OUTPUT_DIR = PROJECT_ROOT / "output" / "pdf"
PUBLIC_DOCUMENT_DIR = PROJECT_ROOT / "public" / "documents"
PREVIEW_DIR = PROJECT_ROOT / "public" / "assets" / "pdf-previews"
TMP_DIR = PROJECT_ROOT / "tmp" / "pdfs"
BASE_NAME = "Jason_Liao_Public_Course_Record_Through_Spring_2026"
OUTPUT_PDF = OUTPUT_DIR / f"{BASE_NAME}.pdf"
PUBLIC_PDF = PUBLIC_DOCUMENT_DIR / f"{BASE_NAME}.pdf"
SITE_BASE = (
    os.environ.get("SITE_URL")
    or os.environ.get("NEXT_PUBLIC_SITE_URL")
    or "https://jason-liao-academic-portfolio.jasonliaock26.chatgpt.site"
).rstrip("/")
COURSE_RECORD_URL = f"{SITE_BASE}/academics/course-record"

PAGE_W, PAGE_H = A4
MARGIN_X = 39

# Dark Academic Evidence System palette.
INK = HexColor("#06080F")
MIDNIGHT = HexColor("#0F1320")
GRAPHITE = HexColor("#1B2232")
GRAPHITE_2 = HexColor("#252D3D")
PAPER = HexColor("#FFFDFC")
WARM_PAPER = HexColor("#F6F0E7")
GOLD = HexColor("#D9B16F")
GOLD_BRIGHT = HexColor("#F2CF8C")
STEEL = HexColor("#7F8CA3")
MUTED_DARK = HexColor("#626A79")
MUTED_LIGHT = HexColor("#AEB6C7")
RULE_DARK = Color(1, 1, 1, alpha=0.11)
RULE_LIGHT = HexColor("#D9D2C7")
SUCCESS = HexColor("#4E8F83")
WITHDRAWN = HexColor("#9A684C")

FONT_SANS = "NotoSansTC"
FONT_SERIF = "NotoSerifTC"
FONT_DISPLAY = "Georgia"
FONT_DISPLAY_BOLD = "GeorgiaBold"
FONT_MONO = "Consolas"
FONT_MONO_BOLD = "ConsolasBold"


def find_font(filename: str) -> Path:
    search_roots = [
        os.environ.get("COURSE_RECORD_FONT_DIR"),
        str(Path(os.environ["WINDIR"]) / "Fonts") if os.environ.get("WINDIR") else None,
        str(Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Windows" / "Fonts")
        if os.environ.get("LOCALAPPDATA")
        else None,
    ]
    for root in search_roots:
        if not root:
            continue
        candidate = Path(root) / filename
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"Required font {filename!r} was not found. Set COURSE_RECORD_FONT_DIR to a folder containing the document fonts."
    )


def register_fonts() -> None:
    fonts = {
        FONT_SANS: find_font("NotoSansTC-VF.ttf"),
        FONT_SERIF: find_font("NotoSerifTC-VF.ttf"),
        FONT_DISPLAY: find_font("georgia.ttf"),
        FONT_DISPLAY_BOLD: find_font("georgiab.ttf"),
        FONT_MONO: find_font("consola.ttf"),
        FONT_MONO_BOLD: find_font("consolab.ttf"),
    }
    for name, path in fonts.items():
        pdfmetrics.registerFont(TTFont(name, str(path)))


DASH_TRANSLATION = str.maketrans(
    {
        "\u2010": "-",
        "\u2011": "-",
        "\u2012": "-",
        "\u2013": "-",
        "\u2014": "-",
        "\u2212": "-",
    }
)


def normalize_text(value: Any) -> Any:
    if isinstance(value, str):
        return value.translate(DASH_TRANSLATION)
    if isinstance(value, list):
        return [normalize_text(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize_text(item) for key, item in value.items()}
    return value


def load_json(path: Path) -> dict[str, Any]:
    return normalize_text(json.loads(path.read_text(encoding="utf-8")))


def validate_source(course_data: dict[str, Any], academic_data: dict[str, Any]) -> None:
    counts = course_data["counts"]
    expected = {
        "totalStatusRecords": 78,
        "enrolledRecords": 76,
        "gradedRecords": 67,
        "gradedCredits": 156,
        "passRecords": 5,
        "passCredits": 7,
        "withdrawnRecords": 4,
        "withdrawnCredits": 12,
        "exemptRecords": 2,
        "earnedCredits": 163,
        "aPlusRecords": 46,
        "aPlusCredits": 110,
    }
    for key, value in expected.items():
        if counts.get(key) != value:
            raise ValueError(f"course-record count mismatch: {key}={counts.get(key)!r}, expected {value}")

    courses = [course for term in course_data["semesters"] for course in term["courses"]]
    if len(courses) != 76 or len(course_data["exemptions"]) != 2:
        raise ValueError("Expected 76 enrolled records plus 2 exemptions")
    if len(course_data["semesters"]) != 8:
        raise ValueError("Expected eight academic semesters")
    if academic_data["mechanicalMajor"]["value430"] != "4.19 / 4.30":
        raise ValueError("Mechanical Engineering Major GPA no longer matches the approved public value")
    if academic_data["aPlus"]["credits"] != counts["aPlusCredits"]:
        raise ValueError("A+ credit count disagrees between academic-record and course-record data")


def is_cjk(text: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", text))


def wrap_text(text: str, font: str, size: float, max_width: float) -> list[str]:
    text = " ".join(str(text).split())
    if not text:
        return []
    if is_cjk(text):
        lines: list[str] = []
        current = ""
        for char in text:
            candidate = current + char
            if current and pdfmetrics.stringWidth(candidate, font, size) > max_width:
                lines.append(current.rstrip())
                current = char.lstrip()
            else:
                current = candidate
        if current:
            lines.append(current.rstrip())
        return lines

    words = text.split(" ")
    lines = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_lines(
    c: canvas.Canvas,
    lines: Sequence[str],
    x: float,
    y: float,
    *,
    font: str,
    size: float,
    color: Color,
    leading: float,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    *,
    font: str,
    size: float,
    color: Color,
    leading: float | None = None,
    max_lines: int | None = None,
) -> float:
    lines = wrap_text(text, font, size, width)
    if max_lines is not None and len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines and pdfmetrics.stringWidth(f"{lines[-1]}...", font, size) > width:
            lines[-1] = lines[-1][:-1]
        if lines:
            lines[-1] = f"{lines[-1]}..."
    return draw_lines(
        c,
        lines,
        x,
        y,
        font=font,
        size=size,
        color=color,
        leading=leading or size * 1.35,
    )


def draw_letterspaced(c: canvas.Canvas, text: str, x: float, y: float, size: float, color: Color) -> None:
    c.setFont(FONT_SANS, size)
    c.setFillColor(color)
    cursor = x
    for char in text.upper():
        c.drawString(cursor, y, char)
        cursor += pdfmetrics.stringWidth(char, FONT_SANS, size) + 1.25


def draw_logo(c: canvas.Canvas, x: float, y: float, size: float) -> None:
    logo = (
        PROJECT_ROOT.parent
        / "01_個人定位設計與公開設定"
        / "01-03_網站視覺風格Logo與參考範例"
        / "FIGURE_01_JasonLiao網站主識別.png"
    )
    if logo.exists():
        c.drawImage(str(logo), x, y, width=size, height=size, preserveAspectRatio=True, mask="auto")
        return
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.circle(x + size / 2, y + size / 2, size / 2, stroke=1, fill=0)
    c.setFillColor(GOLD_BRIGHT)
    c.setFont(FONT_DISPLAY_BOLD, size * 0.32)
    c.drawCentredString(x + size / 2, y + size * 0.39, "JL")


def draw_dark_footer(c: canvas.Canvas, page_no: int, page_total: int) -> None:
    c.setStrokeColor(RULE_DARK)
    c.setLineWidth(0.5)
    c.line(MARGIN_X, 35, PAGE_W - MARGIN_X, 35)
    c.setFont(FONT_MONO, 6.8)
    c.setFillColor(MUTED_LIGHT)
    c.drawString(MARGIN_X, 22, "SELF-COMPILED PUBLIC COURSE RECORD - NOT AN OFFICIAL TRANSCRIPT")
    c.drawRightString(PAGE_W - MARGIN_X, 22, f"{page_no:02d} / {page_total:02d}")


def draw_light_footer(c: canvas.Canvas, page_no: int, page_total: int) -> None:
    c.setStrokeColor(RULE_LIGHT)
    c.setLineWidth(0.5)
    c.line(MARGIN_X, 35, PAGE_W - MARGIN_X, 35)
    c.setFont(FONT_SANS, 6.9)
    c.setFillColor(MUTED_DARK)
    c.drawString(MARGIN_X, 22, "自行彙整公開修課紀錄 · 非國立臺灣大學正式成績單")
    c.setFont(FONT_MONO, 6.6)
    c.drawCentredString(PAGE_W / 2, 22, "JASON LIAO / ACADEMIC PORTFOLIO")
    c.drawRightString(PAGE_W - MARGIN_X, 22, f"{page_no:02d} / {page_total:02d}")


def draw_stat_card(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    value: str,
    title_en: str,
    title_zh: str,
    note: str,
    *,
    primary: bool = False,
) -> None:
    c.setFillColor(Color(1, 1, 1, alpha=0.038 if not primary else 0.065))
    c.setStrokeColor(Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.7 if primary else 0.26))
    c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, 10, fill=1, stroke=1)
    c.setFillColor(GOLD_BRIGHT if primary else PAPER)
    c.setFont(FONT_DISPLAY_BOLD, 20 if len(value) < 15 else 16)
    c.drawString(x + 13, y + h - 28, value)
    c.setFillColor(PAPER)
    c.setFont(FONT_SANS, 8.2)
    c.drawString(x + 13, y + h - 46, title_en)
    c.setFillColor(MUTED_LIGHT)
    c.setFont(FONT_SANS, 7.7)
    c.drawString(x + 13, y + h - 59, title_zh)
    draw_wrapped(c, note, x + 13, y + 13, w - 26, font=FONT_SANS, size=6.7, color=MUTED_LIGHT, leading=8.5, max_lines=2)


def draw_cover(
    c: canvas.Canvas,
    course_data: dict[str, Any],
    academic_data: dict[str, Any],
    page_total: int,
) -> None:
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.045))
    c.circle(PAGE_W - 44, PAGE_H - 78, 210, fill=1, stroke=0)
    c.setStrokeColor(Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.22))
    c.setLineWidth(0.6)
    c.circle(PAGE_W - 65, PAGE_H - 102, 154, fill=0, stroke=1)
    c.circle(PAGE_W - 65, PAGE_H - 102, 122, fill=0, stroke=1)

    draw_letterspaced(c, "ACADEMIC EVIDENCE · 2026", MARGIN_X, PAGE_H - 55, 7.4, GOLD)
    draw_logo(c, PAGE_W - MARGIN_X - 104, PAGE_H - 154, 104)

    c.setFont(FONT_DISPLAY_BOLD, 30)
    c.setFillColor(PAPER)
    c.drawString(MARGIN_X, PAGE_H - 126, "Jason Liao")
    c.setFont(FONT_SANS, 10)
    c.setFillColor(MUTED_LIGHT)
    c.drawString(MARGIN_X, PAGE_H - 146, "Chih-Hsiang Liao · 廖致翔")

    c.setFont(FONT_DISPLAY_BOLD, 44)
    c.setFillColor(PAPER)
    c.drawString(MARGIN_X, PAGE_H - 232, "Public Course Record")
    c.setFont(FONT_SERIF, 25)
    c.setFillColor(GOLD_BRIGHT)
    c.drawString(MARGIN_X, PAGE_H - 266, "公開完整修課紀錄")
    c.setFont(FONT_SANS, 9.6)
    c.setFillColor(MUTED_LIGHT)
    c.drawString(MARGIN_X, PAGE_H - 291, "National Taiwan University · Through Spring 2026")
    c.drawString(MARGIN_X, PAGE_H - 307, "國立臺灣大學 · 截至 2026 年春季")

    intro_en = (
        "Double majors in Mechanical Engineering and Civil Engineering, with a minor in Mathematics. "
        "This document preserves the complete public course-by-course record and connects the headline "
        "numbers to the work behind them."
    )
    intro_zh = (
        "機械工程與土木工程雙主修，數學輔系。本文件完整呈現逐學期修課紀錄，"
        "並把學業主數字連回其能力主幹與相關作品。"
    )
    y = draw_wrapped(c, intro_en, MARGIN_X, PAGE_H - 347, 405, font=FONT_SANS, size=10, color=PAPER, leading=14)
    draw_wrapped(c, intro_zh, MARGIN_X, y - 6, 405, font=FONT_SANS, size=9.2, color=MUTED_LIGHT, leading=13.5)

    card_gap = 10
    card_w = (PAGE_W - 2 * MARGIN_X - card_gap) / 2
    card_h = 91
    row1_y = 296
    row2_y = row1_y - card_h - card_gap
    major = academic_data["mechanicalMajor"]
    counts = course_data["counts"]
    draw_stat_card(
        c,
        MARGIN_X,
        row1_y,
        card_w,
        card_h,
        major["value430"],
        "Mechanical Engineering Major GPA",
        "機械工程 Major GPA",
        f"{major['records']} graded records · {major['credits']} graded credits · self-calculated",
        primary=True,
    )
    draw_stat_card(
        c,
        MARGIN_X + card_w + card_gap,
        row1_y,
        card_w,
        card_h,
        f"{counts['aPlusCredits']} / {counts['gradedCredits']}",
        "Graded credits earned at A+",
        "計分學分獲 A+",
        f"{counts['aPlusRecords']} of {counts['gradedRecords']} graded records · 70.5% of graded credits",
    )
    draw_stat_card(
        c,
        MARGIN_X,
        row2_y,
        card_w,
        card_h,
        "50 credits",
        "Mathematics, mechanics & computation",
        "數學、力學與計算核心",
        "20 graded records · every record at A+ · 4.30 / 4.30",
    )
    draw_stat_card(
        c,
        MARGIN_X + card_w + card_gap,
        row2_y,
        card_w,
        card_h,
        "Academic Excellence Award",
        "National Taiwan University",
        "臺大書卷獎",
        "Academic recognition under a demanding interdisciplinary course load",
        primary=True,
    )

    c.setFillColor(Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.075))
    c.setStrokeColor(Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.34))
    c.roundRect(MARGIN_X, 72, PAGE_W - 2 * MARGIN_X, 78, 10, fill=1, stroke=1)
    draw_letterspaced(c, "READING NOTE / 閱讀說明", MARGIN_X + 14, 131, 6.7, GOLD)
    disclaimer_en = (
        "Self-compiled from course-level results and actual credit weights. This is not an official NTU "
        "transcript. Calculated overall GPA: 4.13 / 4.30 (3.92 / 4.00 course-by-course), across 156 "
        "graded credits. Major-GPA and 4.00-scale figures are reproducible calculations; each institution's "
        "own rules take precedence. English course titles are descriptive translations."
    )
    disclaimer_zh = (
        "本文件依單科成績與實際學分自行彙整，並非臺大正式成績單。整體累計 GPA 為 4.13／4.30"
        "（逐科重算 3.92／4.00），涵蓋 156 個計分學分；Major GPA 與 4.00 制數值均為可重現的"
        "自行計算，實際申請仍以各校規則為準；英文課名為便於閱讀的描述性翻譯。"
    )
    y = draw_wrapped(c, disclaimer_en, MARGIN_X + 14, 116, PAGE_W - 2 * MARGIN_X - 28, font=FONT_SANS, size=6.8, color=MUTED_LIGHT, leading=9)
    draw_wrapped(c, disclaimer_zh, MARGIN_X + 14, y - 1, PAGE_W - 2 * MARGIN_X - 28, font=FONT_SANS, size=6.7, color=MUTED_LIGHT, leading=9)
    draw_dark_footer(c, 1, page_total)


def light_page_header(c: canvas.Canvas, kicker: str, title: str, subtitle: str) -> float:
    c.setFillColor(WARM_PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(MIDNIGHT)
    c.rect(0, PAGE_H - 103, PAGE_W, 103, fill=1, stroke=0)
    draw_letterspaced(c, kicker, MARGIN_X, PAGE_H - 37, 6.8, GOLD)
    c.setFillColor(PAPER)
    c.setFont(FONT_DISPLAY_BOLD, 27)
    c.drawString(MARGIN_X, PAGE_H - 72, title)
    c.setFillColor(MUTED_LIGHT)
    c.setFont(FONT_SANS, 8.3)
    c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 69, subtitle)
    return PAGE_H - 128


def overview_card(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    value: str,
    en: str,
    zh: str,
    detail: str,
    *,
    primary: bool = False,
) -> None:
    c.setFillColor(PAPER)
    c.setStrokeColor(GOLD if primary else RULE_LIGHT)
    c.setLineWidth(0.85 if primary else 0.55)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)
    c.setFillColor(HexColor("#5E4217") if primary else GRAPHITE)
    c.setFont(FONT_DISPLAY_BOLD, 15 if len(value) < 16 else 12.5)
    c.drawString(x + 11, y + h - 20, value)
    c.setFont(FONT_SANS, 7.4)
    c.setFillColor(GRAPHITE)
    c.drawString(x + 11, y + h - 36, en)
    c.setFillColor(MUTED_DARK)
    c.drawString(x + 11, y + h - 48, zh)
    draw_wrapped(c, detail, x + 11, y + 11, w - 22, font=FONT_SANS, size=6.3, color=MUTED_DARK, leading=8, max_lines=2)


def draw_overview(
    c: canvas.Canvas,
    course_data: dict[str, Any],
    academic_data: dict[str, Any],
    page_no: int,
    page_total: int,
) -> None:
    y = light_page_header(c, "ACADEMIC DEPTH / 學術深度", "The record, in context.", "完整數字、能力主幹與閱讀口徑")

    card_gap = 8
    card_w = (PAGE_W - 2 * MARGIN_X - 3 * card_gap) / 4
    card_y = y - 82
    cards = [
        (
            academic_data["mechanicalMajor"]["value430"],
            "Mechanical Engineering Major GPA",
            "機械工程 Major GPA",
            f"{academic_data['mechanicalMajor']['records']} records · {academic_data['mechanicalMajor']['credits']} credits",
            True,
        ),
        (
            academic_data["mechanicalRequired"]["value430"],
            "Required ME coursework GPA",
            "機械系定必修 GPA",
            f"{academic_data['mechanicalRequired']['records']} records · {academic_data['mechanicalRequired']['credits']} credits",
            False,
        ),
        (
            f"{course_data['counts']['aPlusCredits']} / {course_data['counts']['gradedCredits']}",
            "A+ graded credits",
            "A+ 計分學分",
            f"{course_data['counts']['aPlusRecords']} of {course_data['counts']['gradedRecords']} graded records",
            False,
        ),
        (
            f"{course_data['counts']['earnedCredits']} credits",
            "Credits earned",
            "實得學分",
            f"Eight semesters · {course_data['counts']['gradedCredits']} graded credits",
            False,
        ),
    ]
    for index, (value, en, zh, detail, primary) in enumerate(cards):
        overview_card(c, MARGIN_X + index * (card_w + card_gap), card_y, card_w, 72, value, en, zh, detail, primary=primary)

    award_y = card_y - 64
    c.setFillColor(GRAPHITE)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.75)
    c.roundRect(MARGIN_X, award_y, PAGE_W - 2 * MARGIN_X, 51, 8, fill=1, stroke=1)
    draw_letterspaced(c, "ACADEMIC RECOGNITION", MARGIN_X + 14, award_y + 31, 6.4, GOLD)
    c.setFillColor(PAPER)
    c.setFont(FONT_DISPLAY_BOLD, 15)
    c.drawString(MARGIN_X + 14, award_y + 13, "NTU Academic Excellence Award")
    c.setFont(FONT_SERIF, 11)
    c.setFillColor(GOLD_BRIGHT)
    c.drawRightString(PAGE_W - MARGIN_X - 14, award_y + 15, "臺大書卷獎")

    section_y = award_y - 28
    draw_letterspaced(c, "CAPABILITY FOUNDATIONS / 能力主幹", MARGIN_X, section_y, 6.5, HexColor("#72511E"))
    c.setFillColor(GRAPHITE)
    c.setFont(FONT_DISPLAY_BOLD, 18)
    c.drawString(MARGIN_X, section_y - 23, "Performance across connected technical domains")

    highlights = course_data["capabilityHighlights"]
    grid_top = section_y - 41
    grid_gap_x = 9
    grid_gap_y = 8
    grid_w = (PAGE_W - 2 * MARGIN_X - grid_gap_x) / 2
    grid_h = 66
    for index, item in enumerate(highlights):
        col = index % 2
        row = index // 2
        x = MARGIN_X + col * (grid_w + grid_gap_x)
        y0 = grid_top - (row + 1) * grid_h - row * grid_gap_y
        c.setFillColor(PAPER)
        c.setStrokeColor(RULE_LIGHT)
        c.setLineWidth(0.55)
        c.roundRect(x, y0, grid_w, grid_h, 7, fill=1, stroke=1)
        c.setFillColor(HexColor("#72511E"))
        c.setFont(FONT_MONO_BOLD, 8.2)
        c.drawString(x + 11, y0 + grid_h - 18, item["value"])
        c.setFillColor(GRAPHITE)
        c.setFont(FONT_SANS, 7.8)
        c.drawString(x + 11, y0 + grid_h - 34, item["title"]["en"])
        c.setFillColor(MUTED_DARK)
        c.setFont(FONT_SANS, 7.4)
        c.drawString(x + 11, y0 + grid_h - 47, item["title"]["zh"])
        c.setFont(FONT_MONO, 6.2)
        c.setFillColor(STEEL)
        c.drawRightString(x + grid_w - 11, y0 + grid_h - 18, f"{item['records']} RECORDS · {item['credits']} CREDITS")
        draw_wrapped(c, item["detail"]["en"], x + 11, y0 + 10, grid_w - 22, font=FONT_SANS, size=5.9, color=MUTED_DARK, leading=7.3, max_lines=1)

    note_y = grid_top - 3 * grid_h - 2 * grid_gap_y - 70
    note_w = (PAGE_W - 2 * MARGIN_X - 9) / 2
    for idx in range(2):
        x = MARGIN_X + idx * (note_w + 9)
        c.setFillColor(HexColor("#EEE7DC"))
        c.setStrokeColor(RULE_LIGHT)
        c.roundRect(x, note_y, note_w, 58, 7, fill=1, stroke=1)
    draw_letterspaced(c, "SCOPE", MARGIN_X + 11, note_y + 41, 6.1, HexColor("#72511E"))
    draw_wrapped(
        c,
        "78 status records: 67 letter-graded, 5 pass/fail, 4 withdrawn, and 2 exempt. Withdrawals do not count toward earned credits or GPA.",
        MARGIN_X + 11,
        note_y + 27,
        note_w - 22,
        font=FONT_SANS,
        size=6.4,
        color=GRAPHITE,
        leading=8,
        max_lines=3,
    )
    x2 = MARGIN_X + note_w + 9
    draw_letterspaced(c, "說明", x2 + 11, note_y + 41, 6.1, HexColor("#72511E"))
    draw_wrapped(
        c,
        "共 78 筆狀態紀錄：67 筆字母計分、5 筆通過制、4 筆停修與 2 筆免修。停修不計入實得學分與 GPA。",
        x2 + 11,
        note_y + 27,
        note_w - 22,
        font=FONT_SANS,
        size=6.4,
        color=GRAPHITE,
        leading=8,
        max_lines=3,
    )

    exemption_y = note_y - 34
    c.setFont(FONT_SANS, 6.8)
    c.setFillColor(MUTED_DARK)
    exemptions = " · ".join(
        f"{item['code']} {item['title']['en']} / {item['title']['zh']} ({item['result']['en']})"
        for item in course_data["exemptions"]
    )
    draw_wrapped(c, f"Exemptions / 免修：{exemptions}", MARGIN_X, exemption_y, PAGE_W - 2 * MARGIN_X, font=FONT_SANS, size=6.4, color=MUTED_DARK, leading=8, max_lines=2)

    c.linkURL(COURSE_RECORD_URL, (MARGIN_X, 42, PAGE_W - MARGIN_X, 61), relative=0)
    c.setFont(FONT_MONO, 6.5)
    c.setFillColor(HexColor("#72511E"))
    c.drawString(MARGIN_X, 49, COURSE_RECORD_URL)
    draw_light_footer(c, page_no, page_total)


DOMAIN_SHORT = {
    "mathematics": ("Mathematics", "數學"),
    "mechanics": ("Mechanics", "力學"),
    "computation": ("Computation / control", "計算／控制"),
    "thermal": ("Thermal-fluids", "熱流"),
    "design": ("Design / laboratory", "設計／實驗"),
    "civil": ("Civil engineering", "土木"),
    "science": ("Physical sciences", "理化"),
    "research": ("Research", "研究"),
    "humanities": ("Humanities", "人文"),
    "team": ("Team / PE", "團隊／體育"),
    "service": ("Service", "服務"),
}


def course_row_height(course: dict[str, Any], course_width: float, domain_width: float) -> float:
    title_width = course_width - 18
    en_lines = wrap_text(course["title"]["en"], FONT_SANS, 8.2, title_width)
    zh_lines = wrap_text(course["title"]["zh"], FONT_SANS, 7.7, title_width)
    note_lines = wrap_text(course.get("note", {}).get("en", ""), FONT_SANS, 6.2, title_width)
    domain_en, domain_zh = DOMAIN_SHORT[course["domain"]]
    domain_lines = len(wrap_text(domain_en, FONT_SANS, 6.4, domain_width - 14)) + len(
        wrap_text(domain_zh, FONT_SANS, 6.2, domain_width - 14)
    )
    title_h = 15 + len(en_lines) * 10 + len(zh_lines) * 9 + min(len(note_lines), 2) * 7.5
    domain_h = 12 + domain_lines * 8
    return max(40, title_h + (8 if note_lines else 0), domain_h + 2)


def paginate_semesters(course_data: dict[str, Any]) -> list[dict[str, Any]]:
    course_width = 305
    domain_width = PAGE_W - 2 * MARGIN_X - course_width - 45 - 58
    row_budget = 525
    pages: list[dict[str, Any]] = []
    for semester in reversed(course_data["semesters"]):
        chunks: list[list[dict[str, Any]]] = []
        current: list[dict[str, Any]] = []
        used = 0.0
        for course in semester["courses"]:
            height = course_row_height(course, course_width, domain_width)
            if current and used + height > row_budget:
                chunks.append(current)
                current = []
                used = 0.0
            current.append(course)
            used += height
        if current:
            chunks.append(current)
        for index, courses in enumerate(chunks):
            pages.append({"semester": semester, "courses": courses, "chunkIndex": index, "chunkCount": len(chunks)})
    return pages


def draw_course_row(
    c: canvas.Canvas,
    course: dict[str, Any],
    x: float,
    y_top: float,
    widths: tuple[float, float, float, float],
    height: float,
    *,
    shaded: bool,
) -> None:
    course_w, credit_w, result_w, domain_w = widths
    if shaded:
        c.setFillColor(HexColor("#F1EAE0"))
        c.rect(x, y_top - height, sum(widths), height, fill=1, stroke=0)
    c.setStrokeColor(RULE_LIGHT)
    c.setLineWidth(0.45)
    c.line(x, y_top - height, x + sum(widths), y_top - height)

    left = x + 8
    c.setFont(FONT_MONO_BOLD, 6.7)
    c.setFillColor(HexColor("#72511E"))
    c.drawString(left, y_top - 11, course["code"])
    route = course.get("relatedRoute")
    if route:
        label = "WORK / 作品"
        label_x = left + pdfmetrics.stringWidth(course["code"], FONT_MONO_BOLD, 6.7) + 8
        label_w = pdfmetrics.stringWidth(label, FONT_MONO_BOLD, 5.2) + 8
        c.setFillColor(HexColor("#E8D0A5"))
        c.roundRect(label_x, y_top - 16, label_w, 10, 3, fill=1, stroke=0)
        c.setFillColor(HexColor("#5A3F14"))
        c.setFont(FONT_MONO_BOLD, 5.2)
        c.drawString(label_x + 4, y_top - 13.2, label)
        c.linkURL(f"{SITE_BASE}{route}", (label_x, y_top - 16, label_x + label_w, y_top - 6), relative=0)

    text_y = y_top - 25
    en_lines = wrap_text(course["title"]["en"], FONT_SANS, 8.2, course_w - 18)
    text_y = draw_lines(c, en_lines, left, text_y, font=FONT_SANS, size=8.2, color=GRAPHITE, leading=10)
    zh_lines = wrap_text(course["title"]["zh"], FONT_SANS, 7.7, course_w - 18)
    text_y = draw_lines(c, zh_lines, left, text_y - 1, font=FONT_SANS, size=7.7, color=MUTED_DARK, leading=9)
    note = course.get("note")
    if note:
        note_text = f"{note['en']} / {note['zh']}"
        draw_wrapped(c, note_text, left, text_y - 1, course_w - 18, font=FONT_SANS, size=5.9, color=WITHDRAWN if course["status"] == "withdrawn" else STEEL, leading=7.3, max_lines=2)

    credit_x = x + course_w
    result_x = credit_x + credit_w
    domain_x = result_x + result_w
    center_y = y_top - height / 2 - 2
    c.setFillColor(GRAPHITE)
    c.setFont(FONT_MONO_BOLD, 8.2)
    c.drawCentredString(credit_x + credit_w / 2, center_y, str(course["credits"]))

    result_color = WITHDRAWN if course["status"] == "withdrawn" else SUCCESS if course["status"] == "pass" else HexColor("#5E4217")
    c.setFillColor(result_color)
    result = course["result"]["en"]
    c.setFont(FONT_MONO_BOLD, 8.2 if len(result) <= 3 else 6.2)
    c.drawCentredString(result_x + result_w / 2, center_y + 2, result)
    if course["result"]["zh"] != course["result"]["en"]:
        c.setFont(FONT_SANS, 6.2)
        c.drawCentredString(result_x + result_w / 2, center_y - 8, course["result"]["zh"])

    domain_en, domain_zh = DOMAIN_SHORT[course["domain"]]
    domain_y = y_top - 18
    domain_y = draw_wrapped(c, domain_en, domain_x + 7, domain_y, domain_w - 14, font=FONT_SANS, size=6.4, color=GRAPHITE, leading=8, max_lines=2)
    draw_wrapped(c, domain_zh, domain_x + 7, domain_y - 1, domain_w - 14, font=FONT_SANS, size=6.2, color=MUTED_DARK, leading=8, max_lines=2)


def draw_semester_page(
    c: canvas.Canvas,
    page: dict[str, Any],
    page_no: int,
    page_total: int,
) -> None:
    semester = page["semester"]
    continuation = page["chunkCount"] > 1
    kicker = f"TERM {semester['id']} / 學期 {semester['id']}"
    title = semester["en"] + (" · continued" if continuation and page["chunkIndex"] else "")
    subtitle = semester["zh"] + (" · 續" if continuation and page["chunkIndex"] else "")
    y = light_page_header(c, kicker, title, subtitle)

    stat_gap = 8
    stat_w = (PAGE_W - 2 * MARGIN_X - 2 * stat_gap) / 3
    stats = [
        (str(semester["earnedCredits"]), "Earned credits", "實得學分"),
        (str(semester["gradedCredits"]), "Graded credits", "計分學分"),
        (str(len(semester["courses"])), "Course records", "修課紀錄"),
    ]
    for idx, (value, en, zh) in enumerate(stats):
        x = MARGIN_X + idx * (stat_w + stat_gap)
        c.setFillColor(PAPER)
        c.setStrokeColor(RULE_LIGHT)
        c.setLineWidth(0.5)
        c.roundRect(x, y - 52, stat_w, 44, 7, fill=1, stroke=1)
        c.setFillColor(GRAPHITE)
        c.setFont(FONT_DISPLAY_BOLD, 14 if len(value) < 12 else 11.5)
        c.drawString(x + 10, y - 27, value)
        c.setFillColor(MUTED_DARK)
        c.setFont(FONT_SANS, 6.2)
        c.drawRightString(x + stat_w - 10, y - 21, en)
        c.drawRightString(x + stat_w - 10, y - 32, zh)

    table_top = y - 72
    total_w = PAGE_W - 2 * MARGIN_X
    course_w = 305
    credit_w = 45
    result_w = 58
    domain_w = total_w - course_w - credit_w - result_w
    widths = (course_w, credit_w, result_w, domain_w)
    header_h = 27
    c.setFillColor(GRAPHITE)
    c.roundRect(MARGIN_X, table_top - header_h, total_w, header_h, 6, fill=1, stroke=0)
    headers = [
        ("COURSE / 課程", MARGIN_X + 8, "left"),
        ("CR / 學分", MARGIN_X + course_w + credit_w / 2, "center"),
        ("RESULT / 成績", MARGIN_X + course_w + credit_w + result_w / 2, "center"),
        ("DOMAIN / 領域", MARGIN_X + course_w + credit_w + result_w + 7, "left"),
    ]
    c.setFillColor(GOLD_BRIGHT)
    c.setFont(FONT_SANS, 6.2)
    for label, x, align in headers:
        if align == "center":
            c.drawCentredString(x, table_top - 17, label)
        else:
            c.drawString(x, table_top - 17, label)

    y_top = table_top - header_h
    for idx, course in enumerate(page["courses"]):
        height = course_row_height(course, course_w, domain_w)
        draw_course_row(c, course, MARGIN_X, y_top, widths, height, shaded=idx % 2 == 1)
        y_top -= height

    note_y = max(49, y_top - 20)
    c.setFont(FONT_SANS, 6.1)
    c.setFillColor(MUTED_DARK)
    note = (
        "Status / 狀態：Pass and withdrawn records are shown; withdrawals are excluded from earned credits and GPA. "
        "Later completions are noted. WORK / 作品 opens related portfolio evidence."
    )
    draw_wrapped(c, note, MARGIN_X, note_y, PAGE_W - 2 * MARGIN_X, font=FONT_SANS, size=6.1, color=MUTED_DARK, leading=8, max_lines=2)
    draw_light_footer(c, page_no, page_total)


def build_pdf(course_data: dict[str, Any], academic_data: dict[str, Any]) -> int:
    term_pages = paginate_semesters(course_data)
    page_total = 2 + len(term_pages)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DOCUMENT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(OUTPUT_PDF), pagesize=A4, pageCompression=1, invariant=1)
    c.setTitle("Jason Liao | Public Course Record Through Spring 2026")
    c.setAuthor("Chih-Hsiang Liao (Jason Liao)")
    c.setSubject("Self-compiled bilingual public course record; not an official NTU transcript")
    c.setKeywords("Jason Liao, Chih-Hsiang Liao, NTU, course record, Mechanical Engineering, academic portfolio")
    c.setCreator("Jason Liao Academic Portfolio")

    draw_cover(c, course_data, academic_data, page_total)
    c.showPage()
    draw_overview(c, course_data, academic_data, 2, page_total)
    c.showPage()
    for offset, term_page in enumerate(term_pages, start=3):
        draw_semester_page(c, term_page, offset, page_total)
        c.showPage()
    c.save()
    shutil.copyfile(OUTPUT_PDF, PUBLIC_PDF)
    return page_total


def find_pdftoppm() -> str:
    candidates = [shutil.which("pdftoppm")]
    if os.environ.get("LOCALAPPDATA"):
        candidates.append(
            str(Path(os.environ["LOCALAPPDATA"]) / "Programs" / "MiKTeX" / "miktex" / "bin" / "x64" / "pdftoppm.exe")
        )
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    raise FileNotFoundError("pdftoppm is required to render PDF QA pages")


def render_pages(pdf_path: Path) -> list[Path]:
    for path in TMP_DIR.glob(f"{BASE_NAME}-page-*.png"):
        path.unlink()
    raw_prefix = TMP_DIR / f"{BASE_NAME}-raw"
    for path in TMP_DIR.glob(f"{BASE_NAME}-raw-*.png"):
        path.unlink()
    subprocess.run(
        [find_pdftoppm(), "-r", "150", "-png", str(pdf_path), str(raw_prefix)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    raw_pages = sorted(
        TMP_DIR.glob(f"{BASE_NAME}-raw-*.png"),
        key=lambda path: int(re.search(r"-(\d+)\.png$", path.name).group(1)),
    )
    pages: list[Path] = []
    for index, raw in enumerate(raw_pages, start=1):
        target = TMP_DIR / f"{BASE_NAME}-page-{index:02d}.png"
        raw.replace(target)
        pages.append(target)
    if not pages:
        raise RuntimeError("pdftoppm produced no page renders")
    return pages


def build_previews(cover_png: Path) -> None:
    with Image.open(cover_png) as source:
        rgb = source.convert("RGB")
        target_width = 1200
        target_height = round(rgb.height * target_width / rgb.width)
        resized = rgb.resize((target_width, target_height), Image.Resampling.LANCZOS)
        # New pixel-only images intentionally carry no EXIF, ICC, or source metadata.
        clean = Image.new("RGB", resized.size)
        clean.paste(resized)
        clean.save(PREVIEW_DIR / f"{BASE_NAME}.jpg", format="JPEG", quality=88, optimize=True, progressive=True)
        clean.save(PREVIEW_DIR / f"{BASE_NAME}.webp", format="WEBP", quality=82, method=6)
        clean.save(PREVIEW_DIR / f"{BASE_NAME}.avif", format="AVIF", quality=68, speed=6)


def verify_output(page_total: int, course_data: dict[str, Any], rendered_pages: Sequence[Path]) -> None:
    reader = PdfReader(str(OUTPUT_PDF))
    if len(reader.pages) != page_total:
        raise ValueError(f"PDF page count mismatch: {len(reader.pages)} != {page_total}")
    if len(rendered_pages) != page_total:
        raise ValueError(f"Rendered page count mismatch: {len(rendered_pages)} != {page_total}")
    if OUTPUT_PDF.read_bytes() != PUBLIC_PDF.read_bytes():
        raise ValueError("Output PDF and public document copy are not byte-identical")
    full_text = "\n".join((page.extract_text() or "") for page in reader.pages)
    required = [
        "Public Course Record",
        "公開完整修課紀錄",
        "Mechanical Engineering Major GPA",
        "NTU Academic Excellence Award",
        "臺大書卷獎",
        "not an official NTU transcript",
        "非國立臺灣大學正式成績單",
    ]
    for phrase in required:
        if phrase not in full_text:
            raise ValueError(f"Expected PDF text is missing: {phrase}")
    for semester in course_data["semesters"]:
        for course in semester["courses"]:
            if course["code"] not in full_text:
                raise ValueError(f"Course code missing from PDF: {course['code']}")
    forbidden = [str(PROJECT_ROOT), "canonical_source", "TRUSTED_ACCESS_PASSWORD"]
    for phrase in forbidden:
        if phrase and phrase in full_text:
            raise ValueError(f"Forbidden internal text leaked into PDF: {phrase}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def main() -> None:
    register_fonts()
    course_data = load_json(COURSE_RECORD_PATH)
    academic_data = load_json(ACADEMIC_RECORD_PATH)
    validate_source(course_data, academic_data)
    page_total = build_pdf(course_data, academic_data)
    rendered_pages = render_pages(OUTPUT_PDF)
    build_previews(rendered_pages[0])
    verify_output(page_total, course_data, rendered_pages)
    print(json.dumps({
        "pdf": str(OUTPUT_PDF),
        "publicPdf": str(PUBLIC_PDF),
        "pages": page_total,
        "bytes": OUTPUT_PDF.stat().st_size,
        "sha256": sha256(OUTPUT_PDF),
        "renders": [str(path) for path in rendered_pages],
        "previews": [str(PREVIEW_DIR / f"{BASE_NAME}{suffix}") for suffix in (".avif", ".webp", ".jpg")],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
