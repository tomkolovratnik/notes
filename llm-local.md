---
layout: default
title: Lokální LLM
nav_order: 11
---

# Lokální LLM Inference

Poznámky k nasazení lokálních inference serverů pro LLM modely bez Pythonu, s podporou CUDA akcelerace.

## Řešení bez Pythonu

### 1. llama.cpp - llama-server (doporučeno)

Čisté CLI řešení, portabilní EXE + GGUF model, OpenAI-kompatibilní API.

**Předpoklady:**
- NVIDIA driver + CUDA Toolkit 12.x
- Visual Studio 2022 (nebo Build Tools) s "Desktop development with C++"

**Stažení zdrojáků:**
```bash
# Stáhnout ZIP z https://github.com/ggml-org/llama.cpp
# Rozbalit do C:\llama.cpp (bez diakritiky v cestě)
```

**Build z lokálních zdrojů:**
```cmd
cd C:\llama.cpp

# Konfigurace CMake projektu s CUDA podporou
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 ^
  -DGGML_CUDA=ON ^        # Zapnout CUDA backend
  -DLLAMA_SERVER=ON       # Buildovat llama-server executable

# Build Release verze (paralelní kompilace)
cmake --build build --config Release -j
```

**Výsledná binárka:**
```
C:\llama.cpp\build\bin\Release\llama-server.exe
```

**Spuštění serveru:**
```cmd
.\build\bin\Release\llama-server.exe ^
  -m .\models\model.gguf ^           # Cesta k GGUF modelu
  --host 0.0.0.0 ^                   # Poslouchat na všech rozhraních
  --port 8080 ^                      # Port serveru
  --gpu-layers 999 ^                 # Počet vrstev ve VRAM (999 = co se vejde)
  --alias local ^                    # Alias modelu pro API
  --ctx-size 4096 ^                  # Velikost kontextu
  --threads 8                        # Počet CPU vláken (= fyzická jádra)
```

**Užitečné parametry:**
- `--list-devices` - Vypsat dostupná GPU zařízení
- `-ngl` nebo `--n-gpu-layers` - Alias pro `--gpu-layers`
- `--verbose` - Detailní logging

**Test OpenAI API endpointu:**
```cmd
curl http://localhost:8080/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"local\",\"messages\":[{\"role\":\"user\",\"content\":\"Řekni ahoj\"}]}"
```

**Poznámky:**
- Server poskytuje OpenAI-kompatibilní API (`/v1/chat/completions`, `/v1/embeddings`)
- V logu kontroluj: "offloaded N layers to GPU"
- Bez admin práv, přenositelné

---

### 2. KoboldCpp

Single-file executable, CUDA i Vulkan, vestavěné UI i API.

**Předpoklady pro build:**
- Visual Studio 2022 (nebo Build Tools) s "Desktop development with C++"
- CUDA Toolkit 12.x (pro CUDA podporu)
- Git (pro klonování repozitáře) nebo stažení ZIP

**Build ze zdrojáků:**
```cmd
# Stáhnout ZIP z https://github.com/LostRuins/koboldcpp
# Rozbalit do C:\koboldcpp

cd C:\koboldcpp

# Build s CUDA podporou (Windows, MSVC)
# Otevřít "x64 Native Tools Command Prompt for VS 2022"

# Varianta A: Make s CUDA (pokud máš make)
make LLAMA_CUDA=1

# Varianta B: Visual Studio projekt
# Otevřít koboldcpp.sln ve VS 2022
# Nastavit Release + x64
# Build -> Build Solution (Ctrl+Shift+B)

# Varianta C: CMake build (alternativa)
cmake -B build -DLLAMA_CUBLAS=ON       # Konfigurace s CUDA
cmake --build build --config Release   # Build Release verze
```

**Výsledná binárka:**
- `koboldcpp.exe` v root složce projektu (Make)
- `x64\Release\koboldcpp.exe` (Visual Studio)
- `build\bin\koboldcpp.exe` (CMake)

**Spuštění:**
```cmd
koboldcpp.exe ^
  --usecuda ^              # Použít CUDA akceleraci
  --gpulayers 100 ^        # Počet vrstev na GPU
  --model .\model.gguf ^   # Cesta k modelu
  --port 5001 ^            # Port serveru (default 5001)
  --host 0.0.0.0 ^         # Poslouchat na všech rozhraních
  --threads 8 ^            # Počet CPU vláken
  --contextsize 4096       # Velikost kontextu
```

**Dodatečné parametry:**
- `--blasbatchsize 512` - Batch size pro BLAS operace (vliv na rychlost)
- `--highpriority` - Vyšší priorita procesu
- `--usevulkan` - Použít Vulkan místo CUDA (fallback pro non-NVIDIA)

**Endpointy:**
- GUI: `http://localhost:5001`
- OpenAI API: `http://localhost:5001/v1/chat/completions`
- KoboldAI API: `http://localhost:5001/api/v1/generate`

**Poznámky:**
- Build s CUDA je jednodušší než llama.cpp (méně závislostí)
- Podporuje Vulkan jako fallback (i bez NVIDIA GPU)
- Hodí se pro omezená uživatelská oprávnění
- Výsledný EXE je portabilní (stačí NVIDIA driver na cílovém stroji)

---

### 3. LM Studio

GUI aplikace s lokálním OpenAI-kompatibilním serverem na `http://localhost:1234/v1`.

- CUDA akcelerace automaticky (nové verze)
- Nejjednodušší řešení s GUI
- Vyžaduje instalaci (může být problém na zamčených stanicích)

---

### 4. LLamaSharp (C# knihovna)

Přímé použití llama.cpp z C# aplikace bez externího serveru.

**NuGet balíčky:**
```bash
dotnet add package LLamaSharp
dotnet add package LLamaSharp.Backend.Cuda12  # Pro NVIDIA GPU
```

**Minimální příklad (ASP.NET Core API):**
```csharp
using LLama;
using LLama.Common;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Načtení modelu s CUDA
var parameters = new ModelParams("model.gguf")
{
    GpuLayerCount = 35,  // Počet vrstev na GPU
    Threads = 8
};

var model = LLamaWeights.LoadFromFile(parameters);
var context = model.CreateContext(parameters);
var executor = new InteractiveExecutor(context);

// Endpoint kompatibilní s OpenAI /v1/chat/completions
app.MapPost("/v1/chat/completions", async (HttpContext ctx) =>
{
    // Implementace inference...
});

app.Run();
```

**Poznámky:**
- Wrapper nad llama.cpp
- Pro CUDA 12.x použít `Cuda12` backend
- Možnost vlastní ASP.NET Core API implementace

---

## Build bez možnosti stahování EXE

Pokud nelze stahovat předkompilované binárky:

1. **Přenos zdrojáků** - Stáhnout ZIP repa jako text/archiv (obvykle není blokován)
2. **Build na místě** - Použít Visual Studio cmd tools (výše)
3. **Přenos z jiné stanice** - Buildnout na povolené stanici, přenést `llama-server.exe` (USB/síť)

**Závislosti běhového prostředí:**
- NVIDIA driver (musí být)
- CUDA runtime (pokud build linkuje dynamicky)
- Žádné admin oprávnění pro běh serveru

---

## Srovnání řešení

| Řešení | Portabilita | GPU podpora | API | GUI | Instalace |
|--------|-------------|-------------|-----|-----|-----------|
| llama-server | ⭐⭐⭐ | CUDA, ROCm, Vulkan | OpenAI | ❌ | Build/EXE |
| KoboldCpp | ⭐⭐⭐ | CUDA, Vulkan | OpenAI + vlastní | ✅ | Single EXE |
| LM Studio | ⭐⭐ | CUDA | OpenAI | ✅ | Instalátor |
| LLamaSharp | ⭐⭐ | CUDA | Vlastní impl. | ❌ | NuGet |

**Doporučení pro omezené prostředí:**
- **llama-server** - nejčistší CLI řešení, žádné závislosti
- **KoboldCpp** - pokud potřeba GUI + API v jednom

---

## Odkazy

- [llama.cpp GitHub](https://github.com/ggml-org/llama.cpp)
- [KoboldCpp GitHub](https://github.com/LostRuins/koboldcpp)
- [LLamaSharp GitHub](https://github.com/SciSharp/LLamaSharp)
- [LM Studio](https://lmstudio.ai/)
