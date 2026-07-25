---
layout: default
title: Linux / Bash
parent: Shell & Terminál
nav_order: 5
---

# Linux / Bash (Ubuntu)

## Základní příkazy

```bash
# Navigace
pwd                             # Zobrazení aktuální cesty
cd <path>                       # Přechod do adresáře
ls -la                          # Výpis souborů včetně skrytých (detailní)

# Soubory
cp <source> <dest>              # Kopírování souboru
mv <source> <dest>              # Přesun/přejmenování souboru
rm <file>                       # Smazání souboru
mkdir <dir>                     # Vytvoření adresáře
touch <file>                    # Vytvoření prázdného souboru
ln -s <target> <link>           # Vytvoření symbolického odkazu

# Obsah
cat <file>                      # Zobrazení obsahu souboru
head <file>                     # Zobrazení prvních řádků
tail <file>                     # Zobrazení posledních řádků
grep <pattern> <file>           # Vyhledání textu v souboru
wc -l <file>                    # Počet řádků v souboru
sort <file>                     # Seřazení řádků
uniq <file>                     # Odstranění duplicitních (sousedních) řádků

# Oprávnění
chmod +x <file>                 # Přidání práva spuštění
chown <user>:<group> <file>     # Změna vlastníka souboru
```

## Aktualizace systému (Ubuntu)

### Základní aktualizace
```bash
# Aktualizace seznamu balíčků
sudo apt update

# Aktualizace nainstalovaných balíčků
sudo apt upgrade

# Aktualizace včetně závislostí (může odstranit staré balíčky)
sudo apt full-upgrade

# Kompletní aktualizace (update + upgrade)
sudo apt update && sudo apt upgrade -y

# Automatické odstranění nepotřebných balíčků
sudo apt autoremove

# Vyčištění cache stažených balíčků
sudo apt clean
```

### Správa balíčků
```bash
# Instalace balíčku
sudo apt install <package>

# Odstranění balíčku
sudo apt remove <package>

# Odstranění včetně konfiguračních souborů
sudo apt purge <package>

# Vyhledání balíčku
apt search <name>

# Informace o balíčku
apt show <package>

# Seznam nainstalovaných balíčků
apt list --installed
```

### Aktualizace distribuce (upgrade na novou verzi Ubuntu)
```bash
# Kontrola dostupných aktualizací distribuce
sudo do-release-upgrade -c

# Aktualizace na novou verzi Ubuntu
sudo do-release-upgrade
```

### Užitečné kombinace
```bash
# Kompletní údržba systému (update + upgrade + cleanup)
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y && sudo apt clean

# Aktualizace seznamu a instalace balíčku v jednom
sudo apt update && sudo apt install <package>

# Oprava problémů se závislostmi
sudo apt --fix-broken install
```

## Užitečné skripty

```bash
# Najít soubory starší než 30 dní
find . -type f -mtime +30

# Velikost složky (human-readable)
du -sh <directory>

# Rekurzivní hledání textu v souborech
grep -r "pattern" /path/to/search

# Najít velké soubory (větší než 100MB)
find / -type f -size +100M

# Procesy
ps aux | grep <name>            # Najít proces podle jména
kill <pid>                      # Ukončit proces podle PID
killall <name>                  # Ukončit všechny procesy daného jména

# Diskový prostor (human-readable)
df -h

# Historie příkazů
history                         # Zobrazení historie zadaných příkazů

# Plánované úlohy (cron)
crontab -e                      # Úprava plánovaných úloh aktuálního uživatele
crontab -l                      # Výpis plánovaných úloh aktuálního uživatele
```

## Síť

```bash
ping <host>                     # Test dostupnosti hostitele
curl <url>                      # Stažení/otestování obsahu z URL
wget <url>                      # Stažení souboru z URL
ss -tulpn                       # Výpis naslouchajících portů a procesů
scp <source> <user>@<host>:<dest>  # Kopírování souboru přes SSH
```

## Archivy

```bash
tar -czvf archiv.tar.gz <dir>   # Vytvoření komprimovaného archivu (gzip)
tar -xzvf archiv.tar.gz         # Rozbalení komprimovaného archivu
zip -r archiv.zip <dir>         # Vytvoření zip archivu
unzip archiv.zip                # Rozbalení zip archivu
```

## Systemd služby

```bash
sudo systemctl status <service>    # Stav služby
sudo systemctl start <service>     # Spuštění služby
sudo systemctl stop <service>      # Zastavení služby
sudo systemctl restart <service>   # Restart služby
sudo systemctl enable <service>    # Povolení automatického spuštění při startu
sudo systemctl disable <service>   # Zakázání automatického spuštění při startu
journalctl -u <service>            # Zobrazení logů dané služby
```

## Uživatelé a oprávnění

```bash
whoami                          # Aktuálně přihlášený uživatel
id                               # Informace o UID/GID a skupinách uživatele
sudo su -                       # Přepnutí na root uživatele
passwd                          # Změna hesla aktuálního uživatele
sudo adduser <user>             # Vytvoření nového uživatele
```

## tmux

### Instalace
```bash
sudo apt install tmux                   # Instalace tmux
```

### Správa sessions
```bash
tmux                                    # Spuštění nové session
tmux new -s <name>                      # Spuštění nové session s názvem
tmux new-session -A -s <name>           # Připojení k session, pokud existuje; jinak ji vytvoří (funguje i po náhodném exitu všech sessions)
tmux new -A -s <name>                   # Zkrácená verze výše
tmux ls                                 # Výpis všech sessions
tmux attach -t <name>                   # Připojení k session podle názvu
tmux a -t <name>                        # Zkrácené připojení k session podle názvu
tmux a                                  # Zkrácené připojení k poslední session
tmux attach -t 0                        # Připojení k první session
tmux rename-session -t <old> <new>      # Přejmenování session
tmux kill-session -t <name>             # Ukončení session
tmux kill-server                        # Ukončení všech sessions a tmux serveru
```

### Vzdálené připojení k session
```bash
# Připojení přes mosh (preferováno – odolné vůči výpadkům spojení)
mosh <user>@<host> -- tmux attach -t <name>

# Fallback přes SSH (pokud mosh UDP neprojde)
ssh -t <user>@<host> tmux attach -t <name>
```

### Klávesové zkratky (prefix = Ctrl+b)
```bash
# Sessions
Ctrl+b d                                # Odpojení od session (detach)
Ctrl+b s                                # Přehled všech sessions
Ctrl+b $                                # Přejmenování session

# Okna (windows)
Ctrl+b c                                # Nové okno
Ctrl+b ,                                # Přejmenování okna
Ctrl+b n                                # Další okno
Ctrl+b p                                # Předchozí okno
Ctrl+b <number>                         # Přechod na okno podle čísla
Ctrl+b w                                # Přehled všech oken
Ctrl+b &                                # Zavření okna

# Panely (panes)
Ctrl+b %                                # Rozdělení vertikálně (vedle sebe)
Ctrl+b "                                # Rozdělení horizontálně (nad sebou)
Ctrl+b <šipky>                          # Přepínání mezi panely
Ctrl+b z                                # Zoom panelu (maximalizace/obnovení)
Ctrl+b x                                # Zavření panelu
Ctrl+b o                                # Přechod na další panel
```

### Scrollování a kopírování
```bash
Ctrl+b [                                # Vstup do scroll módu (pohyb šipkami / PgUp/PgDn)
q                                       # Ukončení scroll módu
```

## Systémové informace

```bash
# Verze Ubuntu (detailní informace o distribuci)
lsb_release -a

# Informace o systému (kernel, architektura)
uname -a

# Využití paměti (human-readable)
free -h

# Načtení procesoru a procesů
top                             # Základní monitor procesů
htop                            # Interaktivní monitor (vyžaduje instalaci)

# Síťové rozhraní
ip addr                         # Moderní příkaz pro IP adresy
ifconfig                        # Starší příkaz (může vyžadovat instalaci)
```

## Vypnutí a restart

```bash
# Restart
sudo reboot                    # Okamžitý restart systému
sudo shutdown -r now           # Okamžitý restart (alternativa)
sudo shutdown -r +10           # Restart za 10 minut
sudo shutdown -r "22:00"       # Naplánovaný restart v konkrétní čas

# Vypnutí
sudo shutdown -h now           # Okamžité vypnutí systému
sudo poweroff                  # Okamžité vypnutí (alternativa)
sudo shutdown -h +10           # Vypnutí za 10 minut

# Ostatní
sudo shutdown -c               # Zrušení naplánovaného vypnutí/restartu
```
