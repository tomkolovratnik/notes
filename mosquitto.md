# Eclipse Mosquitto (MQTT Broker)

Lehký MQTT broker vhodný pro IoT. Tato dokumentace se zaměřuje na provoz v Docker kontejneru.

## Docker Compose

```yaml
services:
  mosquitto:
    image: eclipse-mosquitto:2  # verze 2.x vyžaduje autentizaci
    container_name: mosquitto
    restart: unless-stopped
    ports:
      - "1883:1883"   # MQTT
      - "9001:9001"   # WebSocket (volitelné)
    volumes:
      - ./mosquitto/config:/mosquitto/config  # konfigurace
      - ./mosquitto/data:/mosquitto/data      # perzistentní data
      - ./mosquitto/log:/mosquitto/log        # logy
```

## Základní konfigurace

Soubor `mosquitto/config/mosquitto.conf`:

```conf
# Listener pro MQTT protokol
listener 1883

# Listener pro WebSocket (volitelné)
listener 9001
protocol websockets

# Perzistence zpráv
persistence true
persistence_location /mosquitto/data/

# Logování
log_dest file /mosquitto/log/mosquitto.log
log_dest stdout

# Autentizace - POVINNÉ pro Mosquitto 2.x
# false = vyžaduje heslo, true = anonymní přístup povolen
allow_anonymous false
password_file /mosquitto/config/passwd

# ACL - řízení přístupu k topicům (volitelné)
acl_file /mosquitto/config/acl
```

## Přístup do terminálu kontejneru

### Synology Container Manager (DSM 7.2+)

1. Otevři **Container Manager** ve webovém rozhraní Synology
2. V levém menu vyber **Kontejner** (Container)
3. Klikni na kontejner **mosquitto**
4. V horní liště klikni na **Akce** (Action)
5. Vyber **Otevřít terminál** (Open terminal)
6. Otevře se webový terminál - klikni na **Vytvořit**
7. Vyber **Spustit pomocí příkazu** a zadej `sh`
8. Teď můžeš zadávat příkazy (Eclipse Mosquitto image nemá bash, pouze sh)

Příkazy pak zadáváš přímo bez `docker exec`:

```bash
# Vytvoření prvního uživatele
mosquitto_passwd -c /mosquitto/config/passwd admin

# Přidání dalšího uživatele
mosquitto_passwd /mosquitto/config/passwd sensor1
```

### Přes SSH / příkazovou řádku

```bash
# Spuštění příkazu uvnitř kontejneru
docker exec -it mosquitto <příkaz>

# Interaktivní shell (pokud je dostupný)
docker exec -it mosquitto sh
```

## Správa uživatelů

### Vytvoření souboru s hesly

```bash
# -c vytvoří nový soubor, první uživatel
mosquitto_passwd -c /mosquitto/config/passwd admin

# Přidání dalších uživatelů (BEZ -c, jinak přepíše soubor!)
mosquitto_passwd /mosquitto/config/passwd sensor1
mosquitto_passwd /mosquitto/config/passwd client1
```

Pokud používáš `docker exec` místo terminálu v Container Manageru:

```bash
docker exec -it mosquitto mosquitto_passwd -c /mosquitto/config/passwd admin
docker exec -it mosquitto mosquitto_passwd /mosquitto/config/passwd sensor1
```

### Smazání uživatele

```bash
mosquitto_passwd -D /mosquitto/config/passwd sensor1
```

### Změna hesla

```bash
# Stačí znovu zavolat pro existujícího uživatele
mosquitto_passwd /mosquitto/config/passwd admin
```

### Ruční vytvoření hesla (bez interaktivního promptu)

```bash
# -b umožní zadat heslo jako argument (méně bezpečné, zůstane v historii)
mosquitto_passwd -b /mosquitto/config/passwd user1 tajneheslo
```

## ACL - Řízení přístupu k topicům

Soubor `mosquitto/config/acl`:

```conf
# Syntaxe:
# user <username>
# topic [read|write|readwrite|deny] <topic-pattern>

# Admin má přístup ke všemu
user admin
topic readwrite #

# Senzor může pouze publikovat do svého topicu
user sensor1
topic write sensors/teplota
topic write sensors/vlhkost

# Klient může číst všechny senzory, ale ne zapisovat
user client1
topic read sensors/#

# Anonymní přístup (pokud allow_anonymous true)
# pattern - %c = client id, %u = username
topic read public/#
```

### Wildcardy v topicech

| Znak | Význam | Příklad |
|------|--------|---------|
| `+` | Jedna úroveň | `sensors/+/temp` matchuje `sensors/room1/temp` |
| `#` | Všechny úrovně | `sensors/#` matchuje `sensors/room1/temp/celsius` |

## Reload konfigurace

```bash
# Po změně passwd nebo acl souboru - restart kontejneru
docker restart mosquitto

# Nebo SIGHUP pro reload bez restartu (od verze 2.0)
docker exec mosquitto kill -HUP 1
```

Na Synology v Container Manageru: **Akce → Restartovat**

## Testování

### Příkazová řádka (mosquitto-clients)

```bash
# Instalace klientů (Ubuntu/Debian)
sudo apt install mosquitto-clients

# Subscribe - poslouchání na topicu
mosquitto_sub -h localhost -p 1883 -u admin -P heslo -t "sensors/#" -v

# Publish - odeslání zprávy
mosquitto_pub -h localhost -p 1883 -u admin -P heslo -t "sensors/teplota" -m "22.5"

# Publish s QoS a retain flagem
mosquitto_pub -h localhost -u admin -P heslo -t "status/online" -m "1" -q 1 -r
```

### Parametry

| Parametr | Význam |
|----------|--------|
| `-h` | Hostname |
| `-p` | Port (default 1883) |
| `-u` | Username |
| `-P` | Password |
| `-t` | Topic |
| `-m` | Message |
| `-v` | Verbose (zobrazí topic u zprávy) |
| `-q` | QoS úroveň (0, 1, 2) |
| `-r` | Retain - broker uloží poslední zprávu |
| `-d` | Debug výpis |

### Testování z kontejneru

```bash
# Publikování zprávy
mosquitto_pub -h localhost -u admin -P heslo -t "test" -m "hello"

# Poslech na topicu
mosquitto_sub -h localhost -u admin -P heslo -t "test" -v
```

Přes `docker exec`:

```bash
docker exec mosquitto mosquitto_pub -h localhost -u admin -P heslo -t "test" -m "hello"
```

## QoS (Quality of Service)

| Úroveň | Název | Popis |
|--------|-------|-------|
| 0 | At most once | Fire and forget, bez potvrzení |
| 1 | At least once | Potvrzení doručení, možné duplikáty |
| 2 | Exactly once | Garantované doručení bez duplikátů |

## Monitoring a debugging

### Systémové topicy

```bash
# Statistiky brokeru (nutné povolit v konfiguraci)
mosquitto_sub -h localhost -u admin -P heslo -t '$SYS/#' -v
```

Povolení v `mosquitto.conf`:

```conf
sys_interval 10  # interval aktualizace v sekundách
```

### Logy

```bash
# Sledování logů kontejneru
docker logs -f mosquitto

# Nebo z log souboru
tail -f mosquitto/log/mosquitto.log
```

Na Synology v Container Manageru: klikni na kontejner → záložka **Protokol** (Log)

## TLS/SSL (HTTPS)

Pro produkční nasazení s certifikáty:

```conf
listener 8883
cafile /mosquitto/config/certs/ca.crt
certfile /mosquitto/config/certs/server.crt
keyfile /mosquitto/config/certs/server.key
require_certificate false  # true = vyžadovat klientský certifikát
```

## Bridge - propojení brokerů

Propojení lokálního brokeru s cloudem:

```conf
connection bridge-to-cloud
address cloud-broker.example.com:8883
topic sensors/# out 1
topic commands/# in 1
remote_username clouduser
remote_password cloudpass
bridge_cafile /mosquitto/config/certs/cloud-ca.crt
```

## Časté problémy

### "Connection refused"
- Zkontroluj, že kontejner běží: `docker ps`
- Ověř mapování portů
- Zkontroluj firewall

### "Not authorized"
- Mosquitto 2.x vyžaduje autentizaci (není jako v 1.x)
- Ověř existenci a správnost `password_file` v konfiguraci
- Zkontroluj, že uživatel existuje v passwd souboru

### "ACL denied"
- Ověř oprávnění v acl souboru
- Zkontroluj přesnou shodu username
- Po změně ACL restartuj broker

### Změny se neprojevují
- Po úpravě konfigurace: `docker restart mosquitto`
- Na Synology: Container Manager → Akce → Restartovat
- Ověř, že editovaný soubor je namapovaný do kontejneru
