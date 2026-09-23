import fs from "node:fs";
import crypto from "node:crypto";

const policyText = fs.readFileSync("policy-data.js", "utf8");
const w = {};
new Function("window", policyText)(w);
const scenarios = w.POLICY_SCENARIOS ?? {};
const statePath = "data/policy-source-state.json";
const previous = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};
const next = { sources: {} };
const changes = [];

const normalize = text => text
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

for (const [key, item] of Object.entries(scenarios)) {
  const response = await fetch(item.source, {
    redirect: "follow",
    headers: { "user-agent": "vadkostarsoppan-source-monitor/1.0" }
  });
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status} for ${item.source}`);
  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const normalized = contentType.includes("text/html") ? normalize(body.toString("utf8")) : body;
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  const old = previous.sources?.[key];
  next.sources[key] = { name: item.name, url: item.source, hash, contentType };
  if (old?.hash && old.hash !== hash) changes.push({ key, name: item.name, url: item.source, oldHash: old.hash, newHash: hash });
}
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(statePath, JSON.stringify(next, null, 2) + "\n");
fs.writeFileSync("data/policy-source-changes.json", JSON.stringify({ changes }, null, 2) + "\n");
console.log(changes.length ? `CHANGED: ${changes.map(x => x.name).join(", ")}` : "No source changes detected.");
