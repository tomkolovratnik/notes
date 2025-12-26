---
layout: default
title: Git Bash - Kurz
parent: Shell & Terminál
nav_order: 2
---

# Git Bash - Praktický kurz

Interaktivní kurz pro zvládnutí Git Bash na Windows. Od úplných základů po pokročilé techniky.

## Přehled lekcí

| Lekce | Téma | Obtížnost |
|-------|------|-----------|
| 1 | Úvod a první kroky | Začátečník |
| 2 | Navigace a práce se soubory | Začátečník |
| 3 | Klávesové zkratky a historie | Začátečník |
| 4 | Konfigurace .bashrc | Střední |
| 5 | Windows integrace | Střední |
| 6 | SSH a vzdálené připojení | Střední |
| 7 | Aliasy a funkce | Pokročilý |
| 8 | Pokročilé nástroje (fzf, ripgrep) | Pokročilý |
| 9 | Optimalizace a produktivita | Pokročilý |

---

# Lekce 1: Úvod a první kroky

## Co je Git Bash?

Git Bash je terminálové prostředí pro Windows, které ti dává:
- **Bash shell** - stejný jako na Linuxu/macOS
- **Unix nástroje** - grep, sed, awk, find, curl...
- **Git integraci** - přímo vestavěnou
- **MINGW64 prostředí** - minimalistická GNU vrstva pro Windows

## Proč používat Git Bash?

1. **Jednotnost** - stejné příkazy jako na Linuxu/macOS
2. **Produktivita** - mocné Unix nástroje
3. **Git** - nativní podpora bez dalších nástrojů
4. **Scripty** - bash skripty fungují všude

## Spuštění Git Bash

```bash
# Způsoby spuštění:
# 1. Start menu → Git Bash
# 2. Pravý klik na složku → "Git Bash Here"
# 3. Ve Windows Terminal (pokud máš přidaný profil)
```

## První příkazy

Vyzkoušej tyto příkazy a sleduj výstup:

```bash
# Kde jsem?
pwd                     # Print Working Directory - ukáže aktuální cestu

# Co je kolem mě?
ls                      # List - seznam souborů a složek
ls -la                  # Detailní výpis včetně skrytých souborů

# Kdo jsem?
whoami                  # Zobrazí tvoje uživatelské jméno

# Jaké mám prostředí?
echo $HOME              # Tvoje domovská složka
echo $PATH              # Cesty kde se hledají programy
```

### Cvičení 1.1

Odpověz na tyto otázky pomocí příkazů:
1. Jaká je tvoje domovská složka? (použij `pwd` po `cd ~`)
2. Kolik souborů je v aktuální složce? (použij `ls | wc -l`)
3. Jaká verze Git je nainstalovaná? (použij `git --version`)

## Základní struktura příkazů

```bash
příkaz [přepínače] [argumenty]

# Příklady:
ls                      # Příkaz bez přepínačů
ls -l                   # Příkaz s přepínačem
ls -la /c/Users         # Příkaz s přepínači a argumentem
```

### Získání nápovědy

```bash
příkaz --help           # Většina příkazů má --help
man příkaz              # Manuálová stránka (pokud existuje)
```

---

# Lekce 2: Navigace a práce se soubory

## Navigace ve složkách

```bash
# Pohyb ve složkách
cd /c/Users             # Jdi do složky (absolutní cesta)
cd Documents            # Jdi do podsložky (relativní cesta)
cd ..                   # O složku výš
cd ../..                # O dvě složky výš
cd ~                    # Domovská složka
cd -                    # Předchozí složka (toggle)

# Kam můžu jít?
ls                      # Co je tady?
ls -la                  # Včetně skrytých souborů
```

### Cesty v Git Bash vs Windows

```bash
# Git Bash používá Unix styl cest
/c/Users/username/Documents     # Místo C:\Users\username\Documents
/d/_Repos/project               # Místo D:\_Repos\project

# Konverze cest
cygpath -w /c/Users/username    # Unix → Windows: C:\Users\username
cygpath -u "C:\Users\username"  # Windows → Unix: /c/Users/username
```

### Cvičení 2.1 - Navigace

```bash
# Vyzkoušej tento scénář:
cd ~                    # Jdi domů
pwd                     # Ověř kde jsi
cd /c/                  # Jdi na disk C
ls                      # Co tam je?
cd -                    # Vrať se zpět
pwd                     # Měl bys být v ~
```

## Práce se soubory a složkami

```bash
# Vytváření
mkdir nova_slozka       # Vytvoř složku
mkdir -p a/b/c          # Vytvoř vnořené složky najednou
touch soubor.txt        # Vytvoř prázdný soubor

# Kopírování
cp soubor.txt kopie.txt          # Kopíruj soubor
cp -r slozka/ kopie_slozky/      # Kopíruj složku rekurzivně

# Přesouvání/přejmenování
mv stary.txt novy.txt            # Přejmenuj
mv soubor.txt /c/temp/           # Přesuň

# Mazání
rm soubor.txt                    # Smaž soubor
rm -r slozka/                    # Smaž složku rekurzivně
rm -rf slozka/                   # Smaž bez ptaní (POZOR!)
```

### Cvičení 2.2 - Práce se soubory

```bash
# Vytvoř cvičnou strukturu:
cd ~
mkdir -p kurz/{lekce1,lekce2,lekce3}
touch kurz/lekce1/notes.txt
touch kurz/lekce2/notes.txt
echo "Ahoj svete!" > kurz/lekce1/hello.txt

# Ověř strukturu:
ls -la kurz/
ls -la kurz/lekce1/

# Přečti obsah:
cat kurz/lekce1/hello.txt

# Ukliď po sobě:
rm -rf kurz/
```

## Zobrazení obsahu souborů

```bash
cat soubor.txt          # Celý obsah najednou
less soubor.txt         # Stránkování (q pro ukončení)
head -10 soubor.txt     # Prvních 10 řádků
tail -10 soubor.txt     # Posledních 10 řádků
tail -f logfile.log     # Sleduj soubor v reálném čase
```

## Wildcards (zástupné znaky)

```bash
*                       # Libovolné znaky
?                       # Jeden libovolný znak
[abc]                   # Jeden z uvedených znaků
[0-9]                   # Rozsah znaků

# Příklady:
ls *.txt                # Všechny .txt soubory
ls file?.txt            # file1.txt, fileA.txt, ...
ls image[0-9].jpg       # image0.jpg až image9.jpg
rm *.log                # Smaž všechny .log soubory
```

---

# Lekce 3: Klávesové zkratky a historie

## Pohyb kurzoru - ZÁKLADNÍ

Tyto zkratky ti ušetří hodiny času. Nauč se je zpaměti!

| Zkratka | Akce |
|---------|------|
| `Ctrl+A` | Skok na začátek řádku |
| `Ctrl+E` | Skok na konec řádku |
| `Ctrl+B` | Znak zpět (jako šipka ←) |
| `Ctrl+F` | Znak vpřed (jako šipka →) |
| `Alt+B` | Slovo zpět |
| `Alt+F` | Slovo vpřed |

### Cvičení 3.1 - Pohyb kurzoru

```bash
# Napiš tento příkaz (NESPOUŠTĚJ):
echo "Toto je dlouhy prikaz pro testovani pohybu kurzoru"

# Teď vyzkoušej:
# 1. Ctrl+A - skok na začátek
# 2. Ctrl+E - skok na konec
# 3. Alt+B - skoč o slovo zpět (opakuj)
# 4. Alt+F - skoč o slovo vpřed
```

## Editace na příkazovém řádku

| Zkratka | Akce |
|---------|------|
| `Ctrl+U` | Smaž vše před kurzorem |
| `Ctrl+K` | Smaž vše za kurzorem |
| `Ctrl+W` | Smaž slovo před kurzorem |
| `Alt+D` | Smaž slovo za kurzorem |
| `Ctrl+Y` | Vlož smazaný text (yank/paste) |
| `Ctrl+_` | Undo - vrať změnu |

### Cvičení 3.2 - Editace

```bash
# Napiš (NESPOUŠTĚJ):
echo "Toto je test editace na prikazovem radku"

# Vyzkoušej:
# 1. Ctrl+A (na začátek)
# 2. Ctrl+K (smaž vše za kurzorem - celý řádek zmizí)
# 3. Ctrl+Y (vlož zpět)
# 4. Alt+F Alt+F Alt+F (přeskoč 3 slova)
# 5. Ctrl+W (smaž slovo před kurzorem)
```

## Historie příkazů

| Zkratka | Akce |
|---------|------|
| `↑` / `Ctrl+P` | Předchozí příkaz |
| `↓` / `Ctrl+N` | Následující příkaz |
| `Ctrl+R` | Hledání v historii |
| `!!` | Opakuj poslední příkaz |
| `!$` | Poslední argument |

### Ctrl+R - Hledání v historii

Toto je **nejužitečnější zkratka**. Vyzkoušej:

```bash
# 1. Stiskni Ctrl+R
# 2. Začni psát část příkazu (např. "git")
# 3. Uvidíš poslední příkaz obsahující "git"
# 4. Ctrl+R znovu = starší shoda
# 5. Enter = spusť příkaz
# 6. Šipka doprava = edituj příkaz
# 7. Ctrl+G = zruš hledání
```

### Historie - speciální výrazy

```bash
!!                      # Poslední příkaz
sudo !!                 # Poslední příkaz jako sudo (velmi užitečné!)
!git                    # Poslední příkaz začínající "git"
!$                      # Poslední argument předchozího příkazu

# Příklad použití !$:
mkdir /tmp/novy_projekt
cd !$                   # cd /tmp/novy_projekt
```

### Cvičení 3.3 - Historie

```bash
# Spusť několik příkazů:
ls -la
pwd
echo "test"
git status

# Teď vyzkoušej:
# 1. Šipka nahoru (projdi historii)
# 2. Ctrl+R, piš "echo" (najde echo "test")
# 3. !! (zopakuje poslední příkaz)
# 4. history | head -20 (zobraz historii)
```

## Řízení terminálu

| Zkratka | Akce |
|---------|------|
| `Ctrl+C` | Zruš běžící příkaz |
| `Ctrl+Z` | Pozastav proces |
| `Ctrl+D` | Zavři terminál / EOF |
| `Ctrl+L` | Vyčisti obrazovku (jako `clear`) |

### Cvičení 3.4 - Řízení

```bash
# Vyzkoušej Ctrl+C:
sleep 100               # Spustí čekání 100 sekund
# Stiskni Ctrl+C       # Zruší příkaz

# Vyzkoušej Ctrl+L:
ls -la
ls -la
ls -la
# Stiskni Ctrl+L       # Vyčistí obrazovku
```

---

# Lekce 4: Konfigurace .bashrc

## Co je .bashrc?

`.bashrc` je konfigurační soubor, který se spustí při každém startu Git Bash. Zde si nastavíš aliasy, funkce a personalizuješ prostředí.

```bash
# Umístění konfiguračních souborů
~/.bashrc               # Hlavní konfigurace
~/.bash_profile         # Spouští se při login shellu
~/.inputrc              # Konfigurace klávesnice (readline)
~/.minttyrc             # Konfigurace terminálu (barvy, font)

# ~ na Windows = /c/Users/<username>/
```

## Vytvoření .bashrc

```bash
# Ověř jestli existuje
ls -la ~/.bashrc

# Pokud ne, vytvoř ho
touch ~/.bashrc

# Otevři k editaci
code ~/.bashrc          # Ve VS Code
# nebo
notepad ~/.bashrc       # V Notepad
```

## Základní nastavení

Zkopíruj toto do svého `.bashrc`:

```bash
# ============================================
# ZÁKLADNÍ NASTAVENÍ
# ============================================

# Lepší historie - pamatuj si více příkazů
HISTSIZE=10000                          # Počet příkazů v paměti
HISTFILESIZE=20000                      # Počet příkazů v souboru
HISTCONTROL=ignoreboth:erasedups        # Ignoruj duplicity a příkazy začínající mezerou
shopt -s histappend                     # Přidávej do historie, nepřepisuj
PROMPT_COMMAND='history -a'             # Uloží příkaz hned do souboru

# Lepší navigace
shopt -s autocd                         # cd bez psaní cd (stačí název složky)
shopt -s cdspell                        # Opravuj překlepy v cd
shopt -s dirspell                       # Opravuj překlepy v názvech složek

# Case-insensitive doplňování
bind "set completion-ignore-case on"

# Zobrazuj všechny možnosti hned
bind "set show-all-if-ambiguous on"
```

### Cvičení 4.1 - Základní konfigurace

```bash
# 1. Otevři .bashrc
code ~/.bashrc

# 2. Vlož základní nastavení výše

# 3. Ulož soubor

# 4. Načti změny (bez restartu terminálu)
source ~/.bashrc

# 5. Vyzkoušej autocd:
cd ~
mkdir test_autocd
test_autocd             # Mělo by fungovat jako "cd test_autocd"
cd ..
rmdir test_autocd
```

## Nastavení promptu (PS1)

Prompt je text, který vidíš před kurzorem. Můžeš ho přizpůsobit:

```bash
# Základní prompt s git větví
parse_git_branch() {
    git branch 2>/dev/null | grep '\*' | sed 's/* //'
}

# Barevný prompt: user@host:cesta (větev)$
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '

# Jednodušší verze - jen cesta a větev:
# PS1='\[\033[01;34m\]\w\[\033[33m\]$(__git_ps1 " (%s)")\[\033[00m\]\$ '
```

### Escape sekvence pro PS1

```bash
\u      # Uživatelské jméno
\h      # Hostname
\w      # Aktuální cesta (plná)
\W      # Aktuální složka (jen název)
\$      # $ pro uživatele, # pro root
\n      # Nový řádek
\t      # Čas (HH:MM:SS)

# Barvy (v \[\033[XXm\] ... \[\033[00m\])
01;32m  # Zelená
01;34m  # Modrá
33m     # Žlutá
31m     # Červená
00m     # Reset
```

## Reload konfigurace

Po každé změně `.bashrc`:

```bash
source ~/.bashrc
# nebo zkráceně (pokud máš alias)
reload
```

---

# Lekce 5: Windows integrace

## Spouštění Windows programů

```bash
# Přímé spuštění .exe
notepad.exe file.txt
explorer.exe .
code.exe .                            # VS Code

# Bez .exe (pokud je v PATH)
notepad file.txt
code .

# Otevři ve výchozí aplikaci
start document.pdf                    # PDF v prohlížeči
start https://github.com              # URL v prohlížeči
start .                               # Explorer v aktuální složce
```

### Cvičení 5.1 - Windows programy

```bash
# Vyzkoušej:
start .                 # Otevře Explorer v aktuální složce
code .                  # Otevře VS Code (pokud máš nainstalované)
start https://google.com # Otevře prohlížeč

# Vytvořit a otevřít soubor:
echo "Test" > test.txt
notepad test.txt        # Otevře v Notepadu
rm test.txt
```

## Schránka (Clipboard)

```bash
# Kopírování do schránky
echo "text" | clip                    # Text do schránky
cat file.txt | clip                   # Obsah souboru do schránky
pwd | clip                            # Aktuální cesta do schránky

# Čtení ze schránky
cat /dev/clipboard                    # Zobraz obsah schránky
cat /dev/clipboard > paste.txt        # Ulož do souboru
```

### Užitečné aliasy pro schránku

```bash
# Přidej do .bashrc:
alias pbcopy='clip'                     # Kopíruj (jako na macOS)
alias pbpaste='cat /dev/clipboard'      # Vlož (jako na macOS)

# Kopíruj cestu do schránky
cpwd() {
    pwd | tr -d '\n' | clip
    echo "Cesta zkopírována do schránky"
}
```

## Environment variables

```bash
# Git Bash dědí Windows proměnné
echo $PATH                            # Obsahuje Windows i Unix cesty
echo $USERPROFILE                     # C:\Users\username (Windows)
echo $HOME                            # /c/Users/username (Unix)

# Další užitečné proměnné
echo $APPDATA                         # AppData\Roaming
echo $LOCALAPPDATA                    # AppData\Local
echo $TEMP                            # Temp složka
```

## Line endings (CRLF vs LF)

Windows používá CRLF (`\r\n`), Unix používá LF (`\n`). Git to řeší:

```bash
# Doporučené nastavení pro Windows:
git config --global core.autocrlf true
# Při checkout: LF → CRLF
# Při commit: CRLF → LF

# Kontrola souboru:
file myfile.txt                       # Ukáže typ
cat -A myfile.txt                     # ^M na konci = CRLF

# Konverze:
dos2unix file.txt                     # CRLF → LF
unix2dos file.txt                     # LF → CRLF
```

## Windows-specifické funkce

Přidej do `.bashrc`:

```bash
# Otevři Explorer v aktuální složce
e() { explorer "$(cygpath -w "${1:-.}")"; }

# Otevři soubor/URL ve výchozí aplikaci
o() { start "$@"; }

# VS Code
c() { code "${@:-.}"; }

# Kopíruj Windows cestu do schránky
cpwwd() {
    cygpath -w "$(pwd)" | tr -d '\n' | clip
    echo "Windows cesta zkopírována"
}

# Kill proces podle jména
killp() {
    taskkill //F //IM "$1" 2>/dev/null || echo "Proces nenalezen: $1"
}
```

### Cvičení 5.2 - Windows integrace

```bash
# Přidej funkce do .bashrc a vyzkoušej:
source ~/.bashrc

e                       # Otevře Explorer
c                       # Otevře VS Code
cpwd                    # Zkopíruje cestu
cat /dev/clipboard      # Ověř že je tam cesta
```

---

# Lekce 6: SSH a vzdálené připojení

## Generování SSH klíče

```bash
# Ed25519 - moderní a doporučený
ssh-keygen -t ed25519 -C "tvuj@email.com"
# -t = typ klíče
# -C = komentář (pro identifikaci)

# Kam se uloží:
# ~/.ssh/id_ed25519       = privátní klíč (NIKDY NESDÍLEJ!)
# ~/.ssh/id_ed25519.pub   = veřejný klíč (tento sdílej)
```

### Cvičení 6.1 - Generování klíče

```bash
# Zkontroluj jestli už máš klíč:
ls -la ~/.ssh/

# Pokud ne, vygeneruj:
ssh-keygen -t ed25519 -C "tvuj@email.com"
# Stiskni Enter pro výchozí umístění
# Zadej passphrase (nebo prázdnou pro bez hesla)

# Zobraz veřejný klíč:
cat ~/.ssh/id_ed25519.pub
```

## Přidání klíče na GitHub

```bash
# 1. Zkopíruj veřejný klíč
cat ~/.ssh/id_ed25519.pub | clip

# 2. Jdi na GitHub → Settings → SSH and GPG keys → New SSH key
# 3. Vlož klíč a ulož

# 4. Otestuj připojení
ssh -T git@github.com
# Mělo by odpovědět: "Hi username! You've successfully authenticated..."
```

## SSH config - aliasy pro servery

Vytvoř `~/.ssh/config`:

```bash
# ~/.ssh/config

# GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

# Vlastní server (příklad)
Host myserver
    HostName 192.168.1.100
    User admin
    Port 22
    IdentityFile ~/.ssh/id_ed25519

# Zkratka pro časté připojení
Host prod
    HostName production.example.com
    User deploy
    IdentityFile ~/.ssh/id_deploy
```

Použití:

```bash
ssh myserver            # Místo: ssh admin@192.168.1.100
ssh prod                # Místo: ssh deploy@production.example.com
```

## Oprávnění souborů

SSH je striktní ohledně oprávnění:

```bash
chmod 700 ~/.ssh                      # Složka - pouze vlastník
chmod 600 ~/.ssh/id_ed25519           # Privátní klíč
chmod 644 ~/.ssh/id_ed25519.pub       # Veřejný klíč
chmod 600 ~/.ssh/config               # Config
```

## SSH Agent (automatické načtení klíčů)

Přidej do `.bashrc`:

```bash
# SSH Agent - automatické spuštění
env=~/.ssh/agent.env

agent_load_env () { test -f "$env" && . "$env" >| /dev/null ; }

agent_start () {
    (umask 077; ssh-agent >| "$env")
    . "$env" >| /dev/null ; }

agent_load_env

agent_run_state=$(ssh-add -l >| /dev/null 2>&1; echo $?)

if [ ! "$SSH_AUTH_SOCK" ] || [ $agent_run_state = 2 ]; then
    agent_start
    ssh-add
elif [ "$SSH_AUTH_SOCK" ] && [ $agent_run_state = 1 ]; then
    ssh-add
fi

unset env
```

---

# Lekce 7: Aliasy a funkce

## Aliasy - zkratky pro příkazy

```bash
# Syntaxe:
alias zkratka='příkaz'

# Navigace
alias ..='cd ..'
alias ...='cd ../..'
alias ~='cd ~'
alias -- -='cd -'                     # Předchozí složka

# Soubory
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'

# Bezpečnější operace
alias cp='cp -i'                      # Ptá se před přepsáním
alias mv='mv -i'
alias rm='rm -i'

# Git
alias g='git'
alias gs='git status'
alias ga='git add'
alias gaa='git add --all'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'
alias gl='git log --oneline -15'

# Utility
alias c='clear'
alias h='history'
alias reload='source ~/.bashrc'
```

### Cvičení 7.1 - Vlastní aliasy

```bash
# Přidej do .bashrc tyto aliasy:
alias repos='cd /d/_Repos'            # Uprav cestu k tvým projektům
alias downloads='cd ~/Downloads'
alias desktop='cd ~/Desktop'

# Reload a vyzkoušej:
source ~/.bashrc
repos
pwd
```

## Funkce - komplexnější příkazy

Funkce jsou mocnější než aliasy - mohou přijímat argumenty.

```bash
# Syntaxe:
název() {
    příkazy
    # $1, $2, ... = argumenty
    # $@ = všechny argumenty
}

# Vytvoř složku a vstup do ní
mkcd() {
    mkdir -p "$1" && cd "$1"
}
# Použití: mkcd novy_projekt

# Git: přidej vše, commitni, pushni
gacp() {
    git add --all
    git commit -m "$1"
    git push
}
# Použití: gacp "Oprava bugu"

# Najdi soubor podle názvu
ff() {
    find . -type f -iname "*$1*"
}
# Použití: ff config

# Najdi text v souborech
ftext() {
    grep -rn "$1" .
}
# Použití: ftext "TODO"
```

### Cvičení 7.2 - Vlastní funkce

```bash
# Přidej tyto funkce do .bashrc a vyzkoušej:

# Záloha souboru před editací
backup() {
    cp "$1"{,.bak.$(date +%Y%m%d_%H%M%S)}
}
# Použití: backup config.json → config.json.bak.20240115_143022

# HTTP server pro aktuální složku
serve() {
    local port=${1:-8000}
    echo "Server běží na http://localhost:$port"
    python -m http.server "$port"
}
# Použití: serve 3000

# Rychlá poznámka
note() {
    local notes_file=~/notes.md
    if [ -z "$1" ]; then
        cat "$notes_file"
    else
        echo "$(date '+%Y-%m-%d %H:%M'): $*" >> "$notes_file"
    fi
}
# Použití: note Toto je moje poznámka
# Použití: note (bez argumentu zobrazí všechny poznámky)
```

## Extrakce archivů - universální funkce

```bash
# Automaticky rozpozná formát archivu
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
# Použití: extract archiv.tar.gz
```

---

# Lekce 8: Pokročilé nástroje

## Instalace nástrojů přes Scoop

```bash
# Scoop - package manager pro Windows
# Instalace v PowerShell:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Základní nástroje
scoop install fzf                     # Fuzzy finder
scoop install ripgrep                 # Rychlejší grep (rg)
scoop install fd                      # Rychlejší find
scoop install bat                     # Lepší cat s barvami
scoop install zoxide                  # Chytřejší cd
scoop install starship                # Moderní prompt
```

## fzf - Fuzzy Finder

fzf je interaktivní filtr - umožňuje rychle vybrat z libovolného seznamu.

```bash
# Základní použití
ls | fzf                              # Vyber soubor ze seznamu
history | fzf                         # Vyber příkaz z historie

# V .bashrc povol fzf integraci:
eval "$(fzf --bash)"

# Teď můžeš:
# Ctrl+R  = interaktivní hledání v historii
# Ctrl+T  = vložit vybraný soubor
# Alt+C   = cd do vybrané složky
```

### Nastavení fzf

```bash
# Přidej do .bashrc:
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'

# fzf integrace (pokud existuje)
if command -v fzf &> /dev/null; then
    eval "$(fzf --bash)"
fi
```

## ripgrep (rg) - Rychlejší grep

```bash
# Základní hledání
rg "pattern"                          # Hledej v aktuální složce
rg "pattern" src/                     # Hledej ve složce src/
rg -i "pattern"                       # Case-insensitive
rg -w "word"                          # Celá slova

# Omezení typu souborů
rg "pattern" -t js                    # Jen .js soubory
rg "pattern" -t py                    # Jen .py soubory

# Užitečné přepínače
rg -l "pattern"                       # Jen názvy souborů
rg -c "pattern"                       # Počet shod
rg -A 3 -B 3 "pattern"               # 3 řádky před a po
```

## bat - Lepší cat

```bash
# bat zobrazuje soubory s barvami a čísly řádků
bat file.txt
bat *.js                              # Více souborů

# Jako náhrada cat (přidej do .bashrc):
command -v bat &> /dev/null && alias cat='bat --paging=never'
```

## zoxide - Chytřejší cd

zoxide si pamatuje složky, které navštěvuješ, a umožňuje rychlý skok.

```bash
# Instalace a aktivace (v .bashrc):
eval "$(zoxide init bash)"

# Použití:
z repo                                # Skočí do složky obsahující "repo"
z proj                                # Skočí do nejčastěji navštěvované složky s "proj"
zi                                    # Interaktivní výběr (s fzf)
```

## Starship - Moderní prompt

```bash
# Aktivace (v .bashrc):
eval "$(starship init bash)"

# Konfigurace (~/.config/starship.toml):
mkdir -p ~/.config
code ~/.config/starship.toml
```

Základní konfigurace Starship:

```toml
# ~/.config/starship.toml

command_timeout = 1000

format = """
$directory\
$git_branch\
$git_status\
$character"""

[character]
success_symbol = "[❯](green)"
error_symbol = "[❯](red)"

[directory]
truncation_length = 3

[git_branch]
symbol = " "
```

### Cvičení 8.1 - Instalace a konfigurace nástrojů

```bash
# 1. Otevři PowerShell jako admin a nainstaluj Scoop (pokud nemáš)

# 2. V PowerShell nainstaluj základní nástroje:
scoop install fzf zoxide starship

# 3. Zpět v Git Bash, aktualizuj .bashrc:
cat >> ~/.bashrc << 'EOF'

# FZF
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
command -v fzf &> /dev/null && eval "$(fzf --bash)"

# Zoxide
command -v zoxide &> /dev/null && eval "$(zoxide init bash)"

# Starship
command -v starship &> /dev/null && eval "$(starship init bash)"
EOF

# 4. Restartuj Git Bash a vyzkoušej:
# Ctrl+R pro fzf hledání v historii
# z <název> pro rychlý skok
```

---

# Lekce 9: Optimalizace a produktivita

## Měření rychlosti startu

```bash
# Kolik trvá start Git Bash?
time bash -i -c exit

# Benchmark (5 pokusů)
for i in {1..5}; do time bash -i -c exit; done 2>&1 | grep real

# Typické časy:
# Minimální .bashrc:     ~0.1-0.2s
# S fzf + zoxide:        ~0.2-0.4s
# S Starship:            ~0.3-0.5s
# Plná konfigurace:      ~0.5-1.0s
```

## Windows optimalizace

```bash
# 1. Windows Defender - přidej výjimky
# Nastavení → Zabezpečení Windows → Ochrana před viry → Nastavení
# Přidej výjimky pro:
# - C:\Program Files\Git
# - Složky s projekty (D:\_Repos apod.)

# 2. Vypni Ctrl+S zamrznutí (XOFF)
# Přidej do .bashrc:
stty -ixon

# 3. Flow control - pokud terminál zamrzl, Ctrl+Q odemkne
```

## Lazy loading pro rychlejší start

```bash
# Místo okamžitého načtení zoxide, načti až při prvním použití
_init_zoxide() {
    unset -f z zi
    eval "$(zoxide init bash)"
}
z() { _init_zoxide; z "$@"; }
zi() { _init_zoxide; zi "$@"; }

# Cache starship (rychlejší start)
if [[ ! -f ~/.starship.bash ]] || [[ ~/.config/starship.toml -nt ~/.starship.bash ]]; then
    starship init bash > ~/.starship.bash
fi
source ~/.starship.bash
```

## Kompletní produktivní .bashrc

Finální konfigurace zahrnující vše z kurzu:

```bash
#!/bin/bash
# ~/.bashrc - Kompletní produktivní konfigurace

# ============================================
# ZÁKLADNÍ NASTAVENÍ
# ============================================

HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend
PROMPT_COMMAND='history -a'

shopt -s autocd cdspell dirspell
stty -ixon                            # Vypni Ctrl+S zamrznutí

bind "set completion-ignore-case on"
bind "set show-all-if-ambiguous on"

# ============================================
# ALIASY
# ============================================

# Navigace
alias ..='cd ..'
alias ...='cd ../..'
alias ~='cd ~'
alias -- -='cd -'

# Soubory
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias cp='cp -i'
alias mv='mv -i'

# Git
alias g='git'
alias gs='git status'
alias ga='git add'
alias gaa='git add --all'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'
alias gl='git log --oneline -15'
alias glog='git log --oneline --graph --all'
alias gwip='git add -A && git commit -m "WIP"'
alias gundo='git reset HEAD~1 --soft'

# Utility
alias c='clear'
alias h='history'
alias reload='source ~/.bashrc'
alias bashrc='code ~/.bashrc'
alias e.='explorer .'
alias pbcopy='clip'
alias pbpaste='cat /dev/clipboard'

# ============================================
# FUNKCE
# ============================================

mkcd() { mkdir -p "$1" && cd "$1"; }
gacp() { git add --all && git commit -m "$1" && git push; }
ff() { find . -type f -iname "*$1*"; }
backup() { cp "$1"{,.bak.$(date +%Y%m%d_%H%M%S)}; }

e() { explorer "$(cygpath -w "${1:-.}")"; }
c() { code "${@:-.}"; }
cpwd() { pwd | tr -d '\n' | clip; echo "Cesta zkopírována"; }

ftext() {
    if command -v rg &> /dev/null; then
        rg "$1"
    else
        grep -rn "$1" .
    fi
}

extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"   ;;
            *.tar.gz)    tar xzf "$1"   ;;
            *.tar.xz)    tar xJf "$1"   ;;
            *.zip)       unzip "$1"     ;;
            *.7z)        7z x "$1"      ;;
            *)           echo "'$1' nelze extrahovat" ;;
        esac
    fi
}

# ============================================
# CLI NÁSTROJE
# ============================================

export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'

command -v fzf &> /dev/null && eval "$(fzf --bash)"
command -v zoxide &> /dev/null && eval "$(zoxide init bash)"
command -v starship &> /dev/null && eval "$(starship init bash)"
command -v bat &> /dev/null && alias cat='bat --paging=never'
```

## Checklist pro maximální produktivitu

- [ ] Nainstalovat Git Bash
- [ ] Vytvořit a nakonfigurovat `~/.bashrc`
- [ ] Naučit se klávesové zkratky (Ctrl+R, Ctrl+A, Ctrl+E, Ctrl+W)
- [ ] Nastavit SSH klíče pro GitHub
- [ ] Nainstalovat fzf, zoxide, starship (přes Scoop)
- [ ] Přidat vlastní aliasy a funkce
- [ ] Přidat výjimky do Windows Defender
- [ ] Procvičit příkazy každý den

---

## Další zdroje

- [git-bash.md](git-bash.md) - Kompletní referenční příručka
- [cli-tools.md](cli-tools.md) - Detailní popis CLI nástrojů
- [git.md](git.md) - Git příkazy a workflow

---

*Kurz vytvořen na základě poznámek v git-bash.md*
