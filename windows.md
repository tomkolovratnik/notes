---
layout: default
title: Windows
nav_order: 10
---

# Windows

## Virtuální plochy

Windows 10+ má vestavěnou funkci Virtuálních ploch (Virtual Desktops), která umožňuje mít více nezávislých pracovních ploch. Perfekt pro organizaci projektů a separaci práce.

### Zkratky pro virtuální plochy

```
Win + Tab           - Otevření Task View (přehled ploch a oken)    // Zobrazení všech virtuálních ploch
Win + Ctrl + D      - Vytvořit novou virtuální plochu              // Přidání nové plochy
Win + Ctrl + Right  - Přechod na další virtuální plochu            // Posun doprava
Win + Ctrl + Left   - Přechod na předchozí virtuální plochu        // Posun doleva
Win + Ctrl + F4     - Zavřít aktuální virtuální plochu             // Smazání plochy
```

### Tipy pro práci s virtuálními plochami

- **Organizace projektů**: Každý projekt na vlastní ploše (Projekt A, Projekt B, Learning, Komunikace)
- **Oddělení aktivit**: Web - Dev - VM - Dokumentace (každá aktivita na vlastní ploše)
- **Přesunutí okna**: Otevřít Task View (Win + Tab), kliknout na okno a přetáhnout na jinou plochu
- **Záložka Alt+Tab**: Přepíná jen v rámci aktuální plochy (na rozdíl od klasického Alt+Tab)

---

## Nejčastěji používané zkratky

### Správa oken

```
Win + Left          - Přichytit okno vlevo (snap)                  // Okno zaujímá levou půlku
Win + Right         - Přichytit okno vpravo (snap)                 // Okno zaujímá pravou půlku
Win + Up            - Maximalizovat okno                           // Fullscreen
Win + Down          - Obnovit nebo minimalizovat okno              // Vrácení z fullscreen
Win + V             - Přepínat mezi snapovanými okny               // Cyklus snapovaných oken
```

### Přepínání oken a aplikací

```
Alt + Tab           - Přepínač aplikací (klasický)                 // Cyklus otevřených okn
Alt + Shift + Tab   - Přepínač aplikací (zpět)                     // Cyklus zpět
Win + Alt + Right   - Přechod na další okno v skupině              // V rámci stejné aplikace
Win + Alt + Left    - Přechod na předchozí okno v skupině          // Zpět v rámci aplikace
```

### Clipboard a screenshot

```
Win + V             - Clipboard History (poslední 25 položek)      // Otevření historie schránky
Win + Shift + S     - Screenshot (Snipping Tool)                   // Ořezavka obrazovky
Win + Print         - Screenshot (uloží do Screenshots)            // Snímek celé obrazovky
Win + Shift + V     - Vložit z clipboard history                   // Nalepení z historie
```

### Desktopy a pracovní plocha

```
Win + D             - Skrýt/ukázat plochu (minimalizace všech)     // Minimalizace všech oken
Win + A             - Otevření Action Center                       // Zprávy a notifikace
Win + I             - Otevření Settings                            // Nastavení Windows
Win + X             - Otevření Power User Menu                     // Admin menu
```

### Hledání a spouštění

```
Win                 - Otevření Start Menu / Vyhledávání            // Spuštění aplikace
Win + S             - Otevření Search                              // Vyhledávání souborů
Win + E             - Otevření File Exploreru                      // Správce souborů
Win + R             - Otevření Run dialog (cmd, powershell, apod)  // Příkazový řádek
```

### Speciální funkce

```
Win + .             - Otevření Emoji & Symbols                     // Emoji, symboly, výrazy
Win + ;             - Otevření Emoji picker (alternativa)          // Emoji výběr
Win + ,             - Peek at desktop (prozradit plochu)           // Náhled plochy
Win + Pause         - Otevření System Properties                   // Informace o systému
```

### Pracovní prostory (Workspace)

```
Win + Shift + Right - Přesunout okno na další virtuální plochu     // Okno na další plochu
Win + Shift + Left  - Přesunout okno na předchozí virtuální plochu // Okno na předchozí plochu
```

---

## Alt+Tab - Pokročilé chování

V novějších verzích Windows 10/11 je Alt+Tab vylepšený:

- Zobrazuje velký náhled oken
- Lze filtrovat podle aplikace (např. jen VS Code)
- Lze spustit nejčastěji používanou aplikaci dlouhým stisknutím

---

## Tip: Vlastní klávesové zkratky

V nastavení lze nastavit vlastní zkratky pro spouštění aplikací:

```
Nastavení > Zařízení > Klávesnice > Pokročilé
Nebo: Win + I > Nastavení > Zařízení > Klávesnice
```

Lze přiřadit vlastní kombinace pro:
- Spouštění aplikací
- Přepínání okna
- Spuštění skriptů

---

## PowerShell zkratky (Windows Terminal)

Pro PowerShell v Windows Terminalu:

```
Ctrl + +            - Zvětšit text                                  // Zvětšení velikosti fontu
Ctrl + -            - Zmenšit text                                  // Zmenšení velikosti fontu
Ctrl + Shift + +    - Otevřít nový panel                            // Vedle sebe nebo pod sebou
Ctrl + Shift + W    - Zavřít panel                                  // Uzavření panelu
Ctrl + Alt + Right  - Přesun fokus doprava                          // Mezi panely
Ctrl + Alt + Left   - Přesun fokus doleva                           // Mezi panely
```

