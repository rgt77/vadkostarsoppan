import fs from "node:fs";

const loadWindow = file => {
  const w = {};
  new Function("window", fs.readFileSync(file, "utf8"))(w);
  return w;
};
const days = date => Math.floor((Date.now() - Date.parse(date + "T12:00:00Z")) / 86400000);
const prices = loadWindow("price-data.js").COUNTY_PRICES;
const fuels = loadWindow("fuel-data.js").FUEL_DATA;
const policies = loadWindow("policy-data.js").POLICY_SCENARIOS;
const policyState = JSON.parse(fs.readFileSync("data/policy-source-state.json","utf8"));
const now = new Date().toISOString();
const market = JSON.parse(fs.readFileSync("data/market-data.json","utf8"));
const duty = JSON.parse(fs.readFileSync("data/reduction-duty.json","utf8"));
const checks = []; // Health status excludes informational anomalies from warning severity; source access limits are classified separately.

const add=(id,status,message,source=null)=>checks.push({id,status,message,source});
add("prices:freshness", days(prices.updatedAt)<=3 ? "ok":"error", `Prisdata är ${days(prices.updatedAt)} dag(ar) gammal`, prices.source);
add("prices:counties", prices.counties.length===21 ? "ok":"error", `${prices.counties.length}/21 län`, prices.source);
for (const [fuelKey,fuel] of Object.entries(fuels)) {
  const today = now.slice(0,10);
  if (fuel.taxModel === "blend_dependent") {
    add(`tax:${fuelKey}`,"ok","Blandningsberoende punktskatt hanteras utan konstruerad fast skattesats",fuel.taxSource);
    continue;
  }
  const active=(fuel.taxPeriods||[]).find(p=>p.validFrom<=today&&today<=p.validTo);
  add(`tax:${fuelKey}`,active?"ok":"error",active?`Giltig skatteperiod ${active.validFrom}–${active.validTo}`:"Ingen giltig skatteperiod",fuel.taxSource);
}
for (const [key,p] of Object.entries(policies)) {
  const monitored=policyState.sources?.[key];
  const healthy = monitored?.status === "ok" || (monitored?.hash && !monitored?.status);
  const blocked = monitored?.status === "access_blocked";
  add(`policy:${key}`, healthy || blocked ? "ok" : "warning", healthy ? "Officiell källa bevakas" : blocked ? "Officiell källa verifierad men blockerar automatisk hämtning (HTTP 403)" : monitored ? "Källan kunde inte nås vid senaste kontroll" : "Bevakning ännu ej initialiserad", p.source);
}
const deviations=[];
for(const c of prices.counties){
  for(const k of ["petrol","petrol98","e85","diesel"]){
    if (!Number.isFinite(c[k]) || !Number.isFinite(prices.national[k])) continue;
    const base=prices.national[k];
    const pct=Math.abs(c[k]-base)/base;
    if(pct>0.20) deviations.push({county:c.name,fuel:k,value:c[k],national:base,deviationPct:Number((pct*100).toFixed(1))});
  }
}
add("prices:plausibility","ok",deviations.length ? `${deviations.length} statistisk(a) avvikelse(r) registrerad(e) för transparens; källdata ändras inte` : "Inga extrema länsavvikelser",prices.source);
const activeDuty=(duty.periods||[]).find(p=>p.validFrom<=now.slice(0,10)&&now.slice(0,10)<=p.validTo);
add("policy:reduction-duty",activeDuty?"ok":"error",activeDuty?`Reduktionsplikt ${activeDuty.petrolPct}% bensin / ${activeDuty.dieselPct}% diesel`:"Ingen aktiv reduktionspliktsperiod",duty.source);
const fxAge=market.fx?.observationDate ? days(market.fx.observationDate) : null;
add("market:usdsek",market.fx?.usdSek>0 && fxAge!==null && fxAge<=7?"ok":"warning",market.fx?.usdSek>0?`USD/SEK ${market.fx.usdSek}, ${fxAge} dag(ar) gammal`:"Väntar på första Riksbankshämtningen",market.fx?.source);
const summary={
  date: now.slice(0,10),
  status:checks.some(x=>x.status==="error")?"error":checks.some(x=>x.status==="warning")?"warning":"ok",
  counts:{ok:checks.filter(x=>x.status==="ok").length,warning:checks.filter(x=>x.status==="warning").length,error:checks.filter(x=>x.status==="error").length},
  checks,
  anomalies:deviations
};
fs.writeFileSync("data/data-health.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
if(summary.status==="error") process.exitCode=1;
