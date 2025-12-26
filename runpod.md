---
layout: default
title: Runpod.io
parent: AI & LLM
nav_order: 6
---

# Runpod.io

Runpod.io je cloud platforma pro spouštění GPU workloadů. Umožňuje snadno spustit vlastní LLM modely s OpenAI-kompatibilním API bez zbytečné složitosti.

## Přehled

Runpod nabízí:
- **GPU on demand** - pronájem GPU hodinově bez dlouhodobých závazků
- **Serverless funkce** - asynchronní processing pro aplikace
- **Pods** - stálé (persistentní) GPU instance
- **OpenAI API kompatibilita** - běží stejně jako OpenAI API

Ideální pro:
- Testování modelů bez vlastního hardwaru
- Production nasazení s failover
- Experimentování s různými modely bez závazku

## Vytvoření účtu a nastavení

1. Jdi na https://www.runpod.io
2. Registruj se a připrav si platební metodu (kredit karta nebo API key)
3. Ověř si dostupný GPU kredit
4. V sekci "Manage" nastav API keys (pro programmatický přístup)

## Spuštění LLM modelu na Runpod

### Volba přímého GPU Podu s vLLM

Nejjednoduší je spustit **GPU Pod** s předkonfigurovanou vLLM imagí:

**Kroky:**
1. Jdi na "Pods" → "Create Pod"
2. Vyber **GPU Cloud** (ne Serverless)
3. V "Select a template" vyhledej **vLLM** nebo **Ollama**
4. Vyber GPU:
   - **RTX 4090** - 24GB VRAM (stačí pro 13B modely)
   - **L40S** - 48GB VRAM (optimální pro 34B modely)
   - **H100** - 80GB VRAM (pro 70B+ modely)
5. Nastav počet GPU (obvykle 1)
6. Klikni "Run Pod"

**Cena:** ~$0.50-3.00/hod v závislosti na GPU

### Ruční setup s vLLM

Pokud chceš více kontroly, spusť own container:

```bash
# Spustit Dockerfile s vLLM na Runpodu
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3-pip
RUN pip install vllm

# Exponovat port pro API server
EXPOSE 8000

# Spustit vLLM server s modelem
CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \
     "--model", "meta-llama/Llama-2-13b-hf", \
     "--port", "8000", \
     "--gpu-memory-utilization", "0.9"]
```

## Komunikace přes OpenAI API standard

### Získání přístupu k API

Jakmile je Pod spuštěn:

1. Klikni na Pod v seznamu
2. V sekci "Connect" zkopíruj **API Endpoint** (vypadá: `https://xxxxx-xxxx.runpod.io/`)
3. Měl by obsahovat HTTPS URL s portem (obvykle `:8000`)

### Python klient s OpenAI knihovnou

```python
# Jednoduchý Python skript pro komunikaci s modelem na Runpodu
from openai import OpenAI

# Inicializace klienta
client = OpenAI(
    base_url="https://your-runpod-id.runpod.io/v1/",  # Runpod endpoint
    api_key="not-needed"  # Runpod nevyžaduje API key (pokud není nastavený)
)

# Jednoduché vyvolání (chat completion)
response = client.chat.completions.create(
    model="meta-llama/Llama-2-13b-hf",  # Název modelu, který běží na Runpodu
    messages=[
        {"role": "system", "content": "Jsi pomocný asistent."},
        {"role": "user", "content": "Vysvětli mi, co je machine learning."}
    ],
    temperature=0.7,  # Tvořivost odpovědí
    max_tokens=500     # Maximální délka odpovědi
)

print(response.choices[0].message.content)
```

### Streamování odpovědí (pro real-time chat)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-runpod-id.runpod.io/v1/",
    api_key="not-needed"
)

# Streamování - odpověď se posílá postupně
stream = client.chat.completions.create(
    model="meta-llama/Llama-2-13b-hf",
    messages=[
        {"role": "user", "content": "Napiš mi příběh o robotovi."}
    ],
    stream=True  # Zapnout streamování
)

# Čtení streamu postupně
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
```

### cURL (bez Pythonu)

```bash
# Jednoduché volání přes cURL
curl -X POST https://your-runpod-id.runpod.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-2-13b-hf",
    "messages": [
      {"role": "user", "content": "Ahoj, jak se máš?"}
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

### Node.js (JavaScript)

```javascript
// Node.js s OpenAI knihovnou
const OpenAI = require('openai').default;

const client = new OpenAI({
    baseURL: 'https://your-runpod-id.runpod.io/v1/',
    apiKey: 'not-needed'
});

async function chat() {
    const response = await client.chat.completions.create({
        model: 'meta-llama/Llama-2-13b-hf',
        messages: [
            { role: 'user', content: 'Kolik je 2+2?' }
        ],
        temperature: 0.7,
        max_tokens: 500
    });

    console.log(response.choices[0].message.content);
}

chat();
```

## Konfigurace a optimalizace

### Nastavení parametrů při spuštění vLLM

Při vytváření Podu můžeš nastavit environment proměnné:

```bash
# Paměť GPU (0.0-1.0, více = vyšší propustnost, ale více RAM potřeba)
VLLM_GPU_MEMORY_UTILIZATION=0.95

# Maximální počet tokenů v batch (vyšší = vyšší propustnost)
VLLM_MAX_BATCH_SIZE=256

# Počet GPU pro parallelizaci
TENSOR_PARALLEL_SIZE=2  # Pokud máš 2 GPUs

# Quantizace na 8-bit (šetří памет, mírně pomalejší)
VLLM_QUANTIZATION=awq  # nebo bitsandbytes, gptq
```

### Uchování dat mezi spuštěními

Runpod má **Network Volume** - cloud storage pro perzistentní data:

```bash
# Při vytváření Podu:
# 1. Nastav "Network Volume" (např. 50GB)
# 2. Pod se připojí na /workspace nebo /runpod-volume
# 3. Data se zachovají i po zastavení Podu

# Nahrání modelu do Network Volume (aby se nekopíroval každého spuštění)
cd /workspace
git clone https://huggingface.co/meta-llama/Llama-2-13b-hf

# Příští spuštění bude mnohem rychlejší
```

## Běžné problémy

### Pod se spouští dlouho (30+ minut)

- Běžné pro velké modely (70B+ parametrů)
- Čeka se na download modelu z Hugging Face
- Řešení: Použij Network Volume (výše) pro uložení modelu

### Out of Memory (OOM) chyba

```
CUDA out of memory
```

Řešení:
- Vyber větší GPU (L40S místo RTX 4090)
- Snižuj `max_model_len` v vLLM
- Použij quantizaci (AWQ, GPTQ): `--quantization awq`
- Sniž `gpu-memory-utilization` na 0.8

### API Endpoint není dostupný

```
Connection refused / 404 Not Found
```

Řešení:
- Ověř, že Pod je stav "Running"
- Zkontroluj, že URL je správná (bez tečky na konci)
- Pověř timeout (server se bootuje, čeká až 2 minuty)

### Vysoké náklady

- Runpod účtuje za každou hodinu provozu (ne za API volání)
- Pokud testy trvají dlouho, zastavuj Pod když ho nepotřebuješ
- Pro vývoj: Используй local setup (ollama, llama.cpp) a Runpod jen pro testy

## Praktický příklad: Chatbot

```python
# chatbot.py - Interaktivní chatbot s Runpod modelem
from openai import OpenAI
import sys

client = OpenAI(
    base_url="https://your-runpod-id.runpod.io/v1/",
    api_key="not-needed"
)

# Paměť konverzace
messages = [
    {"role": "system", "content": "Jsi přátelský český asistent."}
]

print("Chatbot (Runpod + Llama 2) - Napis 'quit' pro exit")
print("-" * 50)

while True:
    user_input = input("Ty: ").strip()
    if user_input.lower() == "quit":
        break

    # Přidat uživatelův vzkaz
    messages.append({"role": "user", "content": user_input})

    # Získat odpověď
    response = client.chat.completions.create(
        model="meta-llama/Llama-2-13b-hf",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )

    # Uložit odpověď do paměti
    assistant_message = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_message})

    print(f"Bot: {assistant_message}\n")
```

Spuštění:
```bash
python chatbot.py
```

## Užitečné zdroje

- **Runpod docs**: https://docs.runpod.io/
- **vLLM OpenAI API**: https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
- **Hugging Face modely**: https://huggingface.co/models

## Viz také

- [vLLM](vllm.md) - Detailní konfigurace vLLM serveru a optimalizace
- [Lokální LLM](llm-local.md) - Alternativy pro lokální inference bez cloudu
