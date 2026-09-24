(() => {
  "use strict";

  const fuelData = window.FUEL_DATA ?? {};
  const siteData = window.SITE_DATA ?? {};
  const priceData = window.PRICE_DATA ?? {};
  const scenarios = window.POLICY_SCENARIOS ?? {};

  let tankLiters = Number(siteData.typicalTankLiters) || 40;
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

  const policyBackground = {
      "v": "Vänsterpartiet beskriver drivmedelsbeskattning som ett klimatstyrmedel men vill ekonomiskt kompensera personer som saknar alternativ till bilen, särskilt i gles- och landsbygd och hushåll med lägre inkomster. Partiet vill på sikt ha geografiskt differentierad vägtrafikbeskattning med lägre skatt på landsbygden och högre i städer. V vill också höja reduktionsplikten från 10 %, men anger ingen exakt ny nivå. Därför konstrueras inget V-pris.",
      "c": "Centerpartiets klimatplan från 6 augusti 2026 vill ta bort skatten på biodrivmedel som blandas in i bensin och diesel, med målet att kunna öka inblandningen utan att priset vid pump stiger. Planen innehåller också elektrifieringsmål för 2030: 90 % av nya personbilar, 75 % av nya lätta lastbilar och 50 % av nya tunga lastbilar ska vara helt eldrivna.",
      "s": "Den 20 mars 2026 krävde Socialdemokraterna en tillfällig skattesänkning på bensin och diesel för att dämpa effekten av stigande drivmedelspriser. Den officiella källan anger ingen exakt skattesänkning eller kr/l-effekt, så hemsidan visar förslaget men konstruerar inget S-pris.",
      "l": "Liberalernas klimatrapport beskriver reduktionsplikten som en övergångslösning medan fordonsflottan elektrifieras och att biodrivmedel på sikt bör prioriteras till sektorer som är svårare att elektrifiera. Senare liberal dokumentation anger 10 % reduktionsplikt för bensin och diesel, kombinerad med sänkt drivmedelsskatt för att motverka priseffekten. Underlaget anger ingen tillräckligt specificerad aktuell kr/l-nivå, därför konstrueras inget L-pris.",
      "kd": "KD:s officiella underlag från 27 augusti 2024 beskriver en ändrad mix mellan drivmedelsskatt och reduktionsplikt. Ett tidigare KD-underlag anger 6 % reduktionsplikt för både bensin och diesel från 1 januari 2024 och uppskattade då att diesel kunde bli 5,50 kr/l billigare. 5,50 kr/l visas endast som KD:s historiska uppskattning och används inte som ett aktuellt 2026-prisscenario.",
      "m": "Moderaternas officiella underlag anger cirka 1,03 kr/l lägre bensinpris och 0,40 kr/l lägre dieselpris vid full prisövervältring från skattesänkningen till EU:s miniminivå, samt en ytterligare tillfällig sänkning på 3 kr/l från 1 juli till 30 november 2026. Partiet anger också 10 % reduktionsplikt för både bensin och diesel. Uppgifterna används som dokumenterad bakgrund, inte som ett permanent framtida M-pris.",
      "sd": "SD:s officiella drivmedelssida redovisar Bensin 95: 23,54 → 14,34 kr/l och diesel: 26,46 → 16,09 kr/l (juni 2022–juli 2026). Sidan anger även reduktionsplikt 2022 på 7,8 % för bensin och 30,5 % för diesel samt 6 % från 1 januari 2024. Uppgifterna visas som historiskt/politiskt underlag och används inte som ett beräknat framtida SD-pris."
  };

  const $ = id => document.getElementById(id);
  const els = {
    fuelButtons: [...document.querySelectorAll("[data-fuel]")],
    tankLiterLabels: [...document.querySelectorAll("[data-tank-liters]")],
    tankSizeButtons: [...document.querySelectorAll("[data-tank-size]")],
    regionSelect: $("regionSelect"),
    regionLabel: $("regionLabel"),
    regionAvailability: $("regionAvailability"),
    partyGrid: $("partyGrid"),
    updatedLabel: $("updatedLabel"),
    fuelLabel: $("fuelLabel"),
    tankTotal: $("tankTotal"),
    literPrice: $("literPrice"),
    marketTank: $("marketTank"),
    energyTaxLabel: $("energyTaxLabel"),
    energyTank: $("energyTank"),
    carbonTaxLabel: $("carbonTaxLabel"),
    carbonTank: $("carbonTank"),
    vatTank: $("vatTank"),
    taxSummaryLabel: $("taxSummaryLabel"),
    taxTank: $("taxTank"),
    taxShare: $("taxShare"),
    nonTaxShare: $("nonTaxShare"),
    taxBarFill: $("taxBarFill"),
    policyDetails: $("policyDetails"),
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
    trendButtons: [...document.querySelectorAll("[data-trend-days]")],
    trendCoverage: $("trendCoverage"),
    trendDirection: $("trendDirection"),
    trendSelected: $("trendSelected"),
    trendPercent: $("trendPercent"),
    trendRange: $("trendRange"),
    trendPrices: $("trendPrices"),
    trendFromPrice: $("trendFromPrice"),
    trendToPrice: $("trendToPrice"),
    trendChartWrap: $("trendChartWrap"),
    trendChart: $("trendChart"),
    trendLine: $("trendLine"),
    trendLastPoint: $("trendLastPoint"),
    trendHigh: $("trendHigh"),
    trendLow: $("trendLow"),
    trendStartDate: $("trendStartDate"),
    trendEndDate: $("trendEndDate"),
    trendStats: $("trendStats"),
    trendMinStat: $("trendMinStat"),
    trendMaxStat: $("trendMaxStat"),
    trendChartSummary: $("trendChartSummary"),
    trendEmpty: $("trendEmpty"),
    trendEmptyText: $("trendEmptyText"),
    trendProgressFill: $("trendProgressFill"),
    trendProgressLabel: $("trendProgressLabel")
  };

  const state = {
    fuel: fuelData[siteData.defaultFuel] ? siteData.defaultFuel : "petrol",
    region: "riket",
    party: "",
    trendDays: 30
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

  const swedishCounties = [
    ["stockholm","Stockholms län"],["uppsala","Uppsala län"],["sodermanland","Södermanlands län"],["ostergotland","Östergötlands län"],["jonkoping","Jönköpings län"],["kronoberg","Kronobergs län"],["kalmar","Kalmar län"],["gotland","Gotlands län"],["blekinge","Blekinge län"],["skane","Skåne län"],["halland","Hallands län"],["vastra-gotaland","Västra Götalands län"],["varmland","Värmlands län"],["orebro","Örebro län"],["vastmanland","Västmanlands län"],["dalarna","Dalarnas län"],["gavleborg","Gävleborgs län"],["vasternorrland","Västernorrlands län"],["jamtland","Jämtlands län"],["vasterbotten","Västerbottens län"],["norrbotten","Norrbottens län"]
  ];

  function regionRecord() {
    return state.region === "riket" ? priceData.national : priceData.regions?.[state.region];
  }

  function getPrice() {
    const value = Number(regionRecord()?.[state.fuel]);
    return Number.isFinite(value) ? value : NaN;
  }

  function buildRegionOptions() {
    if (!els.regionSelect) return;
    const available = priceData.regions ?? {};
    const fragment = document.createDocumentFragment();
    for (const [id,name] of swedishCounties) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      option.disabled = !available[id];
      fragment.append(option);
    }
    els.regionSelect.append(fragment);
    const count = swedishCounties.filter(([id]) => available[id]).length;
    setText(els.regionAvailability, count === 21 ? "Verifierade länspriser finns för alla 21 län." : count ? `Verifierade länspriser finns för ${count} av 21 län.` : "Länspriser aktiveras automatiskt när verifierad regional prisdata finns.");
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
    const referenceDate = priceData.updatedAt || todayIso();
    if (model.validFrom && referenceDate < model.validFrom) return null;
    if (model.validTo && referenceDate > model.validTo) return null;
    if (Array.isArray(model.fuels) && !model.fuels.includes(state.fuel)) return null;
    return basePrice + model.delta;
  }

  function loadStateFromUrl() {
    const params = new URLSearchParams(location.search);
    const fuel = params.get("fuel");
    const party = params.get("party");
    const tank = Number(params.get("tank"));
    const region = params.get("region");

    if (fuelData[fuel]) state.fuel = fuel;
    if (partyOrder.includes(party) && scenarios[party]) state.party = party;
    if ([30,40,50,60].includes(tank)) tankLiters = tank;
    if (region === "riket" || priceData.regions?.[region]) state.region = region;
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set("fuel", state.fuel);
    tankLiters === siteData.typicalTankLiters ? url.searchParams.delete("tank") : url.searchParams.set("tank", String(tankLiters));
    state.party ? url.searchParams.set("party", state.party) : url.searchParams.delete("party");
    state.region === "riket" ? url.searchParams.delete("region") : url.searchParams.set("region", state.region);

    const next = url.pathname + url.search + url.hash;
    const current = location.pathname + location.search + location.hash;
    if (next !== current) history.replaceState(null, "", next);
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
      image.loading = "lazy";
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

  function renderRegion() {
    if (els.regionSelect) els.regionSelect.value = state.region;
    const record = regionRecord();
    setText(els.regionLabel, (record?.name || "Hela Sverige").toLocaleUpperCase("sv-SE"));
  }

  function renderScenario(basePrice) {
    const scenario = scenarios[state.party];
    setText(els.scenarioReferenceDate, priceData.updatedAt || "—");
    if (els.scenarioReset) els.scenarioReset.hidden = !scenario;
    if (els.scenarioComparison) els.scenarioComparison.hidden = true;
    if (els.policyFacts) els.policyFacts.replaceChildren();
    if (els.policyDetails) { els.policyDetails.hidden = !scenario; els.policyDetails.open = false; }

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
      if (els.policyDetails) els.policyDetails.hidden = true;
      if (els.scenarioMeta) { els.scenarioMeta.hidden = true; els.scenarioMeta.textContent = ""; }
      return;
    }

    setText(els.scenarioLabel, scenario.name);
    if (els.scenarioMeta) {
      els.scenarioMeta.hidden = false;
      els.scenarioMeta.textContent = (evidenceLabels[scenario.evidence] || "Källbundet scenario") + " · referenspris " + (priceData.updatedAt || "—") + " · källan verifierad " + (scenario.verifiedAt || "—");
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

    
    const background = policyBackground[state.party];
    if (background && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = background;
      els.policyFacts.append(title, text);
    }

    els.partySource.href = scenario.source;
    els.partySource.setAttribute("aria-label", "Öppna officiell källa för " + scenario.name);
  }

  function renderDataStatus(ref) {
    const age = daysBetween(priceData.updatedAt);
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
      "Prisdata " + (priceData.updatedAt || "—") + (age !== null && age > warningAfter ? " · kontrollera" : "")
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
    const value = Number(snapshot?.national?.[state.fuel]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function formatTrendDate(iso, withYear = false) {
    const date = new Date(iso + "T12:00:00Z");
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" }).format(date);
  }

  function renderTrend(currentPrice) {
    const snapshots = priceHistory?.snapshots ?? [];
    if (!snapshots.length || !Number.isFinite(currentPrice)) { els.priceTrend.hidden = true; return; }
    const latestDate = priceData.updatedAt;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(latestDate || "")) { els.priceTrend.hidden = true; return; }

    const latestMs = Date.parse(latestDate + "T12:00:00Z");
    const dated = snapshots.map(item => ({ item, ms: Date.parse(item.date + "T12:00:00Z"), value: historyPrice(item) }))
      .filter(x => Number.isFinite(x.ms) && x.value !== null && x.ms <= latestMs)
      .sort((a,b) => a.ms-b.ms);
    if (!dated.length) { els.priceTrend.hidden = true; return; }

    const first = dated[0];
    const coverageDays = Math.max(0, Math.round((latestMs-first.ms)/86400000));
    const observedDays = new Set(dated.map(x => x.item.date)).size;
    setText(els.trendCoverage, observedDays === 1 ? "1 mätning" : observedDays + " mätningar");

    const minimumObservations = period => Math.max(3, Math.ceil((period + 1) * .5));
    const availability = new Map([7,30,365].map(period => [period, coverageDays >= period && observedDays >= minimumObservations(period)]));
    for (const button of els.trendButtons) {
      const period = Number(button.dataset.trendDays);
      const available = availability.get(period);
      button.disabled = !available;
      button.setAttribute("aria-disabled", String(!available));
      const remainingForPeriod = Math.max(0, period - coverageDays);
      const remainingMeasurements = Math.max(0, minimumObservations(period) - observedDays);
      const periodName = period === 365 ? "1 år" : period + " dagar";
      const lockedReason = remainingForPeriod > 0
        ? remainingForPeriod + (remainingForPeriod === 1 ? " dag kvar" : " dagar kvar")
        : remainingMeasurements + (remainingMeasurements === 1 ? " mätning kvar" : " mätningar kvar");
      button.title = available ? "" : periodName + " · " + lockedReason;
      button.setAttribute("aria-label", available ? periodName : periodName + ", " + lockedReason);
    }

    let days = state.trendDays;
    if (!availability.get(days)) {
      const availablePeriods = [7,30,365].filter(x => availability.get(x));
      days = availablePeriods.at(-1) ?? 0;
    }
    for (const button of els.trendButtons) button.setAttribute("aria-pressed", String(days > 0 && Number(button.dataset.trendDays) === days));
    els.priceTrend.hidden = false;

    const effectiveStartMs = days > 0 ? latestMs-days*86400000 : first.ms;
    const points = dated.filter(x => x.ms >= effectiveStartMs);
    const periodElapsedDays = Math.max(1, Math.round((latestMs - Math.max(effectiveStartMs, first.ms))/86400000) + 1);
    const periodObservedDays = new Set(points.map(p => p.item.date)).size;
    const coverageRatio = Math.min(1, periodObservedDays / periodElapsedDays);
    const target = days > 0 ? dated.find(x => x.ms >= effectiveStartMs) ?? first : first;
    const oldPrice = target.value;
    const delta = currentPrice-oldPrice;
    const percent = oldPrice > 0 ? delta/oldPrice*100 : 0;
    const unchanged = Math.abs(delta) < .005;
    const periodLabel = days === 365 ? "1 år" : days > 0 ? days + " dagar" : (coverageDays === 0 ? "idag" : "sedan " + formatTrendDate(first.item.date, true));
    const actualStartDate = target.item.date;

    setText(els.trendDirection, days > 0 ? "Förändring · " + periodLabel : "Sedan första mätningen");
    setText(els.trendSelected, unchanged ? "±0,00 kr/l" : (delta > 0 ? "+" : "−") + fmt(Math.abs(delta)) + " kr/l");
    setText(els.trendPercent, unchanged ? "0,0 %" : (percent > 0 ? "+" : "−") + Math.abs(percent).toLocaleString("sv-SE",{minimumFractionDigits:1,maximumFractionDigits:1}) + " %");
    setText(els.trendFromPrice, fmt(oldPrice) + " kr/l");
    setText(els.trendToPrice, fmt(currentPrice) + " kr/l");
    if (els.trendPrices) {
      els.trendPrices.hidden = coverageDays === 0;
      els.trendPrices.setAttribute("aria-label", "Från " + fmt(oldPrice) + " till " + fmt(currentPrice) + " kronor per liter");
    }

    const distinctDates = new Set(points.map(p => p.item.date)).size;
    const enoughForChart = points.length >= 3 && distinctDates >= 3;
    if (enoughForChart) {
      const values=points.map(p=>p.value), min=Math.min(...values), max=Math.max(...values), rawSpan=max-min;
      const minIndex=values.indexOf(min), maxIndex=values.indexOf(max);
      const padding=Math.max(.05,rawSpan*.18), chartMin=min-padding, chartMax=max+padding, span=chartMax-chartMin;
      const pointStartMs=points[0].ms, pointEndMs=points.at(-1).ms, pointSpanMs=Math.max(1,pointEndMs-pointStartMs);
      const coords=points.map(p=>(((p.ms-pointStartMs)/pointSpanMs)*320).toFixed(1)+","+(88-(p.value-chartMin)/span*76).toFixed(1)).join(" ");
      els.trendLine.setAttribute("points",coords);
      if (els.trendLastPoint) { const last=coords.split(" ").at(-1).split(","); els.trendLastPoint.setAttribute("cx",last[0]); els.trendLastPoint.setAttribute("cy",last[1]); els.trendLastPoint.hidden=false; }
      setText(els.trendHigh,fmt(max)); setText(els.trendLow,fmt(min));
      setText(els.trendMinStat, fmt(min) + " kr/l · " + formatTrendDate(points[minIndex].item.date));
      setText(els.trendMaxStat, fmt(max) + " kr/l · " + formatTrendDate(points[maxIndex].item.date));
      if (els.trendStats) els.trendStats.hidden=false;
      setText(els.trendStartDate, formatTrendDate(points[0].item.date));
      setText(els.trendEndDate, formatTrendDate(points.at(-1).item.date));
      const coveragePercent = Math.round(coverageRatio * 100);
      const chartSummary = fuelData[state.fuel].label + ": " + fmt(oldPrice) + " till " + fmt(currentPrice) + " kr/l, " + (unchanged ? "oförändrat" : delta > 0 ? "upp " + fmt(Math.abs(delta)) : "ned " + fmt(Math.abs(delta))) + " kr/l. Lägst " + fmt(min) + " den " + formatTrendDate(points[minIndex].item.date) + ", högst " + fmt(max) + " den " + formatTrendDate(points[maxIndex].item.date) + ". " + periodObservedDays + " mätningar, " + coveragePercent + " procent datatäckning.";
      setText(els.trendChartSummary, chartSummary);
      els.trendChart?.setAttribute("aria-label", chartSummary);
      els.trendChartWrap.hidden=false; els.trendEmpty.hidden=true;
      setText(els.trendRange,"Rikssnitt för " + fuelData[state.fuel].label + " · " + formatTrendDate(actualStartDate, true) + "–" + formatTrendDate(latestDate, true) + " · " + periodObservedDays + " mätningar.");
    } else {
      els.trendLine.setAttribute("points",""); if (els.trendLastPoint) els.trendLastPoint.hidden=true; if (els.trendStats) els.trendStats.hidden=true; setText(els.trendChartSummary, ""); els.trendChartWrap.hidden=true; els.trendEmpty.hidden=false;
      const measurementsNeeded=Math.max(0,3-observedDays);
      setText(els.trendEmptyText, measurementsNeeded > 0 ? "Grafen visas efter " + measurementsNeeded + (measurementsNeeded===1 ? " ytterligare mätning." : " ytterligare mätningar.") : "Grafen visas vid nästa kompletta uppdatering.");
      const collectedMeasurements = Math.min(3, observedDays);
      if (els.trendProgressLabel) setText(els.trendProgressLabel, collectedMeasurements + " / 3 mätningar");
      if (els.trendProgressFill) {
        els.trendProgressFill.style.width = Math.max(8, collectedMeasurements / 3 * 100) + "%";
        els.trendProgressFill.parentElement?.setAttribute("aria-valuenow", String(collectedMeasurements));
      }
      setText(els.trendRange,"Rikssnitt för " + fuelData[state.fuel].label + " · uppdateras dagligen.");
    }
  }

  function render() {
    const price = getPrice();
    const ref = calculate(price);

    if (!ref) {
      setText(els.tankTotal, "Data saknas");
      setText(els.literPrice, "—");
      renderDataStatus(ref);
      return;
    }

    for (const button of els.fuelButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.fuel === state.fuel));
    }

    setText(els.fuelLabel, ref.fuel.label);
    setText(els.tankTotal, fmt(price * tankLiters));
    setText(els.literPrice, fmt(price));
    setText(els.marketTank, fmt(ref.market * tankLiters) + " kr");
    setText(els.energyTaxLabel, ref.blendDependent ? "Energiskatt" : "Energiskatt");
    setText(els.carbonTaxLabel, ref.blendDependent ? "Koldioxidskatt" : "Koldioxidskatt");
    setText(els.energyTank, ref.blendDependent ? "Varierar med bränslemixen" : fmt(ref.taxPeriod.energyTax * tankLiters) + " kr");
    setText(els.carbonTank, ref.blendDependent ? "Varierar med bränslemixen" : fmt(ref.taxPeriod.carbonTax * tankLiters) + " kr");
    setText(els.vatTank, fmt(ref.vat * tankLiters) + " kr");
    setText(els.taxSummaryLabel, ref.blendDependent ? "Moms (känd del)" : "Skatt + moms");
    setText(els.taxTank, fmt(ref.tax * tankLiters) + " kr");
    const taxPct = ref.tax / price * 100;
    setText(els.taxShare, ref.blendDependent ? wholePercent.format(taxPct) + " % moms" : wholePercent.format(taxPct) + " % skatt + moms");
    setText(els.nonTaxShare, ref.blendDependent ? "Punktskatt varierar med bränslemixen" : wholePercent.format(100 - taxPct) + " % före skatt & moms");
    if (els.taxBarFill) els.taxBarFill.style.width = Math.max(0, Math.min(100, taxPct)) + "%";

    els.priceSource.href = priceData.source;
    els.taxSource.href = ref.fuel.taxSource;

    renderDataStatus(ref);
    renderTrend(price);
    renderRegion();
    renderScenario(price);
    syncUrl();
  }

  function bindEvents() {
    for (const button of els.trendButtons) {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        state.trendDays = Number(button.dataset.trendDays) || 7;
        renderTrend(getPrice());
      });
    }
    for (const button of els.tankSizeButtons) {
      button.addEventListener("click", () => {
        const liters = Number(button.dataset.tankSize);
        if (!Number.isFinite(liters) || liters <= 0) return;
        tankLiters = liters;
        for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
        for (const choice of els.tankSizeButtons) choice.setAttribute("aria-pressed", String(choice === button));
        render();
      });
    }
    for (const button of els.fuelButtons) {
      button.addEventListener("click", () => {
        state.fuel = button.dataset.fuel;
        render();
      });
    }


    els.scenarioReset?.addEventListener("click", () => {
      state.party = "";
      updatePartySelection();
      renderScenario(getPrice());
      syncUrl();
    });

    els.regionSelect?.addEventListener("change", event => {
    state.region = event.target.value;
    state.party = "";
    syncUrl();
    render();
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

  window.addEventListener("popstate", () => { loadStateFromUrl(); updatePartySelection(); render(); });

  loadStateFromUrl();
  buildRegionOptions();
  buildPartyButtons();
  for (const choice of els.tankSizeButtons) choice.setAttribute("aria-pressed", String(Number(choice.dataset.tankSize) === tankLiters));
  for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  bindEvents();
  render();
  fetch("/data/price-history.json", { cache: "no-store" })
    .then(response => response.ok ? response.json() : null)
    .then(data => { priceHistory = data; renderTrend(getPrice()); })
    .catch(() => {});
})();
