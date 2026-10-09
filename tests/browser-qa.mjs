import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.SITE_URL || "http://127.0.0.1:4173";
const widths = [320, 360, 375, 390, 430, 640, 768, 1024, 1440];
const parties = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
const failures = [];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
mkdirSync("artifacts", { recursive: true });

const geometry = page => page.evaluate(() => {
  const position = selector => {
    const node = document.querySelector(selector);
    const b = node?.getBoundingClientRect();
    return b ? { x: b.x, y: b.y, left: b.left, right: b.right, top: b.top, bottom: b.bottom, height: b.height } : null;
  };
  return {
    scrollWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    title: position("#partyTitle"),
    toolbar: position(".party-toolbar"),
    reset: position("#scenarioReset"),
    grid: position("#partyGrid"),
    card: position(".scenario-card")
  };
});

function checkLayout({ scrollWidth, viewport, title, toolbar, reset, grid, card }, selected) {
  assert.ok(scrollWidth <= viewport + 2, `Horizontal overflow: ${scrollWidth}px at ${viewport}px`);
  assert.ok(title && toolbar && grid && card, "Party structure missing");
  if (selected) {
    assert.ok(reset, "Reset button not measurable after selecting a party");
    assert.ok(reset.top < title.top, "Reset button no longer sits above the heading");
    assert.ok(reset.bottom <= title.top + 3, "Reset button overlaps the party heading");
    assert.ok(reset.left >= card.left - 2 && reset.right <= card.right + 2, "Reset button extends outside its card");
  }
}

try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
      assert.ok(response?.ok(), `HTTP ${response?.status()} at ${width}px`);
      await page.locator("#partyGrid .party-button").first().waitFor({ timeout: 15000 });
      assert.equal(await page.locator("#partyGrid .party-button").count(), 8);
      assert.equal(await page.locator("#scenarioReset").isVisible(), false, "Reset should be hidden initially");
      const grid = page.locator("#partyGrid");
      await grid.scrollIntoViewIfNeeded();
      const before = await geometry(page);
      checkLayout(before, false);

      await page.locator('#partyGrid [data-party="c"]').click();
      assert.equal(await page.locator('#partyGrid [data-party="c"]').getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator("#scenarioReset").isVisible(), true, "Reset should become visible");
      const after = await geometry(page);
      checkLayout(after, true);
      const titleShift = Math.abs(after.title.top - after.card.top - (before.title.top - before.card.top));
      const gridShift = Math.abs(after.grid.top - after.card.top - (before.grid.top - before.card.top));
      assert.ok(titleShift <= 2, `Party heading shifted by ${titleShift}px at ${width}px`);
      assert.ok(gridShift <= 2, `Party symbols shifted by ${gridShift}px at ${width}px`);

      if ([320, 390, 1440].includes(width)) {
        await page.screenshot({ path: `artifacts/party-selected-${width}.png`, fullPage: true });
      }

      // Every party must select and expose an explanation, and the action must stay on one line.
      for (const key of parties) {
        await page.locator(`#partyGrid [data-party="${key}"]`).click();
        assert.equal(await page.locator(`#partyGrid [data-party="${key}"]`).getAttribute("aria-pressed"), "true");
        assert.equal(await page.locator("#scenarioReset").isVisible(), true);
        checkLayout(await geometry(page), true);
      }

      // Local logos must render as real images, not fallback letters.
      await page.locator("#partyGrid").scrollIntoViewIfNeeded();
      const logos = await page.locator(".party-logo").evaluateAll(async images => {
        await Promise.all(images.map(async image => {
          if (!image.src.includes("/party-logos/")) return;
          image.loading = "eager";
          if (!image.complete) await new Promise(resolve => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); });
        }));
        return images.map(image => ({ src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0 }));
      });
      assert.equal(logos.length, 8);
      assert.ok(logos.filter(image => image.src.startsWith("/party-logos/")).every(image => image.loaded), "A local party logo failed to render");

      await page.locator("#scenarioReset").click();
      assert.equal(await page.locator("#scenarioReset").isVisible(), false);
      assert.equal(await page.locator("#partyResult").getAttribute("class"), "party-result empty");
      const cleared = await geometry(page);
      assert.ok(Math.abs(cleared.grid.top - cleared.card.top - (before.grid.top - before.card.top)) <= 2, "Reset moved the party grid");

      // Fuel selector must recalculate, and advertisements must be off by default.
      await page.locator('[data-fuel="diesel"]').first().click();
      assert.equal(await page.locator('[data-fuel="diesel"]').first().getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator(".ad-slot:visible").count(), 0);
      assert.equal(errors.length, 0, `Browser errors: ${errors.join("; ")}`);
      checkLayout(await geometry(page), false);
      console.log(`PASS viewport ${width}px | 8 parties | no overflow | stable reset | rendered local logos`);
    } catch (error) {
      failures.push(`${width}px: ${error.stack || error}`);
      await page.screenshot({ path: `artifacts/browser-failure-${width}.png`, fullPage: true }).catch(() => {});
      console.error(`FAIL viewport ${width}px: ${error.message}`);
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
console.log("Browser QA PASSED at all viewport widths.");
