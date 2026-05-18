# Contract: Placeholder CLI

**Feature**: [001-init-project-scaffold](../spec.md) · **Plan**: [plan.md](../plan.md) · **Date**: 2026-05-18

## Scope

Documents the v1 surface of the placeholder CLI exposed by `@marwansaab/obsidian-vault-bootstrap`. This contract is **stable for v0.x** — additions are permitted, but the existing flags and exit-code semantics MUST NOT change without a spec amendment.

Invocation from a fresh clone (post-`npm install && npm run build`): `npx . <flag>`
Invocation post-publish: `npx @marwansaab/obsidian-vault-bootstrap <flag>`

Both invocations resolve to the same `bin` entry (`./dist/cli.js`) per [research R9](../research.md#r9--npm-bin-wiring--npx---help-contract).

## Surface

### `npx . --help`

| Property | Value |
|----------|-------|
| Exit code | `0` |
| Stdout | Non-empty. Format produced by `node:util` `parseArgs`, which lists the known options and a usage line. The exact text is implementation-defined for v1 (parseArgs default) but MUST be non-empty and MUST include the string `--help`. |
| Stderr | Empty. |
| Side effects | None (read-only). |
| Stability | The presence of `--help` and its exit-0 + non-empty-stdout contract are stable for v0.x. The exact wording of the help text is not stable until v1.0.0. |

### `npx . --version`

| Property | Value |
|----------|-------|
| Exit code | `0` |
| Stdout | Exactly the `version` field from `package.json`, followed by a trailing newline. v1 ships `0.1.0`, so stdout is the literal bytes `0.1.0\n`. |
| Stderr | Empty. |
| Side effects | None. |
| Stability | The exit code + the "exact-match to `package.json` version" contract is stable. Newer versions print their own version; consumers can rely on this for shell-script parsing. |

### `npx . <unknown-flag>` (e.g. `npx . --foo`)

| Property | Value |
|----------|-------|
| Exit code | Non-zero (`1`). |
| Stdout | Empty. |
| Stderr | Non-empty. MUST contain the literal text of the offending flag (e.g. `--foo`). MUST contain a hint pointing the user at `--help`. |
| Side effects | None (no files written, no network calls, no process forks). |
| Stability | The "exit non-zero, stderr names the flag, no side effects" contract is stable. The exact wording is not. |

This shape directly satisfies [spec FR-006](../spec.md#functional-requirements) ("failure message MUST identify the affected file or component by name") at the CLI surface, and [constitution Principle V](../../../.specify/memory/constitution.md#v-explicit-failure-propagation) at the placeholder's only failure path.

### `npx .` (no arguments)

| Property | Value |
|----------|-------|
| Exit code | `0` |
| Stdout | Same content as `npx . --help`. |
| Stderr | Empty. |
| Side effects | None. |
| Stability | Stable for v0.x. The "no-args is a synonym for --help" behaviour MAY be deprecated post-v1.0.0 if the package gains real subcommands; documented here so a future change is recognised as a contract change. |

## Out of contract (NOT exposed in v1)

The following are explicitly **not** in the v1 surface and any v1 invocation that would target them MUST exit as an `<unknown-flag>` case:

- `npx . init` / `npx . bootstrap` / any subcommand verb.
- `npx . --profile <path>` or any flag accepting a file path.
- Any flag that triggers reading or writing files outside `process.stdout` / `process.stderr`.
- Any interactive prompt (`@inquirer/prompts` is not a v1 dependency per [research R11](../research.md#r11--constitution-mandated-dependencies-not-added-in-v1)).

When the first content-bearing spec adds a real command, this contract MUST be updated in the same change set.

## Process / environment contract

- **stdin**: not read. Closing stdin has no effect.
- **Environment variables**: none are read.
- **Current working directory**: not consulted (`process.cwd()` is not called).
- **Filesystem**: not touched.
- **Network**: not touched.
- **Process model**: single process, no `child_process` spawning, no worker threads.

This narrow surface is intentional — it is the v1 sanity property that allows `npx . --help` to be the [SC-001 / SC-004 quickstart command](../spec.md#measurable-outcomes) without any environmental preconditions beyond "Node ≥ 22.11 installed".

## Test obligations

Per [research R12](../research.md#r12--placeholder-cli-behaviour), `src/cli.test.ts` MUST contain at least these cases, each of which exercises one row of the surface table above:

| Test | Asserts |
|------|---------|
| `--help exits 0 with non-empty stdout containing "--help"` | `npx . --help` row |
| `--version exits 0 with stdout matching the package.json version` | `npx . --version` row |
| `unknown flag exits non-zero, stderr contains the flag name and "help"` | `npx . <unknown-flag>` row |
| `no-args exits 0 with the same stdout as --help` | `npx .` row |

These four cases give 100% statement coverage of `src/cli.ts`, comfortably exceeding the 80% floor from [vitest.config.ts](../research.md#r6--vitestconfigts-shape-incl-coverage).
