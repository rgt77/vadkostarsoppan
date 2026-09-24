import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const html = read("index.html");
const css = read("style.css");
const js = read("script.js");
const files = ["index.html","style.css","script.js","fuel-data.js","price-data.js","policy-data.js"];
const bytes = Object.fromEntries(files.map(path => [path, fs.statSync(path).size]));
const total = Object.values(bytes).reduce((a,b)=>a+b,0);
const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };

assert(bytes["index.html"] <= 20_000, "index.html exceeds 20 KB");
assert(bytes["style.css"] <= 25_000, "style.css exceeds 25 KB");
assert(bytes["script.js"] <= 40_000, "script.js exceeds 40 KB");
assert(total <= 100_000, "critical local app payload exceeds 100 KB");
assert(!/https?:\/\/[^"'\s>]+\.(?:woff2?|ttf|otf)/i.test(html + css), "remote font dependency detected");
assert((html.match(/<script\b/g) ?? []).length <= 4, "too many initial scripts");
assert((html.match(/<link[^>]+rel=["']stylesheet["']/g) ?? []).length <= 1, "too many blocking stylesheets");
assert(js.includes('image.loading = "lazy"'), "party images must remain lazy-loaded");

const report = {
  generatedAt: new Date().toISOString(),
  status: failures.length ? "fail" : "ok",
  budgets: { indexHtml: 20000, css: 25000, js: 40000, criticalLocalPayload: 100000 },
  bytes,
  criticalLocalPayload: total,
  failures
};
fs.writeFileSync("data/performance-audit.json", JSON.stringify(report, null, 2) + "\n");
if (failures.length) {
  console.error(failures.map(x => "✕ " + x).join("\n"));
  process.exit(1);
}
console.log("Performance budget PASS:", total, "bytes");
