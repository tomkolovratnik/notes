---
layout: default
title: Bash Scripting
parent: Shell & Terminál
nav_order: 3
---

# Bash Scripting

Základy a pokročilé techniky pro psaní bash skriptů.

> ✅ **Windows Git Bash**: Většina obsahu funguje. Výjimky jsou označeny ⚠️. Pro konfiguraci Git Bash viz [git-bash.md](git-bash.md).

## Základy

### První script

```bash
#!/bin/bash
# Shebang - určuje interpret (vždy na prvním řádku)

echo "Hello, World!"
```

### Spuštění scriptu

```bash
# Metoda 1: Přidej právo spustit
chmod +x script.sh               # Jen jednou
./script.sh                      # Spuštění

# Metoda 2: Přímo přes bash
bash script.sh

# Metoda 3: Source (spustí v aktuálním shellu)
source script.sh
. script.sh                      # Zkráceně
```

---

## Proměnné

### Definice a použití

```bash
# Definice (BEZ mezer kolem =)
NAME="John"
AGE=25
FILE_PATH="/tmp/data.txt"

# Použití
echo "Hello $NAME"               # Hello John
echo "You are ${AGE} years old"  # Závorky pro jednoznačnost
echo "File: ${FILE_PATH}.bak"    # File: /tmp/data.txt.bak

# Konstanta (readonly)
readonly PI=3.14159
PI=3                             # Error: PI is readonly

# Lokální proměnná (jen ve funkci)
local var="value"
```

### Speciální proměnné

```bash
$0          # Název scriptu
$1, $2...   # Argumenty scriptu (1., 2., ...)
$#          # Počet argumentů
$@          # Všechny argumenty jako pole (zachová uvozovky)
$*          # Všechny argumenty jako jeden string
$?          # Exit code posledního příkazu (0 = OK, jinak chyba)
$$          # PID aktuálního procesu
$!          # PID posledního background procesu
$_          # Poslední argument předchozího příkazu

# Příklad
echo "Script: $0"
echo "First arg: $1"
echo "All args: $@"
echo "Count: $#"
```

### Výchozí hodnoty

```bash
# Použij výchozí pokud proměnná není nastavená
${VAR:-default}                  # Vrátí "default" pokud VAR není set
${VAR:=default}                  # Nastaví VAR na "default" pokud není set
${VAR:?error message}            # Vyhodí chybu pokud VAR není set
${VAR:+alternative}              # Vrátí "alternative" pokud VAR JE set

# Příklady
NAME=${1:-"Guest"}               # První argument nebo "Guest"
: ${CONFIG_FILE:="/etc/app.conf"} # Nastav výchozí hodnotu
```

### Manipulace se stringy

```bash
text="Hello World"

# Délka
${#text}                         # 11

# Substring
${text:0:5}                      # "Hello" (od pozice 0, délka 5)
${text:6}                        # "World" (od pozice 6 do konce)

# Nahrazení
${text/World/Bash}               # "Hello Bash" (první výskyt)
${text//o/0}                     # "Hell0 W0rld" (všechny výskyty)

# Odebrání
${text#Hello }                   # "World" (odeber prefix)
${text%World}                    # "Hello " (odeber suffix)

# Case conversion (Bash 4+)
${text,,}                        # "hello world" (lowercase)
${text^^}                        # "HELLO WORLD" (uppercase)
```

---

## Pole (Arrays)

### Indexované pole

```bash
# Definice
FRUITS=("apple" "banana" "orange")
NUMBERS=(1 2 3 4 5)

# Přidání prvku
FRUITS+=("grape")

# Přístup k prvkům
echo ${FRUITS[0]}                # apple (první prvek)
echo ${FRUITS[-1]}               # grape (poslední prvek, Bash 4+)
echo ${FRUITS[@]}                # Všechny prvky
echo ${#FRUITS[@]}               # Počet prvků (4)
echo ${!FRUITS[@]}               # Indexy: 0 1 2 3

# Iterace
for fruit in "${FRUITS[@]}"; do
    echo "$fruit"
done

# Slice
echo ${FRUITS[@]:1:2}            # banana orange (od indexu 1, 2 prvky)

# Smazání prvku
unset FRUITS[1]                  # Smaže "banana"
```

### Asociativní pole (Bash 4+)

```bash
# Deklarace
declare -A COLORS

# Přiřazení
COLORS[red]="#FF0000"
COLORS[green]="#00FF00"
COLORS[blue]="#0000FF"

# Přístup
echo ${COLORS[red]}              # #FF0000

# Všechny klíče
echo ${!COLORS[@]}               # red green blue

# Všechny hodnoty
echo ${COLORS[@]}                # #FF0000 #00FF00 #0000FF

# Iterace
for key in "${!COLORS[@]}"; do
    echo "$key: ${COLORS[$key]}"
done
```

---

## Podmínky

### if / elif / else

```bash
if [[ condition ]]; then
    # příkazy
elif [[ another_condition ]]; then
    # příkazy
else
    # příkazy
fi
```

### Testovací operátory

```bash
# Stringy
[[ -z "$var" ]]          # Prázdný string (zero length)
[[ -n "$var" ]]          # Neprázdný string (non-zero)
[[ "$a" == "$b" ]]       # Rovná se
[[ "$a" != "$b" ]]       # Nerovná se
[[ "$a" < "$b" ]]        # Lexikograficky menší
[[ "$a" =~ regex ]]      # Regex match

# Čísla
[[ $a -eq $b ]]          # Rovná se (equal)
[[ $a -ne $b ]]          # Nerovná se (not equal)
[[ $a -lt $b ]]          # Menší (less than)
[[ $a -le $b ]]          # Menší nebo rovno (less or equal)
[[ $a -gt $b ]]          # Větší (greater than)
[[ $a -ge $b ]]          # Větší nebo rovno (greater or equal)

# Soubory
[[ -e "$file" ]]         # Existuje
[[ -f "$file" ]]         # Je soubor
[[ -d "$path" ]]         # Je složka
[[ -r "$file" ]]         # Je čitelný
[[ -w "$file" ]]         # Je zapisovatelný
[[ -x "$file" ]]         # Je spustitelný
[[ -s "$file" ]]         # Není prázdný (size > 0)
[[ "$f1" -nt "$f2" ]]    # f1 novější než f2 (newer than)
[[ "$f1" -ot "$f2" ]]    # f1 starší než f2 (older than)

# Logické operátory
[[ cond1 && cond2 ]]     # AND
[[ cond1 || cond2 ]]     # OR
[[ ! condition ]]        # NOT
```

### Příklady

```bash
# Kontrola argumentů
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

# Kontrola souboru
if [[ -f "$1" ]]; then
    echo "File exists"
elif [[ -d "$1" ]]; then
    echo "It's a directory"
else
    echo "Not found"
fi

# Kontrola příkazu
if command -v git &> /dev/null; then
    echo "Git is installed"
fi

# Regex match
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email"
fi
```

### case

```bash
case $variable in
    pattern1)
        # příkazy
        ;;
    pattern2|pattern3)
        # příkazy pro pattern2 NEBO pattern3
        ;;
    *)
        # default (nic jiného)
        ;;
esac

# Příklad
case $1 in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart)
        echo "Restarting..."
        ;;
    -h|--help)
        echo "Usage: $0 {start|stop|restart}"
        ;;
    *)
        echo "Unknown command: $1"
        exit 1
        ;;
esac

# Pattern matching v case
case $file in
    *.txt)
        echo "Text file"
        ;;
    *.jpg|*.png|*.gif)
        echo "Image file"
        ;;
    *)
        echo "Unknown type"
        ;;
esac
```

---

## Smyčky

### for

```bash
# Přes seznam hodnot
for item in apple banana orange; do
    echo "$item"
done

# Přes rozsah čísel
for i in {1..5}; do
    echo "Number: $i"
done

# S krokem
for i in {0..10..2}; do          # 0, 2, 4, 6, 8, 10
    echo "$i"
done

# C-style
for ((i=0; i<5; i++)); do
    echo "Index: $i"
done

# Přes soubory
for file in *.txt; do
    echo "Processing: $file"
done

# Přes pole
for fruit in "${FRUITS[@]}"; do
    echo "$fruit"
done

# Přes výstup příkazu
for user in $(cat /etc/passwd | cut -d: -f1); do
    echo "User: $user"
done
```

### while

```bash
# Základní while
count=0
while [[ $count -lt 5 ]]; do
    echo "Count: $count"
    ((count++))
done

# Nekonečná smyčka
while true; do
    echo "Running..."
    sleep 1
done

# Čtení souboru po řádcích
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Čtení z příkazu
while IFS= read -r line; do
    echo "Process: $line"
done < <(ps aux)

# S více proměnnými (CSV)
while IFS=, read -r name age city; do
    echo "$name is $age years old from $city"
done < data.csv
```

### until

```bash
# Opakuj DOKUD podmínka NENÍ splněna
count=0
until [[ $count -ge 5 ]]; do
    echo "Count: $count"
    ((count++))
done
```

### Řízení smyček

```bash
# break - ukončí smyčku
for i in {1..10}; do
    if [[ $i -eq 5 ]]; then
        break
    fi
    echo "$i"
done
# Vypíše: 1 2 3 4

# continue - přeskoč na další iteraci
for i in {1..5}; do
    if [[ $i -eq 3 ]]; then
        continue
    fi
    echo "$i"
done
# Vypíše: 1 2 4 5

# break N - vyskočí z N úrovní smyček
for i in {1..3}; do
    for j in {1..3}; do
        if [[ $j -eq 2 ]]; then
            break 2              # Vyskočí z obou smyček
        fi
    done
done
```

---

## Funkce

### Definice a volání

```bash
# Definice
greet() {
    echo "Hello, $1!"
}

# Alternativní syntaxe
function greet {
    echo "Hello, $1!"
}

# Volání
greet "World"                    # Hello, World!
greet "Alice"                    # Hello, Alice!
```

### Argumenty a lokální proměnné

```bash
calculate() {
    local a=$1                   # local = viditelná jen ve funkci
    local b=$2
    local result=$((a + b))
    echo $result
}

sum=$(calculate 5 3)             # sum=8
```

### Návratové hodnoty

```bash
# Return code (0-255, 0 = success)
is_even() {
    if [[ $(($1 % 2)) -eq 0 ]]; then
        return 0                 # True / Success
    else
        return 1                 # False / Failure
    fi
}

if is_even 4; then
    echo "4 is even"
fi

# Vrácení hodnoty (přes stdout)
get_date() {
    date +%Y-%m-%d
}

TODAY=$(get_date)
echo "Today is $TODAY"

# Kombinace - return code + hodnota
check_file() {
    local file=$1
    if [[ -f "$file" ]]; then
        cat "$file"              # Výstup
        return 0                 # Success
    else
        echo "File not found: $file" >&2  # Error na stderr
        return 1                 # Failure
    fi
}

if content=$(check_file "data.txt"); then
    echo "Content: $content"
else
    echo "Failed to read file"
fi
```

---

## Vstup / Výstup

### Čtení vstupu

```bash
# Základní čtení
echo "Enter your name:"
read name
echo "Hello, $name"

# S promptem
read -p "Enter your name: " name

# Skryté (pro hesla)
read -sp "Enter password: " password
echo                             # Nový řádek po skrytém vstupu

# S timeoutem
read -t 5 -p "Quick! Enter something: " answer

# Výchozí hodnota
read -p "Enter name [Guest]: " name
name=${name:-Guest}

# Čtení do pole
read -a items -p "Enter items (space separated): "
echo "First: ${items[0]}"
```

### Přesměrování

```bash
# stdout
command > file.txt               # Přepíše soubor
command >> file.txt              # Připojí k souboru

# stderr
command 2> error.log             # Stderr do souboru
command 2>> error.log            # Připojí stderr

# Kombinace
command > output.txt 2>&1        # Stdout i stderr do souboru
command &> all.log               # Zkrácená verze (Bash 4+)
command > output.txt 2> error.txt # Odděleně

# Potlačení výstupu
command > /dev/null              # Ignoruj stdout
command 2> /dev/null             # Ignoruj stderr
command &> /dev/null             # Ignoruj vše

# stdin
command < input.txt              # Čti ze souboru
```

### Here Documents

```bash
# Víceřádkový vstup
cat << EOF
This is line 1
This is line 2
Variable: $NAME
EOF

# Bez expanze proměnných (uvozovky kolem EOF)
cat << 'EOF'
This is literal $NAME
EOF

# Indentované (<<- odstraní taby)
cat <<- EOF
	Indented line 1
	Indented line 2
EOF
```

---

## Error Handling

### Exit codes

```bash
# 0 = success, 1-255 = error
exit 0                           # Úspěch
exit 1                           # Obecná chyba
exit 2                           # Špatné použití (argumenty)

# Kontrola exit code
if command; then
    echo "Success"
else
    echo "Failed with code: $?"
fi
```

### Set options

```bash
# Na začátek scriptu - doporučeno!
set -e                           # Ukonči při chybě (exit on error)
set -u                           # Ukonči při nedefinované proměnné
set -o pipefail                  # Chyba v pipe ukončí script

# Kombinace (běžná praxe)
set -euo pipefail

# Vypnutí
set +e                           # Pokračuj i při chybě
```

### Trap

```bash
# Zachycení signálů a cleanup
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/tempfile.$$
}

# Volej cleanup při ukončení
trap cleanup EXIT

# Při přerušení (Ctrl+C)
trap 'echo "Interrupted!"; exit 1' INT TERM

# Při chybě
trap 'echo "Error on line $LINENO"' ERR

# Odstranění trapu
trap - EXIT
```

### Error handling patterns

```bash
# Pattern 1: || s chybovou zprávou
command || { echo "Command failed"; exit 1; }

# Pattern 2: Explicitní kontrola
if ! command; then
    echo "Failed"
    exit 1
fi

# Pattern 3: Funkce pro chyby
die() {
    echo "ERROR: $1" >&2
    exit "${2:-1}"
}

[[ -f "$file" ]] || die "File not found: $file"

# Pattern 4: Try-catch simulace
{
    risky_command1
    risky_command2
} || {
    echo "Something failed"
    exit 1
}
```

---

## Debugging

### Debug mode

```bash
# Spuštění s debug výstupem
bash -x script.sh                # Vypíše každý příkaz před spuštěním

# V scriptu
set -x                           # Zapni debug
# ... debug sekce ...
set +x                           # Vypni debug

# Verbose mode
set -v                           # Vypíše řádky před vykonáním
```

### Debug proměnné

```bash
# Vypiš název a hodnotu proměnné
echo "DEBUG: VAR=$VAR"

# Podmíněný debug
DEBUG=${DEBUG:-false}
$DEBUG && echo "Debug: $variable"

# Debug funkce
debug() {
    [[ "$DEBUG" == "true" ]] && echo "[DEBUG] $*" >&2
}

debug "Processing file: $file"
```

### Trap pro debugging

```bash
# Vypíše každý příkaz a řádek při chybě
trap 'echo "Error: line $LINENO: $BASH_COMMAND"' ERR

# Detailní stack trace
trap 'echo "Error in ${FUNCNAME[0]} at line $LINENO"' ERR
```

---

## Praktické příklady

> ✅ Backup script a Argument parser fungují v Git Bash na Windows.
> ⚠️ Deploy script a Monitoring script obsahují Linux-specifické příkazy.

### Backup script (Windows Git Bash ✅)

```bash
#!/bin/bash
set -euo pipefail

# Konfigurace
SOURCE_DIR="${1:?Usage: $0 source_dir dest_dir}"
DEST_DIR="${2:?Usage: $0 source_dir dest_dir}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE.tar.gz"

# Kontroly
[[ -d "$SOURCE_DIR" ]] || { echo "Source not found: $SOURCE_DIR"; exit 1; }
[[ -d "$DEST_DIR" ]] || mkdir -p "$DEST_DIR"

# Backup
echo "Creating backup: $BACKUP_NAME"
tar -czf "$DEST_DIR/$BACKUP_NAME" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"

echo "Backup complete: $DEST_DIR/$BACKUP_NAME"
echo "Size: $(du -h "$DEST_DIR/$BACKUP_NAME" | cut -f1)"
```

### Deploy script (Linux ⚠️)

> ⚠️ Tento příklad používá Linux cesty a `systemctl`. Na Windows upravenou verzi viz níže.

```bash
#!/bin/bash
set -euo pipefail

# Konfigurace
ENV=${1:-production}
BRANCH=${2:-main}
APP_DIR="/var/www/app"

echo "=== Deploying to $ENV from branch $BRANCH ==="

cd "$APP_DIR"

# Záloha
echo "Creating backup..."
cp -r "$APP_DIR" "${APP_DIR}.bak.$(date +%Y%m%d)"

# Git operace
echo "Fetching latest code..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Dependencies
echo "Installing dependencies..."
npm ci --production

# Build
echo "Building..."
npm run build

# Restart
echo "Restarting service..."
sudo systemctl restart app

echo "=== Deploy complete! ==="
```

### Deploy script - Windows verze (Git Bash ✅)

```bash
#!/bin/bash
set -euo pipefail

# Konfigurace
ENV=${1:-production}
BRANCH=${2:-main}
APP_DIR="/d/_Projects/myapp"        # Windows cesta v Unix formátu

echo "=== Deploying to $ENV from branch $BRANCH ==="

cd "$APP_DIR"

# Záloha
echo "Creating backup..."
cp -r "$APP_DIR" "${APP_DIR}.bak.$(date +%Y%m%d)"

# Git operace
echo "Fetching latest code..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Dependencies
echo "Installing dependencies..."
npm ci --production

# Build
echo "Building..."
npm run build

# Na Windows: restart služby přes PowerShell nebo ruční restart
echo "Build complete! Restart the service manually or use:"
echo "  powershell -Command \"Restart-Service MyAppService\""

echo "=== Deploy complete! ==="
```

### Argument parser (Windows Git Bash ✅)

```bash
#!/bin/bash
set -euo pipefail

# Výchozí hodnoty
VERBOSE=false
OUTPUT_FILE=""
INPUT_FILES=()

# Help
usage() {
    cat << EOF
Usage: $0 [options] <input_files...>

Options:
    -v, --verbose     Verbose output
    -o, --output      Output file
    -h, --help        Show this help

Examples:
    $0 -v -o result.txt file1.txt file2.txt
EOF
}

# Parsing argumentů
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
        *)
            INPUT_FILES+=("$1")
            shift
            ;;
    esac
done

# Kontrola
if [[ ${#INPUT_FILES[@]} -eq 0 ]]; then
    echo "Error: No input files specified"
    usage
    exit 1
fi

# Hlavní logika
$VERBOSE && echo "Processing ${#INPUT_FILES[@]} files..."

for file in "${INPUT_FILES[@]}"; do
    $VERBOSE && echo "  - $file"
    # ... zpracování ...
done
```

### Monitoring script (Linux ⚠️)

> ⚠️ Používá Linux cesty a `mail`. Windows verze níže.

```bash
#!/bin/bash

# Konfigurace
THRESHOLD=90
LOG_FILE="/var/log/disk_monitor.log"
EMAIL="admin@example.com"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_disk() {
    local mount=$1
    local usage=$(df "$mount" | awk 'NR==2 {print $5}' | tr -d '%')

    if [[ $usage -gt $THRESHOLD ]]; then
        log "WARNING: $mount at ${usage}% usage"
        echo "Disk space warning: $mount at ${usage}%" | mail -s "Disk Alert" "$EMAIL"
        return 1
    else
        log "OK: $mount at ${usage}% usage"
        return 0
    fi
}

# Hlavní smyčka
log "=== Disk check started ==="
for mount in / /home /var; do
    [[ -d "$mount" ]] && check_disk "$mount"
done
log "=== Disk check completed ==="
```

### Monitoring script - Windows verze (Git Bash ✅)

```bash
#!/bin/bash

# Konfigurace
THRESHOLD=90
LOG_FILE="$HOME/disk_monitor.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_disk() {
    local drive=$1
    # df na Windows vrací jiný formát, použijeme alternativu
    local usage=$(df "$drive" 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%')

    if [[ -z "$usage" ]]; then
        log "SKIP: $drive not found"
        return 0
    fi

    if [[ $usage -gt $THRESHOLD ]]; then
        log "WARNING: $drive at ${usage}% usage"
        # Na Windows: zobraz notifikaci pomocí PowerShell
        powershell -Command "[System.Windows.Forms.MessageBox]::Show('Disk $drive at ${usage}%', 'Disk Alert')" 2>/dev/null || true
        return 1
    else
        log "OK: $drive at ${usage}% usage"
        return 0
    fi
}

# Hlavní kontrola
log "=== Disk check started ==="
for drive in /c /d /e; do
    [[ -d "$drive" ]] && check_disk "$drive"
done
log "=== Disk check completed ==="

# Zobraz výsledek
echo "Log saved to: $LOG_FILE"
```

## Viz také

- [Git Bash](git-bash.md) - Konfigurace prostředí a produktivita
- [CLI nástroje](cli-tools.md) - Moderní nástroje pro terminál
