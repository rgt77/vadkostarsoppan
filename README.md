# Vad kostar soppan?

En enkel, transparent kalkylator som visar hur ett svenskt pumppris för bensin eller diesel fördelas på:

- energiskatt
- koldioxidskatt
- moms
- övrigt före skatt

## Datakällor

Skattesatserna i första versionen gäller 1 juli–30 september 2026 och kommer från Skatteverket.

- Bensin 95, miljöklass 1: energiskatt 0,70 kr/l och koldioxidskatt 0,87 kr/l.
- Diesel, miljöklass 1: energiskatt 0,831 kr/l och koldioxidskatt 0,411 kr/l.
- Generell moms: 25 %. I ett konsumentpris inklusive moms motsvarar momsen 20 % av slutpriset.

"Övrigt före skatt" räknas som en restpost. Den innehåller därför mer än ett rent inköpspris och ska inte beskrivas som drivmedelsbolagets vinst.

## Publicering

Projektet är byggt som statiska filer och kan publiceras direkt med Cloudflare Pages utan byggkommando.

Production branch: `main`  
Build command: lämnas tomt  
Build output directory: `/`


## Politiska scenarier

Partidelen är byggd som en separat policy-motor i `policy-data.js`.

Principer:
- endast officiella partikällor används för partipositioner,
- exakta kr/l-resultat visas bara när underlaget innehåller en kvantifierbar nivå eller partiets egen publicerade priseffekt,
- partiets eget mål eller egen beräkning märks uttryckligen som sådan,
- när ett förslag saknar tillräcklig numerik visas "ej exakt beräkningsbart",
- marknadsdelen hålls oförändrad i scenarier om inget annat är kvantifierat,
- hushållsstöd och andra kompensationer hålls separata från pumppriset.

Det egna scenariot låter användaren simulera energiskatt, koldioxidskatt, moms och en separat regel-/inblandningskostnad utan att koppla simuleringen till något parti.
