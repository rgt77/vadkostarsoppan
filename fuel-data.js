window.FUEL_DATA = {
  petrol: {
    label: "Bensin 95",
    energyTax: 0.70,
    carbonTax: 0.87,
    vatRate: 25,
    validFrom: "2026-07-01",
    validTo: "2026-09-30",
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  },
  diesel: {
    label: "Diesel",
    energyTax: 0.831,
    carbonTax: 0.411,
    vatRate: 25,
    validFrom: "2026-07-01",
    validTo: "2026-09-30",
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html"
  }
};

window.SITE_DATA = {
  appVersion: "0.13.0",
  defaultFuel: "petrol",
  typicalTankLiters: 40
};
