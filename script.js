const fuelData = window.FUEL_DATA || {};
const siteData = window.SITE_DATA || {};
const countyData = window.COUNTY_PRICES || {};
const politicalScenarios = window.POLICY_SCENARIOS || {};

const els = {
  fuelButtons: [...document.querySelectorAll("[data-fuel]")],
  countySelect: document.querySelector("#countySelect"),
  partySelect: document.querySelector("#partySelect"),
  updatedLabel: document.querySelector("#updatedLabel"),
  fuelLabel: document.querySelector("#fuelLabel"),
  areaLabel: document.querySelector("#areaLabel"),
  currentPrice: document.querySelector("#currentPrice"),
  marketValue: document.querySelector("#marketValue"),
  energyValue: document.querySelector("#energyValue"),
  carbonValue: document.querySelector("#carbonValue"),
  vatValue: document.querySelector("#vatValue"),
  taxTotal: document.querySelector("#taxTotal"),
  taxShare: document.querySelector("#taxShare"),
  barMarket: document.querySelector("#barMarket"),
  barEnergy: document.querySelector("#barEnergy"),
  barCarbon: document.querySelector("#barCarbon"),
  barVat: document.querySelector("#barVat"),
  partyResult: document.querySelector("#partyResult"),
  scenarioLabel: document.querySelector("#scenarioLabel"),
  scenarioPrice: document.querySelector("#scenarioPrice"),
  scenarioUnit: document.querySelector("#scenarioUnit"),
  scenarioDelta: document.querySelector("#scenarioDelta"),
  scenarioNote: document.querySelector("#scenarioNote"),
  partySource: document.querySelector("#partySource"),
  priceSource: document.querySelector("#priceSource"),
  taxSource: document.querySelector("#taxSource")
};

let selectedFuel = siteData.defaultFuel || "petrol";
let selectedCounty = "riket";

const nf = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const pf = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

function fmt(value) {
  return Number.isFinite(value) ? nf.format(value) : "—";
}

function areaEntries() {
  return [countyData.national, ...(countyData.counties || [])].filter(Boolean);
}

function areaEntry(id = selectedCounty) {
  return areaEntries().find(item => item.id === id) || countyData.national;
}

function pumpPrice() {
  const area = areaEntry();
  return Number(area?.[selectedFuel]);
}

function reference(price) {
  const fuel = fuelData[selectedFuel];
  if (!fuel || !Number.isFinite(price)) return null;

  const vatRate = fuel.vatRate / 100;
  const beforeVat = price / (1 + vatRate);
  const vat = price - beforeVat;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const market = Math.max(0, beforeVat - energy - carbon);
  const tax = energy + carbon + vat;

  return { fuel, price, vat, energy, carbon, market, tax };
}

function setBar(node, value, total) {
  if (!node) return;
  node.style.width = total > 0 ? Math.max(0, value / total * 100) + "%" : "0%";
}

function populateCounties() {
  if (!els.countySelect) return;
  els.countySelect.innerHTML = "";
  for (const item of areaEntries()) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    els.countySelect.appendChild(option);
  }
  els.countySelect.value = selectedCounty;
}

function populateParties() {
  if (!els.partySelect) return;
  const partyOrder = ["c","kd","l","mp","m","s","sd","v"];
  for (const key of partyOrder) {
    const scenario = politicalScenarios[key];
    if (!scenario) continue;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = scenario.name;
    els.partySelect.appendChild(option);
  }
}

function scenarioPriceFor(basePrice, scenario) {
  const model = scenario?.priceModel;
  if (!model) return null;

  if (model.type === "baseline") return basePrice;
  if ((model.type === "party_delta" || model.type === "stated_target") && Number.isFinite(model.delta)) {
    return basePrice + model.delta;
  }
  return null;
}

function renderScenario(basePrice) {
  const key = els.partySelect?.value || "";
  const scenario = politicalScenarios[key];

  els.scenarioDelta.className = "scenario-delta";
  els.partyResult.className = "party-result";
  els.scenarioPrice.className = "scenario-price";

  if (!scenario) {
    els.partyResult.classList.add("empty");
    els.scenarioLabel.textContent = "Välj ett parti";
    els.scenarioPrice.textContent = "—";
    els.scenarioUnit.hidden = false;
    els.scenarioDelta.textContent = "—";
    els.scenarioNote.textContent = "När ett parti inte har publicerat tillräckligt exakta nivåer visar vi inget påhittat pris.";
    els.partySource.hidden = true;
    return;
  }

  const result = scenarioPriceFor(basePrice, scenario);
  els.scenarioLabel.textContent = scenario.name;

  if (result === null) {
    els.partyResult.classList.add("unavailable");
    els.scenarioPrice.classList.add("text-result");
    els.scenarioPrice.textContent = "Ej möjligt att räkna exakt";
    els.scenarioUnit.hidden = true;
    els.scenarioDelta.textContent = "";
    els.scenarioNote.textContent = scenario.method || "Det saknas tillräckligt exakta, publicerade nivåer för ett kr/l-resultat.";
  } else {
    const delta = result - basePrice;
    els.scenarioPrice.textContent = fmt(result);
    els.scenarioUnit.hidden = false;
    els.scenarioDelta.textContent =
      Math.abs(delta) < 0.005
        ? "0,00 kr/l mot idag"
        : (delta > 0 ? "+" : "−") + fmt(Math.abs(delta)) + " kr/l mot idag";
    if (delta > 0.005) els.scenarioDelta.classList.add("positive");
    if (delta < -0.005) els.scenarioDelta.classList.add("negative");

    if (scenario.priceModel?.type === "party_delta") {
      els.scenarioNote.textContent = (scenario.method || "") + " Detta är partiets angivna priseffekt applicerad på dagens referenspris.";
    } else if (scenario.priceModel?.type === "stated_target") {
      els.scenarioNote.textContent = scenario.method || "Detta bygger på partiets uttalade mål, inte en oberoende prognos.";
    } else {
      els.scenarioNote.textContent = scenario.method || "";
    }
  }

  if (scenario.source) {
    els.partySource.href = scenario.source;
    els.partySource.hidden = false;
  } else {
    els.partySource.hidden = true;
  }
}

function render() {
  const price = pumpPrice();
  const ref = reference(price);
  const area = areaEntry();
  if (!ref || !area) return;

  els.fuelButtons.forEach(button => {
    const active = button.dataset.fuel === selectedFuel;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  els.fuelLabel.textContent = ref.fuel.label;
  els.areaLabel.textContent = area.name;
  els.currentPrice.textContent = fmt(price);

  els.marketValue.textContent = fmt(ref.market) + " kr";
  els.energyValue.textContent = fmt(ref.energy) + " kr";
  els.carbonValue.textContent = fmt(ref.carbon) + " kr";
  els.vatValue.textContent = fmt(ref.vat) + " kr";

  els.taxTotal.textContent = fmt(ref.tax);
  els.taxShare.textContent = pf.format(ref.tax / price * 100) + " % av literpriset";

  setBar(els.barMarket, ref.market, price);
  setBar(els.barEnergy, ref.energy, price);
  setBar(els.barCarbon, ref.carbon, price);
  setBar(els.barVat, ref.vat, price);

  els.updatedLabel.textContent = countyData.updatedAt ? "Prisdata " + countyData.updatedAt : "Prisdata";
  if (els.priceSource && countyData.source) els.priceSource.href = countyData.source;
  if (els.taxSource && ref.fuel.taxSource) els.taxSource.href = ref.fuel.taxSource;

  renderScenario(price);

  const url = new URL(window.location.href);
  url.searchParams.set("fuel", selectedFuel);
  url.searchParams.set("county", selectedCounty);
  if (els.partySelect?.value) url.searchParams.set("party", els.partySelect.value);
  else url.searchParams.delete("party");
  history.replaceState(null, "", url);
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fuel = params.get("fuel");
  const county = params.get("county");
  const party = params.get("party");

  if (fuelData[fuel]) selectedFuel = fuel;
  if (areaEntries().some(item => item.id === county)) selectedCounty = county;
  if (party && politicalScenarios[party] && els.partySelect) els.partySelect.value = party;
}

els.fuelButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedFuel = button.dataset.fuel;
    render();
  });
});

els.countySelect?.addEventListener("change", () => {
  selectedCounty = els.countySelect.value;
  render();
});

els.partySelect?.addEventListener("change", render);

populateCounties();
populateParties();
loadFromUrl();
if (els.countySelect) els.countySelect.value = selectedCounty;
render();
