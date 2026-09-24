# Vad kostar soppan?

Statisk webbapp för svenska drivmedelspriser. Besökaren väljer bränsle och tankstorlek och får nationellt rikssnitt, kostnadsdelar, prishistorik och källbundna partiscenarier när underlaget är numeriskt tillräckligt.

## Principer

- Endast nationella pumppriser används i den publika kalkylen.
- Pris före skatt och moms är en härledd restpost, inte bensinbolagens vinst.
- E85 får ingen konstruerad fast punktskatt när faktisk blandning saknas.
- Politiska scenarier visar bara dokumenterade numeriska uppgifter; övriga visas utan konstruerat pris.
- Reduktionsplikt behandlas som utsläppsreduktionskrav, inte direkt biodrivmedelsandel.
- ARA/Rotterdam ersätts inte med Brent eller annan råoljeproxy.

## Struktur

- `index.html`, `style.css`, `script.js` – publik frontend.
- `fuel-data.js` – skattesatser och appinställningar.
- `price-data.js` – aktuella nationella pumppriser.
- `policy-data.js` och `data/policy-facts-*.json` – källbundna politiska scenarier/fakta.
- `data/price-history.json` – nationell prishistorik, högst 730 dagar.
- `data/market-*.json` – separata marknadsreferenser.
- `scripts/` – pris-, marknads-, käll- och hälsouppdatering.
- `qa.mjs` och `tests/` – automatiska kontroller.

## Automatik

Prisdata uppdateras var sjätte timme. Marknadsdata från Riksbanken uppdateras på vardagar. Officiella data- och partikällor bevakas separat; en källförändring ändrar aldrig politiska sakuppgifter automatiskt. GitHub Actions kör QA före automatiska datacommittar.

## Drift

Produktionsdriften är självövervakande: prisinhämtning körs var sjätte timme, datahälsa och officiella källor bevakas separat, marknadsdata uppdateras på vardagar och avvikelser skapar deduplicerade GitHub-issues för manuell granskning. Politiska eller andra källbundna sakuppgifter skrivs aldrig om automatiskt när en källa ändras.

## QA

```bash
npm run qa
```

## Publicering

Statiska assets publiceras via Cloudflare från `main`. Aktuell applikationsversion: **0.46.0**.
