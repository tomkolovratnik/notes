# PowerShell

## Základní příkazy

```powershell
# Navigace
Get-Location                    # Zobrazení aktuální cesty (alias: pwd)
Set-Location <path>             # Přechod do adresáře (alias: cd)
Get-ChildItem                   # Výpis souborů (alias: ls, dir)

# Soubory
Copy-Item <source> <dest>       # Kopírování souboru/složky
Move-Item <source> <dest>       # Přesun/přejmenování
Remove-Item <path>              # Smazání souboru/složky
New-Item -ItemType File <name>  # Vytvoření nového souboru
New-Item -ItemType Directory <name> # Vytvoření nové složky

# Obsah
Get-Content <file>              # Přečtení obsahu souboru
Set-Content <file> -Value "text" # Zápis textu do souboru

# Procesy
Get-Process                     # Výpis všech běžících procesů
Stop-Process -Name <name>       # Ukončení procesu podle jména
```

## Užitečné skripty

```powershell
# Rekurzivní hledání souborů podle vzoru
Get-ChildItem -Recurse -Filter "*.js"

# Velikost složky v MB (rekurzivně)
(Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Hledání textu v souborech (rekurzivně)
Get-ChildItem -Recurse | Select-String -Pattern "text"

# Systémové informace (podrobné)
Get-ComputerInfo
```
