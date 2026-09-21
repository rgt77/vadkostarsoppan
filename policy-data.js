window.POLICY_SCENARIOS = {
  current: {
    name: "Nuvarande regler",
    status: "exact",
    statusLabel: "BESLUTAD NIVÅ",
    asOf: "21 september 2026",
    summary: "Referensläget använder gällande svenska skattesatser och reduktionsnivåer för den valda perioden.",
    priceModel: { type: "baseline" },
    policies: {
      tax: "Gällande energi- och koldioxidskatt",
      reduction: "10 % reduktionsnivå för bensin och diesel",
      bio: "Nuvarande reduktionsplikt",
      vat: "25 % moms",
      support: "Ingen kompensation ingår i pumppriset"
    },
    method: "Detta är referensen som övriga scenarier jämförs mot.",
    source: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  },

  m: {
    name: "Moderaterna",
    status: "partial",
    statusLabel: "DELVIS KVANTIFIERAT",
    asOf: "september 2026",
    summary: "Moderaterna vill fortsatt hålla drivmedelspriserna låga, behålla en kostnadseffektiv reduktionsplikt och säger att de kan förlänga tillfälliga skattesänkningar om höga internationella priser består.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "Fortsatt låg; möjlig förlängning av tillfälliga sänkningar är villkorad",
      reduction: "10 %; partiet säger att den inte bör höjas i nuläget",
      bio: "Kostnadseffektiv reduktionsplikt",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Ingen separat pumppriskompensation modellerad"
    },
    method: "Ett framtida exakt kr/l-pris kan inte räknas utan att anta hur länge de tillfälliga skattesänkningarna ska gälla.",
    source: "https://moderaterna.se/var-politik/drivmedelspriser/"
  },

  s: {
    name: "Socialdemokraterna",
    status: "partial",
    statusLabel: "DELVIS KVANTIFIERAT",
    asOf: "13 augusti 2026",
    summary: "Socialdemokraterna säger att de i det aktuella läget inte har förslag om höjd drivmedelsskatt eller höjd reduktionsplikt och har krävt tillfälligt sänkt drivmedelsskatt vid prischocker.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "Ingen höjning föreslagen i aktuellt läge",
      reduction: "Ingen höjning föreslagen i aktuellt läge",
      bio: "Sverigebränslet: långsiktiga kontrakt för biodrivmedel",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Stöd vid prischocker beskrivs, men utan ett enda nationellt kr/l-belopp"
    },
    method: "Partiets aktuella besked anger riktning men inte en komplett permanent framtida kostnadsprofil per liter.",
    source: "https://www.socialdemokraterna.se/var-politik/a-till-o/branslepriser/fakta-om-socialdemokraternas-politik-kring-drivmedelsskatt"
  },

  sd: {
    name: "Sverigedemokraterna",
    status: "partial",
    statusLabel: "EJ FULLT KVANTIFIERAT",
    asOf: "valrörelsen 2026",
    summary: "Sverigedemokraterna går till val på fortsatt låga drivmedelsskatter och minskad/låg reduktionsplikt.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "Fortsatt låg/sänkt enligt partiets valmaterial",
      reduction: "Minskad/låg; ingen ny exakt framtida nivå i den använda källan",
      bio: "Ingen separat kvantifierad kostnad per liter",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Ingen separat pumppriskompensation modellerad"
    },
    method: "Utan en angiven framtida skattesats och reduktionsnivå skulle ett exakt partipris kräva egna antaganden.",
    source: "https://www.sd.se/vad-vi-vill/folder-vi-gor-sverige-till-sverige-igen/"
  },

  c: {
    name: "Centerpartiet",
    status: "target",
    statusLabel: "PARTIETS UPPGIVNA MÅL",
    asOf: "31 augusti 2026",
    summary: "Centerpartiet vill skattebefria inblandade biodrivmedel och öka den förnybara andelen. Partiet säger att detta ska kunna göras utan högre pris vid pump.",
    priceModel: { type: "stated_target", delta: 0 },
    policies: {
      tax: "Skattebefrielse för inblandade biodrivmedel föreslås",
      reduction: "Högre förnybar andel; exakt långsiktig nivå är inte satt i denna källa",
      bio: "Mer biodrivmedel i bensin och diesel",
      vat: "Moms kvarstår enligt den använda källan",
      support: "Prisneutralitet är partiets uttalade mål"
    },
    method: "0 kr/l är partiets uttalade mål för pumppriset, inte en oberoende verifierad kostnadsberäkning.",
    source: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump"
  },

  v: {
    name: "Vänsterpartiet",
    status: "partial",
    statusLabel: "EJ FULLT KVANTIFIERAT",
    asOf: "26 maj 2026",
    summary: "Vänsterpartiet vill höja reduktionsplikten från 10 procent, men inte återgå till ett system där hög reduktionsplikt är det avgörande styrmedlet. På sikt vill partiet också differentiera beskattningen geografiskt.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "På sikt geografiskt differentierad beskattning av biltrafik",
      reduction: "Högre än 10 %; exakt nivå anges inte",
      bio: "Stärkt svensk produktion av fossilfria drivmedel",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Ekonomisk kompensation för bland annat landsbygd och lägre inkomster"
    },
    method: "En nationell kr/l-nivå kan inte räknas eftersom både reduktionsnivå och framtida geografisk skatteutformning saknar ett enda exakt värde.",
    source: "https://www.vansterpartiet.se/var-politik/klimatmalen-till-2030/"
  },

  kd: {
    name: "Kristdemokraterna",
    status: "partial",
    statusLabel: "EJ FULLT KVANTIFIERAT",
    asOf: "3 juli 2026",
    summary: "Kristdemokraterna lyfter sänkt reduktionsplikt och lägre drivmedelskostnader som genomförd politik och argumenterar mot höga drivmedelsskatter.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "Lägre drivmedelsskatter är partiets inriktning",
      reduction: "Sänkt/låg reduktionsplikt",
      bio: "Ingen separat kvantifierad kostnad per liter",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Ingen separat pumppriskompensation modellerad"
    },
    method: "Den använda officiella sidan anger inte en egen permanent framtida skattesats eller reduktionsnivå i kr/l.",
    source: "https://kristdemokraterna.se/var-politik/politik-a-till-o/drivmedelspriser"
  },

  l: {
    name: "Liberalerna",
    status: "partial",
    statusLabel: "EJ FULLT KVANTIFIERAT",
    asOf: "13 maj 2026",
    summary: "Liberalerna stod bakom regeringens tillfälliga drivmedelsskattesänkningar under energikrisen 2026. I den använda källan finns ingen separat permanent Liberal framtida kr/l-nivå.",
    priceModel: { type: "not_quantified" },
    policies: {
      tax: "Stöd för tillfällig skattesänkning 2026",
      reduction: "Ingen separat exakt framtida nivå i den använda källan",
      bio: "Ingen separat kvantifierad kostnad per liter",
      vat: "Ingen separat kvantifierad drivmedelsmomssats i källan",
      support: "Billigare kollektivtrafik ingick i krispaketet, men påverkar inte pumppriset"
    },
    method: "Ett framtida exakt pumppris kräver fler kvantifierade partiförslag än vad den aktuella källan innehåller.",
    source: "https://www.liberalerna.se/nyheter/regeringen-genomfor-ett-krispaket-for-att-mota-energikrisen"
  },

  mp: {
    name: "Miljöpartiet",
    status: "party_estimate",
    statusLabel: "PARTIETS BUDGETBERÄKNING",
    asOf: "budgetmotion för 2026",
    summary: "Miljöpartiets budgetmotion för 2026 föreslog 12 procents reduktionsplikt för bensin och 25 procent för diesel samt höjd koldioxidskatt på bensin. Partiet beräknade själv pumppriseffekten till cirka +2,2 kr/l.",
    priceModel: { type: "party_delta", delta: 2.2 },
    policies: {
      tax: "Höjd koldioxidskatt på bensin i budgetscenariot",
      reduction: "12 % bensin / 25 % diesel",
      bio: "Högre inblandning via högre reduktionsplikt",
      vat: "Ingen separat ändrad momssats i detta scenario",
      support: "Grön utdelning 2 900 kr per vuxen 2026; barn halva beloppet"
    },
    method: "+2,2 kr/l är partiets egen uppskattade pumppriseffekt för budgetscenariot. Den appliceras här på ditt referenspris och är inte en oberoende prognos.",
    source: "https://www.mp.se/wp-content/uploads/2025/10/mp-budgetmotion-2026.pdf"
  }
};
