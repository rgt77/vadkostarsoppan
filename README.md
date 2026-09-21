# Vad kostar soppan?

`vadkostarsoppan.se` är ett statiskt webbprojekt som redovisar svenska bensin- och dieselpriser i kronor per liter.

## Produktidé

Sidan ska svara på två frågor:

1. Vad består **en liter** bensin eller diesel av kostnadsmässigt?
2. Hur mycket av literpriset kan ändras genom politiska beslut om skatt, moms och regelverk?

Fokus är alltså inte kostnaden för en hel tank.

## Nuvarande kostnadsmodell

Verifierade poster:

- energiskatt
- koldioxidskatt
- moms

Marknadsdelen visas tills vidare som en transparent restpost:

- produkt / färdigt bränsle
- import, frakt och terminal
- distribution, station och marginal

De tre marknadsposterna ska särredovisas först när respektive datakälla är verifierad. Sidan ska inte skapa falsk precision.

## Politiska scenarier

Partidata ligger separat i `policy-data.js`.

Principer:

- dokumenterade partipositioner hålls separata från kalkylmotorn,
- ett exakt kr/l-resultat visas bara när det finns tillräckligt kvantifierbart underlag,
- partiets egen beräkning eller uttalade mål märks uttryckligen,
- om numerik saknas visas **ej exakt beräkningsbart**,
- marknadsdelen hålls konstant om inget annat är kvantifierat,
- hushållsstöd hålls separata från pumppriset.

Det finns även ett neutralt eget scenario där användaren kan simulera energiskatt, koldioxidskatt, moms och en regel-/inblandningskostnad.

## Datafiler

- `fuel-data.js` – bränsletyper, skattesatser, moms och dataversion
- `policy-data.js` – politiska scenarier och källor
- `script.js` – kalkylmotor och interaktion
- `index.html` – sidstruktur
- `style.css` – responsiv design

## Publicering

Projektet publiceras via **Cloudflare Workers Static Assets** från GitHub-repots `main`-gren.

Deploy command:

```bash
npx wrangler deploy
```

Konfiguration finns i `wrangler.jsonc`.

## Datastatus

Skattesatserna i nuvarande version gäller perioden 1 juli–30 september 2026.

- Bensin 95, miljöklass 1: energiskatt 0,70 kr/l och koldioxidskatt 0,87 kr/l.
- Diesel, miljöklass 1: energiskatt 0,831 kr/l och koldioxidskatt 0,411 kr/l.
- Moms: 25 %.

Senast faktakontrollerad i applikationens datalager: 21 september 2026.
