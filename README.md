# Vad kostar soppan?

En liten statisk webbapp som ska besvara två frågor så snabbt som möjligt:

1. Vad kostar en **typisk tankning på 40 liter**?
2. Vad skulle samma tankning kosta i ett valt **partiscenario**, när det finns tillräckligt kvantifierat underlag?

## Produktprincip

Sidan är medvetet minimalistisk. Besökaren väljer:

- Bensin 95, Bensin 98, diesel eller E85
- Hela Sverige eller län
- Parti

Därefter visas tankkostnaden, kostnadsdelarna och partiscenariot.

När ett parti inte har publicerat tillräckligt exakta nivåer visas inget konstruerat pris.

## Kostnadsmodell

För vald pumpprisreferens räknas:

```
pris före moms = pumppris / (1 + momssats)
marknad + kedja = pris före moms - energiskatt - koldioxidskatt
skatt + moms = energiskatt + koldioxidskatt + moms
tankkostnad = pumppris × 40 liter
```

`marknad + kedja` är en restpost och ska inte beskrivas som ren vinst.

## Filer

- `index.html` – sidans markup
- `style.css` – all publik styling
- `script.js` – state, beräkning och rendering
- `fuel-data.js` – skattesatser och appinställningar
- `county-data.js` – rikssnitt och länspriser
- `policy-data.js` – partiscenarier och källor
- `404.html` – felsida
- `qa.mjs` – zero-dependency statisk QA
- `wrangler.jsonc` – Cloudflare Workers Static Assets

## Kvalitetsregler

- 21 län ska finnas.
- Alla prisvärden ska vara numeriska.
- Skattesatser ska ha källor.
- Alla åtta riksdagspartier ska finnas i datalagret.
- Exakt partipris visas endast för modeller som är kvantifierbara.
- Marknadsrestposten får aldrig bli negativ.
- Den publika sidan ska inte ladda gamla experimentella datafiler eller PWA-lager.

## QA

```bash
npm run qa
```

QA körs även automatiskt via GitHub Actions på push till `main`.

## Publicering

Projektet publiceras som statiska assets via Cloudflare Workers från `main`.

Aktuell applikationsversion: **0.24.0**.


## Dataautomatik

- Läns- och rikssnitt uppdateras automatiskt från Carculated/bensinpriser.nu via `scripts/update-price-data.mjs`.
- GitHub Actions kör prisuppdateringen var sjätte timme och committar endast när data ändras.
- Skattesatser lagras som giltighetsperioder och rätt period väljs automatiskt efter svenskt datum.
- QA stoppar publicering om länspriserna blir mer än tre dagar gamla eller om dagens datum saknar giltig skatteperiod.
- Partidata har verifieringsdatum och evidenstyp. Exakt pris visas bara för kvantifierbara modeller.
- Officiella partikällor bevakas automatiskt utan att politiska uppgifter ändras automatiskt.
- Ambitionen är att prioritera öppna, kostnadsfria och officiella källor där de ger tillräcklig aktualitet och detaljnivå.


## Fas 2 – datakvalitet och autonom drift

- Källstrategi: officiell och kostnadsfri källa prioriteras.
- Officiella myndighetskällor bevakas för innehållsförändringar.
- Politiska källor bevakas separat och ändrar aldrig sakuppgifter automatiskt.
- Data health kontrollerar färskhet, länstäckning, skatteperioder, källbevakning och extrema prisavvikelser.
- Prisavvikelser över 20 % från rikssnitt flaggas för kontroll men skrivs inte automatiskt över.
- Källregistret dokumenterar ursprung, kostnad, automationsnivå och tillitsnivå.
- GitHub Actions kör hälsokontrollen var sjätte timme.

## Fas 3 – prishistorik

- Dagliga prisögonblick sparas automatiskt i `data/price-history.json`.
- Samma datum uppdateras i stället för att dupliceras.
- Historiken hålls till maximalt 730 dagar.
- QA kontrollerar datumordning, dubbletter och att alla fyra rikssnitt finns.
- Historiken är grunden för förändring över 7/30 dagar utan att belasta huvudvyn.

## Marknadsdata

- USD/SEK hämtas från Riksbankens officiella API och hålls separat från observerat pumppris.
- Reduktionsplikten lagras som utsläppsreduktionskrav med giltighetsperioder och tolkas aldrig som direkt volymandel biodrivmedel.
- ARA/Rotterdam får inte ersättas med Brent/råolja. Raffinerad spotreferens kopplas först in när en metodmässigt och licensmässigt användbar källa finns.
- Marknadsdata får inte påverka den publika pumppriskalkylen förrän hela simuleringskedjan är validerad.

## Tvålagers prismodell

Fas 3 skiljer strikt på observerat pumppris och politisk simulering. Det observerade lagret bryter ned faktiskt pumppris. Simuleringslagret fryser marknadsförutsättningar och får endast ändra dokumenterade politiska variabler. Reduktionsplikt behandlas som utsläppsreduktionskrav, inte som direkt volymandel. Marknad + kedja är alltid en härledd restpost och aldrig ett påstående om vinst.
