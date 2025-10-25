# .NET

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
