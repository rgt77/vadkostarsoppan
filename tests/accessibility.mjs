import assert from "node:assert/strict";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const base = process.env.SITE_URL || "http://127.0.0.1:4173";
const widths = [320, 390, 768, 1440];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
let count = 0;
const failures = [];

async function audit(page, state, width) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const entries = results.violations.flatMap(rule =>
    rule.nodes.map(node => ({ rule: rule.id, impact: rule.impact, target: node.target, summary: node.failureSummary }))
  );
  assert.deepEqual(entries, [], `Accessibility failures at ${width}px in ${state}: ${JSON.stringify(entries, null, 2)}`);
  count++;
  console.log(`A11Y PASS ${width}px ${state} (${results.passes.length} rules passed)`);
}

try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on("pageerror", error => browserErrors.push(error.message));
    try {
      const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
      assert.ok(response?.ok(), "Page did not load");
      await page.locator("#partyGrid .party-button").first().waitFor();
      await audit(page, "start", width);

      // Test real keyboard activation of a fuel button.
      await page.locator('[data-fuel="diesel"]').focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator('[data-fuel="diesel"]').getAttribute("aria-pressed"), "true");
      await audit(page, "diesel", width);

      // Party selection and revealed content must remain usable via the keyboard.
      await page.locator('#partyGrid [data-party="c"]').focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator('#partyGrid [data-party="c"]').getAttribute("aria-pressed"), "true");
      await audit(page, "party-selected", width);

      await page.locator('#partyGrid [data-party="c"]').focus();
      await page.keyboard.press("ArrowRight");
      const next = await page.evaluate(() => document.activeElement?.dataset.party);
      assert.equal(next, "kd", "Arrow navigation does not focus the next party");
      await page.keyboard.press("Space");
      assert.equal(await page.locator('#partyGrid [data-party="kd"]').getAttribute("aria-pressed"), "true");
      await page.locator("#policyDetails summary").click();
      await audit(page, "expanded-party-details", width);

      await page.locator("#scenarioReset").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#scenarioReset").isVisible(), false);
      await page.locator('[data-fuel="e85"]').click();
      await page.locator(".breakdown-details summary").click();
      await audit(page, "e85-breakdown", width);

      assert.deepEqual(browserErrors, []);
    } catch (error) {
      failures.push(`${width}px: ${error.stack || error}`);
      console.error(`A11Y FAIL ${width}px: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}
console.log(`Accessibility and keyboard QA PASSED: ${count} states.`);
