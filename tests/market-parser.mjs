import assert from "node:assert/strict";
const parseNumber = raw => Number(String(raw ?? "").replace(",", "."));
const extract = payload => {
  const objects=[]; const visit=v=>{ if(Array.isArray(v)) return v.forEach(visit); if(v&&typeof v==="object"){objects.push(v);Object.values(v).forEach(visit);} }; visit(payload);
  const row=objects.find(x=>{const raw=x.value??x.Value??x.valueNumeric??x.ValueNumeric;const date=x.date??x.Date??x.observationDate??x.ObservationDate??x.dateString;return Number.isFinite(parseNumber(raw))&&/^\d{4}-\d{2}-\d{2}/.test(String(date??""));});
  if(!row) throw new Error("missing observation");
  return {value:parseNumber(row.value??row.Value??row.valueNumeric??row.ValueNumeric),date:String(row.date??row.Date??row.observationDate??row.ObservationDate??row.dateString).slice(0,10)};
};
assert.deepEqual(extract({observations:[{date:"2026-09-23",value:"9,42"}]}),{value:9.42,date:"2026-09-23"});
assert.deepEqual(extract({data:{results:[{ObservationDate:"2026-09-22T00:00:00",ValueNumeric:9.5}]}}),{value:9.5,date:"2026-09-22"});
console.log("market parser fixtures PASS");
