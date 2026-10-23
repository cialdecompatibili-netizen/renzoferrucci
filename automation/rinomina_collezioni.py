import json, re, pathlib
root = pathlib.Path(r"C:\Users\mirco\Desktop\repository\renzoferrucci")
M = {
 "giove":   ("Giove","Aventino","Giacca doppiopetto in cashmere"),
 "saturno": ("Giove","Flaminia","Cappotto lungo in lana double-face"),
 "marte":   ("Giove","Testaccio","Camicia in lino sabbia"),
 "apollo":  ("Giove","Pincio","Polo in seta e cotone"),
 "mercurio":("Vulcano","Monti","Sneaker in pelle di vitello"),
 "plutone": ("Vulcano","Capitolino","Borsa in pelle pieno fiore"),
 "vulcano": ("Vulcano","Sallustiano","Cintura in cuoio vegetale"),
 "venere":  ("Venere","Trastevere","Abito midi in seta"),
 "diana":   ("Venere","Parioli","Blazer sartoriale in lana fresca"),
 "aurora":  ("Venere","Borgo","Blusa in seta lavata"),
 "vesta":   ("Venere","Gianicolo","Abito lungo in raso di seta"),
 "nettuno": ("Nettuno","Tevere","Foulard in twill di seta blu"),
 "luna":    ("Nettuno","Pantheon","Pochette in satin di seta"),
 "urano":   ("Nettuno","Ripetta","Occhiali da sole in acetato"),
}
p = root/"_data"/"catalogo.json"
d = json.loads(p.read_text(encoding="utf-8"))
for x in d["prodotti"]:
    if x["id"] in M:
        c, n, capo = M[x["id"]]
        base = x["descrizione"]
        x["nome"] = f"{n} – {capo}"
        x["descrizione"] = f"Collezione {c} · {base} Made in Rome."
        x["descrizione_completa"] = f"Collezione {c}.\n{x['descrizione_completa']}\nTagliato e cucito a Roma: la sartoria romana incontra una linea contemporanea, pulita, senza tempo."
        x["collezione"] = c
    elif x["id"] == "appia":
        x["collezione"] = "Giunone"
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
for x in d["prodotti"]:
    f = root/"_negozio"/f"{x['id']}.md"
    if f.exists():
        t = f.read_text(encoding="utf-8")
        t = re.sub(r'^title:.*$', 'title: "%s"' % x["nome"].replace('"', "'"), t, count=1, flags=re.M)
        f.write_text(t, encoding="utf-8")
    print(x["id"], "->", x["nome"])
