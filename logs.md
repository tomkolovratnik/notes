---
layout: default
title: JSON logy
parent: Shell & Terminál
nav_order: 7
---

# Zpracování JSON logů (JSON Lines)

Praktické příkazy a techniky pro filtrování, obarvení a analýzu strukturovaných logů ve formátu **JSON Lines** (každý řádek je samostatný JSON objekt).

## Ukázka vstupu

Předpokládáme log soubor `app.log` ve formátu JSON Lines:

```json
{"timestamp":"2026-04-27T10:23:45.123Z","level":"info","message":"Server started","service":"api","port":8080}
{"timestamp":"2026-04-27T10:23:46.456Z","level":"warn","message":"Slow query","service":"db","duration_ms":1240}
{"timestamp":"2026-04-27T10:23:47.789Z","level":"error","message":"Connection failed","service":"api","userId":42}
```

## Doporučené nástroje

| Nástroj | Použití | Platforma |
|---------|---------|-----------|
| [jq](#jq---základ-pro-vše) | Univerzální procesor JSON, filtrování, transformace | Win + WSL ✅ |
| [humanlog](#humanlog---automatické-obarvení) | Automatické obarvení a pretty print JSON logů | Win + WSL ✅ |
| [lnav](#lnav---interaktivní-prohlížeč) | Interaktivní log viewer s podporou JSON | WSL ✅ (Win ⚠️) |

> **Poznámka:** Pro většinu úloh stačí **jq**. Pokud chceš jen rychle "udělat log čitelným", použij **humanlog**. Pro hlubší analýzu a procházení velkých logů je **lnav**.

---

## Instalace

### jq

```bash
# Windows (Scoop) - v Git Bash i PowerShell
scoop install jq

# Windows (Chocolatey)
choco install jq

# WSL / Ubuntu / Debian
sudo apt install jq

# macOS
brew install jq
```

### humanlog

```bash
# Windows (Scoop)
scoop install humanlog

# WSL / Linux - oficiální skript
curl -L "https://humanlog.io/install.sh" | sh

# macOS
brew install humanlogio/tap/humanlog
```

### lnav

```bash
# WSL / Ubuntu / Debian
sudo apt install lnav

# macOS
brew install lnav

# Windows - oficiálně nepodporováno, použij WSL
```

---

## jq - základ pro vše

### Pretty print

```bash
# Pretty print celého souboru
jq '.' app.log                          # Naformátuje a obarví výstup
cat app.log | jq '.'                    # Stejné přes pipe

# Kompaktní výstup (jeden objekt na řádek - vhodné pro další zpracování)
jq -c '.' app.log

# Vynucené barvy (i při přesměrování do pageru)
jq -C '.' app.log | less -R             # -R u less zachová ANSI barvy
```

### Extrakce konkrétních polí

```bash
# Jen timestamp + message (oddělené tabulátorem)
jq -r '[.timestamp, .message] | @tsv' app.log

# Vlastní formát "timestamp [level] message"
jq -r '"\(.timestamp) [\(.level)] \(.message)"' app.log

# Více polí včetně vnořených
jq -r '"\(.timestamp) \(.service) \(.message)"' app.log
```

### Filtrování podle úrovně logu

```bash
# Jen chyby
jq 'select(.level == "error")' app.log

# Errors + warnings
jq 'select(.level == "error" or .level == "warn")' app.log

# Vše KROMĚ debug a info
jq 'select(.level != "debug" and .level != "info")' app.log

# Pomocí pole povolených hodnot
jq 'select(.level | IN("error","warn","fatal"))' app.log
```

### Filtrování podle textu ve zprávě

```bash
# Obsahuje podřetězec (case-sensitive)
jq 'select(.message | contains("Connection"))' app.log

# Case-insensitive (převede na malá písmena)
jq 'select(.message | ascii_downcase | contains("connection"))' app.log

# Regex - test (true/false), match (s detaily)
jq 'select(.message | test("timeout|failed"; "i"))' app.log    # "i" = ignore case

# Vyloučení (negace)
jq 'select(.message | contains("healthcheck") | not)' app.log
```

### Filtrování podle časového rozsahu

ISO 8601 timestampy lze porovnávat **lexikograficky** (jako stringy) - není potřeba převod na čas:

```bash
# Po zadaném čase
jq 'select(.timestamp >= "2026-04-27T10:23:46Z")' app.log

# Časový rozsah (od-do)
jq 'select(.timestamp >= "2026-04-27T10:00:00" and .timestamp < "2026-04-27T11:00:00")' app.log

# Konkrétní hodina (prefix match)
jq 'select(.timestamp | startswith("2026-04-27T10:"))' app.log
```

Pokud potřebuješ relativní čas (např. "posledních 60 minut"), převeď na epoch:

```bash
# Posledních 60 minut (3600 sekund)
jq 'select((.timestamp | fromdateiso8601) > (now - 3600))' app.log

# Mezi dvěma epoch hodnotami
jq --argjson from 1714200000 --argjson to 1714203600 \
   'select((.timestamp | fromdateiso8601) >= $from and (.timestamp | fromdateiso8601) < $to)' app.log
```

### Kombinace filtrů + extrakce polí

```bash
# Errors za posledních 60 minut, výstup jako "čas | service | message"
jq -r '
  select(.level == "error")
  | select((.timestamp | fromdateiso8601) > (now - 3600))
  | "\(.timestamp) | \(.service) | \(.message)"
' app.log

# Najdi error v určité službě a vypiš všechna pole kompaktně
jq -c 'select(.level == "error" and .service == "api")' app.log

# Statistika - počet záznamů podle úrovně
jq -r '.level' app.log | sort | uniq -c | sort -rn
```

### Obarvení podle úrovně logu

jq umí ANSI escape sekvence - můžeme obarvit výstup podle úrovně:

```bash
jq -r '
  def col(c): "\u001b[\(c)m\(.)\u001b[0m";
  .level as $lvl |
  (
    if   $lvl == "error" or $lvl == "fatal" then "31"   # červená
    elif $lvl == "warn"  then "33"                       # žlutá
    elif $lvl == "info"  then "32"                       # zelená
    elif $lvl == "debug" then "36"                       # azurová
    else "37"                                            # bílá
    end
  ) as $color |
  "\(.timestamp) \($lvl | ascii_upcase | col($color)) \(.service) - \(.message)"
' app.log
```

**ANSI barevné kódy** (pro vlastní úpravu):
- `30`-`37` = standardní barvy (černá, červená, zelená, žlutá, modrá, fialová, azurová, bílá)
- `90`-`97` = jasné varianty
- `1` = tučné, `0` = reset

### Sloučení více log souborů a seřazení podle času

```bash
# Sloučí všechny .log soubory, seřadí podle timestamp, výstup řádek po řádku
cat *.log | jq -s -c 'sort_by(.timestamp) | .[]'

# Totéž, ale jen errors a v lidsky čitelné podobě
cat service-*.log | jq -s -r '
  sort_by(.timestamp)
  | .[]
  | select(.level == "error")
  | "\(.timestamp) [\(.service)] \(.message)"
'
```

> `-s` (slurp) načte celý vstup do paměti jako pole. Pro **opravdu velké** soubory raději pre-filtruj jednotlivé soubory a slévej až menší výstup.

### Převod na CSV/TSV pro Excel

```bash
# Hlavička + data jako TSV
{
  echo -e "timestamp\tlevel\tservice\tmessage"
  jq -r '[.timestamp, .level, .service, .message] | @tsv' app.log
} > app.tsv

# CSV
jq -r '[.timestamp, .level, .service, .message] | @csv' app.log > app.csv
```

---

## humanlog - automatické obarvení

Nástroj, který automaticky převede strukturované logy (JSON, logfmt) na čitelný obarvený výstup. Nemusíš psát žádné jq výrazy.

```bash
# Základní použití - prostě "prohnat" logy přes humanlog
cat app.log | humanlog

# Filtrování přes pipe
cat app.log | jq -c 'select(.level == "error")' | humanlog

# Tail-like - sleduj přírůstek souboru
tail -f app.log | humanlog          # poznámka: pokud sledování nepotřebuješ, vynech
```

Výstup obsahuje obarvené úrovně, zvýrazněné klíče a zkrácený timestamp.

---

## lnav - interaktivní prohlížeč

Pokročilý log viewer s podporou JSON, fulltextovým hledáním, SQL dotazy nad logy a automatickou detekcí formátu. **Doporučeno pouštět ve WSL.**

```bash
# Otevře interaktivně - ovládání jako less, ale s indexací
lnav app.log

# Více souborů najednou (lnav je sloučí podle času)
lnav service1.log service2.log

# SQL dotaz nad logy (lnav indexuje pole jako sloupce)
lnav -n -c ';SELECT log_time, log_level, log_body FROM app_log WHERE log_level = "error"' app.log
```

**Klávesové zkratky v lnav:**
- `/` - vyhledávání (regex)
- `:filter-in <regex>` - zobrazit jen řádky odpovídající regexu
- `:filter-out <regex>` - skrýt řádky odpovídající regexu
- `e` / `E` - další / předchozí error
- `w` / `W` - další / předchozí warning
- `q` - konec

---

## Užitečné funkce do ~/.bashrc

Pokud tyto operace děláš často, ulož si funkce do `~/.bashrc` (resp. `~/.bash_profile` v Git Bash):

```bash
# Pretty print + obarvení JSON logu podle úrovně
logview() {
  jq -r '
    def col(c): "\u001b[\(c)m\(.)\u001b[0m";
    .level as $lvl |
    (
      if   $lvl == "error" or $lvl == "fatal" then "31"
      elif $lvl == "warn"  then "33"
      elif $lvl == "info"  then "32"
      elif $lvl == "debug" then "36"
      else "37"
      end
    ) as $color |
    "\(.timestamp) \($lvl | ascii_upcase | col($color)) \(.service // "-") - \(.message)"
  ' "$@" | less -R
}

# Jen errors + warnings
logerr() {
  jq -c 'select(.level == "error" or .level == "warn" or .level == "fatal")' "$@"
}

# Errors za posledních N minut (default 60)
logrecent() {
  local mins="${2:-60}"
  jq -r --argjson m "$mins" '
    select((.timestamp | fromdateiso8601) > (now - $m * 60))
    | "\(.timestamp) [\(.level)] \(.message)"
  ' "$1"
}

# Sloučení více logů seřazených podle času
logmerge() {
  cat "$@" | jq -s -c 'sort_by(.timestamp) | .[]'
}
```

Po úpravě nezapomeň `source ~/.bashrc`.

**Použití:**

```bash
logview app.log                     # Obarvený výpis v pageru
logerr app.log                      # Jen errors a warnings
logrecent app.log 30                # Posledních 30 minut
logmerge svc1.log svc2.log | logview
```
