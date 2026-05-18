// Original — no upstream. Tests for the v1 placeholder CLI.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { main } from "./cli.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(resolve(here, "..", "package.json"), "utf8"),
) as { version: string };

describe("placeholder CLI", () => {
  it("--help exits 0 with non-empty stdout containing '--help'", () => {
    const result = main(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
    expect(result.stdout).toContain("--help");
    expect(result.stderr).toBe("");
  });

  it("--version exits 0 with stdout matching the package.json version", () => {
    const result = main(["--version"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(`${packageJson.version}\n`);
    expect(result.stderr).toBe("");
  });

  it("unknown flag exits non-zero with stderr naming the flag and mentioning help", () => {
    const result = main(["--foo"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--foo");
    expect(result.stderr.toLowerCase()).toContain("help");
    expect(result.stdout).toBe("");
  });

  it("no-args produces the same stdout as --help", () => {
    const helpResult = main(["--help"]);
    const noArgsResult = main([]);
    expect(noArgsResult.exitCode).toBe(0);
    expect(noArgsResult.stdout).toBe(helpResult.stdout);
    expect(noArgsResult.stderr).toBe("");
  });
});
