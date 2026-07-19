---
layout: default
title: Kódovací agenti
parent: AI & LLM
nav_order: 1
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

## Architecture Decision Records (ADR)

### Co je ADR

ADR (Architecture Decision Record) je krátký strukturovaný dokument, který zaznamenává jedno konkrétní architektonické rozhodnutí – kontext problému, samotné rozhodnutí, zvažované alternativy a jeho důsledky. Záznamy se verzují spolu s kódem (typicky v `docs/adr/`) a číslují se postupně (0001, 0002, ...).

### Proč je důležitý pro vibecoding a kódování s AI agenty

- AI agent nemá paměť napříč konverzacemi/session – bez ADR opakovaně "znovuobjevuje" již jednou padlá rozhodnutí, nebo je nevědomky ruší v jiné konverzaci.
- Vibecoding = rychlé iterativní generování kódu s menším lidským dohledem nad detaily → hrozí, že se architektura "rozjede" různými směry podle toho, jak agent zrovna interpretuje zadání.
- ADR funguje jako dlouhodobá paměť projektu čitelná lidmi i agentem – před návrhem řešení si agent může přečíst historii rozhodnutí a nenavrhovat něco, co bylo záměrně zavrženo.
- Umožňuje více agentům / paralelním subagentům pracovat konzistentně na stejném projektu – všichni čerpají ze stejného zdroje pravdy.
- Usnadňuje code review vygenerovaného kódu – reviewer (člověk i agent) vidí *proč* bylo něco navrženo právě takto.

### Struktura – formát MADR

MADR (Markdown Architectural Decision Records) je dnes nejrozšířenější lehký formát ADR. Šablona:

```markdown
# <Číslo>. <Krátký název rozhodnutí>

## Status
Navrženo | Přijato | Zamítnuto | Nahrazeno ADR-00XX | Zastaralé

## Kontext
Jaký problém řešíme? Jaká jsou omezení (technická, obchodní, časová)?

## Rozhodnutí
Co jsme se rozhodli udělat a proč – hlavní zdůvodnění.

## Zvažované alternativy
- **Alternativa A** – popis, proč byla zamítnuta
- **Alternativa B** – popis, proč byla zamítnuta

## Důsledky
### Pozitivní
- ...
### Negativní / rizika
- ...

## Odkazy
- Související ADR, dokumentace, PR
```

### Kde a jak ADR ukládat

```
docs/
└── adr/
    ├── 0001-pouzit-postgresql-jako-hlavni-databazi.md
    ├── 0002-autentizace-pres-jwt.md
    └── 0003-monorepo-misto-multi-repo.md
```

- Soubory se číslují vzestupně, název obsahuje krátký slug rozhodnutí.
- ADR se zpětně nemění – pokud se rozhodnutí zruší, vytvoří se nové ADR se statusem "Nahrazuje ADR-000X" a staré se označí jako "Zastaralé/Nahrazeno".
- Volitelně lze použít `adr-tools` (sada Bash skriptů od M. Nygarda) pro generování a číslování:

```bash
adr init docs/adr                                  # inicializace ADR adresáře v repu
adr new "Použít PostgreSQL jako hlavní databázi"    # vytvoří nové číslované ADR ze šablony
adr new -s 5 "Nahradit REST API GraphQL"            # nové ADR, které nahrazuje (supersedes) ADR-0005
```

### Integrace do CLAUDE.md / AGENTS.md

Aby agent ADR skutečně respektoval a sám je navrhoval, je potřeba mu to explicitně napsat do instrukcí (`CLAUDE.md` pro Claude Code, `AGENTS.md` jako obecný standard napříč nástroji). Ukázka sekce ke zkopírování:

```markdown
## Architecture Decision Records (ADR)

Tento projekt používá ADR pro dokumentaci architektonických rozhodnutí v `docs/adr/`.

### Před návrhem řešení
- VŽDY si nejprve přečti existující ADR v `docs/adr/`, pokud se úkol týká
  architektury, výběru knihovny, datového modelu nebo cross-cutting změny.
- Neprosazuj řešení, které je v rozporu s platným (Přijatým) ADR, aniž bys
  na to explicitně upozornil uživatele.

### Kdy navrhnout nové ADR
Navrhni nové ADR (a počkej na schválení uživatelem), pokud úkol zahrnuje:
- výběr nové knihovny/frameworku/databáze,
- změnu veřejného API nebo datového schématu,
- zásadní změnu struktury projektu nebo deployment procesu,
- rozhodnutí, které bude těžké později vrátit zpět.

### Jak ADR vytvořit
- Použij šablonu v `docs/adr/template.md` (formát MADR).
- Číslo ADR = poslední použité číslo + 1.
- Status nového ADR je vždy "Navrženo", dokud ho uživatel neschválí.
- Pokud ADR nahrazuje starší rozhodnutí, uveď to v sekci Status obou souborů.
```

### Praktický workflow s agentem

1. Uživatel zadá úkol s architektonickým dopadem (např. "přejdi z REST na GraphQL").
2. Agent si přečte `docs/adr/` a instrukce v `CLAUDE.md`/`AGENTS.md`.
3. Agent navrhne ADR se statusem "Navrženo" a stručně shrne alternativy a důsledky.
4. Uživatel ADR schválí nebo upraví → status se změní na "Přijato".
5. Agent teprve poté implementuje kód podle přijatého rozhodnutí.
6. Commit obsahuje jak nové/aktualizované ADR, tak související kódové změny.

### Viz také
- MADR šablony a nástroje: https://adr.github.io/
- adr-tools: https://github.com/npryce/adr-tools

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

**Poslední aktualizace:** 2026-07-19
