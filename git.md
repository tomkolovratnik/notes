---
layout: default
title: Git
parent: Vývojové nástroje
nav_order: 1
---

# Git

## Základní příkazy
```bash
# Inicializace
git init                        # Inicializace nového Git repozitáře
git clone <url>                 # Klonování vzdáleného repozitáře

# Konfigurace
git config --global user.name "Vaše jméno"      # Nastavení uživatelského jména
git config --global user.email "vas@email.cz"   # Nastavení emailu

# Staging a commit
git add <file>                  # Přidání konkrétního souboru do stage
git add .                       # Přidání všech změněných souborů do stage
git add -A                      # Přidání všech souborů včetně nových (untracked)
git commit -m "message"         # Vytvoření commitu se zprávou
git commit -a -m "message"      # Přidá všechny TRACKED soubory a vytvoří commit
git add -A && git commit -m "message"  # Přidá všechny soubory včetně nových a commitne

# Status a změny
git status                      # Zobrazení stavu working directory
git diff                        # Zobrazení neuložených změn
git log                         # Historie commitů
git log --oneline               # Kompaktní historie (1 commit = 1 řádek)

# Větve
git branch                      # Výpis všech větví
git branch <name>               # Vytvoření nové větve
git branch -m <old> <new>       # Přejmenování větve
git branch -d <name>            # Odstranění větve
git checkout <branch>           # Přepnutí na větev
git checkout -b <new-branch>    # Vytvoření a přepnutí na novou větev
git checkout -- <file>          # Vrácení souboru do stavu poslední verze
git merge <branch>              # Sloučení větve do aktuální

# Remote
git remote -v                   # Výpis vzdálených repozitářů
git remote add origin <url>     # Připojení k vzdálenému repozitáři
git push                        # Odeslání commitů na remote
git push origin <branch>        # Odeslání do konkrétní větve
git push -u origin <branch>     # Odeslání a nastavení trackování větve
git pull                        # Stažení a sloučení změn z remote
git pull origin <branch>        # Stažení z konkrétní větve
git fetch                       # Stažení změn bez sloučení

# Tagy
git tag <tagname>               # Vytvoření tagu (např. v1.0.0)
git tag                         # Výpis všech tagů
git push --tags                 # Odeslání tagů na remote
```

## Užitečné tipy
```bash
# Zrušení posledního commitu (zachová změny v working directory)
git reset --soft HEAD~1

# Změna zprávy posledního commitu
git commit --amend -m "nová zpráva"

# Zobrazení změn v konkrétním commitu
git show <commit-hash>

# Stash - dočasné uložení změn
git stash                       # Uložení neuložených změn
git stash save "popis změn"     # Uložení s popisem
git stash list                  # Výpis všech uložených stashů
git stash apply stash@{0}       # Aplikování konkrétního stashe (zachová v seznamu)
git stash pop                   # Obnovení naposledy uložených změn (odstraní ze seznamu)
```

## Azure DevOps
```bash
# Klonování repozitáře
git clone https://dev.azure.com/organizace/projekt/_git/nazev_repo

# Klonování s autentizací (uživatelské jméno v URL)
git clone https://jmeno@dev.azure.com/organizace/projekt/_git/nazev_repo

# Připojení lokálního repozitáře k Azure DevOps
git remote add origin https://dev.azure.com/organizace/projekt/_git/nazev_repo

# Uložení přihlašovacích údajů (credential helper)
git config --global credential.helper store

# Pull request - typicky se vytváří přes webové rozhraní Azure DevOps
# ale lze ho připravit příkazem:
git push origin HEAD:refs/for/master
```

## .gitignore vzory
```
# Node.js
node_modules/
npm-debug.log
.env

# .NET
bin/
obj/
*.user
*.suo
*.userprefs
appsettings.Development.json
# User Secrets jsou automaticky ignorovány (ukládají se mimo projekt)

# IDEs
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```
