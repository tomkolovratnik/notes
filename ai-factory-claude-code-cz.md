# Budování AI Factory s Claude Code agenty

Nejproduktivnější přístup k budování automatizované pipeline pro vývoj softwaru kombinuje **nativní subagent systém Claude Code** s orchestračními frameworky jako **Claude-Flow** (11k GitHub stars) a **Claude Squad**, využívá **MCP servery** pro integraci nástrojů a **file-based state management** mezi fázemi pipeline. Claude Code nyní poskytuje kompletní programovou kontrolu přes **Claude Agent SDK**, hooks systém a headless mode—což umožňuje sofistikovanou multi-agentní montážní linku, kde specializovaní agenti zpracovávají research, architekturu, kódování, testování a deployment v Kanban-like flow.

Tato architektura není teoretická: Boris Cherny (Claude Code Team Lead) reportuje ~5 releases na inženýra denně, zatímco Jaana Dogan (Google Principal Engineer) postavila distribuovaný agent orchestrátor za jednu hodinu, který odpovídal tomu, co její tým budoval celý rok. Klíčem je pochopení nativních schopností Claude Code a jejich doplnění správnými orchestračními patterny.

---

## Automatizační primitiva Claude Code odemykají vývoj v měřítku továrny

Claude Code poskytuje několik propojených systémů, které tvoří základ jakékoli implementace AI Factory.

### Hooks systém umožňuje deterministickou kontrolu

Hooky jsou uživatelsky definované příkazy, které se automaticky spouštějí v konkrétních bodech životního cyklu. **Osm dostupných hook eventů** pokrývá celý životní cyklus agenta:

| Hook Event | Spouštěcí bod | Use Case pro Factory |
|------------|---------------|----------------------|
| **PreToolUse** | Před spuštěním jakéhokoli nástroje | Validace vstupů, security wrappery |
| **PostToolUse** | Po dokončení nástroje | Auto-formátování, linting, logování |
| **Stop** | Když agent skončí | Validace quality gate, continuation logika |
| **SubagentStop** | Když subagent dokončí | Validace kvality výstupu workera |
| **SessionStart** | Začátek session | Načtení stavu pipeline, nastavení prostředí |
| **SessionEnd** | Ukončení session | Uložení stavu, spuštění další fáze pipeline |

Hooky se konfigurují v JSON na `~/.claude/settings.json` (globální), `.claude/settings.json` (projektové), nebo `.claude/settings.local.json` (lokální). Produkční quality gate hook vypadá takto:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Vyhodnoť, zda jsou všechny úkoly dokončeny. Vrať {\"decision\": \"approve\" nebo \"block\", \"reason\": \"vysvětlení\"}"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write",
      "hooks": [{ "type": "command", "command": "prettier --write $CLAUDE_PROJECT_DIR" }]
    }]
  }
}
```

### Headless mode umožňuje integraci do pipeline

Spouštěj Claude Code programově s `claude -p` pro CI/CD pipelines a batch processing:

```bash
# Spuštění se strukturovaným JSON výstupem
claude -p "Zkontroluj bezpečnostní zranitelnosti" --output-format json --allowedTools "Read,Grep"

# Multi-turn sessions pro stateful pipelines
session_id=$(claude -p "Inicializuj review architektury" --output-format json | jq -r '.session_id')
claude -p --resume "$session_id" "Pokračuj do implementační fáze"
```

Klíčové flagy pro automatizaci: `--permission-mode` (acceptEdits, bypassPermissions), `--allowedTools`/`--disallowedTools` pro sandboxing, `--append-system-prompt` pro injekci kontextu, a `--mcp-config` pro dynamické načítání serverů.

### Claude Agent SDK poskytuje plnou programovou kontrolu

SDK (přejmenované z Claude Code SDK) vystavuje stejné nástroje, agent loop a context management v Pythonu a TypeScriptu:

```python
from claude_agent_sdk import query, ClaudeAgentOptions

async def run_pipeline_stage(prompt: str, tools: list[str]):
    async for message in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            allowed_tools=tools,
            setting_sources=['project']  # Načti CLAUDE.md konfigurace
        )
    ):
        if hasattr(message, 'result'):
            return message.result
```

SDK podporuje third-party providery (Amazon Bedrock, Google Vertex AI, Microsoft Foundry) přes environment proměnné, což umožňuje flexibilitu enterprise deploymentu.

---

## Multi-agent orchestrační patterny pohánějí montážní linku

Tři architektonické přístupy dominují produkčním implementacím AI Factory, každý s odlišnými tradeoffs.

### Nativní subagenti pro paralelizaci v rámci session

Vestavěný **Task Tool** v Claude Code spouští subagenty v izolovaných context windows. Definuj specializované agenty v `.claude/agents/`:

```markdown
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Expert na code review. Používej proaktivně po změnách kódu.
tools: Read, Grep, Glob, Bash
model: inherit
---
Kontroluj kód na bezpečnostní zranitelnosti, výkonnostní problémy a maintainabilitu.
```

Spusť paralelní exekuci přirozeným jazykem: *"Prozkoumej codebase pomocí 4 tasků paralelně. Každý agent by měl prozkoumat různé adresáře."* Subagenti mohou být obnoveni pomocí `agentId` pro pokračování konverzací a jejich výsledky jsou automaticky sumarizovány pro zachování hlavního kontextu.

### Process-level izolace s tmux a git worktrees

Nejprověřenější pattern pro **skutečnou paralelní exekuci agentů** kombinuje tmux sessions s git worktrees:

```bash
# Každý agent dostane izolovaný worktree a terminálovou session
git worktree add ../feature-auth -b auth-feature
tmux new-session -d -s agent-auth 'cd ../feature-auth && claude'
```

**Claude Squad** (github.com/smtg-ai/claude-squad, 5.1k stars) balí tento pattern do terminálového manageru s TUI rozhraním, YOLO módem pro auto-akceptaci promptů a podporou více AI providerů.

### Enterprise orchestrace s Claude-Flow

**Claude-Flow** (github.com/ruvnet/claude-flow, 11k stars) poskytuje komplexní factory orchestraci:

```bash
# Inicializace hive-mind swarm
npx claude-flow@alpha init --force
npx claude-flow@alpha swarm init --topology mesh --max-agents 5

# Spawn specializovaných workerů
npx claude-flow@alpha swarm spawn architect "navrhni REST API"
npx claude-flow@alpha swarm spawn coder "implementuj endpointy"
npx claude-flow@alpha hive-mind spawn "enterprise systém"
```

Klíčové schopnosti zahrnují **100+ MCP nástrojů** pro orchestraci, **AgentDB integraci** poskytující 96x-164x rychlejší vector search, **ReasoningBank** pro persistentní paměť se sémantickým vyhledáváním, a **hooks systém** pro pre-task assignment a post-task training.

---

## Kanban pipeline fáze vyžadují explicitní state management

Kanban-like flow (Idea → Research → Architektura → Kódování → Testování → Deployment) vyžaduje pečlivý state management mezi agenty.

### File-based state dokumenty předávají kontext mezi fázemi

Nejrobustnější pattern používá strukturované Markdown dokumenty jako "worker dokumenty":

```markdown
# .state/pipeline/002-architecture.md
## Fáze: Architektura
## Status: in_progress
## Agent: architect
## Závislosti: [001-research]

### Vstupní kontext
- Z Research: {{research_findings}}

### Deliverables
- [ ] Diagram systémové architektury
- [ ] API specifikace
- [ ] Databázové schéma

### Gate kritéria
- Architecture review schválen
- Všechna rozhraní zdokumentována
- Bezpečnostní aspekty adresovány

### Výstup
<!-- Agent píše výsledky sem -->
```

**File locking** zabraňuje konfliktům, když více agentů může přistupovat ke sdílenému stavu:

```python
class StateManager:
    def acquire_locks(self, files: list[str]) -> list[str]:
        locked = []
        for file_path in files:
            lock_key = f"lock:{file_path}"
            if redis.set(lock_key, agent_id, nx=True, ex=300):
                locked.append(file_path)
        return locked
```

### Quality gates vynucují přechody mezi fázemi

Každá fáze pipeline by měla mít explicitní validaci před postupem:

```python
class QualityGate:
    checks = [
        check_tests_pass,
        check_type_safety,
        check_no_conflicts,
        check_coverage_threshold
    ]

    def validate(self, changes):
        for check in self.checks:
            result = check(changes)
            if not result['passed']:
                self.reassign_task(result['reason'])
                return False
        return True
```

**Spec Workflow System** v Claude-Flow (ze zhsama/claude-sub-agent) implementuje **75-95 quality thresholds** automaticky—odmítá práci pod quality floors.

---

## MCP servery poskytují tool ekosystém pro automatizaci

MCP (Model Context Protocol) ekosystém rychle dozrál s **17 000+ community serverů** katalogizovaných na mcp.so, plus oficiální servery od Anthropic, GitHub a Google.

### Doporučený stack pro vývoj AI Factory

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${PROJECT_ROOT}"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}" }
    },
    "dbhub": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"]
    }
  }
}
```

| Vrstva | MCP Server | Účel |
|--------|------------|------|
| **Version Control** | GitHub MCP | PRs, issues, CI/CD, analýza kódu |
| **Research** | Firecrawl + Brave Search | Web scraping, analýza konkurence |
| **Databáze** | DBHub | Query PostgreSQL, MySQL, SQLite |
| **Paměť** | Memory MCP | Persistentní knowledge graph |
| **File operace** | Filesystem MCP | Sandboxovaný přístup k souborům projektu |

### Budování vlastních MCP serverů v C#

Pro specializované automatizační potřeby umožňuje oficiální **C# SDK** .NET developerům budovat vlastní servery:

```csharp
using ModelContextProtocol.Server;
using System.ComponentModel;

var builder = Host.CreateEmptyApplicationBuilder(settings: null);
builder.Services
    .AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

await builder.Build().RunAsync();

[McpServerToolType]
public static class PipelineTools
{
    [McpServerTool]
    [Description("Validuje kritéria dokončení fáze")]
    public static string ValidateStage(string stageId, string[] criteria)
    {
        // Custom validační logika
        return $"Fáze {stageId} validována";
    }
}
```

Instalace: `dotnet add package ModelContextProtocol --prerelease`.

---

## Human-in-the-loop checkpointy zabraňují nekontrolované automatizaci

Review bottleneck—agenti produkují rychleji než lidé stihnou kontrolovat—je skutečným limitujícím faktorem v AI Factory systémech.

### Implementuj approval gates v kritických rozhodovacích bodech

Nejefektivnější pattern kombinuje **confidence-based routing** s **explicitními approval workflows**:

```python
def approval_node(state):
    if state.confidence < THRESHOLD or state.action_type in HIGH_RISK_ACTIONS:
        # Pozastav exekuci, notifikuj reviewera
        notify_slack(state.proposed_action, state.reasoning)
        interrupt()  # LangGraph pattern - persistuje stav
    return state

# Obnovení s lidským rozhodnutím
agent.invoke(Command(resume={
    "decisions": [
        {"type": "approve"},
        {"type": "edit", "edited_action": {...}},
        {"type": "reject", "message": "Nepovoleno"}
    ]
}), config=config)
```

### Klíčové rozhodovací body vyžadující lidské review

- **High-impact akce**: Zápisy souborů do produkce, deploymenty, finanční transakce
- **Nejednoznačné vstupy**: Když AI confidence klesne pod threshold
- **Policy-sensitive**: Compliance, bezpečnost, brand-kritický obsah
- **Architektonická rozhodnutí**: Změny databázového schématu, API kontrakty

**Hooks systém Claude Code** přirozeně podporuje toto přes `Stop` hooky, které vyhodnocují dokončení a mohou blokovat postup, plus `Notification` hooky pro Slack/email alerty.

---

## Optimalizace nákladů určuje životaschopnost factory ve velkém měřítku

S **Claude 3.5 Sonnet za $3/$15 na milion tokenů** (vstup/výstup) a **Haiku za $0.25/$1.25** je řízení nákladů zásadní.

### Real-world cost benchmarky

Produkční týmy reportují **$6/developer/den průměrně** (90. percentil pod $12/den), což se překládá na **$100-200/developer/měsíc** se Sonnetem 4.5. Claude Code tým pushuje ~5 releases/inženýra/den při těchto nákladech.

### Kritické optimalizační strategie

**Tiered model selection** směruje jednoduché úkoly na levnější modely:

```python
def select_model(task):
    if task.complexity == "simple":
        return "claude-3-haiku"      # $0.25/M vstup
    elif task.complexity == "medium":
        return "claude-3.5-sonnet"   # $3/M vstup
    else:
        return "claude-4-opus"       # Pouze komplexní reasoning
```

**Prompt caching** poskytuje 90% úsporu na opakovaném kontextu—čtení z cache stojí 0.1x základní ceny. **Batch API** nabízí 50% slevu pro async processing vhodný pro neinteraktivní fáze pipeline.

**Automatizační safeguards** zabraňují nekontrolovaným nákladům:

```yaml
agent_config:
  max_turns: 50
  timeout_minutes: 30
  model_fallback: ["sonnet", "haiku"]
  daily_cost_limit: $50
```

Sleduj náklady s `/cost` v Claude Code sessions a **Anthropic Usage & Cost Admin API** pro monitoring na úrovni organizace.

---

## Produkční architektura spojuje vše dohromady

Doporučená architektura pro senior C# developera budujícího AI Factory:

```
┌────────────────────────────────────────────────────────────┐
│                     ORCHESTRÁTOR                            │
│  (Claude-Flow / Custom .NET aplikace)                      │
│  • Dekompozice úkolů & analýza závislostí                  │
│  • Alokace zdrojů & load balancing                         │
│  • Vynucování quality gate                                 │
└────────────────────────┬───────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ REDIS QUEUE   │ │ STATE STORE   │ │ MEMORY SYSTEM │
│ Task dispatch │ │ SQLite/soubory│ │ Vector search │
└───────────────┘ └───────────────┘ └───────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  WORKER AGENT POOL                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Research │ │Architect│ │ Coder   │ │ Tester  │          │
│  │ Agent   │ │ Agent   │ │ Agent   │ │ Agent   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  (Každý v izolované tmux session + git worktree)           │
└────────────────────────────────────────────────────────────┘
```

### Implementační sekvence

1. **Začni s Claude Squad** pro základní multi-agent management přes tmux
2. **Přidej Claude-Flow** když potřebuješ komplexní orchestraci, paměť a 100+ MCP nástrojů
3. **Implementuj Langfuse** brzy pro observabilitu (kompatibilní s OpenTelemetry)
4. **Postav checkpoint systém** pomocí file-based state před škálováním agentů
5. **Navrhni HITL gates** u architektonických rozhodnutí a deployment fází
6. **Nastav cost guardrails** s max_turns, timeouty a model fallbacky

### Esenciální konfigurační soubory

**CLAUDE.md** pro projektový kontext (drž pod 300 řádky):

```markdown
# Projekt: AI Factory Pipeline

## Příkazy
- `npm run build` - Produkční build
- `npm run test` - Spusť test suite

## Architektura
- Orchestrátor: .NET 8 v `/orchestrator`
- Agenti: Claude Code s hooky v `.claude/`
- Stav: SQLite v `.state/`

## Zakázané zóny
- NEMODIFIKUJ soubory v /orchestrator/Core/
- NESAHEJ na migrační soubory
```

---

## Kombinace s Codex CLI od OpenAI

Claude Code a Codex CLI od OpenAI jsou velmi podobné nástroje a lze je efektivně kombinovat v rámci AI Factory. Oba podporují MCP, headless mode, git worktrees a podobnou architekturu.

### Srovnání klíčových funkcí

| Funkce | Claude Code | Codex CLI |
|--------|-------------|-----------|
| **Headless mode** | `claude -p` | `codex exec` |
| **MCP podpora** | ✅ Ano | ✅ Ano |
| **Konfigurační soubor** | `CLAUDE.md` | `AGENTS.md` |
| **Git worktrees** | ✅ Podporuje | ✅ Podporuje |
| **Skills/Agents** | `.claude/agents/` | `.codex/skills/` |
| **Web search** | ✅ Ano | ✅ Ano (opt-in) |

### Claude Squad - Jednotná správa obou agentů

**Claude Squad** přímo podporuje Claude Code, Codex, Aider a další agenty v jednom rozhraní:

```bash
# Instalace
brew install claude-squad

# Spuštění s Claude Code (default)
cs

# Spuštění s Codex CLI
export OPENAI_API_KEY=<your_key>
cs -p "codex"

# Paralelní běh obou - každý v izolovaném worktree
# Session 1: Claude na feature/auth
# Session 2: Codex na feature/api
```

### Strategická kombinace - Různé modely pro různé úkoly

| Fáze/Úkol | Doporučený agent | Důvod |
|-----------|------------------|-------|
| **Research** | Codex | GPT-5-Codex má silný web search |
| **Architektura** | Claude Code | Lepší dlouhodobé plánování |
| **Kódování C#/.NET** | Claude Code | Silnější znalost .NET ekosystému |
| **Code Review** | Codex | GPT-5-Codex optimalizován pro review |
| **Refaktoring** | Codex | Testováno na large-scale refactors |
| **Debugging** | Claude Code | Lepší reasoning |

### Hybridní pipeline architektura

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID AI FACTORY                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ CODEX   │───▶│ CLAUDE  │───▶│ CLAUDE  │───▶│ CODEX   │     │
│  │Research │    │Architect│    │ Coder   │    │ Review  │     │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│  GPT-5-Codex    Claude 4      Claude 4      GPT-5-Codex       │
│  web search     planning      .NET expert   code review        │
└─────────────────────────────────────────────────────────────────┘
```

### MCP jako společný jazyk

Oba nástroje mohou sdílet MCP servery. Codex CLI lze dokonce spustit jako MCP server:

```bash
# Codex jako MCP server
codex mcp-server
```

```json
// V Claude Code settings - Codex jako nástroj
{
  "mcpServers": {
    "codex": {
      "command": "npx",
      "args": ["-y", "codex", "mcp-server"]
    }
  }
}
```

### Hybridní orchestrátor v C#

```csharp
public enum AgentType { Claude, Codex }

public class HybridOrchestrator
{
    private readonly Dictionary<PipelineStage, AgentType> _stageAgents = new()
    {
        [PipelineStage.Research] = AgentType.Codex,      // Web search
        [PipelineStage.Architecture] = AgentType.Claude, // Planning
        [PipelineStage.Coding] = AgentType.Claude,       // .NET expert
        [PipelineStage.Testing] = AgentType.Claude,      // Debugging
        [PipelineStage.Review] = AgentType.Codex         // Code review
    };

    public async Task<AgentResult> ExecuteStageAsync(PipelineTask task, CancellationToken ct)
    {
        var agentType = _stageAgents[task.Stage];

        return agentType switch
        {
            AgentType.Claude => await ExecuteClaudeAsync(task, ct),
            AgentType.Codex => await ExecuteCodexAsync(task, ct),
            _ => throw new ArgumentException($"Unknown agent: {agentType}")
        };
    }

    private async Task<AgentResult> ExecuteClaudeAsync(PipelineTask task, CancellationToken ct)
    {
        var args = $"-p \"{task.Prompt}\" --output-format stream-json --permission-mode bypassPermissions";
        return await RunProcessAsync("claude", args, task.WorkingDirectory, ct);
    }

    private async Task<AgentResult> ExecuteCodexAsync(PipelineTask task, CancellationToken ct)
    {
        // Codex používá 'exec' pro headless mode
        var args = $"exec \"{task.Prompt}\" --json --approval-policy never --sandbox workspace-write";
        return await RunProcessAsync("codex", args, task.WorkingDirectory, ct);
    }
}
```

### A/B Testing agentů

Pro optimalizaci pipeline můžeš spustit stejný úkol oběma agenty a porovnat:

```csharp
public async Task<BenchmarkResult> CompareAgentsAsync(string prompt, string workDir)
{
    // Izolované worktrees pro každého agenta
    var claudeDir = await CreateWorktreeAsync(workDir, "benchmark-claude");
    var codexDir = await CreateWorktreeAsync(workDir, "benchmark-codex");

    // Paralelní spuštění
    var claudeTask = ExecuteClaudeAsync(prompt, claudeDir);
    var codexTask = ExecuteCodexAsync(prompt, codexDir);

    await Task.WhenAll(claudeTask, codexTask);

    // Porovnej: čas, cena, kvalita kódu, testy
    return new BenchmarkResult(await claudeTask, await codexTask);
}
```

### Doporučená sekvence adopce

```
Týden 1-2: Používej oba nástroje odděleně
    └── Claude: komplexní .NET úkoly, architektura
    └── Codex: research, code review, refaktoring

Týden 3-4: Claude Squad pro paralelní práci
    └── Různé úkoly různým agentům současně
    └── Porovnávej výstupy v diff view

Týden 5+: Hybridní automatizovaná pipeline
    └── Automatický výběr agenta podle fáze
    └── Sdílené MCP nástroje
    └── A/B testing pro optimalizaci
```

---

## Implementace .NET orchestrátoru pro AI Factory

Pro C# developery je přirozenou volbou implementovat orchestrátor jako .NET aplikaci. Claude Code CLI podporuje headless mode s JSON výstupem, což umožňuje plnou programovou kontrolu z libovolného jazyka.

### Architektura .NET orchestrátoru

```
┌─────────────────────────────────────────────────────────────────┐
│                    .NET 8 ORCHESTRATOR                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PipelineOrch │  │ AgentPool    │  │ StateManager │          │
│  │  estrator    │──│  (Parallel)  │──│  (File/Redis)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Channel<T>   │  │ Process.Start│  │ JSON Files   │          │
│  │ Task Queue   │  │ claude -p    │  │ + Locking    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Git Worktree│    │ Git Worktree│    │ Git Worktree│
   │ + tmux      │    │ + tmux      │    │ + tmux      │
   │ Agent 1     │    │ Agent 2     │    │ Agent N     │
   └─────────────┘    └─────────────┘    └─────────────┘
```

### Základní wrapper pro Claude Code CLI

Klíčem je správné volání `claude -p` (print/pipe mode) s JSON výstupem:

```csharp
public class ClaudeCodeAgent : IAsyncDisposable
{
    private readonly string _workingDirectory;
    private readonly string _agentRole;
    private readonly string[] _allowedTools;
    private string? _sessionId;

    public ClaudeCodeAgent(string workingDirectory, string agentRole, string[] allowedTools)
    {
        _workingDirectory = workingDirectory;
        _agentRole = agentRole;
        _allowedTools = allowedTools;
    }

    public async Task<ClaudeResponse> ExecuteAsync(string prompt, CancellationToken ct = default)
    {
        var args = BuildArguments(prompt);

        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "claude",
                Arguments = args,
                WorkingDirectory = _workingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                Environment = { ["CLAUDE_CODE_ENTRYPOINT"] = "orchestrator" }
            }
        };

        var output = new List<string>();
        process.OutputDataReceived += (_, e) => { if (e.Data != null) output.Add(e.Data); };

        process.Start();
        process.BeginOutputReadLine();
        await process.WaitForExitAsync(ct);

        // Parse streaming JSON - poslední "result" message obsahuje výsledek
        ClaudeResponse? lastResponse = null;
        foreach (var line in output.Where(l => !string.IsNullOrWhiteSpace(l)))
        {
            try
            {
                var response = JsonSerializer.Deserialize<ClaudeResponse>(line);
                if (response?.Type == "result")
                {
                    lastResponse = response;
                    _sessionId = response.SessionId; // Pro multi-turn conversations
                }
            }
            catch (JsonException) { /* Skip non-JSON lines */ }
        }

        return lastResponse ?? throw new InvalidOperationException("No result from Claude");
    }

    private string BuildArguments(string prompt)
    {
        var args = new List<string>
        {
            "-p", $"\"{EscapePrompt(prompt)}\"",
            "--output-format", "stream-json",
            "--permission-mode", "bypassPermissions"
        };

        if (_allowedTools.Length > 0)
        {
            args.Add("--allowedTools");
            args.Add(string.Join(",", _allowedTools));
        }

        // Pokračuj v existující session
        if (_sessionId != null)
        {
            args.Add("--resume");
            args.Add(_sessionId);
        }

        // Přidej system prompt s rolí
        args.Add("--append-system-prompt");
        args.Add($"\"Jsi {_agentRole} agent. Zaměř se pouze na svůj specializovaný úkol.\"");

        return string.Join(" ", args);
    }

    private static string EscapePrompt(string prompt) =>
        prompt.Replace("\"", "\\\"").Replace("\n", "\\n");

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}

public record ClaudeResponse
{
    [JsonPropertyName("type")] public string Type { get; init; } = "";
    [JsonPropertyName("session_id")] public string? SessionId { get; init; }
    [JsonPropertyName("result")] public string? Result { get; init; }
    [JsonPropertyName("cost_usd")] public decimal? CostUsd { get; init; }
    [JsonPropertyName("duration_ms")] public long? DurationMs { get; init; }
}
```

### Konfigurace specializovaných agentů

Každá fáze pipeline má vlastní konfiguraci s rolí, povolenými nástroji a prompt šablonou:

```csharp
public enum PipelineStage { Research, Architecture, Coding, Testing, Review }

public record AgentConfig(string Role, string[] Tools, string PromptTemplate);

private readonly Dictionary<PipelineStage, AgentConfig> _agentConfigs = new()
{
    [PipelineStage.Research] = new(
        Role: "Research Analyst",
        Tools: ["Read", "Grep", "Glob", "WebSearch"],
        PromptTemplate: """
            Analyzuj následující projektový nápad:
            1. Analýza trhu a konkurence
            2. Technická proveditelnost
            3. Klíčová rizika
            4. Doporučený tech stack

            Projekt: {description}
            Výstup ve strukturovaném markdown.
            """
    ),

    [PipelineStage.Architecture] = new(
        Role: "Software Architect",
        Tools: ["Read", "Write", "Grep", "Glob"],
        PromptTemplate: """
            Na základě research findings vytvoř technickou architekturu:
            1. Diagram komponent (mermaid)
            2. API specifikace
            3. Databázové schéma
            4. Struktura souborů/složek

            Research kontext: {context}
            Projekt: {description}
            """
    ),

    [PipelineStage.Coding] = new(
        Role: "Senior Developer",
        Tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
        PromptTemplate: """
            Implementuj architekturu. Pravidla:
            - Čistý, testovatelný kód
            - SOLID principy
            - XML dokumentace
            - Unit test stuby

            Architektura: {context}
            Projekt: {description}
            """
    ),

    [PipelineStage.Testing] = new(
        Role: "QA Engineer",
        Tools: ["Read", "Write", "Edit", "Bash", "Grep"],
        PromptTemplate: """
            Review a testování implementace:
            1. Spusť existující testy
            2. Doplň chybějící test coverage
            3. Zkontroluj bezpečnostní problémy
            4. Validuj proti architektuře

            Reportuj nalezené problémy.
            """
    ),

    [PipelineStage.Review] = new(
        Role: "Code Reviewer",
        Tools: ["Read", "Grep", "Glob"],
        PromptTemplate: """
            Finální review checklist:
            - [ ] Kvalita kódu a standardy
            - [ ] Adekvátní test coverage
            - [ ] Kompletní dokumentace
            - [ ] Žádné bezpečnostní zranitelnosti
            - [ ] Soulad s architekturou

            Vrať APPROVE nebo NEEDS_WORK se specifickým feedbackem.
            """
    )
};
```

### Pipeline orchestrátor s Channel<T>

Využij `System.Threading.Channels` pro asynchronní task queue:

```csharp
public class PipelineOrchestrator
{
    private readonly string _baseDirectory;
    private readonly Channel<PipelineTask> _taskQueue;
    private readonly Dictionary<PipelineStage, AgentConfig> _agentConfigs;

    public PipelineOrchestrator(string baseDirectory)
    {
        _baseDirectory = baseDirectory;
        _taskQueue = Channel.CreateUnbounded<PipelineTask>();
        _agentConfigs = InitializeAgentConfigs();
    }

    public async Task<PipelineTask> SubmitTaskAsync(string projectName, string description)
    {
        var task = new PipelineTask
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            ProjectName = projectName,
            Description = description,
            Stage = PipelineStage.Research
        };

        // Vytvoř projektový adresář
        var projectDir = Path.Combine(_baseDirectory, $"projects/{task.Id}");
        Directory.CreateDirectory(projectDir);

        await File.WriteAllTextAsync(
            Path.Combine(projectDir, "TASK.md"),
            $"# {projectName}\n\n{description}\n\nVytvořeno: {DateTime.UtcNow:O}"
        );

        await _taskQueue.Writer.WriteAsync(task);
        return task;
    }

    public async Task ProcessPipelineAsync(CancellationToken ct = default)
    {
        await foreach (var task in _taskQueue.Reader.ReadAllAsync(ct))
        {
            Console.WriteLine($"[{task.Id}] Zpracovávám fázi: {task.Stage}");

            try
            {
                var result = await ExecuteStageAsync(task, ct);

                // Ulož výstup a aktualizuj cost
                task.Outputs.Add(result.Result ?? "");
                task.TotalCost += result.CostUsd ?? 0;
                task.Context[$"{task.Stage}Output"] = result.Result ?? "";

                // Quality gate check
                if (await ShouldAdvanceAsync(task, result))
                {
                    if (task.Stage == PipelineStage.Review)
                    {
                        Console.WriteLine($"[{task.Id}] ✅ Pipeline dokončena! Celkové náklady: ${task.TotalCost:F4}");
                        await NotifyCompletionAsync(task);
                    }
                    else
                    {
                        // Posuň do další fáze
                        task = task with { Stage = task.Stage + 1 };
                        await _taskQueue.Writer.WriteAsync(task, ct);
                    }
                }
                else
                {
                    Console.WriteLine($"[{task.Id}] ⏸️ Čekám na lidské review v {task.Stage}");
                    await RequestHumanReviewAsync(task);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{task.Id}] ❌ Chyba: {ex.Message}");
                await HandleErrorAsync(task, ex);
            }
        }
    }

    private async Task<ClaudeResponse> ExecuteStageAsync(PipelineTask task, CancellationToken ct)
    {
        var config = _agentConfigs[task.Stage];
        var projectDir = Path.Combine(_baseDirectory, $"projects/{task.Id}");

        await using var agent = new ClaudeCodeAgent(projectDir, config.Role, config.Tools);

        var prompt = config.PromptTemplate
            .Replace("{description}", task.Description)
            .Replace("{context}", string.Join("\n\n", task.Outputs.TakeLast(2)));

        return await agent.ExecuteAsync(prompt, ct);
    }

    private Task<bool> ShouldAdvanceAsync(PipelineTask task, ClaudeResponse response)
    {
        // Automatický postup pro Research a Architecture
        if (task.Stage is PipelineStage.Research or PipelineStage.Architecture)
            return Task.FromResult(true);

        // Pro Coding a Testing - kontrola jestli testy prošly
        if (task.Stage is PipelineStage.Coding or PipelineStage.Testing)
        {
            var passed = response.Result?.Contains("All tests passed") == true ||
                        response.Result?.Contains("BUILD SUCCEEDED") == true;
            return Task.FromResult(passed);
        }

        // Pro Review - vyžaduj explicitní APPROVE
        if (task.Stage == PipelineStage.Review)
            return Task.FromResult(response.Result?.Contains("APPROVE") == true);

        return Task.FromResult(false);
    }
}

public record PipelineTask
{
    public required string Id { get; init; }
    public required string ProjectName { get; init; }
    public required string Description { get; init; }
    public PipelineStage Stage { get; init; }
    public string? SessionId { get; set; }
    public Dictionary<string, string> Context { get; init; } = new();
    public List<string> Outputs { get; init; } = new();
    public decimal TotalCost { get; set; }
}
```

### Paralelní agent pool s git worktrees

Pro skutečnou paralelizaci využij git worktrees a tmux:

```csharp
public class ParallelAgentPool : IAsyncDisposable
{
    private readonly int _maxAgents;
    private readonly SemaphoreSlim _semaphore;
    private readonly ConcurrentDictionary<string, AgentProcess> _activeAgents = new();
    private readonly string _baseWorkDir;

    public ParallelAgentPool(int maxAgents, string baseWorkDir)
    {
        _maxAgents = maxAgents;
        _semaphore = new SemaphoreSlim(maxAgents, maxAgents);
        _baseWorkDir = baseWorkDir;
    }

    public async Task<AgentResult> RunAgentAsync(
        string taskId, string branchName, string prompt,
        string[] allowedTools, CancellationToken ct = default)
    {
        await _semaphore.WaitAsync(ct);

        try
        {
            // Vytvoř izolovaný worktree
            var worktreeDir = await CreateWorktreeAsync(taskId, branchName, ct);

            // Spusť Claude Code v tmux session
            var sessionName = $"agent-{taskId}";
            var agentProcess = new AgentProcess(sessionName, worktreeDir);
            _activeAgents[taskId] = agentProcess;

            try
            {
                return await agentProcess.ExecuteAsync(prompt, allowedTools, ct);
            }
            finally
            {
                _activeAgents.TryRemove(taskId, out _);
            }
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<AgentResult[]> RunParallelAsync(
        IEnumerable<AgentTask> tasks, CancellationToken ct = default)
    {
        var taskList = tasks.ToList();
        var results = new AgentResult[taskList.Count];

        await Parallel.ForEachAsync(
            taskList.Select((task, index) => (task, index)),
            new ParallelOptions { MaxDegreeOfParallelism = _maxAgents, CancellationToken = ct },
            async (item, token) =>
            {
                results[item.index] = await RunAgentAsync(
                    item.task.TaskId, item.task.BranchName,
                    item.task.Prompt, item.task.AllowedTools, token);
            });

        return results;
    }

    private async Task<string> CreateWorktreeAsync(string taskId, string branchName, CancellationToken ct)
    {
        var worktreeDir = Path.Combine(_baseWorkDir, "worktrees", taskId);

        var psi = new ProcessStartInfo
        {
            FileName = "git",
            Arguments = $"worktree add \"{worktreeDir}\" -b {branchName}",
            WorkingDirectory = _baseWorkDir,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        using var process = Process.Start(psi)!;
        await process.WaitForExitAsync(ct);

        return worktreeDir;
    }

    public async ValueTask DisposeAsync()
    {
        foreach (var agent in _activeAgents.Values)
            await agent.DisposeAsync();

        // Cleanup worktrees
        using var process = Process.Start(new ProcessStartInfo
        {
            FileName = "git",
            Arguments = "worktree prune",
            WorkingDirectory = _baseWorkDir,
            UseShellExecute = false
        });
        await process!.WaitForExitAsync();

        _semaphore.Dispose();
    }
}

public record AgentTask(string TaskId, string BranchName, string Prompt, string[] AllowedTools);
public record AgentResult(string TaskId, bool Success, string? Output, string? Error, decimal CostUsd, TimeSpan Duration);
```

### File-based state management s lockingem

Pro koordinaci mezi agenty využij atomické file operace:

```csharp
public class PipelineState
{
    private readonly string _stateDir;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public PipelineState(string baseDir)
    {
        _stateDir = Path.Combine(baseDir, ".state");
        Directory.CreateDirectory(_stateDir);
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default) where T : class
    {
        var filePath = GetFilePath(key);
        if (!File.Exists(filePath)) return null;

        await _lock.WaitAsync(ct);
        try
        {
            var json = await File.ReadAllTextAsync(filePath, ct);
            return JsonSerializer.Deserialize<T>(json);
        }
        finally { _lock.Release(); }
    }

    public async Task SetAsync<T>(string key, T value, CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var filePath = GetFilePath(key);
            var json = JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, json, ct);
        }
        finally { _lock.Release(); }
    }

    public async Task<bool> TryAcquireLockAsync(string resource, string owner, TimeSpan timeout, CancellationToken ct)
    {
        var lockFile = Path.Combine(_stateDir, "locks", $"{resource}.lock");
        Directory.CreateDirectory(Path.GetDirectoryName(lockFile)!);

        var lockInfo = new LockInfo(owner, DateTime.UtcNow.Add(timeout));

        try
        {
            // Atomic file creation - selže pokud existuje
            await using var fs = new FileStream(lockFile, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await JsonSerializer.SerializeAsync(fs, lockInfo, cancellationToken: ct);
            return true;
        }
        catch (IOException)
        {
            // Lock existuje - zkontroluj expiraci
            if (await IsLockExpiredAsync(lockFile, ct))
            {
                File.Delete(lockFile);
                return await TryAcquireLockAsync(resource, owner, timeout, ct);
            }
            return false;
        }
    }

    public Task ReleaseLockAsync(string resource)
    {
        var lockFile = Path.Combine(_stateDir, "locks", $"{resource}.lock");
        if (File.Exists(lockFile)) File.Delete(lockFile);
        return Task.CompletedTask;
    }

    private string GetFilePath(string key) => Path.Combine(_stateDir, $"{key.Replace(':', '_')}.json");
    private record LockInfo(string Owner, DateTime ExpiresAt);
}
```

### Worker Document pro předávání kontextu

Strukturovaný dokument cestující s úkolem mezi fázemi:

```csharp
public record WorkerDocument
{
    public required string TaskId { get; init; }
    public required string ProjectName { get; init; }
    public required PipelineStage CurrentStage { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Dictionary<PipelineStage, StageOutput> StageOutputs { get; init; } = new();
    public List<QualityGateResult> QualityGates { get; init; } = new();
    public List<HumanFeedback> HumanFeedback { get; init; } = new();

    public decimal TotalCostUsd => StageOutputs.Values.Sum(x => x.CostUsd);
    public TimeSpan TotalDuration => TimeSpan.FromMilliseconds(
        StageOutputs.Values.Sum(x => x.DurationMs));
}

public record StageOutput(
    string Result, List<string> GeneratedFiles,
    decimal CostUsd, long DurationMs, DateTime CompletedAt);

public record QualityGateResult(
    PipelineStage Stage, bool Passed,
    string[] FailureReasons, DateTime CheckedAt);

public record HumanFeedback(
    PipelineStage Stage, string Reviewer,
    string Decision, string? Comment, DateTime ProvidedAt);
```

### Praktický příklad použití

```csharp
public static class Program
{
    public static async Task Main(string[] args)
    {
        var baseDir = Environment.GetEnvironmentVariable("FACTORY_BASE") ?? "/tmp/ai-factory";
        var orchestrator = new PipelineOrchestrator(baseDir);

        // Spusť pipeline processor na pozadí
        var cts = new CancellationTokenSource();
        var processingTask = orchestrator.ProcessPipelineAsync(cts.Token);

        // Submit projekt
        var task = await orchestrator.SubmitTaskAsync(
            projectName: "Invoice Parser API",
            description: """
                Vytvoř REST API v C# (.NET 8):
                - Upload PDF faktur
                - Extrakce klíčových polí (dodavatel, částka, datum, položky)
                - Ukládání do SQLite
                - Search/filter endpointy

                Použij Clean Architecture s CQRS patternem.
                """
        );

        Console.WriteLine($"Úkol odeslán: {task.Id}");
        Console.WriteLine("Ctrl+C pro ukončení...");

        Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };

        try { await processingTask; }
        catch (OperationCanceledException) { Console.WriteLine("Ukončuji..."); }
    }
}
```

### Paralelní zpracování více částí projektu

```csharp
public static async Task RunParallelExample()
{
    var baseDir = "/tmp/ai-factory";
    await using var pool = new ParallelAgentPool(maxAgents: 4, baseDir);
    var state = new PipelineState(baseDir);

    // Definuj paralelní úkoly
    var tasks = new[]
    {
        new AgentTask("api-endpoints", "feature/api",
            "Implementuj REST API endpointy pro CRUD operace s fakturami",
            new[] { "Read", "Write", "Edit", "Bash" }),

        new AgentTask("db-schema", "feature/database",
            "Vytvoř Entity Framework migrace pro ukládání faktur",
            new[] { "Read", "Write", "Bash" }),

        new AgentTask("pdf-parser", "feature/parser",
            "Implementuj parsing PDF faktur pomocí iText7",
            new[] { "Read", "Write", "Edit", "Bash" }),

        new AgentTask("unit-tests", "feature/tests",
            "Napiš xUnit testy pro service layer",
            new[] { "Read", "Write", "Bash" })
    };

    Console.WriteLine($"Spouštím {tasks.Length} paralelních agentů...");

    var results = await pool.RunParallelAsync(tasks);

    foreach (var result in results)
    {
        Console.WriteLine($"[{result.TaskId}] {(result.Success ? "✅" : "❌")} " +
                        $"Náklady: ${result.CostUsd:F4}, Trvání: {result.Duration.TotalSeconds:F1}s");
        await state.SetAsync($"result:{result.TaskId}", result);
    }

    if (results.All(r => r.Success))
        Console.WriteLine("\n🔀 Všichni agenti uspěli, připraveno k merge...");
}
```

### Rozšíření a integrace

**Notifikace přes Slack/Teams:**

```csharp
private async Task NotifyCompletionAsync(PipelineTask task)
{
    var webhook = Environment.GetEnvironmentVariable("SLACK_WEBHOOK");
    if (string.IsNullOrEmpty(webhook)) return;

    using var client = new HttpClient();
    await client.PostAsJsonAsync(webhook, new
    {
        text = $"✅ Projekt *{task.ProjectName}* dokončen!\nNáklady: ${task.TotalCost:F4}",
        channel = "#ai-factory"
    });
}
```

**Integrace s Azure DevOps:**

```csharp
// Automatické vytvoření work items pro review
private async Task RequestHumanReviewAsync(PipelineTask task)
{
    var client = new WorkItemTrackingHttpClient(/* ... */);

    var patchDocument = new JsonPatchDocument
    {
        new JsonPatchOperation { Op = Operation.Add, Path = "/fields/System.Title",
            Value = $"Review: {task.ProjectName} - {task.Stage}" },
        new JsonPatchOperation { Op = Operation.Add, Path = "/fields/System.Description",
            Value = task.Context[$"{task.Stage}Output"] }
    };

    await client.CreateWorkItemAsync(patchDocument, "AI-Factory", "Task");
}
```

**Blazor dashboard pro monitoring:**

```csharp
// Jednoduchý endpoint pro status
app.MapGet("/api/tasks", async (PipelineState state) =>
{
    var tasks = await state.GetAllAsync<WorkerDocument>("task:*");
    return Results.Ok(tasks.Select(t => new
    {
        t.TaskId, t.ProjectName, t.CurrentStage,
        t.TotalCostUsd, Progress = GetProgress(t)
    }));
});
```

---

## Závěr

Budování AI Factory s Claude Code je dnes dosažitelné pomocí prověřených patternů. Technologický stack—**nativní subagenti** pro session paralelizaci, **tmux + git worktrees** pro process izolaci, **Claude-Flow** pro enterprise orchestraci, **MCP servery** pro tooling, a **file-based state management** pro koordinaci pipeline—významně dozrál.

Pro .NET developery je navíc k dispozici přímá cesta: **Claude Code CLI** v headless mode (`claude -p`) s JSON výstupem umožňuje plnou programovou kontrolu z C# aplikace. Kombinace `Process.Start`, `Channel<T>` pro task queue, a `SemaphoreSlim` pro rate limiting poskytuje solidní základ pro produkční orchestrátor. Oficiální **C# MCP SDK** pak umožňuje rozšíření o vlastní nástroje specifické pro tvůj stack (Azure DevOps, MS SQL, interní systémy).

**Hybridní přístup** kombinující Claude Code s Codex CLI od OpenAI přináší další výhody: různé modely excelují v různých úkolech. Claude je silnější v architektuře a .NET kódování, zatímco Codex vyniká v code review a refaktoringu. **Claude Squad** poskytuje hotovou infrastrukturu pro paralelní běh obou agentů, a **MCP** slouží jako společný protokol pro sdílení nástrojů mezi nimi.

Klíčový poznatek zůstává: **review throughput, ne schopnost agentů, je bottleneck**. Začni s 2-3 specializovanými agenty, implementuj robustní quality gates mezi fázemi pipeline, postav komplexní observabilitu od prvního dne, a škáluj podle kapacity tvého týmu kontrolovat a schvalovat výstup agentů.

---

## Okamžité další kroky

### Pro rychlý start (Node.js ekosystém)

1. Nainstaluj Claude-Flow: `npx claude-flow@alpha init`
2. Nakonfiguruj MCP server stack v `.mcp.json`
3. Definuj specializované agenty v `.claude/agents/`
4. Implementuj Stop hooky pro quality gates

### Pro hybridní přístup (Claude + Codex)

1. **Nainstaluj Claude Squad:**
   ```bash
   brew install claude-squad
   ```

2. **Nastav API klíče:**
   ```bash
   export ANTHROPIC_API_KEY=<claude_key>
   export OPENAI_API_KEY=<openai_key>
   ```

3. **Experimentuj s oběma agenty:**
   ```bash
   cs                    # Claude Code session
   cs -p "codex"         # Codex session
   ```

4. **Porovnej výstupy** na stejném úkolu a identifikuj, který agent je lepší pro jaký typ práce

### Pro .NET implementaci

1. **Vytvoř nový projekt:**
   ```bash
   dotnet new console -n ClaudeOrchestrator
   cd ClaudeOrchestrator
   ```

2. **Ověř Claude Code CLI:**
   ```bash
   claude --version
   claude -p "test" --output-format json
   ```

3. **Přidej základní wrapper** (viz sekce .NET orchestrátor výše)

4. **Nastav git worktrees pro paralelizaci:**
   ```bash
   git init
   mkdir worktrees
   ```

5. **Implementuj první pipeline:**
   - Začni s 2 fázemi (Research → Coding)
   - Přidej quality gates postupně
   - Měř náklady pomocí `CostUsd` z response

6. **Rozšiř o MCP servery v C#:**
   ```bash
   dotnet add package ModelContextProtocol --prerelease
   ```

### Doporučená sekvence učení

```
1. Týden 1-2: Manuální Claude Code CLI
   └── Nauč se flagy: -p, --output-format, --allowedTools, --resume

2. Týden 3-4: Jednoduchý .NET wrapper
   └── Process.Start + JSON parsing
   └── Sekvenční pipeline (Research → Coding)

3. Týden 5-6: Paralelizace
   └── Git worktrees + tmux
   └── SemaphoreSlim pro rate limiting

4. Týden 7-8: State management
   └── File-based state s lockingem
   └── Worker documents

5. Měsíc 2+: Produkční rozšíření
   └── Azure DevOps integrace
   └── Blazor dashboard
   └── Custom MCP servery
```

## Klíčové zdroje

### Oficiální dokumentace
- **Claude Code docs**: code.claude.com/docs
- **Claude Code CLI reference**: code.claude.com/docs/cli
- **Codex CLI docs**: developers.openai.com/codex/cli
- **MCP specifikace**: modelcontextprotocol.io

### Orchestrační nástroje
- **Claude-Flow**: github.com/ruvnet/claude-flow (11k ⭐)
- **Claude Squad**: github.com/smtg-ai/claude-squad (5.1k ⭐) - podporuje Claude, Codex, Aider
- **Codex CLI**: github.com/openai/codex

### .NET specifické
- **C# MCP SDK**: github.com/modelcontextprotocol/csharp-sdk
- **MCP katalog**: mcp.so (17k+ serverů)

### Observabilita
- **Langfuse**: langfuse.com (OpenTelemetry kompatibilní)
- **Anthropic Usage API**: docs.anthropic.com/en/api/admin-api
