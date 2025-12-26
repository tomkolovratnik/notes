---
layout: default
title: Docker
parent: Vývojové nástroje
nav_order: 3
---

# Docker

## Základní příkazy
```bash
# Images
docker images                    # Výpis všech lokálních images
docker pull <image>              # Stažení image z registry
docker build -t <name> .         # Build image z Dockerfile v aktuálním adresáři
docker rmi <image>               # Odstranění image

# Containers
docker ps                        # Výpis běžících kontejnerů
docker ps -a                     # Výpis všech kontejnerů (i zastavených)
docker run <image>               # Spuštění nového kontejneru
docker run -d -p 8080:80 <image> # Spuštění na pozadí s mapováním portu
docker stop <container>          # Zastavení běžícího kontejneru
docker rm <container>            # Odstranění kontejneru

# Logs a exec
docker logs <container>          # Zobrazení logů kontejneru
docker exec -it <container> bash # Připojení do běžícího kontejneru
```

## Docker Compose
```yaml
# docker-compose.yml příklad
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
```

```bash
# Příkazy
docker-compose up           # Spuštění všech služeb (připojeno k terminálu)
docker-compose up -d        # Spuštění všech služeb na pozadí
docker-compose down         # Zastavení a odstranění všech služeb
docker-compose logs -f      # Živé sledování logů všech služeb
```

## Dockerfile vzor
```dockerfile
FROM node:18-alpine       # Základní image (Node.js 18 na Alpine Linux)
WORKDIR /app              # Nastavení pracovního adresáře
COPY package*.json ./     # Zkopírování package.json a package-lock.json
RUN npm install           # Instalace závislostí
COPY . .                  # Zkopírování zbytku aplikace
EXPOSE 3000               # Deklarace portu (informativní)
CMD ["npm", "start"]      # Výchozí příkaz při spuštění kontejneru
```

## Podman a Compose

Podman umí pracovat se stejnými Compose soubory jako Docker (`docker-compose.yml` / `compose.yaml`). Neexistuje speciální formát pro Podman.

### Varianta 1: `podman compose` (doporučené)
```bash
# Spuštění služeb na pozadí
podman compose up -d

# Výpis běžících kontejnerů
podman compose ps

# Zastavení a odstranění služeb
podman compose down

# Ověření, zda je Compose dostupný
podman compose version
```

### Varianta 2: `podman-compose` (Python nástroj)
```bash
# Instalace podman-compose pro aktuálního uživatele
pip install --user podman-compose

# Spuštění služeb na pozadí
podman-compose up -d

# Zastavení a odstranění služeb
podman-compose down
```

### Varianta 3: Docker Compose V2 s Podman socketem
```bash
# Povolení a spuštění Podman socketu pro Docker kompatibilitu
systemctl --user enable --now podman.socket

# Nastavení proměnné prostředí pro Docker Compose
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock

# Spuštění služeb pomocí Docker Compose (používá Podman jako engine)
docker compose up -d

# Zastavení služeb
docker compose down
```

**Poznámka:** Některé nejnovější Compose funkce nemusí v `podman-compose` hned fungovat. Pro plnou kompatibilitu použij variantu 3.

## Podman Machine (Windows/macOS)

Podman Machine spravuje virtuální Linux VM pro běh Podman na Windows a macOS:

```bash
# Vytvoření a správa virtuálního stroje
podman machine init              # Inicializace nového machine s výchozím nastavením
podman machine start             # Spuštění machine
podman machine stop              # Zastavení machine
podman machine rm                # Odstranění machine

# Informace a diagnóza
podman machine list              # Výpis všech machines (show VM seznamu)
podman info                      # Zobrazení podman systémových informací (verze, driver, storage, atd.)
podman system connection list    # Výpis dostupných Podman connections
```

## Bezpečnostní skenování (Trivy & Grype)

Nástroje pro detekci zranitelností v container images, filesystémech a závislostech (NuGet, npm, pip, atd.).

### Trivy

Komplexní skener od Aqua Security - podporuje images, filesystémy, Git repo, Kubernetes, IaC (Terraform, CloudFormation).

#### Instalace

```bash
# Linux (Debian/Ubuntu)
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# macOS
brew install trivy

# Windows (winget)
winget install AquaSecurity.Trivy

# Jako Docker image (bez instalace)
docker run --rm aquasec/trivy image alpine:latest
```

#### Základní použití

```bash
# Skenování Docker image
trivy image nginx:latest                    # Skenování image z Docker Hub
trivy image myapp:1.0                       # Skenování lokální image
trivy image --severity HIGH,CRITICAL nginx  # Pouze HIGH a CRITICAL zranitelnosti

# Skenování s výstupem do souboru
trivy image -f json -o results.json nginx:latest  # JSON výstup pro další zpracování
trivy image -f table nginx:latest                 # Tabulkový výstup (výchozí)
trivy image -f sarif -o results.sarif nginx:latest # SARIF pro GitHub Security

# Skenování filesystému (závislosti v projektu)
trivy fs .                                  # Skenování aktuálního adresáře
trivy fs --scanners vuln,secret .           # Skenování zranitelností a secrets
trivy fs /path/to/project                   # Skenování konkrétní cesty

# Skenování Git repozitáře
trivy repo https://github.com/user/repo     # Přímo z URL
trivy repo .                                # Lokální Git repo

# Skenování SBOM (Software Bill of Materials)
trivy sbom ./sbom.json                      # Skenování existujícího SBOM

# Generování SBOM
trivy image --format cyclonedx -o sbom.json nginx:latest  # CycloneDX formát
trivy image --format spdx-json -o sbom.json nginx:latest  # SPDX formát
```

#### Konfigurace a pokročilé použití

```bash
# Ignorování konkrétních CVE (vytvoř .trivyignore soubor)
echo "CVE-2023-12345" > .trivyignore
trivy image --ignorefile .trivyignore nginx:latest

# Fail při nalezení zranitelností (pro CI/CD)
trivy image --exit-code 1 --severity CRITICAL nginx:latest  # Exit 1 pokud najde CRITICAL

# Offline skenování (stáhne DB předem)
trivy image --download-db-only              # Stažení vulnerability DB
trivy image --skip-db-update nginx:latest   # Použití stažené DB bez aktualizace

# Skenování bez přístupu k internetu
trivy image --offline-scan nginx:latest     # Kompletně offline mód

# Cache management
trivy image --cache-dir /tmp/trivy nginx:latest  # Vlastní cache adresář
trivy image --clear-cache                        # Vyčištění cache
```

### Grype

Rychlý skener od Anchore - zaměřený na jednoduchost a rychlost. Ideální pro CI/CD pipelines.

#### Instalace

```bash
# Linux/macOS (install script)
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# macOS
brew install grype

# Windows (winget)
winget install anchore.grype

# Jako Docker image
docker run --rm anchore/grype alpine:latest
```

#### Základní použití

```bash
# Skenování Docker image
grype nginx:latest                          # Skenování image
grype nginx:latest --only-fixed             # Pouze zranitelnosti s dostupnou opravou
grype nginx:latest --fail-on critical       # Fail při CRITICAL (pro CI/CD)

# Skenování podle severity
grype nginx:latest --only-notfixed          # Pouze zranitelnosti BEZ opravy
grype nginx:latest -o table                 # Tabulkový výstup (výchozí)
grype nginx:latest -o json                  # JSON výstup
grype nginx:latest -o sarif                 # SARIF pro GitHub Security

# Skenování lokálních zdrojů
grype dir:/path/to/project                  # Skenování adresáře
grype sbom:./sbom.json                      # Skenování SBOM souboru

# Generování SBOM pomocí Syft (companion tool)
syft nginx:latest -o cyclonedx-json > sbom.json  # Vytvoření SBOM
grype sbom:./sbom.json                           # Skenování SBOM
```

#### Konfigurace (.grype.yaml)

```yaml
# .grype.yaml - konfigurace v kořenu projektu
ignore:
  - vulnerability: CVE-2023-12345    # Ignorování konkrétní CVE
  - package:
      name: lodash                   # Ignorování balíčku
      version: "4.17.0"
      type: npm
  - fix-state: unknown               # Ignorování bez známé opravy

fail-on-severity: critical           # Fail při CRITICAL a výše
output: table                        # Výchozí výstupní formát
```

### Porovnání Trivy vs Grype

| Vlastnost | Trivy | Grype |
|-----------|-------|-------|
| **Rychlost** | Střední | Rychlejší |
| **Container images** | ✅ | ✅ |
| **Filesystem/závislosti** | ✅ | ✅ |
| **IaC skenování** | ✅ (Terraform, K8s) | ❌ |
| **Secret detection** | ✅ | ❌ |
| **License scanning** | ✅ | ❌ |
| **SBOM generování** | ✅ | ❌ (použij Syft) |
| **Offline mód** | ✅ | ✅ |

**Doporučení:** Trivy pro komplexní skenování, Grype pro rychlé CI/CD pipelines.

### Integrace do .NET projektu

#### Dockerfile s multi-stage build a skenováním

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore                           # Obnovení závislostí
COPY . ./
RUN dotnet publish -c Release -o /app        # Publikování aplikace

# Security scan stage (volitelné - pro lokální build)
FROM aquasec/trivy:latest AS scanner
COPY --from=build /src /src
RUN trivy fs --exit-code 1 --severity HIGH,CRITICAL /src  # Fail při HIGH/CRITICAL

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

#### Skenování .NET závislostí (NuGet)

```bash
# Trivy automaticky detekuje *.csproj, packages.config, packages.lock.json
trivy fs --scanners vuln ./MyProject        # Skenování .NET projektu
trivy fs --scanners vuln ./MyProject/*.csproj  # Pouze csproj soubory

# Grype
grype dir:./MyProject                        # Skenování .NET projektu
```

### GitHub Actions integrace

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Skenování závislostí v kódu
      - name: Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'                     # Fail při nálezu

      # Skenování Docker image (pokud existuje)
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Trivy image scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'HIGH,CRITICAL'

      # Upload výsledků do GitHub Security tab
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  grype-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Grype scan
        uses: anchore/scan-action@v4
        with:
          path: '.'
          fail-build: true
          severity-cutoff: high
```

### Azure DevOps integrace

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: SecurityScan
    jobs:
      - job: TrivyScan
        steps:
          - task: Bash@3
            displayName: 'Install Trivy'
            inputs:
              targetType: 'inline'
              script: |
                curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

          - task: Bash@3
            displayName: 'Scan dependencies'
            inputs:
              targetType: 'inline'
              script: |
                trivy fs --exit-code 1 --severity HIGH,CRITICAL .

          - task: Docker@2
            displayName: 'Build image'
            inputs:
              command: 'build'
              Dockerfile: '**/Dockerfile'
              tags: '$(Build.BuildId)'

          - task: Bash@3
            displayName: 'Scan Docker image'
            inputs:
              targetType: 'inline'
              script: |
                trivy image --exit-code 1 --severity CRITICAL myapp:$(Build.BuildId)
```

### Volání z C# kódu (programatické spuštění)

Pro automatizaci skenování přímo z C# aplikace (např. v build pipeline nebo admin nástroji):

```csharp
using System.Diagnostics;

public class SecurityScanner
{
    /// <summary>
    /// Spustí Trivy skenování Docker image a vrátí výsledek jako JSON
    /// </summary>
    public async Task<string> ScanImageAsync(string imageName, CancellationToken ct = default)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "trivy",
                Arguments = $"image -f json --quiet {imageName}",  // JSON výstup, bez progress baru
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync(ct);
        var error = await process.StandardError.ReadToEndAsync(ct);
        await process.WaitForExitAsync(ct);

        if (process.ExitCode != 0 && !string.IsNullOrEmpty(error))
        {
            throw new Exception($"Trivy scan failed: {error}");
        }

        return output;  // JSON s nalezenými zranitelnostmi
    }

    /// <summary>
    /// Kontrola zda image obsahuje CRITICAL zranitelnosti
    /// </summary>
    public async Task<bool> HasCriticalVulnerabilitiesAsync(string imageName)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "trivy",
                Arguments = $"image --exit-code 1 --severity CRITICAL --quiet {imageName}",
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        await process.WaitForExitAsync();

        return process.ExitCode == 1;  // Exit code 1 = nalezeny CRITICAL zranitelnosti
    }
}

// Použití
var scanner = new SecurityScanner();
var jsonResult = await scanner.ScanImageAsync("nginx:latest");
var hasCritical = await scanner.HasCriticalVulnerabilitiesAsync("myapp:1.0");
```

### Použití s CliWrap (doporučeno)

Pro robustnější práci s CLI nástroji doporučuji použít NuGet balíček [CliWrap](https://github.com/Tyrrrz/CliWrap):

```csharp
using CliWrap;
using CliWrap.Buffered;

public class SecurityScannerWithCliWrap
{
    public async Task<string> ScanImageAsync(string imageName)
    {
        var result = await Cli.Wrap("trivy")
            .WithArguments(["image", "-f", "json", "--quiet", imageName])
            .WithValidation(CommandResultValidation.None)  // Nevaliduj exit code
            .ExecuteBufferedAsync();

        if (result.ExitCode != 0 && result.StandardError.Length > 0)
        {
            throw new Exception($"Scan failed: {result.StandardError}");
        }

        return result.StandardOutput;
    }

    public async Task<(bool HasVulnerabilities, string Report)> ScanWithReportAsync(string imageName)
    {
        var result = await Cli.Wrap("trivy")
            .WithArguments(["image", "--exit-code", "1", "--severity", "HIGH,CRITICAL", imageName])
            .WithValidation(CommandResultValidation.None)
            .ExecuteBufferedAsync();

        return (result.ExitCode == 1, result.StandardOutput);
    }
}
```

### Pre-commit hook pro lokální skenování

```bash
#!/bin/bash
# .git/hooks/pre-commit - skenování před commitem

echo "🔍 Running security scan..."

# Skenování změněných souborů
if command -v trivy &> /dev/null; then
    trivy fs --exit-code 1 --severity CRITICAL --quiet .
    if [ $? -ne 0 ]; then
        echo "❌ Critical vulnerabilities found! Commit blocked."
        exit 1
    fi
    echo "✅ Security scan passed"
else
    echo "⚠️ Trivy not installed, skipping security scan"
fi
```
