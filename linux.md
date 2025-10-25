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

# Obsah
cat <file>                      # Zobrazení obsahu souboru
head <file>                     # Zobrazení prvních řádků
tail <file>                     # Zobrazení posledních řádků
grep <pattern> <file>           # Vyhledání textu v souboru

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
