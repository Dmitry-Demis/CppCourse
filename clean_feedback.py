import re
from pathlib import Path

THEORY_DIR = Path(__file__).parent / "theory"

def clean_file(path):
    html = path.read_text(encoding="utf-8")
    if "feedback" not in html:
        return False
    html = re.sub(r'\n?[ \t]*<link rel="stylesheet" href="[^"]*feedback\.css">\n?', '\n', html)
    html = re.sub(r'\n?[ \t]*<script src="[^"]*feedback\.js"></script>\n?', '\n', html)
    html = re.sub(r'\n?\s*<!-- FEEDBACK SECTION.*?</section>', '', html, flags=re.DOTALL)
    path.write_text(html, encoding="utf-8")
    return True

cleaned = sum(1 for f in THEORY_DIR.rglob("*.html") if clean_file(f))
print(f"Очищено: {cleaned}")
