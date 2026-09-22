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


## Produktlyft v0.6.0

Ytterligare 100 utvecklingssteg (101–200) har genomförts:

1. Förstagångsguide och snabbstart.
2. Län-mot-län-jämförelse med delbar URL och direktval.
3. Prisfördelning med median, kvartiler, percentil och IQR-baserad avvikelseindikering.
4. Sparade lägen i webbläsaren med återställning.
5. Export av länspriser som CSV, kopiering av länstabell och scenarioexport som JSON.
6. Dynamiskt källregister med filter och tydliga dataluckor.
7. Online/offline-status, PWA-installation och kontrollerad uppdatering av service worker.
8. Neutral jämförelse mellan nuvarande referens och valt politiskt scenario.
9. Debouncerad historik med ångra/gör om för kalkylens tillstånd.
10. Inbyggt självtest, förbättrad cache-strategi och rendering av innehåll under folden.

Aktuell applikationsversion: **0.6.0**.


## Produktlyft v0.7.0 – steg 201–1200

Den tredje större utvecklingsrundan omfattar 1 000 produkt-, UX-, data- och tekniksteg, grupperade i tjugo block:

1. Enkelt läge och expertläge.
2. Ljust tema, hög kontrast, reducerad rörelse och datasnålt läge.
3. Inställningspanel med lokal persistens.
4. Global kommandopalett med sökning och tangentbordsstyrning.
5. Strukturerad ordlista med 20 begrepp.
6. Favoritlän och favoritfilter.
7. Multi-jämförelse av favoritlän.
8. Prischockslabb för marknad/kedja.
9. Omvänd målpriskalkyl.
10. Skatteandelskurva över olika pumppriser.
11. Dynamisk rapport med text-, Markdown- och utskriftsläge.
12. Datapuls med täckning, färskhet och giltighetsperiod.
13. Fördjupad inbyggd diagnostik och export av självtest.
14. Kontextuell “förklara siffran”-funktion.
15. Scrollprogress, aktiv sektionsindikator och snabb återgång till toppen.
16. Tangentbordshjälp och ytterligare tillgänglighetsstöd.
17. Rendering-, URL- och formatteringsoptimeringar.
18. PWA-versionering, nätverkskontroll och förbättrad offline-cache.
19. Zero-dependency QA-suite och GitHub Actions.
20. Förbättrad metadata, FAQ structured data och slutlig v0.7.0-QA.

Principen är fortsatt densamma: sajten får gärna vara lekfull, men den ska skilja verifierade fakta, härledda värden, modeller och restposter tydligt från varandra.

Aktuell applikationsversion: **0.7.0**.


## Minimalistisk omstart v0.8.0

Gränssnittet har skalats ned kraftigt. Startsidan ska nu svara på två frågor utan extra produktlager:

1. **Vad kostar en liter bensin eller diesel och vad består priset av?**
2. **Vad blir priset i ett valt partiscenario när partiets dokumenterade underlag är tillräckligt kvantifierat?**

Den publika sidan visar endast bränsleval, prisområde, literprisets fyra kostnadsdelar, skatt + moms samt ett neutralt partival. Om ett parti saknar exakta publicerade nivåer visas **Ej möjligt att räkna exakt** i stället för ett antaget pris.

Tidigare labb, kommandopaletter, favoritfunktioner, rapportverktyg, avancerade grafer och inställningspaneler har tagits bort från det publika gränssnittet. Datafiler kan ligga kvar i repositoryt för framtida utveckling, men laddas inte av startsidan.

Aktuell applikationsversion: **0.8.0**.
