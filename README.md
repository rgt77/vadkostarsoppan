# Vad kostar soppan?

En liten statisk webbapp som ska besvara två frågor så snabbt som möjligt:

1. Vad kostar en **typisk tankning på 40 liter**?
2. Vad skulle samma tankning kosta i ett valt **partiscenario**, när det finns tillräckligt kvantifierat underlag?

## Produktprincip

Sidan är medvetet minimalistisk. Besökaren väljer:

- Bensin 95 eller diesel
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

Aktuell applikationsversion: **0.13.0**.
