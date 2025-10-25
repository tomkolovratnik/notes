# Node.js / npm

## Základní příkazy
```bash
# Inicializace projektu
npm init                        # Interaktivní vytvoření package.json
npm init -y                     # Vytvoření package.json s výchozími hodnotami

# Instalace balíčků
npm install <package>           # Instalace balíčku jako dependency
npm install <package> --save-dev # Instalace jako devDependency
npm install -g <package>        # Globální instalace balíčku

# Odstranění
npm uninstall <package>         # Odstranění balíčku

# Aktualizace
npm update                      # Aktualizace všech balíčků
npm outdated                    # Zobrazení zastaralých balíčků

# Spuštění skriptů
npm start                       # Spuštění start scriptu
npm test                        # Spuštění testů
npm run <script>                # Spuštění vlastního scriptu
```

## package.json skript vzory
```json
{
  "scripts": {
    "start": "node index.js",              // Spuštění aplikace
    "dev": "nodemon index.js",             // Dev režim s auto-reloadem
    "build": "webpack --mode production",  // Build pro produkci
    "test": "jest",                        // Spuštění testů
    "lint": "eslint ."                     // Kontrola kvality kódu
  }
}
```

## Časté problémy
```bash
# Smazání node_modules a čistá reinstalace (řeší většinu problémů)
rm -rf node_modules package-lock.json
npm install

# Vyčištění npm cache (při problémech s instalací)
npm cache clean --force
```
