window.POLICY_SCENARIOS = {
  c: {
    name: "Centerpartiet",
    priceModel: { type: "stated_target", delta: 0 },
    method: "0 kr/l är partiets uttalade mål för pumppriset, inte en oberoende verifierad kostnadsberäkning.",
    source: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump"
  },
  kd: {
    name: "Kristdemokraterna",
    priceModel: { type: "not_quantified" },
    method: "Den använda officiella sidan anger inte en egen permanent framtida skattesats eller reduktionsnivå i kr/l.",
    source: "https://kristdemokraterna.se/var-politik/politik-a-till-o/drivmedelspriser"
  },
  l: {
    name: "Liberalerna",
    priceModel: { type: "not_quantified" },
    method: "Ett framtida exakt pumppris kräver fler kvantifierade partiförslag än vad den aktuella källan innehåller.",
    source: "https://www.liberalerna.se/nyheter/regeringen-genomfor-ett-krispaket-for-att-mota-energikrisen"
  },
  mp: {
    name: "Miljöpartiet",
    priceModel: { type: "party_delta", delta: 2.2 },
    method: "+2,2 kr/l är partiets egen uppskattade pumppriseffekt för budgetscenariot. Den appliceras här på ditt referenspris och är inte en oberoende prognos.",
    source: "https://www.mp.se/wp-content/uploads/2025/10/mp-budgetmotion-2026.pdf"
  },
  m: {
    name: "Moderaterna",
    priceModel: { type: "not_quantified" },
    method: "Ett framtida exakt kr/l-pris kan inte räknas utan att anta hur länge de tillfälliga skattesänkningarna ska gälla.",
    source: "https://moderaterna.se/var-politik/drivmedelspriser/"
  },
  s: {
    name: "Socialdemokraterna",
    priceModel: { type: "not_quantified" },
    method: "Partiets aktuella besked anger riktning men inte en komplett permanent framtida kostnadsprofil per liter.",
    source: "https://www.socialdemokraterna.se/var-politik/a-till-o/branslepriser/fakta-om-socialdemokraternas-politik-kring-drivmedelsskatt"
  },
  sd: {
    name: "Sverigedemokraterna",
    priceModel: { type: "not_quantified" },
    method: "Utan en angiven framtida skattesats och reduktionsnivå skulle ett exakt partipris kräva egna antaganden.",
    source: "https://www.sd.se/vad-vi-vill/folder-vi-gor-sverige-till-sverige-igen/"
  },
  v: {
    name: "Vänsterpartiet",
    priceModel: { type: "not_quantified" },
    method: "En nationell kr/l-nivå kan inte räknas eftersom både reduktionsnivå och framtida geografisk skatteutformning saknar ett enda exakt värde.",
    source: "https://www.vansterpartiet.se/var-politik/klimatmalen-till-2030/"
  }
};
