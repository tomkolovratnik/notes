---
layout: default
title: VS Code
parent: Vývojové nástroje
nav_order: 2
---

# VS Code

## Užitečné zkratky
```
Ctrl + P        - Rychlé otevření souboru
Ctrl + Shift + P - Command Palette
Ctrl + `        - Terminál
Ctrl + B        - Sidebar toggle
Ctrl + /        - Zakomentovat řádek
Alt + Up/Down   - Přesun řádku
Ctrl + D        - Vybrat další výskyt
Ctrl + k v      - Markdown preview
```

## Doporučená rozšíření
- Prettier - Code formatter
- ESLint
- GitLens
- Auto Rename Tag
- Path Intellisense

## Settings.json ukázky
```json
{
  "editor.formatOnSave": true,      // Automatické formátování při uložení
  "editor.tabSize": 2,               // Velikost odsazení (2 mezery)
  "files.autoSave": "afterDelay",    // Automatické ukládání po prodlevě
  "terminal.integrated.defaultProfile.windows": "PowerShell"  // Výchozí terminál
}
```

## Zkratky

### Visual Studio Code
```
Ctrl + P         - Rychlé otevření souboru         // Vyhledávání souborů
Ctrl + Shift + P - Command Palette                  // Příkazová paleta
Ctrl + `         - Terminál                         // Otevření terminálu
Ctrl + B         - Sidebar toggle                   // Zapnutí/vypnutí postranního panelu
Ctrl + /         - Zakomentovat řádek               // Přidáním/odebráním komentáře
Ctrl + H         - Najít a nahradit                 // Hledání a nahrazování textu
Ctrl + F         - Najít                            // Hledání v souboru
Ctrl + Shift + F - Najít v souborech                // Hledání v celém projektu
Alt + Up/Down    - Přesun řádku                     // Pohyb řádku nahoru/dolů
Ctrl + D         - Vybrat další výskyt              // Označit další výskyt slova
Ctrl + K Ctrl + 0 - Sbalit všechny regiony          // Sbalení všech sekcí kódu
Ctrl + K Ctrl + J - Rozbalit všechny regiony        // Rozbalení všech sekcí kódu
F12              - Přejít na definici               // Skočit na definici funkce/proměnné
Shift + F12      - Najít všechny reference          // Výpis všech odkazů na symbol
```

### Visual Studio
```
Ctrl + ú a       - Collapse in solution editor      // Sbalení v editoru řešení
Ctrl + ú s       - Synchronizace editoru s oknem solution  // Převzetí zaměření z okna solution
Ctrl + Shift + B - Sestavit řešení                  // Kompilace projektu
F5               - Spustit s laděním                // Spuštění aplikace v debug režimu
Ctrl + F5        - Spustit bez ladění               // Spuštění aplikace bez debuggeru
F9               - Přepnout zarážku                 // Nastavení/odstranění breakpointu
Ctrl + Alt + L   - Solution Explorer                // Otevření Solution Exploreru
Ctrl + H         - Najít a nahradit                 // Hledání a nahrazování textu
Ctrl + Shift + H - Najít v souborech                // Hledání v více souborech
F7               - Přepnout mezi View a Code-behind // Přechod mezi .xaml a .xaml.cs
Ctrl + .         - Rychlé opravy                    // Quick actions a refactoring
```

### Terminal (PowerShell/Bash/Git Bash)
```
Ctrl + C         - Přerušit příkaz                  // Zastavení běžícího procesu
Ctrl + L         - Vyčistit terminál                // Smazání obsahu obrazovky
Ctrl + R         - Hledat v historii                // Vyhledávání v historii příkazů
Ctrl + A         - Na začátek řádku                 // Kurzor na začátek
Ctrl + E         - Na konec řádku                   // Kurzor na konec
Alt + F          - Slovo vpřed                      // Pohyb kurzoru o slovo vpřed
Alt + B          - Slovo vzad                       // Pohyb kurzoru o slovo vzad
Tab              - Automatické doplnění             // Doplnění příkazu nebo cesty
Ctrl + W         - Smazat slovo                     // Smazání posledního slova
Ctrl + U         - Smazat řádek                     // Smazání celého řádku od kurzoru na začátek
Ctrl + K         - Smazat řádek (Git Bash)          // Smazání od kurzoru na konec
```

## Jupyter Notebooks ve VS Code

VS Code má vestavěnou podporu pro Jupyter Notebooks (.ipynb), která z něj dělá výkonný nástroj pro data science a experimenty s Pythonem.

### Instalace a setup

#### Požadované rozšíření

```
Jupyter         - Oficiální rozšíření Microsoftu (obsahuje Jupyter, Pylance, Python)
Python          - Rozšíření pro Python (obvykle součástí)
Jupyter Keymap  - Volitelně - pro kompatibilitu s klasickým Jupyter
```

Rozšíření najdeš v Extensions (Ctrl+Shift+X) nebo přes příkazovou paletu.

#### Instalace Jupyter balíčků

```bash
# Instalovat jupyter a ipykernel
pip install jupyter ipykernel

# Přidat Python kernel do jupyter
python -m ipykernel install --user --name myenv --display-name "Python (myenv)"
```

### Základní práce s notebooky

#### Vytvoření a otevření

```bash
# Vytvořit nový notebook přes CLI
jupyter notebook  # Klasicky
# nebo
# Ctrl+Shift+P > "Jupyter: Create New Blank Notebook"
```

#### Typy buněk

- **Code** - Python kód, který se spouští
- **Markdown** - Dokumentace, títulky, poznámky
- **Raw** - Surový text (výjimečně)

Pro přepnutí typu buňky: vybrat buňku a stisknout `M` (Markdown) nebo `Y` (Code)

#### Spuštění buněk

```
Ctrl + Enter     - Spustit buňku a zůstat v ní                  // Vykonání aktuální buňky
Shift + Enter    - Spustit buňku a skočit na další              // Vykonání a posun dolů
Alt + Enter      - Spustit buňku a vložit novou pod ní          // Vykonání a nová buňka
```

#### Správa buněk

```
A                - Vložit buňku nad (Command mode)              // Přidání buňky nad
B                - Vložit buňku pod (Command mode)              // Přidání buňky pod
D                - Smazat buňku (dvakrát stisknout)             // Odstranění buňky
Z                - Vrátit smazanou buňku (Undo)                 // Obnovení
```

#### Kernely a interprety

```
Ctrl+Shift+P > "Jupyter: Select Kernel"  // Výběr Python kernelu
Ctrl+Shift+P > "Jupyter: Restart Kernel" // Restart kernelu (vymaže paměť)
Ctrl+Shift+P > "Jupyter: Interrupt Kernel" // Zastavit spuštěný kód
```

### Zkratky pro Jupyter Notebooks

```
Ctrl + Enter     - Spustit aktuální buňku              // Vykonání bez posunu
Shift + Enter    - Spustit a skočit na další buňku     // Vykonání a posun
Alt + Enter      - Spustit a vložit novou buňku        // Vykonání a nová buňka
Ctrl+Shift+P     - Jupyter: Run All Cells Above        // Spustit všechny buňky nad
Ctrl+Shift+P     - Jupyter: Run All Cells Below        // Spustit všechny buňky pod

# V Command Mode (Esc pro vstup):
A                - Vložit buňku nad                    // Nová buňka nahoře
B                - Vložit buňku pod                    // Nová buňka dole
D                - Smazat buňku (2x)                   // Odstranit buňku
M                - Změnit na Markdown                  // Typ Markdown
Y                - Změnit na Code                      // Typ Code
```

### Pokročilé funkce

#### Variable Inspector

VS Code automaticky zobrazuje proměnné ve spuštěném kernelu.

```python
# Po spuštění se v panelu vpravo zobrazí:
x = 10
y = [1, 2, 3]
df = pd.DataFrame({'A': [1, 2, 3]})

# Můžeš klikat na objekty a vidět jejich obsah
```

Pokud panel nevidíš: `Ctrl+Shift+P > "Jupyter: Show Variable Inspector"`

#### Export notebooku

```
Ctrl+Shift+P > "Jupyter: Export as..."
# Dostupné formáty:
# - Python Script (.py)
# - HTML (.html)
# - PDF (.pdf) - vyžaduje LaTeX
# - Markdown (.md)
```

#### Debugging v notebooku

```python
# Zastavit běh a zadat breakpoint pomocí debugger
import pdb

def problematic_function(x):
    pdb.set_trace()  # Zastaví se zde
    return x * 2

problematic_function(5)

# V Command Palette: "Python: Debug Cell" nebo
# Ctrl+Shift+P > "Jupyter: Debug Cell"
```

#### Výběr kernelu a prostředí

```python
# Ukazatel kernelu v pravém horním rohu notebooku
# Kliknout na něj a vybrat:
# - Lokální Python interprety
# - Virtual envs (venv, conda)
# - Vzdálené kernely (SSH)

# Nebo příkazem:
# Ctrl+Shift+P > "Jupyter: Select Kernel"
```

### Data Science snippety

#### Pandas - Načtení a zpracování dat

```python
import pandas as pd
import numpy as np

# Načtení CSV souboru
df = pd.read_csv('data.csv')

# Zobrazit první řádky
df.head()

# Informace o dataframu
df.info()

# Základní statistika
df.describe()

# Filtrování
filtered = df[df['sloupec'] > 100]

# Skupiny a agregace
grouped = df.groupby('kategorie')['cena'].sum()

# Spojení dvou dataframů
merged = pd.merge(df1, df2, on='id')

# Export do CSV
df.to_csv('output.csv', index=False)
```

#### NumPy - Práce s poli

```python
import numpy as np

# Vytvoření polí
a = np.array([1, 2, 3])
matrix = np.array([[1, 2], [3, 4]])

# Nuly, jedničky, náhodná čísla
zeros = np.zeros((3, 3))
ones = np.ones((2, 2))
random = np.random.rand(4, 4)

# Operace nad poli
result = a * 2        # Skalární operace
dot_product = np.dot(a, a)  # Dot product
transposed = matrix.T  # Transpozice

# Výběr prvků
subset = a[a > 1]     # Prvky větší než 1
```

#### Matplotlib - Základní grafy

```python
import matplotlib.pyplot as plt
import numpy as np

# Liniový graf
x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.xlabel('X osa')
plt.ylabel('Y osa')
plt.title('Sinus funkce')
plt.show()

# Sloupcový graf
categories = ['A', 'B', 'C']
values = [10, 25, 15]
plt.bar(categories, values, color='steelblue')
plt.ylabel('Hodnota')
plt.title('Sloupcový graf')
plt.show()

# Scatter plot
x_data = np.random.rand(50)
y_data = np.random.rand(50)
plt.scatter(x_data, y_data, alpha=0.6, s=100, color='red')
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Bodový graf')
plt.show()

# Více grafů v jednom okně (2x2 grid)
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
axes[0, 0].plot([1, 2, 3], [1, 4, 9])
axes[0, 0].set_title('Kvadratická funkce')
# ... další grafy
plt.tight_layout()
plt.show()
```

#### Seaborn - Pokročilejší vizualizace

```python
import seaborn as sns
import pandas as pd

# Nastavit styl
sns.set_style("whitegrid")

# Histogram
sns.histplot(data=df, x='sloupec', bins=30, kde=True)
plt.title('Distribuce hodnot')
plt.show()

# Box plot pro detekci outlierů
sns.boxplot(data=df, x='kategorie', y='hodnota')
plt.title('Distribuce po kategoriích')
plt.show()

# Heatmapa korelací
correlation = df.corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm')
plt.title('Korelační matice')
plt.show()

# Pair plot - všechny vztahy mezi sloupci
sns.pairplot(df)
plt.show()

# Violin plot - kombinace box plotu a density plotu
sns.violinplot(data=df, x='kategorie', y='hodnota')
plt.show()
```

### Magic commands

Magic commands jsou speciální příkazy pro Jupyter:

```python
# Měření času spuštění
%timeit sum(range(100))

# Čas spuštění buňky
%%timeit
for i in range(1000):
    pass

# Obsah souborů
%load 'script.py'

# Matplotlib inline (zobrazit grafy v notebooku)
%matplotlib inline

# IPython magic - info o objektu
?pd.DataFrame    # Zobrazit help
??pd.DataFrame   # Zobrazit zdrojový kód

# Systémové příkazy
%pwd             # Pracovní adresář
%ls              # Výpis souborů
!pip list        # Systemový příkaz
```

### Tipy a triky

#### IntelliSense a doplňování

- **Ctrl+Space** - Zobrazit návrhy doplnění
- **Ctrl+I** - Rychlá informace o objektu
- VS Code automaticky doplňuje funkce a metody

#### Zobrazení grafů inline

```python
# Přidat na začátek notebooku
%matplotlib inline

# Nebo interaktivní grafy
%matplotlib widget
```

#### Plotly pro interaktivní grafy

```python
import plotly.express as px

# Interaktivní scatter plot
fig = px.scatter(df, x='sloupec1', y='sloupec2', color='kategorie')
fig.show()

# Interaktivní sloupcový graf
fig = px.bar(df, x='datum', y='prodej', title='Prodej v čase')
fig.show()
```

#### Prohlídka obsahu proměnné

```python
# Jednoduchá prohlídka
df.head()

# Detailní pohled v Variable Inspectoru (pravý panel)
# - Kliknout na proměnnou
# - Vidět datové typy, velikost, obsah
```

#### Práce s dlouhými výstupy

```python
# Skrýt dlouhý výstup
output = df.to_string()  # Nepomůže, lepší je scrollovat

# Omezit počet řádků zobrazení
pd.set_option('display.max_rows', 10)
pd.set_option('display.max_columns', 5)
```

### Troubleshooting

#### Kernel se nezapíná

```bash
# Restartovat kernel
Ctrl+Shift+P > "Jupyter: Restart Kernel"

# Ověřit, že Python je nainstalován
python --version

# Ověřit, že jupyter je nainstalován
pip list | grep jupyter

# Reinstalace jupyteru
pip uninstall jupyter -y && pip install jupyter ipykernel
```

#### Import errors

```python
# Ověřit, že balíček je nainstalován
pip list | grep pandas

# Instalovat chybějící balíček
pip install pandas numpy matplotlib seaborn

# Restart kernelu poté
Ctrl+Shift+P > "Jupyter: Restart Kernel"
```

#### Kernel zabírá moc paměti

```python
# Vymazat velké objekty
del large_dataframe
del model

# Restart kernelu
Ctrl+Shift+P > "Jupyter: Restart Kernel"

# Garbage collection
import gc
gc.collect()
```

#### "Module not found" poté co instaluji balíček

```bash
# Vybraný kernel nemá nainstalován balíček
pip install --upgrade pip

# Instalovat balíček do aktivního kernelu
python -m pip install pandas

# Ověřit správný kernel
Ctrl+Shift+P > "Jupyter: Select Kernel"

# Restart kernelu po instalaci
```

#### Notebook se nezachovává

```
Ctrl+S          - Ruční uložení notebooku
# Nebo povolить auto-save v settings.json:

"jupyter.notebookFileRoot": "${workspaceFolder}",
"files.autoSave": "afterDelay"
```

### Workflows a best practices

#### Strukturovaný notebook

```markdown
# Projekt: Analýza prodejů

## 1. Imports a Setup
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
```

## 2. Načtení dat
```python
df = pd.read_csv('sales_data.csv')
df.head()
```

## 3. Data cleaning
```python
# Ověřit chybějící hodnoty
df.isnull().sum()
```

## 4. Explorační analýza (EDA)
```python
df.describe()
```

## 5. Vizualizace a závěry
```

#### Best practices

```python
# 1. Pojmenovat notebook smysluplně
# ✓ 01_data_loading.ipynb
# ✗ untitled.ipynb

# 2. Rozdělit logiku do několika buněk
# ✓ Každá buňka má jednu odpovědnost
# ✗ Všechno v jedné obrovské buňce

# 3. Dokumentovat markdown buňkami
# ✓ Vysvětlovat co a proč
# ✗ Jen kód bez komentářů

# 4. Příliš dlouhé notebooky rozdělit
# ✓ 01_loading.ipynb, 02_analysis.ipynb, 03_visualization.ipynb
# ✗ Jedna 500-řádková notebook

# 5. Exportovat do Python skriptů pro produkci
# Ctrl+Shift+P > "Jupyter: Export as Python Script"
# Pak je možné spustit bez VS Code
```

## Debugování .NET 8 ve WSL2

Návod pro debugování .NET 8 aplikací, když jsou zdrojové kódy uložené ve WSL2 a vývoj probíhá přes VS Code.

### Požadavky

#### VS Code rozšíření

```
Remote - WSL          - Připojení VS Code k WSL2 filesystému
C# Dev Kit            - Komplexní podpora pro .NET vývoj (obsahuje C# extension)
```

Instalace rozšíření: `Ctrl+Shift+X` a vyhledat název rozšíření.

#### .NET 8 SDK ve WSL2

```bash
# Ověření instalace .NET ve WSL2
dotnet --version                    # Zobrazí verzi .NET SDK

# Instalace .NET 8 SDK (Ubuntu/Debian)
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-8.0  # Instalace .NET 8 SDK
```

### Postup připojení k WSL2

#### Otevření projektu ve WSL2 režimu

```bash
# Možnost 1: Otevřít VS Code přímo z WSL terminálu
cd /home/user/projects/myapp        # Navigace do složky projektu
code .                               # Otevře VS Code v WSL režimu

# Možnost 2: Z VS Code pomocí Command Palette
# Ctrl+Shift+P > "WSL: Connect to WSL"
# Poté File > Open Folder a vybrat složku v WSL

# Možnost 3: Z VS Code pomocí Remote Explorer
# Kliknout na ikonu Remote Explorer v levém panelu
# Vybrat WSL Targets > Ubuntu (nebo jiná distro)
```

#### Ověření WSL připojení

V levém dolním rohu VS Code by měl být zobrazen indikátor `WSL: Ubuntu` (nebo název vaší distribuce). Pokud tam je, VS Code běží v WSL režimu.

```bash
# V integrovaném terminálu VS Code (Ctrl+`)
uname -a                            # Mělo by zobrazit Linux kernel
dotnet --info                       # Zobrazí .NET info včetně runtime paths
```

### Konfigurace launch.json

Soubor `launch.json` se nachází ve složce `.vscode/` v kořenu projektu. Definuje jak se má aplikace spustit pro debugging.

#### Konzolová aplikace

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Core Launch (console)",           // Název konfigurace v dropdown menu
            "type": "coreclr",                              // Typ debuggeru pro .NET Core/5+
            "request": "launch",                            // Spustit novou instanci (ne attach)
            "preLaunchTask": "build",                       // Spustit build task před debuggingem
            "program": "${workspaceFolder}/bin/Debug/net8.0/MyApp.dll",  // Cesta k DLL
            "args": [],                                     // Argumenty příkazové řádky
            "cwd": "${workspaceFolder}",                    // Working directory
            "console": "integratedTerminal",                // Výstup do VS Code terminálu
            "stopAtEntry": false                            // Nezastavit na Main()
        }
    ]
}
```

#### ASP.NET Core Web API

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Core Launch (web)",               // Název konfigurace
            "type": "coreclr",                              // Debugger pro .NET
            "request": "launch",                            // Spustit aplikaci
            "preLaunchTask": "build",                       // Build před spuštěním
            "program": "${workspaceFolder}/bin/Debug/net8.0/MyWebApi.dll",  // Cesta k DLL
            "args": [],                                     // CLI argumenty
            "cwd": "${workspaceFolder}",                    // Working directory
            "stopAtEntry": false,                           // Nezastavit na entry point
            "serverReadyAction": {                          // Akce po startu serveru
                "action": "openExternally",                 // Otevřít v prohlížeči
                "pattern": "\\bNow listening on:\\s+(https?://\\S+)", // Regex pro URL
                "uriFormat": "%s/swagger"                   // Otevřít Swagger UI
            },
            "env": {                                        // Environment variables
                "ASPNETCORE_ENVIRONMENT": "Development",    // Development prostředí
                "ASPNETCORE_URLS": "http://localhost:5000"  // URL pro server
            }
        }
    ]
}
```

#### Attach k běžícímu procesu

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Core Attach",                     // Název konfigurace
            "type": "coreclr",                              // Debugger
            "request": "attach",                            // Připojit se k procesu
            "processId": "${command:pickProcess}"           // Vybrat proces z dialogu
        }
    ]
}
```

### Konfigurace tasks.json

Soubor `tasks.json` definuje build a další úlohy. Nachází se ve složce `.vscode/`.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",                               // Název tasku (reference v launch.json)
            "command": "dotnet",                            // Příkaz k spuštění
            "type": "process",                              // Typ úlohy (process = přímé spuštění)
            "args": [
                "build",                                    // Argument: dotnet build
                "${workspaceFolder}/MyApp.csproj",          // Cesta k projektu
                "/property:GenerateFullPaths=true",         // Generovat plné cesty pro chyby
                "/consoleloggerparameters:NoSummary"        // Bez summary na konci
            ],
            "problemMatcher": "$msCompile",                 // Parser pro chyby kompilace
            "group": {
                "kind": "build",                            // Skupina: build
                "isDefault": true                           // Výchozí build task (Ctrl+Shift+B)
            }
        },
        {
            "label": "watch",                               // Task pro hot reload
            "command": "dotnet",
            "type": "process",
            "args": [
                "watch",                                    // dotnet watch
                "run",                                      // run příkaz
                "--project",
                "${workspaceFolder}/MyApp.csproj"
            ],
            "problemMatcher": "$msCompile",
            "isBackground": true                            // Běží na pozadí
        },
        {
            "label": "clean",                               // Vyčištění build artefaktů
            "command": "dotnet",
            "type": "process",
            "args": [
                "clean",
                "${workspaceFolder}/MyApp.csproj"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "restore",                             // Obnovení NuGet balíčků
            "command": "dotnet",
            "type": "process",
            "args": [
                "restore",
                "${workspaceFolder}/MyApp.csproj"
            ],
            "problemMatcher": "$msCompile"
        }
    ]
}
```

### Debugging workflow

#### Nastavení breakpointů

```
F9                  - Přepnout breakpoint na aktuálním řádku
Ctrl+Shift+F9       - Odstranit všechny breakpointy
# Kliknout do levého okraje (gutter) vedle čísla řádku - přidá/odebere breakpoint

# Podmíněný breakpoint:
# Pravý klik na breakpoint > "Edit Breakpoint" > zadat podmínku (např. i > 10)
```

#### Spuštění debuggeru

```
F5                  - Spustit debugging (s vybranou konfigurací z launch.json)
Ctrl+F5             - Spustit bez debuggeru
Shift+F5            - Zastavit debugging
Ctrl+Shift+F5       - Restart debugging
```

#### Ovládání během debuggingu

```
F10                 - Step Over (přeskočit volání funkce)
F11                 - Step Into (vstoupit do funkce)
Shift+F11           - Step Out (vystoupit z funkce)
F5                  - Continue (pokračovat do dalšího breakpointu)
```

#### Debug panely

```
# Během debuggingu se zobrazí v levém panelu:
Variables           - Lokální a globální proměnné
Watch               - Sledované výrazy (přidat vlastní)
Call Stack          - Zásobník volání
Breakpoints         - Seznam všech breakpointů

# Debug Console (Ctrl+Shift+Y):
# Zde lze zadávat výrazy a vyhodnocovat je v kontextu aktuálního breakpointu
```

#### Hot Reload (ASP.NET Core)

```bash
# Spustit aplikaci s hot reload
dotnet watch run                    # Automaticky restartuje při změně kódu

# Ve VS Code:
# Ctrl+Shift+P > "Tasks: Run Task" > "watch"

# Hot Reload funguje pro:
# - Změny v Razor views
# - Změny v CSS/JS
# - Většinu změn v C# kódu (ne všechny)
```

### Troubleshooting

#### Debugger se nepřipojí

```bash
# Ověřit, že .NET SDK je správně nainstalován
dotnet --info                       # Zobrazí SDK a runtime info

# Ověřit, že projekt jde zkompilovat
dotnet build                        # Mělo by proběhnout bez chyb

# Zkontrolovat, že cesta v launch.json odpovídá skutečné DLL
ls bin/Debug/net8.0/                # Ověřit existenci DLL souboru
```

#### "Could not find .NET Core debugger"

```bash
# Přeinstalovat C# extension
# Ctrl+Shift+P > "Extensions: Uninstall Extension" > C#
# Poté znovu nainstalovat C# Dev Kit

# Nebo ručně stáhnout debugger
# Ctrl+Shift+P > ".NET: Install New .NET SDK"
```

#### Breakpointy se nespouští (šedé kolečko)

```json
// V launch.json přidat/ověřit:
{
    "justMyCode": false,            // Debugovat i externí kód
    "enableStepFiltering": false,   // Nefiltrovat kroky
    "symbolOptions": {
        "searchMicrosoftSymbolServer": true  // Hledat symboly na MS serveru
    }
}
```

```bash
# Zkontrolovat, že build je v Debug konfiguraci
dotnet build --configuration Debug  # Explicitně Debug build

# Vyčistit a znovu zkompilovat
dotnet clean && dotnet build
```

#### Port je obsazený (Web API)

```bash
# Najít proces na portu 5000
lsof -i :5000                       # Zobrazí proces používající port
# nebo
netstat -tlnp | grep 5000           # Alternativa

# Ukončit proces
kill -9 <PID>                       # Ukončit proces podle PID

# Nebo změnit port v launch.json:
"env": {
    "ASPNETCORE_URLS": "http://localhost:5001"  // Jiný port
}
```

#### WSL2 - pomalý filesystem

```bash
# Projekt by měl být uložen ve WSL filesystému, ne na Windows disku
# Správně: /home/user/projects/myapp
# Špatně: /mnt/c/Users/user/projects/myapp (velmi pomalé)

# Přesunout projekt do WSL
cp -r /mnt/c/Users/user/projects/myapp ~/projects/
```

#### Nelze otevřít browser z WSL

```bash
# Nastavit výchozí browser pro WSL
export BROWSER=wslview              # Použije Windows browser

# Přidat do ~/.bashrc pro trvalé nastavení
echo 'export BROWSER=wslview' >> ~/.bashrc

# Nebo nainstalovat wslu utilitu
sudo apt install wslu               # Obsahuje wslview
```

