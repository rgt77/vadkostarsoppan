# AdSense – lanseringschecklista

Status: **Förberedelser, annonser avstängda** (2026-10-11).

## Det som redan finns

- Två dolda, responsiva och märkta annonsplatser (`primary`, `secondary`) på startsidan.
- Centrala annonsinställningar i `fuel-data.js` med `enabled: false`.
- Annonsskriptet laddas inte när annonser är avstängda.
- En publik informationssida: `/integritet.html`.
- `node scripts/ad-readiness.mjs` som blockerar ofullständiga annonsinställningar.

## Kräver uppgifter eller godkännande innan aktivering

1. **AdSense-konto och webbplatsgranskning:** Skapa/logga in på AdSense och ansök om godkännande för `vadkostarsoppan.se`. Googles krav på eget och värdefullt innehåll ska kontrolleras; inget godkännande kan garanteras.
2. **AdSense-ID:** Hämta ditt riktiga `ca-pub-...` och två annonsplats-ID:n. Ändra inte till `enabled: true` innan övriga kontroller är klara.
3. **ads.txt:** Publicera exakt din egna rad i webbplatsroten `/ads.txt`. Standardformat för ett direkt Google AdSense-konto är `google.com, pub-<ditt-id>, DIRECT, f08c47fec0942fa0`. Kontrollera alltid mot raden i ditt AdSense-konto; publicera inte ett fiktivt ID.
4. **Certified CMP:** Konfigurera Googles Privacy & messaging eller en annan Google-certifierad CMP med stöd för IAB TCF. Säkerställ att relevant samtycke hanteras korrekt för EES, Storbritannien och Schweiz, inklusive möjlighet att neka och ändra valet.
5. **CSP och funktion:** Nuvarande Content Security Policy blockerar avsiktligt tredjepartsannonsförfrågningar. Tillåt endast de värdar och direktiv som krävs av den valda leverantörens officiella integration efter säkerhetsgranskning. Verifiera i riktig webbläsare att annonser inte laddar före giltig samtyckes-/rättslig hantering.
6. **Ansvarig utgivare och integritet:** Fastställ juridiskt ansvarig och kontaktväg, driftleverantörers personuppgiftsbehandling samt eventuella faktiska cookies, analysverktyg och tredje parter. Uppdatera `integritet.html` så att den korrekt beskriver den verkliga lösningen innan annonsering startar.
7. **Sluttest:** Kör full QA, Chromium WCAG-test, manuellt test av samtyckesflöde och mobil-layout, publicera och testa `https://vadkostarsoppan.se/ads.txt` och bekräfta webbplatsstatus i AdSense.

## Viktigt

Nuvarande `initAds()` är en *förberedelse*, inte en komplett eller certifierad CMP. En JavaScript-kontroll av `__tcfapi` kan inte ensamt bevisa juridisk efterlevnad eller Googles godkännande. Den ska inte användas som intyg på full GDPR-efterlevnad.

Officiella guider:
- https://support.google.com/adsense/answer/9724
- https://support.google.com/adsense/answer/13554116
- https://support.google.com/adsense/answer/12171612
- https://support.google.com/adsense/answer/1348695
