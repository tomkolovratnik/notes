---
layout: default
title: VS Code
nav_order: 5
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
