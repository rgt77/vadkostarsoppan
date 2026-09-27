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
    priceModel: { type: "not_quantified", baselineTreatment: "already_reflected", validFrom: "2026-07-01", validTo: "2026-11-30", fuels: ["petrol", "diesel"], statedApproxPumpRelief: 3 },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "Den tillfälliga skattesänkningen motsvarar cirka 3 kr/l inklusive moms vid full prisövervältring och gäller 1 juli–30 november 2026. Åtgärden är genomförd och ingår därför redan i dagens observerade rikssnitt; den dras inte av en gång till som ett hypotetiskt M-pris.",
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
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "SD:s underlag innehåller kvantifierade historiska och genomförda 2026-åtgärder. De tidsbegränsade skattesänkningarna ingår redan i dagens observerade rikssnitt och dras därför inte av igen. Ingen separat permanent framtida kr/l-nivå används utan ett uttryckligt nytt underlag.",
    source: "https://val2026.sd.se/drivmedel/",
    facts: "data/policy-facts-sd.json"
  },
  v: {
    name: "Vänsterpartiet",
    priceModel: { type: "not_quantified" },
    evidence: "quantified_inputs",
    verifiedAt: "2026-09-27",
    method: "Vänsterpartiet vill höja reduktionsplikten från 10 procent men anger ingen exakt ny nivå. Partiet motsatte sig 2026 års tillfälliga drivmedelsskattesänkning och föreslår i stället riktad hushållskompensation med inkomstgränser samt högre stöd där kollektivtrafiken är dålig. Stödet hålls separat från pumppriset, därför konstrueras inget exakt V-pris.",
    source: "https://www.vansterpartiet.se/var-politik/politik-a-o/drivmedelsbeskattning/",
    facts: "data/policy-facts-v.json"
  }
};

window.POLICY_COMPARISON = {
  c: { known: "17 % förnybar andel 2028 anges som mål; biodieselreserv 2 mdkr.", pump: "Ingen exakt kr/l", instrument: "Skattebefrielse för biodrivmedel · 17 % mål 2028", compensation: "Biodieselreserv 2 mdkr", calculability: "partial", reason: "Kostnaden för ökad inblandning är inte fastställd." },
  kd: { known: "Partiets dokumenterade inriktning är reduktionsplikt vid EU:s miniminivå.", pump: "Ingen exakt kr/l", instrument: "Reduktionsplikt vid EU:s miniminivå", compensation: "—", calculability: "partial", reason: "Aktuell exakt svensk nivå/prisdifferens saknas i partiets underlag." },
  l: { known: "10 % reduktionsplikt och skattekompensation är dokumenterade delar av linjen.", pump: "Ingen permanent kr/l", instrument: "10 % reduktionsplikt · skattekompensation", compensation: "Tillfällig skattesänkning och kollektivtrafikstöd", calculability: "partial", reason: "3 kr/l är tidsbunden regeringsåtgärd, inte permanent L-pris." },
  mp: { known: "Partiet anger cirka +2,20 kr/l under infasningen samt separat grön utdelning för målgruppen.", pump: "+2,20 kr/l", instrument: "12 % bensin · 25 % diesel · koldioxidskatt", compensation: "Grön utdelning 2 900 kr/vuxen/år för målgruppen", calculability: "direct", reason: "Partiet anger själv en sammanhållen pumppriseffekt." },
  m: { known: "Den genomförda tillfälliga 2026-sänkningen anges motsvara cirka 3 kr/l vid full prisövervältring.", pump: "Redan i dagens rikssnitt", instrument: "10 % reduktionsplikt · genomförd tillfällig skattesänkning", compensation: "Kollektivtrafikstöd separat", calculability: "baseline", reason: "Sänkningen gäller 1 juli–30 november 2026 men är redan inbakad i dagens observerade rikssnitt och får inte dras av igen." },
  s: { known: "Sverigebränslet anger 10 % bas för bensin och 19,3 % för diesel plus en rörlig del.", pump: "Ingen exakt kr/l", instrument: "Sverigebränslet: 10 % bensin · 19,3 % diesel + rörlig del", compensation: "Tillfällig skattesänkning föreslagen", calculability: "partial", reason: "Rörlig inblandning och bränslekomponentkostnader saknas för exakt pris." },
  sd: { known: "Genomförda 2026-skattesänkningar och 10 % reduktionsplikt ingår redan i dagens observerade pris.", pump: "Redan i dagens rikssnitt", instrument: "10 % reduktionsplikt · genomförda tillfälliga skattesänkningar", compensation: "—", calculability: "baseline", reason: "Genomförda 2026-sänkningar får inte dras av från dagens pris en gång till." },
  v: { known: "Partiet vill höja reduktionsplikten och kombinera styrningen med riktad kompensation.", pump: "Ingen exakt kr/l", instrument: "Högre reduktionsplikt · drivmedelsskatt som styrmedel", compensation: "Riktat bilstöd · geografisk modell · Sverigebiljett", calculability: "partial", reason: "Exakt reduktionsnivå och nationell kr/l-effekt anges inte." }
};

window.POLICY_STATUS_META = {
  direct: { label: "Exakt partisiffra finns", detail: "Partiet anger en numerisk pumppriseffekt som kan visas med tydlig attribution." },
  direct_temporary: { label: "Exakt siffra · tidsbegränsad", detail: "Den numeriska effekten gäller bara under den dokumenterade perioden." },
  partial: { label: "Exakt pumppris saknas", detail: "Det finns konkreta policyparametrar, men inte tillräckligt underlag för ett exakt nationellt literpris." },
  baseline: { label: "Redan i dagens rikssnitt", detail: "Åtgärden är redan genomförd och får inte räknas av från dagens pris en gång till." }
};
