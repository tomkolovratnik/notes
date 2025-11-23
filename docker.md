---
layout: default
title: Docker
nav_order: 4
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
