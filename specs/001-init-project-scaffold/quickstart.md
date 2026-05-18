# Quickstart: Initialise Project Scaffolding

**Feature**: [001-init-project-scaffold](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-05-18

## Purpose

This is the validation walkthrough a contributor follows on a fresh clone to prove that:

- [SC-001](spec.md#measurable-outcomes) — install → all gates passing in under 5 minutes.
- [SC-002](spec.md#measurable-outcomes) — 100% of declared quality gates pass with zero local configuration changes.
- [Story 1 acceptance scenarios](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1) — substrate ready for feature work.

The same sequence is intended to be paste-able into the v1 README's `## Quickstart` section (see [research R10](research.md#r10--readme-structure)).

## Prerequisites

| Tool | Required version | How to verify |
|------|------------------|---------------|
| Node.js | ≥ 22.11.0 (latest 22.x LTS) | `node --version` |
| npm | bundled with Node 22.11+ | `npm --version` (expect 10.x or 11.x) |
| Git | any recent version | `git --version` |

If `node --version` reports `< 22.11.0`, `npm install` will fail with an explicit error naming the floor (per [SC-006](spec.md#measurable-outcomes), realised by `engines.node` in `package.json` — see [research R2](research.md#r2--nodejs-minimum-version-enginesnode)).

## Steps

```bash
# 1. Clone
git clone https://github.com/<owner>/obsidian-vault-bootstrap.git
cd obsidian-vault-bootstrap

# 2. (Optional) make sure you're on the right Node line
nvm use 22  # or fnm use 22, or volta pin node@22

# 3. Install — `npm ci` honours the lockfile and surfaces peer-dep warnings
npm ci

# 4. Run each quality gate. Should be all green on a clean checkout.
npm run lint
npm run typecheck
npm run build
npm test -- --coverage

# 5. Try the placeholder entry-point.
npx . --help
npx . --version
```

Expected wall-clock on a warm `~/.npm` cache and a modern laptop: ~2–3 minutes for steps 3–5. Cold cache: ≤ 5 minutes (per [SC-001](spec.md#measurable-outcomes)).

## Expected output

### Step 3 — `npm ci`

- Exit code: `0`
- Stderr noise tolerated: package-manager version banner, transitive-dep deprecation notices.
- Stderr noise that fails the install gate (per [spec Q2 / BI-0092 step 15](spec.md#clarifications)): peer-dependency warnings (unless documented in the change description that introduced the dep).

### Step 4 — quality gates

| Command | Expected exit | Expected output shape |
|---------|---------------|----------------------|
| `npm run lint` | `0` | No `warning` or `error` lines from `eslint`. Equivalent to `eslint . --max-warnings 0` exiting 0. |
| `npm run typecheck` | `0` | Zero output, or a "No errors found" line from `tsc --noEmit`. |
| `npm run build` | `0` | `dist/` produced (cli.js, cli.d.ts, source maps). No warning-severity emit from `tsc`. |
| `npm test -- --coverage` | `0` | vitest summary shows N tests passing, coverage summary shows `Statements ≥ 80%`. |

### Step 5 — placeholder CLI

- `npx . --help` → exit `0`, non-empty stdout containing the string `--help` (the parseArgs-generated usage text).
- `npx . --version` → exit `0`, stdout exactly `0.1.0` followed by a newline.

Per [contracts/cli.md](contracts/cli.md), the full surface is `--help`, `--version`, no-args (alias of `--help`), and "unknown flag" (exits non-zero, names the flag on stderr).

## Failure scenarios (what to expect on a broken tree)

Useful to validate Story 1 acceptance scenario 3 ("affected gate exits non-zero with a message that names the broken file"):

| Deliberate breakage | Gate that catches it | Failure message names |
|--------------------|---------------------|----------------------|
| Add `let x: number = "string"` to `src/cli.ts` | `npm run typecheck` | `src/cli.ts` |
| Add `let unused = 1;` to `src/cli.ts` | `npm run lint` (rule `@typescript-eslint/no-unused-vars`) | `src/cli.ts` |
| Delete an assertion in `src/cli.test.ts` so a test fails | `npm test` | the test name and source file |
| Add `if (a) { throw "x" }` with `a` never true, dropping statement coverage below 80% | `npm test -- --coverage` | the file + the uncovered statements |
| Run with Node `< 22.11` | `npm ci` install gate | the required Node version |

If a gate fails with a message that does **not** name the file / flag / test, that is a violation of [FR-006](spec.md#functional-requirements) and a bug.

## Governance check (Story 2 acceptance)

Open [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (the link is also surfaced near the top of the README per [FR-008 / FR-009](spec.md#functional-requirements) / [Q3](spec.md#clarifications)). Verify:

- Version stamp (`**Version**: <semver>`) is visible without scrolling.
- Each of Principles I–VII is stated as a non-negotiable rule.
- The Sync Impact Report comment block at the top reflects the current version.

This realises [SC-007](spec.md#measurable-outcomes) (located within 30 seconds, version visible without scrolling).

## Landing page check (Story 4 acceptance)

Open `README.md`. Within 60 seconds (per [SC-004](spec.md#measurable-outcomes)) confirm:

- The top description answers "what does this package do?" in plain prose.
- The `## Quickstart` section contains the install + `npx . --help` command above.
- The `## Limitations (v0.1)` section names the items from [spec Out of Scope](spec.md#out-of-scope).
- The governance link points at `.specify/memory/constitution.md`.

## CI check (Story 5 acceptance)

After pushing the scaffold to a branch:

- The single GitHub Actions workflow at `.github/workflows/ci.yml` runs on `ubuntu-latest`.
- All five gate steps (`npm run lint`, `npm run typecheck`, `npm run build`, `npm test -- --coverage`, preceded by `npm ci`) report green.
- On a hypothetical broken-on-purpose PR, the failing gate is named in the GitHub Actions summary (the job name + step name make this automatic).

If the local sequence (`npm run lint && npm run typecheck && npm run build && npm test -- --coverage`) and the CI sequence diverge for any reason other than an explicit, justified amendment, that is a violation of [FR-014](spec.md#functional-requirements).
