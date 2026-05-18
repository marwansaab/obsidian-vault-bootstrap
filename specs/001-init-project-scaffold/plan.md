# Implementation Plan: Initialise Project Scaffolding

**Branch**: `001-init-project-scaffold` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [`specs/001-init-project-scaffold/spec.md`](spec.md)

## Summary

Land the v1 substrate for `@marwansaab/obsidian-vault-bootstrap`: a TypeScript-on-Node CLI package whose only end-user surface is a placeholder `npx . --help` entry-point, but whose **quality-gate suite** (lint, type-check, build, test, coverage) passes on a fresh clone with zero local configuration AND mirrors identically on GitHub Actions ubuntu-latest. Ships the full top-level directory tree (with `.gitkeep` placeholders) enumerated in [FR-007](spec.md#functional-requirements) so subsequent feature specs (instruction content, templates, project profiles, vault initialisation) have deterministic homes. Reuses the existing `.specify/memory/constitution.md` (commit `653b364`) as the canonical governance document and adds a prominent README link to satisfy [SC-007](spec.md#measurable-outcomes).

**Technical approach**: pure-Node toolchain (TypeScript 5.x strict + NodeNext + ES2024, eslint flat config, prettier, vitest + `@vitest/coverage-v8`), package-manager `npm`, single `package.json` `bin` field wiring the placeholder CLI, single GitHub Actions workflow running the same `npm run` scripts as a contributor's local sequence (per [FR-014](spec.md#functional-requirements) single-source-of-truth). Constitution-mandated future dependencies (zod, handlebars, js-yaml, glob, `@inquirer/prompts`) are **deliberately not added in v1** — the constitution itself requires that "new runtime dependencies MUST be justified in the PR description against the alternative of a small in-tree implementation", and unused declared deps would fail that bar.

## Technical Context

**Language/Version**: TypeScript 5.x (latest stable), strict mode, `tsc --noEmit` clean. `tsconfig.json` MUST set `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"target": "ES2024"`, `"strict": true` (per [constitution §Technical Standards](../../.specify/memory/constitution.md#technical-standards--stack-constraints)).

**Primary Dependencies (v1, runtime)**: none. The placeholder CLI uses only `node:util` `parseArgs` (per constitution) and the Node standard library.

**Primary Dependencies (v1, dev)**: `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`, `eslint-config-prettier`, `vitest`, `@vitest/coverage-v8`, `@types/node`.

**Constitution-mandated dependencies deferred to subsequent specs** (each will land with the spec that first uses it): `zod`, `handlebars`, `js-yaml`, `glob` or `fast-glob`, `@inquirer/prompts`. Declaring them as unused dependencies in v1 would violate the constitution's dependency-justification rule.

**Storage**: N/A. v1 reads no profile YAML, writes no rendered output.

**Testing**: `vitest` + `@vitest/coverage-v8` (V8 coverage provider). Test files named `*.test.ts`, co-located with their source module (per [constitution §Technical Standards](../../.specify/memory/constitution.md#technical-standards--stack-constraints)). Statement coverage floor: 80% (per [spec FR-003 / Assumption](spec.md#functional-requirements) and [BI-0092 step 6](spec.md#clarifications)).

**Target Platform**: Node.js ≥ 22.11 (latest 22.x LTS at constitution ratification). CI matrix: `ubuntu-latest` on GitHub Actions only (per [spec Q5](spec.md#clarifications)).

**Project Type**: Single CLI project. Top-level directory layout per [spec FR-007](spec.md#functional-requirements) (top-level `core/`, `families/`, `templates/`, `projects/`, NOT nested under `src/`).

**Performance Goals**: [SC-001](spec.md#measurable-outcomes) — a fresh contributor can reach "all gates passing" within 5 minutes. No runtime performance targets in v1 (no rendering happens).

**Constraints**:
- [SC-002](spec.md#measurable-outcomes): 100% of declared quality gates pass on a freshly-cloned repo with zero local configuration changes.
- [SC-005](spec.md#measurable-outcomes): 100% of local gates also run in CI on every push and pull request.
- [SC-008](spec.md#measurable-outcomes): every shipped directory traceable to a named source (ADR-019, [[Instruction Categories]], AI Instructions Distribution Channel, or BI-0092).
- ubuntu-latest only in CI; LF/CRLF drift handled by `.gitattributes`.
- npm peer-dependency warnings fail the install gate unless documented in the change description (per BI-0092 step 15 carve-out).

**Scale/Scope**: 5 user stories (P1/P2/P3), 14 functional requirements, 8 success criteria, 9 named directories on first commit. ~6 configuration files (`package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `.gitattributes`, `.github/workflows/ci.yml`) + 1 placeholder source file + 1 placeholder test file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design (see [Post-Design Re-check](#post-design-re-check) below).*

Resolved against [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) v1.0.0.

| Principle | v1 Applicability | Verdict | How satisfied (or N/A rationale) |
|----------|------------------|---------|----------------------------------|
| **I — Deterministic & Reproducible Rendering** | N/A in v1 | ✅ PASS | v1 ships no rendering pipeline; the placeholder `--help` / `--version` output is static. Triggers from the first spec that adds a renderer or template-render code path. |
| **II — Single Source of Truth** | Partial | ✅ PASS | No rendered output ships in v1, so the "DO NOT EDIT" header rule has no surface yet. The constitution itself is the single source of truth for governance and remains at `.specify/memory/constitution.md` (per [spec FR-008](spec.md#functional-requirements) / Q3). |
| **III — LLM-Agnostic Agent-Instruction Generation** | N/A in v1 | ✅ PASS | No template families implemented in v1; `families/default/` ships empty with `.gitkeep`. Triggers from the first spec that adds an agent-template family. |
| **IV — Boundary Input Validation with Zod** | N/A in v1 | ✅ PASS | The placeholder CLI's only input is `--help` / `--version`, parsed with the constitution-mandated `node:util` `parseArgs`. No profile YAML, no Q&A, no env vars consumed. Triggers from the first spec that adds a boundary input. |
| **V — Explicit Failure Propagation** | N/A in v1 | ✅ PASS | The placeholder has no failure surface beyond `parseArgs` rejecting an unknown flag, which already produces a node-native typed error. `RenderError` is intentionally **not** added in v1; it lands with the first spec that crosses a real boundary (renderer / Q&A / FS write). Pre-emptively adding an unused class would violate the "don't add abstractions beyond what the task requires" guidance. |
| **VI — Caveman Compression for Agent-Facing Templates** | N/A in v1 | ✅ PASS | No agent-facing templates ship in v1. Triggers from the first content-bearing spec (instruction-content, family-template). |
| **VII — Attribution & Layered Composition Transparency** | **YES in v1** | ✅ PASS | Every source file added in v1 carries an `// Original — no upstream. <one-line intent>.` header (the placeholder `src/cli.ts` and its test). README ships with an `## Attributions` section — empty in v1 by design (no upstream code lifted), but the section exists so future attributions are an append, not a structure change. |

**Verdict**: PASS. No deviations to justify. **Complexity Tracking** table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-init-project-scaffold/
├── spec.md              # Authored by /speckit-specify, refined by /speckit-clarify
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 (/speckit-plan output)
├── data-model.md        # Phase 1 (/speckit-plan output)
├── quickstart.md        # Phase 1 (/speckit-plan output)
├── contracts/
│   └── cli.md           # Phase 1 — placeholder CLI surface contract
├── checklists/
│   └── requirements.md  # Authored by /speckit-specify
└── tasks.md             # Phase 2 — /speckit-tasks output (NOT created here)
```

### Source Code (repository root)

```text
core/                    # Empty + .gitkeep. Source: ADR-019 + [[Instruction Categories]].
├── upfront/.gitkeep
└── on-demand/.gitkeep

families/                # Empty + .gitkeep. Source: ADR-019 Decision + AI Instructions
└── default/.gitkeep     #   Distribution Channel §Source Repo Shape + §Open Questions Q6.

templates/.gitkeep       # Empty + .gitkeep. Source: AI Instructions Distribution
                         #   Channel architecture diagram.

projects/.gitkeep        # Empty + .gitkeep. Source: AI Instructions Distribution
                         #   Channel §Per-Project Profile.

src/                     # Non-empty at scaffold. Source: BI-0092 step 9.
├── cli.ts               #   Placeholder CLI entry-point. Wired as `bin` in package.json.
└── cli.test.ts          #   Co-located test per constitution §Technical Standards.

.github/workflows/       # Non-empty at scaffold. Source: BI-0092 step 8.
└── ci.yml               #   Single workflow running lint+typecheck+build+test+coverage
                         #   on ubuntu-latest, on push and pull_request.

.specify/                # Non-empty at scaffold. Source: BI-0092 step 10.
├── templates/           #   (Spec Kit framework files — already present.)
├── memory/
│   └── constitution.md  #   Canonical governance doc (per spec FR-008, Q3).
└── working/             #   GITIGNORED per BI-0092 step 7. Never committed.

# Repository-root configuration and metadata files
package.json             # Declares engines.node, bin, scripts, devDependencies.
tsconfig.json            # NodeNext, ES2024, strict, noEmit.
eslint.config.mjs        # Flat config, typescript-eslint, prettier-disable.
vitest.config.ts         # Test + coverage config; statements floor 80%.
.gitattributes           # LF enforcement (per spec Q5 LF/CRLF drift assumption).
.gitignore               # Includes .specify/working/, node_modules/, dist/, coverage/.
README.md                # FR-009 minimum content + governance link (FR-008).
CONTRIBUTING.md          # Already present (commit 93412b1).
LICENSE                  # Already present (commit 9818f38).
CLAUDE.md                # SPECKIT marker; points to active plan.
```

**Structure Decision**: Single-project CLI layout with **top-level content directories** as siblings of `src/` (NOT nested under `src/<pkg>/`). This is the layout pinned by [spec FR-007 / Q1](spec.md#functional-requirements) per the AI Instructions Distribution Channel §Source Repo Shape architecture. `src/` contains only the code package; instructional, template, family, and project-profile content lives at the top level so consumers can mount any of them as a sub-tree without copying the code package.

## Phase 0 — Outline & Research

Completed. See [research.md](research.md). All NEEDS CLARIFICATION items from the initial Technical Context draft were resolved against (a) the constitution's stack constraints, (b) the spec's clarification round 1 (BI-0092 commitments), and (c) standard Node.js toolchain conventions. Decisions covered: TypeScript / Node versions, package manager, eslint + typescript-eslint flat-config shape, vitest + V8 coverage configuration, GitHub Actions workflow shape, `.gitattributes` line-ending policy, npm `bin` wiring + the `npx . --help` invocation contract, README structure including the governance link, and the deferred constitution-mandated dependencies.

## Phase 1 — Design & Contracts

Completed. Artifacts:

- [data-model.md](data-model.md) — formalises the three spec-level Key Entities (Quality Gate, Governance Constitution, Scaffold Directory Map) as logical entities with attributes, invariants, and lifecycle notes. No runtime data model exists in v1.
- [contracts/cli.md](contracts/cli.md) — placeholder CLI surface: `npx . --help`, `npx . --version`, unknown-flag failure shape. Defines exit codes, output channels, and stability guarantees.
- [quickstart.md](quickstart.md) — the validation walkthrough a contributor follows on a fresh clone to prove [SC-001](spec.md#measurable-outcomes), [SC-002](spec.md#measurable-outcomes), and [Story 1 acceptance scenarios](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1).
- [CLAUDE.md](../../CLAUDE.md) — updated to point at this plan between the `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` markers.

## Post-Design Re-check

Re-evaluating Constitution Check after Phase 1 artifacts exist:

- **I (Deterministic)** — No change. Still N/A; no rendering happens in any v1 artifact. The CLI's `--help` and `--version` output is static.
- **II (SSoT)** — No change. Constitution stays at `.specify/memory/constitution.md`; README links to it.
- **III (LLM-agnostic)** — No change. No template families.
- **IV (Zod)** — No change. CLI uses `parseArgs` only; contract documented in [contracts/cli.md](contracts/cli.md).
- **V (Explicit Failure Propagation)** — Slight expansion: [contracts/cli.md](contracts/cli.md) defines that unknown-flag → non-zero exit + stderr message naming the flag. The native `parseArgs` `TypeError` satisfies this without needing `RenderError` yet (which lands when the first spec opens a real boundary). Still PASS.
- **VI (Caveman compression)** — No change. No agent-facing templates ship.
- **VII (Attribution)** — Reinforced: the [data-model.md](data-model.md) and [research.md](research.md) artifacts cite all upstream sources (ADR-019, BI-0092, AI Instructions Distribution Channel) by name; the README's `## Attributions` section ships empty by design but exists as a stable insertion point.

**Verdict**: PASS, unchanged from pre-design.

## Complexity Tracking

> *Fill ONLY if Constitution Check has violations that must be justified.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none — Constitution Check PASS with no deviations)* | | |

## Next Command

`/speckit-tasks` — generates the dependency-ordered `tasks.md` against this plan, the spec, and the design artifacts. The tasks will:

1. Create the directory tree (FR-007).
2. Author `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `.gitattributes`, `.gitignore`.
3. Author `src/cli.ts` (placeholder) + `src/cli.test.ts` (happy-path + unknown-flag test).
4. Author `.github/workflows/ci.yml` running the same `npm run` scripts as local.
5. Author `README.md` per [FR-009](spec.md#functional-requirements) + governance link per Q3.
6. Verify the full quality-gate sequence passes locally AND in CI (Story 1, Story 5 acceptance).
