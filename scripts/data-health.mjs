import fs from "node:fs";

const loadWindow = file => {
  const w = {};
  new Function("window", fs.readFileSync(file, "utf8"))(w);
  return w;
};
const days = date => Math.floor((Date.now() - Date.parse(date + "T12:00:00Z")) / 86400000);
const prices = loadWindow("county-data.js").COUNTY_PRICES;
const fuels = loadWindow("fuel-data.js").FUEL_DATA;
const policies = loadWindow("policy-data.js").POLICY_SCENARIOS;
const policyState = JSON.parse(fs.readFileSync("data/policy-source-state.json","utf8"));
const now = new Date().toISOString();
const checks = [];

const add=(id,status,message,source=null)=>checks.push({id,status,message,source});
add("prices:freshness", days(prices.updatedAt)<=3 ? "ok":"error", `Prisdata är ${days(prices.updatedAt)} dag(ar) gammal`, prices.source);
add("prices:counties", prices.counties.length===21 ? "ok":"error", `${prices.counties.length}/21 län`, prices.source);
for (const [fuelKey,fuel] of Object.entries(fuels)) {
  const today = now.slice(0,10);
  const active=(fuel.taxPeriods||[]).find(p=>p.validFrom<=today&&today<=p.validTo);
  add(`tax:${fuelKey}`,active?"ok":"error",active?`Giltig skatteperiod ${active.validFrom}–${active.validTo}`:"Ingen giltig skatteperiod",fuel.taxSource);
}
for (const [key,p] of Object.entries(policies)) {
  const monitored=policyState.sources?.[key];
  add(`policy:${key}`,monitored?"ok":"warning",monitored?"Officiell källa bevakas":"Bevakning ännu ej initialiserad",p.source);
}
const deviations=[];
for(const c of prices.counties){
  for(const k of ["petrol","diesel"]){
    const base=prices.national[k];
    const pct=Math.abs(c[k]-base)/base;
    if(pct>0.20) deviations.push({county:c.name,fuel:k,value:c[k],national:base,deviationPct:Number((pct*100).toFixed(1))});
  }
}
add("prices:plausibility",deviations.length?"warning":"ok",deviations.length?`${deviations.length} länsvärde(n) avviker >20 % från rikssnitt`:"Inga extrema länsavvikelser",prices.source);
const summary={
  generatedAt:now,
  status:checks.some(x=>x.status==="error")?"error":checks.some(x=>x.status==="warning")?"warning":"ok",
  counts:{ok:checks.filter(x=>x.status==="ok").length,warning:checks.filter(x=>x.status==="warning").length,error:checks.filter(x=>x.status==="error").length},
  checks,
  anomalies:deviations
};
fs.writeFileSync("data/data-health.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
if(summary.status==="error") process.exitCode=1;
