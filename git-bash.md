# Git Bash - Maximální produktivita

Jak vytěžit maximum z Git Bash na Windows.

## Co je Git Bash

Git Bash je terminálové prostředí pro Windows, které přináší:
- Bash shell (stejný jako na Linuxu/macOS)
- Unix nástroje (grep, sed, awk, find, curl...)
- Git integraci
- MINGW64 prostředí (MinGW-w64 = Minimalist GNU for Windows)

## Windows specifika

### Cesty - Unix vs Windows formát

```bash
# Git Bash používá Unix styl cest
/c/Users/username/Documents           # Místo C:\Users\username\Documents
/d/_Repos/project                     # Místo D:\_Repos\project

# Konverze cest
cygpath -w /c/Users/username          # Unix → Windows: C:\Users\username
cygpath -u "C:\Users\username"        # Windows → Unix: /c/Users/username

# V příkazech pro Windows programy použij Windows cestu
notepad "$(cygpath -w ~/notes.txt)"

# Nebo uvozovky s lomítky
cmd //c "echo Hello"                  # Dvojité // pro Windows přepínače
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

## Performance - Zrychlení Git Bash

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
