import assert from "node:assert/strict";
import { simulateScenario } from "../lib/simulator.mjs";
const base={basePrice:17.24,tankLiters:40,referenceDate:"2026-09-23"};
let r=simulateScenario({...base,scenario:{priceModel:{type:"party_delta",delta:2.2},source:"https://example.test",verifiedAt:"2026-09-23",evidence:"party_estimate"}});
assert.equal(r.available,true); assert.equal(Math.round(r.resultLiter*100)/100,19.44); assert.equal(Math.round(r.deltaTank*100)/100,88);
r=simulateScenario({...base,scenario:{priceModel:{type:"not_quantified"},source:"https://example.test",verifiedAt:"2026-09-23",evidence:"not_quantified"}});
assert.equal(r.available,false);
assert.equal(simulateScenario({...base,scenario:{priceModel:{type:"party_delta",delta:undefined}}}).available,false);
console.log("simulator fixtures PASS");

const bounded = {
  priceModel: { type: "party_delta", delta: -3, validFrom: "2026-07-01", validTo: "2026-11-30", fuels: ["petrol","diesel"] },
  source: "https://example.test/m", verifiedAt: "2026-09-23", evidence: "party_estimate"
};
assert.equal(simulateScenario({ basePrice: 17.24, tankLiters: 40, scenario: bounded, referenceDate: "2026-09-23", fuel: "petrol" }).available, true);
assert.equal(simulateScenario({ basePrice: 17.24, tankLiters: 40, scenario: bounded, referenceDate: "2026-12-01", fuel: "petrol" }).available, false);
assert.equal(simulateScenario({ basePrice: 14.89, tankLiters: 40, scenario: bounded, referenceDate: "2026-09-23", fuel: "e85" }).available, false);
