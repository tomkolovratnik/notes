---
layout: default
title: Git Bash
parent: Shell & Terminál
nav_order: 1
---

# Git Bash - Maximální produktivita

#### Minimalistický prompt s dynamickou barvou git větve

Prompt zobrazuje cestu, git větev (žlutá = čisté, červená = změny) a znak ❯.

```toml
# ~/.config/starship.toml
# Prompt: cesta (větev) ❯
# Větev: žlutá = čisté repo, červená = změny

format = """$directory$custom$character"""

[directory]
style = "cyan"
truncation_length = 0          # Zobraz celou cestu
truncate_to_repo = false

[custom.gitbranch]
command = 'branch=$(git branch --show-current 2>/dev/null); if [ -n "$branch" ]; then if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then printf "\033[33m(%s)\033[0m" "$branch"; else printf "\033[31m(%s)\033[0m" "$branch"; fi; fi'
when = "git rev-parse --git-dir 2>/dev/null"
shell = ["bash", "--noprofile", "--norc"]
format = "$output "

[git_status]
disabled = true                # Skryj [!] a podobné symboly

[git_branch]
disabled = true                # Používáme custom modul

[character]
success_symbol = "[❯](green)"
error_symbol = "[❯](red)"
```

Výsledek: `D:\_Repos\_my-notes (master) ❯`

#### Plný prompt s moduly

Jak vytěžit maximum z Git Bash na Windows.

## Úvod a Windows specifika

Git Bash je terminálové prostředí pro Windows, které přináší:
- Bash shell (stejný jako na Linuxu/macOS)
- Unix nástroje (grep, sed, awk, find, curl...)
- Git integraci
- MINGW64 prostředí (MinGW-w64 = Minimalist GNU for Windows)


### Cesty - Unix vs Windows formát

```bash
# Git Bash používá Unix styl cest
/c/Users/username/Documents           # Místo C:\Users\username\Documents
/d/_Repos/project                     # Místo D:\_Repos\project

# Pravidla převodu:
# 1. Zpětná lomítka (\) → dopředná lomítka (/)
# 2. Disk C: → /c (malé písmeno, bez dvojtečky)

# Konverze cest pomocí cygpath
cygpath -w /c/Users/username          # Unix → Windows: C:\Users\username
cygpath -u "C:\Users\username"        # Windows → Unix: /c/Users/username
cygpath "C:\Users\username"           # Stejné jako -u (default)

# V příkazech pro Windows programy použij Windows cestu
notepad "$(cygpath -w ~/notes.txt)"

# Nebo uvozovky s lomítky
cmd //c "echo Hello"                  # Dvojité // pro Windows přepínače
```

#### cygpath - přehled přepínačů

| Přepínač | Výstup | Příklad |
|----------|--------|---------|
| `-u` | Unix cesta (default) | `/c/Users/Tom` |
| `-w` | Windows cesta | `C:\Users\Tom` |
| `-m` | Mixed (Windows s /) | `C:/Users/Tom` |
| `-d` | DOS 8.3 formát | `C:\PROGRA~1` |

```bash
# Speciální cesty
cygpath -w ~                          # C:\Users\Tom (domovský adresář)
cygpath -w .                          # C:\aktualni\adresar (pwd)
cygpath -u "$APPDATA"                 # /c/Users/Tom/AppData/Roaming

# Mixed formát (-m) - užitečný pro některé programy
cygpath -m /c/Users/Tom               # C:/Users/Tom (s dopřednými lomítky)

# Aktuální adresář v různých formátech
pwd                                   # /d/Dev/project
cygpath -w "$(pwd)"                   # D:\Dev\project
cygpath -m "$(pwd)"                   # D:/Dev/project
```

### Rychlý cd na Windows cestu

```bash
# cd s inline konverzí - zkopíruj Windows cestu a vlož mezi uvozovky
cd "$(cygpath 'C:\Users\Tom\Documents\projekt')"

# Pro cesty s mezerami funguje stejně
cd "$(cygpath 'C:\Program Files\nodejs')"

# Cesta s mezerami bez konverze - použij uvozovky
cd "/c/Program Files/nodejs"

# Drag & drop - přetáhni složku do Git Bash okna
# Automaticky se vloží správná cesta

# Tilda (~) - zkratka pro domovský adresář
cd ~                                  # Přejde do /c/Users/<username>
cd ~/Documents                        # Přejde do /c/Users/<username>/Documents
```

### Alias pro snadné cd na Windows cestu

```bash
# Přidej do ~/.bashrc
alias cdw='function _cdw(){ cd "$(cygpath "$1")"; }; _cdw'

# Použití - zkopíruj Windows cestu přímo
cdw "C:\Users\Tom\Documents"
cdw "C:\Program Files\nodejs"
```

### Spouštění Windows programů

```bash
# Přímé spuštění .exe
notepad.exe file.txt
explorer.exe .
code.exe .                            # VS Code

# Bez .exe (pokud je v PATH)
notepad file.txt
code .

# Spuštění přes cmd
cmd //c "dir"                         # Spustí Windows příkaz
cmd //c start "" "https://google.com" # Otevři URL v prohlížeči

# PowerShell z Git Bash
powershell -Command "Get-Process"
pwsh -Command "Get-Process"           # PowerShell Core
```

### Line endings (CRLF vs LF)

```bash
# Windows používá CRLF (\r\n), Unix používá LF (\n)
# Git může automaticky konvertovat

# Globální nastavení (doporučeno pro Windows)
git config --global core.autocrlf true    # Checkout: LF→CRLF, Commit: CRLF→LF

# Pro konkrétní repo (čistě LF)
git config core.autocrlf input            # Commit: CRLF→LF, Checkout: beze změny

# Kontrola souboru
file myfile.txt                           # Ukáže typ line endings
cat -A myfile.txt                         # ^M na konci = CRLF

# Konverze
dos2unix file.txt                         # CRLF → LF
unix2dos file.txt                         # LF → CRLF
sed -i 's/\r$//' file.txt                # Ruční odstranění CR
```

### Environment variables

```bash
# Git Bash dědí Windows environment variables
echo $PATH                                # Obsahuje Windows i Unix cesty
echo $USERPROFILE                         # C:\Users\username (Windows)
echo $HOME                                # /c/Users/username (Unix)

# Nastavení v .bashrc (jen pro Git Bash)
export MY_VAR="value"

# Systémové Windows proměnné (trvale)
# Nastav přes: Nastavení → Systém → Rozšířené → Environment Variables
# Nebo PowerShell: [Environment]::SetEnvironmentVariable("VAR", "value", "User")

# Přístup k Windows proměnným
echo $APPDATA                             # C:\Users\username\AppData\Roaming
echo $LOCALAPPDATA                        # C:\Users\username\AppData\Local
echo $TEMP                                # Temp složka
```

### Symlinky na Windows

```bash
# Symlinky vyžadují Developer Mode nebo Admin práva
# Nastavení → Aktualizace a zabezpečení → Pro vývojáře → Developer Mode

# Vytvoření symlinku
ln -s /path/to/target linkname

# Pokud nefunguje, Git Bash použije kopii místo symlinku
# Alternativa: Windows mklink (vyžaduje admin cmd)
cmd //c "mklink /D linkname C:\path\to\target"

# Git nastavení pro symlinky
git config --global core.symlinks true
```

### SSH konfigurace

#### Generování SSH klíče

```bash
# Generování nového SSH klíče (Ed25519 - doporučeno, moderní a bezpečný)
ssh-keygen -t ed25519 -C "email@example.com"
# -t ed25519 = typ klíče (Ed25519 je rychlejší a bezpečnější než RSA)
# -C = komentář (typicky email pro identifikaci)

# Starší RSA (pro kompatibilitu se staršími servery)
ssh-keygen -t rsa -b 4096 -C "email@example.com"
# -b 4096 = délka klíče v bitech

# Klíče jsou uloženy v ~/.ssh/
# ~/.ssh/id_ed25519     = privátní klíč (NIKDY NESDÍLEJ!)
# ~/.ssh/id_ed25519.pub = veřejný klíč (tento sdílej)

# Klíč s vlastním názvem (pro více klíčů)
ssh-keygen -t ed25519 -C "work@company.com" -f ~/.ssh/id_ed25519_work
```

#### Nahrání klíče na Linux server (přihlášení bez hesla)

```bash
# Metoda 1: ssh-copy-id (doporučeno)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.com
# Zadej heslo jednou, pak už se přihlásíš klíčem

# Metoda 2: Ruční kopírování (pokud ssh-copy-id nefunguje)
cat ~/.ssh/id_ed25519.pub | ssh user@server.com "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

# Metoda 3: Kopírování přes SCP
scp ~/.ssh/id_ed25519.pub user@server.com:~/
ssh user@server.com
# Na serveru:
mkdir -p ~/.ssh
cat ~/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
rm ~/id_ed25519.pub

# Testování připojení bez hesla
ssh user@server.com                    # Mělo by se připojit bez dotazu na heslo
```

#### Oprávnění souborů (důležité pro bezpečnost)

```bash
# Lokálně (Git Bash)
chmod 700 ~/.ssh                       # Složka - pouze vlastník
chmod 600 ~/.ssh/id_ed25519            # Privátní klíč - pouze vlastník čtení/zápis
chmod 644 ~/.ssh/id_ed25519.pub        # Veřejný klíč - vlastník čtení/zápis, ostatní čtení
chmod 600 ~/.ssh/config                # Config - pouze vlastník

# Na serveru (v ~/.ssh/)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### ~/.ssh/config - Konfigurace připojení

```bash
# ~/.ssh/config - aliasy, více účtů, custom porty

# Výchozí GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

# Druhý GitHub účet (např. pracovní)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
# Použití: git clone git@github-work:company/repo.git

# Linux server s custom portem
Host myserver
    HostName 192.168.1.100
    User admin
    Port 2222
    IdentityFile ~/.ssh/id_server

# Zkratka pro časté připojení
Host prod
    HostName production.example.com
    User deploy
    IdentityFile ~/.ssh/id_deploy
    ForwardAgent yes                   # Předá SSH agent na server
# Použití: ssh prod (místo ssh deploy@production.example.com)

# Výchozí nastavení pro všechny hosty
Host *
    AddKeysToAgent yes                 # Automaticky přidá klíče do agenta
    ServerAliveInterval 60             # Keepalive každých 60 sekund
    ServerAliveCountMax 3              # Počet pokusů před odpojením
```

#### Testování připojení

```bash
ssh -T git@github.com                  # Test GitHub
ssh -T git@github-work                 # Test druhého účtu (pokud máš)
ssh -vT git@github.com                 # Verbose pro debugging (-v, -vv, -vvv)
ssh -o BatchMode=yes user@server exit  # Test bez interakce (pro skripty)
```

#### SSH Agent na Windows

```bash
# SSH Agent - automatické spuštění (přidej do .bashrc)
env=~/.ssh/agent.env

agent_load_env () { test -f "$env" && . "$env" >| /dev/null ; }

agent_start () {
    (umask 077; ssh-agent >| "$env")
    . "$env" >| /dev/null ; }

agent_load_env

# agent_run_state: 0=running, 1=without keys, 2=not running
agent_run_state=$(ssh-add -l >| /dev/null 2>&1; echo $?)

if [ ! "$SSH_AUTH_SOCK" ] || [ $agent_run_state = 2 ]; then
    agent_start
    ssh-add
elif [ "$SSH_AUTH_SOCK" ] && [ $agent_run_state = 1 ]; then
    ssh-add
fi

unset env

# GPG - nastavení pro Git
git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
# nebo pro Gpg4win:
git config --global gpg.program "C:/Program Files (x86)/Gpg4win/../GnuPG/bin/gpg.exe"
```

### Známá omezení a workaroundy

```bash
# 1. Pomalý start Git Bash
# Řešení: Vypni Windows Defender real-time scan pro Git složky
# Nebo přidej výjimku pro: C:\Program Files\Git

# 2. Ctrl+S zamrzne terminál (XOFF)
# Řešení: Ctrl+Q pro odblokování
# Nebo přidej do .bashrc:
stty -ixon                                # Vypne flow control

# 3. Některé příkazy nefungují (sudo, apt)
# Git Bash není plný Linux - nemá package manager ani sudo
# Alternativy: Scoop, Chocolatey, Winget pro instalaci

# 4. watch příkaz není dostupný
# Řešení: Vytvoř funkci nebo nainstaluj přes Scoop
watch() {
    while true; do
        clear
        date
        echo "---"
        $@
        sleep 2
    done
}

# 5. Problémy s interaktivními programy (less, vim, nano)
# Řešení: Ujisti se, že TERM je správně nastavený
export TERM=xterm-256color

# 6. Copy/Paste
# MinTTY: Ctrl+Shift+C / Ctrl+Shift+V
# Nebo: Shift+Insert pro paste
# Prostřední tlačítko myši = paste
```

### Integrace s Windows aplikacemi

```bash
# VS Code - otevři soubor/složku
code .                                    # Aktuální složka
code file.txt                             # Konkrétní soubor
code -r .                                 # Reuse window

# Otevři ve výchozí aplikaci
start document.pdf                        # PDF v prohlížeči
start https://github.com                  # URL v prohlížeči
start .                                   # Explorer v aktuální složce
start excel.exe data.xlsx                 # Konkrétní aplikace

# Schránka (clipboard)
echo "text" | clip                        # Kopíruj do schránky
cat /dev/clipboard                        # Čti ze schránky
cat file.txt | clip                       # Obsah souboru do schránky

# Aliasy pro kompatibilitu s macOS
alias pbcopy='clip'
alias pbpaste='cat /dev/clipboard'
alias open='start'
```

### Windows Package Managery

```bash
# SCOOP (doporučeno pro Git Bash)
# Instalace v PowerShell:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

scoop search fzf                      # Hledání balíčku
scoop install fzf ripgrep fd bat      # Instalace
scoop update fzf                      # Aktualizace
scoop update *                        # Aktualizace všech
scoop list                            # Nainstalované balíčky
scoop uninstall fzf                   # Odinstalace

# WINGET (vestavěný ve Windows 11)
winget search vscode                  # Hledání
winget install Microsoft.VisualStudioCode
winget upgrade --all                  # Aktualizace všech
winget list                           # Nainstalované

# CHOCOLATEY
choco search nodejs                   # Hledání
choco install nodejs                  # Instalace
choco upgrade all                     # Aktualizace všech
```

### PowerShell z Git Bash

```bash
# Spuštění PowerShell příkazu
powershell -Command "Get-Process"
pwsh -Command "Get-Process"           # PowerShell Core

# Užitečné PowerShell příkazy z Git Bash
powershell -Command "Get-Service"                    # Seznam služeb
powershell -Command "Get-NetIPAddress"               # IP adresy
powershell -Command "Get-ComputerInfo | Select-Object OsName, OsVersion"

# Restart služby
powershell -Command "Restart-Service -Name 'servicename'"

# Otevři elevated PowerShell
powershell -Command "Start-Process powershell -Verb runAs"

# Notifikace
powershell -Command "New-BurntToastNotification -Text 'Title', 'Message'"

# Funkce pro snadné volání PowerShell
ps() {
    powershell -Command "$@"
}
# Použití: ps "Get-Process | Select-Object -First 5"
```

### Práce s Windows cestami ve scriptech

```bash
# Konverze cest
cygpath -w /c/Users/username          # Unix → Windows: C:\Users\username
cygpath -u "C:\Users\username"        # Windows → Unix: /c/Users/username
cygpath -m /c/Users/username          # Mixed (pro Java): C:/Users/username

# V scriptech - automatická konverze
WIN_PATH=$(cygpath -w "$UNIX_PATH")
UNIX_PATH=$(cygpath -u "$WIN_PATH")

# Příklad: Otevření souboru ve Windows aplikaci
open_in_notepad() {
    notepad "$(cygpath -w "$1")"
}

# Příklad: Spuštění Windows příkazu s cestou
run_windows_cmd() {
    local win_path=$(cygpath -w "$1")
    cmd //c "dir \"$win_path\""
}

# Detekce Windows vs Linux cesty
is_windows_path() {
    [[ "$1" =~ ^[A-Za-z]:\\ ]] && return 0 || return 1
}
```

### Windows-specifické funkce do .bashrc

```bash
# Otevři Explorer v aktuální složce
e() { explorer "$(cygpath -w "${1:-.}")"; }

# Otevři soubor/URL ve výchozí aplikaci
o() { start "$@"; }

# Rychlé otevření ve VS Code
c() { code "${@:-.}"; }

# Kopíruj aktuální cestu do schránky
cpwd() {
    pwd | tr -d '\n' | clip
    echo "Path copied to clipboard"
}

# Kopíruj Windows cestu do schránky
cpwwd() {
    cygpath -w "$(pwd)" | tr -d '\n' | clip
    echo "Windows path copied to clipboard"
}

# Otevři Git Bash v aktuální složce (nové okno)
newbash() {
    start "" "C:/Program Files/Git/git-bash.exe" --cd="$(pwd)"
}

# Rychlé vyhledání v PATH
which_all() {
    type -a "$1" 2>/dev/null || echo "Not found: $1"
}

# Zobraz velikost složky (Windows-friendly)
dirsize() {
    du -sh "${1:-.}" 2>/dev/null
}

# Kill proces podle jména
killp() {
    taskkill //F //IM "$1" 2>/dev/null || echo "Process not found: $1"
}

# Seznam běžících procesů (Windows)
procs() {
    tasklist //FO TABLE | head -20
}
```

### Srovnání s alternativami

| Vlastnost | Git Bash | WSL | PowerShell |
|-----------|----------|-----|------------|
| Unix příkazy | ✅ Většina | ✅ Plné | ❌ Alias |
| Windows .exe | ✅ Přímo | ⚠️ Přes .exe | ✅ Přímo |
| Rychlost startu | ✅ Rychlý | ⚠️ Pomalejší | ✅ Rychlý |
| Nativní Git | ✅ Ano | ✅ Ano | ⚠️ Přes alias |
| Package manager | ❌ Ne | ✅ apt | ✅ winget |
| Souborový systém | Windows | Linux + Windows | Windows |
| Instalace | S Git | Samostatná | Vestavěný |

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

### Základní .bashrc

```bash
# ============================================
# ZÁKLADNÍ NASTAVENÍ
# ============================================

# Lepší historie
HISTSIZE=10000                          # Počet příkazů v paměti
HISTFILESIZE=20000                      # Počet příkazů v souboru
HISTCONTROL=ignoreboth:erasedups        # Ignoruj duplicity a mezery
shopt -s histappend                     # Přidávej do historie, nepřepisuj
PROMPT_COMMAND='history -a'             # Uloží příkaz hned do souboru

# Lepší navigace
shopt -s autocd                         # cd bez psaní cd (stačí název složky)
shopt -s cdspell                        # Opravuj překlepy v cd
shopt -s dirspell                       # Opravuj překlepy v názvech složek

# Case-insensitive completion
bind "set completion-ignore-case on"

# Zobrazuj všechny možnosti hned
bind "set show-all-if-ambiguous on"

# ============================================

# Jednoduchý prompt s git větví
parse_git_branch() {
    git branch 2>/dev/null | grep '\*' | sed 's/* //'
}

# Barevný prompt: user@host:path (branch)$
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '

# Nebo jednodušší verze bez hostname:
# PS1='\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '

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
alias gwip='git add -A && git commit -m "WIP"'   # Rychlý work-in-progress commit
alias gundo='git reset HEAD~1 --soft'            # Vrať poslední commit (změny zůstanou)

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

# Najdi text v souborech (použije rg pokud existuje)
ftext() {
    if command -v rg &> /dev/null; then
        rg "$1"
    else
        grep -rn "$1" .
    fi
}

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
# POKROČILÉ FUNKCE
# ============================================

# Záloha souboru před editací
backup() { cp "$1"{,.bak.$(date +%Y%m%d_%H%M%S)}; }
# Použití: backup config.json → config.json.bak.20240115_143022

# HTTP server pro aktuální složku
serve() {
    local port=${1:-8000}
    echo "Serving on http://localhost:$port"
    python -m http.server "$port"
}

# Stáhni a extrahuj archiv
download_extract() {
    local url=$1
    local filename=$(basename "$url")
    curl -L -O "$url" && extract "$filename" && rm "$filename"
}

# Najdi proces a ukonči ho (s fzf)
fkill() {
    local pid
    pid=$(ps aux | fzf --height 40% --header-lines=1 | awk '{print $2}')
    [[ -n "$pid" ]] && kill -9 "$pid"
}

# Port scanner - kdo používá port?
port() { netstat -ano | grep ":$1"; }
# Použití: port 3000

# Rychlé poznámky
note() {
    local notes_file=~/notes.md
    if [ -z "$1" ]; then
        cat "$notes_file"  # Bez argumentu zobraz poznámky
    else
        echo "$(date '+%Y-%m-%d %H:%M'): $*" >> "$notes_file"
    fi
}

# Timer/stopky
timer() {
    local seconds=${1:-60}
    echo "Timer: $seconds seconds"
    sleep "$seconds" && echo -e "\a⏰ Time's up!"  # Bell sound
}

# ============================================
# Rychlé JSON formátování
json() { python -m json.tool "$@"; }

# Git - smaž merged větve (kromě main/master)
git-clean-branches() {
    git branch --merged | grep -v '*|main|master' | xargs -n 1 git branch -d 2>/dev/null
    echo "Merged branches cleaned"
}
# CLI NÁSTROJE (pokud máš nainstalované)
# ============================================

# FZF nastavení
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'

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

## Práce v terminálu

### Klávesové zkratky

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

### Historie příkazů

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

### MinTTY (~/.minttyrc)

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

## Prompt a terminál

### Starship prompt

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

### Windows Terminal

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

### Práce se soubory a adresáři

#### Výpis souborů (ls)

```bash
ls                                      # Základní výpis
ls -l                                   # Detailní výpis (práva, velikost, datum)
ls -la                                  # Včetně skrytých souborů (začínají tečkou)
ls -lh                                  # Human-readable velikosti (KB, MB, GB)
ls -lS                                  # Seřazeno podle velikosti (největší první)

# Řazení podle času - klasický ls
ls -lt                                  # Nejnovější první (podle času modifikace)
ls -ltr                                 # Nejstarší první
ls -lt | head -10                       # 10 naposledy změněných souborů

# Řazení podle času - eza (pokud máš alias ls=eza)
ls -l --sort=modified                   # Nejstarší první (podle času modifikace)
ls -l --sort=modified --reverse         # Nejnovější první
ls -l -snew                             # Zkratka: nejnovější první
ls -l -sold                             # Zkratka: nejstarší první
ls -l -snew | head -10                  # 10 naposledy změněných souborů
ls -R                                   # Rekurzivní výpis podadresářů
ls -d */                                # Pouze adresáře
ls *.txt                                # Pouze .txt soubory
```

#### Vytváření souborů a adresářů

```bash
touch file.txt                          # Vytvoř prázdný soubor (nebo aktualizuj čas)
touch file{1..5}.txt                    # Vytvoř file1.txt až file5.txt
mkdir folder                            # Vytvoř adresář
mkdir -p parent/child/grandchild        # Vytvoř celou cestu (včetně rodičů)
mkdir -p project/{src,tests,docs}       # Vytvoř strukturu složek najednou
mkdir -p {2024,2025}/{01..12}           # Vytvoř složky pro roky a měsíce
```

#### Kopírování (cp)

```bash
cp source.txt dest.txt                  # Kopíruj soubor
cp source.txt /path/to/folder/          # Kopíruj do jiného adresáře
cp -r source_dir/ dest_dir/             # Kopíruj adresář rekurzivně
cp -i file.txt backup/                  # Interaktivní (ptá se před přepsáním)
cp -n file.txt backup/                  # Nepřepisuj existující
cp -u source.txt dest.txt               # Kopíruj jen pokud je source novější
cp -v *.txt backup/                     # Verbose - ukazuje co kopíruje
cp -a source/ dest/                     # Archiv - zachová práva, časy, linky
cp file{,.bak}                          # Rychlá záloha: file → file.bak

# Kopírování s progress barem (pokud máš rsync)
rsync -ah --progress source/ dest/
```

#### Přesun a přejmenování (mv)

```bash
mv old.txt new.txt                      # Přejmenuj soubor
mv file.txt /path/to/folder/            # Přesuň do jiného adresáře
mv file.txt folder/newname.txt          # Přesuň a přejmenuj najednou
mv -i source.txt dest/                  # Interaktivní (ptá se před přepsáním)
mv -n source.txt dest/                  # Nepřepisuj existující
mv -v *.txt archive/                    # Verbose - ukazuje co přesouvá
mv folder/ newfolder/                   # Přejmenuj adresář

# Hromadné přejmenování
for f in *.jpeg; do mv "$f" "${f%.jpeg}.jpg"; done    # .jpeg → .jpg
for f in *.txt; do mv "$f" "prefix_$f"; done          # Přidej prefix
for f in *.TXT; do mv "$f" "${f,,}"; done             # Velká → malá písmena
```

#### Mazání (rm, rmdir)

```bash
rm file.txt                             # Smaž soubor
rm -i file.txt                          # Interaktivní (ptá se před smazáním)
rm -f file.txt                          # Force - nesmaže-li, nepíše chybu
rm *.log                                # Smaž všechny .log soubory
rm -r folder/                           # Smaž adresář rekurzivně
rm -rf folder/                          # Force rekurzivní (POZOR - nesmaže bez ptaní!)
rmdir folder/                           # Smaž prázdný adresář
rmdir -p a/b/c/                         # Smaž prázdné adresáře v cestě

# Bezpečnější mazání - přesun do koše místo smazání
mkdir -p ~/.trash
alias del='mv -t ~/.trash'              # Použití: del file.txt
```

#### Prohlížení obsahu souborů

```bash
cat file.txt                            # Vypíše celý obsah
cat file1.txt file2.txt                 # Spojí a vypíše více souborů
cat -n file.txt                         # S číslováním řádků
tac file.txt                            # Vypíše pozpátku (poslední řádek první)

less file.txt                           # Interaktivní prohlížení (q = quit)
                                        # / = hledat, n = další, N = předchozí
                                        # g = začátek, G = konec

head file.txt                           # Prvních 10 řádků
head -n 20 file.txt                     # Prvních 20 řádků
head -c 100 file.txt                    # Prvních 100 bytů

tail file.txt                           # Posledních 10 řádků
tail -n 20 file.txt                     # Posledních 20 řádků
tail -f logfile.log                     # Sleduj nové řádky (live log)
tail -f logfile.log | grep ERROR        # Sleduj jen řádky s ERROR
```

#### Vyhledávání souborů (find)

```bash
find . -name "*.txt"                    # Najdi .txt soubory (aktuální adresář)
find /path -name "file.txt"             # Hledej v konkrétní cestě
find . -iname "*.TXT"                   # Case-insensitive hledání
find . -type f                          # Pouze soubory
find . -type d                          # Pouze adresáře
find . -type f -empty                   # Prázdné soubory
find . -size +100M                      # Soubory větší než 100MB
find . -size -1k                        # Soubory menší než 1KB
find . -mtime -7                        # Změněno za posledních 7 dní
find . -mtime +30                       # Změněno před více než 30 dny
find . -user username                   # Soubory konkrétního uživatele

# Kombinace s akcemi
find . -name "*.log" -delete            # Najdi a smaž
find . -name "*.sh" -exec chmod +x {} \; # Najdi a spusť příkaz
find . -type f -name "*.txt" -exec grep -l "pattern" {} \;  # Hledej v souborech
```

#### Komprimace a archivace

```bash
# TAR (archivace bez komprese)
tar -cvf archive.tar folder/            # Vytvoř archiv (c=create, v=verbose, f=file)
tar -tvf archive.tar                    # Zobraz obsah archivu
tar -xvf archive.tar                    # Rozbal archiv

# TAR + GZIP (.tar.gz nebo .tgz)
tar -czvf archive.tar.gz folder/        # Vytvoř komprimovaný archiv
tar -tzvf archive.tar.gz                # Zobraz obsah
tar -xzvf archive.tar.gz                # Rozbal
tar -xzvf archive.tar.gz -C /target/    # Rozbal do konkrétního adresáře

# TAR + BZIP2 (.tar.bz2) - lepší komprese, pomalejší
tar -cjvf archive.tar.bz2 folder/
tar -xjvf archive.tar.bz2

# TAR + XZ (.tar.xz) - nejlepší komprese, nejpomalejší
tar -cJvf archive.tar.xz folder/
tar -xJvf archive.tar.xz

# GZIP (komprese jednotlivých souborů)
gzip file.txt                           # Komprimuj → file.txt.gz (originál smazán)
gzip -k file.txt                        # Zachovej originál
gzip -d file.txt.gz                     # Dekomprimuj
gunzip file.txt.gz                      # Totéž jako gzip -d
zcat file.txt.gz                        # Zobraz obsah bez rozbalení

# ZIP (kompatibilní s Windows)
zip archive.zip file1.txt file2.txt     # Vytvoř zip
zip -r archive.zip folder/              # Rekurzivně (celý adresář)
zip -e archive.zip folder/              # S heslem (encrypted)
unzip archive.zip                       # Rozbal
unzip archive.zip -d /target/           # Rozbal do adresáře
unzip -l archive.zip                    # Zobraz obsah

# 7-Zip (pokud nainstalováno)
7z a archive.7z folder/                 # Vytvoř archiv
7z x archive.7z                         # Rozbal
7z l archive.7z                         # Zobraz obsah
```

#### Informace o souborech a discích

```bash
file document.pdf                       # Zjisti typ souboru
stat file.txt                           # Detailní informace (práva, časy, inode)
wc file.txt                             # Počet řádků, slov, bytů
wc -l file.txt                          # Pouze počet řádků
wc -w file.txt                          # Pouze počet slov

du -h folder/                           # Velikost adresáře (human-readable)
du -sh folder/                          # Pouze celková velikost
du -sh */                               # Velikost všech podadresářů
du -ah folder/ | sort -rh | head -10    # Top 10 největších souborů

df -h                                   # Místo na discích (human-readable)
df -h .                                 # Místo na aktuálním disku
```

#### Práva a vlastnictví

```bash
# Zobrazení práv: drwxr-xr-x = typ + user + group + others
# r=read(4), w=write(2), x=execute(1)

chmod +x script.sh                      # Přidej právo spuštění
chmod -x script.sh                      # Odeber právo spuštění
chmod 755 script.sh                     # rwxr-xr-x (spustitelný skript)
chmod 644 file.txt                      # rw-r--r-- (běžný soubor)
chmod 600 private.key                   # rw------- (jen vlastník)
chmod -R 755 folder/                    # Rekurzivně na celý adresář

chown user file.txt                     # Změň vlastníka
chown user:group file.txt               # Změň vlastníka i skupinu
chown -R user:group folder/             # Rekurzivně
```

#### Linky (symbolické a pevné)

```bash
ln -s /path/to/original link_name       # Symbolický link (jako Windows shortcut)
ln -s ../relative/path link_name        # Relativní cesta
ln original.txt hardlink.txt            # Pevný link (sdílí stejná data)
readlink link_name                      # Zobraz kam link ukazuje
readlink -f link_name                   # Absolutní cesta cíle
```

#### Porovnání souborů

```bash
diff file1.txt file2.txt                # Zobraz rozdíly
diff -u file1.txt file2.txt             # Unified formát (čitelnější)
diff -y file1.txt file2.txt             # Side-by-side zobrazení
diff -r dir1/ dir2/                     # Porovnej adresáře rekurzivně
diff -q dir1/ dir2/                     # Pouze seznam rozdílných souborů

cmp file1 file2                         # Binární porovnání
md5sum file.txt                         # MD5 hash souboru
sha256sum file.txt                      # SHA256 hash souboru
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

### Command substitution

Zachycení výstupu příkazu a jeho použití jako hodnoty.

```bash
# Moderní syntaxe $(...)  - doporučená
current_date=$(date +%Y-%m-%d)         # Uloží "2024-01-15" do proměnné
echo "Dnes je $(date +%A)"             # Vloží den v týdnu přímo do textu

# Starší syntaxe `...` (backticks) - funguje stejně, ale hůř se čte a vnořuje
current_date=`date +%Y-%m-%d`

# Vnořené příkazy - $(…) se snadno vnořuje
echo "Soubory v $(basename $(pwd)): $(ls | wc -l)"

# S backticks je vnořování nepřehledné (nutné escapovat)
echo "Aktuální adresář: `basename \`pwd\``"
```

**Proč používat uvozovky `"$(...)"` ?**

```bash
# Bez uvozovek - problém pokud výstup obsahuje mezery
for f in $(ls); do echo $f; done       # Každé slovo zvlášť

# S uvozovkami - výstup jako jeden celek
filename="$(ls *.txt | head -1)"       # Bezpečné, i když název má mezery
```

**Praktické příklady:**

```bash
# Vytvoření uživatele s náhodným heslem
mosquitto_passwd -b passwd user "$(openssl rand -base64 16)"

# Záloha s datumem v názvu
tar czf "backup-$(date +%Y%m%d).tar.gz" ./data

# Git commit s počtem změněných souborů
git commit -m "Refactor ($(git diff --cached --numstat | wc -l) files)"

# Převod Windows cesty a použití
cd "$(cygpath 'C:\Users\Tom\Documents')"

# Podmínka na základě výstupu příkazu
if [ "$(git status --porcelain)" ]; then echo "Jsou změny"; fi
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

### sed - Stream Editor

```bash
# Základní nahrazení
sed 's/old/new/' file.txt              # První výskyt na řádku
sed 's/old/new/g' file.txt             # Všechny výskyty na řádku
sed 's/old/new/gi' file.txt            # Case-insensitive

# In-place editace (přepíše soubor)
sed -i 's/old/new/g' file.txt          # Linux
sed -i '' 's/old/new/g' file.txt       # macOS

# Mazání řádků
sed '/pattern/d' file.txt              # Řádky obsahující pattern
sed '/^$/d' file.txt                   # Prázdné řádky
sed '/^#/d' file.txt                   # Komentáře (začínající #)
sed '1d' file.txt                      # První řádek
sed '1,5d' file.txt                    # Řádky 1-5

# Zobrazení konkrétních řádků
sed -n '10p' file.txt                  # Řádek 10
sed -n '10,20p' file.txt               # Řádky 10-20
sed -n '/pattern/p' file.txt           # Řádky obsahující pattern

# Přidání textu
sed 's/^/prefix: /' file.txt           # Na začátek každého řádku
sed 's/$/ suffix/' file.txt            # Na konec každého řádku
sed '1i\Header line' file.txt          # Vložit před první řádek
sed '$a\Footer line' file.txt          # Přidat za poslední řádek

# Praktické příklady
sed 's/\r$//' file.txt                 # Odstranit Windows line endings (CRLF → LF)
sed 's/[[:space:]]*$//' file.txt       # Odstranit trailing whitespace
sed 's/  */ /g' file.txt               # Nahradit multiple spaces jedním
```

### awk - Pattern Scanning

```bash
# Tisk sloupců (oddělovač: whitespace)
awk '{print $1}' file.txt              # První sloupec
awk '{print $NF}' file.txt             # Poslední sloupec
awk '{print $1, $3}' file.txt          # První a třetí sloupec
awk '{print NR, $0}' file.txt          # Číslo řádku + celý řádek

# Custom oddělovač
awk -F',' '{print $2}' data.csv        # CSV - druhý sloupec
awk -F':' '{print $1}' /etc/passwd     # Dvojtečka jako oddělovač
awk -F'\t' '{print $1}' file.tsv       # Tab jako oddělovač

# Filtrování
awk '/pattern/ {print $0}' file.txt    # Řádky obsahující pattern
awk '$3 > 100 {print $0}' file.txt     # Kde 3. sloupec > 100
awk 'NR > 1 {print $0}' file.txt       # Přeskočit hlavičku (první řádek)
awk 'NF > 0' file.txt                  # Neprázdné řádky

# Výpočty
awk '{sum += $1} END {print sum}' numbers.txt           # Součet
awk '{sum += $1; n++} END {print sum/n}' numbers.txt    # Průměr
awk 'BEGIN {max=0} $1>max {max=$1} END {print max}'     # Maximum

# Praktické příklady
ps aux | awk '{print $2, $11}'         # PID a název procesu
df -h | awk 'NR>1 {print $5, $6}'      # Využití disků (bez hlavičky)
du -sh * | awk '$1 ~ /G/ {print}'      # Složky větší než 1GB
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head  # Top IP adresy
```

### Globbing patterns

Wildcards pro práci se soubory v Bash.

```bash
# Základní patterny
*               # Libovolné znaky (kromě /)
?               # Jeden libovolný znak
[abc]           # Jeden z uvedených znaků
[a-z]           # Rozsah znaků
[!abc]          # NE uvedené znaky (negace)
**              # Rekurzivně - všechny podsložky (vyžaduje shopt -s globstar)

# Příklady
ls *.js                                # Všechny .js soubory
ls test*                               # Soubory začínající "test"
ls ?.txt                               # a.txt, b.txt (jeden znak před .txt)
ls file[0-9].txt                       # file0.txt až file9.txt
ls file[!0-9].txt                      # fileA.txt, fileB.txt (ne čísla)

# Rekurzivní hledání
shopt -s globstar                      # Povol ** pattern
ls **/*.ts                             # Všechny .ts soubory ve všech podsložkách
rm -rf **/node_modules                 # Smaž node_modules rekurzivně

# Case-insensitive
shopt -s nocaseglob
ls *.TXT                               # Najde i *.txt, *.Txt, *.TXT
```

#### Extended globbing (extglob)

```bash
# Povol extended globbing
shopt -s extglob

# Patterny
?(pattern)      # 0 nebo 1 výskyt
*(pattern)      # 0 nebo více výskytů
+(pattern)      # 1 nebo více výskytů
@(pattern)      # Přesně 1 výskyt
!(pattern)      # Negace - vše kromě pattern

# Příklady
ls !(*.log)                            # Vše kromě .log souborů
ls *.@(js|ts)                          # Soubory .js nebo .ts
ls !(node_modules|dist)/               # Složky kromě node_modules a dist
rm !(important.txt)                    # Smaž vše kromě important.txt
cp *.+(js|ts|json) dest/               # Kopíruj .js, .ts, .json soubory
```

### Kombinace CLI nástrojů

Synergické použití nástrojů pro maximální produktivitu. Vyžaduje nainstalované nástroje (viz [CLI nástroje](cli-tools.md)).

```bash
# rg + fzf + bat: Interaktivní hledání v kódu
# Hledej text, vyber soubor, zobraz s náhledem
rgf() {
    local result
    result=$(rg --line-number --color=always "$1" |
        fzf --ansi --delimiter ':' \
            --preview 'bat --color=always --highlight-line {2} {1}' \
            --preview-window 'up,60%' |
        awk -F: '{print $1 ":" $2}')
    [[ -n "$result" ]] && code -g "$result"  # Otevři ve VS Code na řádku
}
# Použití: rgf "TODO"

# fd + fzf + bat: Hledání souborů s náhledem
fbat() {
    local file
    file=$(fd --type f "$1" |
        fzf --preview 'bat --color=always --style=numbers {}')
    [[ -n "$file" ]] && code "$file"
}
# Použití: fbat ".ts"

# git + fzf: Interaktivní výběr větve
gco() {
    local branch
    branch=$(git branch -a | fzf --height 40% | sed 's/^[* ]*//' | sed 's#remotes/origin/##')
    [[ -n "$branch" ]] && git checkout "$branch"
}

# git + fzf: Interaktivní git add
gaf() {
    local files
    files=$(git status -s | fzf -m --preview 'git diff --color=always {2}' | awk '{print $2}')
    [[ -n "$files" ]] && echo "$files" | xargs git add
}

# git + fzf + delta: Interaktivní diff
gdf() {
    git diff --name-only | fzf --preview 'git diff {} | delta'
}

# zoxide + fzf: Interaktivní navigace do projektu
proj() {
    local dir
    dir=$(zoxide query -l | fzf --height 40%)
    [[ -n "$dir" ]] && cd "$dir" && code .
}

# fd + rg: Hledání v konkrétním typu souboru
fd -e ts -x rg -l "interface"          # .ts soubory obsahující "interface"
fd -S +100k -e js -x rg -l "TODO"      # Velké .js soubory s TODO

# Komplexní: Statistiky projektu
project_stats() {
    echo "=== Project Statistics ==="
    echo "TypeScript files: $(fd -e ts | wc -l)"
    echo "JavaScript files: $(fd -e js | wc -l)"
    echo "TODO comments: $(rg -c TODO --type ts --type js 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')"
    echo "Total lines: $(fd -e ts -e js -x wc -l 2>/dev/null | tail -1 | awk '{print $1}')"
}
```

### fzf - Fuzzy Finder

Interaktivní vyhledávání souborů, historie a čehokoli. Game changer pro produktivitu.

```bash
# Instalace
scoop install fzf                       # Windows (Scoop)
winget install junegunn.fzf             # Windows (WinGet)

# Základní použití
fzf                                     # Interaktivní výběr souboru
cat $(fzf)                              # Vyber soubor a zobraz obsah
code $(fzf)                             # Vyber soubor a otevři ve VS Code

# Hledání v konkrétním adresáři
find ~/.config | fzf                    # Prohledej config soubory
ls -la | fzf                            # Interaktivní výběr z výpisu

# S náhledem obsahu souboru
fzf --preview 'cat {}'                  # Náhled při výběru
fzf --preview 'head -50 {}'             # Náhled prvních 50 řádků
```

#### Klávesové zkratky fzf (po integraci do .bashrc)

```bash
# Přidej do .bashrc pro aktivaci zkratek
eval "$(fzf --bash)"                    # Bash integrace

# Zkratky (po aktivaci):
# Ctrl+R  - Fuzzy hledání v historii (SUPER užitečné!)
# Ctrl+T  - Fuzzy výběr souboru a vložení do příkazu
# Alt+C   - Fuzzy cd do adresáře
```

#### Praktické fzf příklady

```bash
# Git integrace
git checkout $(git branch | fzf)                    # Přepni větev
git log --oneline | fzf | cut -d' ' -f1 | xargs git show  # Zobraz commit
git diff $(git diff --name-only | fzf)              # Diff konkrétního souboru

# Procesy
kill -9 $(ps aux | fzf | awk '{print $2}')          # Interaktivně zabij proces

# Docker
docker exec -it $(docker ps | fzf | awk '{print $1}') bash  # Připoj se ke kontejneru
docker logs $(docker ps -a | fzf | awk '{print $1}')        # Zobraz logy

# SSH
ssh $(grep "Host " ~/.ssh/config | awk '{print $2}' | fzf)  # Vyber server

# Proměnné prostředí
env | fzf                                           # Prohledej env variables
```

#### fzf konfigurace v .bashrc

```bash
# Výchozí nastavení fzf
export FZF_DEFAULT_OPTS='
  --height 40%
  --layout=reverse
  --border
  --info=inline
  --preview-window=right:50%
'

# Použij fd místo find (rychlejší, respektuje .gitignore)
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_ALT_C_COMMAND='fd --type d --hidden --follow --exclude .git'

# Náhled souborů při Ctrl+T
export FZF_CTRL_T_OPTS="--preview 'bat --color=always --style=numbers --line-range=:500 {}'"

# Náhled adresářů při Alt+C
export FZF_ALT_C_OPTS="--preview 'eza --tree --level=2 --color=always {}'"
```

### Textové utility

Nástroje pro zpracování textu, CSV, logů a datových souborů.

#### sort - Řazení

```bash
sort file.txt                           # Seřaď abecedně
sort -n file.txt                        # Seřaď numericky
sort -r file.txt                        # Seřaď obráceně (descending)
sort -u file.txt                        # Seřaď a odstraň duplicity
sort -k2 file.txt                       # Seřaď podle 2. sloupce
sort -k2 -n file.txt                    # 2. sloupec numericky
sort -t',' -k3 data.csv                 # CSV: seřaď podle 3. sloupce
sort -h sizes.txt                       # Human-readable (1K, 2M, 3G)
sort -R file.txt                        # Náhodné pořadí (shuffle)

# Praktické příklady
du -sh */ | sort -h                     # Adresáře podle velikosti
ps aux --sort=-%mem | head             # Procesy podle paměti
```

#### uniq - Unikátní řádky

```bash
# POZOR: uniq vyžaduje seřazený vstup!
sort file.txt | uniq                    # Odstraň duplicitní řádky
sort file.txt | uniq -c                 # Počet výskytů každého řádku
sort file.txt | uniq -d                 # Pouze duplicitní řádky
sort file.txt | uniq -u                 # Pouze unikátní řádky (bez duplicit)

# Praktické příklady
cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head -10
# ^ Top 10 IP adres v logu

history | awk '{print $2}' | sort | uniq -c | sort -rn | head -10
# ^ Top 10 nejpoužívanějších příkazů
```

#### cut - Výběr sloupců

```bash
cut -d',' -f1 data.csv                  # 1. sloupec CSV
cut -d',' -f1,3 data.csv                # 1. a 3. sloupec
cut -d',' -f2-4 data.csv                # Sloupce 2 až 4
cut -d':' -f1 /etc/passwd               # Uživatelská jména (Linux)
cut -c1-10 file.txt                     # Prvních 10 znaků každého řádku
cut -c5- file.txt                       # Od 5. znaku do konce

# Praktické příklady
echo $PATH | cut -d':' -f1              # První cesta v PATH
git log --oneline | cut -d' ' -f1       # Pouze hash commitů
```

#### tr - Transformace znaků

```bash
echo "hello" | tr 'a-z' 'A-Z'           # Malá → velká písmena
echo "HELLO" | tr 'A-Z' 'a-z'           # Velká → malá písmena
echo "hello" | tr -d 'l'                # Smaž všechna 'l' → heo
echo "a  b   c" | tr -s ' '             # Squeeze: smaž opakované mezery
cat file.txt | tr '\n' ' '              # Řádky → jeden řádek
echo "a,b,c" | tr ',' '\n'              # Čárky → řádky
cat file.txt | tr -d '\r'               # Odstraň Windows CRLF

# Praktické příklady
echo "Hello World" | tr ' ' '_'         # Hello_World
cat file.txt | tr -cd '[:alnum:]\n'     # Zachovej pouze alfanumerické znaky
```

#### paste - Spojení souborů vedle sebe

```bash
paste file1.txt file2.txt               # Spoj soubory vedle sebe (tab)
paste -d',' file1.txt file2.txt         # Spoj s čárkou jako oddělovačem
paste -s file.txt                       # Řádky → sloupce (transpose)
paste -d'\n' file1.txt file2.txt        # Střídavě řádky z obou souborů

# Praktické příklady
paste names.txt emails.txt | column -t  # Vytvoř tabulku ze dvou souborů
seq 1 10 | paste - - -                  # Tři sloupce z čísel 1-10
```

#### column - Formátování do sloupců

```bash
cat data.csv | column -t -s','          # CSV jako zarovnaná tabulka
mount | column -t                       # Zarovnej výstup mount
cat /etc/passwd | column -t -s':'       # Passwd jako tabulka

# Praktické příklady
echo -e "Name,Age,City\nJohn,25,Prague\nJane,30,Brno" | column -t -s','
```

#### Kombinace textových utilit

```bash
# Analýza CSV souboru
cat data.csv | tail -n +2 | cut -d',' -f3 | sort | uniq -c | sort -rn
# ^ Přeskoč header, vezmi 3. sloupec, spočítej výskyty

# Extrakce e-mailů z textu
grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file.txt | sort -u

# Frekvence slov v souboru
cat file.txt | tr -s ' ' '\n' | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn | head -20

# Log analýza - requesty za hodinu
cat access.log | cut -d'[' -f2 | cut -d':' -f1,2 | sort | uniq -c
```

### xargs - Paralelní zpracování

Převádí vstup na argumenty příkazu. Umožňuje paralelní zpracování.

```bash
# Základní použití
echo "file1 file2 file3" | xargs rm           # Smaž soubory
find . -name "*.log" | xargs rm               # Najdi a smaž .log soubory
cat urls.txt | xargs wget                     # Stáhni všechny URL

# S placeholderem {}
find . -name "*.txt" | xargs -I {} cp {} backup/     # Kopíruj každý soubor
cat files.txt | xargs -I {} echo "Processing: {}"    # Zpracuj každý řádek

# Paralelní zpracování (-P = počet procesů)
find . -name "*.jpg" | xargs -P 4 -I {} convert {} -resize 50% small_{}
cat urls.txt | xargs -P 10 -I {} curl -s {}          # 10 paralelních stahování

# Bezpečné zpracování souborů s mezerami
find . -name "*.txt" -print0 | xargs -0 rm           # Null-separated
find . -type f -print0 | xargs -0 -I {} cp {} backup/

# Omezení počtu argumentů na příkaz
echo {1..1000} | xargs -n 100 echo            # 100 čísel na řádek

# Interaktivní potvrzení
find . -name "*.tmp" | xargs -p rm            # Ptá se před každým
```

#### Praktické xargs příklady

```bash
# Git: checkout všech změněných souborů
git diff --name-only | xargs git checkout

# Kompilace všech .c souborů paralelně
find . -name "*.c" | xargs -P $(nproc) -I {} gcc -c {}

# Najdi velké soubory a zobraz detaily
find . -size +100M | xargs ls -lh

# Hromadné přejmenování
ls *.jpeg | xargs -I {} bash -c 'mv "$1" "${1%.jpeg}.jpg"' _ {}

# Docker: smaž všechny stopped kontejnery
docker ps -aq --filter "status=exited" | xargs docker rm

# Hromadný grep v souborech
find . -name "*.js" | xargs grep -l "TODO"
```

### Clipboard integrace

Kopírování mezi terminálem a Windows schránkou.

```bash
# Kopírování do schránky (Windows clip.exe)
echo "text" | clip                      # Zkopíruj text do schránky
cat file.txt | clip                     # Zkopíruj obsah souboru
pwd | clip                              # Zkopíruj aktuální cestu
git diff | clip                         # Zkopíruj git diff

# Vložení ze schránky (PowerShell)
powershell -command "Get-Clipboard"     # Zobraz obsah schránky
powershell -command "Get-Clipboard" > file.txt  # Ulož do souboru

# Užitečné aliasy do .bashrc
alias copy='clip'                       # Kratší příkaz
alias paste='powershell -command "Get-Clipboard"'

# Praktické příklady
history | tail -20 | clip               # Posledních 20 příkazů do schránky
git log --oneline -10 | clip            # Posledních 10 commitů
cat ~/.ssh/id_rsa.pub | clip            # SSH public key do schránky
echo $PATH | tr ':' '\n' | clip         # PATH jako seznam
```

#### Clipboard funkce pro .bashrc

```bash
# Kopíruj výstup příkazu
# Použití: ls -la | cb
cb() {
    cat | clip
    echo "Copied to clipboard!"
}

# Kopíruj obsah souboru
# Použití: cbf ~/.ssh/id_rsa.pub
cbf() {
    cat "$1" | clip
    echo "Copied $1 to clipboard!"
}

# Vlož a spusť příkaz ze schránky (POZOR - bezpečnost!)
# Použití: cbpaste
cbpaste() {
    powershell -command "Get-Clipboard"
}
```

### Directory jumping - zoxide

Inteligentní cd, které si pamatuje navštívené adresáře. Konec s `cd ../../../project`.

```bash
# Instalace
scoop install zoxide                    # Windows (Scoop)
winget install ajeetdsouza.zoxide       # Windows (WinGet)

# Aktivace v .bashrc
eval "$(zoxide init bash)"              # Přidej na konec .bashrc

# Základní použití (po aktivaci)
z project                               # Skoč do adresáře obsahujícího "project"
z notes                                 # Skoč do ~/notes nebo podobného
z doc down                              # Skoč do Documents/Downloads (fuzzy match)

# Interaktivní výběr (s fzf)
zi                                      # Zobraz seznam a vyber interaktivně
zi project                              # Filtrovaný interaktivní výběr

# Správa databáze
zoxide query                            # Zobraz všechny uložené cesty
zoxide query project                    # Hledej cesty obsahující "project"
zoxide add /path/to/dir                 # Ručně přidej cestu
zoxide remove /path/to/dir              # Odstraň cestu
```

#### Jak zoxide funguje

```bash
# zoxide si pamatuje frekvenci a recenci návštěv
# Čím častěji a nedávněji jsi byl v adresáři, tím vyšší skóre

# Příklad: pracuješ často v ~/projects/webapp
cd ~/projects/webapp                    # Navštívíš adresář
# ... po několika návštěvách:
z webapp                                # Skoč rovnou tam

# Pokud máš více "webapp" adresářů:
z webapp                                # Skoč do nejčastěji navštěvovaného
z projects webapp                       # Upřesni cestu
zi webapp                               # Nebo vyber interaktivně
```

#### Alternativy k zoxide

```bash
# autojump (starší, podobný koncept)
scoop install autojump
eval "$(autojump --bash)"               # V .bashrc
j project                               # Skoč do adresáře

# z.sh (originální implementace)
# Stáhni z https://github.com/rupa/z
source ~/z.sh                           # V .bashrc
z project                               # Skoč do adresáře
```

### curl a wget - HTTP requesty

Nástroje pro stahování souborů a práci s API.

#### curl - univerzální HTTP klient

```bash
# Základní requesty
curl https://example.com                # GET request, výstup na stdout
curl -o file.html https://example.com   # Ulož do souboru
curl -O https://example.com/file.zip    # Ulož s původním názvem
curl -L https://short.url               # Následuj přesměrování
curl -s https://api.example.com         # Silent mode (bez progress)

# HTTP metody
curl -X GET https://api.example.com/users
curl -X POST https://api.example.com/users
curl -X PUT https://api.example.com/users/1
curl -X DELETE https://api.example.com/users/1

# POST s daty
curl -X POST -d "name=John&age=30" https://api.example.com/users
curl -X POST -d '{"name":"John"}' -H "Content-Type: application/json" https://api.example.com/users

# Headers
curl -H "Authorization: Bearer TOKEN" https://api.example.com
curl -H "Accept: application/json" https://api.example.com
curl -I https://example.com             # Pouze headers (HEAD request)

# Autentizace
curl -u username:password https://api.example.com
curl -u username https://api.example.com  # Zeptá se na heslo

# Upload souborů
curl -F "file=@document.pdf" https://api.example.com/upload
curl -T file.txt https://api.example.com/upload

# Debugging
curl -v https://example.com             # Verbose (zobraz vše)
curl -w "%{http_code}" https://example.com  # Zobraz HTTP kód
curl -w "\nTime: %{time_total}s\n" https://example.com  # Čas requestu
```

#### Praktické curl příklady

```bash
# Testování API
curl -s https://api.github.com/users/octocat | jq .  # GitHub API + formátování

# Stažení s progress barem
curl -# -O https://example.com/large-file.zip

# Pokračování v přerušeném stahování
curl -C - -O https://example.com/large-file.zip

# Kontrola, zda web funguje
curl -s -o /dev/null -w "%{http_code}" https://example.com

# POST JSON z souboru
curl -X POST -H "Content-Type: application/json" -d @data.json https://api.example.com

# Uložení cookies a jejich použití
curl -c cookies.txt https://example.com/login -d "user=me&pass=secret"
curl -b cookies.txt https://example.com/protected

# Paralelní stahování více souborů
cat urls.txt | xargs -P 5 -I {} curl -O {}
```

#### wget - stahování souborů

```bash
# Základní stahování
wget https://example.com/file.zip       # Stáhni soubor
wget -O custom-name.zip https://example.com/file.zip  # Vlastní název
wget -c https://example.com/file.zip    # Pokračuj v přerušeném stahování
wget -q https://example.com/file.zip    # Quiet mode

# Stahování celého webu (mirror)
wget -m https://example.com             # Zrcadlo webu
wget -r -l 2 https://example.com        # Rekurzivně, max 2 úrovně
wget -p https://example.com/page.html   # Stáhni stránku + závislosti (CSS, JS)

# Hromadné stahování
wget -i urls.txt                        # Stáhni všechny URL ze souboru
wget -r -A "*.pdf" https://example.com  # Stáhni pouze PDF soubory

# Limitování rychlosti
wget --limit-rate=1m https://example.com/large.zip  # Max 1 MB/s

# S autentizací
wget --user=username --password=pass https://example.com
```

### watch - Sledování příkazů

Opakované spouštění příkazu a zobrazení výstupu v reálném čase.

```bash
# Základní použití (refresh každé 2 sekundy)
watch ls -la                            # Sleduj změny v adresáři
watch date                              # Zobraz aktuální čas
watch -n 1 date                         # Refresh každou sekundu
watch -n 5 df -h                        # Místo na disku každých 5 sekund

# Zvýrazni rozdíly od posledního běhu
watch -d ls -la                         # Zvýrazni změny
watch -d "ps aux | head -10"            # Sleduj procesy

# Ukončení při změně
watch -g "ls | wc -l"                   # Ukonči když se změní počet souborů

# Praktické příklady
watch -n 1 "docker ps"                  # Sleduj Docker kontejnery
watch -n 2 "kubectl get pods"           # Kubernetes pods
watch -n 5 "git status"                 # Git status
watch -n 1 "nvidia-smi"                 # GPU využití
watch -d "free -h"                      # Paměť se zvýrazněním změn
watch "tail -20 /var/log/app.log"       # Posledních 20 řádků logu

# Kombinace s dalšími příkazy
watch "ps aux | grep node | grep -v grep"  # Sleduj Node procesy
watch "netstat -an | grep ESTABLISHED | wc -l"  # Počet spojení
```

#### Alternativa: while loop

```bash
# Pokud watch není k dispozici nebo potřebuješ větší kontrolu
while true; do
    clear
    date
    docker ps
    sleep 2
done

# S podmínkou ukončení
while ! curl -s localhost:3000 > /dev/null; do
    echo "Waiting for server..."
    sleep 1
done
echo "Server is up!"
```

### Bash funkce

Vlastní funkce v .bashrc pro automatizaci opakujících se úkolů.

#### Základy funkcí

```bash
# Jednoduchá funkce
greet() {
    echo "Hello, $1!"                   # $1 = první argument
}
greet "World"                           # → Hello, World!

# Funkce s více argumenty
add() {
    echo $(($1 + $2))                   # $1 + $2
}
add 5 3                                 # → 8

# Funkce s default hodnotou
greet() {
    local name="${1:-User}"             # Default: "User"
    echo "Hello, $name!"
}
greet                                   # → Hello, User!
greet "John"                            # → Hello, John!

# Návratová hodnota
is_git_repo() {
    git rev-parse --git-dir > /dev/null 2>&1
    return $?                           # 0 = success, jinak = error
}

if is_git_repo; then
    echo "This is a git repository"
fi
```

#### Praktické funkce do .bashrc

```bash
# Vytvoř adresář a vstup do něj
mkcd() {
    mkdir -p "$1" && cd "$1"
}
# Použití: mkcd new-project

# Extrakce libovolného archivu
extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"     ;;
            *.tar.gz)    tar xzf "$1"     ;;
            *.tar.xz)    tar xJf "$1"     ;;
            *.bz2)       bunzip2 "$1"     ;;
            *.gz)        gunzip "$1"      ;;
            *.tar)       tar xf "$1"      ;;
            *.zip)       unzip "$1"       ;;
            *.7z)        7z x "$1"        ;;
            *.rar)       unrar x "$1"     ;;
            *)           echo "Cannot extract '$1'" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}
# Použití: extract archive.tar.gz

# Rychlý HTTP server v aktuálním adresáři
serve() {
    local port="${1:-8000}"
    echo "Serving on http://localhost:$port"
    python -m http.server "$port"
}
# Použití: serve nebo serve 3000

# Git: commit se zprávou
gc() {
    git add -A && git commit -m "$*"
}
# Použití: gc Fix bug in login form

# Git: nová větev a push
gnew() {
    git checkout -b "$1" && git push -u origin "$1"
}
# Použití: gnew feature/new-login

# Najdi a nahraď v souborech
replace() {
    local search="$1"
    local replace="$2"
    local files="${3:-.}"
    grep -rl "$search" "$files" | xargs sed -i "s/$search/$replace/g"
}
# Použití: replace "old_text" "new_text" src/

# Backup souboru s timestamp
backup() {
    cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
}
# Použití: backup important.conf

# Zobraz velikost adresářů seřazeně
dirsize() {
    du -sh "${1:-.}"/* 2>/dev/null | sort -h
}
# Použití: dirsize nebo dirsize /path

# Weather v terminálu
weather() {
    curl -s "wttr.in/${1:-Prague}?format=3"
}
# Použití: weather nebo weather London

# Cheat sheet pro příkazy (cheat.sh)
cheat() {
    curl -s "cheat.sh/$1"
}
# Použití: cheat tar nebo cheat git-rebase

# Rychlé poznámky
note() {
    local file=~/.notes.txt
    if [ -z "$1" ]; then
        cat "$file"                     # Bez argumentu = zobraz poznámky
    else
        echo "$(date '+%Y-%m-%d %H:%M'): $*" >> "$file"
        echo "Note saved!"
    fi
}
# Použití: note Buy milk nebo note (zobrazí všechny)

# Docker: vstup do kontejneru
dexec() {
    docker exec -it "$1" "${2:-bash}"
}
# Použití: dexec container_name nebo dexec container_name sh

# Najdi proces podle jména
psg() {
    ps aux | grep -i "$1" | grep -v grep
}
# Použití: psg node

# Port - kdo poslouchá na portu
port() {
    netstat -ano | grep ":$1 "
}
# Použití: port 3000
```

#### Složitější funkce

```bash
# Git log s fzf pro interaktivní výběr commitu
gshow() {
    git log --oneline --color=always | \
        fzf --ansi --preview 'git show --color=always {1}' | \
        cut -d' ' -f1 | \
        xargs git show
}

# Interaktivní výběr a smazání git větví
gbdel() {
    git branch | grep -v '^\*' | \
        fzf -m --preview 'git log --oneline -10 {}' | \
        xargs -r git branch -d
}

# Rychlé přepínání Node verzí (pokud máš nvm)
nvm_use() {
    if [ -f .nvmrc ]; then
        nvm use
    elif [ -f package.json ]; then
        local version=$(jq -r '.engines.node // empty' package.json)
        [ -n "$version" ] && nvm use "$version"
    fi
}

# Automaticky spusť nvm_use při cd (přidej do .bashrc)
cd() {
    builtin cd "$@" && nvm_use 2>/dev/null
}
```

## CLI nástroje

Přehled moderních CLI nástrojů (fzf, ripgrep, fd, bat, delta, zoxide, jq, lazygit, tmux...) najdeš v [CLI nástroje](cli-tools.md).

## Rychlý start a optimalizace

### Minimální .bashrc

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

### Performance

### Měření doby startu

```bash
# Jednoduchý test
time bash -i -c exit

# Detailní profiling - přidej dočasně na začátek .bashrc
PS4='+ $(date "+%s.%N")\011 '
exec 3>&2 2>/tmp/bashstart.$$.log
set -x
# ... obsah .bashrc ...
set +x
exec 2>&3 3>&-

# Analyzuj log
cat /tmp/bashstart.$$.log | sort -k1 -n | head -20
```

### Optimalizace .bashrc

```bash
# 1. Lazy loading nástrojů - načti až při prvním použití
# Místo: eval "$(zoxide init bash)"  (vždy se spustí)
_init_zoxide() {
    unset -f z zi
    eval "$(zoxide init bash)"
}
z() { _init_zoxide; z "$@"; }
zi() { _init_zoxide; zi "$@"; }

# 2. Kontroluj existenci nástroje před konfigurací
command -v fzf &>/dev/null && eval "$(fzf --bash)"

# 3. Cache pomalé operace (např. Starship)
# Místo: eval "$(starship init bash)"
if [[ ! -f ~/.starship.bash ]] || [[ ~/.config/starship.toml -nt ~/.starship.bash ]]; then
    starship init bash > ~/.starship.bash
fi
source ~/.starship.bash

# 4. Minimalizuj volání externích příkazů v PS1/PROMPT_COMMAND
# Špatně: PROMPT_COMMAND='echo $(git branch 2>/dev/null)'
# Dobře: Použij vestavěné __git_ps1 nebo Starship
```

### Windows specifické optimalizace

```bash
# 1. Windows Defender - přidej výjimky
# Nastavení → Zabezpečení Windows → Ochrana před viry → Nastavení
# Přidej výjimky:
# - C:\Program Files\Git
# - D:\_Repos (nebo tvoje složky s projekty)
# - ~/.bashrc, ~/.bash_profile

# 2. Antivirus obecně - vyloučit Git složky z real-time scanu

# 3. PATH optimalizace - kratší PATH = rychlejší spuštění
# Zkontroluj duplicity v PATH:
echo $PATH | tr ':' '\n' | sort | uniq -c | sort -rn | head

# 4. Vypni zbytečné funkce
# V .bashrc na začátku:
shopt -u progcomp                # Vypne programmable completion (může zrychlit)
```

### Porovnání času

```bash
# Benchmark různých konfigurací
for i in {1..5}; do time bash -i -c exit; done 2>&1 | grep real

# Typické časy:
# Minimální .bashrc:     ~0.1-0.2s
# S fzf + zoxide:        ~0.2-0.4s
# S Starship:            ~0.3-0.5s
# Plná konfigurace:      ~0.5-1.0s
```

## Viz také

- [CLI nástroje](cli-tools.md) - Detailní popis moderních nástrojů (fzf, ripgrep, bat, delta...)
- [Bash Scripting](bash-scripting.md) - Pokročilé bash programování
- [Git Bash Kurz](git-bash-kurz.md) - Strukturovaný kurz pro začátečníky (9 lekcí)
- [Git](git.md) - Git příkazy a workflows
