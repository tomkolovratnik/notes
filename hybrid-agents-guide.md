# Kombinace Claude Code a Codex CLI v AI Factory

## Přehled kompatibility

Oba nástroje jsou velmi podobné a sdílejí klíčové koncepty:

| Funkce | Claude Code | Codex CLI |
|--------|-------------|-----------|
| **Headless mode** | `claude -p` | `codex exec` |
| **MCP podpora** | ✅ Ano | ✅ Ano |
| **Konfigurační soubor** | `CLAUDE.md` | `AGENTS.md` |
| **Git worktrees** | ✅ Podporuje | ✅ Podporuje |
| **Skills/Agents** | `.claude/agents/` | `.codex/skills/` |
| **Hooks** | ✅ Ano | ✅ Ano |
| **Web search** | ✅ Ano | ✅ Ano (opt-in) |
| **Sandbox** | ✅ Ano | ✅ Ano |

---

## 1. Claude Squad - Nejjednodušší cesta

Claude Squad přímo podporuje oba agenty v jednom rozhraní:

```bash
# Instalace
brew install claude-squad

# Spuštění s Claude Code (default)
cs

# Spuštění s Codex CLI
export OPENAI_API_KEY=<your_key>
cs -p "codex"

# Nebo nastavení v configu (~/.config/claude-squad/config.toml)
# default_program = "codex"
```

### Paralelní běh obou agentů

```bash
# Session 1: Claude Code na feature/auth
cs  # vytvoří novou session s Claude

# Session 2: Codex na feature/api (v jiném terminálu nebo pomocí 'n')
cs -p "codex"
```

Každý agent běží v izolovaném git worktree, takže můžeš porovnat jejich přístupy.

---

## 2. Strategická kombinace - Různé modely pro různé úkoly

### Kdy použít který nástroj

| Fáze/Úkol | Doporučený agent | Důvod |
|-----------|------------------|-------|
| **Research** | Codex | GPT-5-Codex má web search, dobrý na analýzu |
| **Architektura** | Claude Code | Silnější v dlouhodobém plánování |
| **Kódování C#/.NET** | Claude Code | Lepší znalost .NET ekosystému |
| **Code Review** | Codex | GPT-5-Codex optimalizován pro review |
| **Refaktoring** | Codex | Testováno na large-scale refactors |
| **Debugging** | Claude Code | Lepší reasoning |
| **Dokumentace** | Oba | Srovnatelné |

### Příklad hybridní pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID AI FACTORY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ CODEX   │───▶│ CLAUDE  │───▶│ CLAUDE  │───▶│ CODEX   │     │
│  │Research │    │Architect│    │ Coder   │    │ Review  │     │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│                                                                 │
│  GPT-5-Codex    Claude 4      Claude 4      GPT-5-Codex       │
│  web search     planning      .NET expert   code review        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. MCP jako společný jazyk

Oba nástroje podporují MCP, takže mohou sdílet nástroje:

### Sdílená MCP konfigurace

```toml
# ~/.codex/config.toml (Codex)
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]

[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
```

```json
// ~/.claude/settings.json (Claude Code)
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    }
  }
}
```

### Codex jako MCP server pro Claude

Codex CLI lze spustit jako MCP server a volat ho z jiného agenta:

```bash
# Spusť Codex jako MCP server
codex mcp-server
```

```json
// V Claude Code settings - přidej Codex jako nástroj
{
  "mcpServers": {
    "codex": {
      "command": "npx",
      "args": ["-y", "codex", "mcp-server"]
    }
  }
}
```

---

## 4. .NET Orchestrátor pro hybridní pipeline

```csharp
public enum AgentType { Claude, Codex }

public record AgentConfig(
    AgentType Type,
    string Role,
    string[] Tools,
    string PromptTemplate);

public class HybridOrchestrator
{
    private readonly Dictionary<PipelineStage, AgentConfig> _stageConfigs = new()
    {
        // Codex pro research (web search, analýza)
        [PipelineStage.Research] = new(
            Type: AgentType.Codex,
            Role: "Research Analyst",
            Tools: ["web_search", "read", "grep"],
            PromptTemplate: "Proveď market research pro: {description}"
        ),

        // Claude pro architekturu (lepší planning)
        [PipelineStage.Architecture] = new(
            Type: AgentType.Claude,
            Role: "Software Architect",
            Tools: ["Read", "Write", "Grep", "Glob"],
            PromptTemplate: "Navrhni architekturu na základě: {context}"
        ),

        // Claude pro C# kódování
        [PipelineStage.Coding] = new(
            Type: AgentType.Claude,
            Role: "Senior .NET Developer",
            Tools: ["Read", "Write", "Edit", "Bash"],
            PromptTemplate: "Implementuj podle architektury: {context}"
        ),

        // Codex pro code review (optimalizovaný model)
        [PipelineStage.Review] = new(
            Type: AgentType.Codex,
            Role: "Code Reviewer",
            Tools: ["read", "grep", "glob"],
            PromptTemplate: "Proveď code review, zaměř se na: security, performance, maintainability"
        )
    };

    public async Task<AgentResult> ExecuteStageAsync(PipelineTask task, CancellationToken ct)
    {
        var config = _stageConfigs[task.Stage];

        return config.Type switch
        {
            AgentType.Claude => await ExecuteClaudeAsync(task, config, ct),
            AgentType.Codex => await ExecuteCodexAsync(task, config, ct),
            _ => throw new ArgumentException($"Unknown agent type: {config.Type}")
        };
    }

    private async Task<AgentResult> ExecuteClaudeAsync(
        PipelineTask task, AgentConfig config, CancellationToken ct)
    {
        var args = new List<string>
        {
            "-p", $"\"{EscapePrompt(config.PromptTemplate)}\"",
            "--output-format", "stream-json",
            "--permission-mode", "bypassPermissions",
            "--allowedTools", string.Join(",", config.Tools)
        };

        return await RunProcessAsync("claude", args, task.WorkingDirectory, ct);
    }

    private async Task<AgentResult> ExecuteCodexAsync(
        PipelineTask task, AgentConfig config, CancellationToken ct)
    {
        // Codex používá 'exec' pro headless mode
        var args = new List<string>
        {
            "exec",
            $"\"{EscapePrompt(config.PromptTemplate)}\"",
            "--json",
            "--approval-policy", "never",
            "--sandbox", "workspace-write"
        };

        return await RunProcessAsync("codex", args, task.WorkingDirectory, ct);
    }

    private async Task<AgentResult> RunProcessAsync(
        string program, List<string> args, string workDir, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = program,
                Arguments = string.Join(" ", args),
                WorkingDirectory = workDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        var output = new StringBuilder();
        process.OutputDataReceived += (_, e) => { if (e.Data != null) output.AppendLine(e.Data); };

        process.Start();
        process.BeginOutputReadLine();
        await process.WaitForExitAsync(ct);

        sw.Stop();

        return new AgentResult(
            Success: process.ExitCode == 0,
            Output: output.ToString(),
            Duration: sw.Elapsed
        );
    }
}
```

---

## 5. A/B Testing - Porovnání agentů

Spusť stejný úkol oběma agenty a porovnej výsledky:

```csharp
public class AgentBenchmark
{
    public async Task<BenchmarkResult> CompareAgentsAsync(string prompt, string workDir)
    {
        // Vytvoř izolované worktrees
        var claudeDir = await CreateWorktreeAsync(workDir, "benchmark-claude");
        var codexDir = await CreateWorktreeAsync(workDir, "benchmark-codex");

        // Spusť oba paralelně
        var claudeTask = ExecuteClaudeAsync(prompt, claudeDir);
        var codexTask = ExecuteCodexAsync(prompt, codexDir);

        await Task.WhenAll(claudeTask, codexTask);

        var claudeResult = await claudeTask;
        var codexResult = await codexTask;

        return new BenchmarkResult
        {
            Claude = new AgentMetrics
            {
                Duration = claudeResult.Duration,
                TokensUsed = claudeResult.TokensUsed,
                Cost = claudeResult.Cost,
                LinesChanged = CountLinesChanged(claudeDir),
                TestsPassed = await RunTestsAsync(claudeDir)
            },
            Codex = new AgentMetrics
            {
                Duration = codexResult.Duration,
                TokensUsed = codexResult.TokensUsed,
                Cost = codexResult.Cost,
                LinesChanged = CountLinesChanged(codexDir),
                TestsPassed = await RunTestsAsync(codexDir)
            }
        };
    }
}

public record BenchmarkResult
{
    public AgentMetrics Claude { get; init; }
    public AgentMetrics Codex { get; init; }

    public void PrintComparison()
    {
        Console.WriteLine("╔════════════════════════════════════════════╗");
        Console.WriteLine("║         AGENT BENCHMARK RESULTS            ║");
        Console.WriteLine("╠════════════════════════════════════════════╣");
        Console.WriteLine($"║ Metric        │ Claude      │ Codex       ║");
        Console.WriteLine("╠════════════════════════════════════════════╣");
        Console.WriteLine($"║ Duration      │ {Claude.Duration.TotalSeconds,8:F1}s   │ {Codex.Duration.TotalSeconds,8:F1}s   ║");
        Console.WriteLine($"║ Cost          │ ${Claude.Cost,9:F4}  │ ${Codex.Cost,9:F4}  ║");
        Console.WriteLine($"║ Lines Changed │ {Claude.LinesChanged,10}  │ {Codex.LinesChanged,10}  ║");
        Console.WriteLine($"║ Tests Passed  │ {Claude.TestsPassed,10}  │ {Codex.TestsPassed,10}  ║");
        Console.WriteLine("╚════════════════════════════════════════════╝");
    }
}
```

---

## 6. Praktické doporučení

### Začni s Claude Squad

```bash
# 1. Instalace
brew install claude-squad

# 2. Nastav API klíče
export ANTHROPIC_API_KEY=<claude_key>
export OPENAI_API_KEY=<openai_key>

# 3. Spusť a experimentuj
cs                    # Claude Code session
cs -p "codex"         # Codex session
```

### Postupná adopce

```
Týden 1-2: Používej oba nástroje odděleně, poznávej silné stránky
    └── Claude: komplexní .NET úkoly, architektura
    └── Codex: research, code review, refaktoring

Týden 3-4: Claude Squad pro paralelní práci
    └── Různé úkoly různým agentům současně
    └── Porovnávej výstupy

Týden 5+: Hybridní pipeline
    └── Automatizovaný výběr agenta podle fáze
    └── Sdílené MCP nástroje
    └── A/B testing pro optimalizaci
```

### Cenové srovnání (orientační)

| Model | Input | Output | Poznámka |
|-------|-------|--------|----------|
| Claude 3.5 Sonnet | $3/M | $15/M | Dobrý poměr cena/výkon |
| Claude 4 Opus | $15/M | $75/M | Komplexní reasoning |
| GPT-5-Codex | ~$5/M | ~$20/M | Optimalizovaný pro code |
| GPT-4o | $2.50/M | $10/M | Rychlý, levnější |

---

## Závěr

Kombinace Claude Code a Codex CLI je nejen možná, ale i strategicky výhodná:

1. **Claude Squad** poskytuje hotovou infrastrukturu pro běh obou agentů
2. **MCP** slouží jako společný protokol pro sdílení nástrojů
3. **Git worktrees** zajišťují izolaci pro bezpečné paralelní běhy
4. **Různé modely** excelují v různých úkolech - využij toho

Klíčem je experimentování: spusť stejný úkol oběma agenty, porovnej výsledky, a postupně optimalizuj pipeline podle toho, který agent je lepší pro jaký typ práce.
