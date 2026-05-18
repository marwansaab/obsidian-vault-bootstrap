#!/usr/bin/env node
// Original — no upstream. Placeholder CLI entry-point for the v1 scaffold.
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export interface CliResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

const HELP_TEXT = `obsidian-vault-bootstrap

Usage:
  npx . [--help|--version]

Options:
  -h, --help     Show this help text and exit.
  -v, --version  Print the package version and exit.

v0.1 ships a placeholder CLI only. See README.md for the v0.1 limitations
and .specify/memory/constitution.md for the governance constitution.
`;

function readPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(here, "..", "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const parsed = JSON.parse(raw) as { version: string };
  return parsed.version;
}

export function main(argv: readonly string[]): CliResult {
  try {
    const { values } = parseArgs({
      args: [...argv],
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
      strict: true,
      allowPositionals: false,
    });

    if (values.version) {
      return { exitCode: 0, stdout: `${readPackageVersion()}\n`, stderr: "" };
    }
    return { exitCode: 0, stdout: HELP_TEXT, stderr: "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      exitCode: 1,
      stdout: "",
      stderr: `${message}\nUse --help for usage information.\n`,
    };
  }
}

function invokedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return fileURLToPath(import.meta.url) === resolve(entry);
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  const result = main(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.exitCode);
}
