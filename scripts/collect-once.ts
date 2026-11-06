/**
 * CLI helper to force a collect cycle against local PGlite.
 * Usage: npm run collect
 */
import { refreshCollect } from "../src/lib/collect";

const result = await refreshCollect();
console.log(JSON.stringify(result, null, 2));
