---
layout: default
title: PowerShell
parent: Shell & Terminál
nav_order: 6
---

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

## Pipeline a filtrace

```powershell
# Pipeline - předává výstup jednoho příkazu do dalšího
Get-Process | Where-Object { $_.CPU -gt 10 }          # Procesy s CPU > 10

# Where-Object - filtrování objektů podle podmínky
Get-Service | Where-Object { $_.Status -eq "Running" }  # Jen běžící služby
Get-ChildItem | Where-Object { $_.Length -gt 1MB }      # Soubory větší než 1MB

# Select-Object - výběr konkrétních vlastností
Get-Process | Select-Object Name, CPU, WorkingSet      # Jen vybrané sloupce
Get-Process | Select-Object -First 5                   # Prvních 5 záznamů
Get-Process | Select-Object -Last 3                    # Poslední 3 záznamy

# Sort-Object - řazení
Get-Process | Sort-Object CPU -Descending              # Seřadit podle CPU sestupně
Get-ChildItem | Sort-Object Length                     # Seřadit podle velikosti

# ForEach-Object - iterace přes každý objekt
Get-ChildItem *.txt | ForEach-Object { $_.Name }       # Vypíše jen názvy
1..5 | ForEach-Object { "Číslo: $_" }                  # Iterace přes čísla

# Measure-Object - agregace (count, sum, average)
Get-ChildItem | Measure-Object                         # Počet souborů
Get-ChildItem | Measure-Object -Property Length -Sum   # Součet velikostí

# Group-Object - seskupení podle vlastnosti
Get-Process | Group-Object ProcessName                 # Skupiny podle jména
Get-ChildItem | Group-Object Extension                 # Skupiny podle přípony
```

## Služby (Services)

```powershell
# Výpis služeb
Get-Service                                            # Všechny služby
Get-Service -Name "wuauserv"                           # Konkrétní služba (Windows Update)
Get-Service | Where-Object { $_.Status -eq "Stopped" } # Zastavené služby

# Správa služeb (vyžaduje admin práva)
Start-Service -Name "wuauserv"                         # Spuštění služby
Stop-Service -Name "wuauserv"                          # Zastavení služby
Restart-Service -Name "wuauserv"                       # Restart služby
Set-Service -Name "wuauserv" -StartupType Automatic    # Nastavení automatického startu
```

## Proměnné a datové typy

```powershell
# Proměnné (začínají $)
$name = "World"                                        # String
$count = 42                                            # Integer
$prices = @(10, 20, 30)                                # Array (pole)
$user = @{Name="Jan"; Age=30}                          # Hashtable (slovník)

# Použití proměnných
Write-Output "Hello, $name!"                           # Interpolace stringu
$prices[0]                                             # Přístup k prvku pole (10)
$user.Name                                             # Přístup k hodnotě v hashtable (Jan)

# Environment variables
$env:PATH                                              # Zobrazí PATH
$env:USERNAME                                          # Aktuální uživatel
$env:TEMP                                              # Cesta k temp složce
$env:MY_VAR = "hodnota"                                # Nastavení env proměnné (dočasně)
```

## Porovnávací operátory

```powershell
# PowerShell používá textové operátory (ne <, >, ==)
-eq       # Rovná se (equals)              5 -eq 5   → True
-ne       # Nerovná se (not equal)         5 -ne 3   → True
-gt       # Větší než (greater than)       5 -gt 3   → True
-lt       # Menší než (less than)          3 -lt 5   → True
-ge       # Větší nebo rovno               5 -ge 5   → True
-le       # Menší nebo rovno               3 -le 5   → True
-like     # Wildcard pattern               "hello" -like "h*" → True
-match    # Regex pattern                  "hello" -match "^h" → True
-contains # Pole obsahuje hodnotu          @(1,2,3) -contains 2 → True

# Příklad použití
if ($count -gt 10) { "Větší než 10" }
Get-Process | Where-Object { $_.CPU -gt 100 }
```

## Práce se soubory

```powershell
# Čtení a zápis
Get-Content file.txt                                   # Přečte obsah (jako pole řádků)
Get-Content file.txt -Raw                              # Přečte jako jeden string
Set-Content file.txt -Value "nový obsah"               # Přepíše soubor
Add-Content file.txt -Value "další řádek"              # Připojí na konec

# Test existence
Test-Path "C:\folder\file.txt"                         # True/False

# Kopírování/přesun složek rekurzivně
Copy-Item -Path "src" -Destination "backup" -Recurse   # Kopíruje celou složku
Remove-Item -Path "folder" -Recurse -Force             # Smaže složku včetně obsahu
```

## Užitečné skripty

```powershell
# Rekurzivní hledání souborů podle vzoru
Get-ChildItem -Recurse -Filter "*.js"                  # -Recurse = včetně podsložek

# Velikost složky v MB (rekurzivně)
(Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Hledání textu v souborech (rekurzivně)
Get-ChildItem -Recurse -Filter "*.cs" | Select-String -Pattern "TODO"

# Systémové informace (podrobné)
Get-ComputerInfo

# Export do CSV
Get-Process | Select-Object Name, CPU | Export-Csv processes.csv -NoTypeInformation

# Import z CSV
$data = Import-Csv data.csv

# Najít velké soubory
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 100MB } |
    Select-Object FullName, @{N="SizeMB";E={[math]::Round($_.Length/1MB,2)}}

# Smazat soubory starší než 30 dní
Get-ChildItem -Recurse | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
```

## Aliasy

```powershell
# Běžné aliasy (Unix-like)
ls          # Get-ChildItem
cd          # Set-Location
pwd         # Get-Location
cat         # Get-Content
cp          # Copy-Item
mv          # Move-Item
rm          # Remove-Item
echo        # Write-Output
clear       # Clear-Host

# Zobrazení všech aliasů
Get-Alias

# Vytvoření vlastního aliasu (platí jen pro session)
Set-Alias -Name ll -Value Get-ChildItem
```

## Praktické one-linery

```powershell
# Najít procesy zabírající nejvíce paměti
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{N="MemoryMB";E={[math]::Round($_.WorkingSet/1MB)}}

# Zobrazit otevřené porty
Get-NetTCPConnection | Where-Object { $_.State -eq "Listen" } | Select-Object LocalPort, OwningProcess

# Rychlé stažení souboru z webu
Invoke-WebRequest -Uri "https://example.com/file.zip" -OutFile "file.zip"

# Spustit příkaz jako admin
Start-Process powershell -Verb RunAs

# Zjistit verzi PowerShell
$PSVersionTable.PSVersion

# Clipboard - kopírovat/vložit
Get-Process | Set-Clipboard                            # Kopírovat výstup do schránky
Get-Clipboard                                          # Získat obsah schránky
```
