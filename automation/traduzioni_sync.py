#!/usr/bin/env python3
"""Multilingua fase 3: segna `tr: da_aggiornare` nelle traduzioni quando cambia il testo originale.

Gira in automatico (GitHub Actions: .github/workflows/traduzioni.yml) a ogni push che tocca
_pages/, _posts/ o index.html. Confronta l'hash del testo originale con `tr_hash` salvato nella
traduzione (stesso algoritmo di admin/js/lingue.js, funzione lgHash). Non tocca le copie ancora
da tradurre (`tr: copia`) ne' quelle gia' segnate.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {'404.md', 'categories-redirect.md', 'cat-list.md', 'category-archive.md', 'tag-archive.md', 'year-archive.md'}


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, t):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def to36(n):
    d = '0123456789abcdefghijklmnopqrstuvwxyz'
    if n == 0:
        return '0'
    s = ''
    while n:
        n, r = divmod(n, 36)
        s = d[r] + s
    return s


def lg_hash(s):
    s = (s or '').replace('\r', '').strip()
    h = 5381
    b = s.encode('utf-16-le', 'surrogatepass')
    for i in range(0, len(b), 2):
        c = b[i] | (b[i + 1] << 8)
        h = ((h << 5) + h + c) & 0xFFFFFFFF
    return to36(h)


def split(t):
    m = re.match(r'^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$', t)
    return m


def get(fm, k):
    m = re.search(r'^' + k + r':[ \t]*(.*)$', fm, re.M)
    return re.sub(r'^["\']|["\']$', '', m.group(1).strip()) if m else ''


def ref_of(kind, path, fm):
    r = get(fm, 'ref')
    if r:
        return r
    name = path.name
    if kind == 'home':
        return 'home'
    if kind == 'post':
        return re.sub(r'\.md$', '', re.sub(r'^\d{4}-\d{2}-\d{2}-', '', name))
    return re.sub(r'\.md$', '', name)


def collect(lang, base_lang):
    out = []
    if lang == base_lang:
        if (ROOT / 'index.html').exists():
            out.append(('home', ROOT / 'index.html'))
        for p in sorted((ROOT / '_pages').glob('*.md')):
            if p.name not in SKIP:
                out.append(('page', p))
        for p in sorted((ROOT / '_posts').rglob('*.md')):
            out.append(('post', p))
    else:
        d = ROOT / lang
        if (d / 'index.html').exists():
            out.append(('home', d / 'index.html'))
        for p in sorted(d.glob('*.md')):
            out.append(('page', p))
        for p in sorted((d / '_posts').rglob('*.md')):
            out.append(('post', p))
    return out


def main():
    cfg = rd(ROOT / '_config.yml')
    bm = re.search(r'^default_lang:\s*(\S+)', cfg, re.M)
    base = bm.group(1).strip('"\'') if bm else 'it'
    lm = re.search(r'^languages:\s*\[([^\]]*)\]', cfg, re.M)
    langs = [x.strip().strip('"\'') for x in lm.group(1).split(',') if x.strip()] if lm else [base]

    base_docs = {}
    for kind, p in collect(base, base):
        m = split(rd(p))
        fm, body = (m.group(1), m.group(2)) if m else ('', rd(p))
        base_docs[ref_of(kind, p, fm)] = lg_hash(body)

    cambiati = 0
    for lang in langs:
        if lang == base:
            continue
        for kind, p in collect(lang, base):
            t = rd(p)
            m = split(t)
            if not m:
                continue
            fm = m.group(1)
            tr = get(fm, 'tr')
            if tr in ('copia', 'da_aggiornare'):
                continue
            ref = ref_of(kind, p, fm)
            trh = get(fm, 'tr_hash')
            if ref not in base_docs or not trh or trh == base_docs[ref]:
                continue
            nl = '\r\n' if '\r\n' in t else '\n'
            if re.search(r'^tr:.*$', fm, re.M):
                newfm = re.sub(r'^tr:.*$', 'tr: da_aggiornare', fm, count=1, flags=re.M)
            else:
                newfm = fm + nl + 'tr: da_aggiornare'
            wr(p, t[:m.start(1)] + newfm + t[m.end(1):])
            cambiati += 1
            print('da_aggiornare:', p.relative_to(ROOT))
    print('Traduzioni segnate da aggiornare:', cambiati)
    return 0


if __name__ == '__main__':
    sys.exit(main())
