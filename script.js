const fuelData = {
  petrol: {
    label: "Bensin 95",
    energyTax: 0.70,
    carbonTax: 0.87,
    period: "1 juli–30 september 2026"
  },
  diesel: {
    label: "Diesel",
    energyTax: 0.831,
    carbonTax: 0.411,
    period: "1 juli–30 september 2026"
  }
};

let selectedFuel = "petrol";

const politicalScenarios = {
  current: {
    mode: "exact",
    delta: 0,
    badge: "BESLUTAD NIVÅ",
    asOf: "21 september 2026",
    title: "Nuvarande beslutade skattenivå",
    summary: "Referensläget använder dagens skattesatser. Den extra tillfälliga skattesänkningen från 1 juli motsvarar cirka 3 kr/l inklusive moms vid full prisövervältring.",
    method: "Marknadsdelen lämnas oförändrad. Det här är inte ett partiscenario utan dagens beslutade referensnivå.",
    source: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  },
  m: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "september 2026",
    title: "Moderaterna",
    summary: "Moderaterna säger att de vill fortsätta hålla drivmedelspriserna låga och vara beredda att förlänga tillfälliga skattesänkningar om höga internationella priser består.",
    method: "Partiet anger inte en permanent framtida skattesats eller ett entydigt kr/l-pris som gör ett exakt partipris möjligt att räkna utan egna antaganden.",
    source: "https://moderaterna.se/var-politik/drivmedelspriser/"
  },
  s: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "augusti 2026",
    title: "Socialdemokraterna",
    summary: "Socialdemokraterna uppger att de inte har förslag om höjda drivmedelsskatter eller höjd reduktionsplikt i det aktuella läget och har samtidigt krävt tillfälliga skattesänkningar vid prischocker.",
    method: "Ingen unik framtida skattesats eller exakt nationell kr/l-effekt är publicerad som kan översättas till ett enda partipris.",
    source: "https://www.socialdemokraterna.se/var-politik/a-till-o/branslepriser/fakta-om-socialdemokraternas-politik-kring-drivmedelsskatt"
  },
  sd: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "valet 2026",
    title: "Sverigedemokraterna",
    summary: "Sverigedemokraterna går till val på fortsatt låga drivmedelsskatter och låg reduktionsplikt och lyfter den tillfälliga skattesänkningen 2026 som en del av sin politik.",
    method: "Den långsiktiga nivån efter de tillfälliga 2026-reglerna anges inte som en enda framtida kr/l-sats.",
    source: "https://val2026.sd.se/drivmedel/"
  },
  c: {
    mode: "claimed_zero",
    delta: 0,
    badge: "PARTIETS UPPGIVNA MÅL",
    asOf: "31 augusti 2026",
    title: "Centerpartiet",
    summary: "Centerpartiet vill skattebefria inblandade biodrivmedel och öka den förnybara andelen. Partiet beskriver förslaget som en väg till mer förnybart utan högre pris vid pump.",
    method: "0 kr/l här återger partiets uttalade mål om oförändrat pumppris. Det är inte en oberoende kostnadsberäkning.",
    source: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump"
  },
  v: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "maj 2026",
    title: "Vänsterpartiet",
    summary: "Vänsterpartiet vill höja reduktionsplikten från dagens nivå och på sikt beskatta biltrafik mer geografiskt, med lägre belastning på landsbygd och högre i städer.",
    method: "Förslagen ger inte en enda nationell kr/l-nivå som kan räknas om till ett exakt pumppris utan egna antaganden om nivåer och geografi.",
    source: "https://www.vansterpartiet.se/var-politik/klimatmalen-till-2030/"
  },
  kd: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "juli 2026",
    title: "Kristdemokraterna",
    summary: "Kristdemokraterna lyfter sänkt reduktionsplikt och lägre drivmedelskostnader som genomförd politik och motsätter sig höga drivmedelsskatter.",
    method: "Partiets aktuella material anger inte en egen permanent framtida kr/l-nivå för bensin och diesel.",
    source: "https://kristdemokraterna.se/var-politik/politik-a-till-o/drivmedelspriser"
  },
  l: {
    mode: "unquantified",
    badge: "EJ EXAKT KVANTIFIERAT",
    asOf: "maj 2026",
    title: "Liberalerna",
    summary: "Liberalerna stod bakom regeringens krispaket 2026 med ytterligare tillfällig skattesänkning på drivmedel och driver samtidigt elektrifiering och smartare användning av biodrivmedel.",
    method: "Det finns ingen separat permanent Liberal kr/l-nivå i det underlag som används här.",
    source: "https://www.liberalerna.se/nyheter/regeringen-genomfor-ett-krispaket-for-att-mota-energikrisen"
  },
  mp: {
    mode: "party_estimate",
    delta: 2.2,
    badge: "PARTIETS BUDGETBERÄKNING",
    asOf: "budgetmotion för 2026",
    title: "Miljöpartiet – budgetscenario 2026",
    summary: "I Miljöpartiets budgetmotion för 2026 ingick högre reduktionsplikt och högre koldioxidskatt. Partiet beräknade själv priseffekten vid pump till cirka +2,2 kr/l och kombinerade det med grön återbäring till vissa hushåll.",
    method: "Beräkningen visar +2,2 kr/l ovanpå det pumppris du angett. Det är partiets egen uppskattade priseffekt för just det budgetscenariot – inte en prognos för framtida marknadspris.",
    source: "https://www.mp.se/wp-content/uploads/2025/10/mp-budgetmotion-2026.pdf"
  },
  custom: {
    mode: "custom",
    badge: "EGEN SIMULERING",
    asOf: "valfri",
    title: "Eget politiskt scenario",
    summary: "Använd reglaget för att testa hur en politiskt driven förändring i skatt, moms eller regelkostnader skulle slå på literpriset om marknadsdelen hålls oförändrad.",
    method: "Detta är en ren känslighetsanalys och representerar inget parti.",
    source: ""
  }
};


const els = {
  pumpPrice: document.querySelector("#pumpPrice"),
  totalPrice: document.querySelector("#totalPrice"),
  energyTax: document.querySelector("#energyTax"),
  carbonTax: document.querySelector("#carbonTax"),
  vat: document.querySelector("#vat"),
  other: document.querySelector("#other"),
  energyPct: document.querySelector("#energyPct"),
  carbonPct: document.querySelector("#carbonPct"),
  vatPct: document.querySelector("#vatPct"),
  otherPct: document.querySelector("#otherPct"),
  taxShare: document.querySelector("#taxShare"),
  taxPerLiter: document.querySelector("#taxPerLiter"),
  donut: document.querySelector("#donut"),
  priceBar: document.querySelector("#priceBar"),
  barTotal: document.querySelector("#barTotal"),
  periodText: document.querySelector("#periodText"),
  tabs: [...document.querySelectorAll(".fuel-tab")],
  partyScenario: document.querySelector("#partyScenario"),
  scenarioPrice: document.querySelector("#scenarioPrice"),
  scenarioDelta: document.querySelector("#scenarioDelta"),
  scenarioBadge: document.querySelector("#scenarioBadge"),
  scenarioAsOf: document.querySelector("#scenarioAsOf"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioSummary: document.querySelector("#scenarioSummary"),
  scenarioMethod: document.querySelector("#scenarioMethod"),
  scenarioSource: document.querySelector("#scenarioSource"),
  customPolicy: document.querySelector("#customPolicy"),
  policyDelta: document.querySelector("#policyDelta"),
  policyDeltaValue: document.querySelector("#policyDeltaValue")
};

const fmt = (value, digits = 2) =>
  new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

function parseNumber(value) {
  return Number(String(value).trim().replace(/\s/g, "").replace(",", "."));
}

function pct(part, total) {
  return total > 0 ? part / total * 100 : 0;
}

function setBar(parts, total) {
  const spans = [...els.priceBar.children];
  parts.forEach((part, index) => {
    spans[index].style.width = Math.max(0, pct(part, total)) + "%";
  });
}

function updatePoliticalScenario(price) {
  if (!els.partyScenario) return;
  const key = els.partyScenario.value;
  const scenario = politicalScenarios[key];
  const custom = scenario.mode === "custom";

  els.customPolicy.hidden = !custom;
  els.scenarioBadge.textContent = scenario.badge;
  els.scenarioAsOf.textContent = scenario.asOf;
  els.scenarioTitle.textContent = scenario.title;
  els.scenarioSummary.textContent = scenario.summary;
  els.scenarioMethod.textContent = scenario.method;

  if (scenario.source) {
    els.scenarioSource.hidden = false;
    els.scenarioSource.href = scenario.source;
  } else {
    els.scenarioSource.hidden = true;
  }

  let delta = null;
  if (custom) {
    delta = Number(els.policyDelta.value);
    els.policyDeltaValue.textContent = (delta >= 0 ? "+" : "") + fmt(delta) + " kr/l";
  } else if (typeof scenario.delta === "number") {
    delta = scenario.delta;
  }

  if (delta === null) {
    els.scenarioPrice.textContent = "Ej beräkningsbart";
    els.scenarioDelta.textContent = "Officiellt underlag saknar en tillräckligt exakt kr/l-nivå.";
  } else {
    const result = Math.max(0, price + delta);
    els.scenarioPrice.textContent = fmt(result) + " kr/l";
    if (Math.abs(delta) < 0.0001) {
      els.scenarioDelta.textContent = scenario.mode === "claimed_zero"
        ? "Partiets uppgivna mål: ingen höjning vid pump."
        : "Ingen förändring från referenspriset.";
    } else {
      els.scenarioDelta.textContent = (delta > 0 ? "+" : "") + fmt(delta) + " kr/l mot referenspriset.";
    }
  }
}

function update() {
  const price = parseNumber(els.pumpPrice.value);
  const fuel = fuelData[selectedFuel];

  if (!Number.isFinite(price) || price <= 0) return;

  const vat = price - price / 1.25;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const excise = energy + carbon;
  const other = Math.max(0, price / 1.25 - excise);
  const totalTax = vat + excise;
  const taxPct = pct(totalTax, price);

  els.totalPrice.textContent = fmt(price);
  els.energyTax.textContent = fmt(energy) + " kr";
  els.carbonTax.textContent = fmt(carbon) + " kr";
  els.vat.textContent = fmt(vat) + " kr";
  els.other.textContent = fmt(other) + " kr";

  els.energyPct.textContent = fmt(pct(energy, price), 1) + " %";
  els.carbonPct.textContent = fmt(pct(carbon, price), 1) + " %";
  els.vatPct.textContent = fmt(pct(vat, price), 1) + " %";
  els.otherPct.textContent = fmt(pct(other, price), 1) + " %";

  els.taxShare.textContent = fmt(taxPct, 1) + " %";
  els.taxPerLiter.textContent = fmt(totalTax) + " kr/l";

  els.periodText.textContent = "Skattesatserna på sidan gäller " + fuel.period + ".";
  els.barTotal.textContent = fmt(price) + " kr/l";

  const parts = [energy, carbon, vat, other];
  const colors = ["var(--energy)", "var(--carbon)", "var(--vat)", "var(--other)"];

  let cursor = 0;
  const gradient = parts.map((part, index) => {
    const start = cursor;
    cursor += pct(part, price) * 3.6;
    return `${colors[index]} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
  }).join(", ");

  els.donut.style.background = `conic-gradient(${gradient})`;
  els.donut.setAttribute(
    "aria-label",
    `${fuel.label}: ${fmt(taxPct, 1)} procent av pumppriset är energi- och koldioxidskatt samt moms.`
  );

  setBar(parts, price);
  updatePoliticalScenario(price);
}

function normalizeInput(input, digits = 2) {
  const value = parseNumber(input.value);
  if (Number.isFinite(value) && value > 0) {
    input.value = fmt(value, digits);
  }
}

els.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedFuel = tab.dataset.fuel;
    els.tabs.forEach(btn => {
      const active = btn === tab;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    update();
  });
});

els.pumpPrice.addEventListener("input", update);
if (els.partyScenario) els.partyScenario.addEventListener("change", update);
if (els.policyDelta) els.policyDelta.addEventListener("input", update);
els.pumpPrice.addEventListener("blur", () => {
  normalizeInput(els.pumpPrice, 2);
  update();
});

update();