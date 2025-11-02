# vLLM

vLLM je inferenční engine určený pro efektivní spouštění velkých jazykových modelů s vysokou propustností a nízkou latencí. Je ideální pro produkční nasazení, kde potřebujete obsloužit více uživatelů současně.

## Co je vLLM a proč ho používat

vLLM optimalizuje inference pomocí techniky **PagedAttention**, která chytře spravuje KV cache (Key-Value paměť) a snižuje fragmentaci. Výsledkem je:
- Více souběžných požadavků na stejném hardwaru
- Efektivnější využití GPU paměti
- Nižší latence a vyšší propustnost
- Podpora OpenAI-kompatibilního API

Jednoduše: vLLM umožňuje obsloužit více uživatelů najednou se stejným hardwarem.

## Instalace

### Základní instalace

```bash
# Vytvořit Python prostředí (3.10+)
python -m venv vllm-env
source vllm-env/bin/activate  # Linux/Mac
# nebo na Windows: vllm-env\Scripts\activate

# Instalace vLLM
pip install vllm
```

### S podporou Hugging Face modelů

```bash
# Nastavit HF_TOKEN pro autenticizaci
export HF_TOKEN=your_token_here

# Přihlášení do Hugging Face CLI
huggingface-cli login
```

## Testování lokálně

Před spuštěním serveru si ověřte, že vLLM funguje offline:

```python
# test_vllm.py
from vllm import LLM

# Zadat malý model (např. 7B parametrů)
llm = LLM(model="meta-llama/Llama-2-7b-hf")
outputs = llm.generate(["Ahoj, jak se máš?"])
print(outputs[0].outputs[0].text)
```

**Tipy při testování:**
- Pokud chybí paměť (OOM): zkusit menší model nebo snížit dtype (float16, int8)
- Na CPU bude pomalé, ale je to k otestování funkcionality

## Spuštění OpenAI-kompatibilního serveru

```bash
# Spustit server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-7b-hf \
  --port 8000 \
  --api-key local-key-123
```

Nyní server poslouchá na `http://localhost:8000/v1`

## Komunikace se serverem

Jakmile server běží, lze používat standardní OpenAI klient:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="local-key-123"
)

# Chat completions
response = client.chat.completions.create(
    model="meta-llama/Llama-2-7b-hf",
    messages=[
        {"role": "user", "content": "Ahoj, jaký je tvůj oblíbený jazyk?"}
    ],
    temperature=0.7,
    max_tokens=100,
    stream=False
)

print(response.choices[0].message.content)
```

## Optimalizace výkonu

### Dávkování (Batching)

vLLM vyniká při dávkování - odesílání více požadavků najednou:

```python
# Dávka požadavků pro vyšší propustnost
responses = client.chat.completions.create(
    model="...",
    messages=[...],
    # VLLM bude dávkovat interně
)
```

### Klíčové parametry pro ladění

| Parametr | Vliv | Poznámka |
|----------|------|---------|
| `max_tokens` | Latence, paměť | Konzervativně nastavit; dlouhé výstupy zpomalují |
| `temperature` | Kreativita | 0 = deterministické, 0.7 = vyváženě |
| `dtype` | Paměť | float16 nebo int8 pro menší modely |
| `tensor-parallel-size` | Víc GPU | Rozprostřít model mezi více GPU zařízení |

### Memory a KV Cache

```bash
# Omezit maximální délku kontextu
python -m vllm.entrypoints.openai.api_server \
  --model llama-7b \
  --max-seq-len 2048 \
  --gpu-memory-utilization 0.9
```

### Kvantizace

Pro omezené GPU RAM:

```bash
# 4-bit kvantizace (pokud je podpořena)
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-7b-hf \
  --quantization awq  # nebo gptq, gguf, amd
```

## Streamování

Streamování vrací tokeny postupně - čímž se zlepšuje UX:

```python
response = client.chat.completions.create(
    model="...",
    messages=[...],
    stream=True  # Povolit streamování
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

## Bezpečnost a zábrany

### Validace vstupu

```python
def validate_input(user_input):
    # Odebrat nebezpečné znaky
    if len(user_input) > 10000:
        raise ValueError("Vstup příliš dlouhý")
    return user_input.strip()
```

### Nastavení promptu

```python
# Systémový prompt - krátký a jasný
system_prompt = """
Jsi užitečný asistent. Odpovídej v češtině.
- Buď přesný a stručný
- Pokud neznáš odpověď, řekni to
"""
```

## Spolehlivost v produkci

### Health checks

```bash
# Serverový health check endpoint
curl http://localhost:8000/health
```

### Timeouty

- **Server timeout**: 60-120 sekund pro generování
- **Klient timeout**: O chlup delší než server timeout

### Metriky k monitorování

- **Tokeny/s**: Propustnost modelu
- **Queue length**: Počet čekajících požadavků
- **GPU memory**: Fragmentace a využití
- **P50/P95 latence**: Percentily latency
- **Chybovost**: % selhavších požadavků

```python
# Příklad logování
import time
start = time.time()
response = client.chat.completions.create(...)
latency = time.time() - start
print(f"Latence: {latency:.2f}s")
```

## Běžné chyby a řešení

| Chyba | Příčina | Řešení |
|-------|--------|--------|
| **CUDA out of memory** | Model příliš velký | Menší model, kvantizace, nižší batch size |
| **Model not found** | Chybné jméno/autentizace | Zkontrolovat HF_TOKEN, název modelu |
| **Pomalá první generace** | "Zahřívání" | Poslat malý warmup prompt periodicky |
| **Timeout** | Přetížený server | Snížit max_tokens, zvýšit tensor-parallel-size |

## Produkční nasazení

### Dockerizace

```dockerfile
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Připnout verze pro reprodukovatelnost
RUN pip install vllm==0.3.3

EXPOSE 8000
CMD ["python", "-m", "vllm.entrypoints.openai.api_server", ...]
```

### Orchestrace

```bash
# Kubernetes deployment (příklad)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-server
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: vllm
        image: my-vllm:latest
        resources:
          limits:
            nvidia.com/gpu: 1  # Přidělit GPU
```

### Monitorování

- Sbírat metriky (tokeny/s, queue length, GPU memory)
- Odesílat logy na centrální úložiště
- Nastavit alerting na anomálie

## Užitečné参数 serveru

```bash
python -m vllm.entrypoints.openai.api_server \
  --model <model_name> \
  --port 8000 \
  --api-key my-key \
  --max-model-len 4096 \                    # Max délka kontextu
  --gpu-memory-utilization 0.9 \            # Využití GPU (0.0-1.0)
  --dtype float16 \                         # Datový typ
  --tensor-parallel-size 1 \                # Počet GPU pro paralelismus
  --pipeline-parallel-size 1 \              # Verze pipeline paralelismu
  --enable-lora \                           # Podpora LoRA adaptérů
  --enforce-eager \                         # Eagerly compile
  --disable-log-requests                    # Vypnout logování požadavků
```

## Tipy z praxe

1. **Začít malý**: Testovat lokálně s 7B modelem před nasazením 70B
2. **Dávkovat**: Vždy dávkovat požadavky pro nejlepší propustnost
3. **Streamovat**: Zvyšuje vnímání rychlosti aplikace
4. **Měřit**: Bez metrik nemůžete optimalizovat
5. **Škálovat postupně**: Nejdřív měřit reálný provoz, pak škálovat
6. **Archivovat modely**: Připnout konkrétní verze modelů a CUDA ovladačů
7. **Health checky**: Pravidelně ověřovat zdraví serveru

## Zdroje

- [Oficiální vLLM dokumentace](https://docs.vllm.ai/)
- [GitHub репо](https://github.com/vllm-project/vllm)
- [Hugging Face Models](https://huggingface.co/models)
- [OpenAI API kompatibilita](https://docs.vllm.ai/en/latest/getting_started/installation.html)
