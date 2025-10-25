# Git

## Základní příkazy
```bash
# Inicializace
git init                        # Inicializace nového Git repozitáře
git clone <url>                 # Klonování vzdáleného repozitáře

# Staging a commit
git add .                       # Přidání všech změn do stage
git add <file>                  # Přidání konkrétního souboru do stage
git commit -m "message"         # Vytvoření commitu se zprávou

# Status a změny
git status                      # Zobrazení stavu working directory
git diff                        # Zobrazení neuložených změn
git log                         # Historie commitů
git log --oneline               # Kompaktní historie (1 commit = 1 řádek)

# Větve
git branch                      # Výpis všech větví
git branch <name>               # Vytvoření nové větve
git checkout <branch>           # Přepnutí na větev
git checkout -b <new-branch>    # Vytvoření a přepnutí na novou větev
git merge <branch>              # Sloučení větve do aktuální

# Remote
git remote -v                   # Výpis vzdálených repozitářů
git push                        # Odeslání commitů na remote
git pull                        # Stažení a sloučení změn z remote
git fetch                       # Stažení změn bez sloučení
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
git stash pop                   # Obnovení naposledy uložených změn
git stash list                  # Výpis všech uložených stashů
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
