import glob, re
from pathlib import Path

THEORY = Path('theory')

missing_css, missing_js = [], []
for f in sorted(THEORY.rglob('*.html')):
    html = f.read_text(encoding='utf-8')
    if 'callout.css' not in html:
        missing_css.append(str(f))
    if 'callout.js' not in html:
        missing_js.append(str(f))

print(f'Missing callout.css: {len(missing_css)}')
for f in missing_css: print(' ', f)
print(f'Missing callout.js:  {len(missing_js)}')
for f in missing_js: print(' ', f)
