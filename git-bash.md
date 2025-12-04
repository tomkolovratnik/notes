# Git Bash - Maximální produktivita

Jak vytěžit maximum z Git Bash na Windows.

## Co je Git Bash

Git Bash je terminálové prostředí pro Windows, které přináší:
- Bash shell (stejný jako na Linuxu/macOS)
- Unix nástroje (grep, sed, awk, find, curl...)
- Git integraci
- MINGW64 prostředí

## Konfigurace

### Umístění konfiguračních souborů

```bash
~/.bashrc                   # Hlavní konfigurace (spouští se při startu)
~/.bash_profile             # Spouští se při login shellu
~/.inputrc                  # Konfigurace readline (klávesové zkratky)
~/.minttyrc                 # Konfigurace MinTTY terminálu (barvy, font)

# Cesta k ~ na Windows
/c/Users/<username>/
```

### Vytvoření .bashrc

```bash
# Vytvoř soubor pokud neexistuje
touch ~/.bashrc

# Edituj v VS Code
code ~/.bashrc
```

## Základní .bashrc konfigurace

```bash
# ============================================
# ZÁKLADNÍ NASTAVENÍ
# ============================================

# Lepší historie
HISTSIZE=10000                          # Počet příkazů v paměti
HISTFILESIZE=20000                      # Počet příkazů v souboru
HISTCONTROL=ignoreboth:erasedups        # Ignoruj duplicity a mezery
shopt -s histappend                     # Přidávej do historie, nepřepisuj

# Lepší navigace
shopt -s autocd                         # cd bez psaní cd (stačí název složky)
shopt -s cdspell                        # Opravuj překlepy v cd
shopt -s dirspell                       # Opravuj překlepy v názvech složek

# Case-insensitive completion
bind "set completion-ignore-case on"

# Zobrazuj všechny možnosti hned
bind "set show-all-if-ambiguous on"

# ============================================
# PROMPT (PS1)
# ============================================

# Jednoduchý prompt s git větví
parse_git_branch() {
    git branch 2>/dev/null | grep '\*' | sed 's/* //'
}

# Barevný prompt: user@host:path (branch)$
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '

# Nebo jednodušší verze bez hostname:
# PS1='\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '

# ============================================
# ALIASY - NAVIGACE
# ============================================

alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias -- -='cd -'                       # Předchozí složka

# Rychlý přístup k projektům (uprav cesty)
alias repos='cd /d/_Repos'
alias projects='cd /d/_Repos'

# ============================================
# ALIASY - SOUBORY
# ============================================

alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias ls='ls --color=auto'

# Bezpečnější operace (ptá se před přepsáním)
alias cp='cp -i'
alias mv='mv -i'
alias rm='rm -i'

# Vytvoř složku a vstup do ní
mkcd() { mkdir -p "$1" && cd "$1"; }

# ============================================
# ALIASY - GIT
# ============================================

alias g='git'
alias gs='git status'
alias ga='git add'
alias gaa='git add --all'
alias gc='git commit -m'
alias gca='git commit --amend'
alias gp='git push'
alias gpl='git pull'
alias gf='git fetch'
alias gb='git branch'
alias gco='git checkout'
alias gcb='git checkout -b'
alias gm='git merge'
alias gd='git diff'
alias gds='git diff --staged'
alias gl='git log --oneline -15'
alias glog='git log --oneline --graph --all'
alias grh='git reset HEAD'
alias grhh='git reset HEAD --hard'
alias gst='git stash'
alias gstp='git stash pop'

# ============================================
# ALIASY - UTILITY
# ============================================

alias c='clear'
alias h='history'
alias grep='grep --color=auto'
alias path='echo $PATH | tr ":" "\n"'   # Zobrazí PATH čitelně

# Rychlé editování configu
alias bashrc='code ~/.bashrc'
alias reload='source ~/.bashrc'         # Znovu načti .bashrc

# ============================================
# WINDOWS INTEGRACE
# ============================================

# Otevři Explorer v aktuální složce
alias e.='explorer .'

# Otevři soubor ve výchozí aplikaci
alias open='start'

# Clipboard
alias pbcopy='clip'                     # Kopíruj do schránky
alias pbpaste='cat /dev/clipboard'      # Vlož ze schránky

# Příklad: echo "text" | pbcopy

# ============================================
# FUNKCE
# ============================================

# Extrakce archivů (automaticky rozpozná formát)
extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"   ;;
            *.tar.gz)    tar xzf "$1"   ;;
            *.tar.xz)    tar xJf "$1"   ;;
            *.bz2)       bunzip2 "$1"   ;;
            *.gz)        gunzip "$1"    ;;
            *.tar)       tar xf "$1"    ;;
            *.tbz2)      tar xjf "$1"   ;;
            *.tgz)       tar xzf "$1"   ;;
            *.zip)       unzip "$1"     ;;
            *.7z)        7z x "$1"      ;;
            *)           echo "'$1' nelze extrahovat" ;;
        esac
    else
        echo "'$1' není platný soubor"
    fi
}

# Najdi soubor podle názvu
ff() { find . -type f -iname "*$1*"; }

# Najdi složku podle názvu
fd() { find . -type d -iname "*$1*"; }

# Najdi text v souborech
ftext() { grep -rn "$1" .; }

# Velikost složek (seřazeno)
duh() { du -h --max-depth=1 | sort -hr; }

# Git: přidej vše, commitni, pushni
gacp() {
    git add --all
    git commit -m "$1"
    git push
}

# Vytvoř .gitignore pro daný jazyk (potřebuje curl)
gitignore() {
    curl -sL "https://www.toptal.com/developers/gitignore/api/$1"
}
# Použití: gitignore node > .gitignore

# ============================================
# CLI NÁSTROJE (pokud máš nainstalované)
# ============================================

# fzf integrace
if command -v fzf &> /dev/null; then
    eval "$(fzf --bash)"
fi

# zoxide integrace
if command -v zoxide &> /dev/null; then
    eval "$(zoxide init bash)"
    alias cd='z'
fi

# Vylepšené nástroje (pokud existují)
command -v bat &> /dev/null && alias cat='bat --paging=never'
command -v eza &> /dev/null && alias ls='eza --icons' && alias ll='eza -la --icons --git'
command -v rg &> /dev/null && alias grep='rg'
```

## Klávesové zkratky v Bash

### Pohyb kurzoru

| Zkratka | Akce |
|---------|------|
| `Ctrl+A` | Začátek řádku |
| `Ctrl+E` | Konec řádku |
| `Ctrl+B` | Znak zpět (←) |
| `Ctrl+F` | Znak vpřed (→) |
| `Alt+B` | Slovo zpět |
| `Alt+F` | Slovo vpřed |
| `Ctrl+XX` | Přepni mezi začátkem řádku a kurzorem |

### Editace

| Zkratka | Akce |
|---------|------|
| `Ctrl+U` | Smaž vše před kurzorem |
| `Ctrl+K` | Smaž vše za kurzorem |
| `Ctrl+W` | Smaž slovo před kurzorem |
| `Alt+D` | Smaž slovo za kurzorem |
| `Ctrl+Y` | Vlož smazaný text (yank) |
| `Ctrl+_` | Undo |
| `Alt+T` | Prohoď slova |
| `Ctrl+T` | Prohoď znaky |

### Historie

| Zkratka | Akce |
|---------|------|
| `Ctrl+R` | Hledání v historii (zpět) |
| `Ctrl+S` | Hledání v historii (vpřed) |
| `Ctrl+P` / `↑` | Předchozí příkaz |
| `Ctrl+N` / `↓` | Následující příkaz |
| `Alt+.` | Poslední argument předchozího příkazu |
| `!!` | Opakuj poslední příkaz |
| `!$` | Poslední argument |
| `!*` | Všechny argumenty |
| `!abc` | Poslední příkaz začínající "abc" |

### Řízení

| Zkratka | Akce |
|---------|------|
| `Ctrl+C` | Zruš aktuální příkaz |
| `Ctrl+Z` | Pozastav proces (fg pro obnovení) |
| `Ctrl+D` | Zavři terminál / EOF |
| `Ctrl+L` | Vyčisti obrazovku (jako `clear`) |

## Historie příkazů - Tipy

### Rychlé použití historie

```bash
!!                      # Spusť poslední příkaz
sudo !!                 # Spusť poslední příkaz jako sudo
!git                    # Poslední příkaz začínající "git"
!?commit                # Poslední příkaz obsahující "commit"
!123                    # Příkaz číslo 123 z historie

# Argumenty z předchozího příkazu
!$                      # Poslední argument
!^                      # První argument
!*                      # Všechny argumenty

# Příklad:
mkdir /tmp/test
cd !$                   # cd /tmp/test

# Modifikátory
!!:s/old/new            # Nahraď v posledním příkazu
^old^new                # Zkrácená verze
```

### Prohledávání historie

```bash
# Interaktivní hledání
Ctrl+R                  # Začni psát, najde shodu

# Zobrazení historie
history                 # Celá historie
history 20              # Posledních 20 příkazů
history | grep git      # Filtruj příkazy s "git"

# S fzf (pokud máš nainstalované)
Ctrl+R                  # Fuzzy hledání v historii
```

## MinTTY konfigurace (~/.minttyrc)

```ini
# ~/.minttyrc - konfigurace terminálu

# Font
Font=Cascadia Code
FontHeight=11

# Velikost okna
Columns=120
Rows=35

# Barvy - Dracula theme
ForegroundColour=248,248,242
BackgroundColour=40,42,54
Black=0,0,0
Red=255,85,85
Green=80,250,123
Yellow=241,250,140
Blue=98,114,164
Magenta=255,121,198
Cyan=139,233,253
White=191,191,191
BoldBlack=104,104,104
BoldRed=255,110,103
BoldGreen=90,247,142
BoldYellow=244,249,157
BoldBlue=139,147,245
BoldMagenta=255,146,208
BoldCyan=154,237,254
BoldWhite=230,230,230

# Kurzor
CursorType=block
CursorBlinks=yes

# Chování
ScrollbackLines=10000
ConfirmExit=no
CtrlShiftShortcuts=yes

# Průhlednost (0-255)
Transparency=off
```

## Starship prompt (alternativa k PS1)

Moderní, rychlý a konfigurovatelný prompt.

### Instalace

```bash
# Windows (Scoop)
scoop install starship

# Aktivace (přidej na konec ~/.bashrc)
eval "$(starship init bash)"
```

### Konfigurace (~/.config/starship.toml)

```toml
# ~/.config/starship.toml

# Timeout pro git operace
command_timeout = 1000

# Formát promptu
format = """
$directory\
$git_branch\
$git_status\
$nodejs\
$python\
$docker_context\
$line_break\
$character"""

[character]
success_symbol = "[❯](green)"
error_symbol = "[❯](red)"

[directory]
truncation_length = 3
truncate_to_repo = true

[git_branch]
symbol = " "
format = "[$symbol$branch]($style) "

[git_status]
format = '([\[$all_status$ahead_behind\]]($style) )'

[nodejs]
symbol = " "
format = "[$symbol$version]($style) "

[python]
symbol = " "
format = "[$symbol$version]($style) "

[docker_context]
symbol = " "
format = "[$symbol$context]($style) "
```

## Windows Terminal integrace

### Přidání Git Bash do Windows Terminal

V `settings.json` přidej nový profil:

```json
{
    "profiles": {
        "list": [
            {
                "guid": "{git-bash-guid}",
                "name": "Git Bash",
                "commandline": "C:/Program Files/Git/bin/bash.exe --login -i",
                "icon": "C:/Program Files/Git/mingw64/share/git/git-for-windows.ico",
                "startingDirectory": "D:/_Repos",
                "font": {
                    "face": "Cascadia Code",
                    "size": 11
                },
                "colorScheme": "Dracula"
            }
        ]
    }
}
```

## Tipy a triky

### Práce se soubory

```bash
# Rychlé vytvoření více souborů
touch file{1..5}.txt                    # file1.txt až file5.txt
mkdir -p project/{src,tests,docs}       # Vytvoř strukturu složek

# Přejmenování více souborů
for f in *.jpeg; do mv "$f" "${f%.jpeg}.jpg"; done

# Kopírování s progress barem (pokud máš rsync)
rsync -ah --progress source/ dest/
```

### Piping a přesměrování

```bash
# Základy
command > file.txt              # Přesměruj výstup (přepíše)
command >> file.txt             # Přesměruj výstup (připojí)
command 2>&1                    # Stderr do stdout
command &> file.txt             # Stdout i stderr do souboru

# Praktické příklady
ls -la | head -10               # Prvních 10 řádků
cat file.txt | sort | uniq      # Seřaď a odstraň duplicity
history | grep git | tail -20   # Posledních 20 git příkazů

# Tee - výstup na obrazovku i do souboru
command | tee output.txt
command | tee -a output.txt     # Připojí místo přepsání
```

### Process substitution

```bash
# Porovnání výstupu dvou příkazů
diff <(ls dir1) <(ls dir2)

# Zpracování výstupu jako souboru
while read line; do echo "$line"; done < <(ls -la)
```

### Běh na pozadí

```bash
# Spusť na pozadí
command &

# Spusť a odpoj od terminálu
nohup command &

# Pozastavený proces
Ctrl+Z                          # Pozastav
bg                              # Pokračuj na pozadí
fg                              # Vrať do popředí
jobs                            # Seznam procesů
```

### Užitečné one-linery

```bash
# Najdi největší soubory
find . -type f -exec du -h {} + | sort -rh | head -10

# Počet řádků kódu v projektu
find . -name "*.js" | xargs wc -l | tail -1

# Smaž node_modules rekurzivně
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Sleduj soubor v reálném čase
tail -f logfile.log

# Watch - opakuj příkaz každé 2 sekundy
watch -n 2 'git status'

# Najdi a nahraď v souborech
find . -name "*.txt" -exec sed -i 's/old/new/g' {} +

# HTTP server pro aktuální složku
python -m http.server 8000

# JSON pretty print
cat file.json | python -m json.tool

# Generuj náhodné heslo
openssl rand -base64 16

# Stáhni soubor
curl -O https://example.com/file.zip
wget https://example.com/file.zip
```

## Doporučené nástroje k instalaci

Pro maximální produktivitu nainstaluj tyto nástroje (viz [CLI nástroje](cli-tools.md)):

```bash
# Windows (Scoop) - doporučeno
scoop install fzf ripgrep fd bat eza delta zoxide jq starship

# Minimum pro začátek
scoop install fzf zoxide starship
```

## Rychlý start - Minimální .bashrc

Pokud chceš rychle začít, zkopíruj toto:

```bash
# ~/.bashrc - Minimální produktivní konfigurace

# Historie
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend

# Navigace
shopt -s autocd cdspell

# Aliasy
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -alF --color=auto'
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'
alias gl='git log --oneline -15'
alias c='clear'
alias e.='explorer .'
alias reload='source ~/.bashrc'

# Funkce
mkcd() { mkdir -p "$1" && cd "$1"; }
gacp() { git add --all && git commit -m "$1" && git push; }

# fzf (pokud máš)
[ -f ~/.fzf.bash ] && source ~/.fzf.bash
command -v fzf &> /dev/null && eval "$(fzf --bash)"

# zoxide (pokud máš)
command -v zoxide &> /dev/null && eval "$(zoxide init bash)"

# starship (pokud máš)
command -v starship &> /dev/null && eval "$(starship init bash)"
```

Po úpravě `.bashrc` spusť:

```bash
source ~/.bashrc
# nebo
reload                          # Pokud máš alias
```
