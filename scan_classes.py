import re, glob
classes = set()
for f in glob.glob('theory/**/*.html', recursive=True):
    html = open(f, encoding='utf-8').read()
    for m in re.finditer(r'class="([^"]+)"', html):
        for c in m.group(1).split():
            classes.add(c)
boxes = sorted(c for c in classes if any(x in c for x in ['card','block','quote','box','note','tip','warn','danger','iso','important']))
print('\n'.join(boxes))
