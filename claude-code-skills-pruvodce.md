# Claude Code Skills: Kompletní průvodce pro .NET vývojáře

**Skills transformují Claude Code z obecného AI asistenta na specializovaného vývojového partnera, který rozumí přesným vzorům tvého týmu.** Skill je markdown soubor, který učí Clauda jak provádět konkrétní úlohy — revize PR podle standardů tvého týmu, generování commit zpráv v preferovaném formátu, nebo dotazování na databázové schéma tvé firmy. Na rozdíl od konfiguračních souborů, které se načítají vždy, Skills používají **progresivní disclosure**: Claude načte pouze metadata při startu a plné instrukce aktivuje pouze když úloha odpovídá popisu Skillu. Tato architektura umožňuje neomezené specializované znalosti bez zahlcení kontextového okna.

Systém poskytuje tři rozšiřující mechanismy: **CLAUDE.md** pro vždy aktivní projektovou paměť, **Skills** pro specifickou expertízu načítanou on-demand, a **MCP servery** pro připojení k externím nástrojům a službám. Pro enterprise .NET vývoj to znamená zakódování tvých DDD vzorů, EF Core konvencí a Azure DevOps workflows do znovupoužitelných, sdílitelných schopností, které cestují s tvým codebase.

---

## Obsah

1. [Jak Skills fungují pod kapotou](#jak-skills-fungují-pod-kapotou)
2. [Anatomie SKILL.md a syntaktické požadavky](#anatomie-skillmd-a-syntaktické-požadavky)
3. [Multi-file architektura pro komplexní domény](#multi-file-architektura-pro-komplexní-domény)
4. [Skills vs CLAUDE.md vs MCP — správná volba](#skills-vs-claudemd-vs-mcp--správná-volba)
5. [Subagents — specializovaní agenti](#subagents--specializovaní-agenti)
6. [Skills vs Subagents — kdy co použít](#skills-vs-subagents--kdy-co-použít)
7. [Produkční .NET Skills knihovna](#produkční-net-skills-knihovna)
8. [Windows-specifické Skills pro enterprise vývoj](#windows-specifické-skills-pro-enterprise-vývoj)
9. [Kombinace Skills s MCP servery](#kombinace-skills-s-mcp-servery)
10. [Debugging a troubleshooting](#debugging-a-troubleshooting)
11. [Workflow vytváření Skills krok za krokem](#workflow-vytváření-skills-krok-za-krokem)
12. [Zdroje a dokumentace](#zdroje-a-dokumentace)

---

## Jak Skills fungují pod kapotou

Claude Code implementuje **tříúrovňovou progresivní disclosure architekturu**, která elegantně řeší výzvu kontextového okna.

### Tři fáze načítání

```
┌─────────────────────────────────────────────────────────────────┐
│  FÁZE 1: Startup (vždy)                                         │
│  ─────────────────────                                          │
│  Načítá se pouze `name` a `description` z každého Skillu        │
│  ≈ 100 tokenů na Skill                                          │
├─────────────────────────────────────────────────────────────────┤
│  FÁZE 2: Sémantické párování (při requestu)                     │
│  ──────────────────────────────────────────                     │
│  Claude porovnává tvůj request s popisy Skills                  │
│  Pokud match → žádá o povolení aktivace                         │
├─────────────────────────────────────────────────────────────────┤
│  FÁZE 3: Plné načtení (po schválení)                            │
│  ───────────────────────────────────                            │
│  Načte se kompletní SKILL.md (typicky < 5000 tokenů)            │
│  Podpůrné soubory se načítají pouze podle potřeby               │
└─────────────────────────────────────────────────────────────────┘
```

### Hierarchie priority při konfliktu názvů

Když mají Skills stejný název, platí tato priorita:

| Priorita | Umístění | Účel |
|----------|----------|------|
| 1 (nejvyšší) | Enterprise | Celoorganizační politiky |
| 2 | Personal (`~/.claude/skills/`) | Tvé cross-project schopnosti |
| 3 | Project (`.claude/skills/`) | Sdílené týmem přes git |
| 4 (nejnižší) | Plugin | Instalované z marketplace |

### Klíčový rozdíl od CLAUDE.md

| Aspekt | CLAUDE.md | Skills |
|--------|-----------|--------|
| **Načítání** | Každá session, automaticky | On-demand, po schválení |
| **Spotřeba tokenů** | Konstantní (vždy) | Pouze když aktivní |
| **Ideální pro** | Krátké, vždy platné konvence | Detailní, task-specifické postupy |
| **Příklad** | "Používáme C# 12, .NET 8" | "EF Core migration workflow" |

---

## Anatomie SKILL.md a syntaktické požadavky

Každý Skill vyžaduje soubor `SKILL.md` s YAML frontmatter následovaným markdown instrukcemi.

### Kritické syntaktické pravidla

```
⚠️  Frontmatter MUSÍ začínat na řádku 1 (žádné prázdné řádky před ---)
⚠️  Odsazení MUSÍ používat mezery, nikdy taby
⚠️  Název: pouze malá písmena, čísla, pomlčky (max 64 znaků)
⚠️  Popis: max 1024 znaků
```

### Základní šablona

```markdown
---
name: ef-migration-workflow
description: Entity Framework Core migration patterns pro domain-driven design. Použij při vytváření migrací, aktualizaci schémat, nebo správě databázových změn v EF Core projektech.
allowed-tools: Bash, Read, Write
---

# Entity Framework Migration Workflow

## Rychlý start
Generování migrace:
```bash
dotnet ef migrations add [NazevMigrace] --project src/Infrastructure --startup-project src/WebApi
```

## Konvence pojmenování migrací
- Feature migrace: `Add[Feature]` (např. `AddProductCatalog`)
- Schema změny: `Alter[Entity][Change]` (např. `AlterOrderAddDiscount`)
- Data migrace: `Seed[Data]` nebo `Migrate[Data]`

## Pre-migration checklist
1. Ověř, že DbContext konfigurace odpovídá domain modelu
2. Zkontroluj, že entity konfigurace používají Fluent API (ne atributy)
3. Ujisti se, že owned entities mají správně nakonfigurovaný table splitting
4. Validuj foreign key konvence podle týmových standardů
```

### Pole frontmatter

| Pole | Povinné | Detaily |
|------|---------|---------|
| `name` | Ano | Malá písmena, čísla, pomlčky. Max 64 znaků |
| `description` | Ano | Co Skill dělá A kdy ho použít. Max 1024 znaků |
| `allowed-tools` | Ne | Omezuje nástroje, které Claude může použít |

### Efektivní vs neefektivní popis

```yaml
# ❌ Příliš vágní — nebude spolehlivě matchovat
description: Pomáhá s databázemi

# ❌ Chybí trigger kontext
description: Entity Framework Core patterns

# ✅ Specifický s explicitními triggery
description: Entity Framework Core migration workflows. Použij při vytváření migrací, aktualizaci databázových schémat, nebo troubleshootingu EF Core migration chyb.

# ✅ Obsahuje klíčová slova i akce
description: SQL Server stored procedure patterns včetně parametrizace, error handlingu a performance optimalizace. Použij při psaní T-SQL, vytváření uložených procedur, nebo optimalizaci dotazů.
```

---

## Multi-file architektura pro komplexní domény

Produkční Skills typicky zahrnují více souborů organizovaných ve standardní adresářové struktuře.

### Doporučená struktura

```
ef-core-ddd/
├── SKILL.md                  # Hlavní instrukce (povinné)
├── entity-config.md          # Fluent API konfigurace
├── repository-pattern.md     # CQRS repository implementace
├── scripts/
│   ├── generate-config.ps1   # Auto-generování entity konfigurací
│   └── validate-schema.ps1   # Validace schématu
└── templates/
    └── DbContext.template    # DbContext boilerplate
```

### Odkazování podpůrných souborů

V SKILL.md používej relativní cesty:

```markdown
Pro entity configuration patterns viz [entity-config.md](entity-config.md).
Pro repository implementace viz [repository-pattern.md](repository-pattern.md).

Generování entity konfigurace:
```powershell
.\scripts\generate-config.ps1 -Entity Product
```
```

### Důležité pravidlo hloubky odkazů

```
✅  SKILL.md → entity-config.md           (přímý odkaz — funguje spolehlivě)
✅  SKILL.md → repository-pattern.md      (přímý odkaz — funguje spolehlivě)

⚠️  SKILL.md → A.md → B.md → C.md         (vnořené odkazy — může selhat)
```

**Best practice**: Udržuj reference na jedné úrovni. Přímé odkazy z SKILL.md na referenční soubory fungují spolehlivě. Hluboce vnořené reference mohou vést k částečnému načtení.

---

## Skills vs CLAUDE.md vs MCP — správná volba

Každý rozšiřující mechanismus slouží odlišným účelům.

### Rozhodovací matice

| Scénář | Použij | Důvod |
|--------|--------|-------|
| C# naming konvence, build příkazy | CLAUDE.md | Vždy platné, krátké, každá session |
| EF migrations workflow | Skills | Task-specifické, detailní postupy |
| Azure DevOps API přístup | MCP Server | Poskytuje skutečné nástroje (ne instrukce) |
| Týmové coding standardy | Project CLAUDE.md | Sdílené přes git, vždy načtené |
| Osobní preference | User CLAUDE.md | `~/.claude/CLAUDE.md` |

### Klíčový rozdíl: Skills vs MCP

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILLS = Instrukce (JAK používat nástroje)                     │
│  ─────────────────────────────────────────                      │
│  • Učí Clauda tvé konvence a best practices                     │
│  • Definují postupy a checklists                                │
│  • Jsou čistě textové (markdown)                                │
├─────────────────────────────────────────────────────────────────┤
│  MCP SERVERY = Nástroje (CO může Claude dělat)                  │
│  ────────────────────────────────────────────                   │
│  • Poskytují skutečné schopnosti (query DB, volat API)          │
│  • Jsou executable (běží jako procesy)                          │
│  • Rozšiřují Claude o nové akce                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Příklad**: MCP server připojí Clauda k SQL Server databázi. Skill učí Clauda tvé konvence pojmenování stored procedur, query patterns a pravidla performance optimalizace.

---

## Subagents — specializovaní agenti

Subagents jsou **specializovaní AI asistenti v rámci Claude Code**, kteří operují nezávisle s vlastním kontextovým oknem, vlastním system promptem a specifickými oprávněními k nástrojům. Na rozdíl od Skills, které přidávají znalosti do aktuální konverzace, Subagents **spouští samostatné instance Clauda** pro izolované zpracování úloh.

### Klíčové charakteristiky Subagents

```
┌─────────────────────────────────────────────────────────────────┐
│  SUBAGENT = Specializovaný pracovník                            │
│  ───────────────────────────────────                            │
│  • Vlastní izolované kontextové okno (200k tokenů)              │
│  • Vlastní system prompt definující roli a chování              │
│  • Konfigurovatelný přístup k nástrojům                         │
│  • Vrací pouze relevantní výsledky hlavnímu agentovi            │
│  • Nemůže vytvářet další subagents (single-level struktura)     │
└─────────────────────────────────────────────────────────────────┘
```

### Vestavění Subagents v Claude Code

Claude Code obsahuje několik předkonfigurovaných subagentů:

| Subagent | Účel | Nástroje |
|----------|------|----------|
| **Plan** | Výzkum codebase před vytvořením plánu (plan mode) | Read, Grep, Glob |
| **Explore** | Rychlé prohledávání a analýza kódu (read-only) | ls, git, find, cat, head, tail |
| **Verify** | Ověření implementace a testů | Read, Bash (omezený) |

### Anatomie vlastního Subagenta

Subagents se definují jako markdown soubory v adresáři `.claude/agents/` (projekt) nebo `~/.claude/agents/` (globální):

```markdown
---
name: code-reviewer
description: Provádí code review zaměřené na kvalitu a security. Použij při review PR nebo analýze kvality kódu.
tools: Read, Grep, Glob
model: sonnet
permissionMode: default
skills: security-check, coding-standards
---

# Code Reviewer Agent

Jsi specializovaný code reviewer se zaměřením na:

## Primární odpovědnosti
1. **Security review** — Hledej potenciální zranitelnosti
2. **Code quality** — Kontroluj SOLID principy a clean code
3. **Performance** — Identifikuj N+1 queries, memory leaky

## Review proces
1. Analyzuj změněné soubory pomocí Grep a Glob
2. Zkontroluj každý soubor proti coding standards
3. Vytvoř strukturovaný report s nálezy

## Output formát
Vrať JSON s nálezy:
```json
{
  "severity": "high|medium|low",
  "findings": [...],
  "recommendations": [...]
}
```
```

### Pole YAML frontmatter pro Subagents

| Pole | Povinné | Popis |
|------|---------|-------|
| `name` | Ano | Identifikátor agenta |
| `description` | Ano | Kdy agent použít (pro automatický výběr) |
| `tools` | Ne | Seznam povolených nástrojů (výchozí: všechny) |
| `model` | Ne | `sonnet`, `opus`, `haiku`, nebo `inherit` |
| `permissionMode` | Ne | Režim oprávnění (`default`, `strict`) |
| `skills` | Ne | Skills k automatickému načtení |

### Jak Subagents fungují

```
┌─────────────────────────────────────────────────────────────────┐
│                        TVŮJ REQUEST                             │
│   "Proveď security review tohoto PR a analyzuj performance"     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HLAVNÍ AGENT                                 │
│                                                                 │
│   Rozhodne: "Toto vyžaduje specializované review"               │
│   Deleguje úlohy na subagents                                   │
│                                                                 │
│   ┌─────────────┐                    ┌─────────────┐            │
│   │  security-  │                    │ performance │            │
│   │  reviewer   │  ◄── PARALELNĚ ──► │  -analyzer  │            │
│   │             │                    │             │            │
│   │ Vlastní     │                    │ Vlastní     │            │
│   │ kontext     │                    │ kontext     │            │
│   │ 200k tokenů │                    │ 200k tokenů │            │
│   └──────┬──────┘                    └──────┬──────┘            │
│          │                                  │                   │
│          └──────────┬───────────────────────┘                   │
│                     │                                           │
│                     ▼                                           │
│            Agregace výsledků                                    │
│            (pouze relevantní findings)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              KONSOLIDOVANÁ ODPOVĚĎ                              │
│   Security: 2 high, 3 medium findings                           │
│   Performance: 1 N+1 query detected                             │
└─────────────────────────────────────────────────────────────────┘
```

### Příklady Subagents pro .NET vývoj

#### Architecture Reviewer

```markdown
---
name: dotnet-architect
description: Analyzuje .NET architekturu a navrhuje vylepšení. Použij při review solution struktury nebo plánování refaktoringu.
tools: Read, Grep, Glob
model: opus
---

# .NET Architecture Reviewer

Jsi senior .NET architekt specializovaný na:
- Clean Architecture / Hexagonal Architecture
- Domain-Driven Design
- CQRS a Event Sourcing

## Analýza
1. Prozkoumej solution strukturu (*.sln, *.csproj)
2. Identifikuj vrstvy a jejich závislosti
3. Zkontroluj dodržování dependency rule

## Kontrolní body
- [ ] Domain vrstva nemá externí závislosti
- [ ] Infrastructure závisí pouze na Domain
- [ ] Žádné cyklické reference mezi projekty

## Output
Vrať strukturovanou zprávu s:
- Diagram závislostí (ASCII)
- Nalezené problémy
- Doporučení k refaktoringu
```

#### Database Migration Specialist

```markdown
---
name: ef-migration-specialist
description: Specializuje se na EF Core migrace a databázové změny. Použij při vytváření nebo troubleshootingu migrací.
tools: Read, Write, Bash, Grep
skills: ef-core-ddd
---

# EF Core Migration Specialist

## Odpovědnosti
1. Analyzovat změny v domain modelu
2. Generovat optimální migrace
3. Validovat SQL výstup
4. Kontrolovat breaking changes

## Workflow
1. Porovnej aktuální DbContext s posledním snapshotem
2. Identifikuj změny vyžadující migraci
3. Navrhni název migrace podle konvencí
4. Spusť `dotnet ef migrations add`
5. Zkontroluj vygenerovaný SQL

## Bezpečnostní kontroly
- Žádné DROP TABLE bez explicitního potvrzení
- Varuj při změnách sloupců s daty
- Kontroluj indexy pro nové FK
```

### Správa Subagents pomocí /agents příkazu

```bash
# Interaktivní správa subagents
/agents

# Zobrazí:
# 1. Seznam dostupných subagents
# 2. Jejich konfigurace (tools, model)
# 3. Možnost editace
```

---

## Skills vs Subagents — kdy co použít

Toto je klíčová sekce pro pochopení, kdy sáhnout po Skills a kdy po Subagents.

### Fundamentální rozdíl

```
┌─────────────────────────────────────────────────────────────────┐
│                         SKILLS                                  │
│  ─────────────────────────────                                  │
│  📚 = ZNALOSTI (knowledge)                                      │
│                                                                 │
│  • Přidávají instrukce do AKTUÁLNÍ konverzace                   │
│  • Sdílejí kontext s hlavním agentem                            │
│  • Učí Claude JAK něco dělat                                    │
│  • Jsou jako "receptář" nebo "manuál"                           │
│  • Spotřebovávají tokeny hlavního kontextu                      │
├─────────────────────────────────────────────────────────────────┤
│                       SUBAGENTS                                  │
│  ─────────────────────────────                                   │
│  👷 = PRACOVNÍCI (workers)                                       │
│                                                                 │
│  • Spouští NEZÁVISLOU instanci s vlastním kontextem             │
│  • Izolují práci od hlavní konverzace                           │
│  • DĚLAJÍ práci a vrací výsledky                                │
│  • Jsou jako "specializovaní kolegové"                          │
│  • Mají vlastních 200k tokenů                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Rozhodovací matice

| Situace | Použij | Důvod |
|---------|--------|-------|
| Coding standards a konvence | **Skill** | Znalost aplikovaná průběžně |
| Rozsáhlé code review 50+ souborů | **Subagent** | Izolace kontextu, paralelizace |
| Query patterns pro databázi | **Skill** | Instrukce pro použití nástrojů |
| Analýza logů z 3 microservices | **Subagent** | Každá služba vlastní kontext |
| Formát commit messages | **Skill** | Krátké, vždy platné pravidlo |
| Generování dokumentace z kódu | **Subagent** | Rozsáhlý průchod codebase |
| Test naming conventions | **Skill** | Pravidla pro psaní testů |
| Refaktoring 75 souborů | **Subagent** | Paralelní zpracování |

### Analogie: Receptář vs Kuchař

```
SKILL = Receptář
─────────────────
• Říká ti JAK uvařit jídlo
• Ty (hlavní agent) vaříš
• Receptář zabírá místo na stole
• Používáš ho průběžně při vaření

SUBAGENT = Specializovaný kuchař
────────────────────────────────
• Uvaří jídlo ZA TEBE
• Má vlastní kuchyň (kontext)
• Vrátí ti hotové jídlo (výsledek)
• Nevidíš jak vaří, jen výsledek
```

### Kdy Skills nestačí a potřebuješ Subagent

**1. Kontext by přetekl**
```
❌ Skill: Analyzuj těchto 200 souborů podle coding standards
   → Skill načte instrukce + 200 souborů = přetečení kontextu

✅ Subagent: Každý subagent zpracuje subset souborů
   → Každý má vlastních 200k tokenů
```

**2. Potřebuješ paralelizaci**
```
❌ Skill: Sekvenčně zpracuj frontend, backend, database změny
   → Vše v jednom kontextu, pomalé

✅ Subagents: 3 specializované subagenty běží paralelně
   → frontend-reviewer, backend-reviewer, db-reviewer
```

**3. Izolace je důležitá**
```
❌ Skill: Security reviewer by viděl celý kontext včetně citlivých dat

✅ Subagent: Dostane pouze to, co potřebuje zkontrolovat
```

### Kombinace Skills + Subagents

Nejsilnější pattern je kombinovat obojí:

```markdown
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: Komplexní code review agent
tools: Read, Grep, Glob
skills: coding-standards, security-patterns, performance-tips
---

Tento subagent:
1. Má vlastní izolovaný kontext (200k tokenů)
2. Automaticky načte 3 Skills pro expertízu
3. Aplikuje znalosti ze Skills při review
```

```
┌─────────────────────────────────────────────────────────────────┐
│                     CODE-REVIEWER SUBAGENT                       │
│                                                                 │
│   Izolovaný kontext (200k tokenů)                               │
│                                                                 │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│   │  coding-    │ │  security-  │ │ performance │              │
│   │  standards  │ │  patterns   │ │    -tips    │              │
│   │   SKILL     │ │   SKILL     │ │   SKILL     │              │
│   └─────────────┘ └─────────────┘ └─────────────┘              │
│          ▲              ▲               ▲                       │
│          │              │               │                       │
│          └──────────────┼───────────────┘                       │
│                         │                                       │
│                         ▼                                       │
│              Subagent aplikuje znalosti                         │
│              při review kódu                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Praktické příklady pro .NET

#### Příklad 1: PR Review Pipeline

```markdown
# Skill: coding-standards (vždy načtený)
# Subagent: pr-reviewer (spuštěný pro velké PR)

User: "Review this PR with 45 changed files"

Claude:
1. Vidí, že PR je velký (45 souborů)
2. Spustí pr-reviewer subagent
3. Subagent má načtený coding-standards skill
4. Subagent prochází soubory ve vlastním kontextu
5. Vrací pouze nálezy a doporučení
6. Hlavní kontext zůstává čistý
```

#### Příklad 2: Refaktoring s analýzou

```markdown
# Skills poskytují znalosti
- ef-core-ddd: Jak správně mapovat entity
- sql-patterns: Jak optimalizovat queries

# Subagent provádí práci
- refactoring-agent: Projde 100 souborů, aplikuje skills

User: "Refactor our repository layer to use proper EF Core patterns"

Claude:
1. Spustí refactoring-agent s skills: [ef-core-ddd, sql-patterns]
2. Subagent analyzuje všechny repository třídy
3. Aplikuje patterns z načtených skills
4. Vrátí seznam změn a návrhy
5. Hlavní agent prezentuje výsledky
```

### Srovnávací tabulka

| Aspekt | Skills | Subagents |
|--------|--------|-----------|
| **Typ** | Znalosti/instrukce | Pracovníci/executors |
| **Kontext** | Sdílený s hlavním agentem | Vlastní izolovaný (200k) |
| **Aktivace** | Automatická dle description | Delegace od hlavního agenta |
| **Paralelizace** | Ne | Ano |
| **Přístup k tools** | Dědí od hlavního agenta | Vlastní konfigurace |
| **Použití Skills** | N/A | Mohou načítat Skills |
| **Persistence** | Žádná (per-session) | Žádná (per-task) |
| **Vhodné pro** | Conventions, patterns, how-to | Rozsáhlé analýzy, paralelní práci |
| **Spotřeba tokenů** | Hlavní kontext | Vlastní kontext |
| **Příklad** | "Používej tuto naming convention" | "Analyzuj tyto 3 služby paralelně" |

### Doporučený postup

```
1. ZAČNI SE SKILLS
   └─► Pro většinu případů stačí Skills
   └─► Jednodušší na vytvoření a údržbu
   └─► Žádná režie na spouštění subagentů

2. ESKALUJ NA SUBAGENTS KDYŽ:
   └─► Kontext by přetekl (mnoho souborů)
   └─► Potřebuješ paralelní zpracování
   └─► Chceš izolovat citlivé operace
   └─► Úloha je dostatečně komplexní

3. KOMBINUJ PRO MAXIMUM SÍLY:
   └─► Subagent = worker s vlastním kontextem
   └─► Skills = znalosti načtené do subagenta
   └─► Nejlepší z obou světů
```

---

## Produkční .NET Skills knihovna

Repository **[nesbo/dotnet-claude-code-skills](https://github.com/nesbo/dotnet-claude-code-skills)** poskytuje production-ready Skills implementující hexagonal architecture patterns pro .NET 8+ a C# 12.

### DDD-Dotnet Skill

Kóduje domain-driven design patterns pro Ports vrstvu:

```markdown
---
name: ddd-dotnet
description: Domain-Driven Design patterns pro .NET. Použij při vytváření agregátů, entit, domain events, command handlerů, nebo query handlerů.
---

## Hierarchie doménových objektů
- IDomainObject: Základní interface pro všechny doménové objekty
- IEntity: Má identitu, implementuje equality podle ID
- IAggregate: Root entita s verzováním pro concurrency

## Aggregate pattern
```csharp
public class Order : Aggregate<OrderId>
{
    private readonly List<OrderLine> _lines = new();

    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    public void AddLine(ProductId productId, int quantity, Money price)
    {
        _lines.Add(new OrderLine(productId, quantity, price));
        AddDomainEvent(new OrderLineAddedEvent(Id, productId));
    }
}
```

## Command handler pattern (Paramore.Brighter)
```csharp
public class CreateOrderHandler : RequestHandlerAsync<CreateOrderCommand>
{
    public override async Task<CreateOrderCommand> HandleAsync(
        CreateOrderCommand command,
        CancellationToken ct = default)
    {
        var order = new Order(OrderId.New(), command.CustomerId);
        await _repository.AddAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);
        return await base.HandleAsync(command, ct);
    }
}
```
```

### EF-Core-DDD Skill

Infrastructure vrstva patterns pro Entity Framework Core persistence:

```markdown
---
name: ef-core-ddd
description: Entity Framework Core persistence patterns pro DDD. Použij při konfiguraci entit, implementaci repositories, nebo nastavování database contexts.
---

## Entity configuration pattern
```csharp
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders", "sales");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new OrderId(value));

        builder.OwnsMany(o => o.Lines, lines =>
        {
            lines.ToTable("OrderLines", "sales");
            lines.WithOwner().HasForeignKey("OrderId");
        });

        builder.Property(o => o.Version).IsRowVersion();
    }
}
```

## Write repository (commands)
```csharp
public class OrderWriteRepository : IOrderWriteRepository
{
    private readonly SalesDbContext _context;

    public async Task AddAsync(Order order, CancellationToken ct)
    {
        await _context.Orders.AddAsync(order, ct);
    }

    public async Task<Order?> GetByIdAsync(OrderId id, CancellationToken ct)
    {
        return await _context.Orders
            .Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }
}
```

## Read repository (queries) — optimalizované pro čtení
```csharp
public class OrderReadRepository : IOrderReadRepository
{
    private readonly SalesDbContext _context;

    public async Task<OrderDto?> GetOrderSummaryAsync(OrderId id, CancellationToken ct)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == id)
            .Select(o => new OrderDto
            {
                Id = o.Id.Value,
                CustomerName = o.Customer.Name,
                TotalAmount = o.Lines.Sum(l => l.Quantity * l.UnitPrice),
                LineCount = o.Lines.Count
            })
            .FirstOrDefaultAsync(ct);
    }
}
```
```

### BDD-Dotnet Skill

Test patterns používající BDD styl s NUnit:

```markdown
---
name: bdd-dotnet
description: BDD-style unit testing patterns pro .NET domain handlery. Použij při psaní testů pro command handlery, query handlery, nebo domain logiku.
---

## TestDataBuilder pattern
```csharp
public class OrderBuilder
{
    private OrderId _id = OrderId.New();
    private CustomerId _customerId = CustomerId.New();
    private readonly List<OrderLine> _lines = new();

    public OrderBuilder WithId(OrderId id) { _id = id; return this; }
    public OrderBuilder WithCustomer(CustomerId id) { _customerId = id; return this; }
    public OrderBuilder WithLine(ProductId product, int qty, Money price)
    {
        _lines.Add(new OrderLine(product, qty, price));
        return this;
    }

    public Order Build() => new Order(_id, _customerId, _lines);
}
```

## FakeClock pro time-dependent testy
```csharp
public class FakeClock : IClock
{
    public DateTimeOffset Now { get; set; } = DateTimeOffset.UtcNow;
    public void Advance(TimeSpan duration) => Now = Now.Add(duration);
}
```

## Handler test template
```csharp
[TestFixture]
public class CreateOrderHandler_Should
{
    [Test]
    public async Task Create_Order_With_Valid_Data()
    {
        // Arrange
        var context = TestContextFactory.CreateInMemory();
        var handler = new CreateOrderHandler(context, new FakeClock());
        var command = new CreateOrderCommand(CustomerId.New());

        // Act
        await handler.HandleAsync(command);

        // Assert
        context.Orders.Should().ContainSingle();
    }
}
```
```

---

## Windows-specifické Skills pro enterprise vývoj

### Visual Studio a MSBuild Skill

```markdown
---
name: vs-msbuild
description: Visual Studio a MSBuild workflow patterns pro Windows development. Použij při buildování solutions, správě project files, nebo troubleshootingu build chyb.
---

# Visual Studio / MSBuild Workflow

## Konvence struktury solution
```
MySolution/
├── src/
│   ├── Domain/           # Core business logika (žádné závislosti)
│   ├── Application/      # Use cases, CQRS handlery
│   ├── Infrastructure/   # EF Core, externí služby
│   └── WebApi/           # ASP.NET Core host
├── tests/
│   ├── Domain.Tests/
│   ├── Application.Tests/
│   └── Integration.Tests/
└── MySolution.sln
```

## Build příkazy
```powershell
# Clean a rebuild celé solution
dotnet build MySolution.sln --configuration Release --no-incremental

# Build konkrétního projektu
dotnet build src/WebApi/WebApi.csproj -c Release

# Restore s locked mode (pro CI/CD)
dotnet restore --locked-mode
```

## MSBuild troubleshooting
Generování binary logu pro detailní analýzu:
```powershell
dotnet build -bl:build.binlog
# Analyzuj pomocí MSBuild Structured Log Viewer
```

## Běžné project file patterns
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\Domain\Domain.csproj" />
  </ItemGroup>
</Project>
```
```

### SQL Server Development Skill

```markdown
---
name: sql-server-dev
description: SQL Server development patterns včetně stored procedur, indexování a query optimalizace. Použij při psaní T-SQL, vytváření stored procedur, nebo optimalizaci dotazů.
---

# SQL Server Development Patterns

## Šablona stored procedury
```sql
CREATE OR ALTER PROCEDURE [sales].[usp_GetOrdersByCustomer]
    @CustomerId UNIQUEIDENTIFIER,
    @FromDate DATE = NULL,
    @PageSize INT = 50,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SELECT
        o.OrderId,
        o.OrderDate,
        o.TotalAmount,
        o.Status
    FROM sales.Orders o WITH (NOLOCK)
    WHERE o.CustomerId = @CustomerId
        AND (@FromDate IS NULL OR o.OrderDate >= @FromDate)
    ORDER BY o.OrderDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

## Konvence pojmenování indexů
- Primary key: `PK_[NazevTabulky]`
- Foreign key: `FK_[NazevTabulky]_[ReferencovanaTabulka]`
- Unique: `UQ_[NazevTabulky]_[Sloupce]`
- Non-clustered: `IX_[NazevTabulky]_[Sloupce]`
- Filtered: `IXF_[NazevTabulky]_[Sloupce]_[Filter]`

## Query optimization checklist
1. Zkontroluj execution plan na Key Lookups → Přidej INCLUDE sloupce
2. Zkontroluj implicit conversions → Sjednoť datové typy
3. Vyhni se SELECT * → Specifikuj sloupce
4. Použij EXISTS místo COUNT(*) > 0
5. Zvaž filtered indexy pro časté WHERE klauzule

## Transakční pattern s error handlingem
```sql
CREATE OR ALTER PROCEDURE [sales].[usp_CreateOrder]
    @CustomerId UNIQUEIDENTIFIER,
    @OrderId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        SET @OrderId = NEWID();

        INSERT INTO sales.Orders (OrderId, CustomerId, OrderDate, Status)
        VALUES (@OrderId, @CustomerId, GETUTCDATE(), 'Created');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO
```
```

### Azure DevOps Pipelines Skill

```markdown
---
name: azure-devops-pipelines
description: Azure DevOps YAML pipeline patterns pro .NET aplikace. Použij při vytváření CI/CD pipelines, konfiguraci buildů, nebo nastavování deploymentů.
---

# Azure DevOps Pipeline Patterns

## Multi-stage .NET pipeline
```yaml
trigger:
  branches:
    include: [main, develop]
  paths:
    exclude: ['docs/**', '*.md']

pool:
  vmImage: 'windows-latest'

variables:
  buildConfiguration: 'Release'
  dotnetVersion: '8.0.x'

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        steps:
          - task: UseDotNet@2
            inputs:
              version: '$(dotnetVersion)'

          - task: DotNetCoreCLI@2
            displayName: 'Restore'
            inputs:
              command: 'restore'
              projects: '**/*.sln'
              feedsToUse: 'select'

          - task: DotNetCoreCLI@2
            displayName: 'Build'
            inputs:
              command: 'build'
              projects: '**/*.sln'
              arguments: '--configuration $(buildConfiguration) --no-restore'

          - task: DotNetCoreCLI@2
            displayName: 'Test'
            inputs:
              command: 'test'
              projects: '**/*Tests.csproj'
              arguments: '--configuration $(buildConfiguration) --no-build --collect:"XPlat Code Coverage"'

          - task: PublishCodeCoverageResults@2
            inputs:
              summaryFileLocation: '$(Agent.TempDirectory)/**/coverage.cobertura.xml'

  - stage: Deploy
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployToStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: '$(azureServiceConnection)'
                    appName: '$(webAppName)'
```

## Linkování work items
```yaml
# Auto-link commitů na work items
- task: PowerShell@2
  displayName: 'Link to Work Item'
  inputs:
    targetType: 'inline'
    script: |
      $message = git log -1 --pretty=%B
      if ($message -match '#(\d+)') {
        Write-Host "##vso[build.addbuildtag]WorkItem-$($Matches[1])"
      }
```

## NuGet feed s private packages
```yaml
- task: NuGetAuthenticate@1
  displayName: 'Authenticate NuGet'

- task: DotNetCoreCLI@2
  displayName: 'Restore with private feed'
  inputs:
    command: 'restore'
    projects: '**/*.sln'
    feedsToUse: 'config'
    nugetConfigPath: 'nuget.config'
```
```

### xUnit Testing Patterns Skill

```markdown
---
name: xunit-patterns
description: xUnit testing patterns pro .NET včetně theory data, fixtures, a integration testingu. Použij při psaní unit testů, integration testů, nebo nastavování test infrastruktury.
---

# xUnit Testing Patterns

## Theory s inline data
```csharp
public class OrderValidatorTests
{
    [Theory]
    [InlineData(0, false)]
    [InlineData(1, true)]
    [InlineData(100, true)]
    [InlineData(-1, false)]
    public void Quantity_Validation(int quantity, bool expected)
    {
        var result = OrderValidator.IsValidQuantity(quantity);
        Assert.Equal(expected, result);
    }
}
```

## Theory s member data
```csharp
public class PricingTests
{
    public static IEnumerable<object[]> DiscountScenarios =>
        new List<object[]>
        {
            new object[] { 100m, 0.1m, 90m },
            new object[] { 50m, 0.25m, 37.5m },
            new object[] { 200m, 0m, 200m }
        };

    [Theory]
    [MemberData(nameof(DiscountScenarios))]
    public void ApplyDiscount_CalculatesCorrectly(
        decimal price, decimal discount, decimal expected)
    {
        var result = PricingService.ApplyDiscount(price, discount);
        Assert.Equal(expected, result);
    }
}
```

## Collection fixture pro sdílené drahé resources
```csharp
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

public class DatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync()
    {
        // Start TestContainers SQL Server
        var container = new MsSqlBuilder().Build();
        await container.StartAsync();
        ConnectionString = container.GetConnectionString();
    }

    public Task DisposeAsync() => Task.CompletedTask;
}

[Collection("Database")]
public class OrderRepositoryTests
{
    private readonly DatabaseFixture _fixture;

    public OrderRepositoryTests(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Can_Save_And_Retrieve_Order()
    {
        // Arrange
        await using var context = new SalesDbContext(
            new DbContextOptionsBuilder<SalesDbContext>()
                .UseSqlServer(_fixture.ConnectionString)
                .Options);

        // Act & Assert
        // ...
    }
}
```

## WebApplicationFactory pro integration testy
```csharp
public class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Nahraď reálnou DB in-memory
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetOrders_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/api/orders");
        response.EnsureSuccessStatusCode();
    }
}
```
```

---

## Kombinace Skills s MCP servery

Nejefektivnější Claude Code setupy kombinují Skills s MCP servery. MCP poskytuje **nástroje** (databázová připojení, API přístup), zatímco Skills poskytují **znalosti** (jak tyto nástroje efektivně používat).

### Příklad: SQL Server vývojové prostředí

**1. MCP Server** — Poskytuje spouštění databázových dotazů:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-mssql"],
      "env": {
        "MSSQL_CONNECTION_STRING": "Server=localhost;Database=MyApp;Trusted_Connection=true;"
      }
    }
  }
}
```

**2. Skill** — Učí Clauda tvé query patterns a konvence:

```markdown
---
name: sql-queries
description: Query patterns pro naši aplikační databázi. Použij při dotazování customer dat, orders, nebo generování reportů.
---

## Přehled datového modelu
- Customers (sales schéma): Core záznamy zákazníků
- Orders (sales schéma): Order headers s CustomerId FK
- OrderLines (sales schéma): Order details s ProductId FK
- Products (catalog schéma): Product master data

## Query patterns
- Vždy používej schema kvalifikaci: `sales.Orders`, `catalog.Products`
- Vždy zahrnuj WITH (NOLOCK) pro read dotazy
- Používej parametrizované dotazy — nikdy string concatenation
- Pro stránkování používej OFFSET/FETCH, ne ROW_NUMBER()
```

### Příklad: Azure DevOps integrace

**1. MCP Server** — Microsoft oficiální Azure DevOps MCP server:

```bash
claude mcp add azure-devops --transport stdio npx -y @azure/mcp-server-azure-devops
```

**2. Skill** — Team-specifické workflow znalosti:

```markdown
---
name: ado-workflows
description: Azure DevOps workflow patterns pro náš tým. Použij při správě work items, vytváření pull requestů, nebo aktualizaci sprint boards.
---

## Work item konvence
- User Stories: Zahrnuj acceptance criteria v Description
- Tasks: Odhaduj v hodinách (1, 2, 4, 8)
- Bugs: Zahrnuj repro steps, expected vs actual

## PR workflow
1. Linkuj na work item pomocí #[WorkItemId] v titulku
2. Vyžaduj 2 approvals pro main branch
3. Spusť všechny unit testy před merge
4. Squash merge s conventional commit message

## Sprint conventions
- Sprint začíná v pondělí
- Capacity plánuj na 6 hodin/den (rezerva pro meetings)
- Blocker bugs mají prioritu před novými features
```

### Vizualizace kombinace

```
┌─────────────────────────────────────────────────────────────────┐
│                        TVŮJ REQUEST                             │
│         "Najdi všechny zákazníky bez objednávek"                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE                                  │
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │   SQL Skill     │         │   MCP Server    │               │
│  │ (JAK dotazovat) │  ────►  │ (SPUŠTĚNÍ SQL)  │               │
│  │                 │         │                 │               │
│  │ • Schema konvence│         │ • Připojení DB │               │
│  │ • Query patterns │         │ • Execute query │               │
│  │ • JOIN pravidla │         │ • Return data   │               │
│  └─────────────────┘         └─────────────────┘               │
│                                                                 │
│  Výsledný SQL:                                                  │
│  SELECT c.* FROM sales.Customers c WITH (NOLOCK)                │
│  LEFT JOIN sales.Orders o ON c.CustomerId = o.CustomerId        │
│  WHERE o.OrderId IS NULL                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Debugging a troubleshooting

### Skill se neaktivuje

**Zkontroluj specifičnost popisu**:

```yaml
# ❌ Příliš vágní — nebude spolehlivě matchovat
description: Pomáhá s databázemi

# ❌ Chybí trigger kontext
description: Entity Framework Core patterns

# ✅ Specifický s explicitními triggery
description: Entity Framework Core migration workflows. Použij při vytváření migrací, aktualizaci databázových schémat, nebo troubleshootingu EF Core migration chyb.
```

**Ověř YAML syntaxi**:

```powershell
# Zkontroluj strukturu souboru
Get-Content .claude\skills\my-skill\SKILL.md | Select-Object -First 10

# Běžné chyby:
# - Prázdný řádek před úvodním ---
# - Taby místo mezer
# - Chybějící uzavírací ---
# - Nesprávné odsazení
```

**Potvrd umístění souboru**:

```powershell
# Personal skills (Windows)
Test-Path "$env:USERPROFILE\.claude\skills\my-skill\SKILL.md"

# Project skills
Test-Path ".\.claude\skills\my-skill\SKILL.md"
```

### Debug mód pro detailní diagnostiku

```bash
claude --debug
```

Zobrazuje chyby načítání Skills, discovery proces a detaily sémantického párování.

### Monitorování spotřeby kontextu

Sleduj context meter (pravý dolní roh terminálu). Při **70% kapacity** podnikni akci:

| Příkaz | Účel |
|--------|------|
| `/clear` | Reset kontextu mezi nesouvisejícími úlohami |
| `/compact` | Sumarizuj konverzaci při zachování klíčového kontextu |

### Optimalizace výkonu Skills

```
┌─────────────────────────────────────────────────────────────────┐
│  TIPY PRO OPTIMALIZACI                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Single-level reference — linkuj přímo z SKILL.md            │
│  ✅ Bundled scripts — spouštěj bez načítání do kontextu         │
│  ✅ Lazy loading — referuj soubory, nenačítej celý obsah        │
│  ✅ Konkrétní description — minimalizuj false positive matches  │
│                                                                 │
│  ❌ Hluboce vnořené reference (A → B → C → D)                   │
│  ❌ Obrovské soubory v SKILL.md (> 10000 tokenů)                │
│  ❌ Vágní description (matchuje vše)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow vytváření Skills krok za krokem

### Krok 1: Vytvoř adresářovou strukturu

```powershell
# Pro project-level skill (sdílený týmem)
mkdir .claude\skills\ef-migrations

# Pro personal skill (pouze ty)
mkdir "$env:USERPROFILE\.claude\skills\ef-migrations"

cd .claude\skills\ef-migrations
```

### Krok 2: Vytvoř SKILL.md s frontmatter

```powershell
@"
---
name: ef-migrations
description: Entity Framework Core migration workflow pro náš domain model. Použij při vytváření, aplikování, nebo troubleshootingu EF Core migrací.
---

# EF Core Migration Workflow

## Rychlý start
``````bash
dotnet ef migrations add [NazevMigrace] --project src/Infrastructure --startup-project src/WebApi
``````

## Checklist před migrací
1. Ověř DbContext konfiguraci
2. Zkontroluj entity konfigurace (Fluent API)
3. Validuj foreign key konvence

## Po aplikaci migrace
``````bash
dotnet ef database update --project src/Infrastructure --startup-project src/WebApi
``````
"@ | Out-File -FilePath SKILL.md -Encoding utf8
```

### Krok 3: Otestuj discovery

```bash
claude
# Zeptej se: "Jaké skills jsou dostupné?" nebo "What skills are available?"
# Ověř, že tvůj skill se objeví v seznamu
```

### Krok 4: Otestuj aktivaci

```bash
# Zeptej se na něco, co matchuje tvůj description
"Potřebuji vytvořit novou migraci pro Order entitu"

# Claude by měl požádat o povolení použít tvůj skill
```

### Krok 5: Iteruj na description

Pokud se Skill neaktivuje když očekáváš, upřesni description s více specifickými trigger frázemi.

### Krok 6: Přidej podpůrné soubory (volitelné)

```powershell
# Vytvoř reference soubory
New-Item -ItemType File -Name "naming-conventions.md"
New-Item -ItemType File -Name "troubleshooting.md"

# Aktualizuj SKILL.md s odkazy
# Pro konvence pojmenování viz [naming-conventions.md](naming-conventions.md)
```

### Krok 7: Commitni do gitu (pro project skills)

```bash
git add .claude/skills/ef-migrations/
git commit -m "feat: add EF Core migrations skill"
git push
```

---

## Zdroje a dokumentace

### Oficiální zdroje

| Zdroj | URL |
|-------|-----|
| Skills dokumentace | https://code.claude.com/docs/en/skills |
| Subagents dokumentace | https://code.claude.com/docs/en/sub-agents |
| Anthropic Skills repo | https://github.com/anthropics/skills |
| Agent Skills standard | https://agentskills.io |
| Claude Agent SDK | https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk |
| Memory dokumentace | https://code.claude.com/docs/en/memory |
| MCP dokumentace | https://code.claude.com/docs/en/mcp |

### .NET-specifické zdroje

| Zdroj | URL |
|-------|-----|
| Production .NET Skills | https://github.com/nesbo/dotnet-claude-code-skills |
| Azure DevOps MCP | https://learn.microsoft.com/azure/devops/mcp-server |

### Community kolekce

| Zdroj | Popis |
|-------|-------|
| ComposioHQ/awesome-claude-skills | Obecný kurátorovaný seznam |
| travisvn/awesome-claude-skills | Zaměřený na Claude Code |
| daymade/claude-code-skills | 25 production-ready skills |
| VoltAgent/awesome-claude-code-subagents | 100+ specializovaných subagentů |

---

## Závěr

Claude Code nabízí **dvě komplementární cesty k rozšíření schopností**: Skills pro znalosti a Subagents pro pracovníky. Pochopení kdy použít kterou cestu je klíčem k efektivnímu využití.

### Skills = Znalosti

Skills představují paradigmatický posun od obecné AI asistence ke **specializované, kompozitní expertíze, která odráží skutečné praktiky tvého týmu**. Progresivní disclosure architektura zajišťuje, že specializované znalosti nezahlcují kontextové limity, zatímco sémantické párování umožňuje automatickou aktivaci bez explicitního volání.

**Kdy Skills**: Coding standards, conventions, how-to guides, patterns — vše co učí Clauda JAK pracovat.

### Subagents = Pracovníci

Subagents poskytují **izolované zpracování s vlastním kontextovým oknem**. Jsou ideální pro rozsáhlé analýzy, paralelní zpracování a úlohy kde bys jinak přetekl kontext hlavního agenta.

**Kdy Subagents**: Rozsáhlé code review, refaktoring mnoha souborů, paralelní analýza více služeb — vše co vyžaduje PRÁCI nad velkým množstvím dat.

### Kombinace = Maximum síly

Nejsilnější pattern je **Subagent se Skills** — worker s vlastním kontextem, který má načtené znalosti potřebné pro svou práci.

Pro enterprise .NET vývoj kombinace production-ready Skills knihoven (DDD, EF Core, BDD testing) s custom Skills a Subagents pro tvé specifické patterns vytváří AI asistenta, který skutečně rozumí tvému codebase a dokáže efektivně zpracovat i velké úlohy.

**Klíčový insight**: Skills kódují znalosti, které by se jinak ztratily. Subagents umožňují aplikovat tyto znalosti na rozsáhlé úlohy bez přetečení kontextu.

### Doporučený postup

1. **Začni se Skills** — pro většinu případů stačí
2. **Eskaluj na Subagents** — když kontext přetéká nebo potřebuješ paralelizaci
3. **Kombinuj** — Subagent se Skills pro maximum efektivity
4. **Sdílej přes git** — Skills i Subagents v `.claude/` adresáři
5. **Iteruj** — na descriptions pro lepší matching

Investice do vytváření kvalitních Skills a Subagents se časem násobí, protože Claude se stává stále efektivnějším v tvých specifických vývojových workflows.
