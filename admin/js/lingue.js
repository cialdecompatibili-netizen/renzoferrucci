// ===== LINGUE (multilingua) =====
// Modello: lingua base (default_lang) + traduzioni collegate dallo stesso `ref`.
// Pagine/articoli della lingua L (diversa dalla base) stanno in <L>/ (pagine) e <L>/_posts (articoli).
// Flag nel front matter: tr: copia | tradotto | da_aggiornare ; tr_hash = hash del testo base quando e' stato tradotto.
// Una sola commit per operazione (Git Data API). Vedi CLAUDE.md "PIANO MULTILINGUA".

const LG = { base: 'it', langs: ['it'], names: { it: 'Italiano', en: 'English', de: 'Deutsch', fr: 'Fran\u00e7ais', es: 'Espa\u00f1ol' }, docs: {}, branch: 'main', tree: [], blobs: {} };
const LG_SKIP = ['404.md', 'categories-redirect.md', 'cat-list.md', 'category-archive.md', 'tag-archive.md', 'year-archive.md'];
const LG_DATA = ['navigation.yml', 'sottomenu.yml', 'shop_nav.yml'];

async function lgApi(path, opt) {
  const r = await fetch('https://api.github.com/repos/' + REPO + '/' + path, Object.assign({ headers: { 'Authorization': 'token ' + tok(), 'Content-Type': 'application/json' } }, opt || {}));
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}
async function lgTree() {
  const repo = await lgApi('');
  LG.branch = repo.default_branch;
  const ref = await lgApi('git/ref/heads/' + LG.branch);
  LG.headSha = ref.object.sha;
  const commit = await lgApi('git/commits/' + LG.headSha);
  LG.baseTree = commit.tree.sha;
  const t = await lgApi('git/trees/' + LG.baseTree + '?recursive=1');
  LG.tree = t.tree.filter(x => x.type === 'blob');
}
async function lgText(sha) {
  if (LG.blobs[sha] !== undefined) return LG.blobs[sha];
  const b = await lgApi('git/blobs/' + sha);
  LG.blobs[sha] = dec(b.content);
  return LG.blobs[sha];
}
function lgFile(path) { return LG.tree.find(x => x.path === path); }
async function lgReadPath(path) { const f = lgFile(path); return f ? lgText(f.sha) : null; }

function lgSplit(t) { const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/); return m ? { fm: m[1], body: m[2] } : { fm: '', body: t }; }
function lgGet(fm, k) { const m = fm.match(new RegExp('^' + k + ':[ \\t]*(.*)$', 'm')); return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''; }
function lgSet(fm, k, v) { const re = new RegExp('^' + k + ':.*$', 'm'); const line = k + ': ' + v; return re.test(fm) ? fm.replace(re, line) : (fm ? fm + '\n' : '') + line; }
function lgDel(fm, k) { return fm.replace(new RegExp('^' + k + ':.*\\r?\\n?', 'mg'), ''); }
function lgHash(s) { s = (s || '').replace(/\r/g, '').trim(); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function lgEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function lgPathsFor(lang) {
  const base = lang === LG.base;
  const out = [];
  LG.tree.forEach(f => {
    const p = f.path;
    if (base) {
      if (p === 'index.html') out.push({ path: p, kind: 'home' });
      else if (/^_pages\/[^\/]+\.md$/.test(p) && !LG_SKIP.includes(p.split('/')[1])) out.push({ path: p, kind: 'page' });
      else if (/^_posts\/(?:.+\/)?[^\/]+\.md$/.test(p)) out.push({ path: p, kind: 'post' });
    } else {
      if (p === lang + '/index.html') out.push({ path: p, kind: 'home' });
      else if (new RegExp('^' + lang + '/[^/]+\\.md$').test(p)) out.push({ path: p, kind: 'page' });
      else if (new RegExp('^' + lang + '/_posts/[^/]+\\.md$').test(p)) out.push({ path: p, kind: 'post' });
    }
  });
  return out;
}
function lgRefFrom(item, fm) {
  const r = lgGet(fm, 'ref'); if (r) return r;
  const fn = item.path.split('/').pop();
  if (item.kind === 'home') return 'home';
  if (item.kind === 'post') return fn.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  return fn.replace(/\.md$/, '');
}
async function lgPool(items, fn, n) {
  const res = []; let i = 0;
  await Promise.all(Array.from({ length: n || 8 }, async () => { while (i < items.length) { const k = i++; res[k] = await fn(items[k]); } }));
  return res;
}
async function lgLoadDocs() {
  await lgTree();
  const cfg = (await lgReadPath('_config.yml')) || '';
  const bm = cfg.match(/^default_lang:\s*(\S+)/m); LG.base = bm ? bm[1].replace(/["']/g, '') : 'it';
  const lm = cfg.match(/^languages:\s*\[([^\]]*)\]/m); LG.langs = lm ? lm[1].split(',').map(s => s.trim().replace(/["']/g, '')).filter(Boolean) : [LG.base];
  if (!LG.langs.includes(LG.base)) LG.langs.unshift(LG.base);
  const lyml = await lgReadPath('_data/languages.yml');
  if (lyml) { const re = /^([a-z-]+):\s*\r?\n\s+name:\s*(.+)$/gm; let m; while ((m = re.exec(lyml))) LG.names[m[1]] = m[2].trim().replace(/["']/g, ''); }
  LG.docs = {};
  for (const lang of LG.langs) {
    const items = lgPathsFor(lang);
    const loaded = await lgPool(items, async it => {
      const t = await lgReadPath(it.path); const s = lgSplit(t || '');
      return { lang, path: it.path, kind: it.kind, sha: lgFile(it.path).sha, fm: s.fm, body: s.body, text: t, ref: lgRefFrom(it, s.fm), title: lgGet(s.fm, 'title') || lgRefFrom(it, s.fm), tr: lgGet(s.fm, 'tr'), trHash: lgGet(s.fm, 'tr_hash'), hash: lgHash(s.body) };
    });
    LG.docs[lang] = {}; loaded.forEach(d => { LG.docs[lang][d.ref] = d; });
  }
}

function lgStato(lang, ref) {
  if (lang === LG.base) return LG.docs[lang][ref] ? 'originale' : 'manca';
  const d = LG.docs[lang][ref]; if (!d) return 'manca';
  const b = LG.docs[LG.base][ref];
  if (d.tr === 'copia') return 'copia';
  if (d.tr === 'da_aggiornare') return 'da_aggiornare';
  if (b && d.trHash && d.trHash !== b.hash) return 'da_aggiornare';
  return 'tradotto';
}

// ---- costruzione di una copia in un'altra lingua ----
function lgBuildDoc(src, dst, srcLang) {
  let fm = src.fm;
  const srcPerm = lgGet(fm, 'permalink');
  ['permalink', 'lang', 'locale', 'ref', 'tr', 'tr_hash', 'redirect_from', 'sitemap'].forEach(k => { fm = lgDel(fm, k); });
  fm = fm.replace(/\s+$/, '');
  const fn = src.path.split('/').pop();
  let path, perm = null;
  if (src.kind === 'home') { path = dst + '/index.html'; perm = '/' + dst + '/'; }
  else if (src.kind === 'page') {
    path = dst + '/' + fn;
    let p = srcPerm || '/' + fn.replace(/\.md$/, '') + '/';
    if (srcLang !== LG.base) p = p.replace(new RegExp('^/' + srcLang + '/'), '/');
    perm = '/' + dst + (p.startsWith('/') ? p : '/' + p);
  } else { path = dst + '/_posts/' + fn; }
  fm = lgSet(fm, 'ref', src.ref); fm = lgSet(fm, 'lang', dst); fm = lgSet(fm, 'locale', dst);
  fm = lgSet(fm, 'tr', 'copia'); fm = lgSet(fm, 'sitemap', 'false'); fm = lgSet(fm, 'tr_hash', lgHash(lgBaseBody(src)));
  if (perm) fm = lgSet(fm, 'permalink', perm);
  return { path, content: '---\n' + fm + '\n---\n' + src.body };
}
function lgBaseBody(src) { const b = LG.docs[LG.base] && LG.docs[LG.base][src.ref]; return b ? b.body : src.body; }
// se l'origine non ha `ref`, lo aggiungiamo (serve a collegare le versioni)
function lgAddRef(src) {
  if (lgGet(src.fm, 'ref')) return null;
  return { path: src.path, content: '---\n' + lgSet(src.fm, 'ref', src.ref) + '\n---\n' + src.body };
}

async function lgCommit(entries, message) {
  const tree = [];
  await lgPool(entries, async e => {
    const b = await lgApi('git/blobs', { method: 'POST', body: JSON.stringify({ content: e.content, encoding: 'utf-8' }) });
    tree.push({ path: e.path, mode: '100644', type: 'blob', sha: b.sha });
  }, 6);
  const t = await lgApi('git/trees', { method: 'POST', body: JSON.stringify({ base_tree: LG.baseTree, tree }) });
  const c = await lgApi('git/commits', { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: [LG.headSha] }) });
  await lgApi('git/refs/heads/' + LG.branch, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
}

function lgYmlUrls(txt, src, dst) {
  if (src === LG.base) return txt.replace(/(url:\s*["']?)\/(?!\/)/g, '$1/' + dst + '/');
  return txt.replace(new RegExp('(url:\\s*["\']?)/' + src + '/', 'g'), '$1/' + dst + '/');
}
function lgUiBlock(ui, code) {
  const m = ui.match(/^en:[^\n]*\n(?:(?![^\s#\n]).*\n?)*/m);
  if (!m) return '';
  return m[0].replace(/^en:[^\n]*/, code + ':').replace(/\s+$/, '') + '\n';
}

async function lgNuova() {
  const code = document.getElementById('lg-code').value.trim().toLowerCase();
  const src = document.getElementById('lg-src').value;
  if (!/^[a-z]{2}(-[a-z]{2})?$/.test(code)) return showMsg('msg-lingue', 'Codice non valido (es. en, de, fr)', 'err');
  if (LG.langs.includes(code)) return showMsg('msg-lingue', 'Lingua gia\' presente', 'err');
  try {
    showMsg('msg-lingue', 'Clono da ' + src + '...', 'ok');
    await lgLoadDocs();
    const entries = []; const seen = {};
    const add = e => { if (e && !seen[e.path]) { seen[e.path] = 1; entries.push(e); } };
    Object.values(LG.docs[src]).forEach(d => {
      add(lgBuildDoc(d, code, src));
      if (src === LG.base) add(lgAddRef(d));
    });
    for (const f of LG_DATA) {
      const sp = src === LG.base ? '_data/' + f : '_data/i18n/' + src + '/' + f;
      const t = await lgReadPath(sp);
      if (t) add({ path: '_data/i18n/' + code + '/' + f, content: lgYmlUrls(t, src, code) });
    }
    let ui = await lgReadPath('_data/ui-text.yml');
    if (ui && !new RegExp('^' + code + ':', 'm').test(ui)) { const blk = lgUiBlock(ui, code); if (blk) add({ path: '_data/ui-text.yml', content: ui.replace(/\s+$/, '') + '\n\n' + blk }); }
    let lyml = await lgReadPath('_data/languages.yml');
    if (lyml !== null && !new RegExp('^' + code + ':', 'm').test(lyml)) add({ path: '_data/languages.yml', content: lyml.replace(/\s+$/, '') + '\n' + code + ':\n  name: ' + (LG.names[code] || code.toUpperCase()) + '\n' });
    let cfg = await lgReadPath('_config.yml');
    cfg = cfg.replace(/^languages:.*$/m, 'languages: [' + LG.langs.concat([code]).join(', ') + ']');
    const scope = '  - scope:\n      path: "' + code + '"\n    values:\n      lang: ' + code + '\n      locale: ' + code + '\n  - scope:\n      path: "' + code + '"\n      type: pages\n    values:\n      layout: single\n  - scope:\n      path: "' + code + '"\n      type: posts\n    values:\n      layout: single\n      permalink: /' + code + '/:categories/:title/\n';
    cfg = cfg.replace(/^(  # LANG-DEFAULTS[^\r\n]*\r?\n)/m, '$1' + scope);
    add({ path: '_config.yml', content: cfg });
    await lgCommit(entries, 'Multilingua: nuova lingua ' + code + ' clonata da ' + src);
    showMsg('msg-lingue', 'Lingua ' + code + ' creata (' + entries.length + ' file). Il sito si aggiorna tra 1-2 minuti: tutte le pagine sono "copia" da tradurre.', 'ok');
    caricaLingue(true);
  } catch (e) { showMsg('msg-lingue', 'Errore: ' + e.message, 'err'); }
}

async function lgCreaCopia(dst, ref) {
  try {
    showMsg('msg-lingue', 'Creo la copia...', 'ok');
    await lgLoadDocs();
    let src = LG.docs[LG.base][ref]; if (!src) throw new Error('originale non trovato');
    const entries = [lgBuildDoc(src, dst, LG.base)]; const r = lgAddRef(src); if (r) entries.push(r);
    await lgCommit(entries, 'Multilingua: copia ' + ref + ' in ' + dst);
    showMsg('msg-lingue', 'Copia creata in ' + dst + '.', 'ok'); caricaLingue(true);
  } catch (e) { showMsg('msg-lingue', 'Errore: ' + e.message, 'err'); }
}
async function lgSegna(lang, ref) {
  try {
    const d = LG.docs[lang][ref]; const b = LG.docs[LG.base][ref];
    let fm = lgDel(lgSet(lgSet(d.fm, 'tr', 'tradotto'), 'tr_hash', lgHash(b ? b.body : d.body)), 'sitemap').replace(/\s+$/, '');
    await lgCommit([{ path: d.path, content: '---\n' + fm + '\n---\n' + d.body }], 'Multilingua: ' + ref + ' (' + lang + ') segnata come tradotta');
    showMsg('msg-lingue', 'Segnata come tradotta.', 'ok'); caricaLingue(true);
  } catch (e) { showMsg('msg-lingue', 'Errore: ' + e.message, 'err'); }
}

async function caricaLingue(force) {
  const box = document.getElementById('lg-tab');
  if (!tok()) { box.innerHTML = '<span style="color:#c62828">Serve il token GitHub (voce Token).</span>'; return; }
  box.innerHTML = '<span style="color:#999">Carico...</span>';
  try {
    await lgLoadDocs();
    const sel = document.getElementById('lg-src'); sel.innerHTML = LG.langs.map(l => '<option value="' + l + '">' + lgEsc(LG.names[l] || l) + ' (' + l + ')</option>').join('');
    document.getElementById('lg-codes').innerHTML = Object.keys(LG.names).filter(k => !LG.langs.includes(k)).map(k => '<option value="' + k + '">' + lgEsc(LG.names[k]) + '</option>').join('');
    const refs = []; const baseDocs = Object.values(LG.docs[LG.base]);
    ['home', 'page', 'post'].forEach(k => baseDocs.filter(d => d.kind === k).forEach(d => refs.push(d)));
    const col = { originale: ['#2e7d32', 'Originale'], tradotto: ['#2e7d32', 'Tradotto'], da_aggiornare: ['#b26a00', 'Da aggiornare'], copia: ['#c62828', 'Copia da tradurre'], manca: ['#999', 'Manca'] };
    let h = '<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr><th style="text-align:left;padding:6px">Contenuto</th>' + LG.langs.map(l => '<th style="padding:6px">' + lgEsc(LG.names[l] || l) + '</th>').join('') + '</tr>';
    refs.forEach(b => {
      h += '<tr style="border-top:1px solid #eee"><td style="padding:6px">' + (b.kind === 'post' ? 'Articolo: ' : b.kind === 'home' ? 'Home: ' : 'Pagina: ') + lgEsc(b.title) + '</td>';
      LG.langs.forEach(l => {
        const s = lgStato(l, b.ref); const d = LG.docs[l][b.ref]; const c = col[s];
        let a = '<span style="color:' + c[0] + ';font-weight:600">' + c[1] + '</span>';
        if (d) a += ' <a href="https://github.com/' + REPO + '/edit/' + LG.branch + '/' + d.path + '" target="_blank" style="font-size:11px">modifica</a>';
        if (l !== LG.base && (s === 'copia' || s === 'da_aggiornare')) a += ' <button class="btn btn-secondary btn-sm" onclick="lgSegna(\'' + l + '\',\'' + b.ref.replace(/'/g, "\\'") + '\')">Segna tradotto</button>';
        if (l !== LG.base && s === 'manca') a += ' <button class="btn btn-secondary btn-sm" onclick="lgCreaCopia(\'' + l + '\',\'' + b.ref.replace(/'/g, "\\'") + '\')">Crea copia</button>';
        h += '<td style="padding:6px;text-align:center">' + a + '</td>';
      });
      h += '</tr>';
    });
    box.innerHTML = h + '</table></div>';
  } catch (e) { box.innerHTML = '<span style="color:#c62828">Errore: ' + lgEsc(e.message) + '</span>'; }
}
