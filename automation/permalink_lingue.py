#!/usr/bin/env python3
"""Multilingua: slug dei post tradotti nella lingua giusta (niente /en/en/, niente categoria/titolo italiani).

Per ogni post in <lang>/_posts/*.md SENZA `permalink:` crea
    permalink: /<lang>/<categoria tradotta>/<titolo-slug>/
e mette in `redirect_from` i vecchi indirizzi, cosi' i link gia' condivisi continuano a funzionare.
- categoria tradotta: da _data/i18n/<lang>/categorie.yml (chiave = slug italiano). Se manca resta com'e'.
- titolo-slug: dal `title:` del post (gia' tradotto), senza accenti. Se due titoli coincidono: -2, -3...
- idempotente: i post che hanno gia' `permalink:` non si toccano (modificabile a mano dall'admin).
Lanciato a mano o da .github/workflows/traduzioni.yml.
"""
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, t):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s[:80].strip('-') or 'post'


def cat_map(lang):
    p = ROOT / '_data' / 'i18n' / lang / 'categorie.yml'
    m = {}
    if p.exists():
        for line in rd(p).splitlines():
            mm = re.match(r'^([A-Za-z0-9_\-]+):\s*["\']?([^"\'#]+?)["\']?\s*$', line)
            if mm:
                m[mm.group(1)] = mm.group(2)
    return m


def main():
    langs = [d.name for d in ROOT.iterdir() if d.is_dir() and (d / '_posts').is_dir() and re.fullmatch(r'[a-z]{2}', d.name)]
    for lang in langs:
        cm = cat_map(lang)
        used = set()
        files = sorted((ROOT / lang / '_posts').glob('*.md'))
        # prima i permalink gia' presenti, per evitare collisioni
        for f in files:
            m = re.search(r'^permalink:\s*(\S+)', rd(f), re.M)
            if m:
                used.add(m.group(1).strip('"\''))
        n = 0
        for f in files:
            t = rd(f)
            m = re.match(r'^---(\r?\n)([\s\S]*?)\r?\n---(\r?\n?)([\s\S]*)$', t)
            if not m:
                continue
            nl, fm = m.group(1), m.group(2)
            if re.search(r'^permalink:', fm, re.M):
                continue
            title = re.search(r'^title:\s*(.+)$', fm, re.M)
            title = re.sub(r'^["\']|["\']$', '', title.group(1).strip()) if title else f.stem
            cats = re.findall(r'^\s+-\s*["\']?([^"\'\r\n]+?)["\']?\s*$', (re.search(r'^categories:\s*\r?\n((?:[ \t]+-.*\r?\n?)+)', fm + nl, re.M) or [None, ''])[1], re.M)
            if not cats:
                one = re.search(r'^categories:\s*\[?["\']?([^"\'\]\r\n]+)', fm, re.M)
                cats = [one.group(1).strip()] if one else []
            old_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', f.stem).lower()
            old_cat = '/'.join(cats)
            old = '/%s/%s/%s%s/' % (lang, lang, old_cat + '/' if old_cat else '', old_slug)
            old2 = '/%s/%s%s/' % (lang, old_cat + '/' if old_cat else '', old_slug)
            new_cats = [cm.get(c, c) for c in cats]
            base = '/%s/%s%s/' % (lang, '/'.join(new_cats) + '/' if new_cats else '', slugify(title))
            perm, k = base, 2
            while perm in used:
                perm = base[:-1] + '-%d/' % k
                k += 1
            used.add(perm)
            extra = 'permalink: %s%sredirect_from:%s  - %s%s  - %s' % (perm, nl, nl, old, nl, old2)
            wr(f, '---' + nl + fm.rstrip() + nl + extra + nl + '---' + m.group(3) + m.group(4))
            n += 1
        print('%s: %d post con permalink nuovo' % (lang, n))


if __name__ == '__main__':
    main()
