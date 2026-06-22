---
name: pridat-pojem
description: Přidá nový pojem (nebo více pojmů) do Finanční příručky (finance.md). Použij, když uživatel chce vysvětlit a uložit burzovní, akciový, investiční nebo finanční pojem – např. "přidej do finanční příručky: short selling", "co je P/E ratio, ulož to", "vysvětli mi market cap a přidej ho do slovníčku".
---

# Přidání pojmu do Finanční příručky

Tento skill přidává nové pojmy do slovníčku `finance.md` v tomto repozitáři.

## Cíl

Uživatel se postupně dostává do obrazu ve finančním světě. Zadává pojmy, kterým
nerozumí (např. *settle date*, *ETF*, *P/E ratio*), a já je vysvětlím a uložím do
příručky tak, aby je později snadno našel.

## Postup

1. **Zjisti pojmy k přidání.** Z uživatelova zadání vyextrahuj jeden nebo více pojmů.
   Pokud je zadání nejasné, zeptej se, který pojem chce přidat.

2. **Přečti `finance.md`**, abys znal aktuální strukturu sekcí a styl zápisu.
   Existující sekce (mohou se časem měnit – řiď se aktuálním stavem souboru):
   - Základní pojmy
   - Typy cenných papírů
   - Obchodování a vypořádání
   - Oceňování portfolia
   - Poplatky
   - Daně a měny

3. **Pro každý pojem napiš srozumitelné vysvětlení** podle stylu příručky:
   - Nadpis `### Český název (Anglický termín)` – pokud má pojem ustálený anglický
     název, uveď ho v závorce.
   - Krátké, lidsky srozumitelné vysvětlení (cílem je dostat se do obrazu, ne
     akademická přesnost).
   - Kde to pomůže: **praktický příklad** nebo dopad na běžného investora.
   - Pokud je užitečné, použij odrážky (`-`) pro rozlišení variant/podtypů.
   - Piš česky, formálně, s plnou diakritikou.

4. **Zařaď pojem do správné sekce.** Vyber tematicky nejbližší existující sekci.
   - Pokud žádná sekce nesedí, **založ novou sekci** (`## Název sekce`) a přidej ji
     i do obsahu (seznam `## Obsah` na začátku souboru) jako odkaz.
   - Pojmy v rámci sekce drž v logickém pořadí (od základních ke specifickým).

5. **Použij šablonu** ze zakomentované části na konci `finance.md`:
   ```markdown
   ### Název pojmu (Anglický termín)
   Stručné a srozumitelné vysvětlení, jak to funguje. Případně příklad.
   ```

6. **Aktualizuj obsah**, pokud jsi přidal novou sekci (kotvy odkazů v sekci `## Obsah`).

7. **U daňových/právních pojmů** přidej upozornění, že jde o obecnou informaci, ne
   o daňové/právní poradenství, a že se pravidla mění.

8. **Commit a push.** Podle pravidel repozitáře (CLAUDE.md) po dokončení změn
   automaticky:
   ```bash
   git add . && git commit -m "Přidán pojem do finanční příručky: <pojem>" && git push
   ```
   Výjimka: pokud uživatel řekne „bez commitu" / „don't commit".

## Zásady

- **Nepřidávej nic navíc** nad rámec zadaných pojmů (řiď se globálními pravidly).
- Pokud si vysvětlením nejsi jistý, **přiznej nejistotu** místo vymýšlení.
- Nepřepisuj existující pojmy, pokud o to uživatel nepožádá – jen přidávej.
- Zachovej existující formátování a styl souboru.
