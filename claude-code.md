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
