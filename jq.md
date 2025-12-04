# jq - JSON procesor

Příkazový nástroj pro zpracování a transformaci JSON dat.

## Instalace

```bash
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq

# Windows (Chocolatey)
choco install jq

# Windows (Scoop)
scoop install jq
```

## Základní použití

```bash
# Pretty print (formátování JSON)
cat file.json | jq '.'

# Přímé zpracování souboru
jq '.' file.json

# Zpracování výstupu příkazu (např. curl)
curl -s https://api.example.com/data | jq '.'

# Kompaktní výstup (bez formátování)
jq -c '.' file.json
```

## Extrakce hodnot

```bash
# Získání hodnoty klíče
jq '.name' file.json                    # Vrátí hodnotu klíče "name"

# Vnořený objekt
jq '.user.address.city' file.json       # Přístup k vnořeným hodnotám

# Raw output (bez uvozovek u stringů)
jq -r '.name' file.json                 # Výstup: John (místo "John")

# Více hodnot najednou
jq '.name, .age' file.json              # Vrátí name a age
```

## Práce s poli

```bash
# Celé pole
jq '.items' file.json                   # Vrátí pole items

# Konkrétní prvek pole (indexováno od 0)
jq '.items[0]' file.json                # První prvek
jq '.items[-1]' file.json               # Poslední prvek

# Rozsah prvků
jq '.items[0:3]' file.json              # Prvky 0, 1, 2

# Iterace přes všechny prvky pole
jq '.items[]' file.json                 # Každý prvek na novém řádku

# Délka pole
jq '.items | length' file.json          # Počet prvků
```

## Filtry a transformace

```bash
# Výběr konkrétních polí z objektů v poli
jq '.users[] | {name, email}' file.json

# Vytvoření nového objektu
jq '{userName: .name, userAge: .age}' file.json

# Mapování přes pole
jq '.items | map(.price * 2)' file.json # Zdvojnásobí všechny ceny

# Filtrování pole (select)
jq '.users[] | select(.age > 18)' file.json         # Uživatelé starší 18
jq '.items[] | select(.name | contains("test"))' file.json  # Položky obsahující "test"
```

## Podmínky a logika

```bash
# If-then-else
jq 'if .age > 18 then "adult" else "minor" end' file.json

# Alternativní hodnota (pokud je null)
jq '.name // "Unknown"' file.json       # Vrátí "Unknown" pokud name je null

# Porovnání
jq '.items[] | select(.price >= 100 and .price <= 500)' file.json

# Negace
jq '.items[] | select(.active != true)' file.json
```

## Agregace a statistiky

```bash
# Počet prvků
jq '.items | length' file.json

# Součet hodnot
jq '[.items[].price] | add' file.json   # Součet všech cen

# Průměr
jq '[.items[].price] | add / length' file.json

# Minimum a maximum
jq '[.items[].price] | min' file.json
jq '[.items[].price] | max' file.json

# Seřazení
jq '.items | sort_by(.price)' file.json         # Vzestupně
jq '.items | sort_by(.price) | reverse' file.json  # Sestupně

# Unikátní hodnoty
jq '[.items[].category] | unique' file.json

# Seskupení
jq 'group_by(.category)' file.json
```

## Úprava JSON

```bash
# Přidání/změna klíče
jq '.newKey = "value"' file.json
jq '.user.name = "New Name"' file.json

# Smazání klíče
jq 'del(.unwantedKey)' file.json
jq 'del(.users[0])' file.json           # Smazání prvního uživatele

# Aktualizace hodnoty
jq '.price += 10' file.json             # Přičtení k hodnotě
jq '.items[].price *= 1.1' file.json    # Zvýšení všech cen o 10%

# Sloučení objektů
jq '. + {"newKey": "value"}' file.json
jq '.user + {"role": "admin"}' file.json
```

## Práce s více soubory

```bash
# Sloučení dvou JSON souborů
jq -s '.[0] + .[1]' file1.json file2.json

# Spojení polí z více souborů
jq -s '[.[][]]' file1.json file2.json

# Porovnání souborů
jq -s '.[0] == .[1]' file1.json file2.json
```

## Formátování výstupu

```bash
# Tab odsazení
jq --tab '.' file.json

# Vlastní odsazení (2 mezery)
jq --indent 2 '.' file.json

# Barevný výstup (výchozí v terminálu)
jq -C '.' file.json

# Bez barev
jq -M '.' file.json

# Výstup jako čistý text (pro scripty)
jq -r '.items[] | "\(.name): \(.price) Kč"' file.json
```

## Praktické příklady

```bash
# Extrakce všech ID z API odpovědi
curl -s https://api.example.com/users | jq -r '.[].id'

# Filtrování aktivních uživatelů a výpis jejich emailů
jq -r '.users[] | select(.active == true) | .email' users.json

# Transformace pole objektů na CSV
jq -r '.items[] | [.name, .price, .quantity] | @csv' items.json

# Vytvoření lookup tabulky (objekt klíč:hodnota)
jq 'map({(.id|tostring): .name}) | add' items.json

# Počet položek podle kategorie
jq 'group_by(.category) | map({category: .[0].category, count: length})' items.json

# Zpracování NDJSON (newline-delimited JSON)
cat logs.ndjson | jq -s 'map(select(.level == "error"))'

# Hledání v hluboké struktuře (rekurzivně)
jq '.. | .email? // empty' nested.json

# Podmíněná úprava hodnot
jq '.items[] |= if .stock == 0 then .status = "unavailable" else . end' inventory.json
```

## Užitečné funkce

```bash
# Typy dat
jq 'type' file.json                     # Vrátí typ (object, array, string, number...)
jq '.items[] | type' file.json          # Typ každého prvku

# Klíče objektu
jq 'keys' file.json                     # Seznam všech klíčů

# Test existence klíče
jq 'has("name")' file.json              # true/false

# Konverze typů
jq '.count | tonumber' file.json        # String na číslo
jq '.id | tostring' file.json           # Číslo na string

# Práce se stringy
jq '.name | ascii_downcase' file.json   # Na malá písmena
jq '.name | split(" ")' file.json       # Rozdělení podle oddělovače
jq '.tags | join(", ")' file.json       # Spojení pole do stringu
```

## Tipy

```bash
# Ladění - zobrazení vstupu a výstupu
jq 'debug' file.json

# Null handling - bezpečný přístup (nevyhodí chybu)
jq '.missing?.nested?' file.json

# Uložení výstupu do souboru
jq '.' input.json > output.json

# In-place úprava (pomocí sponge z moreutils)
jq '.version = "2.0"' file.json | sponge file.json

# Environment variables v jq
jq --arg name "$USER" '.user = $name' file.json
jq --argjson count 5 '.limit = $count' file.json
```
