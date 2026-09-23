export function taxPeriodFor(fuel, date) {
  return fuel?.taxPeriods?.find(p => p.validFrom <= date && date <= p.validTo) ?? null;
}
export function observedBreakdown(price, fuel, date) {
  if (!Number.isFinite(price) || !fuel) return null;
  const beforeVat = price / (1 + fuel.vatRate / 100);
  const vat = price - beforeVat;
  if (fuel.taxModel === "blend_dependent") return { vat, marketChainResidual: beforeVat, taxKnown: false };
  const period = taxPeriodFor(fuel, date);
  if (!period) return null;
  const residual = beforeVat - period.energyTax - period.carbonTax;
  return residual < 0 ? null : { vat, energyTax: period.energyTax, carbonTax: period.carbonTax, marketChainResidual: residual, taxKnown: true };
}
