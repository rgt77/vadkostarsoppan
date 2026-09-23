export function simulateScenario({ basePrice, tankLiters, scenario, referenceDate }) {
  if (!Number.isFinite(basePrice) || basePrice <= 0 || !Number.isFinite(tankLiters) || tankLiters <= 0 || !scenario) return null;
  const model = scenario.priceModel;
  if (!["party_delta","stated_target"].includes(model?.type) || !Number.isFinite(model.delta)) {
    return { available:false, referenceDate, source:scenario.source, verifiedAt:scenario.verifiedAt, evidence:scenario.evidence };
  }
  const resultLiter = basePrice + model.delta;
  if (!Number.isFinite(resultLiter) || resultLiter <= 0) return null;
  const baseTank = basePrice * tankLiters;
  const resultTank = resultLiter * tankLiters;
  return {
    available:true, referenceDate, baseLiter:basePrice, resultLiter, baseTank, resultTank,
    deltaLiter:resultLiter-basePrice, deltaTank:resultTank-baseTank,
    source:scenario.source, verifiedAt:scenario.verifiedAt, evidence:scenario.evidence, modelType:model.type
  };
}
