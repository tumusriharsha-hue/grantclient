import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = join(root, ".git", "hooks");
const hookPath = join(hooksDir, "pre-push");
const hook = `#!/bin/sh
exec npm run pre-push
`;

if (!existsSync(join(root, ".git"))) {
  process.exit(0);
}

try {
  mkdirSync(hooksDir, { recursive: true });
  writeFileSync(hookPath, hook, { mode: 0o755 });
  chmodSync(hookPath, 0o755);
  console.log("Installed .git/hooks/pre-push");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Skipping git hook install: ${message}`);
}
