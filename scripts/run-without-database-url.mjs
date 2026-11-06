/**
 * Cross-platform stand-in for `env -u DATABASE_URL …`
 * so local scripts force PGlite even if DATABASE_URL is set in the shell.
 */
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node scripts/run-without-database-url.mjs <command> [...args]",
  );
  process.exit(1);
}

const env = { ...process.env };
delete env.DATABASE_URL;

// Windows needs shell so next.cmd / npx.cmd resolve; Unix PATH is enough.
const child = spawn(args[0], args.slice(1), {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
