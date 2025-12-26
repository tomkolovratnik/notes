# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal notes and reference repository (`_my-notes`) containing documentation, guides, code snippets, and configuration examples for various development tools. The content is in Czech language.

## Repository Structure

The repository uses a modular structure with topic-specific markdown files:

```
_my-notes/
├── index.md                # Index/rozcestník s odkazy na všechny téma
├── claude-code.md          # Claude Code: CLI nástroj, tipy, MCP konfigurace
├── git.md                  # Git: příkazy, tipy, .gitignore vzory
├── docker.md               # Docker: container management, Compose, Dockerfile
├── vscode.md               # VS Code: zkratky, rozšíření, nastavení
├── nodejs.md               # Node.js/npm: package management, scripty
├── dotnet.md               # .NET: User Secrets, CLI příkazy
├── linux.md                # Linux/Bash: příkazy, aktualizace systému (Ubuntu)
└── powershell.md           # PowerShell: Windows příkazy a skripty
```

**Entry point:** `index.md` - serves as index with links to all topic-specific files

## Working with This Repository

### Prostředí (Environment)

Claude Code je spouštěn v **Git Bash** (MINGW64) na Windows. Tato informace je důležitá pro:
- Příkazy by měly být kompatibilní s Bash (ne PowerShell)
- Cesty se zapisují s `/` (forward slashes)
- Skripty a příkazy jsou linux-like, ne Windows-native

### Language
All documentation is written in **Czech**. When making changes or additions:
- Maintain Czech language for consistency
- Use formal Czech technical terminology
- Follow existing formatting patterns

### File Organization Principles

#### index.md
- Acts as a table of contents/index only
- Contains links to topic-specific files with brief descriptions
- Should NOT contain detailed content (only in topic files)
- Update "Poslední aktualizace" date when making changes

#### Topic Files (claude-code.md, git.md, etc.)
Each topic file follows this structure:
- **Title** - H1 heading with topic name
- **Sections** - H2/H3 headings for subtopics
- **Code blocks** - For commands and configuration examples
- **Practical focus** - Real-world usage, not theory

### Adding New Content

#### Adding a New Topic
When adding documentation for a new tool/technology:
1. Create a new `.md` file with kebab-case naming (e.g., `kubernetes.md`)
2. Add entry to index.md table of contents with link and brief description
3. Follow the existing file structure pattern
4. Update the date in index.md

#### Updating Existing Topics
- Edit the relevant topic file directly
- Preserve existing structure and formatting
- Add new examples to appropriate subsections
- Keep command examples concise and practical
- Update index.md date if significant changes

### Content Philosophy

This repository focuses on:
- **Quick reference** - Fast lookup for common tasks and commands
- **Practical examples** - Working code snippets, not explanations
- **Configuration templates** - Copy-paste ready configs
- **Personal workflows** - Frequently used patterns and commands

The documentation intentionally avoids:
- Lengthy explanations (links to official docs instead)
- Comprehensive tutorials
- Theoretical or generated examples

### File Format Standards

- **Code blocks**: Use proper syntax highlighting (bash, json, yaml, etc.)
- **Commands**: Show actual command syntax with `<placeholder>` for variables
- **Comments**: ALWAYS add inline comments to commands and code examples explaining what each command/line does
  - For bash/shell commands: use `#` at the end of line or on separate line
  - For Dockerfile: use `#` after each instruction
  - For YAML/configs: use `#` for important sections
  - Keep comments concise and in Czech
- **Sections**: Use consistent heading hierarchy (H2 for main sections, H3 for subsections)
- **Lists**: Use `-` for unordered lists, maintain consistent indentation
- **Links**: Use relative links for internal files, absolute for external resources

## Common Tasks for Claude Code

When working in this repository, typical requests include:

**Adding content**: "Přidej sekci o X do Y.md"
**Creating new topic**: "Vytvoř nový soubor pro téma X s obsahem Y"
**Updating index**: "Přidej odkaz do index.md"
**Restructuring**: "Reorganizuj sekci X v souboru Y"

Always ensure:
- Content stays in Czech
- index.md links remain valid
- Consistent formatting with existing files

### Git Workflow

**IMPORTANT**: After completing ANY changes to files in this repository, ALWAYS commit and push changes to Git automatically without asking for permission.

When making changes:
1. Complete the requested task
2. Automatically run `git add .`
3. Create a descriptive commit message in Czech
4. Push to remote with `git push`
5. Inform user that changes were committed and pushed

Exception: Only skip auto-commit if user explicitly says "don't commit" or "bez commitu"
