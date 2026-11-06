/**
 * CLI helper to force a live collect cycle against local PGlite.
 * Cross-platform via: npm run collect
 *   → node scripts/run-without-database-url.mjs npx --yes tsx scripts/collect-once.ts
 */
import { refreshCollect } from "../src/lib/collect";

async function main() {
  console.log("Starting live collect (direct storefronts + SMZDM fallback)…");
  const result = await refreshCollect();
  console.log(JSON.stringify(result, null, 2));
  console.log(
    `\nDone: priceSource=${result.priceSource} live=${result.liveOffers} demo=${result.demoOffers}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
