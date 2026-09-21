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

const politicalScenarios = window.POLICY_SCENARIOS || {};
let selectedFuel = "petrol";

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
  policyTax: document.querySelector("#policyTax"),
  policyReduction: document.querySelector("#policyReduction"),
  policyBio: document.querySelector("#policyBio"),
  policyVat: document.querySelector("#policyVat"),
  policySupport: document.querySelector("#policySupport"),
  politicalShareKr: document.querySelector("#politicalShareKr"),
  politicalSharePct: document.querySelector("#politicalSharePct"),
  marketBaseKr: document.querySelector("#marketBaseKr"),

  energySlider: document.querySelector("#energySlider"),
  carbonSlider: document.querySelector("#carbonSlider"),
  vatSlider: document.querySelector("#vatSlider"),
  regulatorySlider: document.querySelector("#regulatorySlider"),
  energySliderValue: document.querySelector("#energySliderValue"),
  carbonSliderValue: document.querySelector("#carbonSliderValue"),
  vatSliderValue: document.querySelector("#vatSliderValue"),
  regulatorySliderValue: document.querySelector("#regulatorySliderValue"),
  customScenarioPrice: document.querySelector("#customScenarioPrice"),
  customScenarioDelta: document.querySelector("#customScenarioDelta"),
  resetPolicy: document.querySelector("#resetPolicy")
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

function signed(value, suffix = " kr/l") {
  if (Math.abs(value) < 0.005) return "0,00" + suffix;
  return (value > 0 ? "+" : "−") + fmt(Math.abs(value)) + suffix;
}

function setBar(parts, total) {
  const spans = [...els.priceBar.children];
  parts.forEach((part, index) => {
    spans[index].style.width = Math.max(0, pct(part, total)) + "%";
  });
}

function getReference(price) {
  const fuel = fuelData[selectedFuel];
  const vat = price - price / 1.25;
  const excise = fuel.energyTax + fuel.carbonTax;
  const marketBase = Math.max(0, price / 1.25 - excise);
  return {
    fuel,
    vat,
    excise,
    marketBase,
    politicalDirect: vat + excise
  };
}

function resetCustomSliders() {
  const fuel = fuelData[selectedFuel];
  els.energySlider.value = fuel.energyTax;
  els.carbonSlider.value = fuel.carbonTax;
  els.vatSlider.value = 25;
  els.regulatorySlider.value = 0;
}

function updateCustomSimulator(price, reference) {
  const energy = Number(els.energySlider.value);
  const carbon = Number(els.carbonSlider.value);
  const vatRate = Number(els.vatSlider.value) / 100;
  const regulatory = Number(els.regulatorySlider.value);

  const pretax = Math.max(0, reference.marketBase + regulatory + energy + carbon);
  const scenarioPrice = pretax * (1 + vatRate);
  const delta = scenarioPrice - price;

  els.energySliderValue.textContent = fmt(energy) + " kr/l";
  els.carbonSliderValue.textContent = fmt(carbon) + " kr/l";
  els.vatSliderValue.textContent = fmt(vatRate * 100, 0) + " %";
  els.regulatorySliderValue.textContent = signed(regulatory);
  els.customScenarioPrice.textContent = fmt(scenarioPrice) + " kr/l";
  els.customScenarioDelta.textContent = signed(delta);
}

function updatePoliticalScenario(price, reference) {
  if (!els.partyScenario) return;

  const scenario = politicalScenarios[els.partyScenario.value] || politicalScenarios.current;
  if (!scenario) return;

  els.scenarioBadge.textContent = scenario.statusLabel;
  els.scenarioBadge.dataset.status = scenario.status;
  els.scenarioAsOf.textContent = scenario.asOf;
  els.scenarioTitle.textContent = scenario.name;
  els.scenarioSummary.textContent = scenario.summary;
  els.scenarioMethod.textContent = scenario.method;
  els.scenarioSource.href = scenario.source;

  els.policyTax.textContent = scenario.policies.tax;
  els.policyReduction.textContent = scenario.policies.reduction;
  els.policyBio.textContent = scenario.policies.bio;
  els.policyVat.textContent = scenario.policies.vat;
  els.policySupport.textContent = scenario.policies.support;

  const model = scenario.priceModel || { type: "not_quantified" };

  if (model.type === "baseline") {
    els.scenarioPrice.textContent = fmt(price) + " kr/l";
    els.scenarioDelta.textContent = "Referenspris – ingen scenarioförändring.";
    return;
  }

  if (model.type === "party_delta") {
    const result = Math.max(0, price + model.delta);
    els.scenarioPrice.textContent = fmt(result) + " kr/l";
    els.scenarioDelta.textContent = signed(model.delta) + " enligt partiets egen publicerade beräkning.";
    return;
  }

  if (model.type === "stated_target") {
    const result = Math.max(0, price + model.delta);
    els.scenarioPrice.textContent = fmt(result) + " kr/l";
    els.scenarioDelta.textContent = "Partiets uttalade mål: " + signed(model.delta) + ". Inte oberoende verifierat.";
    return;
  }

  els.scenarioPrice.textContent = "Ej exakt beräkningsbart";
  els.scenarioDelta.textContent = "Minst en nödvändig parameter saknar en publicerad exakt nivå.";
}

function update() {
  const price = parseNumber(els.pumpPrice.value);
  if (!Number.isFinite(price) || price <= 0) return;

  const reference = getReference(price);
  const { fuel, vat, excise, marketBase, politicalDirect } = reference;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const totalTax = politicalDirect;
  const taxPct = pct(totalTax, price);

  els.totalPrice.textContent = fmt(price);
  els.energyTax.textContent = fmt(energy) + " kr";
  els.carbonTax.textContent = fmt(carbon) + " kr";
  els.vat.textContent = fmt(vat) + " kr";
  els.other.textContent = fmt(marketBase) + " kr";

  els.energyPct.textContent = fmt(pct(energy, price), 1) + " %";
  els.carbonPct.textContent = fmt(pct(carbon, price), 1) + " %";
  els.vatPct.textContent = fmt(pct(vat, price), 1) + " %";
  els.otherPct.textContent = fmt(pct(marketBase, price), 1) + " %";

  els.taxShare.textContent = fmt(taxPct, 1) + " %";
  els.taxPerLiter.textContent = fmt(totalTax) + " kr/l";
  els.periodText.textContent = "Skattesatserna på sidan gäller " + fuel.period + ".";
  els.barTotal.textContent = fmt(price) + " kr/l";

  els.politicalShareKr.textContent = fmt(politicalDirect) + " kr/l";
  els.politicalSharePct.textContent = fmt(taxPct, 1) + " % av pumppriset";
  els.marketBaseKr.textContent = fmt(marketBase) + " kr/l";

  const parts = [energy, carbon, vat, marketBase];
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
  updatePoliticalScenario(price, reference);
  updateCustomSimulator(price, reference);
}

function normalizeInput(input, digits = 2) {
  const value = parseNumber(input.value);
  if (Number.isFinite(value) && value > 0) input.value = fmt(value, digits);
}

els.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedFuel = tab.dataset.fuel;
    els.tabs.forEach(btn => {
      const active = btn === tab;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    resetCustomSliders();
    update();
  });
});

els.pumpPrice.addEventListener("input", update);
els.pumpPrice.addEventListener("blur", () => {
  normalizeInput(els.pumpPrice, 2);
  update();
});

if (els.partyScenario) els.partyScenario.addEventListener("change", update);

[els.energySlider, els.carbonSlider, els.vatSlider, els.regulatorySlider]
  .filter(Boolean)
  .forEach(input => input.addEventListener("input", update));

if (els.resetPolicy) {
  els.resetPolicy.addEventListener("click", () => {
    resetCustomSliders();
    update();
  });
}

resetCustomSliders();
update();
