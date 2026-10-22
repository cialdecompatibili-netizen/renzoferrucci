# edilextreme4

Sito Jekyll su GitHub Pages: https://cialdecompatibili-netizen.github.io/edilextreme4/

## Cose che funzionano
- Skill Impeccable (design): installata a livello progetto con `npx --yes impeccable install --providers=claude --scope=project` dalla radice del progetto. I flag evitano le domande interattive. Dopo l'installazione, in Claude Code (anche nella scheda Code di Claude Desktop) lanciare `/impeccable init`.
- Controllo design senza LLM: `npx impeccable detect --json _layouts _includes index.html` (trova per esempio testo con contrasto sotto 4.5:1).- La home e' fatta di blocchi in `_data/blocks_home.json` (campi id, nome, enabled, html), letti anche dall'admin: modificare solo il contenuto di `html`, mai la struttura. Fare prima un backup e verificare il JSON riletto dopo la scrittura.
- Se una sessione si interrompe a meta' (limite messaggi), prima di rifare un lavoro controllare cosa e' gia' stato scritto: `read_file` sul file e `git status --short` nella cartella del progetto. Spesso la scrittura e' andata a buon fine e manca solo commit e push.
- Il vecchio sito renzoferrucci.com ha il certificato scaduto: Invoke-WebRequest e Scrape falliscono, funziona `curl.exe -k -L -A "Mozilla/5.0" -o file.html https://renzoferrucci.com/...` (salvare in claudetemp\data\rf). Cosi' si legge l'HTML originale, per esempio `<aside id="sidebar">`.
- Barra laterale degli articoli: `_includes/post-sidebar.html`, inclusa da `_layouts/single.html` solo se `page.collection == "posts"`. Il riquadro foto in cima compare solo se `foto` e' compilata in `_data/sidebar.yml`. Le rubriche sono lette da `_data/sottomenu.yml` (chiave Journal).
- Controllo visivo dopo il deploy: attendere circa 75 secondi, poi `chrome.exe --headless=new --window-size=1440,1500 --virtual-time-budget=8000 --screenshot=... <url>?v=<commit>` e aprire il png con read_file.
- Comandi PowerShell molto lunghi falliscono (limite della riga di comando): salvare lo script in un file .ps1 e lanciarlo con `powershell -NoProfile -ExecutionPolicy Bypass -File`.
- Anteprima prima di pubblicare: creare un HTML statico con i blocchi e fare lo screenshot con `chrome.exe --headless=new --screenshot=... --window-size=1440,3000`. La larghezza minima di Chrome headless e' 500 px, sotto viene ritagliata.
- Il motore binario di Impeccable non e' nel repo (e' in .gitignore): si riscarica al primo uso.
- Servizi: pagine in `_servizi/` (collection), card "Altri servizi" in fondo da `_includes/servizi-correlati.html` richiamato in `_layouts/single.html` (solo `page.collection == "servizi"`). In Liquid NON scrivere `a contains b == false` (viene letto male): usare `{% if a contains b %}{% continue %}{% endif %}`.
- La build locale (`bundle exec jekyll build`) non parte su questo PC (manca la gemma github-pages): si controlla dopo il deploy sul sito online.

- Il detector su cartella (`npx impeccable detect .`) NON legge i blocchi di `_data/blocks_home.json`: per controllare la home scansionare l'URL online (`npx impeccable detect --json <url>`) dopo il deploy. In PowerShell 5 il JSON restituito e' un array annidato: scorrerlo con due foreach.

## Da sistemare
- I pulsanti "Richiedi preventivo" (blocchi pricing e cta) hanno href="#": manca un contatto reale (modulo, mail, telefono o WhatsApp).
- I blocchi pricing e cta dicono quasi la stessa cosa uno dopo l'altro.

- Menu: voci principali in _data/navigation.yml, tendine in _data/sottomenu.yml (chiave = title della voce). L'admin > Menu gestisce entrambi (bottone Sottomenu su ogni riga, un solo livello, separatori, riordino); salvando riscrive i due file e conserva il commento in testa a sottomenu.yml.

## Pubblicare e pagine fatte (ottobre 2026)
- Pubblicare con `..\pubblica.ps1` (vedi `..\claude.md`), sempre con `-Files` espliciti: in questa repo `agentold.md`, `wb.ps1`, `wb2.ps1` risultano modificati e NON vanno committati.
- Foto: `assets/images/andrew-imprenditore.jpg` (pagina Chi sono) e `assets/images/bio-photo.jpg` (avatar autore, ritaglio quadrato sul viso, reso tondo da CSS in `assets/css/main.scss`). Originale: Downloads\andrew imprenditore.jpg.
- Autore (colonna destra articoli) in `_config.yml`: `author.home: "/chi-sono/"` porta foto e nome alla pagina Chi sono. Link in `author.links`, in ordine: WhatsApp (priorita'), Email (/contatti/), poi Sito web, Twitter, GitHub, Instagram con `url: "#"` per ora.
- Contatti (`_pages/contatti.md`): bottone WhatsApp, numero +39 328 197 0254 (`site.whatsapp` = 393281970254 in `_config.yml`), modulo email con campo telefono facoltativo (finisce in coda al messaggio). Testi centrati.
- Shop disattivato (pagine con `published: false`, prodotti `output: false`); nel menu c'e' "Chi sono". Per riattivare: togliere `published: false` e rimettere `output: true`.
- Test visivo: Chrome headless per screenshot; da provare la verifica automatica con Windows-MCP.
## Regola token/tempo (da Mirco, ottobre 2026)
- Dopo il push NON aspettare la build e NON fare controlli live/polling se non richiesti: Mirco verifica da solo e i token sono contati. `pubblica.ps1` di default fa solo pull, commit e push; `-Aspetta` (con `-Url`/`-Cerca`) solo se serve davvero.
- Spesso Mirco ha un'altra sessione che committa/pusha sulla stessa repo: se `pubblica.ps1` dice "Niente da committare", controllare `git log -3` prima di rifare.
- Fare le modifiche in una sola chiamata, risposte brevissime.
## Regola di design (da Mirco, ottobre 2026)
- MAI bordi laterali colorati (border-left verde oliva o simili) su box, citazioni, avvisi, strisce CTA: sembrano fatti da un'IA. Nessuna barretta colorata a sinistra, mai. Usare box puliti con sfondo leggero o bordo uniforme.

## Regola eta' e date automatiche (da Mirco, ottobre 2026)
- MAI scrivere a mano eta' o "da N anni": si aggiornano da sole. Eta' persona: `<span data-eta="AAAA-MM-GG">N</span> anni`; anni da una data: `<span data-anni-da="AAAA">N</span> anni`. Lo script e' in fondo a `_includes/footer/custom.html` (commentato). Data di nascita ignota: scrivere "non nota".
- Video YouTube: iframe dentro `<div class="video-shortcode">` (CSS 16:9 in main.scss). Prima di tenere un video controllare che esista: `https://www.youtube.com/oembed?url=<watch url>&format=json` (401/404 = rotto, da togliere).
- Foto: mai `data:image` lazyload di Avada (l'immagine vera e' in `data-orig-src`); salvarle sempre in `assets/posts/<slug>/`.
## PIANO MULTILINGUA (ottobre 2026) - da riprendere se si interrompe
Obiettivo (Mirco): IT alla radice, altre lingue in sottocartelle (/en/, /de/...) create in automatico dall'admin e lette in automatico dal sito, cosi' il cloning dei siti e' immediato. Senza plugin Jekyll (GitHub Pages).
Modello (ispirato a WPML/Polylang/TranslatePress): lingua principale + traduzioni collegate, clona da lingua esistente, stato per pagina e lingua, selettore lingua solo se la traduzione esiste.
- Lingua: `lang` nel front matter, assegnato da `defaults` in `_config.yml` per path (`en/` -> lang en). `languages: [it, en]` e `default_lang: it` in `_config.yml`.
- Collegamento: `ref: <slug-univoco>` uguale in tutte le versioni della stessa pagina/articolo.
- Flag traduzione (front matter): `tr: copia | tradotto | da_aggiornare`; `tr_hash` = hash del contenuto originale al momento della traduzione. Se cambia l'originale e l'hash non combacia -> `da_aggiornare`.
- Testi interfaccia: `_data/i18n/<lang>.yml` (partire da `_data/ui-text.yml`), include con `site.data.i18n[page.lang]`.
- Selettore lingua + `hreflang` generati dai `ref`; selettore visibile solo se la traduzione esiste.
- Articoli: `_posts` (it) e `en/_posts` (en), stesso meccanismo.
FASE 1 (motore): config, defaults, `_data/i18n`, selettore lingua, hreflang, navigazione per lingua.
FASE 2 (admin): voce "Lingue" nel menu a sinistra (`admin/index.html` + nuovo `admin/js/lingue.js`): elenco lingue attive, "Nuova lingua" con scelta della lingua da cui clonare (copia pagine, articoli, testi in `/xx/`, imposta `tr: copia` e `ref`), tabella di stato (riga per pagina, colonna per lingua, verde/giallo/rosso, clic apre l'editor), pulsante per segnare "tradotto", traduzione automatica opzionale.
FASE 3: rilevamento automatico `da_aggiornare` quando cambia l'originale; documentare nel clone (cambiare solo `_config.yml`).
Stato fasi: FASE 1 motore FATTO (22/10/2026): locale: it + default_lang + languages in _config.yml; ui-text.yml ora ha chiavi it (italiano) e en (inglese del tema); masthead legge _data/i18n/<lang>/{navigation,sottomenu,shop_nav}.yml se esiste (cache per locale gia' gestita dal tema); hreflang + noindex per 	r: copia in head/custom.html; selettore lingua (solo se esiste traduzione con stesso ef) in footer/custom.html; _data/languages.yml con i nomi; ef: home su index.html.
FASE 1b FATTA in parte (22/10/2026): `lang: it` di default su tutto in _config.yml (scope path "" in LANG-DEFAULTS, quello della lingua lo sovrascrive); elenchi post (page__related, post-sidebar, categories, single, blog, categoria) filtrati con `posts_l = site.posts | where: "lang", page.lang`. Restano: scope en in defaults + permalink post /en/, collezioni servizi/progetti (le cartelle collection sono solo alla radice: per le traduzioni usare sottocartella dentro la collection + permalink), category-archive, sitemap/feed, `ref` sulle pagine italiane. (Elenco originale:) scope lingua in defaults (path=cartella, values lang+locale; posts con permalink /xx/:categories/:title/), filtrare per lingua gli elenchi che usano site.posts/site.pages (blog.md, home-content, page__related, post-sidebar, sitemap/feed), ef sulle pagine italiane.
FASE 2 admin: non iniziata.
ATTENZIONE PowerShell: non chiamare le proprie funzioni RD/WR/CD/LS... sono alias (RD = Remove-Item e cancella i file!).

