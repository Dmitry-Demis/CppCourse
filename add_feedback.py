#!/usr/bin/env python3
"""
add_feedback.py — вставляет секцию «Оцените страницу» в каждый HTML-файл теории.
Секция добавляется ПОСЛЕ блока quiz-widget (проверьте знания) и ПЕРЕД paragraph-nav.
Запуск: python add_feedback.py
"""

import re
from pathlib import Path

THEORY_DIR = Path(__file__).parent / "theory"
MARKER = "feedback-section"

STAR_SVG = (
    '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'
    '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77'
    'l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
    '</svg>'
)


def build_feedback_html():
    stars = "\n".join(
        f'                        <span class="feedback-star" aria-label="Оценка {i}">{STAR_SVG}</span>'
        for i in range(1, 11)
    )
    return f"""
                <!-- FEEDBACK SECTION -->
                <section class="feedback-section">
                    <div class="feedback-section__title">Оцените этот параграф</div>
                    <div class="feedback-section__subtitle">Нажмите на звезду, чтобы оставить оценку</div>

                    <div class="feedback-stars-row">
                        <div class="feedback-stars">
{stars}
                        </div>
                        <span class="feedback-rating-value">—</span>
                    </div>

                    <div class="feedback-form">
                        <textarea
                            class="feedback-form__textarea"
                            maxlength="1024"
                            placeholder="Комментарий (необязательно)…"
                        ></textarea>
                        <div class="feedback-form__row">
                            <span class="feedback-form__char">0 / 1024</span>
                            <button class="feedback-form__submit">Отправить</button>
                        </div>
                    </div>

                    <div class="feedback-done">
                        <span class="feedback-done__icon">✓</span>
                        <span>Спасибо за отзыв!</span>
                    </div>
                </section>"""


def relative_depth(html_path: Path) -> str:
    rel = html_path.relative_to(THEORY_DIR.parent)
    depth = len(rel.parts) - 1
    return "../" * depth


def process_file(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")

    if MARKER in html:
        print(f"  [skip] {path.name}")
        return False

    depth = relative_depth(path)
    feedback_html = build_feedback_html()

    # CSS в <head>
    css_tag = f'    <link rel="stylesheet" href="{depth}css/feedback.css">\n'
    html = html.replace("</head>", css_tag + "</head>", 1)

    # Вставляем перед paragraph-nav (он есть во всех файлах)
    if 'class="paragraph-nav"' in html:
        html = html.replace(
            '<div class="paragraph-nav">',
            feedback_html + '\n\n                <div class="paragraph-nav">',
            1
        )
    else:
        # Запасной вариант — перед закрытием chapter-content
        html = re.sub(
            r'(\s*</div>\s*</main>)',
            feedback_html + r'\1',
            html, count=1
        )

    # JS перед </body>
    js_tag = f'    <script src="{depth}js/feedback.js"></script>\n'
    html = html.replace("</body>", js_tag + "</body>", 1)

    path.write_text(html, encoding="utf-8")
    print(f"  [ok]   {path.relative_to(THEORY_DIR.parent)}")
    return True


def main():
    files = sorted(THEORY_DIR.rglob("*.html"))
    print(f"Файлов: {len(files)}\n")
    updated = sum(1 for f in files if process_file(f))
    print(f"\nГотово. Обновлено: {updated}/{len(files)}")


if __name__ == "__main__":
    main()
