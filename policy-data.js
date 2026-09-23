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
    method: "Partiets aktuella sida anger riktning för lägre drivmedelskostnader men inte ett komplett numeriskt förslag som kan översättas till ett exakt kr/l-pris.",
    source: "https://kristdemokraterna.se/var-politik/politik-a-till-o/drivmedelspriser"
  },
  l: {
    name: "Liberalerna",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "De aktuella källorna anger inriktning och tillfälliga åtgärder, men inte en komplett framtida nivå som kan räknas om till ett exakt kr/l-pris.",
    source: "https://www.liberalerna.se/politik/glesbygd"
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
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Partiet anger att tillfälliga skattesänkningar kan förlängas beroende på omvärldsläget, men anger inte en permanent framtida nivå som kan räknas till ett exakt kr/l-pris.",
    source: "https://moderaterna.se/var-politik/drivmedelspriser/"
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
    method: "Partiet anger sänkt skatt och minskad reduktionsplikt som inriktning, men utan exakta framtida nivåer kan ett kr/l-pris inte beräknas utan egna antaganden.",
    source: "https://www.sd.se/vad-vi-vill/folder-vi-gor-sverige-till-sverige-igen/"
  },
  v: {
    name: "Vänsterpartiet",
    priceModel: { type: "not_quantified" },
    evidence: "not_quantified",
    verifiedAt: "2026-09-23",
    method: "Den använda officiella källan innehåller inte ett komplett numeriskt förslag som kan översättas till ett exakt kr/l-pris utan egna antaganden.",
    source: "https://www.vansterpartiet.se/var-politik/klimatmalen-till-2030/"
  }
};
