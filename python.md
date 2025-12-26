---
layout: default
title: Python / uv
parent: Programovací jazyky
nav_order: 2
---

# Python / uv

## O uv

`uv` je extrémně rychlý Python package a project manager napsaný v Rustu (od autorů Ruff). Nahrazuje `pip`, `pip-tools`, `pipx`, `poetry`, `pyenv`, `virtualenv` a další nástroje v jednom.

**Výhody:**
- 10-100× rychlejší než pip
- Jediný nástroj pro package management, virtuální prostředí a verze Pythonu
- Kompatibilní s pip (používá PyPI)
- Lock file pro reprodukovatelné buildy
- Správa Python verzí bez pyenv

## Instalace

### Windows (PowerShell)
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"  # Standalone installer
```

### Linux / macOS
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh  # Standalone installer
```

### Pomocí pip (pokud už máte Python)
```bash
pip install uv  # Instalace přes pip
```

### Verifikace instalace
```bash
uv --version  # Zkontrolovat verzi uv
```

## Základní použití

### Správa Python verzí

```bash
uv python list              # Zobrazit dostupné Python verze
uv python install 3.12      # Nainstalovat Python 3.12
uv python install 3.11 3.10 # Nainstalovat více verzí najednou
uv python find              # Najít Python na systému
uv python pin 3.12          # Nastavit Python verzi pro projekt (.python-version)
```

### Vytvoření projektu

```bash
uv init my-project          # Vytvořit nový Python projekt
cd my-project
uv venv                     # Vytvořit virtuální prostředí (.venv)
uv venv --python 3.12       # Vytvořit venv s konkrétní verzí Pythonu
```

### Aktivace virtuálního prostředí

```bash
# Windows (PowerShell)
.venv\Scripts\activate

# Windows (Git Bash / MINGW64)
source .venv/Scripts/activate  # V Git Bash je složka Scripts, ne bin

# Linux / macOS
source .venv/bin/activate
```

**Tip:** S `uv` často nemusíte aktivovat venv - `uv run` příkazy používají venv automaticky.

### Deaktivace virtuálního prostředí

```bash
deactivate  # Funguje ve všech shellech (PowerShell, Git Bash, Linux, macOS)
```

### Správa závislostí

```bash
uv add requests             # Přidat závislost (přidá do pyproject.toml)
uv add "fastapi>=0.100"     # Přidat s verzí
uv add --dev pytest black   # Přidat dev závislosti
uv remove requests          # Odebrat závislost
uv sync                     # Synchronizovat prostředí s pyproject.toml
uv lock                     # Aktualizovat uv.lock (lock file)
```

### Instalace závislostí

```bash
uv pip install -r requirements.txt  # Instalovat z requirements.txt
uv pip install .                    # Instalovat aktuální projekt
uv pip install -e .                 # Instalovat v editable módu
uv pip list                         # Zobrazit nainstalované balíčky
uv pip freeze                       # Export nainstalovaných balíčků
```

### Spouštění kódu

```bash
uv run python script.py         # Spustit Python skript (s aktivním venv)
uv run pytest                   # Spustit pytest
uv run uvicorn main:app --reload # Spustit libovolný příkaz
```

### Spouštění nástrojů bez instalace (jako pipx)

```bash
uv tool install ruff        # Globálně nainstalovat nástroj
uv tool run ruff check .    # Spustit nástroj bez instalace (dočasně)
uv tool list                # Zobrazit nainstalované nástroje
uvx ruff check .            # Zkrácený alias pro `uv tool run`
```

## Struktura projektu s uv

```
my-project/
├── .venv/              # Virtuální prostředí (vytvořeno uv venv)
├── .python-version     # Pinnutá Python verze (uv python pin)
├── pyproject.toml      # Metadata projektu a závislosti
├── uv.lock             # Lock file (automaticky generováno)
├── src/
│   └── my_project/
│       └── __init__.py
└── tests/
```

### Příklad pyproject.toml

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "Můj Python projekt"
requires-python = ">=3.12"
dependencies = [
    "requests>=2.31.0",
    "fastapi>=0.104.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.10.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

## Nejpoužívanější příkazy (Quick Reference)

| Příkaz | Popis |
|--------|-------|
| `uv init` | Vytvořit nový projekt |
| `uv venv` | Vytvořit virtuální prostředí |
| `uv add <package>` | Přidat závislost |
| `uv remove <package>` | Odebrat závislost |
| `uv sync` | Synchronizovat prostředí |
| `uv lock` | Aktualizovat lock file |
| `uv run <cmd>` | Spustit příkaz ve venv |
| `uv pip install <pkg>` | Instalovat balíček (pip-kompatibilní) |
| `uv python install 3.12` | Instalovat Python verzi |
| `uv python pin 3.12` | Nastavit Python verzi |
| `uv tool run <tool>` | Spustit nástroj bez instalace |
| `uv tree` | Zobrazit strom závislostí |

## Best Practices

### 1. Používejte pyproject.toml místo requirements.txt
```bash
# Místo requirements.txt a setup.py
uv add requests fastapi  # Automaticky upraví pyproject.toml
```

### 2. Commitujte uv.lock do gitu
```bash
# uv.lock zajišťuje reprodukovatelné buildy
git add uv.lock pyproject.toml
```

### 3. Specifikujte Python verzi v projektu
```bash
uv python pin 3.12       # Vytvoří .python-version soubor
git add .python-version  # Commit pro konzistenci v týmu
```

### 4. Oddělte dev a produkční závislosti
```bash
uv add --dev pytest black ruff  # Dev nástroje oddělené
uv add requests fastapi         # Produkční závislosti
```

### 5. Používejte `uv run` místo aktivace venv
```bash
# Místo:
source .venv/bin/activate
python script.py

# Raději:
uv run python script.py  # Automaticky použije správný venv
```

### 6. Rychlé testování balíčků bez vytváření projektu
```bash
uv tool run cowsay "Hello from uv!"  # Jednorázové spuštění
uvx ruff check .                     # Spustit linter bez instalace
```

## Migrace z existujících nástrojů

### Z pip/virtualenv
```bash
# Starý způsob:
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# S uv:
uv venv
uv pip install -r requirements.txt
```

### Z Poetry
```bash
# Poetry projekt lze konvertovat
uv add $(cat pyproject.toml | grep "^name")  # Import závislostí
```

### Z Conda
```bash
# Pro projekty bez systémových závislostí
conda list --export > requirements.txt  # Export z Conda
uv pip install -r requirements.txt      # Import do uv
```

## Troubleshooting

### uv nenajde Python
```bash
uv python install 3.12  # Nainstaluje Python přes uv
uv python list          # Zkontroluje dostupné verze
```

### Konflikt závislostí
```bash
uv lock --upgrade       # Aktualizuje resolver
uv sync --reinstall     # Přeinstaluje všechny balíčky
```

### Cache problémy
```bash
uv cache clean          # Vyčistí cache
uv cache prune          # Odstraní nepoužívané cache soubory
```

### Zobrazení více detailů
```bash
uv --verbose <příkaz>   # Detailní výstup
uv --help               # Nápověda
```

## Porovnání rychlosti (benchmark)

```bash
# Typický install benchmarks (reálné výsledky):
pip install numpy pandas requests  # ~15s
uv pip install numpy pandas requests  # ~1s

# Poetry install vs uv sync
poetry install  # ~30s
uv sync        # ~2s
```

## Užitečné odkazy

- Oficiální dokumentace: https://docs.astral.sh/uv/
- GitHub: https://github.com/astral-sh/uv
- Ruff linter (stejní autoři): https://docs.astral.sh/ruff/
