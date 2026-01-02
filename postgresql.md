---
layout: default
title: PostgreSQL
parent: Vývojové nástroje
nav_order: 5
---

# PostgreSQL

## Základní příkazy

### Připojení a základní operace

```bash
# Připojení k databázi
psql -h localhost -U postgres -d mydb        # Připojení k databázi mydb
psql "postgresql://user:pass@host:5432/db"   # Připojení pomocí connection string

# psql meta příkazy (uvnitř psql shellu)
\l                    # Výpis všech databází
\c mydb               # Přepnutí na databázi mydb
\dt                   # Výpis všech tabulek v aktuálním schématu
\dt+                  # Výpis tabulek s velikostí a popisem
\d+ table_name        # Detail struktury tabulky včetně indexů
\dn                   # Výpis všech schémat
\du                   # Výpis všech uživatelů/rolí
\di                   # Výpis všech indexů
\df                   # Výpis všech funkcí
\x                    # Přepnutí na rozšířený (vertikální) výstup
\timing               # Zapnutí měření času dotazů
\q                    # Ukončení psql
```

### Správa databází a uživatelů

```sql
-- Vytvoření databáze
CREATE DATABASE mydb;                                    -- Nová databáze
CREATE DATABASE mydb OWNER myuser ENCODING 'UTF8';       -- S vlastníkem a kódováním

-- Vytvoření uživatele/role
CREATE USER myuser WITH PASSWORD 'secret';               -- Nový uživatel
CREATE ROLE myrole WITH LOGIN PASSWORD 'secret';         -- Role s možností přihlášení
ALTER USER myuser WITH SUPERUSER;                        -- Udělení superuser práv

-- Oprávnění
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;         -- Všechna práva k databázi
GRANT SELECT, INSERT ON TABLE mytable TO myuser;         -- Konkrétní práva k tabulce
GRANT USAGE ON SCHEMA public TO myuser;                  -- Právo používat schéma
REVOKE ALL ON TABLE mytable FROM myuser;                 -- Odebrání práv
```

### Docker spuštění

```bash
# Základní spuštění PostgreSQL v Dockeru
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_USER=admin \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Docker Compose příklad
```

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    environment:
      POSTGRES_USER: admin           # Uživatelské jméno
      POSTGRES_PASSWORD: secret      # Heslo (změnit v produkci!)
      POSTGRES_DB: mydb              # Výchozí databáze
    ports:
      - "5432:5432"                   # Mapování portu
    volumes:
      - postgres_data:/var/lib/postgresql/data   # Perzistence dat
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Inicializační skripty

volumes:
  postgres_data:
```

## Užitečné dotazy

```sql
-- Velikost databáze
SELECT pg_size_pretty(pg_database_size('mydb'));

-- Velikost tabulky
SELECT pg_size_pretty(pg_total_relation_size('mytable'));

-- Top 10 největších tabulek
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
LIMIT 10;

-- Aktivní spojení
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE state = 'active';

-- Ukončení spojení
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mydb';

-- Běžící dotazy a jejich délka
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Zálohování a obnova

```bash
# Záloha celé databáze do SQL souboru
pg_dump -h localhost -U postgres mydb > backup.sql

# Záloha do komprimovaného custom formátu (doporučeno)
pg_dump -h localhost -U postgres -Fc mydb > backup.dump

# Záloha pouze struktury (bez dat)
pg_dump -h localhost -U postgres --schema-only mydb > schema.sql

# Záloha pouze dat
pg_dump -h localhost -U postgres --data-only mydb > data.sql

# Obnova z SQL souboru
psql -h localhost -U postgres mydb < backup.sql

# Obnova z custom formátu (podporuje paralelní restore)
pg_restore -h localhost -U postgres -d mydb -j 4 backup.dump  # 4 paralelní joby

# Záloha všech databází
pg_dumpall -h localhost -U postgres > all_databases.sql
```

---

## TimescaleDB (časové řady)

TimescaleDB je rozšíření PostgreSQL optimalizované pro práci s časovými řadami (time-series data). Poskytuje automatické partitionování, kompresi a speciální funkce pro časová data.

### Instalace

```bash
# Docker s TimescaleDB
docker run -d \
  --name timescaledb \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -v timescale_data:/var/lib/postgresql/data \
  timescale/timescaledb:latest-pg16

# Nebo v docker-compose.yml
```

```yaml
services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
```

```sql
-- Aktivace rozšíření v databázi
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### Vytvoření hypertable

```sql
-- Vytvoření běžné tabulky
CREATE TABLE sensor_data (
    time        TIMESTAMPTZ NOT NULL,         -- Časové razítko (povinné)
    sensor_id   INTEGER NOT NULL,             -- ID senzoru
    temperature DOUBLE PRECISION,             -- Teplota
    humidity    DOUBLE PRECISION              -- Vlhkost
);

-- Konverze na hypertable (automatické partitionování podle času)
SELECT create_hypertable('sensor_data', 'time');

-- Hypertable s vlastní velikostí chunku (výchozí je 7 dní)
SELECT create_hypertable('sensor_data', 'time', chunk_time_interval => INTERVAL '1 day');

-- Hypertable s partitionováním i podle sensor_id (pro velké množství senzorů)
SELECT create_hypertable('sensor_data', 'time',
    partitioning_column => 'sensor_id',
    number_partitions => 4
);
```

### Vkládání dat

```sql
-- Běžný INSERT
INSERT INTO sensor_data (time, sensor_id, temperature, humidity)
VALUES (NOW(), 1, 22.5, 45.0);

-- Bulk insert (efektivnější)
INSERT INTO sensor_data (time, sensor_id, temperature, humidity)
VALUES
    ('2024-01-01 10:00:00', 1, 21.0, 40.0),
    ('2024-01-01 10:01:00', 1, 21.2, 41.0),
    ('2024-01-01 10:02:00', 1, 21.5, 42.0);

-- COPY pro velké objemy dat (nejrychlejší)
COPY sensor_data FROM '/path/to/data.csv' CSV HEADER;
```

### Dotazování s time_bucket

```sql
-- Průměrná teplota po hodinách
SELECT
    time_bucket('1 hour', time) AS hour,      -- Seskupení do hodinových intervalů
    sensor_id,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp
FROM sensor_data
WHERE time > NOW() - INTERVAL '24 hours'      -- Posledních 24 hodin
GROUP BY hour, sensor_id
ORDER BY hour DESC;

-- Průměr po dnech
SELECT
    time_bucket('1 day', time) AS day,
    AVG(temperature) AS avg_temp
FROM sensor_data
WHERE time > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;

-- První a poslední hodnota v intervalu
SELECT
    time_bucket('1 hour', time) AS hour,
    first(temperature, time) AS first_temp,   -- První hodnota v intervalu
    last(temperature, time) AS last_temp      -- Poslední hodnota v intervalu
FROM sensor_data
GROUP BY hour;
```

### Kontinuální agregace (Continuous Aggregates)

```sql
-- Vytvoření kontinuální agregace (materialized view s automatickou aktualizací)
CREATE MATERIALIZED VIEW sensor_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS hour,
    sensor_id,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp,
    COUNT(*) AS reading_count
FROM sensor_data
GROUP BY hour, sensor_id
WITH NO DATA;  -- Nevytvářet data ihned

-- Naplnění historickými daty
CALL refresh_continuous_aggregate('sensor_hourly', '2024-01-01', '2024-12-31');

-- Nastavení automatické aktualizace
SELECT add_continuous_aggregate_policy('sensor_hourly',
    start_offset => INTERVAL '3 hours',       -- Začít 3 hodiny zpět
    end_offset => INTERVAL '1 hour',          -- Končit 1 hodinu před teď
    schedule_interval => INTERVAL '1 hour'    -- Aktualizovat každou hodinu
);

-- Dotaz na kontinuální agregaci (velmi rychlý)
SELECT * FROM sensor_hourly
WHERE hour > NOW() - INTERVAL '7 days'
ORDER BY hour DESC;
```

### Komprese dat

```sql
-- Povolení komprese na hypertable
ALTER TABLE sensor_data SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'sensor_id',     -- Segmentace podle senzoru
    timescaledb.compress_orderby = 'time DESC'        -- Řazení v komprimovaném segmentu
);

-- Ruční komprese starších chunků
SELECT compress_chunk(c)
FROM show_chunks('sensor_data', older_than => INTERVAL '7 days') c;

-- Automatická komprese (policy)
SELECT add_compression_policy('sensor_data', INTERVAL '7 days');

-- Zobrazení kompresních statistik
SELECT
    chunk_name,
    before_compression_total_bytes,
    after_compression_total_bytes,
    compression_ratio
FROM chunk_compression_stats('sensor_data');
```

### Retence dat (automatické mazání)

```sql
-- Automatické mazání dat starších než 90 dní
SELECT add_retention_policy('sensor_data', INTERVAL '90 days');

-- Ruční smazání starých chunků
SELECT drop_chunks('sensor_data', older_than => INTERVAL '90 days');

-- Zobrazení všech chunků
SELECT show_chunks('sensor_data');

-- Zobrazení politik
SELECT * FROM timescaledb_information.jobs;
```

---

## pgvector (vektorové embeddingy)

pgvector je rozšíření pro ukládání a vyhledávání vektorových embeddingů přímo v PostgreSQL. Ideální pro:
- Sémantické vyhledávání
- Doporučovací systémy
- RAG (Retrieval Augmented Generation) pro LLM
- Similarity search

### Instalace

```bash
# Docker s pgvector
docker run -d \
  --name postgres-pgvector \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -v pgvector_data:/var/lib/postgresql/data \
  pgvector/pgvector:pg16

# Nebo použít oficiální postgres a doinstalovat pgvector
```

```yaml
# docker-compose.yml s pgvector
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgvector_data:/var/lib/postgresql/data
```

```sql
-- Aktivace rozšíření
CREATE EXTENSION IF NOT EXISTS vector;
```

### Vytvoření tabulky s vektory

```sql
-- Tabulka pro ukládání dokumentů s embeddingy
CREATE TABLE documents (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    embedding   vector(1536),           -- Dimenze závisí na modelu (OpenAI ada-002 = 1536)
    metadata    JSONB,                  -- Volitelná metadata
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabulka pro menší embeddingy (např. sentence-transformers = 384)
CREATE TABLE sentences (
    id          SERIAL PRIMARY KEY,
    text        TEXT NOT NULL,
    embedding   vector(384)             -- Menší dimenze = rychlejší vyhledávání
);
```

### Vkládání embeddingů

```sql
-- Vložení dokumentu s embeddingem
INSERT INTO documents (title, content, embedding, metadata)
VALUES (
    'Úvod do PostgreSQL',
    'PostgreSQL je výkonná open-source relační databáze...',
    '[0.1, 0.2, 0.3, ...]'::vector,     -- Vektor jako string s hranatými závorkami
    '{"category": "database", "lang": "cs"}'
);

-- Vložení z aplikace (Python příklad)
-- embedding = openai.embeddings.create(input=text, model="text-embedding-ada-002")
-- cursor.execute("INSERT INTO documents (content, embedding) VALUES (%s, %s)",
--                (text, embedding.data[0].embedding))
```

### Vyhledávání podobných dokumentů

```sql
-- Nearest neighbor search pomocí L2 distance (Euclidean)
SELECT id, title, content,
       embedding <-> '[0.1, 0.2, 0.3, ...]'::vector AS distance   -- <-> = L2 distance
FROM documents
ORDER BY distance
LIMIT 5;

-- Cosine similarity (doporučeno pro textové embeddingy)
SELECT id, title, content,
       1 - (embedding <=> '[0.1, 0.2, 0.3, ...]'::vector) AS similarity  -- <=> = cosine distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;

-- Inner product (pro normalizované vektory)
SELECT id, title,
       embedding <#> '[0.1, 0.2, 0.3, ...]'::vector AS neg_inner_product  -- <#> = negative inner product
FROM documents
ORDER BY embedding <#> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 5;

-- Filtrování + similarity search
SELECT id, title, content,
       1 - (embedding <=> '[0.1, 0.2, 0.3, ...]'::vector) AS similarity
FROM documents
WHERE metadata->>'category' = 'database'    -- Filtr podle metadat
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY embedding <=> '[0.1, 0.2, 0.3, ...]'::vector
LIMIT 10;
```

### Indexování pro rychlé vyhledávání

```sql
-- IVFFlat index (rychlejší build, vhodný pro < 1M vektorů)
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)  -- Pro cosine similarity
WITH (lists = 100);                          -- Počet listů (sqrt(počet_řádků))

-- IVFFlat pro L2 distance
CREATE INDEX ON documents
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- HNSW index (pomalejší build, lepší recall, vhodný pro velké datasety)
CREATE INDEX ON documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);         -- m = max connections, ef = build quality

-- HNSW pro L2 distance
CREATE INDEX ON documents
USING hnsw (embedding vector_l2_ops)
WITH (m = 16, ef_construction = 64);

-- Nastavení probes pro IVFFlat (trade-off rychlost vs přesnost)
SET ivfflat.probes = 10;  -- Výchozí je 1, vyšší = přesnější ale pomalejší

-- Nastavení ef_search pro HNSW
SET hnsw.ef_search = 40;  -- Výchozí je 40, vyšší = přesnější
```

### Praktický příklad: RAG systém

```sql
-- Tabulka pro knowledge base
CREATE TABLE knowledge_base (
    id          SERIAL PRIMARY KEY,
    source      TEXT NOT NULL,              -- Zdroj dokumentu (URL, název souboru)
    chunk_index INTEGER NOT NULL,           -- Pořadí chunku v dokumentu
    content     TEXT NOT NULL,              -- Text chunku
    embedding   vector(1536),               -- OpenAI embedding
    tokens      INTEGER,                    -- Počet tokenů
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychlé vyhledávání
CREATE INDEX knowledge_base_embedding_idx
ON knowledge_base
USING hnsw (embedding vector_cosine_ops);

-- Funkce pro vyhledání relevantního kontextu
CREATE OR REPLACE FUNCTION search_knowledge_base(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id INTEGER,
    source TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.source,
        kb.content,
        1 - (kb.embedding <=> query_embedding) AS similarity
    FROM knowledge_base kb
    WHERE 1 - (kb.embedding <=> query_embedding) > similarity_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Použití funkce
SELECT * FROM search_knowledge_base(
    '[0.1, 0.2, ...]'::vector,  -- Query embedding
    5,                           -- Top 5 výsledků
    0.75                         -- Min similarity 75%
);
```

### Kombinace TimescaleDB + pgvector

```sql
-- Oba rozšíření lze kombinovat
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;

-- Časové řady embeddingů (např. sentiment analýza v čase)
CREATE TABLE tweet_embeddings (
    time        TIMESTAMPTZ NOT NULL,
    tweet_id    BIGINT NOT NULL,
    user_id     INTEGER NOT NULL,
    content     TEXT,
    embedding   vector(384),              -- Sentence transformer embedding
    sentiment   FLOAT                      -- Sentiment skóre
);

-- Konverze na hypertable
SELECT create_hypertable('tweet_embeddings', 'time');

-- Vyhledání podobných tweetů v časovém rozmezí
SELECT
    time,
    content,
    1 - (embedding <=> '[...]'::vector) AS similarity
FROM tweet_embeddings
WHERE time > NOW() - INTERVAL '7 days'
ORDER BY embedding <=> '[...]'::vector
LIMIT 10;
```

## C# / .NET integrace

### Npgsql s pgvector

```csharp
// NuGet: Npgsql, Npgsql.EntityFrameworkCore.PostgreSQL, Pgvector, Pgvector.EntityFrameworkCore

using Npgsql;
using Pgvector;
using Pgvector.Npgsql;

// Registrace pgvector typu
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.UseVector();  // Povolení pgvector podpory
var dataSource = dataSourceBuilder.Build();

// Vložení dokumentu s embeddingem
await using var cmd = dataSource.CreateCommand(
    "INSERT INTO documents (content, embedding) VALUES ($1, $2)");
cmd.Parameters.AddWithValue("Obsah dokumentu...");
cmd.Parameters.AddWithValue(new Vector(new float[] { 0.1f, 0.2f, 0.3f }));  // Embedding
await cmd.ExecuteNonQueryAsync();

// Vyhledání podobných dokumentů
await using var searchCmd = dataSource.CreateCommand(@"
    SELECT id, content, 1 - (embedding <=> $1) AS similarity
    FROM documents
    ORDER BY embedding <=> $1
    LIMIT 5");
searchCmd.Parameters.AddWithValue(new Vector(queryEmbedding));  // Query embedding

await using var reader = await searchCmd.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    Console.WriteLine($"ID: {reader.GetInt32(0)}, Similarity: {reader.GetFloat(2):P}");
}
```

### Entity Framework Core s pgvector

```csharp
// DbContext konfigurace
public class AppDbContext : DbContext
{
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(connectionString, o => o.UseVector());
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<Document>()
            .Property(d => d.Embedding)
            .HasColumnType("vector(1536)");  // Dimenze embeddingu

        // HNSW index
        modelBuilder.Entity<Document>()
            .HasIndex(d => d.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");
    }
}

// Entita
public class Document
{
    public int Id { get; set; }
    public string Content { get; set; } = "";
    public Vector? Embedding { get; set; }
}

// Použití
var queryEmbedding = new Vector(new float[] { 0.1f, 0.2f, ... });

var results = await context.Documents
    .OrderBy(d => d.Embedding!.CosineDistance(queryEmbedding))  // Cosine distance
    .Take(5)
    .Select(d => new { d.Id, d.Content })
    .ToListAsync();
```
