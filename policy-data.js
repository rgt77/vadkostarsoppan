window.POLICY_SCENARIOS = {
  c: {
    name: "Centerpartiet",
    priceModel: { type: "stated_target", delta: 0 },
    evidence: "party_stated_target",
    verifiedAt: "2026-09-23",
    method: "0 kr/l är partiets uttalade mål för pumppriset i förslaget, inte en oberoende verifierad kostnadsberäkning.",
    source: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump"
  },
  kd: {
    name: "Kristdemokraterna",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "KD:s officiella källor dokumenterar skatte- och reduktionspliktsåtgärder samt en historisk partiuppskattning för diesel, men ger inte en tillräckligt specificerad aktuell 2026-nivå för ett exakt framtida kr/l-scenario.",
    source: "https://kristdemokraterna.se/arkiv/nyheter/2024/2024-08-27-vi-sanker-drivmedelsskatten-och-utslappen",
    facts: "data/policy-facts-kd.json"
  },
  l: {
    name: "Liberalerna",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Liberalernas källor dokumenterar reduktionsplikt, skattekompensation och en långsiktig elektrifieringsinriktning, men anger inte en aktuell komplett kr/l-nivå som kan användas för ett exakt framtida prisscenario.",
    source: "https://www.liberalerna.se/wp-content/uploads/klimatomstallning-i-en-vaxande-ekonomi.pdf",
    facts: "data/policy-facts-l.json"
  },
  mp: {
    name: "Miljöpartiet",
    priceModel: { type: "party_delta", delta: 2.2 },
    evidence: "party_estimate",
    verifiedAt: "2026-09-23",
    method: "+2,2 kr/l är partiets egen uppskattade pumppriseffekt för budgetscenariot. Den appliceras här på referenspriset och är inte en oberoende prognos.",
    source: "https://www.mp.se/wp-content/uploads/2025/10/mp-budgetmotion-2026.pdf"
  },
  m: {
    name: "Moderaterna",
    priceModel: { type: "party_delta", delta: -3, validFrom: "2026-07-01", validTo: "2026-11-30", fuels: ["petrol", "diesel"] },
    evidence: "party_estimate",
    verifiedAt: "2026-09-23",
    method: "−3 kr/l är Moderaternas uppgift om den ytterligare tillfälliga sänkningen vid pump. Scenariot används bara för Bensin 95 och diesel under 1 juli–30 november 2026 och är inte en permanent prisprognos.",
    source: "https://moderaterna.se/nyhet/ytterligare-sankt-skatt-pa-drivmedel/",
    facts: "data/policy-facts-m.json"
  },
  s: {
    name: "Socialdemokraterna",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Partiet uppger att det inte föreslår höjda drivmedelsskatter eller höjd reduktionsplikt i nuläget, men anger inte ett komplett framtida kr/l-pris.",
    source: "https://www.socialdemokraterna.se/var-politik/a-till-o/branslepriser/fakta-om-socialdemokraternas-politik-kring-drivmedelsskatt"
  },
  sd: {
    name: "Sverigedemokraterna",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Partiet publicerar numeriska historiska drivmedelsdata och genomförda/tidsbegränsade åtgärder. De används som bakgrund, men inte som ett permanent framtida kr/l-pris utan en uttrycklig framtida nivå.",
    source: "https://val2026.sd.se/drivmedel/",
    facts: "data/policy-facts-sd.json"
  },
  v: {
    name: "Vänsterpartiet",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Den använda officiella källan innehåller inte ett komplett numeriskt förslag som kan översättas till ett exakt kr/l-pris utan egna antaganden.",
    source: "https://www.vansterpartiet.se/var-politik/politik-a-o/drivmedelsbeskattning/"
  }
};
