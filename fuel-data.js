window.FUEL_DATA = {
  petrol: {
    id: "petrol",
    label: "Bensin 95",
    shortLabel: "Bensin",
    energyTax: 0.70,
    carbonTax: 0.87,
    vatRate: 25,
    period: "1 juli–30 september 2026",
    validFrom: "2026-07-01",
    validTo: "2026-09-30",
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  },
  diesel: {
    id: "diesel",
    label: "Diesel",
    shortLabel: "Diesel",
    energyTax: 0.831,
    carbonTax: 0.411,
    vatRate: 25,
    period: "1 juli–30 september 2026",
    validFrom: "2026-07-01",
    validTo: "2026-09-30",
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  }
};

window.SITE_DATA = {
  appVersion: "0.10.0",
  dataVersion: "2026-09-21",
  lastFactCheck: "21 september 2026",
  defaultFuel: "petrol",
  defaultPumpPrice: 17.43,
  typicalTankLiters: 40
};
