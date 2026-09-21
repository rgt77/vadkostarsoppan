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
