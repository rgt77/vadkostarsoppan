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
  const evidenceLabels = { party_estimate: "Partiets uppskattning", party_stated_target: "Partiets uttalade mål", not_quantified: "Ej numeriskt kvantifierat" };
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
    scenarioReferenceDate: $("scenarioReferenceDate"),
    scenarioMeta: $("scenarioMeta"),
    scenarioReset: $("scenarioReset"),
    scenarioComparison: $("scenarioComparison"),
    scenarioBaseTank: $("scenarioBaseTank"),
    scenarioResultTank: $("scenarioResultTank"),
    policyFacts: $("policyFacts"),
    priceSource: $("priceSource"),
    taxSource: $("taxSource"),
    dataStatus: $("dataStatus"),
    priceTrend: $("priceTrend"),
    trend7: $("trend7"),
    trend30: $("trend30")
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
  const swedishDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const fmt = value => Number.isFinite(value) ? money.format(value) : "—";
  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  function todayIso() {
    return swedishDate.format(new Date());
  }

  function daysBetween(olderIso, newerIso = todayIso()) {
    if (!olderIso || !newerIso) return null;
    const older = Date.parse(olderIso + "T12:00:00Z");
    const newer = Date.parse(newerIso + "T12:00:00Z");
    return Number.isFinite(older) && Number.isFinite(newer)
      ? Math.floor((newer - older) / 86400000)
      : null;
  }

  function getArea() {
    return areasById.get(state.county) ?? areas[0];
  }

  function getPrice() {
    const area = getArea();
    const local = Number(area?.[state.fuel]);
    if (Number.isFinite(local) && local > 0) return local;
    const national = Number(countyData.national?.[state.fuel]);
    return Number.isFinite(national) ? national : NaN;
  }

  function getTaxPeriod(fuel, date = todayIso()) {
    return fuel?.taxPeriods?.find(period => period.validFrom <= date && date <= period.validTo) ?? null;
  }

  function calculate(price) {
    const fuel = fuelData[state.fuel];
    const taxPeriod = getTaxPeriod(fuel);
    if (!fuel || !Number.isFinite(price)) return null;

    if (fuel.taxModel === "blend_dependent") {
      const beforeVat = price / (1 + fuel.vatRate / 100);
      const vat = price - beforeVat;
      return { fuel, taxPeriod: null, vat, market: beforeVat, tax: vat, blendDependent: true };
    }
    if (!taxPeriod) return null;

    const beforeVat = price / (1 + fuel.vatRate / 100);
    const vat = price - beforeVat;
    const market = beforeVat - taxPeriod.energyTax - taxPeriod.carbonTax;

    if (!Number.isFinite(market) || market < 0) return null;

    return {
      fuel,
      taxPeriod,
      vat,
      market,
      tax: taxPeriod.energyTax + taxPeriod.carbonTax + vat
    };
  }

  function scenarioPrice(basePrice, scenario) {
    const model = scenario?.priceModel;
    if (!["party_delta", "stated_target"].includes(model?.type) || !Number.isFinite(model.delta)) return null;
    const referenceDate = countyData.updatedAt || todayIso();
    if (model.validFrom && referenceDate < model.validFrom) return null;
    if (model.validTo && referenceDate > model.validTo) return null;
    if (Array.isArray(model.fuels) && !model.fuels.includes(state.fuel)) return null;
    return basePrice + model.delta;
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
    if (!els.countySelect || !areas.length) return;
    const fragment = document.createDocumentFragment();

    for (const area of areas) {
      const option = document.createElement("option");
      option.value = area.id;
      option.textContent = area.name;
      fragment.append(option);
    }

    els.countySelect.replaceChildren(fragment);
    els.countySelect.value = state.county;
    if (!els.countySelect.value && areas[0]) { state.county = areas[0].id; els.countySelect.value = state.county; }
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
      button.setAttribute("aria-pressed", "false");

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

    els.partyGrid?.replaceChildren(fragment);
    updatePartySelection();
  }

  function updatePartySelection() {
    for (const button of els.partyGrid?.children ?? []) {
      button.setAttribute("aria-pressed", String(button.dataset.party === state.party));
    }
  }

  function renderScenario(basePrice) {
    const scenario = scenarios[state.party];
    setText(els.scenarioReferenceDate, countyData.updatedAt || "—");
    if (els.scenarioReset) els.scenarioReset.hidden = !scenario;
    if (els.scenarioComparison) els.scenarioComparison.hidden = true;
    if (els.policyFacts) { els.policyFacts.hidden = true; els.policyFacts.replaceChildren(); }

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
      if (els.scenarioMeta) { els.scenarioMeta.hidden = true; els.scenarioMeta.textContent = ""; }
      return;
    }

    setText(els.scenarioLabel, scenario.name);
    if (els.scenarioMeta) {
      els.scenarioMeta.hidden = false;
      els.scenarioMeta.textContent = (evidenceLabels[scenario.evidence] || "Källbundet scenario") + " · referenspris " + (countyData.updatedAt || "—") + " · källan verifierad " + (scenario.verifiedAt || "—");
    }
    const resultLiter = scenarioPrice(basePrice, scenario);

    if (resultLiter === null) {
      els.partyResult.classList.add("unavailable");
      els.scenarioTankPrice.classList.add("text-result");
      setText(els.scenarioTankPrice, "Ej möjligt att räkna exakt");
      els.scenarioTankUnit.hidden = true;
      setText(els.scenarioLiterPrice, "");
      setText(els.scenarioDelta, "");
      setText(els.scenarioNote, scenario.method + (scenario.priceModel?.validFrom ? " Den valda bränsletypen eller referensdagen ligger utanför det dokumenterade scenariots giltighet." : ""));
    } else {
      const baseTank = basePrice * tankLiters;
      const resultTank = resultLiter * tankLiters;
      const deltaTank = resultTank - baseTank;
      if (els.scenarioComparison) els.scenarioComparison.hidden = false;
      setText(els.scenarioBaseTank, fmt(baseTank) + " kr");
      setText(els.scenarioResultTank, fmt(resultTank) + " kr");

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

    if (state.party === "s" && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = "Den 20 mars 2026 krävde Socialdemokraterna en tillfällig skattesänkning på bensin och diesel för att dämpa effekten av stigande drivmedelspriser. Den officiella källan anger ingen exakt skattesänkning eller kr/l-effekt, så hemsidan visar förslaget men konstruerar inget S-pris.";
      els.policyFacts.append(title, text);
    }
    if (state.party === "l" && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = "Liberalernas klimatrapport beskriver reduktionsplikten som en övergångslösning medan fordonsflottan elektrifieras och att biodrivmedel på sikt bör prioriteras till sektorer som är svårare att elektrifiera. Senare liberal dokumentation anger 10 % reduktionsplikt för bensin och diesel, kombinerad med sänkt drivmedelsskatt för att motverka priseffekten. Underlaget anger ingen tillräckligt specificerad aktuell kr/l-nivå, därför konstrueras inget L-pris.";
      els.policyFacts.append(title, text);
    }
    if (state.party === "kd" && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = "KD:s officiella underlag från 27 augusti 2024 beskriver en ändrad mix mellan drivmedelsskatt och reduktionsplikt. Ett tidigare KD-underlag anger 6 % reduktionsplikt för både bensin och diesel från 1 januari 2024 och uppskattade då att diesel kunde bli 5,50 kr/l billigare. 5,50 kr/l visas endast som KD:s historiska uppskattning och används inte som ett aktuellt 2026-prisscenario.";
      els.policyFacts.append(title, text);
    }
    if (state.party === "m" && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = "Moderaternas officiella underlag anger cirka 1,03 kr/l lägre bensinpris och 0,40 kr/l lägre dieselpris vid full prisövervältring från skattesänkningen till EU:s miniminivå, samt en ytterligare tillfällig sänkning på 3 kr/l från 1 juli till 30 november 2026. Partiet anger också 10 % reduktionsplikt för både bensin och diesel. Uppgifterna används som dokumenterad bakgrund, inte som ett permanent framtida M-pris.";
      els.policyFacts.append(title, text);
    }
    if (state.party === "sd" && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = "SD:s officiella drivmedelssida redovisar Bensin 95: 23,54 → 14,34 kr/l och diesel: 26,46 → 16,09 kr/l (juni 2022–juli 2026). Sidan anger även reduktionsplikt 2022 på 7,8 % för bensin och 30,5 % för diesel samt 6 % från 1 januari 2024. Uppgifterna visas som historiskt/politiskt underlag och används inte som ett beräknat framtida SD-pris.";
      els.policyFacts.append(title, text);
    }
    els.partySource.href = scenario.source;
    els.partySource.hidden = false;
    els.partySource.setAttribute("aria-label", "Öppna officiell källa för " + scenario.name);
  }

  function renderDataStatus(ref) {
    const age = daysBetween(countyData.updatedAt);
    const warningAfter = Number(siteData.priceWarningAfterDays) || 2;
    const priceStatus = age === null
      ? "okänt datum"
      : age <= 0
        ? "uppdaterad idag"
        : age === 1
          ? "1 dag gammal"
          : age + " dagar gammal";

    setText(
      els.updatedLabel,
      "Prisdata " + (countyData.updatedAt || "—") + (age !== null && age > warningAfter ? " · kontrollera" : "")
    );

    if (ref?.blendDependent) {
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Prisdata " + priceStatus + ". För E85 beror punktskatten på bränslets faktiska bio-/bensinandel; vi visar därför inte en konstruerad fast punktskatt.";
    } else if (ref?.taxPeriod) {
      els.dataStatus.innerHTML =
        "<strong>Datastatus</strong> Prisdata " + priceStatus +
        ". Skattesatsen gäller " + ref.taxPeriod.validFrom + "–" + ref.taxPeriod.validTo +
        ". Partikällorna är källmärkta med verifieringsdatum.";
    } else {
      els.dataStatus.innerHTML =
        "<strong>Datastatus</strong> Ingen giltig skatteperiod finns för dagens datum. Kalkylen behöver uppdateras.";
    }
  }

  let priceHistory = null;

  function historyPrice(snapshot) {
    const area = state.county === "riket"
      ? snapshot?.national
      : snapshot?.counties?.find(item => item.id === state.county);
    const value = Number(area?.[state.fuel]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function renderTrend(currentPrice) {
    const snapshots = priceHistory?.snapshots ?? [];
    if (!snapshots.length || !Number.isFinite(currentPrice)) { els.priceTrend.hidden = true; return; }
    const latestDate = countyData.updatedAt;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(latestDate || "")) { els.priceTrend.hidden = true; return; }
    const metric = days => {
      const target = Date.parse(latestDate + "T12:00:00Z") - days * 86400000;
      const candidates = snapshots
        .map(item => ({ item, distance: Math.abs(Date.parse(item.date + "T12:00:00Z") - target) }))
        .filter(entry => Number.isFinite(entry.distance) && entry.distance <= (Number(siteData.trendToleranceDays) || 3) * 86400000)
        .sort((a, b) => a.distance - b.distance);
      const oldPrice = historyPrice(candidates[0]?.item);
      return oldPrice === null ? null : currentPrice - oldPrice;
    };
    const show = (node, days, delta) => setText(node, days + " dagar " + (delta === null ? "—" : (Math.abs(delta) < .005 ? "±0,00 kr/l" : (delta > 0 ? "+" : "−") + fmt(Math.abs(delta)) + " kr/l")));
    const d7 = metric(7), d30 = metric(30);
    show(els.trend7, 7, d7); show(els.trend30, 30, d30);
    els.priceTrend.hidden = d7 === null && d30 === null;
  }

  function render() {
    const price = getPrice();
    const area = getArea();
    const ref = calculate(price);

    if (!area || !ref) {
      setText(els.tankTotal, "Data saknas");
      setText(els.literPrice, "—");
      renderDataStatus(ref);
      return;
    }

    for (const button of els.fuelButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.fuel === state.fuel));
    }

    setText(els.fuelLabel, ref.fuel.label);
    const hasLocalPrice = Number.isFinite(Number(area?.[state.fuel])) && Number(area?.[state.fuel]) > 0;
    setText(els.areaLabel, hasLocalPrice || area.id === "riket" ? area.name : area.name + " · rikssnitt");
    setText(els.tankTotal, fmt(price * tankLiters));
    setText(els.literPrice, fmt(price));
    setText(els.marketTank, fmt(ref.market * tankLiters) + " kr");
    setText(els.energyTank, ref.blendDependent ? "Ingår i bränslemixen" : fmt(ref.taxPeriod.energyTax * tankLiters) + " kr");
    setText(els.carbonTank, ref.blendDependent ? "Ingår i bränslemixen" : fmt(ref.taxPeriod.carbonTax * tankLiters) + " kr");
    setText(els.vatTank, fmt(ref.vat * tankLiters) + " kr");
    setText(els.taxTank, fmt(ref.tax * tankLiters) + " kr");
    setText(els.taxShare, wholePercent.format(ref.tax / price * 100) + " % av tankningen");

    els.priceSource.href = countyData.source;
    els.taxSource.href = ref.fuel.taxSource;

    renderDataStatus(ref);
    renderTrend(price);
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

    els.countySelect?.addEventListener("change", () => {
      state.county = els.countySelect.value;
      render();
    });

    els.scenarioReset?.addEventListener("click", () => {
      state.party = "";
      updatePartySelection();
      renderScenario(getPrice());
      syncUrl();
    });

    els.partyGrid?.addEventListener("keydown", event => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      const buttons = [...els.partyGrid.querySelectorAll("[data-party]")];
      const current = Math.max(0, buttons.indexOf(document.activeElement));
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault(); buttons[next]?.focus();
    });

    els.partyGrid?.addEventListener("click", event => {
      const button = event.target.closest("[data-party]");
      if (!button) return;

      state.party = button.dataset.party;
      updatePartySelection();
      renderScenario(getPrice());
      syncUrl();
    });
  }

  window.addEventListener("popstate", () => { loadStateFromUrl(); if (els.countySelect) els.countySelect.value = state.county; updatePartySelection(); render(); });

  loadStateFromUrl();
  buildCountySelect();
  buildPartyButtons();
  for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  bindEvents();
  render();
  fetch("/data/price-history.json", { cache: "no-store" })
    .then(response => response.ok ? response.json() : null)
    .then(data => { priceHistory = data; renderTrend(getPrice()); })
    .catch(() => {});
})();
