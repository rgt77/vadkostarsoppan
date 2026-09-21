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

- `fuel-data.js` – bränsletyper, skattesatser, moms, app- och dataversion
- `county-data.js` – rikssnitt och snittpriser för samtliga 21 län
- `market-data.js` – veckoreferens, Brent, valuta och marknadskonstanter
- `policy-data.js` – politiska scenarier och källor
- `script.js` – kalkylmotor, länsjämförelse, delning, tillgänglighet och interaktion
- `index.html` – sidstruktur
- `style.css` – responsiv design
- `sw.js` – offline-cache och fallback
- `offline.html` – offline-sida
- `data-sources.json` – källregister och datastatus

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


## Marknadsdatalager – fas 2

Marknadsdelen har nu ett separat lager i `market-data.js`.

Nuvarande referenser:
- svensk veckoreferens för pumppris från EU-kommissionens Weekly Oil Bulletin,
- Brent-råolja från U.S. EIA,
- USD/SEK för valutaomräkning,
- beräknad råoljeekvivalent i SEK/l.

Råoljeekvivalenten är **inte** samma sak som produktkostnaden för färdig bensin eller diesel. Den visas endast som marknadsdrivare. Skillnaden mellan råoljeekvivalent och marknad/kedja får inte beskrivas som vinst eftersom den även innehåller raffinering, produktpremier, biodrivmedel, import, terminal, logistik, station och marginaler.

`data-sources.json` fungerar som källregister och anger även vilka datakällor som fortfarande behöver anskaffas för att hela marknadsdelen ska kunna delas upp.


## Länspriser

`county-data.js` innehåller aktuella snittpriser för Bensin 95 och diesel för samtliga 21 svenska län samt rikssnittet.

Källa: Carculated, som beräknar länssnitt från rapporterade stationspriser hos Bensinpriser.nu. Data är ett riktvärde och kan avvika från en enskild station. Uppenbara felrapporter filtreras enligt källans metodik.

I gränssnittet kan användaren välja län. Valet uppdaterar pumppriset till länets snitt för vald bränsletyp. Man kan därefter fortfarande skriva in ett eget stationspris manuellt.


## UI- och produktlyft v0.5.0

Den större utvecklingsrundan omfattar 100 konkreta produkt- och tekniksteg, grupperade i tio områden:

1. Länsutforskare med sök, sortering, ranking, prisstaplar och spridning.
2. Sparade val, senaste län, prisläge och datans färskhet.
3. Snabbjustering av pumppris, dynamisk berättelse och skatt/marknad-jämförelse.
4. Kopiera, dela och skriva ut ett kvitto för exakt en liter.
5. Marknadsjämförelser, källkvalitet och förklaring av benchmark/råoljeekvivalent.
6. Neutralare och tydligare politiska scenarier med filter och egna simulatorpresets.
7. Mobil bottom navigation, högkontrastläge och tangentbordsgenvägar.
8. Tillgänglighetsförbättringar, metodförklaringar och no-JavaScript-information.
9. PWA-förbättringar, service worker, offline-cache och appgenvägar.
10. Runtime-validering av datalagren, versionsvisning och teknisk QA.

Länspriser är riktvärden från rapporterade stationspriser, inte exakta priser för varje station.
