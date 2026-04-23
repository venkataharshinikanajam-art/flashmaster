"""
Render source-code files as VS Code Dark+ themed PNG screenshots.

Used for the report's Database Development and Appendix sections so the
code appears as actual editor screenshots rather than plain text blocks.
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from pygments import highlight
from pygments.lexers import JavascriptLexer
from pygments.formatters import ImageFormatter
from pygments.style import Style
from pygments.token import (
    Keyword, Name, Comment, String, Error, Number, Operator,
    Generic, Token, Whitespace, Punctuation, Text,
)

ROOT = Path(r"C:/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS")
SS = ROOT / "ss"


class VSCodeDarkPlus(Style):
    """VS Code Dark+ colour palette for Pygments."""

    background_color = "#1E1E1E"
    highlight_color = "#264F78"
    default_style = ""

    styles = {
        Token:                     "#D4D4D4",
        Whitespace:                "#D4D4D4",
        Text:                      "#D4D4D4",
        Comment:                   "italic #6A9955",
        Comment.Multiline:         "italic #6A9955",
        Comment.Single:            "italic #6A9955",
        Comment.Preproc:           "#C586C0",
        Keyword:                   "#569CD6",
        Keyword.Constant:          "#569CD6",
        Keyword.Declaration:       "#569CD6",
        Keyword.Namespace:         "#C586C0",
        Keyword.Pseudo:            "#569CD6",
        Keyword.Reserved:          "#569CD6",
        Keyword.Type:              "#4EC9B0",
        Operator:                  "#D4D4D4",
        Operator.Word:             "#C586C0",
        Punctuation:               "#D4D4D4",
        Name:                      "#9CDCFE",
        Name.Attribute:            "#9CDCFE",
        Name.Builtin:              "#4EC9B0",
        Name.Builtin.Pseudo:       "#569CD6",
        Name.Class:                "#4EC9B0",
        Name.Constant:             "#4FC1FF",
        Name.Decorator:            "#DCDCAA",
        Name.Entity:               "#9CDCFE",
        Name.Exception:            "#4EC9B0",
        Name.Function:             "#DCDCAA",
        Name.Property:             "#9CDCFE",
        Name.Label:                "#9CDCFE",
        Name.Namespace:            "#4EC9B0",
        Name.Other:                "#9CDCFE",
        Name.Tag:                  "#569CD6",
        Name.Variable:             "#9CDCFE",
        Number:                    "#B5CEA8",
        String:                    "#CE9178",
        String.Regex:              "#D16969",
        String.Char:               "#CE9178",
        String.Doc:                "italic #6A9955",
        String.Escape:             "#D7BA7D",
        Generic:                   "#D4D4D4",
        Generic.Deleted:           "#F44747",
        Generic.Emph:              "italic #D4D4D4",
        Generic.Error:             "#F44747",
        Generic.Heading:           "bold #569CD6",
        Generic.Inserted:          "#B5CEA8",
        Generic.Output:            "#808080",
        Generic.Prompt:            "bold #569CD6",
        Generic.Strong:            "bold #D4D4D4",
        Generic.Subheading:        "bold #9CDCFE",
        Generic.Traceback:         "#F44747",
        Error:                     "#F44747",
    }


def find_font() -> tuple[str, str]:
    """Return (ui_font_path, mono_font_path) — the best fonts available on this system."""
    candidates_mono = [
        r"C:/Windows/Fonts/consola.ttf",
        r"C:/Windows/Fonts/CascadiaMono.ttf",
        r"C:/Windows/Fonts/cour.ttf",
    ]
    candidates_ui = [
        r"C:/Windows/Fonts/segoeui.ttf",
        r"C:/Windows/Fonts/arial.ttf",
    ]
    mono = next((c for c in candidates_mono if Path(c).exists()), candidates_mono[-1])
    ui = next((c for c in candidates_ui if Path(c).exists()), candidates_ui[-1])
    return ui, mono


def render_code_screenshot(src_path: Path, out_path: Path, display_name: str | None = None) -> None:
    """Render a JS file to a VS Code-styled PNG with a title bar."""
    code = src_path.read_text(encoding="utf-8")
    name = display_name or src_path.name

    ui_font_path, mono_font_path = find_font()

    fmt = ImageFormatter(
        style=VSCodeDarkPlus,
        font_name=mono_font_path,
        font_size=16,
        line_numbers=True,
        line_number_bg="#1E1E1E",
        line_number_fg="#858585",
        line_number_chars=3,
        line_number_bold=False,
        line_number_italic=False,
        line_number_separator=False,
        line_pad=4,
        image_pad=18,
    )

    tmp_png = out_path.with_suffix(".body.png")
    with open(tmp_png, "wb") as f:
        f.write(highlight(code, JavascriptLexer(), fmt))

    body = Image.open(tmp_png).convert("RGB")
    body_w, body_h = body.size

    # Compose the VS Code window: title bar + tab strip + body
    title_h = 34
    tab_h = 34
    total_h = title_h + tab_h + body_h

    canvas = Image.new("RGB", (body_w, total_h), "#3C3C3C")
    draw = ImageDraw.Draw(canvas)

    # Title bar
    draw.rectangle([0, 0, body_w, title_h], fill="#323233")
    # Traffic lights (red/yellow/green dots on the left, macOS style — or just a VS Code-ish logo)
    dot_r = 7
    dot_y = title_h // 2
    for i, colour in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
        cx = 18 + i * 22
        draw.ellipse(
            [cx - dot_r, dot_y - dot_r, cx + dot_r, dot_y + dot_r],
            fill=colour,
        )
    # Title text (filename — FLASHMASTER)
    try:
        title_font = ImageFont.truetype(ui_font_path, 13)
    except Exception:
        title_font = ImageFont.load_default()
    draw.text(
        (body_w // 2 - 120, title_h // 2 - 8),
        f"{name} — FLASHMASTER — Visual Studio Code",
        fill="#CCCCCC",
        font=title_font,
    )

    # Tab strip with the file's tab highlighted
    draw.rectangle([0, title_h, body_w, title_h + tab_h], fill="#252526")
    # Active tab
    try:
        tab_font = ImageFont.truetype(ui_font_path, 13)
    except Exception:
        tab_font = ImageFont.load_default()
    tab_w = 210
    draw.rectangle([0, title_h, tab_w, title_h + tab_h], fill="#1E1E1E")
    # Top accent line on active tab
    draw.rectangle([0, title_h, tab_w, title_h + 2], fill="#007ACC")
    # File icon (simple JS rectangle)
    draw.rectangle([12, title_h + 11, 28, title_h + 24], fill="#F7DF1E")
    draw.text(
        (14, title_h + 12),
        "JS",
        fill="#1E1E1E",
        font=ImageFont.truetype(ui_font_path, 10) if Path(ui_font_path).exists() else tab_font,
    )
    draw.text(
        (38, title_h + 9),
        name,
        fill="#FFFFFF",
        font=tab_font,
    )
    # "×" close button on the tab
    draw.text(
        (tab_w - 20, title_h + 8),
        "×",
        fill="#858585",
        font=ImageFont.truetype(ui_font_path, 16) if Path(ui_font_path).exists() else tab_font,
    )

    # Body
    canvas.paste(body, (0, title_h + tab_h))

    canvas.save(out_path, "PNG")
    tmp_png.unlink(missing_ok=True)
    print(f"Wrote {out_path.name:40s} ({out_path.stat().st_size / 1024:.1f} KB)")


# ----------------------- main -------------------------------------------------

TARGETS: list[tuple[str, str, str]] = [
    # (source file, output filename, display name shown in the tab)
    ("server/src/models/User.js",               "code-user-model.png",         "User.js"),
    ("server/src/models/StudyMaterial.js",      "code-studymaterial-model.png","StudyMaterial.js"),
    ("server/src/models/Flashcard.js",          "code-flashcard-model.png",    "Flashcard.js"),
    ("server/src/models/StudyPlan.js",          "code-studyplan-model.png",    "StudyPlan.js"),
    ("server/src/models/Progress.js",           "code-progress-model.png",     "Progress.js"),
    ("server/src/config/db.js",                 "code-db-config.png",          "db.js"),
    ("server/src/index.js",                     "code-index.png",              "index.js"),
    ("server/src/middleware/auth.js",           "code-auth-middleware.png",    "auth.js"),
    ("server/src/services/flashcardGenerator.js","code-flashcard-generator.png","flashcardGenerator.js"),
]


def main() -> None:
    SS.mkdir(parents=True, exist_ok=True)
    for src, out, disp in TARGETS:
        src_path = ROOT / src
        if not src_path.exists():
            print(f"SKIP (missing): {src}")
            continue
        render_code_screenshot(src_path, SS / out, display_name=disp)


if __name__ == "__main__":
    main()
