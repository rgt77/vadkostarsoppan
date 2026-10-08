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

## Produktionsvalidering

En daglig produktionsaudit verifierar att data-health saknar blockerande fel, pris- och marknadsdata är färska, senaste priset finns i historiken och att historikserierna är kronologiskt sammanhängande. Resultatet sparas i `data/production-audit.json`. Blockerande driftfel ger en deduplicerad GitHub-issue. Kort historik flaggas endast som varning medan serien byggs upp organiskt; historiska priser konstrueras inte.

## Release gate

Frontendändringar passerar en separat release-audit som kontrollerar metadata, länksäkerhet, grundläggande tillgänglighet, responsiva brytpunkter, reduced motion, fokusmarkering, URL-state och defensiv frontendlogik. Den körs tillsammans med ordinarie QA innan en frontendändring betraktas som releaseklar.

## Live-verifiering

En separat daglig smoke test kontrollerar den faktiskt publicerade sajten, inte bara repositoryt. Den verifierar HTTP-svar, huvudsidans identitet och publicerade version, canonical, robots.txt, sitemap samt korrekt 404-svar. Fel skapar en deduplicerad GitHub-issue så att skillnader mellan grön repository-QA och trasig produktion upptäcks.

## Säkerhet och cache

Cloudflare-svar använder explicita säkerhetsheaders: strikt CSP, klickkapningsskydd, MIME-skydd, begränsad referrer-policy och avstängda webbläsarbehörigheter som sajten inte behöver. Statiska lokala logotyper cacheas långsiktigt medan appkod, data och HTML har kortare cache med revalidering så att nya priser och releaser slår igenom utan onödig trafik.

## QA

```bash
npm run qa
```

## Publicering

Statiska assets publiceras via Cloudflare från `main`. Aktuell applikationsversion: **0.70.5**.

## Quality review 2026-10-08

- Price ingestion validates all four national prices, rejects incomplete source data, and refuses to silently carry over yesterday's fuel price as today's.
- `npm run qa` tests source parser, live calculation formulas, tax-period boundaries, static structure and market parsing.
- The public price breakdown uses the tax schedule corresponding to the observed pump price date.
- `_headers` allows Riksdag image hosts for party symbols while keeping script execution restricted to first-party code.
- The static deployment excludes monitoring scripts, tests and internal data logs.

## Advertising and consent

Two labelled and responsive advertising placements are prepared, but `window.AD_CONFIG.enabled` is `false`.
Configuration resides in `fuel-data.js`, not in blocked inline JavaScript.
Before enabling: secure AdSense approval, integrate a Google-certified CMP implementing IAB TCF, validate consent handling and adjust CSP to allow the specific AdSense requests. An account ID alone must never turn on tracking or ads.
No advertising network is contacted while advertising is disabled.

