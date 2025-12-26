---
layout: default
title: Kódovací agenti
nav_order: 3
---

# Kódovací agenti

Dokumentace a tipy pro práci s AI nástroji zaměřenými na vývoj kódu.

## Claude Code

Claude Code je oficiální CLI nástroj od Anthropic, který integruje AI asistenta Claude přímo do příkazové řádky.

**Dokumentace:** https://docs.claude.com/en/docs/claude-code

### Základní příkazy

```bash
claude-code help                    # Zobrazit nápovědu
claude-code new                     # Spustit nový projekt/konverzaci
claude-code clear                   # Vymazat konverzaci
claude-code /help                   # Nápověda v konverzaci
```

### Užitečné zkratky a tipy

#### Práce s obsluhou
- `\` + `Enter` - Přechod na nový řádek v promptu (pro víceřádkový vstup)
- `/help` - Zobrazit dostupné příkazy v kontextu
- `/clear` - Vymazat historii konverzace

#### Efektivní komunikace
- Buďte konkrétní a jasní v požadavcích - "Vytvoř React komponentu s Props" místo "Vytvoř komponentu"
- Poskytněte kontext - "V souboru `src/components/Button.tsx` na řádku 42..."
- Používejte referenční formát `file_path:line_number` pro snadnou navigaci na konkrétní místa v kódu
- Claude automaticky vytvoří todo list u složitějších úkolů - nenásilně s tím

#### Paralelizace operací
- Claude může provádět více nezávislých operací najednou
- Pokud je to možné, zformulujte požadavek tak, aby Claude mohl pracovat paralelně: "Přidej do všech souborů X komentáře a udělej refactor Y"
- Ušetří čas a kontext

### Tipy pro efektivní использование

#### Psaní promptů
- **Příklady:** Když chcete specifický formát, ukažte příklad
- **Negativní instrukce:** "Nepoužívej X, místo toho použij Y"
- **Iterativní přístup:** Zkusit → zpětná vazba → opravit je lépe než dlouhý prompt

#### Analýza kódu
```
"Vysvětli, jak funguje funkce X v souboru Y"
"Kde se v kódu zpracovávají chyby?"
"Jaké bezpečnostní problémy mám v kódu?"
```

#### Generování a refaktoring
```
"Vytvoř komponentu X s těmito Props..."
"Refaktoruj funkci Y aby používala pattern Z"
"Přidej testy pro funkci X"
```

#### Git operace
```
"Vytvoř commit s těmito změnami"
"Vytvoř pull request s popisem"
"Napiš migration pro databázi"
```

### Vlastní příkazy (Slash Commands)

Vytvářejte si vlastní příkazy v `.claude/commands/` jako `.md` soubory:

```bash
# Umístění vlastních příkazů
.claude/
├── commands/
│   ├── test.md                 # /test - Spustí testy
│   ├── review-pr.md            # /review-pr - Zkontroluje PR
│   └── deploy.md               # /deploy - Deployment helper
```

**Příklad vlastního příkazu:**
```markdown
# .claude/commands/check-types.md
Zkontroluj TypeScript typy v projektu a hlásí chyby
```

### MCP Servery

Model Context Protocol (MCP) servery rozšiřují Claude Code o dodatečné nástroje.

**Běžné MCP servery:**
- `filesystem` - Přístup k souborům (obvykle vestavěný)
- `git` - Git operace
- `npm` - Npm registry a skripty
- Custom servery pro specifické nástroje

**Konfigurace:** Edituj `.claude/config.json` nebo globální konfiguracemi.

## Codex

GitHub Copilot a OpenAI Codex jsou AI-powered code completion systémy zaměřené na doplňování kódu v editoru.

### Základní použití

#### VS Code

```
Ctrl + \          # Otevřít Copilot chat panel
Ctrl + Alt + /    # Trigger inline completions
Alt + \           # Akceptovat suggestion
Esc               # Odmítnout suggestion
```

### Tipy pro efektivní autocomplete

#### Psaní kvalitních komentářů
Codex velmi dobře reaguje na jasné komentáře:

```python
# Seřadit seznam čísel od nejmenšího k největšímu, filtrovat záporné hodnoty
def sort_positive(numbers):
    # Codex doplní funkci správně

# Přeměnit seznam slovníků na JSON string s odsazením
def to_json(data):
    # Copilot vytvoří správný kód
```

#### Pojmenování funkcí a proměnných
Používejte deskriptivní názvy - Copilot se orientuje podle kontextu:

```javascript
// Špatné: data processing
function process(arr) { }

// Dobré: Copilot ví, co dělat
function filterAndSortUsersByCreationDate(users) { }

// Copilot generuje lepší návrhy pro konkrétní funkci
```

#### Výběr správného modelu
```
GitHub Copilot - Pro VS Code, rychlé completions (Codex)
GitHub Copilot Chat - Pro složitější úlohy, dialog-based
OpenAI API - Pro vlastní integraci s Codex/GPT-4
```

### Triky a best practices

#### Kontrola vygenerovaného kódu
- Zkontroluj vygenerovaný kód vždy - AI dělá chyby
- Zaměř se na logiku, bezpečnost (SQL injection, XSS) a performance
- Pokud je kód divný, přepiš funkci/komentář a zkus znovu

#### Práce s neurčitostí
Když Codex nabízí více možností:
- Podrobnější komentář = lepší suggestion
- Psej prefix kódu, kterou chceš: `const result = await fetch(...)`
- Copilot se pak orientuje podle kontextu

#### Zvýšení přesnosti
```javascript
// Slabý prompt pro Codex
function get() { }

// Silný prompt
function getUsersOrderedByRegistrationDate(userId) {
  // Fetch users from database
  // Filter by status 'active'
  // Sort by registration date descending
  // Return with pagination
}
```

### Bezpečnost a best practices

#### Co Copilot dělá dobře
- Běžné knihovny a frameworky (React, Vue, Django, Flask)
- CRUD operace
- Utility funkce
- Jednoduchá API integrace

#### Co Copilot dělá špatně
- Komplexní algoritmy
- Specifické business logiky
- Bezpečnostní systémy (hesla, JWT, autentizace)
- Optimalizované kód pro performance

**Vždy ověř:**
```
- Bezpečnost (SQL injection, XSS, CSRF)
- Správnost logiky
- Performance pro rozsáhlejší data
- Dependency management (ne outdated balíčky)
```

### Porovnání Claude Code vs. Copilot

| Aspekt | Claude Code | Copilot |
|--------|------------|---------|
| **Interakce** | Dialog, CLI | Inline completions |
| **Složitost** | Výborně na složité úlohy | Běžný kód a doplňování |
| **Kontext** | Celý projekt najednou | Aktuální soubor |
| **Git/DevOps** | Nativní support | Omezený |
| **Cena** | Subscription | Subscription |
| **Vhodné pro** | Refactor, nové feature | Hledání se během psaní |

## Viz také

- [Claude Code](claude-code.md) - Detailní konfigurace Claude Code CLI
- [AI Prompty](ai-prompts.md) - Prompty pro nastavení AI asistentů

---

**Poslední aktualizace:** 2025-11-07
