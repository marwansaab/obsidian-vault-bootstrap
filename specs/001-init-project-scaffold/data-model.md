# Data Model: Initialise Project Scaffolding

**Feature**: [001-init-project-scaffold](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-05-18

## Scope

v1 ships **no runtime data model**. The placeholder CLI reads `process.argv`, prints a static string, exits. No persistence, no profiles, no rendered output, no Q&A state.

This document formalises the three logical entities the spec defines under **Key Entities** so that subsequent specs (which DO introduce runtime data — profile YAML, rendered output map, attribution registry) have a stable contract surface to extend. Each entity here is therefore a **specification-level contract**, not a runtime schema. The first spec that adds runtime data MUST update this document with the concrete shape and link the zod schema.

## Entity 1 — Quality Gate

Represents a named, individually-invokable verification step that the scaffold ships and CI re-runs.

**Attributes**:

| Attribute | Type | Notes |
|-----------|------|-------|
| `id` | enum (`lint`, `typecheck`, `build`, `test`, `coverage`, `install`) | The six gate names enumerated in [spec FR-003](spec.md#functional-requirements). `install` is a virtual gate satisfied by `npm ci`'s exit code + peer-dep policy. |
| `localCommand` | string | The `npm run <script>` form a contributor invokes locally (e.g. `npm run lint`). FR-002 mandates documentation. |
| `ciStep` | string | The corresponding shell step in `.github/workflows/ci.yml`. FR-014 demands `localCommand` and `ciStep` resolve to the same `npm run` invocation. |
| `strictnessBar` | string | Free-text but bounded per [spec FR-003 sub-bullets](spec.md#functional-requirements) — e.g. `lint = eslint . --max-warnings 0`. |
| `failureNamesArtefact` | boolean (MUST be `true`) | FR-006 contract: on failure the gate names the affected file/component. Enforced by the gate tool's default behaviour (eslint, tsc, vitest all do this natively). |
| `exitCodeOnFailure` | non-zero integer | Constitution + FR-003 implicit: any failure exits non-zero so CI can detect it. |

**Identity**: `id` is unique within the repository. Renaming a gate is a contract change requiring an update to FR-002 + the README + `ci.yml` in the same commit (per FR-014 single-source-of-truth).

**Lifecycle**: Static. Quality gates are defined in v1 and modified only by spec amendments. Adding a new gate (e.g. `audit` for `npm audit`) requires a spec change.

**Invariants**:

- **I-QG-1**: For every Quality Gate `qg`, `qg.localCommand` and `qg.ciStep` MUST execute the same underlying tool invocation. Tested at review time + by [Story 1 acceptance scenario 1](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1) (running locally) and [Story 5 acceptance scenario 1](spec.md#user-story-5---ci-is-green-on-the-first-push-priority-p3) (running in CI).
- **I-QG-2**: `qg.strictnessBar` MUST be cited verbatim in the README or in `package.json` scripts so a contributor can see it without reading CI YAML. (e.g. `"lint": "eslint . --max-warnings 0"` in `package.json` is self-documenting.)
- **I-QG-3**: The coverage gate's threshold (currently `statements: 80`) lives in **one** file (`vitest.config.ts`) per constitution §Development Workflow item 5.

**v1 instances** (one row per Quality Gate; updated post-analyzer-remediation per **I1** and **I2**):

| `id` | `localCommand` | `ciStep` | `strictnessBar` |
|------|---------------|----------|----------------|
| `format-check` | `npm run format:check` | `- run: npm run format:check` | `prettier --check .` (non-zero exit if any file diverges from prettier formatting) |
| `lint` | `npm run lint` | `- run: npm run lint` | `eslint . --max-warnings 0` |
| `typecheck` | `npm run typecheck` | `- run: npm run typecheck` | `tsc --noEmit` (strict, zero diagnostics) |
| `build` | `npm run build` | `- run: npm run build` | `tsc` (zero warning-severity emit) |
| `test` | `npm test` | (covered by `test:coverage` in CI) | `vitest run` (non-zero on any failure or runner warning) |
| `coverage` | `npm run test:coverage` | `- run: npm run test:coverage` | `statements >= 80` (vitest threshold) |
| `install` | `npm ci` | `- run: npm ci` | peer-dep warnings fail unless documented in change description; engine-version violations are hard errors via `.npmrc engine-strict=true` (analyzer **F1**) |

## Entity 2 — Governance Constitution

Represents the versioned governance document that authorises every change.

**Attributes**:

| Attribute | Type | Notes |
|-----------|------|-------|
| `path` | string (constant: `.specify/memory/constitution.md`) | Canonical per [spec FR-008 / Q3](spec.md#functional-requirements). Single source of truth — no aliases, no symlinks, no top-level duplicate. |
| `version` | semver string | Currently `1.0.0` per the file's `**Version**` line. Bumped per the constitution's own versioning policy. |
| `ratifiedAt` | ISO 8601 date | Currently `2026-05-18`. |
| `lastAmendedAt` | ISO 8601 date | Currently `2026-05-18`. Bumped on every amendment. |
| `principles` | ordered list of `(romanNumeral, name, isNonNegotiable, bodyMarkdown)` | Principles I–VII as of v1.0.0. |
| `syncImpactReportBlock` | HTML comment block at top of file | Constitution §Development Workflow item 6 demands this be updated on every amendment. |

**Identity**: The `path` is the identity. No two constitutions exist in the same repository.

**Lifecycle**:

1. **Initial ratification**: `version = 1.0.0`, populated `principles`, `syncImpactReportBlock` describes the TEMPLATE → 1.0.0 transition. (Already done in commit `653b364`.)
2. **Amendment** (per the constitution's own §Governance procedure): edit via `/speckit-constitution`, regenerate the sync-impact report, bump version (MAJOR/MINOR/PATCH per the constitution's versioning policy), update `lastAmendedAt`. Amendments ship in a dedicated PR never bundled with feature work.
3. **Supersession**: not anticipated; the constitution document is intended to evolve via amendments.

**Invariants**:

- **I-GC-1**: `path` is constant for the project's lifetime.
- **I-GC-2**: `version` MUST increase monotonically under semver; downgrades are not permitted.
- **I-GC-3**: Every amendment MUST update `syncImpactReportBlock` AND `lastAmendedAt` in the same change (per constitution §Development Workflow item 6).
- **I-GC-4**: The README MUST link to `path` prominently (per [spec FR-009](spec.md#functional-requirements) — operational realisation of SC-007).

## Entity 3 — Scaffold Directory Map

Represents the concrete set of directories the repository ships on first commit, each justified by a named source.

**Attributes** (per directory):

| Attribute | Type | Notes |
|-----------|------|-------|
| `path` | string (repository-relative) | E.g. `core/upfront/`, `src/`. |
| `kind` | enum (`empty-with-gitkeep`, `non-empty-at-scaffold`, `gitignored`) | Determines what (if anything) ships in v1. |
| `source` | string | The named source justifying this directory's existence (e.g. `ADR-019`, `BI-0092 step 8`). Required for SC-008 traceability. |
| `firstConsumingSpec` | optional string | The spec ID expected to populate this directory (where known). For `core/upfront/` this is the future instruction-content spec. |

**Identity**: `path` is unique.

**Lifecycle**:

1. **Created in v1** (this spec): all entries below ship in the scaffold commit.
2. **Populated** (in subsequent specs): empty-with-gitkeep directories receive real content; the `.gitkeep` file is deleted at that point.
3. **Removed**: a directory is removed only when its `firstConsumingSpec` has been retired AND no further spec is expected to use it. Requires a spec change.

**Invariants**:

- **I-SDM-1**: Every directory MUST have a non-empty `source` field (the SC-008 "no directory exists 'just in case'" contract).
- **I-SDM-2**: `empty-with-gitkeep` directories MUST contain a `.gitkeep` file and nothing else.
- **I-SDM-3**: `gitignored` directories MUST appear in `.gitignore` AND MUST NOT have a `.gitkeep`.
- **I-SDM-4**: Adding a new directory in a subsequent spec requires updating this entity's instance table below in the same change.

**v1 instances** (one row per directory). Per analyzer finding **D1**, the canonical enumeration with source citations lives at [spec.md FR-007](spec.md#functional-requirements); the table below mirrors it for entity-attribute mapping and MUST be kept in sync via a co-edit when FR-007 changes.

| `path` | `kind` | `source` | `firstConsumingSpec` |
|--------|--------|----------|---------------------|
| `core/upfront/` | empty-with-gitkeep | ADR-019 + [[Instruction Categories]] | (future instruction-content spec) |
| `core/on-demand/` | empty-with-gitkeep | ADR-019 | (future instruction-content spec) |
| `families/default/` | empty-with-gitkeep | ADR-019 Decision + AI Instructions Distribution Channel §Source Repo Shape + §Open Questions Q6 | (future template-family spec) |
| `templates/` | empty-with-gitkeep | AI Instructions Distribution Channel architecture diagram | (future renderer-templates spec) |
| `projects/` | empty-with-gitkeep | AI Instructions Distribution Channel §Per-Project Profile | (future project-profile spec) |
| `src/` | non-empty-at-scaffold (ships `cli.ts` + `cli.test.ts`) | BI-0092 step 9 | 001-init-project-scaffold (this spec) |
| `.github/workflows/` | non-empty-at-scaffold (ships `ci.yml`) | BI-0092 step 8 | 001-init-project-scaffold (this spec) |
| `.specify/templates/` | non-empty-at-scaffold (Spec Kit framework) | BI-0092 step 10 | 001-init-project-scaffold (this spec) |
| `.specify/memory/` | non-empty-at-scaffold (ships `constitution.md`) | BI-0092 step 10 | 001-init-project-scaffold (this spec) |
| `.specify/working/` | gitignored | BI-0092 step 7 | (never committed) |

## Cross-entity invariants

- **X-1** (Quality Gate × Scaffold Directory Map): `.github/workflows/ci.yml` (in `Scaffold Directory Map`) MUST reference each `Quality Gate` `ciStep` exactly once. Failure here means a CI gate exists for which no entity row was added, OR an entity row exists for which no CI step was added.
- **X-2** (Quality Gate × Governance Constitution): renaming or removing a Quality Gate MAY require a constitution amendment if §Development Workflow lists that gate explicitly (currently it lists lint / typecheck / build / test / coverage / sync-impact-report-update / constitution-compliance-checklist — items 1, 2, 3, 4, 5).
- **X-3** (Governance Constitution × Scaffold Directory Map): `.specify/memory/` MUST be `non-empty-at-scaffold` because it houses `constitution.md` (Entity 2).

## Open items

None. All spec-level Key Entities are formalised. Subsequent specs that introduce runtime data (profile YAML schema, render-output index, attribution registry) MUST add their entities to this document in the same change set.
