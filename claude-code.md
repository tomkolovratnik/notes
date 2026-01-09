---
layout: default
title: Claude Code
parent: AI & LLM
nav_order: 2
---

# Claude Code

## Základní informace
Claude Code je oficiální CLI nástroj od Anthropic pro práci s AI asistentem Claude.

**Dokumentace:** https://docs.claude.com/en/docs/claude-code

## Užitečné příkazy
- `/help` - Nápověda
- `/clear` - Vymazání konverzace

## Vlastní příkazy (Slash Commands)
Vytvářejte vlastní příkazy v `.claude/commands/` jako `.md` soubory.

## Tipy a triky
- Buďte konkrétní v požadavcích
- Claude automaticky vytvoří todo list u složitějších úkolů
- Formát odkazů na kód: `file_path:line_number`
- Claude může provádět více nezávislých operací paralelně
- `\` + `Enter` - Přechod na nový řádek v promptu (pro víceřádkový vstup)

## Časté úlohy
```markdown
# Práce se soubory
"Vytvoř nový soubor X s obsahem Y"
"Uprav soubor X, změň Y na Z"
"Najdi všechny soubory obsahující X"

# Git operace
"Vytvoř commit s těmito změnami"
"Vytvoř pull request"

# Analýza kódu
"Vysvětli, jak funguje funkce X"
"Kde se zpracovávají chyby?"
```

## Konfigurace

### Umístění konfiguračních souborů

| Funkce | User (globální) | Project | Local (gitignore) |
|--------|-----------------|---------|-------------------|
| Settings | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| Subagents | `~/.claude/agents/` | `.claude/agents/` | — |
| MCP servers | `~/.claude.json` | `.mcp.json` | `~/.claude.json` (per-project) |
| Plugins | `~/.claude/settings.json` | `.claude/settings.json` | `.claude/settings.local.json` |
| CLAUDE.md | `~/.claude/CLAUDE.md` | `CLAUDE.md` nebo `.claude/CLAUDE.md` | `CLAUDE.local.md` |

**Priorita načítání:** Local > Project > User (lokální přepisuje projektové, projektové přepisuje globální)

### MCP Servery
Model Context Protocol (MCP) servery rozšiřují funkcionalitu Claude Code o dodatečné nástroje a schopnosti.

**Konfigurace:** MCP servery se konfigurují v souboru nastavení Claude Code (obvykle `.claude/config.json` nebo globální konfigurace).

**Příklad konfigurace - Serena MCP Server:**
```json
"mcpServers": {
  "serena": {
    "type": "stdio",                    // Typ komunikace (stdio = standardní vstup/výstup)
    "command": "uvx",                   // Příkaz pro spuštění serveru
    "args": [
      "--python",                       // Specifikace Python verze
      "3.12",
      "--from",                         // Zdroj instalace
      "git+https://github.com/oraios/serena",
      "serena",
      "start-mcp-server",
      "--context",                      // Kontext asistenta
      "ide-assistant",
      "--project",                      // Cesta k projektu
      "D:\\_Repos\\Conseq\\Poc-Kafka-Container-CodeNow"
    ],
    "env": {}                          // Environmentální proměnné
  }
}
```

**Příklad konfigurace - MySQL/MariaDB MCP Server:**

MySQL MCP server (Node.js) kompatibilní s MariaDB pro práci s databází.

**Instalace přes CLI:**
```bash
# Globální instalace serveru
npm install -g @benborla29/mcp-server-mysql

# Přidání do Claude Code s konfigurací (read-only režim)
claude mcp add mcp_server_mysql \
  -e MYSQL_HOST="127.0.0.1" \
  -e MYSQL_PORT="3306" \
  -e MYSQL_USER="mcp_user" \
  -e MYSQL_PASS="********" \
  -e MYSQL_DB="tvuj_db" \
  -e ALLOW_INSERT_OPERATION="false" \
  -e ALLOW_UPDATE_OPERATION="false" \
  -e ALLOW_DELETE_OPERATION="false" \
  -- npx @benborla29/mcp-server-mysql
```

**Ruční konfigurace v `~/.claude.json`:**
```json
{
  "mcpServers": {
    "mysql_mariadb": {
      "type": "stdio",
      "command": "npx",
      "args": ["@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",              // Adresa databázového serveru
        "MYSQL_PORT": "3306",                   // Port (3306 = MySQL/MariaDB výchozí)
        "MYSQL_USER": "mcp_user",               // Databázový uživatel
        "MYSQL_PASS": "********",               // Heslo
        "MYSQL_DB": "tvuj_db",                  // Název databáze
        "ALLOW_INSERT_OPERATION": "false",      // Zakázat INSERT (read-only)
        "ALLOW_UPDATE_OPERATION": "false",      // Zakázat UPDATE (read-only)
        "ALLOW_DELETE_OPERATION": "false"       // Zakázat DELETE (read-only)
      }
    }
  }
}
```

**Použití v Claude Code:**
```bash
# Kontrola stavu MCP serverů
/mcp

# Dotazy v chatu
"Spusť execute_sql s SELECT * FROM users LIMIT 10;"
"Zobraz tabulky v databázi"
"Jaké má tabulka users sloupce?"
```

**Tipy pro produkční prostředí:**
- **SSH tunel**: Pro nepřístupné DB použij lokální forward
  ```bash
  # Vytvoření SSH tunelu na vzdálený server
  ssh -N -L 3307:db.interna:3306 user@bastion
  # Pak nastav MYSQL_HOST=127.0.0.1, MYSQL_PORT=3307
  ```
- **Read-only režim**: Vždy začni s `ALLOW_*_OPERATION=false` pro bezpečnost
- **Bezpečnost**: Instaluj MCP servery jen z důvěryhodných zdrojů, rotuj hesla, minimální oprávnění
- **Alternativa**: MariaDB MCP (Python) - nativní pro MariaDB s vektorovými nástroji

### Hooks
Shell příkazy spouštěné při určitých událostech (např. před/po tool calls).

### Statusline
Konfigurace stavového řádku pro zobrazení důležitých informací.

## Paralelní instance (Multi-Agent)

Více Claude Code instancí na jednom repozitáři pomocí Git Worktree.

### Co je Git Worktree?

**Normálně:** 1 repozitář = 1 adresář = 1 větev

**S worktree:** 1 repozitář = N adresářů = N větví současně

```
~/projekt/              # main (hlavní repo)
    └── .git/           # sdílený git
~/projekt-feature1/     # feature/auth (worktree)
~/projekt-feature2/     # feature/api (worktree)
```

**Worktree vs Clone:**
- Zabírá ~10-20% místa oproti clone
- Git historie sdílená (fetch jednou pro všechny)
- Částečná izolace (sdílený .git)

### Základní Git Worktree příkazy

```bash
# Vytvoření worktree s novou větví
git worktree add ../projekt-feature -b feature/moje-feature

# Seznam worktrees
git worktree list

# Smazání worktree
git worktree remove ../projekt-feature

# Vyčištění neplatných worktrees
git worktree prune
```

### Praktické workflow - více agentů

```bash
# 1. Vytvoř worktrees pro různé vrstvy/úkoly
cd ~/projekt
git worktree add ../projekt-domain -b feature/domain-work
git worktree add ../projekt-api -b feature/api-work
git worktree add ../projekt-tests -b feature/tests-work

# 2. Spusť Claude Code v každém worktree (nový terminál)
cd ../projekt-domain && claude
cd ../projekt-api && claude
cd ../projekt-tests && claude

# 3. Dej každému agentovi specifický úkol:
# Agent 1: "Implementuj User entity v Domain vrstvě"
# Agent 2: "Vytvoř AuthController s login/register endpointy"
# Agent 3: "Napiš unit testy pro AuthService"

# 4. Po dokončení - merge do hlavní větve
cd ~/projekt
git merge feature/domain-work
git merge feature/api-work
git merge feature/tests-work

# 5. Cleanup
git worktree remove ../projekt-domain
git worktree remove ../projekt-api
git worktree remove ../projekt-tests
```

### Struktura pro Clean Architecture

```
Agent: domain       → src/Domain/        → feature/domain-work
Agent: application  → src/Application/   → feature/application-work
Agent: infrastructure → src/Infrastructure/ → feature/infra-work
Agent: api          → src/WebApi/        → feature/api-work
Agent: tests        → tests/             → feature/tests-work
```

### Best Practices

**Doporučeno:**
- Jasně rozděl oblasti - každý agent = jiné soubory
- Commituj často - malé, atomické commity
- Synchronizuj před merge - `git fetch && git rebase`
- Pojmenuj terminály - víš který agent je který

**Nedoporučeno:**
- Dva agenti na stejném souboru - přepíší se navzájem
- Příliš mnoho agentů - nezvládneš reviewovat
- Velké změny bez commitů - těžší merge

### Řešení problémů

```bash
# "Branch already checked out" - větev je zamčená v jiném worktree
git worktree list                        # Najdi kde
git worktree remove <konfliktní-path>    # Smaž worktree

# Lock file error - před spuštěním více agentů
rm -f ~/.claude/*.lock

# Dependencies v novém worktree
cd ../projekt-feature
dotnet restore    # .NET
npm install       # Node.js
```

### Limity a doporučení

| Metrika | Doporučení |
|---------|------------|
| Max paralelních agentů | 3-5 |
| Min velikost úkolu | 30+ minut práce |
| Překryv souborů | 0% (ideálně) |
| Frekvence merge | Po každém milestonu |

## Viz také

- [Kódovací agenti](coding-agents.md) - Porovnání Claude Code vs. Copilot, tipy
- [AI Prompty](ai-prompts.md) - Prompty pro nastavení AI asistentů
