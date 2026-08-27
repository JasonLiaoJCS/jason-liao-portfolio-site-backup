from __future__ import annotations

import hashlib
import json
import re
import shutil
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

import pymupdf as fitz
from PIL import Image, ImageOps
from pillow_heif import open_heif
from pypdf import PdfReader, PdfWriter


SITE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = SITE_ROOT.parent
SOURCE_MANIFEST = (
    SOURCE_ROOT
    / "00_先看這裡_網站資料說明"
    / "manifests"
    / "asset-manifest.v1.json"
)
PUBLIC_ROOT = SITE_ROOT / "public"
PUBLIC_ASSETS = PUBLIC_ROOT / "assets"
PUBLIC_IMAGES = PUBLIC_ASSETS / "images"
PUBLIC_PREVIEWS = PUBLIC_ASSETS / "pdf-previews"
PUBLIC_DOCUMENTS = PUBLIC_ROOT / "documents"
INTERNAL_MANIFEST = SITE_ROOT / "lib" / "media-manifest.json"

# Source assets that expose internal accounts, paths, or infrastructure.
EXCLUDED_IMAGE_SOURCE_PREFIXES = {
    "d52bd49ad23b", "ec2c26f09677", "335c7400004f", "75755cc8c872",
}

# Keep established public URLs stable when a source file is renamed for clearer
# local asset governance. The hash remains the identity; only the editorial
# source filename changed.
PUBLIC_IMAGE_NUMBER_OVERRIDES = {
    "503638161dab": "01",
    "f7bf2cf167a8": "01",
    "f60fc00428f9": "02",
}

# Full-text public derivatives whose source artifact contains a small amount of
# non-public infrastructure detail. The checked-in derivative is the release
# artifact; rebuilding must never overwrite it with the original source.
PDF_RELEASE_OVERRIDES = {
    "doc-redrhex-final": {
        "sha256": "FCBA9E0A7445BC516A16A146A5684D722B3CD2DD53781A273AAE0220DE5446E3",
        "status": "public_full_redacted",
        "caption_en": "RedRHex Research Report",
        "caption_zh": "RedRHex 學士專題研究報告",
    },
}

# Keep downloadable PDF properties as polished as the visible documents. These
# values replace template defaults and tool-generated attribution without
# changing page content, links, annotations, or layout.
PDF_METADATA_OVERRIDES = {
    "doc-intermediate-dynamics-complete-exam": {
        "title": "Intermediate Dynamics Complete Final Examination and Solutions (2026)",
        "author": "Chih-Hsiang Liao (solutions)",
        "subject": "Complete course examination prompts and Chih-Hsiang Liao's worked solutions.",
    },
    "doc-python-library-escape-presentation": {
        "title": "Library Escape: Reinforcement Learning Project Presentation (2026)",
        "author": "Python Programming Project Team, Group 1",
        "subject": "Twenty-slide team presentation for the Library Escape reinforcement-learning project.",
    },
    "doc-physical-model-presentation": {
        "title": "Plant-Inspired Three-Dimensional Rolling-Ball Track Presentation (2026)",
        "author": "Physical Model Design Laboratory Team, 1BT6",
        "subject": "Thirty-eight-slide team presentation; student identification numbers removed from the public edition.",
    },
    "doc-inventor-system-integration-presentation": {
        "title": "Inventor Ball-Circulation System Integration Presentation (2025)",
        "author": "Computer-Aided Engineering Drawing Team, Group 14",
        "subject": "Twenty-four-slide public technical presentation for the Autodesk Inventor system-integration project.",
    },
    "doc-research-presentation-plan": {
        "title": "Chien Kuo Independent Research Symposium Implementation Plan (2021)",
        "author": "Chien Kuo High School Mathematics and Science Gifted Cohort 37",
        "subject": "Five-page implementation plan for the independent research symposium.",
    },
    "doc-apmo-participation-redacted": {
        "title": "Certificate of Participation — 2020 Asia Pacific Mathematics Olympiad (Privacy-Redacted Copy)",
        "author": "National Central University",
        "subject": "Privacy-redacted copy with the national identification number irreversibly removed.",
        "keywords": "APMO; Asia Pacific Mathematics Olympiad; participation certificate; privacy-redacted copy",
    },
    "doc-chien-kuo-gifted-certificates-redacted": {
        "title": "Mathematics and Science Gifted Class Certificates — Privacy-Redacted Copy",
        "author": "Taipei Municipal Chien Kuo High School",
        "subject": "Chinese and English certificates with birth date, certificate numbers, and verification elements irreversibly redacted.",
        "keywords": "mathematics and science gifted class; certificate; privacy-redacted copy",
    },
    "doc-chien-kuo-diploma-redacted": {
        "title": "Taipei Municipal Jianguo High School Diploma — Front and Back (Privacy-Redacted Copy)",
        "author": "Taipei Municipal Jianguo High School",
        "subject": "Privacy-redacted copy with birth dates, certificate number, and verification elements irreversibly removed.",
        "keywords": "Taipei Municipal Jianguo High School; diploma; privacy-redacted copy",
    },
    "doc-redrhex-final": {
        "title": "RedRHex Research Report",
        "author": "Chih-Hsiang Liao",
        "subject": "Undergraduate research report on RedRHex locomotion control and sim-to-real deployment.",
        "keywords": "RedRHex; reinforcement learning; locomotion control; sim-to-real; robotics",
    },
    "doc-redrhex-curriculum": {
        "title": "RedRHex Five-Stage Curriculum Learning Report",
        "author": "Chih-Hsiang Liao",
        "subject": "Five-stage curriculum learning and system-tuning report for RedRHex locomotion control.",
        "keywords": "RedRHex; curriculum learning; reinforcement learning; locomotion control; robotics",
    },
    "doc-lkas-final": {
        "title": "LKAS Vehicle Dynamics and Control Final Report",
        "author": "Chih-Hsiang Liao; Jacob Yang; Tzu-Chi Tseng",
        "subject": "Final course-project report on lane keeping with PI-enhanced sliding-mode control and computer vision.",
        "keywords": "lane keeping; vehicle dynamics; sliding-mode control; computer vision; Raspberry Pi",
    },
    "doc-lkas-archived-draft": {
        "title": "LKAS Early Project Report",
        "author": "Chih-Hsiang Liao; Jacob Yang; Tzu-Chi Tseng",
        "subject": "Archived early course-project report on autonomous lane keeping and vehicle control.",
        "keywords": "lane keeping; vehicle dynamics; sliding-mode control; archived report",
    },
    "doc-jarvis-presentation": {
        "title": "Jarvis Multimodal Home Hub Presentation",
        "author": "MakeNTU 2026 Jarvis Project Team",
        "subject": "Project presentation for the Jarvis multimodal AI home hub developed at MakeNTU 2026.",
        "keywords": "Jarvis; multimodal AI; edge computing; embedded systems; MakeNTU 2026",
    },
    "doc-research-presentation-introduction": {
        "title": "Independent Research Presentation — Formal Introduction",
        "author": "",
        "subject": "Implementation overview for the independent research symposium of Chien Kuo High School's 37th Mathematics and Science Gifted Cohort.",
        "keywords": "independent research; symposium; Chien Kuo High School",
    },
    "doc-teaching-calculus": {
        "title": "Calculus Teaching Notes",
        "author": "",
        "subject": "Calculus teaching notes prepared for mathematics and science outreach.",
        "keywords": "calculus; mathematics teaching; outreach",
    },
    "doc-teaching-geometry": {
        "title": "Geometry Theorems Teaching Notes",
        "author": "",
        "subject": "Geometry-theorem teaching notes prepared for mathematics and science outreach.",
        "keywords": "geometry; theorems; mathematics teaching; outreach",
    },
    "doc-teaching-number-theory": {
        "title": "Number Theory Teaching Notes",
        "author": "",
        "subject": "Number-theory teaching notes prepared for mathematics and science outreach.",
        "keywords": "number theory; mathematics teaching; outreach",
    },
    "doc-geometry-covering-poster": {
        "title": "Geometry-Covering Research Poster",
        "author": "Jason Liao",
        "subject": "Research poster for the geometry-covering optimization study.",
        "keywords": "geometry; covering optimization; mathematical research; poster",
    },
}

# Documents with multiple releases on the same route keep a deliberate reading
# order. This controls both the first document CTA and the attachment grid;
# filename or ID sorting must not silently change the editorial hierarchy.
DOCUMENT_DISPLAY_ORDER = {
    "doc-intermediate-dynamics-final": 1,
    "doc-intermediate-dynamics-complete-exam": 2,
    "doc-numerical-analysis-final": 1,
    "doc-numerical-analysis-midterm": 2,
    "doc-chien-kuo-gifted-certificates-redacted": 1,
    "doc-chien-kuo-diploma-redacted": 2,
    "doc-math-competition-2019": 1,
    "doc-math-competition-2020": 2,
    "doc-research-presentation-plan": 1,
    "doc-research-presentation-introduction": 2,
    "doc-research-presentation-poster": 3,
    "doc-teaching-calculus": 1,
    "doc-teaching-number-theory": 2,
    "doc-teaching-geometry": 3,
    "doc-teaching-inequalities": 4,
    "doc-rongshu-cup-2019": 1,
    "doc-rongshu-cup-2020": 2,
    "doc-trml-2020-taipei": 1,
    "doc-trml-2020-national": 2,
    "doc-aero-carrier-final": 1,
    "doc-aero-carrier-troubleshooting": 2,
    "doc-jarvis-presentation": 1,
    "doc-jarvis-award": 2,
    "doc-lkas-final": 1,
    "doc-lkas-archived-draft": 2,
    "doc-geometry-covering-full": 1,
    "doc-geometry-covering-32p": 2,
    "doc-geometry-covering-poster": 3,
    "doc-redrhex-final": 1,
    "doc-redrhex-curriculum": 2,
    "doc-redrhex-abad-proposal": 3,
}

# These PDFs are newly prepared, irreversibly redacted public derivatives. The
# raw certificates remain in the never-deploy source area. Their safe copies
# must therefore be pinned by a complete audited hash, originate outside that
# area, and be explicitly listed as public build inputs.
REDACTED_DOCUMENT_IDS = {
    "doc-apmo-participation-redacted",
    "doc-chien-kuo-diploma-redacted",
    "doc-chien-kuo-gifted-certificates-redacted",
}

# Explicitly approved derivatives from sources that must remain outside the
# public tree. Each source is pinned by SHA-256; only the freshly re-encoded,
# metadata-free derivative is published. Never add a source here without a
# visual privacy review.
APPROVED_WITHHELD_IMAGE_DERIVATIVES = [
    {
        "id": "img-b59b554de571",
        "sha256": "B59B554DE571588D39C1367CFA64498EE96A83A1C0B0D6FDFA30F09F8779CD38",
        "sourceLogicalId": "asset-b59b554de571-204",
        "route": "/academics/honors",
        "stem": "figure-114-2-grades-b59b554de5",
        "titleEn": "NTU Spring 2026 Course Results (Academic Year 114-2)",
        "titleZh": "臺大 114-2 學期課程成績",
        "altEn": "NTU Spring 2026 course results showing 21 credits and a semester average of 4.27 out of 4.30",
        "altZh": "臺大 114-2 學期成績表，顯示 21 學分與學期平均 4.27／4.30",
        "captionEn": "NTU Spring 2026 course results: 21 credits and a semester average of 4.27 out of 4.30.",
        "captionZh": "學期成績畫面，記錄 21 學分與 4.27／4.30 學期平均。",
    },
]


PDF_ASSETS = [
    ("doc-cv-public-2026-08", "61A79A5A4DB6", "Chih-Hsiang_Liao_Public_Academic_CV_2026-08.pdf", "Academic CV — August 2026", "學術履歷｜2026 年 8 月", "/cv", "public_full_redacted"),
    ("doc-intermediate-dynamics-final", "BBC4A340A8B8", "intermediate-dynamics-final-project-2026.pdf", "Intermediate Dynamics Final Project", "中等動力學期末專題報告", "/academics/intermediate-dynamics", "public_original"),
    ("doc-intermediate-dynamics-complete-exam", "1D53C052B9C84DE5503D4A74E27E33406F0FE52BEFDF33161BDF8401FA6005A8", "intermediate-dynamics-complete-final-exam-and-solutions-2026.pdf", "Intermediate Dynamics Final Examination and Complete Solutions", "中等動力學期末考題與完整解答", "/academics/intermediate-dynamics", "public_original"),
    ("doc-python-library-escape-presentation", "73D6CD895BD831C93EA799A9646685B07D54EE30F805AE765DE60424EE4ACCBD", "python-library-escape-reinforcement-learning-project-presentation-2026.pdf", "Library Escape Reinforcement-Learning Project Presentation", "Library Escape 強化學習專題成果簡報", "/academics/coursework/computer-programming-in-python", "public_derivative_metadata_scrubbed"),
    ("doc-numerical-analysis-final", "FCCF2D4ECB31", "numerical-analysis-final-project-2026.pdf", "Numerical Analysis Final Project", "數值分析期末專題完整報告", "/academics/numerical-analysis", "public_original"),
    ("doc-numerical-analysis-midterm", "C524BCBA84C6", "numerical-analysis-midterm-project-2026.pdf", "Numerical Analysis Midterm Project", "數值分析期中專題完整報告", "/academics/numerical-analysis", "public_original"),
    ("doc-aero-carrier-final", "069D84B66543", "aero-carrier-final-report-2026.pdf", "Aero Carrier Final Report", "Aero Carrier 期末成果報告", "/projects/aero-carrier", "public_original"),
    ("doc-lkas-final", "2E573124FDB2", "lkas-vehicle-dynamics-control-final-report-2025.pdf", "LKAS Vehicle Dynamics and Control Final Report", "車輛動力學與控制 LKAS 完整技術報告", "/projects/lkas", "public_original"),
    ("doc-linear-algebra-fft", "88F2BB882F01", "linear-algebra-fft-theory-applications-2025.pdf", "Linear Algebra and FFT: Theory and Applications", "線性代數與 FFT 理論及應用報告", "/academics/linear-algebra-fft", "public_original"),
    ("doc-mechanical-lab-ii", "E52F5DF294A4", "mechanical-engineering-laboratory-ii-final-report-2026.pdf", "Mechanical Engineering Laboratory II Final Report", "機械工程實驗（二）期末報告", "/academics/mechanical-laboratory-ii", "public_original"),
    ("doc-polar-arm-final", "FC0864BCB192", "polar-coordinate-ball-transport-arm-final-report-2025.pdf", "Polar-Coordinate Ball-Transport Arm Final Report", "純機械極座標運球吊臂期末報告", "/projects/polar-arm", "public_original"),
    ("doc-additive-manufacturing", "79A827C1D256", "additive-manufacturing-innovative-vehicle-report-2026.pdf", "Additive Manufacturing Innovative Vehicle Challenge Report", "積層製造 Innovative Vehicle Challenge 團隊報告", "/academics/coursework/additive-manufacturing", "public_original"),
    ("doc-redrhex-final", "C3A41C7521A3", "redrhex-research-report-2026.pdf", "RedRHex Research Report", "RedRHex 學士專題研究報告", "/research/redrhex", "public_original"),
    ("doc-redrhex-curriculum", "D3E04D62E97C", "redrhex-five-stage-curriculum-learning-report-2026.pdf", "RedRHex Five-Stage Curriculum Learning Report", "RedRHex 五階段課程式強化學習報告", "/research/redrhex", "public_original"),
    ("doc-redrhex-abad-proposal", "5524DD76CF95", "redrhex-abad-thesis-proposal-2026.pdf", "RedRHex ABAD Thesis Proposal", "RedRHex ABAD 學士專題提案", "/research/redrhex", "public_original"),
    ("doc-geometry-covering-32p", "2576EDA9F4DF", "geometry-covering-research-report-32-page-version-2021.pdf", "Geometry-Covering Research Report: 32-Page Version", "幾何覆蓋研究報告 32 頁版", "/research/geometry-covering", "public_original"),
    ("doc-geometry-covering-poster", "8A32ACF15377", "geometry-covering-research-poster-2021.pdf", "Geometry-Covering Research Poster", "幾何覆蓋研究成果海報", "/research/geometry-covering", "public_original"),
    ("doc-geometry-science-fair-honor", "35D42B26C2BF", "chien-kuo-geometry-covering-science-fair-honor-2021.pdf", "Chien Kuo High School Mathematics Science Fair — Excellence Award", "建中校內科展數學科優等證明", "/experience/geometry-covering-science-fair-honor", "public_original"),
    ("doc-geometry-covering-full", "E7BC0FFE825A", "geometry-covering-optimization-complete-work-36-pages-2021.pdf", "Geometry-Covering Optimization — Complete 36-Page Report", "《圓扇大飯店》幾何覆蓋最佳化完整報告（36 頁）", "/research/geometry-covering", "public_original"),
    ("doc-jarvis-presentation", "B3C7B5CA2DEE", "jarvis-multimodal-home-hub-presentation-2026.pdf", "Jarvis Multimodal Home Hub Presentation", "Jarvis 多模態家庭中樞成果簡報", "/projects/jarvis", "public_original"),
    ("doc-jarvis-award", "DECAC6FF9F77", "makentu-2026-nxp-avnet-first-prize-certificate.pdf", "MakeNTU 2026 NXP × Avnet Smart Living Challenge — First-Place Certificate", "MakeNTU 2026 NXP × Avnet 企業獎第一名獎狀", "/projects/jarvis", "public_original"),
    ("doc-aero-carrier-troubleshooting", "EEEC82184149", "aero-carrier-flight-control-integration-troubleshooting-2026.pdf", "Aero Carrier Flight-Control Integration and Troubleshooting Record", "Aero Carrier 飛控整合與故障排除紀錄", "/projects/aero-carrier", "public_original"),
    ("doc-physical-model-presentation", "4E54CA4781D7E4A3F3693DE3C5B1ECE17DA76FA94FBA3FDBD4CA2DC5A237D18E", "plant-inspired-3d-marble-run-physical-model-presentation-2026.pdf", "Plant-Inspired 3D Marble-Run Project Presentation", "植物主題三維滾球軌道成果簡報", "/academics/coursework/physical-model-design-laboratory", "public_derivative_metadata_scrubbed"),
    ("doc-inventor-system-integration-presentation", "7DAAAB86E38AEB6E36B4EE2CF3C075BF35B9D85481212C071F1D6BC5DE05DC4B", "inventor-ball-circulation-system-integration-presentation-2025.pdf", "Inventor Ball-Circulation System Integration Presentation", "Inventor 小球循環運輸機構系統整合簡報", "/projects/inventor-system-integration", "public_derivative_metadata_scrubbed"),
    ("doc-lkas-archived-draft", "62A8173A32CB", "lkas-early-project-report-archived-2025.pdf", "LKAS Early Project Report", "LKAS 早期專題報告", "/projects/lkas", "public_original"),
    ("doc-math-competition-2019", "F83DDB88428A", "chien-kuo-mathematics-competition-second-prize-2019.pdf", "Chien Kuo Mathematics Competition Second Prize (2019)", "108 學年度建中數學科能力競賽二等獎", "/experience/chien-kuo-mathematics-competition", "public_original"),
    ("doc-math-competition-2020", "FA44E6C6647D", "chien-kuo-mathematics-competition-honorable-mention-2020.pdf", "Chien Kuo Mathematics Competition Honorable Mention (2020)", "109 學年度建中數學科能力競賽佳作", "/experience/chien-kuo-mathematics-competition", "public_original"),
    ("doc-trml-2020-national", "967CD28A7B57", "trml-2020-national-team-bronze.pdf", "TRML 2020 National Team Bronze Award", "第 22 屆 TRML 2020 全國團體銅牌", "/experience/trml-captain-2020-2021", "public_original"),
    ("doc-trml-2020-taipei", "97453CD5684F", "trml-2020-taipei-team-second-prize.pdf", "TRML 2020 Taipei Team Second Prize", "第 22 屆 TRML 2020 臺北地區團體二等獎", "/experience/trml-captain-2020-2021", "public_original"),
    ("doc-chorus-soloist", "6BE5B26E6530", "chien-kuo-chorus-best-soloist-2020.pdf", "Chien Kuo Class Chorus Competition — Best Soloist", "建中班際合唱比賽最佳獨唱", "/experience/chien-kuo-chorus-best-soloist", "public_original"),
    ("doc-rongshu-cup-2019", "E34F7827AF4F", "rongshu-cup-honorable-mention-2019.pdf", "15th Rongshu Cup Honorable Mention (2019)", "第 15 屆榕數盃數學競賽佳作", "/experience/rongshu-cup-2019-2020", "public_original"),
    ("doc-rongshu-cup-2020", "2B72EEBFFE1D", "rongshu-cup-honorable-mention-2020.pdf", "16th Rongshu Cup Honorable Mention (2020)", "第 16 屆榕數盃數學競賽佳作", "/experience/rongshu-cup-2019-2020", "public_original"),
    ("doc-gifted-math-camp", "2E7B46474D31", "gifted-mathematics-camp-participation-2020.pdf", "Gifted Mathematics Camp Participation Certificate (2020)", "2020 資優數學研習營參與證明", "/experience/gifted-mathematics-camp-2020", "public_original"),
    ("doc-teaching-calculus", "08D1ACF736C9", "calculus-teaching-notes.pdf", "Calculus Teaching Notes", "微積分教學講義", "/experience/chien-kuo-science-club-teaching", "public_original"),
    ("doc-teaching-number-theory", "0F596519C342", "number-theory-teaching-notes.pdf", "Number Theory Teaching Notes", "數論教學講義", "/experience/chien-kuo-science-club-teaching", "public_original"),
    ("doc-teaching-geometry", "7CD73D042A33", "geometry-theorems-teaching-notes.pdf", "Geometry Theorems Teaching Notes", "幾何定理教學講義", "/experience/chien-kuo-science-club-teaching", "public_original"),
    ("doc-teaching-inequalities", "ED671F3182B5", "inequalities-teaching-notes.pdf", "Inequalities Teaching Notes", "不等式教學講義", "/experience/chien-kuo-science-club-teaching", "public_original"),
    ("doc-research-presentation-introduction", "067DCA2E2B9D", "chien-kuo-independent-research-presentation-introduction.pdf", "Chien Kuo Independent Research Symposium — Event Information and Registration Packet", "建中獨立研究成果發表會活動資訊與報名表", "/experience/chien-kuo-research-presentation-lead", "public_original"),
    ("doc-research-presentation-poster", "F7F176AFAFDA", "chien-kuo-independent-research-presentation-poster.pdf", "Chien Kuo Independent Research Symposium — Promotional Poster", "建中獨立研究成果發表會宣傳海報", "/experience/chien-kuo-research-presentation-lead", "public_original"),
    ("doc-research-presentation-plan", "DF4106A09152351B202846FBECB6562DD8E9312AE949C1D138C5B4A5069DB5AC", "chien-kuo-independent-research-symposium-plan-2021.pdf", "Chien Kuo Independent Research Symposium — Implementation Plan", "建中數理資優班獨立研究成果發表會實施計畫", "/experience/chien-kuo-research-presentation-lead", "public_derivative_metadata_scrubbed"),
    ("doc-apmo-participation-redacted", "5D0B15FA2F0D03F06EEE6093091DA6BE08C1536557F66B829D9BDA1CE4FBA164", "apmo-2020-participation-certificate-redacted.pdf", "2020 Asia Pacific Mathematics Olympiad Participation Certificate — Privacy-Redacted Copy", "2020 年亞太數學奧林匹亞競賽參賽證明｜隱私遮蔽版", "/experience/apmoc-apmo-tmo-selection", "public_redacted_derivative_metadata_scrubbed"),
    ("doc-chien-kuo-gifted-certificates-redacted", "557E9319B33FF9EFF1DB41577E422C7703AA31000E233AB04126614966657634", "chien-kuo-gifted-program-certificates-redacted.pdf", "Chien Kuo Mathematics and Science Gifted Class Certificates — Privacy-Redacted Copy", "建中數理資優班中英文證明｜隱私遮蔽版", "/experience/chien-kuo-gifted-class", "public_redacted_derivative_metadata_scrubbed"),
    ("doc-chien-kuo-diploma-redacted", "2560F237F85B8E43633F44072CD957FD5A34CA26D6F92332F6AFC7114B0895A1", "chien-kuo-high-school-diploma-redacted.pdf", "Taipei Municipal Jianguo High School Diploma — Privacy-Redacted Copy", "臺北市立建國高級中學畢業證書｜隱私遮蔽版", "/experience/chien-kuo-gifted-class", "public_redacted_derivative_metadata_scrubbed"),
]


SITE_AUTHORED_DOCUMENTS = [
    {
        "id": "doc-public-course-record-2026",
        "filename": "Jason_Liao_Public_Course_Record_Through_Spring_2026.pdf",
        "title_en": "Jason Liao Course and Grade Record — Through Spring 2026",
        "title_zh": "廖致翔修課與成績紀錄｜截至 2026 年春季",
        "route": "/academics/course-record",
    },
]


TITLE_ZH_OVERRIDES = {
    "01 train overview": "RedRHex 訓練流程概覽",
    "02 rewards terrain": "RedRHex 獎勵函數與地形設定",
    "03 history console tensorboard": "RedRHex 訓練歷程、控制台與 TensorBoard 診斷",
    "04 video deploy": "RedRHex 部署與影片驗證流程",
    "05 remote activity control": "RedRHex 遠端任務控制流程",
    "result video frame": "RedRHex 結果影片幀",
    "tensorboard summary": "RedRHex TensorBoard 訓練指標摘要",
}


TITLE_EN = {
    "JasonLiao網站主識別": "Jason Liao portfolio identity",
    "蘭花展個人形象": "Jason Liao at an orchid exhibition",
    "雪地滑雪個人形象": "Jason Liao on a ski slope",
    "金華國小班級體育活動": "Class sports activity at Jinhua Elementary School",
    "中正國中同學合照": "Class photograph at Zhongzheng Junior High School",
    "建中數資班校園合照": "Chien Kuo gifted mathematics and science class on campus",
    "建中科學營團隊合照": "Chien Kuo science camp team",
    "建中畢業獲獎合照": "Chien Kuo graduation and honors photograph",
    "建中數資班班級合照": "Chien Kuo gifted mathematics and science class photograph",
    "臺大求學團體合照": "Group photograph at NTU",
    "土木實作線材結構原型": "Wire-structure prototype for Physical Model Design Laboratory",
    "Inventor樂高賽車CAD": "Autodesk Inventor CAD model of a LEGO race car",
    "流體力學筆記精選": "Selected fluid-mechanics notes",
    "BambuH2D列印過程": "Bambu H2D additive manufacturing process",
    "3D列印車輛成品": "Completed 3D-printed vehicle",
    "RedRHex平行模擬環境": "RedRHex parallel simulation environments",
    "RedRHex單機模擬特寫": "RedRHex single-robot simulation close-up",
    "RedRHex訓練指標監控": "RedRHex training metric monitoring",
    "RedRHex機構與配線側視": "Side view of the RedRHex mechanism and wiring",
    "RedRHex板載運算與電控": "RedRHex onboard compute and control electronics",
    "RedRHex硬體原型對照": "RedRHex hardware prototype comparison",
    "建中數資成果發表會海報": "Chien Kuo gifted-class research presentation poster",
    "成果發表會網站分工": "Independent Research Symposium website responsibility chart",
    "幾何覆蓋研究運算工作照": "Computational work for the geometry-covering research project",
    "工程數學筆記精選": "Selected engineering-mathematics notes",
    "Jarvis原型與隊伍看板": "Jarvis prototype and team display board",
    "Jarvis團隊協作": "Jarvis team collaboration during MakeNTU",
    "Jarvis評審展示": "Jarvis demonstration for the judges",
    "Jarvis裝置原型特寫": "Close-up of the Jarvis device prototype",
    "Jarvis獲獎後團隊合照": "Jarvis team after receiving the corporate challenge award",
    "Jarvis企業獎頒獎舞台": "NXP × Avnet corporate challenge award ceremony",
    "Jarvis企業獎第一名團隊": "Jarvis team after winning the NXP × Avnet challenge",
    "AeroCarrier四旋翼原型": "Aero Carrier quadrotor prototype",
    "AeroCarrier團隊與原型": "Aero Carrier team with the integrated prototype",
    "LKAS滑模控制Simulink模型": "LKAS sliding mode control model in Simulink",
    "LKAS車道辨識流程": "LKAS lane detection pipeline",
    "LKAS控制系統架構": "LKAS control system architecture",
    "LKAS自走車硬體原型": "LKAS autonomous vehicle hardware prototype",
    "極座標吊臂CAD組合": "CAD assembly of the polar-coordinate transport arm",
    "極座標吊臂團隊與原型": "Polar-coordinate arm team with the prototype",
    "極座標吊臂原型製作": "Fabrication of the polar-coordinate arm prototype",
    "極座標吊臂機構調整": "Mechanical adjustment of the polar-coordinate arm",
    "Inventor小球循環機構CAD": "Autodesk Inventor CAD assembly of the recirculating-ball mechanism",
    "TRML2021臺北市一等獎榜單": "TRML 2021 Taipei first-prize results",
    "TRML2021全國銀牌榜單": "TRML 2021 national silver-medal results",
    "建中科研社數學教學紀錄": "Mathematics teaching record from the Chien Kuo Science Research Club",
    "科研社數學科學活動成果": "Activity name card from the Chien Kuo Science Research Club",
    "清水科學營開場活動": "Opening activity at the Qingshui science outreach camp",
    "清水科學營課程現場": "Classroom session at the Qingshui science outreach camp",
    "宜蘭中山科學營闖關活動": "Hands-on challenge at the Yilan Zhongshan science camp",
    "宜蘭中山科學營團隊合照": "Yilan Zhongshan Elementary School science camp group photograph",
    "仁愛科學營招生海報": "Poster for the Renai Junior High School science camp",
    "仁愛科學營工作團隊": "Staff group photograph at the Renai Junior High School science camp",
    "仁愛科學營全體合照": "Group photograph at the Renai Junior High School science camp",
    "鐵馬週腳踏車維修實作": "Hands-on bicycle repair during NTU Bicycle Service Week",
    "鐵馬週免費維修服務站": "Free bicycle-repair station at NTU",
    "臺大土木營結構模型活動": "Structural-model activity at the NTU Civil Engineering Camp",
    "臺大土木營隊輔團隊": "Counselor team at the NTU Civil Engineering Camp",
    "臺大機械宿營舞台活動": "Stage activity at the NTU Mechanical Engineering orientation camp",
    "臺大機械宿營工作團隊": "Staff team at the NTU Mechanical Engineering orientation camp",
    "臺大建北週攤位團隊": "NTU Chien Kuo–Beiyi Week booth team",
    "臺大機械系棒球隊球衣": "NTU Mechanical Engineering baseball team jersey",
    "臺大機械系棒球隊球場團體照": "NTU Mechanical Engineering baseball team at the field",
    "臺大土木之夜樂團練習": "Band rehearsal for NTU Civil Engineering Night",
    "臺大土木之夜主唱演出": "Lead vocal performance at NTU Civil Engineering Night",
    "RedRHex 訓練流程概覽": "RedRHex training overview",
    "RedRHex 獎勵函數與地形設定": "RedRHex reward and terrain configuration",
    "RedRHex 訓練歷程、控制台與 TensorBoard 診斷": "RedRHex training history, console, and TensorBoard diagnostics",
    "RedRHex 部署與影片驗證流程": "RedRHex deployment and video validation workflow",
    "RedRHex 遠端任務控制流程": "RedRHex remote activity control workflow",
    "RedRHex 結果影片幀": "Frame from a RedRHex simulation test",
    "RedRHex TensorBoard 訓練指標摘要": "RedRHex TensorBoard training summary",
}


IMAGE_COPY_OVERRIDES = {
    "2fff62bb7833": {
        "titleEn": "Science Research Club record and classroom mathematics lesson",
        "titleZh": "科研社經歷與數學教學現場",
        "altEn": "A Science Research Club activity record above a classroom photograph of Jason Liao teaching mathematics at the blackboard.",
        "altZh": "上方為科研社社團經歷紀錄，下方為廖致翔在黑板前進行數學教學的課堂照片。",
        "captionEn": "Science Research Club participation and a classroom mathematics lesson.",
        "captionZh": "科研社參與紀錄與數學教學現場。",
    },
    "503638161dab": {
        "titleEn": "Jason Liao on a ski slope",
        "titleZh": "雪地滑雪留影",
        "altEn": "Jason Liao standing on a snow-covered ski slope.",
        "altZh": "廖致翔站在雪地滑雪場上。",
        "captionEn": "Jason Liao on a ski slope",
        "captionZh": "雪地滑雪留影",
    },
    "a44ea8d43cdb": {
        "titleEn": "Jason Liao at an orchid exhibition",
        "titleZh": "蘭花展留影",
        "altEn": "Jason Liao standing amid an orchid exhibition.",
        "altZh": "廖致翔於蘭花展中留影。",
        "captionEn": "Jason Liao at an orchid exhibition",
        "captionZh": "蘭花展留影",
    },
    "ad7478744553": {
        "titleEn": "Activity name card from the Chien Kuo Science Research Club",
        "titleZh": "建中科研社活動名牌",
        "altEn": "A handwritten activity name card reading ‘Chien Kuo Science Research Club · Mathematics Teaching · Jason Liao.’",
        "altZh": "寫有「建中科研、數學教學、廖致翔」的手寫活動名牌。",
        "captionEn": "A handwritten name card prepared for a mathematics teaching activity.",
        "captionZh": "數學教學活動使用的手寫名牌。",
    },
    "c0c29e33d26d": {
        "titleEn": "Class sports activity at Jinhua Elementary School",
        "titleZh": "金華國小班級體育活動",
        "altEn": "Jinhua Elementary School students gathered on an indoor court after a class sports activity.",
        "altZh": "金華國小學生於室內球場完成班級體育活動後合影。",
        "captionEn": "Class sports activity at Jinhua Elementary School.",
        "captionZh": "金華國小班級體育活動紀錄。",
        "displayOrder": 1,
    },
    "4eb15c4b30c0": {
        "titleEn": "Class photograph at Zhongzheng Junior High School",
        "titleZh": "中正國中同學合照",
        "altEn": "Classmates gathered during a school activity at Zhongzheng Junior High School.",
        "altZh": "中正國中同學於校園活動期間合影。",
        "captionEn": "Class photograph taken during a school activity at Zhongzheng Junior High School.",
        "captionZh": "中正國中校園活動期間的班級合照。",
        "displayOrder": 1,
    },
    "385f44329998": {
        "titleEn": "Chien Kuo gifted mathematics and science class photograph",
        "titleZh": "建中數資班班級合照",
        "altEn": "Students from Chien Kuo High School's 37th Mathematics and Science Gifted Cohort gathered in front of the school's red-brick main building.",
        "altZh": "建國中學第 37 屆數理資優班學生於紅樓前合影。",
        "captionEn": "The 37th gifted cohort—the shared setting for advanced coursework, independent research, competitions, teaching, and leadership.",
        "captionZh": "第 37 屆數理資優班；進階課程、獨立研究、競賽、教學與領導經驗共同展開的學習環境。",
        "displayOrder": 1,
    },
    "4d3fe5d156ff": {
        "titleEn": "Chien Kuo graduation and honors photograph",
        "titleZh": "建中畢業獲獎合照",
        "altEn": "Graduating students from the gifted cohort holding certificates after an awards ceremony.",
        "altZh": "建中數理資優班學生於畢業獲獎活動後手持證書合影。",
        "captionEn": "A closing record of three years of coursework, research, competitions, and service.",
        "captionZh": "高中三年課程、研究、競賽與服務歷程的階段性紀錄。",
        "displayOrder": 2,
    },
    "d1d281d4dcaa": {
        "titleEn": "Chien Kuo science camp team",
        "titleZh": "建中科學營團隊合照",
        "altEn": "The Chien Kuo science camp team gathered at the event venue.",
        "altZh": "建中科學營工作團隊於活動場地合影。",
        "captionEn": "Team photograph from the Chien Kuo science camp.",
        "captionZh": "建中科學營工作團隊合照。",
        "displayOrder": 3,
    },
    "fdd30ddcd8e5": {
        "titleEn": "Chien Kuo gifted mathematics and science class on campus",
        "titleZh": "建中數資班校園合照",
        "altEn": "Gifted-class classmates gathered outdoors on the Chien Kuo campus.",
        "altZh": "數理資優班同學於建中校園戶外合影。",
        "captionEn": "Everyday campus life within the gifted cohort's peer-learning community.",
        "captionZh": "數理資優班的校園日常與同儕學習環境。",
        "displayOrder": 4,
    },
    "9af476327e7f": {
        "titleEn": "Classroom session at the Qingshui science outreach camp",
        "titleZh": "清水科學營課程現場",
        "altEn": "An instructor presents scientific material at the front of a Qingshui Junior High classroom while students participate from their seats.",
        "altZh": "講師在清水國中教室前方說明科學內容，學生於座位參與課程。",
        "captionEn": "Students participating in a science session at Qingshui Junior High School.",
        "captionZh": "清水國中學生參與科學課程的現場紀錄。",
        "displayOrder": 1,
    },
    "a8d93cde56c8": {
        "titleEn": "Opening activity at the Qingshui science outreach camp",
        "titleZh": "清水科學營開場活動",
        "altEn": "Camp staff in red shirts lead the opening activity in the school gym.",
        "altZh": "穿著紅色營服的工作人員在體育館帶領清水科學營開場活動。",
        "captionEn": "Camp staff leading the opening activity in the school gym.",
        "captionZh": "工作團隊在體育館帶領科學營開場活動。",
        "displayOrder": 2,
    },
    "3f260d7c91dd": {
        "titleEn": "Yilan Zhongshan Elementary School science camp group photograph",
        "titleZh": "宜蘭中山科學營團隊合照",
        "altEn": "Students and staff gathered for a group photograph at the Yilan Zhongshan Elementary science camp.",
        "altZh": "宜蘭中山國小科學營學生與工作團隊於活動場地合影。",
        "captionEn": "Students and staff at the Yilan Zhongshan Elementary School science camp.",
        "captionZh": "宜蘭中山國小科學營學生與工作團隊合照。",
        "displayOrder": 1,
    },
    "751339930740": {
        "titleEn": "Hands-on challenge at the Yilan Zhongshan science camp",
        "titleZh": "宜蘭中山科學營闖關活動",
        "altEn": "Elementary students and camp staff take part in a hands-on science challenge outside the school.",
        "altZh": "宜蘭中山國小學生與工作人員共同參與戶外科學闖關活動。",
        "captionEn": "Students and staff taking part in an outdoor science challenge.",
        "captionZh": "學生與工作人員參與戶外科學闖關活動。",
        "displayOrder": 2,
    },
    "22b962308279": {
        "titleEn": "Group photograph at the Renai Junior High School science camp",
        "titleZh": "仁愛科學營全體合照",
        "altEn": "Students and staff gathered after the Renai Junior High science camp.",
        "altZh": "仁愛國中科學營學生與工作團隊於活動結束後合影。",
        "captionEn": "Students and staff gathered after the Renai Junior High School science camp.",
        "captionZh": "仁愛國中科學營結束後的學生與工作團隊合照。",
        "displayOrder": 1,
    },
    "4c98134fc2ca": {
        "titleEn": "Staff group photograph at the Renai Junior High School science camp",
        "titleZh": "仁愛科學營工作團隊",
        "altEn": "The Renai Junior High School science camp staff team gathered at the event venue.",
        "altZh": "仁愛國中科學營工作團隊於活動場地合影。",
        "captionEn": "Staff group photograph at the Renai Junior High School science camp.",
        "captionZh": "仁愛國中科學營工作團隊於活動場地合照。",
        "displayOrder": 2,
    },
    "6fcceedf2e30": {
        "titleEn": "Computational work for the geometry-covering research project",
        "titleZh": "幾何覆蓋研究運算工作照",
        "altEn": "The geometric-covering research team works through computational checks in a computer classroom.",
        "altZh": "幾何覆蓋研究團隊在電腦教室進行計算與討論。",
        "captionEn": "Computational checks tested the circular-arc conjecture and prompted the team to revise the question when numerical evidence contradicted it.",
        "captionZh": "研究過程以計算檢查圓弧構造的猜想，並在數值證據出現矛盾時重新整理問題與論證。",
        "displayOrder": 1,
        "placementSectionId": "role-system",
    },
    "99f1a81631d2": {
        "titleEn": "Engineering Mathematics notebook overview I",
        "titleZh": "工程數學筆記總覽（一）",
        "altEn": "Contact sheet of Engineering Mathematics notes on series, differential equations, transforms, and partial differential equations — set I",
        "altZh": "工程數學筆記拼圖，涵蓋級數、微分方程、積分轉換與偏微分方程（第一組）",
        "captionEn": "Notebook overview I · series, differential equations, transforms, and PDEs.",
        "captionZh": "筆記總覽（一）｜級數、微分方程、積分轉換與偏微分方程。",
        "displayOrder": 1,
    },
    "8786d36e5762": {
        "titleEn": "Engineering Mathematics notebook overview II",
        "titleZh": "工程數學筆記總覽（二）",
        "altEn": "Contact sheet of Engineering Mathematics notes on convergence, Taylor series, Laplace and Fourier methods, and wave equations — set II",
        "altZh": "工程數學筆記拼圖，涵蓋收斂、Taylor 級數、Laplace 與 Fourier 方法及波動方程（第二組）",
        "captionEn": "Notebook overview II · convergence, Taylor series, transforms, and wave equations.",
        "captionZh": "筆記總覽（二）｜收斂、Taylor 級數、積分轉換與波動方程。",
        "displayOrder": 2,
    },
    "4820678e0289": {
        "titleEn": "Engineering Mathematics notebook overview III",
        "titleZh": "工程數學筆記總覽（三）",
        "altEn": "Contact sheet of Engineering Mathematics notes on uniform convergence, Fourier analysis, boundary-value problems, and conformal mapping — set III",
        "altZh": "工程數學筆記拼圖，涵蓋一致收斂、Fourier 分析、邊界值問題與共形映射（第三組）",
        "captionEn": "Notebook overview III · uniform convergence, Fourier analysis, boundary-value problems, and conformal mapping.",
        "captionZh": "筆記總覽（三）｜一致收斂、Fourier 分析、邊界值問題與共形映射。",
        "displayOrder": 3,
    },
    "91ee85da4cec": {
        "titleEn": "Fluid Mechanics notebook overview I",
        "titleZh": "流體力學筆記總覽（一）",
        "altEn": "Contact sheet of Fluid Mechanics notes on material derivatives, stress, hydrostatics, control volumes, and pipe flow — set I",
        "altZh": "流體力學筆記拼圖，涵蓋物質導數、應力、流體靜力學、控制體積與管流（第一組）",
        "captionEn": "Notebook overview I · stress, hydrostatics, control-volume analysis, and pipe flow.",
        "captionZh": "筆記總覽（一）｜應力、流體靜力學、控制體積分析與管流。",
        "displayOrder": 1,
    },
    "d744882f84be": {
        "titleEn": "Fluid Mechanics notebook overview II",
        "titleZh": "流體力學筆記總覽（二）",
        "altEn": "Contact sheet of Fluid Mechanics notes on kinematics, momentum and energy balances, boundary layers, and external flow — set II",
        "altZh": "流體力學筆記拼圖，涵蓋運動學、動量與能量平衡、邊界層及外部流（第二組）",
        "captionEn": "Notebook overview II · kinematics, momentum and energy balances, boundary layers, and external flow.",
        "captionZh": "筆記總覽（二）｜運動學、動量與能量平衡、邊界層及外部流。",
        "displayOrder": 2,
    },
    "7acc621fca6f": {
        "titleEn": "Fluid Mechanics notebook overview III",
        "titleZh": "流體力學筆記總覽（三）",
        "altEn": "Contact sheet of Fluid Mechanics notes on internal flow, turbulence, boundary-layer separation, and specific energy — set III",
        "altZh": "流體力學筆記拼圖，涵蓋內部流、紊流、邊界層分離與比能（第三組）",
        "captionEn": "Notebook overview III · internal flow, turbulence, boundary-layer separation, and specific energy.",
        "captionZh": "筆記總覽（三）｜內部流、紊流、邊界層分離與比能。",
        "displayOrder": 3,
    },
}


COURSE_ROUTES = {
    "01_中等動力學": "/academics/intermediate-dynamics",
    "02_數值分析": "/academics/numerical-analysis",
    "03_機械工程實務": "/academics/coursework/practice-of-mechanical-engineering",
    "04_Python": "/academics/coursework/computer-programming-in-python",
    "05_土木工程基本實作": "/academics/coursework/physical-model-design-laboratory",
    "06_工程圖學": "/academics/coursework/engineering-graphics",
    "07_工程數學": "/academics/engineering-mathematics",
    "08_分析導論一": "/academics/coursework/introduction-to-mathematical-analysis-i",
    "09_車輛動力學與控制": "/academics/coursework/vehicle-dynamics-and-control",
    "10_流體力學": "/academics/coursework/fluid-mechanics",
    "11_電腦輔助工程製圖": "/academics/coursework/computer-aided-engineering-drawing",
    "12_線性代數與應用": "/academics/linear-algebra-fft",
    "13_機械工程實驗二": "/academics/mechanical-laboratory-ii",
    "14_機械設計原理": "/academics/coursework/machine-design-theory",
    "15_積層製造": "/academics/coursework/additive-manufacturing",
}


ROUTE_CONTEXT = {
    "/": ("Home", "首頁"),
    "/about": ("About", "關於我"),
    "/research/redrhex": ("RedRHex research", "RedRHex 研究"),
    "/research/geometry-covering": ("geometry-covering research", "幾何覆蓋研究"),
    "/projects/jarvis": ("Jarvis project", "Jarvis 專案"),
    "/projects/aero-carrier": ("Aero Carrier project", "Aero Carrier 專案"),
    "/projects/lkas": ("LKAS project", "LKAS 專案"),
    "/projects/polar-arm": ("polar-coordinate arm project", "極座標吊臂專案"),
    "/projects/inventor-system-integration": ("Inventor system-integration project", "Inventor 系統整合專案"),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def route_for(source_path: str) -> str:
    p = source_path.replace("\\", "/")
    if p.startswith("01_"):
        return "/"
    if p.startswith("02_"):
        return "/about"
    if "/03-01_" in p:
        return "/experience/jinhua-primary-school"
    if "/03-02_" in p:
        return "/experience/zhongzheng-junior-high"
    if "/03-03_" in p:
        return "/experience/chien-kuo-gifted-class"
    if "/03-04_" in p:
        return "/experience/ntu-academic-journey"
    if "/03-11_" in p:
        for marker, route in COURSE_ROUTES.items():
            if f"/{marker}" in p:
                return route
    if p.startswith("04_研究") and ("/04-01_" in p or "/04-02_" in p):
        return "/research/redrhex"
    if "/04-03_" in p:
        return "/research/geometry-covering"
    if "/04-05_" in p:
        return "/academics/engineering-mathematics"
    if "/05-01_" in p:
        return "/projects/jarvis"
    if "/05-02_" in p:
        return "/projects/aero-carrier"
    if "/05-03_" in p:
        return "/projects/lkas"
    if "/05-04_" in p:
        return "/projects/polar-arm"
    if "/05-05_" in p:
        return "/projects/inventor-system-integration"
    event_routes = {
        "/06-01_": "/academics/honors",
        "/02_02_建中科學研習社": "/experience/chien-kuo-science-club-teaching",
        "/03_03_臺中清水國中": "/experience/qingshui-science-outreach",
        "/04_04_宜蘭中山國小": "/experience/zhongshan-primary-science-camp",
        "/05_05_臺北仁愛國中": "/experience/renai-junior-high-science-camp",
        "/01_01_臺大機械系鐵馬週": "/experience/ntu-bicycle-service-week",
        "/03_03_臺大土木營": "/experience/ntu-civil-engineering-camp",
        "/04_04_臺大機械宿營": "/experience/ntu-mechanical-orientation-staff",
        "/05_05_臺大建北週": "/experience/ntu-chien-kuo-beiyi-week",
        "/01_01_臺大機械系棒球隊": "/experience/ntu-mechanical-baseball-team",
        "/02_02_臺大土木之夜": "/experience/ntu-civil-night-vocalist",
    }
    for marker, route in event_routes.items():
        if marker in p:
            if route == "/academics/honors" and "TRML" in p:
                return "/experience/trml-captain-2020-2021"
            return route
    return "/about"


def route_dir(route: str) -> Path:
    if route == "/":
        return Path("home")
    return Path(*route.strip("/").split("/"))


def naturalize_title_zh(value: str) -> str:
    replacements = {
        "JasonLiao": "Jason Liao ",
        "AeroCarrier": "Aero Carrier ",
        "BambuH2D": "Bambu H2D ",
        "3D列印": "3D 列印",
        "RedRHex 結果影片幀": "RedRHex 模擬測試畫面",
        "RedRHex機構與配線側視": "RedRHex 機構與配線側視圖",
        "臺大求學團體合照": "臺大校園團體合照",
        "Jarvis裝置原型特寫": "Jarvis 裝置原型特寫",
        "Jarvis企業獎第一名團隊": "Jarvis 團隊獲 NXP × Avnet 企業獎第一名",
        "Jarvis原型與隊伍看板": "Jarvis 原型與團隊展示看板",
        "Jarvis評審展示": "Jarvis 評審展示現場",
        "Jarvis獲獎後團隊合照": "Jarvis 團隊獲獎合照",
        "Jarvis企業獎頒獎舞台": "NXP × Avnet 企業獎頒獎典禮",
        "Jarvis團隊協作": "Jarvis 團隊協作現場",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"Inventor(?=[\u3400-\u9fff])", "Inventor ", value)
    value = re.sub(r"LKAS(?=[\u3400-\u9fff])", "LKAS ", value)
    value = re.sub(r"RedRHex(?=[\u3400-\u9fff])", "RedRHex ", value)
    value = re.sub(r"TRML(?=\d)", "TRML ", value)
    value = re.sub(r"(?<=[\u3400-\u9fff])CAD", " CAD", value)
    value = re.sub(r"CAD(?=[\u3400-\u9fff])", "CAD ", value)
    value = re.sub(r"(?<=[\u3400-\u9fff])Simulink", " Simulink", value)
    value = re.sub(r"Simulink(?=[\u3400-\u9fff])", "Simulink ", value)
    return re.sub(r"\s{2,}", " ", value).strip()


def clean_title(filename: str) -> tuple[str, str, str, str]:
    stem = Path(filename).stem
    match = re.match(r"^(?:RAW_)?(PHOTO|FIGURE)_(\d+)_?(.*)$", stem, re.I)
    if match:
        role = match.group(1).lower()
        number = match.group(2)
        raw = match.group(3)
    else:
        role = "figure"
        number_match = re.match(r"^(\d+)_?(.*)$", stem)
        number = number_match.group(1) if number_match else "01"
        raw = number_match.group(2) if number_match else stem
    normalized = re.sub(r"[_-]+", " ", raw).strip()
    title_zh = TITLE_ZH_OVERRIDES.get(f"{number} {normalized}".strip(), normalized)
    title_zh = TITLE_ZH_OVERRIDES.get(stem.replace("_", " "), title_zh)
    title_en = TITLE_EN.get(title_zh)
    if not title_en:
        if re.search(r"[\u3400-\u9fff]", title_zh):
            raise ValueError(
                f"Missing reviewed English media title for {title_zh!r} ({filename}). "
                "Add an explicit TITLE_EN entry before publishing."
            )
        else:
            title_en = title_zh.replace("_", " ").strip().title()
    return role, number, naturalize_title_zh(title_zh), title_en


def context_for(route: str) -> tuple[str, str]:
    if route in ROUTE_CONTEXT:
        return ROUTE_CONTEXT[route]
    if route.startswith("/academics/"):
        return "academic work", "學術成果"
    if route.startswith("/experience/"):
        return "experience record", "經歷紀錄"
    return "portfolio", "作品集"


def select_images(source_manifest: dict) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for asset in source_manifest["assets"]:
        if asset.get("artifact_kind") == "image":
            groups[asset["sha256"]].append(asset)
    selected: list[dict] = []
    for hash_value, group in groups.items():
        candidates = [a for a in group if a.get("visibility") == "public_candidate"]
        if not candidates:
            continue
        candidates.sort(
            key=lambda a: (
                "REF_COPY__" in a.get("canonical_filename", ""),
                "/00_精選網站素材" in a.get("source_path", ""),
                len(a.get("source_path", "")),
            )
        )
        chosen = candidates[0]
        source = SOURCE_ROOT / Path(chosen["source_path"])
        if not source.is_file():
            raise FileNotFoundError(f"Missing selected image: {chosen['asset_id']}")
        if sha256(source) != hash_value:
            raise ValueError(f"Source hash changed for {chosen['asset_id']}")
        selected.append(chosen)
    return sorted(selected, key=lambda item: item["source_path"])


def load_image(path: Path) -> Image.Image:
    if path.suffix.lower() == ".heic":
        heif = open_heif(path, convert_hdr_to_8bit=True)
        image = heif.to_pillow()
        image.load()
        return ImageOps.exif_transpose(image).copy()
    with Image.open(path) as image:
        image.load()
        return ImageOps.exif_transpose(image).copy()


def normalize_image(image: Image.Image, max_edge: int = 2560) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    if max(image.size) > max_edge:
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    return image


def save_image_variants(image: Image.Image, stem: Path, technical: bool) -> dict:
    stem.parent.mkdir(parents=True, exist_ok=True)
    rgba = image.convert("RGBA") if image.mode == "RGBA" else image
    alpha = image.mode == "RGBA" and image.getextrema()[3][0] < 255
    avif_path = stem.with_suffix(".avif")
    webp_path = stem.with_suffix(".webp")
    for suffix in (".avif", ".webp", ".png", ".jpg"):
        stale = stem.with_suffix(suffix)
        if stale.exists():
            stale.unlink()
    if technical:
        rgba.save(avif_path, "AVIF", quality=70, speed=6)
        rgba.save(webp_path, "WEBP", quality=90, method=6)
    else:
        rgb = image.convert("RGB")
        rgb.save(avif_path, "AVIF", quality=58, speed=6)
        rgb.save(webp_path, "WEBP", quality=86, method=6)
    if alpha:
        fallback_path = stem.with_suffix(".png")
        rgba.save(fallback_path, "PNG", optimize=True, compress_level=9)
    else:
        fallback_path = stem.with_suffix(".jpg")
        image.convert("RGB").save(
            fallback_path,
            "JPEG",
            quality=92 if technical else 90,
            optimize=True,
            progressive=True,
        )
    return {
        "avif": avif_path,
        "webp": webp_path,
        "fallback": fallback_path,
    }


def public_url(path: Path) -> str:
    return "/" + path.relative_to(PUBLIC_ROOT).as_posix()


def scan_pdf_text(path: Path) -> list[str]:
    reader = PdfReader(str(path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    patterns = {
        "taiwan_government_id": re.compile(r"(?<![A-Z0-9])[A-Z][12]\d{8}(?!\d)"),
        "private_mobile": re.compile(r"(?<!\d)09\d{8}(?!\d)"),
        "api_secret": re.compile(r"(?:sk-|ghp_|github_pat_)[A-Za-z0-9_\-]{20,}"),
        "explicit_password": re.compile(r"(?i)password\s*[:=]\s*[^\s,;]{6,}"),
        "private_local_path": re.compile(r"(?i)(?:/home/|[A-Z]:[\\/]+Users[\\/]+)"),
    }
    return [name for name, pattern in patterns.items() if pattern.search(text)]


def normalize_pdf_metadata(path: Path, metadata: dict[str, str]) -> None:
    reader = PdfReader(str(path))
    expected = {
        "/Title": metadata["title"],
        "/Author": metadata["author"],
        "/Subject": metadata["subject"],
        "/Creator": "Jason Liao Academic Portfolio",
        "/Producer": "Jason Liao Academic Portfolio",
    }
    if "keywords" in metadata:
        expected["/Keywords"] = metadata["keywords"]
    current = {str(key): str(value) for key, value in (reader.metadata or {}).items()}
    if current == expected and reader.xmp_metadata is None:
        return
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.metadata = None
    writer.add_metadata(expected)
    writer.xmp_metadata = None
    temporary = path.with_name(f".{path.name}.metadata.tmp")
    try:
        with temporary.open("wb") as stream:
            writer.write(stream)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def render_pdf_preview(pdf_path: Path, out_stem: Path) -> dict:
    document = fitz.open(pdf_path)
    page = document[0]
    scale = min(2.0, 1400 / max(page.rect.width, 1))
    pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    with tempfile.TemporaryDirectory(prefix="jason-pdf-preview-") as temp_dir:
        temp_png = Path(temp_dir) / "preview.png"
        pixmap.save(temp_png)
        with Image.open(temp_png) as preview:
            preview.load()
            image = normalize_image(preview.copy(), max_edge=1600)
    document.close()
    return save_image_variants(image, out_stem, technical=True)


def build_images(source_manifest: dict) -> list[dict]:
    entries: list[dict] = []
    for source_asset in select_images(source_manifest):
        if source_asset["sha256"].lower()[:12] in EXCLUDED_IMAGE_SOURCE_PREFIXES:
            continue
        source_path = SOURCE_ROOT / Path(source_asset["source_path"])
        route = route_for(source_asset["source_path"])
        role, number, title_zh, title_en = clean_title(source_asset["canonical_filename"])
        source_prefix = source_asset["sha256"][:12].lower()
        number = PUBLIC_IMAGE_NUMBER_OVERRIDES.get(source_prefix, number)
        image = normalize_image(load_image(source_path))
        token = source_asset["sha256"][:10].lower()
        stem = PUBLIC_IMAGES / route_dir(route) / f"{role}-{number}-{token}"
        technical = role == "figure"
        variants = save_image_variants(image, stem, technical)
        context_en, context_zh = context_for(route)
        copy_override = IMAGE_COPY_OVERRIDES.get(source_prefix, {})
        entry = {
            "id": f"img-{source_asset['sha256'][:12].lower()}",
            "publicPath": public_url(variants["webp"]),
            "route": route,
            "kind": "image",
            "altEn": copy_override.get("altEn", title_en),
            "altZh": copy_override.get("altZh", title_zh),
            "captionEn": copy_override.get(
                "captionEn",
                title_en,
            ),
            "captionZh": copy_override.get("captionZh", title_zh),
            "sha256": sha256(variants["webp"]),
            "sourceSha256": source_asset["sha256"],
            "sourceLogicalId": source_asset["asset_id"],
            "titleEn": copy_override.get("titleEn", title_en),
            "titleZh": copy_override.get("titleZh", title_zh),
            "width": image.width,
            "height": image.height,
            "aspectRatio": round(image.width / image.height, 6),
            "mimeType": "image/webp",
            "byteSize": variants["webp"].stat().st_size,
            "variants": {
                key: {
                    "publicPath": public_url(path),
                    "sha256": sha256(path),
                    "byteSize": path.stat().st_size,
                    "mimeType": {
                        ".avif": "image/avif",
                        ".webp": "image/webp",
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                    }[path.suffix.lower()],
                }
                for key, path in variants.items()
            },
            "status": "public_derivative_metadata_scrubbed",
            "rights": "user_confirmed_public",
            "metadataScrubbed": True,
        }
        if "displayOrder" in copy_override:
            entry["displayOrder"] = copy_override["displayOrder"]
        if "placementSectionId" in copy_override:
            entry["placementSectionId"] = copy_override["placementSectionId"]
        entries.append(entry)
    return entries


def build_approved_withheld_image_derivatives(source_manifest: dict) -> list[dict]:
    image_assets = [
        asset for asset in source_manifest["assets"]
        if asset.get("artifact_kind") == "image"
    ]
    entries: list[dict] = []
    for approved in APPROVED_WITHHELD_IMAGE_DERIVATIVES:
        matches = [asset for asset in image_assets if asset["sha256"] == approved["sha256"]]
        if len(matches) != 1:
            raise ValueError(
                f"Expected exactly one pinned source for {approved['id']}; found {len(matches)}"
            )
        source_asset = matches[0]
        if source_asset["asset_id"] != approved["sourceLogicalId"]:
            raise ValueError(f"Source identity changed for {approved['id']}")
        if source_asset.get("visibility") != "never_deploy":
            raise ValueError(f"Withheld-source gate changed for {approved['id']}")
        source_path = SOURCE_ROOT / Path(source_asset["source_path"])
        if sha256(source_path) != approved["sha256"]:
            raise ValueError(f"Pinned source hash changed for {approved['id']}")

        image = normalize_image(load_image(source_path))
        stem = PUBLIC_IMAGES / route_dir(approved["route"]) / approved["stem"]
        variants = save_image_variants(image, stem, technical=True)
        entries.append(
            {
                "id": approved["id"],
                "publicPath": public_url(variants["webp"]),
                "route": approved["route"],
                "kind": "image",
                "altEn": approved["altEn"],
                "altZh": approved["altZh"],
                "captionEn": approved["captionEn"],
                "captionZh": approved["captionZh"],
                "sha256": sha256(variants["webp"]),
                "sourceSha256": approved["sha256"],
                "sourceLogicalId": approved["sourceLogicalId"],
                "titleEn": approved["titleEn"],
                "titleZh": approved["titleZh"],
                "width": image.width,
                "height": image.height,
                "aspectRatio": round(image.width / image.height, 6),
                "mimeType": "image/webp",
                "byteSize": variants["webp"].stat().st_size,
                "variants": {
                    key: {
                        "publicPath": public_url(path),
                        "sha256": sha256(path),
                        "byteSize": path.stat().st_size,
                        "mimeType": {
                            ".avif": "image/avif",
                            ".webp": "image/webp",
                            ".png": "image/png",
                            ".jpg": "image/jpeg",
                        }[path.suffix.lower()],
                    }
                    for key, path in variants.items()
                },
                "status": "public_derivative_metadata_scrubbed_from_withheld_source",
                "rights": "user_confirmed_public",
                "metadataScrubbed": True,
                "sourceOriginalDeployed": False,
            }
        )
    return entries


def build_documents(source_manifest: dict) -> list[dict]:
    pdf_assets = [a for a in source_manifest["assets"] if a.get("artifact_kind") == "pdf"]
    entries: list[dict] = []
    for asset_id, prefix, filename, title_en, title_zh, route, status in PDF_ASSETS:
        exact_hash = len(prefix) == 64
        matches = [
            a for a in pdf_assets
            if (a["sha256"] == prefix if exact_hash else a["sha256"].startswith(prefix))
        ]
        if not matches:
            qualifier = "hash" if exact_hash else "hash prefix"
            raise FileNotFoundError(f"No PDF matches approved {qualifier} {prefix}")
        matches.sort(
            key=lambda a: (
                "REF_COPY__" in a.get("canonical_filename", ""),
                "/00_精選網站素材" in a.get("source_path", ""),
                len(a.get("source_path", "")),
            )
        )
        source_asset = matches[0]
        if asset_id in REDACTED_DOCUMENT_IDS:
            if not exact_hash:
                raise ValueError(f"Redacted derivative must use a complete SHA-256: {asset_id}")
            if source_asset.get("visibility") != "public_candidate" or not source_asset.get("build_include"):
                raise ValueError(f"Redacted derivative is not an approved public build input: {asset_id}")
            if "99_敏感資料_禁止直接公開" in source_asset.get("source_path", ""):
                raise ValueError(f"Redacted derivative still points to the never-deploy source area: {asset_id}")
        source_path = SOURCE_ROOT / Path(source_asset["source_path"])
        actual_hash = sha256(source_path)
        if (exact_hash and actual_hash != prefix) or (not exact_hash and not actual_hash.startswith(prefix)):
            raise ValueError(f"Approved PDF hash changed: {asset_id}")
        destination = PUBLIC_DOCUMENTS / filename
        destination.parent.mkdir(parents=True, exist_ok=True)
        release_override = PDF_RELEASE_OVERRIDES.get(asset_id)
        if release_override:
            if not destination.exists():
                raise FileNotFoundError(f"Approved public derivative is missing for {asset_id}")
            release_hash = sha256(destination)
            if release_hash != release_override["sha256"]:
                raise ValueError(f"Approved public derivative changed: {asset_id}")
            findings = scan_pdf_text(destination)
            if findings:
                raise ValueError(f"Sensitive-pattern release gate failed for {asset_id}: {', '.join(findings)}")
            status = release_override["status"]
            caption_en = release_override["caption_en"]
            caption_zh = release_override["caption_zh"]
        else:
            findings = scan_pdf_text(source_path)
            if findings:
                raise ValueError(f"Sensitive-pattern release gate failed for {asset_id}: {', '.join(findings)}")
            shutil.copyfile(source_path, destination)
            caption_en = title_en
            caption_zh = title_zh
        metadata_override = PDF_METADATA_OVERRIDES.get(asset_id)
        if metadata_override:
            normalize_pdf_metadata(destination, metadata_override)
        release_hash = sha256(destination)
        reader = PdfReader(str(destination))
        page_count = len(reader.pages)
        preview_stem = PUBLIC_PREVIEWS / Path(filename).stem
        preview_variants = render_pdf_preview(destination, preview_stem)
        entries.append(
            {
                "id": asset_id,
                "publicPath": public_url(destination),
                "route": route,
                "kind": "document",
                "altEn": f"First-page preview of {title_en}",
                "altZh": f"「{title_zh}」首頁預覽",
                "captionEn": caption_en,
                "captionZh": caption_zh,
                "sha256": release_hash,
                "sourceSha256": actual_hash,
                "sourceLogicalId": source_asset["asset_id"],
                "titleEn": title_en,
                "titleZh": title_zh,
                "mimeType": "application/pdf",
                "byteSize": destination.stat().st_size,
                "pageCount": page_count,
                "previewPath": public_url(preview_variants["webp"]),
                "previewVariants": {
                    key: {
                        "publicPath": public_url(path),
                        "sha256": sha256(path),
                        "byteSize": path.stat().st_size,
                    }
                    for key, path in preview_variants.items()
                },
                "status": status,
                "rights": "user_confirmed_public",
                "metadataScrubbed": metadata_override is not None,
                "sourceOriginalDeployed": not status.startswith("public_redacted_derivative"),
                **({"displayOrder": DOCUMENT_DISPLAY_ORDER[asset_id]} if asset_id in DOCUMENT_DISPLAY_ORDER else {}),
                "download": True,
            }
        )
    return entries


def build_site_authored_documents() -> list[dict]:
    entries: list[dict] = []
    for document in SITE_AUTHORED_DOCUMENTS:
        destination = PUBLIC_DOCUMENTS / document["filename"]
        if not destination.exists():
            raise FileNotFoundError(f"Site-authored public document is missing: {destination.name}")
        findings = scan_pdf_text(destination)
        if findings:
            raise ValueError(
                f"Sensitive-pattern release gate failed for {document['id']}: {', '.join(findings)}"
            )
        release_hash = sha256(destination)
        reader = PdfReader(str(destination))
        page_count = len(reader.pages)
        preview_stem = PUBLIC_PREVIEWS / Path(document["filename"]).stem
        preview_variants = render_pdf_preview(destination, preview_stem)
        entries.append(
            {
                "id": document["id"],
                "publicPath": public_url(destination),
                "route": document["route"],
                "kind": "document",
                "altEn": f"First-page preview of {document['title_en']}",
                "altZh": f"「{document['title_zh']}」首頁預覽",
                "captionEn": (
                    f"{document['title_en']}. Bilingual PDF available to read online or download."
                ),
                "captionZh": f"{document['title_zh']}。中英雙語 PDF，可線上閱讀或下載。",
                "sha256": release_hash,
                "sourceSha256": release_hash,
                "sourceLogicalId": "site-authored-public-course-record-2026",
                "titleEn": document["title_en"],
                "titleZh": document["title_zh"],
                "mimeType": "application/pdf",
                "byteSize": destination.stat().st_size,
                "pageCount": page_count,
                "previewPath": public_url(preview_variants["webp"]),
                "previewVariants": {
                    key: {
                        "publicPath": public_url(path),
                        "sha256": sha256(path),
                        "byteSize": path.stat().st_size,
                    }
                    for key, path in preview_variants.items()
                },
                "status": "public_original",
                "rights": "user_confirmed_public",
                "metadataScrubbed": True,
                "download": True,
            }
        )
    return entries


MANIFEST_COPY_REPLACEMENTS_EN = {
    "Public Academic CV 2026-08": "Academic CV — August 2026",
    " — Public Redacted Copy": " — Privacy-Redacted Copy",
    " — 24-Slide Public Edition": "",
    " (Archived)": "",
    "Geometry-Covering Optimization: Complete 36-Page Work": "Geometry-Covering Optimization — Complete 36-Page Report",
    "Jarvis team - NXP x Avnet challenge first prize": "Jarvis team after winning the NXP × Avnet challenge",
    "Jarvis team after receiving the enterprise award": "Jarvis team after receiving the corporate challenge award",
    "NXP x Avnet enterprise-award ceremony": "NXP × Avnet corporate challenge award ceremony",
    "Research-presentation website responsibility map": "Independent Research Symposium website responsibility chart",
}

MANIFEST_COPY_REPLACEMENTS_ZH = {
    "2026-08 公開學術履歷": "學術履歷｜2026 年 8 月",
    "｜公開遮蔽版": "｜隱私遮蔽版",
    "｜24 頁公開版": "",
    "LKAS 較早期專題報告（封存版）": "LKAS 早期專題報告",
}


def replace_manifest_copy(value: str, replacements: dict[str, str]) -> str:
    for before, after in replacements.items():
        value = value.replace(before, after)
    return value.strip()


def refresh_manifest_copy() -> None:
    """Update editorial fields without rebuilding or modifying any released media file."""
    entries = json.loads(INTERNAL_MANIFEST.read_text(encoding="utf-8"))
    for entry in entries:
        for field in ("titleEn", "altEn"):
            if field in entry:
                entry[field] = replace_manifest_copy(entry[field], MANIFEST_COPY_REPLACEMENTS_EN)
        for field in ("titleZh", "altZh"):
            if field in entry:
                entry[field] = replace_manifest_copy(entry[field], MANIFEST_COPY_REPLACEMENTS_ZH)

        caption_en = replace_manifest_copy(entry.get("captionEn", ""), MANIFEST_COPY_REPLACEMENTS_EN)
        if re.fullmatch(r".+?\. Authentic visual evidence included with .+\.", caption_en):
            caption_en = entry.get("titleEn", caption_en.split(". Authentic visual evidence", 1)[0])
        elif re.fullmatch(r".+?\. Full PDF available for inline review and download\.", caption_en):
            caption_en = entry.get("titleEn", caption_en.split(". Full PDF available", 1)[0])
        elif caption_en == "RedRHex Research Report — public full-text edition with local deployment paths removed. Available for inline review and download.":
            caption_en = entry.get("titleEn", "RedRHex Research Report")
        entry["captionEn"] = caption_en

        caption_zh = replace_manifest_copy(entry.get("captionZh", ""), MANIFEST_COPY_REPLACEMENTS_ZH)
        if re.fullmatch(r".+?。收錄於.+?，作為真實成果與過程紀錄。", caption_zh):
            caption_zh = entry.get("titleZh", caption_zh.split("。收錄於", 1)[0])
        elif re.fullmatch(r".+?。提供完整 PDF 線上閱讀與下載。", caption_zh):
            caption_zh = entry.get("titleZh", caption_zh.split("。提供完整 PDF", 1)[0])
        elif caption_zh == "RedRHex 學士專題研究報告公開全文版，已移除本機部署路徑；提供線上閱讀與下載。":
            caption_zh = entry.get("titleZh", "RedRHex 學士專題研究報告")
        entry["captionZh"] = caption_zh

    INTERNAL_MANIFEST.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Refreshed editorial copy in {INTERNAL_MANIFEST}")


def main() -> None:
    PUBLIC_IMAGES.mkdir(parents=True, exist_ok=True)
    PUBLIC_PREVIEWS.mkdir(parents=True, exist_ok=True)
    PUBLIC_DOCUMENTS.mkdir(parents=True, exist_ok=True)
    source_manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8-sig"))
    entries = (
        build_images(source_manifest)
        + build_approved_withheld_image_derivatives(source_manifest)
        + build_documents(source_manifest)
        + build_site_authored_documents()
    )
    entries.sort(
        key=lambda entry: (
            entry["kind"],
            entry["route"],
            entry.get("displayOrder", 1_000),
            entry["id"],
        )
    )
    INTERNAL_MANIFEST.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    total_bytes = sum(path.stat().st_size for path in PUBLIC_ROOT.rglob("*") if path.is_file())
    print(
        json.dumps(
            {
                "manifest": str(INTERNAL_MANIFEST),
                "images": sum(entry["kind"] == "image" for entry in entries),
                "documents": sum(entry["kind"] == "document" for entry in entries),
                "entries": len(entries),
                "publicBytes": total_bytes,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    if sys.argv[1:] == ["--refresh-copy"]:
        refresh_manifest_copy()
    elif sys.argv[1:]:
        raise SystemExit("Usage: build_public_assets.py [--refresh-copy]")
    else:
        main()
