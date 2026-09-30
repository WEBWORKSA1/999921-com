#!/usr/bin/env python3
"""Regenerate editable src/*.html page bodies from the built root pages (round-trip with build.py)."""
import os, re, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(ROOT, 'src'), exist_ok=True)
for f in glob.glob(os.path.join(ROOT, '*.html')):
    s = open(f, encoding='utf-8').read()
    m = re.search(r'<!--src-meta (\{.*?\})-->\s*<main id="main">\n(.*?)\n<!--/src-body-->', s, re.S)
    if not m:
        continue
    open(os.path.join(ROOT, 'src', os.path.basename(f)), 'w', encoding='utf-8').write('<!--meta %s-->\n%s\n' % (m.group(1), m.group(2)))
print('src/ regenerated')
