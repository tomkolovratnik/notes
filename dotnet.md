---
layout: default
title: .NET
nav_order: 8
---

# .NET

## Práce s projekty (dotnet CLI)

### Vytvoření solution a projektů

```bash
# Vytvoření nové solution
dotnet new sln -n MojeAplikace                    # Vytvoří MojeAplikace.sln

# Vytvoření konzolové aplikace
dotnet new console -n MojeAplikace.Console        # Vytvoří projekt v podsložce
dotnet new console -n MojeAplikace.Console -o src/Console  # Vlastní výstupní složka

# Vytvoření knihovny (class library)
dotnet new classlib -n MojeAplikace.Core          # Standardní knihovna
dotnet new classlib -n MojeAplikace.Core -f net8.0  # S konkrétním frameworkem

# Vytvoření webových projektů
dotnet new webapi -n MojeAplikace.Api             # ASP.NET Core Web API
dotnet new webapp -n MojeAplikace.Web             # ASP.NET Core Razor Pages
dotnet new mvc -n MojeAplikace.Mvc                # ASP.NET Core MVC
dotnet new blazor -n MojeAplikace.Blazor          # Blazor Web App

# Vytvoření testovacích projektů
dotnet new xunit -n MojeAplikace.Tests            # xUnit testy
dotnet new nunit -n MojeAplikace.Tests            # NUnit testy
dotnet new mstest -n MojeAplikace.Tests           # MSTest testy
```

### Přidání projektů do solution

```bash
# Přidání jednoho projektu do solution
dotnet sln add MojeAplikace.Console/MojeAplikace.Console.csproj

# Přidání více projektů najednou
dotnet sln add **/*.csproj                        # Všechny projekty rekurzivně

# Přidání do konkrétní solution složky
dotnet sln add src/Core/Core.csproj --solution-folder src

# Odebrání projektu ze solution
dotnet sln remove MojeAplikace.Console/MojeAplikace.Console.csproj

# Zobrazení projektů v solution
dotnet sln list
```

### Reference mezi projekty

```bash
# Přidání reference na jiný projekt (z adresáře projektu)
cd MojeAplikace.Console
dotnet add reference ../MojeAplikace.Core/MojeAplikace.Core.csproj

# Přidání reference s cestou k projektu
dotnet add MojeAplikace.Api/MojeAplikace.Api.csproj reference MojeAplikace.Core/MojeAplikace.Core.csproj

# Odebrání reference
dotnet remove reference ../MojeAplikace.Core/MojeAplikace.Core.csproj

# Zobrazení referencí projektu
dotnet list reference
```

### NuGet balíčky

```bash
# Přidání NuGet balíčku
dotnet add package Newtonsoft.Json                # Nejnovější verze
dotnet add package Serilog --version 3.1.1        # Konkrétní verze

# Přidání do konkrétního projektu
dotnet add MojeAplikace.Core/MojeAplikace.Core.csproj package AutoMapper

# Odebrání balíčku
dotnet remove package Newtonsoft.Json

# Zobrazení nainstalovaných balíčků
dotnet list package
dotnet list package --outdated                    # Zobrazí zastaralé balíčky

# Aktualizace balíčků
dotnet add package Serilog                        # Aktualizuje na nejnovější
```

### Build, run a publish

```bash
# Sestavení projektu/solution
dotnet build                                      # Debug build
dotnet build -c Release                           # Release build
dotnet build --no-restore                         # Bez restore NuGet

# Spuštění projektu
dotnet run                                        # Spustí projekt v aktuální složce
dotnet run --project src/Api/Api.csproj           # Spustí konkrétní projekt
dotnet run -c Release                             # Spustí v Release konfiguraci

# Watch mode (automatický restart při změnách)
dotnet watch run                                  # Sleduje změny a restartuje
dotnet watch run --project src/Api/Api.csproj

# Publikování
dotnet publish -c Release                         # Publikuje do bin/Release/.../publish
dotnet publish -c Release -o ./output             # Vlastní výstupní složka
dotnet publish -c Release --self-contained        # Self-contained (včetně .NET runtime)
dotnet publish -c Release -r win-x64              # Pro konkrétní platformu
```

### Testy

```bash
# Spuštění testů
dotnet test                                       # Spustí všechny testy v solution
dotnet test --filter "FullyQualifiedName~UnitTests"  # Filtrování testů
dotnet test --no-build                            # Bez buildu (už je zbuildováno)
dotnet test -c Release                            # Testy v Release konfiguraci

# Spuštění s detailním výstupem
dotnet test --logger "console;verbosity=detailed"
dotnet test --collect:"XPlat Code Coverage"       # S code coverage
```

### Čištění a restore

```bash
# Restore NuGet balíčků
dotnet restore                                    # Stáhne všechny NuGet závislosti

# Vyčištění build artefaktů
dotnet clean                                      # Smaže bin/ a obj/ složky
dotnet clean -c Release                           # Jen Release build
```

### Typická struktura projektu

```bash
# Vytvoření kompletní struktury projektu
dotnet new sln -n MojeAplikace
dotnet new webapi -n MojeAplikace.Api -o src/Api
dotnet new classlib -n MojeAplikace.Core -o src/Core
dotnet new classlib -n MojeAplikace.Infrastructure -o src/Infrastructure
dotnet new xunit -n MojeAplikace.Tests -o tests/Tests

# Přidání do solution
dotnet sln add src/Api/MojeAplikace.Api.csproj
dotnet sln add src/Core/MojeAplikace.Core.csproj
dotnet sln add src/Infrastructure/MojeAplikace.Infrastructure.csproj
dotnet sln add tests/Tests/MojeAplikace.Tests.csproj

# Nastavení referencí
dotnet add src/Api/MojeAplikace.Api.csproj reference src/Core/MojeAplikace.Core.csproj
dotnet add src/Api/MojeAplikace.Api.csproj reference src/Infrastructure/MojeAplikace.Infrastructure.csproj
dotnet add src/Infrastructure/MojeAplikace.Infrastructure.csproj reference src/Core/MojeAplikace.Core.csproj
dotnet add tests/Tests/MojeAplikace.Tests.csproj reference src/Core/MojeAplikace.Core.csproj
```

### Zobrazení dostupných šablon

```bash
# Seznam všech šablon
dotnet new list                                   # Všechny nainstalované šablony
dotnet new list web                               # Šablony obsahující "web"

# Instalace nové šablony
dotnet new install Blazorise.Templates            # Instalace šablony z NuGet
dotnet new uninstall Blazorise.Templates          # Odinstalace šablony
```

---

## User Secrets (Secret Manager)

Nástroj pro bezpečné ukládání citlivých dat během vývoje (API klíče, connection stringy, hesla). Secrets se ukládají lokálně mimo projekt a nejsou verzovány v Gitu.

### Základní příkazy

```bash
# Inicializace User Secrets v projektu (vytvoří UserSecretsId v .csproj)
dotnet user-secrets init

# Přidání/nastavení secret hodnoty
dotnet user-secrets set "ApiKey" "muj-tajny-klic"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;..."

# Zobrazení všech secrets
dotnet user-secrets list

# Zobrazení konkrétního secret
dotnet user-secrets list | grep "ApiKey"

# Odstranění konkrétního secret
dotnet user-secrets remove "ApiKey"

# Odstranění všech secrets
dotnet user-secrets clear
```

### Práce se secrets v projektu

```bash
# Navigace do složky s .csproj souborem
cd MyProject

# Inicializace (pokud ještě není)
dotnet user-secrets init

# Přidání secrets
dotnet user-secrets set "EmailSettings:SmtpServer" "smtp.example.com"
dotnet user-secrets set "EmailSettings:Port" "587"
dotnet user-secrets set "EmailSettings:Password" "tajne-heslo"
```

### Použití v C# kódu

```csharp
// Program.cs - automatické načtení v ASP.NET Core
var builder = WebApplication.CreateBuilder(args);

// Secrets jsou automaticky dostupné přes IConfiguration
var apiKey = builder.Configuration["ApiKey"];
var connectionString = builder.Configuration["ConnectionStrings:DefaultConnection"];

// Nebo přes Options pattern
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
```

**appsettings.json (veřejný):**
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.example.com",  // Výchozí hodnota
    "Port": 587
    // Password NENÍ zde - je v user secrets
  }
}
```

**User Secrets (lokální, není verzovaný):**
```json
{
  "EmailSettings": {
    "Password": "tajne-heslo"           // Přepíše/doplní hodnoty z appsettings
  }
}
```

### Umístění secrets souborů

```bash
# Windows
%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json
# Typicky: C:\Users\{username}\AppData\Roaming\Microsoft\UserSecrets\...

# Linux/macOS
~/.microsoft/usersecrets/<user_secrets_id>/secrets.json
```

### Ruční editace secrets

```bash
# Zobrazení cesty k secrets souboru
dotnet user-secrets list --json

# Přímá editace (alternativa k příkazům)
# Windows:
notepad %APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json

# Linux/macOS:
nano ~/.microsoft/usersecrets/<user_secrets_id>/secrets.json
```

### Tipy a best practices

- ✅ **Vývoj**: User Secrets jsou ideální pro lokální vývoj
- ✅ **Automatické**: ASP.NET Core je načítá automaticky v Development prostředí
- ✅ **.gitignore**: Secrets nejsou v projektu, takže se nemohou dostat do Gitu
- ⚠️ **Produkce**: Pro produkci použij Azure Key Vault, AWS Secrets Manager, env proměnné, atd.
- ⚠️ **Nezašifrované**: Secrets jsou uložené jako plain text na disku (bezpečné jen před verzováním)
- 💡 **Team**: Každý vývojář musí nastavit svoje secrets lokálně (sdílej seznam potřebných klíčů, ne hodnoty)

### Kontrola konfigurace v .csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <!-- UserSecretsId vygenerované při dotnet user-secrets init -->
    <UserSecretsId>aspnet-MyProject-12345678-1234-1234-1234-123456789012</UserSecretsId>
  </PropertyGroup>
</Project>
```

### Příklad: Komplexní nastavení

```bash
# Inicializace
dotnet user-secrets init

# Database connection
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=MyDb;User=sa;Password=Strong!Pass123"

# API klíče
dotnet user-secrets set "ExternalApis:OpenAI:ApiKey" "sk-..."
dotnet user-secrets set "ExternalApis:Stripe:SecretKey" "sk_test_..."

# Email konfigurace
dotnet user-secrets set "EmailSettings:Username" "noreply@example.com"
dotnet user-secrets set "EmailSettings:Password" "email-heslo-123"

# Ověření
dotnet user-secrets list
```
