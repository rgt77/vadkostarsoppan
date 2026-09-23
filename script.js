(() => {
  "use strict";

  const fuelData = window.FUEL_DATA ?? {};
  const siteData = window.SITE_DATA ?? {};
  const countyData = window.COUNTY_PRICES ?? {};
  const scenarios = window.POLICY_SCENARIOS ?? {};

  const tankLiters = Number(siteData.typicalTankLiters) || 40;
  const areas = [countyData.national, ...(countyData.counties ?? [])].filter(Boolean);
  const areasById = new Map(areas.map(area => [area.id, area]));
  const partyOrder = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
  const partyLogos = {
    c: "https://commons.wikimedia.org/wiki/Special:FilePath/C%20v1.svg",
    kd: "https://commons.wikimedia.org/wiki/Special:FilePath/Kd%20v1.svg",
    l: "https://commons.wikimedia.org/wiki/Special:FilePath/L%20v1.svg",
    mp: "/party-logos/mp.png",
    m: "https://commons.wikimedia.org/wiki/Special:FilePath/Moderate%20Party%20logo.svg",
    s: "/party-logos/s.png",
    sd: "https://www.sd.se/wp-content/uploads/2022/07/logo_sd_logo_blasippa.png",
    v: "https://commons.wikimedia.org/wiki/Special:FilePath/V%C3%A4nsterpartiet%20logo.svg"
  };

  const $ = id => document.getElementById(id);
  const els = {
    fuelButtons: [...document.querySelectorAll("[data-fuel]")],
    tankLiterLabels: [...document.querySelectorAll("[data-tank-liters]")],
    countySelect: $("countySelect"),
    partyGrid: $("partyGrid"),
    updatedLabel: $("updatedLabel"),
    fuelLabel: $("fuelLabel"),
    areaLabel: $("areaLabel"),
    tankTotal: $("tankTotal"),
    literPrice: $("literPrice"),
    marketTank: $("marketTank"),
    energyTank: $("energyTank"),
    carbonTank: $("carbonTank"),
    vatTank: $("vatTank"),
    taxTank: $("taxTank"),
    taxShare: $("taxShare"),
    partyResult: $("partyResult"),
    scenarioLabel: $("scenarioLabel"),
    scenarioTankPrice: $("scenarioTankPrice"),
    scenarioTankUnit: $("scenarioTankUnit"),
    scenarioLiterPrice: $("scenarioLiterPrice"),
    scenarioDelta: $("scenarioDelta"),
    scenarioNote: $("scenarioNote"),
    partySource: $("partySource"),
    priceSource: $("priceSource"),
    taxSource: $("taxSource")
  };

  const state = {
    fuel: fuelData[siteData.defaultFuel] ? siteData.defaultFuel : "petrol",
    county: areasById.has("riket") ? "riket" : areas[0]?.id,
    party: ""
  };

  const money = new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const wholePercent = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });

  const fmt = value => Number.isFinite(value) ? money.format(value) : "—";
  const setText = (node, value) => {
    if (node.textContent !== value) node.textContent = value;
  };

  function getArea() {
    return areasById.get(state.county) ?? areas[0];
  }

  function getPrice() {
    return Number(getArea()?.[state.fuel]);
  }

  function calculate(price) {
    const fuel = fuelData[state.fuel];
    if (!fuel || !Number.isFinite(price)) return null;

    const beforeVat = price / (1 + fuel.vatRate / 100);
    const vat = price - beforeVat;
    const market = beforeVat - fuel.energyTax - fuel.carbonTax;

    if (!Number.isFinite(market) || market < 0) return null;

    return {
      fuel,
      vat,
      market,
      tax: fuel.energyTax + fuel.carbonTax + vat
    };
  }

  function scenarioPrice(basePrice, scenario) {
    const model = scenario?.priceModel;
    return ["party_delta", "stated_target"].includes(model?.type) && Number.isFinite(model.delta)
      ? basePrice + model.delta
      : null;
  }

  function loadStateFromUrl() {
    const params = new URLSearchParams(location.search);
    const fuel = params.get("fuel");
    const county = params.get("county");
    const party = params.get("party");

    if (fuelData[fuel]) state.fuel = fuel;
    if (areasById.has(county)) state.county = county;
    if (partyOrder.includes(party) && scenarios[party]) state.party = party;
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set("fuel", state.fuel);
    url.searchParams.set("county", state.county);
    state.party ? url.searchParams.set("party", state.party) : url.searchParams.delete("party");

    const next = url.pathname + url.search + url.hash;
    const current = location.pathname + location.search + location.hash;
    if (next !== current) history.replaceState(null, "", next);
  }

  function buildCountySelect() {
    const fragment = document.createDocumentFragment();

    for (const area of areas) {
      const option = document.createElement("option");
      option.value = area.id;
      option.textContent = area.name;
      fragment.append(option);
    }

    els.countySelect.replaceChildren(fragment);
    els.countySelect.value = state.county;
  }

  function buildPartyButtons() {
    const fragment = document.createDocumentFragment();

    for (const key of partyOrder) {
      const scenario = scenarios[key];
      if (!scenario) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "party-button";
      button.dataset.party = key;
      button.setAttribute("aria-label", scenario.name);

      const logoBox = document.createElement("span");
      logoBox.className = "party-logo-box " + key;

      const image = document.createElement("img");
      image.className = "party-logo";
      image.src = partyLogos[key];
      image.alt = "";
      image.decoding = "async";
      image.addEventListener("error", () => button.classList.add("logo-failed"), { once: true });

      const fallback = document.createElement("span");
      fallback.className = "party-abbr";
      fallback.textContent = key.toUpperCase();

      const label = document.createElement("span");
      label.className = "party-name";
      label.textContent = key.toUpperCase();

      logoBox.append(image, fallback);
      button.append(logoBox, label);
      fragment.append(button);
    }

    els.partyGrid.replaceChildren(fragment);
    updatePartySelection();
  }

  function updatePartySelection() {
    for (const button of els.partyGrid.children) {
      button.setAttribute("aria-pressed", String(button.dataset.party === state.party));
    }
  }

  function renderScenario(basePrice) {
    const scenario = scenarios[state.party];

    els.partyResult.className = "party-result";
    els.scenarioTankPrice.className = "";
    els.scenarioDelta.className = "party-delta";

    if (!scenario) {
      els.partyResult.classList.add("empty");
      setText(els.scenarioLabel, "Välj ett parti");
      setText(els.scenarioTankPrice, "—");
      els.scenarioTankUnit.hidden = false;
      setText(els.scenarioLiterPrice, "— kr/l");
      setText(els.scenarioDelta, "—");
      setText(els.scenarioNote, "Om ett parti inte har publicerat tillräckligt exakta nivåer visar vi inget påhittat pris.");
      els.partySource.hidden = true;
      return;
    }

    setText(els.scenarioLabel, scenario.name);
    const resultLiter = scenarioPrice(basePrice, scenario);

    if (resultLiter === null) {
      els.partyResult.classList.add("unavailable");
      els.scenarioTankPrice.classList.add("text-result");
      setText(els.scenarioTankPrice, "Ej möjligt att räkna exakt");
      els.scenarioTankUnit.hidden = true;
      setText(els.scenarioLiterPrice, "");
      setText(els.scenarioDelta, "");
      setText(els.scenarioNote, scenario.method);
    } else {
      const baseTank = basePrice * tankLiters;
      const resultTank = resultLiter * tankLiters;
      const deltaTank = resultTank - baseTank;

      setText(els.scenarioTankPrice, fmt(resultTank));
      els.scenarioTankUnit.hidden = false;
      setText(els.scenarioLiterPrice, fmt(resultLiter) + " kr/l");

      if (Math.abs(deltaTank) < 0.005) {
        setText(els.scenarioDelta, "Samma tankkostnad");
      } else {
        const sign = deltaTank > 0 ? "+" : "−";
        setText(els.scenarioDelta, sign + fmt(Math.abs(deltaTank)) + " kr per " + tankLiters + " l");
        els.scenarioDelta.classList.add(deltaTank > 0 ? "positive" : "negative");
      }

      if (scenario.priceModel.type === "party_delta") {
        const deltaLiter = resultLiter - basePrice;
        const sign = deltaLiter >= 0 ? "+" : "−";
        setText(
          els.scenarioNote,
          scenario.method +
          " För " + tankLiters + " liter motsvarar " + sign + fmt(Math.abs(deltaLiter)) +
          " kr/l en skillnad på " + fmt(Math.abs(deltaTank)) + " kr."
        );
      } else {
        setText(els.scenarioNote, scenario.method);
      }
    }

    els.partySource.href = scenario.source;
    els.partySource.hidden = false;
  }

  function render() {
    const price = getPrice();
    const area = getArea();
    const ref = calculate(price);

    if (!area || !ref) {
      setText(els.tankTotal, "Data saknas");
      return;
    }

    for (const button of els.fuelButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.fuel === state.fuel));
    }

    setText(els.fuelLabel, ref.fuel.label);
    setText(els.areaLabel, area.name);
    setText(els.tankTotal, fmt(price * tankLiters));
    setText(els.literPrice, fmt(price));
    setText(els.marketTank, fmt(ref.market * tankLiters) + " kr");
    setText(els.energyTank, fmt(ref.fuel.energyTax * tankLiters) + " kr");
    setText(els.carbonTank, fmt(ref.fuel.carbonTax * tankLiters) + " kr");
    setText(els.vatTank, fmt(ref.vat * tankLiters) + " kr");
    setText(els.taxTank, fmt(ref.tax * tankLiters) + " kr");
    setText(els.taxShare, wholePercent.format(ref.tax / price * 100) + " % av tankningen");
    setText(els.updatedLabel, countyData.updatedAt ? "Prisdata " + countyData.updatedAt : "Prisdata");

    els.priceSource.href = countyData.source;
    els.taxSource.href = ref.fuel.taxSource;

    renderScenario(price);
    syncUrl();
  }

  function bindEvents() {
    for (const button of els.fuelButtons) {
      button.addEventListener("click", () => {
        state.fuel = button.dataset.fuel;
        render();
      });
    }

    els.countySelect.addEventListener("change", () => {
      state.county = els.countySelect.value;
      render();
    });

    els.partyGrid.addEventListener("click", event => {
      const button = event.target.closest("[data-party]");
      if (!button) return;

      state.party = button.dataset.party;
      updatePartySelection();
      renderScenario(getPrice());
      syncUrl();
    });
  }

  loadStateFromUrl();
  buildCountySelect();
  buildPartyButtons();
  for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  bindEvents();
  render();
})();
