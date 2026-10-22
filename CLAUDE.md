# edilextreme4

Sito Jekyll su GitHub Pages: https://cialdecompatibili-netizen.github.io/edilextreme4/

## Cose che funzionano
- Skill Impeccable (design): installata a livello progetto con `npx --yes impeccable install --providers=claude --scope=project` dalla radice del progetto. I flag evitano le domande interattive. Dopo l'installazione, in Claude Code (anche nella scheda Code di Claude Desktop) lanciare `/impeccable init`.
- Controllo design senza LLM: `npx impeccable detect --json _layouts _includes index.html` (trova per esempio testo con contrasto sotto 4.5:1).- La home e' fatta di blocchi in `_data/blocks_home.json` (campi id, nome, enabled, html), letti anche dall'admin: modificare solo il contenuto di `html`, mai la struttura. Fare prima un backup e verificare il JSON riletto dopo la scrittura.
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
