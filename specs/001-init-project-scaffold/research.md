# Research: Initialise Project Scaffolding

**Feature**: [001-init-project-scaffold](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-05-18

## Scope

Resolve every technical-context unknown for v1 to a concrete decision with rationale and rejected alternatives. The constitution pre-pins most stack choices, so this document is largely "promote the constitution mandate to a v1-specific value (version, exact config shape) and record alternatives the constitution itself rejected".

## R1 — TypeScript version

**Decision**: TypeScript `^5.6.0` (latest 5.x stable as of 2026-05). Pinned via `devDependencies` only; no runtime TypeScript.

**Rationale**: Constitution mandates `"target": "ES2024"`, which requires TypeScript ≥ 5.4 (ES2024 target support landed in TS 5.4). 5.6 brings the `--noUncheckedSideEffectImports` flag and stable inferred-type predicates that improve strict-mode ergonomics. Caret range tolerates patch/minor upgrades.

**Alternatives**:
- TypeScript 4.x — rejected by constitution: `"target": "ES2024"` is not supported.
- TypeScript 5.0–5.3 — rejected: ES2024 target unavailable; would force a target downgrade contradicting constitution.
- Pinned exact (`5.6.3`) — rejected for v1: caret range matches the constitution's tolerance for minor toolchain upgrades; exact pinning would create unnecessary maintenance churn.

## R2 — Node.js minimum version (`engines.node`)

**Decision**: `"engines.node": ">=22.11.0"`.

**Rationale**: Constitution §Technical Standards explicitly pins `Node.js >= 22.11 (latest 22.x LTS at ratification)`. Setting `engines.node` makes `npm install` warn (and CI fail on the install gate per FR-003) when a contributor's Node version is below the floor — directly satisfying [SC-006](spec.md#measurable-outcomes) ("error message names the runtime requirement on first install or run attempt").

**Alternatives**:
- Node 20 LTS — rejected by constitution (chose 22.11 explicitly).
- Node 22.x without minor pin (`>=22`) — rejected: 22.11 is the LTS line; allowing 22.0–22.10 risks pre-LTS bugs.
- `>=22.11` enforced only at runtime (no `engines` block) — rejected: misses the install-time signal SC-006 requires.

## R3 — Package manager

**Decision**: `npm`. No `pnpm` / `yarn` / `bun`.

**Rationale**: Spec FR-001 requires "a single documented command that installs all declared dependencies on a fresh clone". `npm` ships with Node and needs no separate install step — minimum-friction for SC-001's "under 5 minutes". The constitution does not mandate a package manager but uses `npm run` terminology in §Development Workflow (`npm run lint`, `npm run typecheck`, etc.), strongly implying npm.

**Alternatives**:
- pnpm — rejected for v1: faster installs and stricter dependency isolation, but adds a `corepack enable` or separate-install step that conflicts with SC-001's friction budget. Worth revisiting if the dependency tree grows substantially.
- yarn — rejected: yarn 1.x is in maintenance; yarn 4 adds zero-install/PnP complexity not justified by v1 scope.
- bun — rejected: incompatible with the constitution's `"module": "NodeNext"` requirement in some module-resolution edge cases; not yet a stable Node-compatible replacement.

## R4 — `tsconfig.json` shape

**Decision**:

```jsonc
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.test.ts", "dist", "node_modules"]
}
```

**Rationale**: `target`/`module`/`moduleResolution`/`strict` are mandated by the constitution. The additional strictness flags (`noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`) realise the spirit of "no `any` in public signatures" by catching common drift. `outDir: "dist"` matches the `.gitignore` entry for build output. Tests excluded from the production build but included by vitest separately.

**Alternatives**:
- `"module": "ESNext"` — rejected by constitution (mandates `NodeNext`).
- `"target": "ES2022"` — rejected by constitution (mandates `ES2024`).
- Skipping `noUncheckedIndexedAccess` — rejected: lets `arr[i]` masquerade as non-undefined, the most common source of runtime `undefined` errors in strict-mode TS.

## R5 — `eslint` flat-config shape

**Decision**: `eslint.config.mjs` using flat config, composing `@eslint/js` recommended + `typescript-eslint` recommended-type-checked + `eslint-config-prettier`. Invoked as `eslint . --max-warnings 0` per spec Q2 / BI-0092 step 4.

```js
// eslint.config.mjs (shape)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { project: "./tsconfig.json", tsconfigRootDir: import.meta.dirname }
    }
  },
  prettier
);
```

**Rationale**: Constitution mandates "`eslint` (flat config) MUST pass with zero warnings" and Prettier as the formatter — `eslint-config-prettier` disables eslint stylistic rules that would conflict with prettier, keeping responsibility cleanly split (eslint = correctness, prettier = formatting). `recommendedTypeChecked` enables the type-aware rules that catch the bugs strict TypeScript misses (e.g. `no-floating-promises`).

**Alternatives**:
- `.eslintrc.json` (legacy config) — rejected by constitution (mandates flat config).
- `recommended` (non-type-checked) — rejected: drops the highest-value rules (`no-floating-promises`, `no-misused-promises`).
- Adding `eslint-plugin-prettier` (runs prettier as an eslint rule) — rejected: doubles work in CI and is explicitly discouraged by prettier maintainers; `eslint-config-prettier` (disable-conflicting-rules only) is the recommended pattern.

## R6 — `vitest.config.ts` shape (incl. coverage)

**Decision**:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: { statements: 80 }
    }
  }
});
```

**Rationale**: Per constitution §Technical Standards (vitest + `@vitest/coverage-v8`) and §Development Workflow item 5 ("aggregate **statements** coverage threshold passes — configured in `vitest.config.ts` under `test.coverage.thresholds.statements`. This is the single source of truth for the merge floor"). The 80 floor matches BI-0092 step 6 and the spec's coverage Assumption. Branch / function / per-file thresholds are intentionally absent (constitution: "Branch / function / per-file thresholds are forbidden without an amendment"). `lcov` reporter enables future CI coverage-summary uploads without re-configuring.

**Alternatives**:
- `istanbul` provider — rejected by constitution (mandates `@vitest/coverage-v8`).
- Higher floor (90, 95) — rejected: the constitution's "ratchets via a one-line visible edit" phrasing means starting at the BI-0092 commitment (80) and ratcheting up in dedicated amendments, not pre-emptively. v1 is the floor-setting commit.
- Per-file thresholds — rejected by constitution (forbidden without amendment).
- Lower floor (50, 70) — rejected: BI-0092 step 6 pins 80; a lower floor would contradict it.

## R7 — GitHub Actions workflow shape

**Decision**: Single workflow `.github/workflows/ci.yml`, triggered on `push` (all branches) and `pull_request`, single `ubuntu-latest` job running the same `npm run` scripts as the local sequence. **Updated** per analyzer findings **I1** (added `format:check` gate) and **I2** (standardised on `npm run test:coverage`, not `npm test -- --coverage`).

```yaml
# .github/workflows/ci.yml (shape)
name: ci
on:
  push:
  pull_request:
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22.11"
          cache: npm
      - run: npm ci          # honours .npmrc engine-strict=true (analyzer F1)
      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm run test:coverage
```

**Rationale**: Satisfies FR-013 (CI runs same gates as local) + FR-014 (single source of truth — both CI and a contributor invoke the same `npm run` names). `npm ci` instead of `npm install` enforces lockfile fidelity and surfaces peer-dep warnings as exit-non-zero in the install gate per Q2 / BI-0092 step 15. Per Q5, `ubuntu-latest` only — no matrix.

**Alternatives**:
- Matrix on `[ubuntu-latest, windows-latest, macos-latest]` — rejected by spec Q5 and Out-of-Scope.
- Separate per-gate jobs (`lint-job`, `typecheck-job`, `test-job`) — rejected for v1: parallel jobs are faster but multiply install cost; single-job + sequential `npm run` is simpler and uses one `npm ci` cache. Revisit if total CI wall-clock exceeds a tolerated budget.
- `npm install` instead of `npm ci` — rejected: `npm install` writes to `package-lock.json` mid-CI and tolerates peer-dep drift, violating the FR-003 "peer-dep warnings fail" bar.
- Pinned digest (`@sha256:…`) for actions — rejected for v1: `actions/checkout@v4` major-pinning is the project-wide convention; digest-pinning is a security-hardening pass that can land later.

## R8 — `.gitattributes` line-ending policy

**Decision**: Single committed `.gitattributes`:

```text
* text=auto eol=lf
*.png binary
*.jpg binary
*.gif binary
*.ico binary
```

**Rationale**: Per spec Q5 and the new "Line-ending discipline" Assumption, a committed `.gitattributes` normalises line endings to LF in the repository regardless of the contributor's OS. Removes the `LF will be replaced by CRLF` warnings we've already seen in commits (`93412b1`, `ee0fac4`). Binary type tags prevent git from line-ending-mangling images that a later spec may add (logo, screenshot).

**Alternatives**:
- No `.gitattributes`, rely on per-clone `core.autocrlf` — rejected: leaves the contract implicit, breaks reproducibility across machines.
- `* text eol=lf` (no `auto`) — rejected: forces text on files git would otherwise auto-detect as binary, risking corruption.
- `eol=crlf` — rejected: contradicts Linux-CI consumer.

## R9 — npm `bin` wiring + `npx . --help` contract

**Decision**: `package.json` declares:

```jsonc
{
  "name": "@marwansaab/obsidian-vault-bootstrap",
  "version": "0.1.0",
  "type": "module",
  "bin": { "obsidian-vault-bootstrap": "./dist/cli.js" },
  "files": ["dist", "README.md", "LICENSE", "CONTRIBUTING.md"],
  "engines": { "node": ">=22.11.0" }
}
```

Built `dist/cli.js` is the compiled `src/cli.ts` with a shebang preserved (`#!/usr/bin/env node`). README quick-start command: `npm install && npm run build && npx . --help`.

**Rationale**: Per spec Q4, Node `bin` is the idiomatic CLI surface and `npx . --help` works from a clone without remembering a script name. The `--help` flag is satisfied entirely by `node:util` `parseArgs` (constitution-mandated for CLI parsing) — `parseArgs` emits a default help line, and v1 explicitly stays at help / version surface only (FR-011 + Out-of-Scope). The `npm run build` step is required because `bin` points at `dist/cli.js`, not `src/cli.ts`.

**Alternatives**:
- Pointing `bin` at `src/cli.ts` and running via `tsx` — rejected: adds a runtime dep for a placeholder; constitution's dependency-justification rule would fail it.
- `package.json` `type: "commonjs"` — rejected by constitution (`module: "NodeNext"` + `target: "ES2024"` naturally implies ESM).
- Multiple `bin` entries (short alias + long name) — rejected: one-entry, one-name is simpler; aliases can be added when a real second entry-point exists.

## R10 — README structure

**Decision**: Single `README.md` at repo root with the following sections in order. **Updated** per analyzer findings **I1** (six gates not five), **I2** (canonical command set `npm ci` + `npm run test:coverage`), **A1** (governance link "visible without scrolling on a standard 1080p viewport").

1. `# @marwansaab/obsidian-vault-bootstrap` (title)
2. One-paragraph description (FR-009 + SC-004 "answer 'what does this package do?' in 60 s").
3. **Governance** callout near the top — visible without scrolling on a standard 1080p viewport — with a prominent link to [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (per FR-008, FR-009, SC-007).
4. `## Quickstart` — `git clone ...`, `nvm use 22`, **`npm ci`** (not `npm install`; respects lockfile + `engine-strict`), `npm run build`, `npx . --help`.
5. `## Quality gates` — names each of the **six gates** (`format:check` / `lint` / `typecheck` / `build` / `test` / `coverage`) with their canonical `npm run` commands (FR-002).
6. `## Limitations (v0.1)` — bullets matching the spec's Out-of-Scope items (FR-009 last bullet). Cross-references `CHANGELOG.md` for the version-history view.
7. `## Attributions` — empty in v1 by design; section exists so future attributions are an append (Principle VII).

**Rationale**: Order matches the visitor's likely scan path (what is it → how to verify → what doesn't work yet → credits). Governance link near the top, not in a "Project meta" footer, directly satisfies SC-007's "located within 30 seconds, version stamp visible without scrolling once open".

**Alternatives**:
- Governance link in a footer / "Project meta" section — rejected: SC-007's 30-second bar requires top-of-page placement.
- Splitting `Attributions` into its own file — rejected for v1: the constitution says "README MUST list every upstream in an `## Attributions` section"; splitting it would require updating the constitution.
- `## Installation` instead of `## Quickstart` — rejected: spec FR-009 / Story 4 AS2 require a "quick-start" with "a single command".

## R11 — Constitution-mandated dependencies not added in v1

**Decision**: `zod`, `handlebars`, `js-yaml`, `glob` / `fast-glob`, `@inquirer/prompts` are **not** added to `package.json` in v1.

**Rationale**: The constitution requires "new runtime dependencies MUST be justified in the PR description against the alternative of a small in-tree implementation". v1 has no profile parsing (zod), no rendering (handlebars), no YAML reads (js-yaml), no glob walks (glob), no interactive Q&A (@inquirer/prompts). Adding any of them as an unused dep would fail their own justification gate. Each lands with the first spec that actually consumes it.

**Alternatives**:
- Add all five as `dependencies` for "future use" — rejected by the constitution's dependency-justification rule.
- Add them as `devDependencies` — rejected for the same reason; the rule applies to any non-trivial dep, dev or runtime, since both ship in the install gate's surface.
- Add only zod (lowest-cost / highest-future-use) — rejected: even zod has no v1 boundary input to validate.

## R12 — Placeholder CLI behaviour

**Decision**: `src/cli.ts` parses `--help` and `--version` via `node:util` `parseArgs`, prints a fixed text block, exits 0. Unknown flag: `parseArgs` throws a `TypeError` with a `code: "ERR_PARSE_ARGS_UNKNOWN_OPTION"` — caught and re-thrown with non-zero exit + the flag name on stderr. No other behaviour. Test file (`src/cli.test.ts`) covers: `--help` exit-0 + non-empty stdout; `--version` exit-0 + matches `package.json` version; unknown flag exit-non-zero + stderr names the flag.

**Rationale**: Satisfies FR-011 (placeholder, help/version surface) and FR-006 (failure message names the affected file/flag). Constitution-compliant (parseArgs, vitest, Principle VII header on every file). Ships ≥ 80% statement coverage easily (the file is small; three test cases cover all branches).

**Alternatives**:
- Using `commander` / `yargs` — rejected by constitution (parseArgs mandated).
- Catching `parseArgs` errors silently and printing only `--help` — rejected: violates FR-006 + Principle V (silent failure masks the problem).
- Adding subcommands now — rejected by Out-of-Scope ("no end-user-facing subcommands beyond a help / placeholder entry-point").

## R13 — Engine-version enforcement (analyzer remediation **F1**)

**Decision**: Ship `.npmrc` at repo root containing `engine-strict=true` (single line).

**Rationale**: `engines.node` in `package.json` produces a **warning** by default in npm 10+; the install proceeds even on a Node line below the declared floor. Without `engine-strict`, FR-005's "fail with an error message that explicitly names the runtime-floor requirement" and SC-006's "error message ... not a downstream stack trace" silently pass on a contributor running Node < 22.11. Setting `engine-strict=true` at the project level (NOT user-level) converts the warning into a hard error for both local `npm ci`/`npm install` and CI `npm ci` invocations — a single source of truth covering both surfaces. Surfaced as `/speckit-analyze` round-1 finding **F1 (HIGH)**.

**Alternatives**:

- `--engine-strict` flag on every CI `npm ci` invocation — rejected: doesn't cover the local install path; a contributor doing `npm install` locally would still see only a warning.
- Documenting the requirement in the README only — rejected: documentation isn't enforcement, contradicts FR-005's "MUST fail".
- Setting `engine-strict=true` in `~/.npmrc` (user-level) — rejected: per-contributor configuration, not part of the repo; defeats reproducibility.

## Open items

None. All Phase 0 unknowns are resolved; one Phase-2 analyzer-remediation decision (R13) added during `/speckit-analyze` round 1 (2026-05-18).
