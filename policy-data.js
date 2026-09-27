window.POLICY_SCENARIOS = {
  c: {
    name: "Centerpartiet",
    priceModel: { type: "not_quantified", statedTargetDelta: 0, targetBlendPct2028: 17 },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "Centerpartiet anger skattebefrielse för inblandade biodrivmedel, en ökning från 10 till 17 procent 2028 och en biodieselreserv på 2 miljarder kronor. Målet är att ökningen ska kunna ske utan högre pumppris. Underlaget är delvis kvantifierat men räcker inte för ett oberoende exakt kr/l-scenario.",
    source: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump",
    facts: "data/policy-facts-c.json"
  },
  kd: {
    name: "Kristdemokraterna",
    priceModel: { type: "not_quantified" },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "KD:s aktuella linje är att bibehålla reduktionsplikten på EU:s miniminivå. Äldre KD-underlag innehåller prisuppskattningar, men de avser tidigare nivåer eller kontrafaktiska jämförelser och används inte som avdrag från dagens pris. Därför visas inget konstruerat aktuellt kr/l-scenario.",
    source: "https://kristdemokraterna.se/var-politik/politik-a-till-o/drivmedelspriser",
    facts: "data/policy-facts-kd.json"
  },
  l: {
    name: "Liberalerna",
    priceModel: { type: "not_quantified" },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "Liberalerna dokumenterar 10 procents reduktionsplikt och skattekompensation med målet att motverka priseffekten. Under energikrisen 2026 stödde partiet även en tillfällig skattesänkning på 3 kr/l. Den tidsbundna åtgärden används inte som ett permanent framtida L-pris, och något separat aktuellt permanent kr/l-scenario anges därför inte.",
    source: "https://www.liberalerna.se/nyheter/regeringen-genomfor-ett-krispaket-for-att-mota-energikrisen",
    facts: "data/policy-facts-l.json"
  },
  mp: {
    name: "Miljöpartiet",
    priceModel: { type: "party_delta", delta: 2.2, fuels: ["petrol", "diesel"] },
    evidence: "party_estimate",
    verifiedAt: "2026-09-27",
    method: "+2,2 kr/l är Miljöpartiets egen beräknade pumppriseffekt för 2026 års infasning: reduktionsplikt 12 % för bensin och 25 % för diesel samt höjd koldioxidskatt på bensin. Den gröna utdelningen 2 900 kr per vuxen och år för vissa lands- och glesbygdshushåll hålls separat från pumppriset.",
    source: "https://www.mp.se/wp-content/uploads/2025/10/mp-budgetmotion-2026.pdf",
    facts: "data/policy-facts-mp.json"
  },
  m: {
    name: "Moderaterna",
    priceModel: { type: "party_delta", delta: -3, validFrom: "2026-07-01", validTo: "2026-11-30", fuels: ["petrol", "diesel"] },
    evidence: "party_estimate",
    verifiedAt: "2026-09-27",
    method: "−3 kr/l är Moderaternas uppgift om den ytterligare tillfälliga skattesänkningens effekt vid full prisövervältring. Scenariot används bara för Bensin 95 och diesel 1 juli–30 november 2026. Det är en tidsbunden parti-/regeringsuppskattning, inte en garanti om faktisk stationsprisförändring eller en permanent prisprognos.",
    source: "https://moderaterna.se/nyhet/ytterligare-sankt-skatt-pa-drivmedel/",
    facts: "data/policy-facts-m.json"
  },
  s: {
    name: "Socialdemokraterna",
    priceModel: { type: "not_quantified" },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "Socialdemokraterna kräver en tillfällig skattesänkning utan angiven kr/l-nivå och föreslår Sverigebränslet med 19,3 % basinblandning för diesel och 10,0 % för bensin samt rörlig tilläggsinblandning. Dessa är kvantifierade policyindata men räcker inte till ett exakt pumppris utan marknads- och blandningsantaganden.",
    source: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-03-20-s-kraver-tillfallig-skattesankning-pa-bensin-och-diesel",
    facts: "data/policy-facts-s.json"
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
    method: "Vänsterpartiet vill använda drivmedelsbeskattning som klimatstyrmedel men kombinera den med ekonomisk kompensation och på sikt geografiskt differentierad vägtrafikbeskattning. Någon komplett aktuell kr/l-nivå anges inte, därför konstrueras inget V-pris.",
    source: "https://www.vansterpartiet.se/var-politik/politik-a-o/drivmedelsbeskattning/",
    facts: "data/policy-facts-v.json"
  }
};
