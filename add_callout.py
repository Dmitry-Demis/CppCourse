#!/usr/bin/env python3
"""
add_callout.py — добавляет callout.css и js/core/callout.js во все HTML-файлы теории.
Запуск: python add_callout.py
"""
import re
from pathlib import Path

THEORY_DIR = Path(__file__).parent / "theory"
MARKER_CSS = "callout.css"
MARKER_JS  = "callout.js"


def depth(path: Path) -> str:
    rel = path.relative_to(THEORY_DIR.parent)
    return "../" * (len(rel.parts) - 1)


def process(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    changed = False
    d = depth(path)

    css_tag = f'    <link rel="stylesheet" href="{d}css/callout.css">\n'
    if MARKER_CSS not in html:
        # Вставить после последнего <link rel="stylesheet"...> перед </head>
        html = re.sub(r'([ \t]*<link rel="stylesheet"[^\n]+\n)(?!.*<link rel="stylesheet")',
                      lambda m: m.group(0) + css_tag, html, count=1, flags=re.DOTALL)
        # Запасной вариант
        if MARKER_CSS not in html:
            html = html.replace("</head>", css_tag + "</head>", 1)
        changed = True

    js_tag = f'    <script src="{d}js/core/callout.js"></script>\n'
    if MARKER_JS not in html:
        # Вставить перед первым <script src=
        html = re.sub(r'([ \t]*<script src="[^"]+\.js"[^>]*></script>\n)',
                      js_tag + r'\1', html, count=1)
        if MARKER_JS not in html:
            html = html.replace("</body>", js_tag + "</body>", 1)
        changed = True

    if changed:
        path.write_text(html, encoding="utf-8")
        print(f"  [ok] {path.relative_to(THEORY_DIR.parent)}")
    else:
        print(f"  [skip] {path.name}")
    return changed


def main():
    files = sorted(THEORY_DIR.rglob("*.html"))
    print(f"Файлов: {len(files)}\n")
    updated = sum(1 for f in files if process(f))
    print(f"\nГотово. Обновлено: {updated}/{len(files)}")


if __name__ == "__main__":
    main()
