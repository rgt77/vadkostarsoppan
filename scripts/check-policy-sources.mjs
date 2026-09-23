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
  const old = previous.sources?.[key];
  try {
    const response = await fetch(item.source, {
      redirect: "follow",
      headers: { "user-agent": "vadkostarsoppan-source-monitor/1.0", "accept": "text/html,application/pdf;q=0.9,*/*;q=0.8" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";
    const normalized = contentType.includes("text/html") ? normalize(body.toString("utf8")) : body;
    const hash = crypto.createHash("sha256").update(normalized).digest("hex");
    next.sources[key] = { name: item.name, url: item.source, hash, contentType, status: "ok" };
    if (old?.hash && old.hash !== hash) changes.push({ key, name: item.name, url: item.source, oldHash: old.hash, newHash: hash });
  } catch (error) {
    next.sources[key] = { name: item.name, url: item.source, hash: old?.hash ?? null, contentType: old?.contentType ?? null, status: "unreachable", error: String(error.message ?? error) };
  }
}
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(statePath, JSON.stringify(next, null, 2) + "\n");
fs.writeFileSync("data/policy-source-changes.json", JSON.stringify({ changes }, null, 2) + "\n");
console.log(changes.length ? `CHANGED: ${changes.map(x => x.name).join(", ")}` : "No source changes detected.");
