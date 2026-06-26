---
layout: default
title: Finanční příručka
parent: Finance
nav_order: 1
---

# Finanční příručka – slovníček pojmů

Slovníček pojmů z finančního světa, akcií a burzy. Vysvětlení, jak věci fungují,
psané srozumitelně pro postupné dostávání se do obrazu.

> Postupně sem přidávám pojmy, kterým nerozumím, a jejich vysvětlení.

## Obsah

- [Základní pojmy](#základní-pojmy)
- [Typy cenných papírů](#typy-cenných-papírů)
- [Obchodování a vypořádání](#obchodování-a-vypořádání)
- [Oceňování portfolia](#oceňování-portfolia)
- [Poplatky](#poplatky)
- [Daně a měny](#daně-a-měny)

---

## Základní pojmy

### Cenný papír (Security)
Zastřešující pojem pro obchodovatelné finanční aktivum, které má hodnotu a dá se
koupit/prodat. „Security" je nadřazený pojem – akcie, dluhopisy, ETF i deriváty jsou
všechno cenné papíry (securities).
- **Majetkové (equity)** – představují vlastnický podíl, typicky akcie.
- **Dluhové (debt)** – představují půjčku, typicky dluhopisy.
- **Derivátové** – hodnota odvozená od jiného aktiva (opce, futures).
- Pozor na záměnu: v angličtině má slovo „security" i druhý význam – *zabezpečení*.
  Ve finančním kontextu jde ale o **cenný papír**.

### Akcie (Stock / Share)
Podíl na vlastnictví firmy. Když koupíš akcii, vlastníš malou část společnosti.
- **Cena akcie** se mění podle nabídky a poptávky na burze.
- **Dividenda** – část zisku firmy vyplácená akcionářům (ne všechny firmy vyplácejí).
- **Kapitálový zisk** – zisk z prodeje akcie za vyšší cenu, než za jakou jsi ji koupil.

### Burza (Stock Exchange)
Tržiště, kde se obchodují akcie a další cenné papíry (např. NYSE, NASDAQ, Frankfurt).
Burza páruje nákupní a prodejní příkazy.

### Broker
Zprostředkovatel, přes kterého nakupuješ a prodáváš cenné papíry (např. Interactive
Brokers, Degiro, XTB, Trading212). Broker tvé příkazy posílá na burzu.

### Ticker (symbol)
Krátká zkratka identifikující cenný papír na burze.
- `AAPL` = Apple, `MSFT` = Microsoft, `VWCE` = Vanguard FTSE All-World ETF.

### Likvidita
Jak snadno lze aktivum koupit/prodat bez velkého pohybu ceny. Vysoká likvidita =
hodně kupujících i prodávajících (úzký spread). Nízká likvidita = horší ceny.

### Volatilita
Míra kolísání ceny. Vysoká volatilita = cena hodně skáče (větší riziko i příležitost),
nízká volatilita = cena je stabilnější.

---

## Typy cenných papírů

### ETF (Exchange Traded Fund)
Burzovně obchodovaný fond – jeden cenný papír, který v sobě drží celý koš aktiv
(např. stovky akcií). Koupíš jednu akcii ETF a tím vlastníš podíl na všech firmách
uvnitř.
- **Výhoda:** okamžitá diverzifikace, nízké poplatky, obchoduje se jako akcie.
- **Příklad:** ETF na index S&P 500 drží akcie 500 největších amerických firem.
- **Akumulační (Acc)** – dividendy se automaticky reinvestují zpět do fondu.
- **Distribuční (Dist)** – dividendy ti fond vyplácí na účet.

### Index
Ukazatel výkonnosti skupiny akcií (např. S&P 500, NASDAQ 100, Dow Jones, PX).
Sám o sobě se nedá koupit – ale lze koupit ETF, který index kopíruje.

### Dluhopis (Bond)
Půjčka firmě nebo státu. Ty půjčíš peníze, oni platí úrok (kupón) a na konci
splatnosti vrátí jistinu. Obvykle méně rizikové než akcie.

### Podílový fond (Mutual Fund)
Podobně jako ETF drží koš aktiv, ale neobchoduje se průběžně na burze – nakupuje
se přímo u správce za cenu stanovenou jednou denně (NAV).

### Derivát
Cenný papír, jehož hodnota je odvozena od jiného aktiva (akcie, komodity, měny).
Patří sem opce, futures, CFD. Často pákové = vyšší riziko.

---

## Obchodování a vypořádání

### Settle date (datum vypořádání)
Den, kdy se obchod skutečně fyzicky dokončí – peníze a cenné papíry změní majitele.
- **Trade date** = den, kdy zadáš a zrealizuješ obchod.
- **Settle date** = den, kdy se vypořádá (převedou se akcie a peníze).
- Standard je dnes **T+1** (vypořádání jeden pracovní den po obchodu), dříve T+2.
- Praktický dopad: peníze z prodeje můžeš mít „blokované" do data vypořádání.

### Settlement (vypořádání)
Samotný proces, při kterém se obchod fyzicky dokončí – kupující dostane cenné papíry
a prodávající peníze. Zatímco **settle date** je *den*, kdy k tomu dojde, **settlement**
je *samotná výměna* (vlastní vypořádání obchodu).
- Probíhá na pozadí přes clearingové a depozitní instituce – jako investor to řešit
  nemusíš, broker to zajistí automaticky.
- Než settlement proběhne, obchod je sice uzavřený (na trade date), ale aktivum/peníze
  ještě nejsou definitivně převedené.
- **Praktický dopad:** po prodeji nemusí být peníze hned plně k dispozici k výběru –
  uvolní se až po dokončení vypořádání (např. u T+1 jeden pracovní den po obchodu).

### Clearing (zúčtování)
Mezikrok mezi uzavřením obchodu a jeho vypořádáním (settlement). Clearingová instituce
spočítá, kdo komu co dluží – kolik cenných papírů a peněz si mají strany vzájemně
převést – a zajistí, že obě strany svůj závazek splní.
- **Clearingová instituce (clearinghouse)** stojí mezi kupujícím a prodávajícím a
  garantuje obchod – snižuje riziko, že jedna strana nedodá (tzv. protistranní riziko).
- Typicky probíhá **netting** – vzájemné započtení obchodů, takže se nepřevádí každý
  obchod zvlášť, ale jen výsledný rozdíl.
- **Posloupnost:** obchod (trade) → clearing (zúčtování) → settlement (vypořádání).
- Jako investor s tím nepřijdeš do styku – běží na pozadí, zajišťuje ho broker
  a clearingová instituce.

### Bid / Ask (nákupní / prodejní cena)
- **Bid** – nejvyšší cena, kterou je někdo ochoten zaplatit (za kterou prodáš).
- **Ask** (Offer) – nejnižší cena, za kterou je někdo ochoten prodat (za kterou koupíš).
- **Spread** – rozdíl mezi bid a ask. Menší spread = likvidnější trh.

### Typy příkazů (Orders)
- **Market order** – nákup/prodej okamžitě za aktuální tržní cenu.
- **Limit order** – nákup/prodej jen za stanovenou cenu nebo lepší.
- **Stop loss** – automatický prodej, když cena klesne pod stanovenou hranici (ochrana).
- **Stop limit** – kombinace stopu a limitu.

### Spot vs. Futures
- **Spot** – obchod „na místě", vypořádání hned (aktuální cena).
- **Futures** – dohoda na nákup/prodej v budoucnu za předem danou cenu.

---

## Oceňování portfolia

### Portfolio
Souhrn všech tvých investic (akcie, ETF, dluhopisy, hotovost).

### Jak se oceňuje portfolio
Hodnota portfolia = součet aktuálních tržních hodnot všech pozic.
- **Tržní hodnota pozice** = počet kusů × aktuální cena.
- Cena se bere obvykle jako **poslední uzavírací cena** (close) nebo aktuální cena
  během obchodního dne.
- U zahraničních aktiv se hodnota přepočítává aktuálním **kurzem měny**.

### NAV (Net Asset Value)
Čistá hodnota aktiv fondu na jeden podíl = (hodnota všech aktiv − závazky) ÷ počet
podílů. U podílových fondů se počítá jednou denně.

### Cost basis (pořizovací cena)
Kolik tě pozice stála při nákupu (včetně poplatků). Slouží k výpočtu zisku/ztráty
a daně.

### Unrealized vs. Realized P/L (zisk/ztráta)
- **Unrealized (nerealizovaný)** – zisk/ztráta „na papíře", pozici stále držíš.
- **Realized (realizovaný)** – zisk/ztráta po prodeji, skutečně zaúčtovaný.

### Diverzifikace
Rozložení investic mezi více aktiv/sektorů/regionů, aby pád jednoho neohrozil celek.
„Nedávat všechna vejce do jednoho košíku."

---

## Poplatky

### Typy poplatků
- **Poplatek za obchod (Commission)** – za každý nákup/prodej (fixní nebo % z objemu).
- **Spread** – skrytý „poplatek" daný rozdílem bid/ask.
- **Měnová konverze (FX fee)** – při nákupu v cizí měně (např. EUR/USD).
- **Custody / správa účtu** – poplatek za vedení účtu nebo držení pozic.
- **Poplatek za neaktivitu** – některé brokery účtují, pokud neobchoduješ.

### TER (Total Expense Ratio)
Celková roční nákladovost fondu/ETF v procentech. Strhává se průběžně z hodnoty fondu
(nevidíš ji jako samostatnou položku).
- Příklad: TER 0,20 % = ročně zaplatíš 2 € z každých 1000 € investovaných.
- Nižší TER je lepší – u velkých indexových ETF bývá 0,05–0,25 %.

### Spread jako náklad
I „bezpoplatkový" broker vydělává na spreadu. Vždy zohledni rozdíl mezi cenou nákupu
a okamžitého prodeje.

---

## Daně a měny

### Daň z kapitálových zisků
Daň ze zisku z prodeje cenných papírů. V ČR existuje **časový test** – při splnění
podmínek (typicky držení déle než 3 roky) je prodej osvobozen od daně.

> Daňové podmínky se mění – vždy ověř aktuální pravidla nebo konzultuj s daňovým
> poradcem. Toto není daňové poradenství.

### Dividendová daň
Daň z vyplacených dividend. U zahraničních akcií se často strhává **srážková daň**
v zemi původu (lze řešit smlouvou o zamezení dvojího zdanění).

### FX / kurzové riziko
Pokud investuješ v cizí měně, hodnotu ovlivňuje i pohyb kurzu. I když akcie poroste,
oslabení dané měny vůči CZK může zisk snížit (a naopak).

---

<!--
Šablona pro přidání nového pojmu:

### Název pojmu (Anglický termín)
Stručné a srozumitelné vysvětlení, jak to funguje. Případně příklad.
-->
