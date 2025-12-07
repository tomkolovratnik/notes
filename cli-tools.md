# CLI nástroje

Moderní příkazové nástroje pro produktivnější práci v terminálu.

## Přehled nástrojů

| Nástroj | Popis | Nahrazuje |
|---------|-------|-----------|
| [Pager (less)](#práce-s-pagerem-less) | Ovládání stránkování v terminálu | - |
| [fzf](#fzf---fuzzy-finder) | Interaktivní fuzzy vyhledávač | - |
| [ripgrep (rg)](#ripgrep-rg---rychlé-vyhledávání) | Extrémně rychlé vyhledávání v souborech | grep |
| [fd](#fd---vyhledávání-souborů) | Rychlé a přívětivé hledání souborů | find |
| [bat](#bat---prohlížení-souborů) | Cat se syntax highlightingem | cat |
| [eza](#eza---výpis-souborů) | Moderní ls s barvami a ikonami | ls |
| [delta](#delta---git-diff-viewer) | Vylepšený git diff | git diff |
| [zoxide](#zoxide---chytrá-navigace) | Chytré cd s historií | cd |
| [jq](#jq---json-procesor) | Zpracování JSON dat | - |
| [yq](#yq---yaml-procesor) | Zpracování YAML/TOML/XML | - |
| [httpie](#httpie---http-klient) | Přívětivý HTTP klient | curl |
| [sd](#sd---find--replace) | Jednoduchý find & replace | sed |
| [tldr](#tldr---zjednodušené-manuály) | Praktické příklady příkazů | man |
| [lazygit](#lazygit---git-tui) | Interaktivní TUI pro Git | git |
| [tmux](#tmux---terminál-multiplexor) | Více terminálů v jednom okně | - |
| [direnv](#direnv---automatické-env-variables) | Automatické env variables per-projekt | - |
| [ncdu](#ncdu---disk-usage-analyzer) | Interaktivní analýza místa na disku | du |
| [htop/btop](#htopbtop---system-monitoring) | Interaktivní monitoring systému | top |
| [oh-my-posh](#oh-my-posh---moderní-prompt) | Moderní prompt pro shell | PS1 |

---

## Instalace všech nástrojů

### Windows (Scoop) - doporučeno pro Git Bash

```bash
# Instalace Scoop (v PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Instalace nástrojů
scoop install fzf ripgrep fd bat eza delta zoxide jq yq httpie sd tldr
```

### Windows (Chocolatey)

```bash
choco install fzf ripgrep fd bat eza delta zoxide jq yq httpie sd tldr
```

### Ubuntu/Debian

```bash
sudo apt install fzf ripgrep fd-find bat jq httpie
# fd se jmenuje fdfind, vytvoř alias: alias fd='fdfind'
# bat se může jmenovat batcat: alias bat='batcat'

# Ostatní přes cargo nebo binárky z GitHubu
cargo install eza delta zoxide sd
```

### macOS (Homebrew)

```bash
brew install fzf ripgrep fd bat eza git-delta zoxide jq yq httpie sd tldr
```

---

## Práce s pagerem (less)

Většina CLI nástrojů (`bat`, `git log`, `man`, `help`) používá `less` pro stránkování dlouhého výstupu. Ovládání je jednotné.

### Pohyb po stránkách

```bash
# Základní pohyb
Space / f           # O stránku dolů (forward)
b                   # O stránku nahoru (back)
d / u               # O půl stránky dolů/nahoru
Enter / j           # O řádek dolů
k                   # O řádek nahoru
g                   # Na začátek souboru
G                   # Na konec souboru
50g                 # Skok na řádek 50

# Hledání
/pattern            # Hledej dopředu (regex)
?pattern            # Hledej dozadu
n                   # Další výskyt
N                   # Předchozí výskyt
&pattern            # Zobraz jen řádky odpovídající patternu

# Ukončení
q                   # Ukončit prohlížení
```

### Užitečné zkratky

```bash
h                   # Nápověda (help) - zobrazí všechny klávesy
-N                  # Zapnout/vypnout čísla řádků (za běhu)
-S                  # Zapnout/vypnout zalamování řádků
F                   # Follow mode (jako tail -f) - Ctrl+C pro ukončení
v                   # Otevře soubor v editoru ($EDITOR)
!příkaz             # Spustí shell příkaz
```

### Nastavení pro Git Bash

```bash
# V ~/.bashrc - lepší výchozí chování
export LESS='-R -F -X'
# -R = interpret ANSI barev
# -F = ukončit pokud se vše vejde na obrazovku
# -X = nevymazat obrazovku při ukončení
```

---

## fzf - Fuzzy Finder

Interaktivní fuzzy vyhledávač pro příkazovou řádku. Změňuje způsob práce s terminálem.

### Instalace

```bash
# Windows (Scoop)
scoop install fzf

# Ubuntu
sudo apt install fzf

# macOS
brew install fzf

# Aktivace klávesových zkratek (bash)
# Přidej do ~/.bashrc:
eval "$(fzf --bash)"
```

### Klávesové zkratky

```bash
Ctrl+R                  # Interaktivní historie příkazů
Ctrl+T                  # Fuzzy hledání souborů (vloží cestu)
Alt+C                   # Fuzzy cd do složky
```

### Základní použití

```bash
# Fuzzy hledání souborů
fzf                                     # Spustí interaktivní výběr

# Hledání s náhledem obsahu
fzf --preview 'cat {}'                  # Náhled souboru
fzf --preview 'bat --color=always {}'   # Náhled s highlightingem

# Filtrování výstupu jiného příkazu
history | fzf                           # Hledání v historii
ps aux | fzf                            # Hledání procesu
```

### Integrace s dalšími příkazy

```bash
# Otevření vybraného souboru v editoru
code $(fzf)                             # VS Code
vim $(fzf)                              # Vim

# Git operace
git checkout $(git branch | fzf)        # Přepnutí větve
git log --oneline | fzf                 # Procházení commitů

# Změna adresáře
cd $(find . -type d | fzf)              # Interaktivní cd

# Kill procesu
kill $(ps aux | fzf | awk '{print $2}') # Výběr a kill procesu
```

### Praktické aliasy

```bash
# Přidej do ~/.bashrc
alias preview='fzf --preview "bat --color=always {}"'
alias cdf='cd $(find . -type d | fzf)'
alias vf='vim $(fzf)'
```

### Pokročilé použití

```bash
# Multi-select (Tab pro výběr více položek)
fzf -m                                  # Výběr více souborů

# Vlastní prompt
fzf --prompt="Select file: "

# Výchozí příkaz pro hledání (rychlejší s fd)
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
```

---

## ripgrep (rg) - Rychlé vyhledávání

Extrémně rychlý grep napsaný v Rustu. Automaticky ignoruje .gitignore a skryté soubory.

### Instalace

```bash
# Windows (Scoop)
scoop install ripgrep

# Ubuntu
sudo apt install ripgrep

# macOS
brew install ripgrep
```

### Základní použití

```bash
# Hledání textu v aktuální složce (rekurzivně)
rg "pattern"                            # Základní hledání
rg "pattern" ./src                      # Hledání v konkrétní složce
rg "pattern" file.txt                   # Hledání v konkrétním souboru

# Case-insensitive
rg -i "pattern"                         # Ignoruje velikost písmen

# Celá slova
rg -w "word"                            # Hledá celé slovo, ne část

# Regex
rg "func.*\(" src/                      # Regex pattern
rg -e "pattern1" -e "pattern2"          # Více patternů (OR)
```

### Filtrování souborů

```bash
# Podle typu souboru
rg "TODO" -t js                         # Jen JavaScript soubory
rg "TODO" -t py -t js                   # Python a JavaScript
rg "TODO" -T js                         # Vše kromě JavaScriptu

# Podle glob patternu
rg "pattern" -g "*.ts"                  # Jen .ts soubory
rg "pattern" -g "!*.test.js"            # Ignorovat test soubory
rg "pattern" -g "src/**/*.js"           # Jen JS v src/

# Včetně skrytých a ignorovaných
rg "pattern" --hidden                   # Včetně skrytých souborů
rg "pattern" --no-ignore                # Ignorovat .gitignore
rg "pattern" -uuu                       # Prohledat úplně vše
```

### Výstup a formátování

```bash
# Jen názvy souborů
rg -l "pattern"                         # Soubory s výskytem
rg -L "pattern"                         # Soubory BEZ výskytu

# Počet výskytů
rg -c "pattern"                         # Počet na soubor
rg --count-matches "pattern"            # Celkový počet

# Kontext kolem nálezu
rg -C 3 "pattern"                       # 3 řádky před a po
rg -B 2 -A 5 "pattern"                  # 2 před, 5 po

# Čísla řádků
rg -n "pattern"                         # Zobrazí čísla řádků

# Bez barev (pro piping)
rg --no-heading --no-line-number "pattern"
```

### Nahrazení textu (dry-run)

```bash
# Zobrazení co by se nahradilo
rg "old" --replace "new"                # Ukáže výsledek (nemění soubory)

# Pro skutečnou náhradu použij sd nebo:
rg -l "old" | xargs sed -i 's/old/new/g'
```

### Praktické příklady

```bash
# Hledání TODO/FIXME komentářů
rg "TODO|FIXME" -t js -t ts

# Hledání console.log (pro cleanup)
rg "console\.log" --type js

# Hledání definice funkce
rg "function \w+\(" --type js
rg "def \w+\(" --type py

# Hledání importů
rg "^import .* from" --type ts

# JSON klíče
rg '"api_key"' --type json

# Hledání s výstupem do fzf
rg "pattern" | fzf
```

---

## fd - Vyhledávání souborů

Rychlejší a uživatelsky přívětivější alternativa k `find`.

### Instalace

```bash
# Windows (Scoop)
scoop install fd

# Ubuntu (pozor: balíček se jmenuje fd-find, binárka fdfind)
sudo apt install fd-find
alias fd='fdfind'                       # Přidej do ~/.bashrc

# macOS
brew install fd
```

### Základní použití

```bash
# Hledání podle názvu
fd pattern                              # Hledá soubory/složky obsahující "pattern"
fd "\.js$"                              # Regex - soubory končící na .js
fd -e js                                # Soubory s příponou .js

# Hledání v konkrétní složce
fd pattern ./src                        # Hledej jen v src/

# Case sensitivity
fd -s Pattern                           # Case-sensitive
fd -i pattern                           # Case-insensitive (výchozí)
```

### Filtrování

```bash
# Typ položky
fd -t f pattern                         # Jen soubory (file)
fd -t d pattern                         # Jen složky (directory)
fd -t l pattern                         # Jen symlinky (link)
fd -t x pattern                         # Jen spustitelné (executable)

# Skryté a ignorované soubory
fd -H pattern                           # Včetně skrytých (.)
fd -I pattern                           # Ignorovat .gitignore
fd -u pattern                           # Unrestricted (vše)

# Hloubka
fd -d 2 pattern                         # Max 2 úrovně
fd --min-depth 2 pattern                # Min 2 úrovně
```

### Pokročilé hledání

```bash
# Podle velikosti
fd -S +100M                             # Větší než 100MB
fd -S -1k                               # Menší než 1KB
fd -S +1M -S -100M                      # Mezi 1MB a 100MB

# Podle času modifikace
fd --changed-within 1d                  # Změněno za poslední den
fd --changed-before 1w                  # Změněno před více než týdnem

# Vyloučení
fd -E node_modules                      # Ignorovat node_modules
fd -E "*.min.js"                        # Ignorovat minifikované
fd -E "*.test.js" -e js                 # JS bez testů
```

### Akce s nalezenými soubory

```bash
# Spuštění příkazu na každém souboru
fd -e txt -x wc -l                      # Počet řádků každého .txt
fd -e jpg -x convert {} {.}.png         # Konverze jpg na png

# Paralelní spuštění (výchozí)
fd -e ts -x prettier --write {}

# Smazání nalezených
fd -t f -e log -x rm {}                 # Smaže všechny .log soubory

# Potvrzení před akcí
fd -e tmp -X rm -i                      # -X = všechny najednou, -i = ptá se
```

### Praktické příklady

```bash
# Najít všechny package.json
fd -t f "package.json"

# Najít velké soubory
fd -S +50M -t f

# Najít prázdné složky
fd -t d -e empty

# Najít a otevřít v editoru
fd -e md | fzf | xargs code

# Najít duplicitní názvy
fd -t f | sort | uniq -d
```

---

## bat - Prohlížení souborů

`cat` s křídly - syntax highlighting, čísla řádků, git integrace.

### Instalace

```bash
# Windows (Scoop)
scoop install bat

# Ubuntu (může být jako batcat)
sudo apt install bat
alias bat='batcat'                      # Přidej do ~/.bashrc pokud je batcat

# macOS
brew install bat
```

### Základní použití

```bash
# Zobrazení souboru
bat file.js                             # Se syntax highlightingem
bat file1.js file2.js                   # Více souborů

# Konkrétní řádky
bat --line-range 10:20 file.js          # Řádky 10-20
bat -r :50 file.js                      # První 50 řádků
bat -r 100: file.js                     # Od řádku 100

# Zobrazení skrytých znaků
bat -A file.txt                         # Ukáže taby, konce řádků atd.
```

### Formátování výstupu

```bash
# Styl výstupu
bat --style=numbers file.js             # Jen čísla řádků
bat --style=changes file.js             # Jen git změny
bat --style=header file.js              # Jen hlavička
bat --style=grid file.js                # Mřížka
bat --style=full file.js                # Vše (výchozí)
bat --style=plain file.js               # Jen syntax highlighting

# Stránkování
bat --paging=never file.js              # Vypne pager, vypíše vše najednou
bat --paging=always file.js             # Vždy použít pager
bat -P file.js                          # Zkratka pro --paging=never

# Ovládání pageru - viz sekce "Práce s pagerem (less)" výše
# Space/f = stránka dolů, b = stránka nahoru, /text = hledání, q = konec

# Jazyk
bat --language=json file.txt            # Vynutí JSON highlighting
bat -l js script                        # Vynutí JavaScript
```

### Témata

```bash
# Seznam témat
bat --list-themes

# Použití tématu
bat --theme="Dracula" file.js

# Trvalé nastavení tématu (v ~/.bashrc)
export BAT_THEME="Dracula"
```

### Integrace

```bash
# Jako pager pro man
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# Jako pager pro help
alias bathelp='bat --plain --language=help'
help git | bathelp

# S fzf náhledem
fzf --preview 'bat --color=always --style=numbers {}'

# Jako diff viewer
bat --diff file1.js file2.js
```

### Praktické aliasy

```bash
# Přidej do ~/.bashrc
alias cat='bat --paging=never'          # Nahradí cat
alias catn='bat --style=plain'          # Bez čísel a dekorace
alias catl='bat --style=numbers'        # Jen čísla řádků
```

---

## eza - Výpis souborů

Moderní náhrada `ls` s barvami, ikonami a git integrací.

### Instalace

```bash
# Windows (Scoop)
scoop install eza

# Ubuntu (přes cargo nebo binárka)
cargo install eza

# macOS
brew install eza
```

### Základní použití

```bash
# Výpis souborů
eza                                     # Základní výpis
eza -l                                  # Long format (detaily)
eza -la                                 # Včetně skrytých

# S ikonami
eza --icons                             # Ikony u souborů
eza --icons -l                          # Long + ikony
```

### Zobrazení

```bash
# Stromová struktura
eza --tree                              # Strom
eza --tree --level=2                    # Max 2 úrovně
eza -T -L 3                             # Zkráceně

# Git status
eza --git                               # Zobrazí git status
eza -l --git                            # V long formátu

# Hlavičky sloupců
eza -lh                                 # S hlavičkami (header)
```

### Řazení

```bash
# Řazení
eza --sort=name                         # Podle jména (výchozí)
eza --sort=size                         # Podle velikosti
eza --sort=modified                     # Podle data změny
eza --sort=extension                    # Podle přípony

eza -l -s size                          # Zkráceně
eza -l -s modified --reverse            # Sestupně
```

### Filtrování

```bash
# Jen složky
eza -D                                  # Directories only

# Jen soubory
eza -f                                  # Files only

# Skryté soubory
eza -a                                  # Všechny včetně . a ..
eza -A                                  # Skryté bez . a ..
```

### Praktické aliasy

```bash
# Přidej do ~/.bashrc
alias ls='eza --icons'
alias ll='eza -l --icons --git'
alias la='eza -la --icons --git'
alias lt='eza --tree --level=2 --icons'
alias lta='eza --tree --level=2 --icons -a'
```

---

## delta - Git Diff Viewer

Vylepšený diff s syntax highlightingem a side-by-side zobrazením.

### Instalace

```bash
# Windows (Scoop)
scoop install delta

# Ubuntu
sudo apt install git-delta
# nebo: cargo install git-delta

# macOS
brew install git-delta
```

### Konfigurace pro Git

```bash
# Přidej do ~/.gitconfig
[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    navigate = true          # Použij n a N pro navigaci mezi soubory
    line-numbers = true      # Čísla řádků
    side-by-side = true      # Vedle sebe (volitelné)

[merge]
    conflictstyle = diff3

[diff]
    colorMoved = default
```

### Přímé použití

```bash
# Diff dvou souborů
delta file1.js file2.js

# Porovnání s git
git diff | delta
git show | delta
git log -p | delta
```

### Možnosti zobrazení

```bash
# Side-by-side
delta --side-by-side file1 file2
git diff | delta -s                     # Zkráceně

# Čísla řádků
delta --line-numbers file1 file2
delta -n file1 file2                    # Zkráceně

# Bez stránkování
delta --paging=never file1 file2
```

### Témata

```bash
# Seznam témat
delta --list-themes

# Použití tématu (v příkazu nebo v .gitconfig)
delta --syntax-theme="Dracula"

# V .gitconfig
[delta]
    syntax-theme = Dracula
```

---

## zoxide - Chytrá navigace

Chytřejší `cd` které si pamatuje navštívené složky a umožňuje rychlý skok.

### Instalace

```bash
# Windows (Scoop)
scoop install zoxide

# Ubuntu
sudo apt install zoxide
# nebo: cargo install zoxide

# macOS
brew install zoxide

# Aktivace (přidej do ~/.bashrc)
eval "$(zoxide init bash)"
```

### Základní použití

```bash
# Skok do složky (postupně se učí z tvého cd)
z projects                              # Skočí do nejpravděpodobnější "projects"
z proj                                  # Stačí část názvu
z my proj                               # Více klíčových slov

# Interaktivní výběr (potřebuje fzf)
zi                                      # Otevře fzf pro výběr z historie
zi projects                             # Filtruje podle "projects"
```

### Příkazy

```bash
# Přidání složky do databáze
zoxide add /path/to/folder

# Odstranění složky
zoxide remove /path/to/folder

# Zobrazení databáze
zoxide query                            # Všechny záznamy
zoxide query -l                         # Se skóre
zoxide query projects                   # Filtrované
```

### Jak funguje

1. Každé použití `cd` nebo `z` přidává složku do databáze
2. Častěji navštěvované složky mají vyšší skóre
3. `z` vybírá složku s nejvyšším skóre odpovídající dotazu

### Praktické aliasy

```bash
# Přidej do ~/.bashrc
alias cd='z'                            # Nahradí cd za z
alias cdi='zi'                          # Interaktivní
```

---

## jq - JSON procesor

Příkazový nástroj pro zpracování a transformaci JSON dat.

### Instalace

```bash
# Windows (Scoop)
scoop install jq

# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq
```

### Základní použití

```bash
# Pretty print (formátování JSON)
cat file.json | jq '.'
jq '.' file.json                        # Přímé zpracování souboru

# Zpracování výstupu příkazu (např. curl)
curl -s https://api.example.com/data | jq '.'

# Kompaktní výstup (bez formátování)
jq -c '.' file.json
```

### Extrakce hodnot

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

### Práce s poli

```bash
# Konkrétní prvek pole (indexováno od 0)
jq '.items[0]' file.json                # První prvek
jq '.items[-1]' file.json               # Poslední prvek

# Iterace přes všechny prvky pole
jq '.items[]' file.json                 # Každý prvek na novém řádku

# Délka pole
jq '.items | length' file.json          # Počet prvků
```

### Filtry a transformace

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

### Agregace a statistiky

```bash
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

### Úprava JSON

```bash
# Přidání/změna klíče
jq '.newKey = "value"' file.json
jq '.user.name = "New Name"' file.json

# Smazání klíče
jq 'del(.unwantedKey)' file.json

# Aktualizace hodnoty
jq '.price += 10' file.json             # Přičtení k hodnotě
jq '.items[].price *= 1.1' file.json    # Zvýšení všech cen o 10%

# Sloučení objektů
jq '. + {"newKey": "value"}' file.json
```

### Praktické příklady

```bash
# Extrakce všech ID z API odpovědi
curl -s https://api.example.com/users | jq -r '.[].id'

# Filtrování aktivních uživatelů a výpis jejich emailů
jq -r '.users[] | select(.active == true) | .email' users.json

# Transformace pole objektů na CSV
jq -r '.items[] | [.name, .price, .quantity] | @csv' items.json

# Podmíněná úprava hodnot
jq '.items[] |= if .stock == 0 then .status = "unavailable" else . end' inventory.json
```

### Tipy

```bash
# Environment variables v jq
jq --arg name "$USER" '.user = $name' file.json
jq --argjson count 5 '.limit = $count' file.json

# Null handling - bezpečný přístup (nevyhodí chybu)
jq '.missing?.nested?' file.json
```

---

## yq - YAML procesor

`jq` pro YAML, TOML a XML. Stejná syntaxe, jiné formáty.

### Instalace

```bash
# Windows (Scoop)
scoop install yq

# Ubuntu
sudo apt install yq
# nebo: snap install yq

# macOS
brew install yq
```

### Základní použití

```bash
# Pretty print YAML
yq '.' file.yaml

# Extrakce hodnoty
yq '.metadata.name' deployment.yaml

# Všechny položky pole
yq '.spec.containers[]' pod.yaml
yq '.spec.containers[].name' pod.yaml
```

### Úpravy

```bash
# Změna hodnoty
yq '.replicas = 3' deployment.yaml

# Přidání klíče
yq '.metadata.labels.env = "production"' deployment.yaml

# Smazání klíče
yq 'del(.metadata.annotations)' deployment.yaml

# In-place úprava
yq -i '.replicas = 5' deployment.yaml
```

### Konverze formátů

```bash
# YAML na JSON
yq -o=json '.' file.yaml

# JSON na YAML
yq -P '.' file.json                     # -P = pretty print YAML

# YAML na XML
yq -o=xml '.' file.yaml

# TOML
yq -o=toml '.' file.yaml
yq -p=toml '.' file.toml                # Čtení TOML
```

### Více souborů

```bash
# Sloučení YAML souborů
yq eval-all '. as $item ireduce ({}; . * $item)' file1.yaml file2.yaml

# Procházení více dokumentů v jednom souboru (---)
yq '.metadata.name' multi-doc.yaml      # Ze všech dokumentů
yq 'select(documentIndex == 0)' multi.yaml  # Jen první dokument
```

### Praktické příklady

```bash
# Kubernetes: získání všech image
yq '.spec.containers[].image' deployment.yaml

# Docker Compose: výpis služeb
yq '.services | keys' docker-compose.yml

# Změna verze image
yq '.spec.containers[0].image = "nginx:1.25"' deployment.yaml

# Přidání environment variable
yq '.spec.containers[0].env += [{"name": "DEBUG", "value": "true"}]' deployment.yaml
```

---

## httpie - HTTP klient

Uživatelsky přívětivější alternativa k curl s intuitivní syntaxí.

### Instalace

```bash
# Windows (Scoop)
scoop install httpie

# Ubuntu
sudo apt install httpie

# macOS
brew install httpie

# pip
pip install httpie
```

### Základní požadavky

```bash
# GET request
http https://api.example.com/users
http GET https://api.example.com/users  # Explicitní

# POST request (JSON je výchozí)
http POST https://api.example.com/users name=John age:=25

# PUT, PATCH, DELETE
http PUT https://api.example.com/users/1 name=Jane
http PATCH https://api.example.com/users/1 name=Jane
http DELETE https://api.example.com/users/1
```

### Data a parametry

```bash
# JSON data (výchozí)
http POST api.example.com/users \
    name=John \                         # String
    age:=25 \                           # Číslo (použij :=)
    active:=true \                      # Boolean
    tags:='["a", "b"]'                  # Raw JSON

# Form data
http --form POST api.example.com/login username=admin password=secret

# Query parametry
http api.example.com/search q==term page==1

# Raw JSON body
http POST api.example.com/data < data.json
echo '{"key": "value"}' | http POST api.example.com/data
```

### Hlavičky a autentizace

```bash
# Custom hlavičky
http api.example.com/data Authorization:"Bearer token123"
http api.example.com/data X-Custom-Header:value

# Basic auth
http -a user:password api.example.com/protected

# Bearer token
http api.example.com/data "Authorization:Bearer token123"
```

### Výstup

```bash
# Jen body
http --body api.example.com/users

# Jen headers
http --headers api.example.com/users

# Verbose (request + response)
http --verbose api.example.com/users

# Bez formátování (raw)
http --raw api.example.com/users

# Stáhnout soubor
http --download api.example.com/file.zip
http -d api.example.com/file.zip        # Zkráceně
```

### Sessions

```bash
# Pojmenovaná session (ukládá cookies, auth)
http --session=logged-in POST api.example.com/login user=admin
http --session=logged-in api.example.com/dashboard
```

### Praktické příklady

```bash
# GitHub API
http https://api.github.com/users/torvalds

# POST s JSON
http POST https://jsonplaceholder.typicode.com/posts \
    title="Test" body="Content" userId:=1

# Upload souboru
http --form POST api.example.com/upload file@./document.pdf

# Offline mode (simulace)
http --offline POST api.example.com/users name=John
```

---

## sd - Find & Replace

Jednodušší alternativa k `sed` pro hledání a nahrazování textu.

### Instalace

```bash
# Windows (Scoop)
scoop install sd

# Ubuntu (přes cargo)
cargo install sd

# macOS
brew install sd
```

### Základní použití

```bash
# Nahrazení v textu (stdin)
echo "hello world" | sd 'world' 'universe'

# Nahrazení v souboru (in-place)
sd 'old' 'new' file.txt

# Preview bez změny
sd -p 'old' 'new' file.txt              # --preview
```

### Regex

```bash
# Regex pattern
sd 'v[0-9]+\.[0-9]+' 'v2.0' file.txt

# Capture groups
sd '(\w+)@(\w+)' '$2@$1' file.txt       # Prohození

# Case insensitive
sd -f i 'hello' 'hi' file.txt           # --flags i
```

### Více souborů

```bash
# Kombinace s fd
fd -e js -x sd 'console.log' '// console.log' {}

# Kombinace s find
find . -name "*.txt" -exec sd 'old' 'new' {} \;

# S ripgrep (najdi soubory, pak nahraď)
rg -l 'pattern' | xargs sd 'old' 'new'
```

### Praktické příklady

```bash
# Změna importů
sd "from 'lodash'" "from 'lodash-es'" src/*.js

# Přejmenování proměnné
sd 'userName' 'username' **/*.ts

# Odstranění console.log
sd 'console\.log\(.*?\);?\n?' '' src/*.js

# Změna verze
sd 'version = "[0-9.]+"' 'version = "2.0.0"' Cargo.toml
```

---

## tldr - Zjednodušené manuály

Praktické příklady příkazů místo dlouhých man stránek.

### Instalace

```bash
# Windows (Scoop)
scoop install tldr

# Ubuntu
sudo apt install tldr
# nebo: npm install -g tldr

# macOS
brew install tldr

# pip
pip install tldr

# První spuštění - stažení databáze
tldr --update
```

### Použití

```bash
# Zobrazení příkladů
tldr tar                                # Příklady pro tar
tldr git-commit                         # Git příkazy s pomlčkou
tldr docker-compose                     # Docker Compose

# Aktualizace databáze
tldr --update

# Hledání
tldr --search "compress"                # Hledání v popisech
```

### Platformy

```bash
# Konkrétní platforma
tldr -p linux tar
tldr -p osx pbcopy
tldr -p windows clip
```

### Příklad výstupu

```bash
$ tldr tar

tar

Archiving utility.
Often combined with a compression method, such as gzip or bzip2.

- Create an archive from files:
    tar cf target.tar file1 file2 file3

- Create a gzipped archive:
    tar czf target.tar.gz file1 file2 file3

- Extract a (compressed) archive into the current directory:
    tar xf source.tar[.gz|.bz2|.xz]

- Extract files matching a pattern:
    tar xf source.tar --wildcards "*.html"
```

---

## lazygit - Git TUI

Interaktivní textové rozhraní pro Git. Vizuální alternativa k příkazům.

### Instalace

```bash
# Windows (Scoop)
scoop install lazygit

# Ubuntu
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*')
curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
tar xf lazygit.tar.gz lazygit
sudo install lazygit /usr/local/bin

# macOS
brew install lazygit
```

### Spuštění

```bash
lazygit                         # V git repozitáři
lg                              # S aliasem: alias lg='lazygit'
lazygit -p /path/to/repo        # Konkrétní repo
```

### Klávesové zkratky

```bash
# Navigace mezi panely
h / l           # Přepínání panelů vlevo/vpravo
j / k           # Pohyb nahoru/dolů v seznamu
[ / ]           # Předchozí/další tab
Enter           # Vstup do detailu
Esc             # Zpět / zavřít
?               # Nápověda (zobrazí všechny zkratky)

# Panel: Files (soubory)
Space           # Stage/unstage souboru
a               # Stage/unstage všech souborů
d               # Zahodit změny (discard)
e               # Editovat soubor v editoru
o               # Otevřít soubor

# Panel: Commits
c               # Commit (otevře editor pro zprávu)
A               # Amend poslední commit
r               # Reword commit message
s               # Squash commit do předchozího
f               # Fixup commit

# Panel: Branches (větve)
n               # Nová větev
Space           # Checkout větev
M               # Merge do aktuální větve
r               # Rebase na tuto větev
d               # Smazat větev

# Panel: Stash
Space           # Aplikovat stash
g               # Pop stash
d               # Zahodit stash
n               # Nový stash

# Remote operace
p               # Pull
P               # Push
f               # Fetch

# Ostatní
x               # Menu s akcemi pro aktuální položku
/               # Hledání
+               # Zvětšit panel
_               # Zmenšit panel
```

### Konfigurace

```yaml
# ~/.config/lazygit/config.yml
gui:
  theme:
    lightTheme: false             # Tmavé téma
  showFileTree: true              # Stromové zobrazení souborů
  showRandomTip: false            # Vypnout tipy

git:
  paging:
    colorArg: always
    pager: delta --dark --paging=never  # Použij delta pro diff

keybinding:
  universal:
    quit: 'q'
    quit-alt1: '<c-c>'
```

### Alias

```bash
# Přidej do ~/.bashrc
alias lg='lazygit'
```

---

## tmux - Terminál Multiplexor

Více terminálů v jednom okně, sessions na pozadí, odpojení bez ukončení procesů.

**Poznámka:** tmux není nativně dostupný v Git Bash na Windows. Použij WSL nebo Windows Terminal s více taby.

### Instalace

```bash
# WSL / Ubuntu
sudo apt install tmux

# macOS
brew install tmux
```

### Základní koncepty

```
Session (relace)
  └── Window (okno/tab)
        └── Pane (panel/rozdělení)
```

- **Session** - hlavní kontejner, může běžet na pozadí i po odpojení
- **Window** - jako tab v prohlížeči, v rámci session
- **Pane** - rozdělení okna na části

### Práce se sessions

```bash
# Nová session
tmux                              # Nová bez jména
tmux new -s mysession             # Pojmenovaná session

# Odpojení od session (session běží dál)
Ctrl+B, D                         # Prefix + D

# Seznam sessions
tmux ls
tmux list-sessions

# Připojení k session
tmux attach                       # K poslední
tmux attach -t mysession          # K pojmenované
tmux a -t mysession               # Zkráceně

# Ukončení session
exit                              # V rámci session
tmux kill-session -t mysession    # Zvenku
tmux kill-server                  # Všechny sessions
```

### Klávesové zkratky (prefix = Ctrl+B)

```bash
# Vždy nejdříve stiskni Ctrl+B, pak další klávesu

# Sessions
Ctrl+B, d         # Odpojit se (detach)
Ctrl+B, s         # Seznam sessions
Ctrl+B, $         # Přejmenovat session

# Windows (taby)
Ctrl+B, c         # Nový window
Ctrl+B, n         # Další window
Ctrl+B, p         # Předchozí window
Ctrl+B, 0-9       # Přepnutí na window podle čísla
Ctrl+B, ,         # Přejmenovat window
Ctrl+B, &         # Zavřít window

# Panes (rozdělení)
Ctrl+B, %         # Rozdělit vertikálně (levá/pravá)
Ctrl+B, "         # Rozdělit horizontálně (horní/dolní)
Ctrl+B, šipky     # Přepínání mezi panes
Ctrl+B, x         # Zavřít pane
Ctrl+B, z         # Zoom - maximalizovat/obnovit pane
Ctrl+B, Space     # Změnit layout panes
Ctrl+B, {         # Prohodit pane s předchozím
Ctrl+B, }         # Prohodit pane s následujícím
Ctrl+B, !         # Přesunout pane do nového window

# Ostatní
Ctrl+B, ?         # Nápověda - seznam všech zkratek
Ctrl+B, :         # Command mode
Ctrl+B, [         # Copy mode (scrollování, hledání)
Ctrl+B, t         # Zobrazit čas
```

### ~/.tmux.conf - Konfigurace

```bash
# ~/.tmux.conf

# Změna prefixu na Ctrl+A (pohodlnější)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Mouse support - scrollování, výběr pane
set -g mouse on

# Indexování od 1 (ne 0)
set -g base-index 1
setw -g pane-base-index 1

# Lepší rozdělení oken
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Navigace mezi panes jako vim (h/j/k/l)
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Rychlé přenačtení konfigurace
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# Větší historie scrollbacku
set -g history-limit 10000

# Barevný terminál
set -g default-terminal "screen-256color"
```

### Praktické příklady

```bash
# Dlouhoběžící proces na serveru
ssh server
tmux new -s build           # Nová session "build"
npm run build               # Spusť build
Ctrl+B, D                   # Odpoj se
exit                        # Odhlásit z SSH
# ... build pokračuje na serveru ...
ssh server
tmux attach -t build        # Znovu se připoj

# Vývojové prostředí
tmux new -s dev
# Window 1: editor
Ctrl+B, c                   # Window 2: server
Ctrl+B, c                   # Window 3: git
# Přepínání: Ctrl+B, 1/2/3
```

---

## direnv - Automatické Env Variables

Automatické načítání/obnova environment variables při vstupu/opuštění složky.

### Instalace

```bash
# Windows (Scoop)
scoop install direnv

# Ubuntu
sudo apt install direnv

# macOS
brew install direnv

# Aktivace (přidej do ~/.bashrc)
eval "$(direnv hook bash)"
```

### Základní použití

```bash
# Vytvoř .envrc v projektu
cd myproject
echo 'export API_KEY="secret123"' > .envrc
echo 'export DATABASE_URL="postgres://..."' >> .envrc

# Povol soubor (bezpečnostní krok - musíš potvrdit)
direnv allow

# Teď při vstupu do složky:
cd myproject
# direnv: loading .envrc
# direnv: export +API_KEY +DATABASE_URL
echo $API_KEY                       # secret123

# Při opuštění se automaticky zruší:
cd ..
# direnv: unloading
echo $API_KEY                       # (prázdné)
```

### Struktura .envrc

```bash
# Základní proměnné
export NODE_ENV=development
export DEBUG=true
export PORT=3000

# Načtení z .env souboru (pokud existuje)
dotenv                              # Načte .env
dotenv_if_exists .env.local         # Načte jen pokud existuje

# Načtení .envrc z rodičovské složky
source_up

# Kontrola povinných proměnných
: ${API_KEY:?'API_KEY is required'}

# Dynamické hodnoty
export PATH=$PWD/bin:$PATH          # Přidej lokální bin do PATH
export PROJECT_ROOT=$PWD

# Python virtualenv
layout python3                      # Automaticky aktivuje venv

# Node.js - přidej node_modules/.bin do PATH
PATH_add node_modules/.bin
```

### Praktické příklady

```bash
# 1. AWS profily per-projekt
# ~/project-a/.envrc
export AWS_PROFILE=project-a
export AWS_REGION=eu-west-1

# ~/project-b/.envrc
export AWS_PROFILE=project-b
export AWS_REGION=us-east-1

# 2. Různé Node verze (s nvm)
# .envrc
use_nvm() {
    local version=$1
    source ~/.nvm/nvm.sh
    nvm use "$version"
}
use_nvm 18

# 3. Kubernetes context
# .envrc
export KUBECONFIG=$PWD/kubeconfig.yaml

# 4. Kombinace s .env soubory (pro secrets)
# .envrc
dotenv_if_exists .env               # Veřejné proměnné (v gitu)
dotenv_if_exists .env.local         # Tajné proměnné (v .gitignore)
```

### Bezpečnost

```bash
# Po změně .envrc musíš znovu povolit
direnv allow

# Zakázat .envrc (při podezřelém souboru)
direnv deny

# Zobrazit stav
direnv status
```

---

## ncdu - Disk Usage Analyzer

Interaktivní vizualizace využití disku. Rychlejší a přehlednější než `du`.

### Instalace

```bash
# Windows (Scoop)
scoop install ncdu

# Ubuntu
sudo apt install ncdu

# macOS
brew install ncdu
```

### Použití

```bash
# Analýza aktuální složky
ncdu

# Analýza konkrétní složky
ncdu /path/to/folder

# Analýza s vyloučením složek
ncdu --exclude node_modules
ncdu --exclude .git
ncdu -x /                           # Zůstane na jednom filesystem

# Export/import pro pozdější analýzu (velké disky)
ncdu -o disk.json /                 # Uložit scan
ncdu -f disk.json                   # Načíst a prohlížet
```

### Klávesové zkratky

```bash
# Navigace
↑ / ↓       # Pohyb v seznamu
→ / Enter   # Vstup do složky
← / <       # Rodičovská složka

# Zobrazení
g           # Přepnout procenta / graf / obojí / nic
c           # Zobrazit počet položek
e           # Zobrazit skryté položky
i           # Informace o položce (přesná velikost, čas)

# Řazení
n           # Seřadit podle jména
s           # Seřadit podle velikosti (výchozí)

# Akce
d           # Smazat položku (s potvrzením!)
r           # Přepočítat aktuální složku

# Ostatní
q           # Ukončit
?           # Nápověda
```

### Aliasy

```bash
# Přidej do ~/.bashrc
alias duh='ncdu --color dark'
alias dux='ncdu --exclude node_modules --exclude .git'
```

---

## htop/btop - System Monitoring

Interaktivní monitory systému - CPU, RAM, procesy.

### Instalace

```bash
# htop
# Windows: nativně nedostupné, použij v WSL
# WSL / Ubuntu
sudo apt install htop
# macOS
brew install htop

# btop (modernější, hezčí)
# Ubuntu 22.04+
sudo apt install btop
# Starší Ubuntu / jiné
sudo snap install btop
# macOS
brew install btop
```

### htop - Základní použití

```bash
htop                        # Spuštění (interaktivní)

# Klávesové zkratky
F1 / ?      # Nápověda
F2 / S      # Setup - konfigurace zobrazení
F3 / /      # Hledání procesu podle jména
F4 / \      # Filtrování procesů
F5 / t      # Stromové zobrazení (procesy a potomci)
F6 / < >    # Řazení podle sloupce
F7 / F8     # Snížit/zvýšit prioritu (nice)
F9 / k      # Kill proces (vybrat signál)
F10 / q     # Ukončit

# Pohyb
↑ / ↓       # Výběr procesu
Space       # Označit proces (pro hromadné operace)
U           # Odznačit vše
u           # Zobrazit pouze procesy daného uživatele
H           # Skrýt/zobrazit user threads
K           # Skrýt/zobrazit kernel threads
```

### btop - Modernější alternativa

```bash
btop                        # Spuštění

# Klávesové zkratky
h / ?       # Nápověda
Esc         # Menu / zpět
1-4         # Přepínání mezi sekcemi (CPU, Memory, Network, Disks)
e           # Stromové zobrazení
p           # Řadit podle CPU
m           # Řadit podle paměti
r           # Obrátit řazení
f           # Filtrovat procesy
k           # Kill proces
s           # Signál procesu
q           # Ukončit
```

### Konfigurace btop

```bash
# ~/.config/btop/btop.conf
color_theme = "dracula"
theme_background = True
truecolor = True
rounded_corners = True
graph_symbol = "braille"          # braille, block, tty
shown_boxes = "cpu mem net proc"   # Které sekce zobrazit
update_ms = 1000                   # Refresh rate
```

---

## oh-my-posh - Moderní Prompt

Alternativa ke Starship. Cross-platform, 100+ témat.

### Instalace

```bash
# Windows (Scoop)
scoop install oh-my-posh

# Windows (Winget)
winget install JanDeDobbeleer.OhMyPosh

# macOS
brew install oh-my-posh

# Linux
curl -s https://ohmyposh.dev/install.sh | bash -s

# Aktivace (přidej do ~/.bashrc)
eval "$(oh-my-posh init bash --config ~/.poshthemes/theme.omp.json)"
```

### Témata

```bash
# Seznam všech témat
oh-my-posh get themes

# Náhled tématu
oh-my-posh print primary --config ~/path/to/theme.omp.json

# Použití vestavěného tématu
eval "$(oh-my-posh init bash --config $(oh-my-posh get themes --list | head -1))"

# Populární témata
# - agnoster
# - dracula
# - powerlevel10k_rainbow
# - atomic
# - catppuccin
```

### Vlastní téma

```json
// ~/.poshthemes/custom.omp.json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "path",
          "style": "plain",
          "foreground": "#61AFEF",
          "properties": {
            "style": "folder"
          }
        },
        {
          "type": "git",
          "style": "plain",
          "foreground": "#E5C07B",
          "properties": {
            "branch_icon": " "
          }
        },
        {
          "type": "text",
          "style": "plain",
          "foreground": "#98C379",
          "template": " ❯ "
        }
      ]
    }
  ]
}
```

### oh-my-posh vs Starship

| Vlastnost | oh-my-posh | Starship |
|-----------|------------|----------|
| Konfigurace | JSON | TOML |
| Témata | 100+ vestavěných | Méně, ale customizovatelný |
| Rychlost | Rychlý | Rychlejší |
| Windows | Nativní, PowerShell integrace | Nativní |
| Dokumentace | Dobrá | Výborná |

---

## Doporučená konfigurace ~/.bashrc

```bash
# ============================================
# CLI Tools Configuration
# ============================================

# fzf
eval "$(fzf --bash)"
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_ALT_C_COMMAND='fd --type d --hidden --follow'

# zoxide
eval "$(zoxide init bash)"

# bat
export BAT_THEME="Dracula"
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# Aliasy - nahrazení výchozích příkazů
alias ls='eza --icons'
alias ll='eza -l --icons --git'
alias la='eza -la --icons --git'
alias lt='eza --tree --level=2 --icons'
alias cat='bat --paging=never'
alias grep='rg'
alias find='fd'
alias cd='z'

# Další užitečné aliasy
alias preview='fzf --preview "bat --color=always {}"'
alias vf='code $(fzf)'                  # Otevři vybraný soubor v VS Code
```
