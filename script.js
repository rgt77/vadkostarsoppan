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

const els = {
  pumpPrice: document.querySelector("#pumpPrice"),
  tankLiters: document.querySelector("#tankLiters"),
  tankLitersLabel: document.querySelector("#tankLitersLabel"),
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
  tankTotal: document.querySelector("#tankTotal"),
  tankTax: document.querySelector("#tankTax"),
  tankOther: document.querySelector("#tankOther"),
  donut: document.querySelector("#donut"),
  priceBar: document.querySelector("#priceBar"),
  barTotal: document.querySelector("#barTotal"),
  periodText: document.querySelector("#periodText"),
  tabs: [...document.querySelectorAll(".fuel-tab")]
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

function update() {
  const price = parseNumber(els.pumpPrice.value);
  const litersRaw = parseNumber(els.tankLiters.value);
  const liters = Number.isFinite(litersRaw) && litersRaw > 0 ? litersRaw : 50;
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

  els.tankLitersLabel.textContent = fmt(liters, Number.isInteger(liters) ? 0 : 1);
  els.tankTotal.textContent = fmt(price * liters) + " kr";
  els.tankTax.textContent = fmt(totalTax * liters) + " kr";
  els.tankOther.textContent = fmt(other * liters) + " kr";

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
els.tankLiters.addEventListener("input", update);

els.pumpPrice.addEventListener("blur", () => {
  normalizeInput(els.pumpPrice, 2);
  update();
});

els.tankLiters.addEventListener("blur", () => {
  const value = parseNumber(els.tankLiters.value);
  if (Number.isFinite(value) && value > 0) {
    els.tankLiters.value = fmt(value, Number.isInteger(value) ? 0 : 1);
  }
  update();
});

update();