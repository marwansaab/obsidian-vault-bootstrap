---

description: "Dependency-ordered tasks for spec 001 — Initialise Project Scaffolding"
---

# Tasks: Initialise Project Scaffolding

**Input**: Design documents from [specs/001-init-project-scaffold/](.)

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/cli.md](contracts/cli.md), [quickstart.md](quickstart.md), [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.0.0

**Tests**: REQUIRED. The constitution §Development Workflow item 4 mandates "every CLI command, every renderer entrypoint, and every Q&A flow ships with happy-path AND failure-or-boundary tests in the same change". [contracts/cli.md §Test obligations](contracts/cli.md#test-obligations) defines four required test cases.

**Organization**: Tasks grouped by user story. User stories within the P3 tier are ordered by **soft dependency** (US4 README must exist for US3 to "follow the documented sequence"), so the phase order is US1 → US2 → US4 → US3 → US5 rather than the spec's source order. User-story IDs themselves are preserved from [spec.md](spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelisable (different files, no incomplete-task dependency)
- **[Story]**: which user story the task belongs to (US1, US2, US3, US4, US5)
- Setup, Foundational, and Polish tasks carry no story label

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository skeleton — directories, root-metadata files, dependency tree. All tasks here are prerequisites for the Foundational phase and for every user story.

- [ ] T001 [P] Create the FR-007 directory tree at repo root: `core/upfront/.gitkeep`, `core/on-demand/.gitkeep`, `families/default/.gitkeep`, `templates/.gitkeep`, `projects/.gitkeep`. Each `.gitkeep` is an empty file. (Realises FR-007's empty-with-`.gitkeep` instances; satisfies SC-008's traceability via the rationales already in spec.md FR-007.)
- [ ] T002 [P] Create `.gitignore` at repo root excluding: `node_modules/`, `dist/`, `coverage/`, `.specify/working/`, and standard editor artefacts (`.DS_Store`, `*.swp`, `.vscode/settings.json` if not project-committed). The `.specify/working/` entry realises FR-007's "Explicitly excluded from version control" line.
- [ ] T003 [P] Create `.gitattributes` at repo root per [research R8](research.md#r8--gitattributes-line-ending-policy): `* text=auto eol=lf` + binary type tags for `*.png`, `*.jpg`, `*.gif`, `*.ico`. Realises the **Line-ending discipline** Assumption and closes the Windows-dev / Linux-CI LF/CRLF drift surfaced in spec Q5.
- [ ] T004 Create `package.json` at repo root with the v0.1.0 shape per [research R9](research.md#r9--npm-bin-wiring--npx---help-contract): `name: "@marwansaab/obsidian-vault-bootstrap"`, `version: "0.1.0"`, `type: "module"`, `engines.node: ">=22.11.0"` (realises SC-006), `bin: { "obsidian-vault-bootstrap": "./dist/cli.js" }` (realises FR-011 / Q4), `files: ["dist", "README.md", "LICENSE", "CONTRIBUTING.md"]`. Scripts and devDependencies are added in T009 / T005 respectively.
- [ ] T005 Add the v1 devDependencies block to `package.json` and run `npm install` to generate `package-lock.json`. Devs per [research R11](research.md#r11--constitution-mandated-dependencies-not-added-in-v1): `typescript@^5.6`, `@types/node` (Node 22 line), `eslint@^9`, `@eslint/js@^9`, `typescript-eslint@^8`, `prettier@^3`, `eslint-config-prettier@^9`, `vitest@^2`, `@vitest/coverage-v8@^2`. No runtime `dependencies` in v1 (constitution dependency-justification rule rejects unused deps; see research R11).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Toolchain configuration — tsconfig, eslint, vitest, and the `npm run` scripts that wire FR-014's single-source-of-truth. Every user story below depends on these being in place.

**⚠️ CRITICAL**: No user-story work begins until this phase completes.

- [ ] T006 [P] Create `tsconfig.json` at repo root per [research R4](research.md#r4--tsconfigjson-shape): `target: "ES2024"`, `module: "NodeNext"`, `moduleResolution: "NodeNext"`, `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `noFallthroughCasesInSwitch: true`, `verbatimModuleSyntax: true`, `esModuleInterop: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`, `outDir: "dist"`, `rootDir: "src"`, `declaration: true`, `declarationMap: true`, `sourceMap: true`. `include: ["src/**/*.ts"]`, `exclude: ["**/*.test.ts", "dist", "node_modules"]`.
- [ ] T007 [P] Create `eslint.config.mjs` at repo root per [research R5](research.md#r5--eslint-flat-config-shape): flat config composing `@eslint/js` recommended + `typescript-eslint` `recommendedTypeChecked` + `eslint-config-prettier`, with `parserOptions.project: "./tsconfig.json"` so type-aware rules work. Carry an `// Original — no upstream. Project lint configuration.` header per Principle VII.
- [ ] T008 [P] Create `vitest.config.ts` at repo root per [research R6](research.md#r6--vitestconfigts-shape-incl-coverage): `include: ["src/**/*.test.ts"]`, coverage `provider: "v8"`, `reporter: ["text", "html", "lcov"]`, `include: ["src/**/*.ts"]`, `exclude: ["src/**/*.test.ts"]`, `thresholds: { statements: 80 }`. Carry an `// Original — no upstream. Vitest configuration.` header per Principle VII.
- [ ] T009 Add the FR-002 / FR-014 `scripts` block to `package.json` (single source of truth — exact names invoked locally AND in CI): `"lint": "eslint . --max-warnings 0"`, `"typecheck": "tsc --noEmit"`, `"build": "tsc"`, `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"`, `"prepare": "npm run build"` (so `npx . --help` works after `npm install` without a manual build step). Modifies `package.json` — sequential with T004 and T005.

**Checkpoint**: foundation ready. From this point on, US1 / US2 / US4 / US3 / US5 are unblocked.

---

## Phase 3: User Story 1 — Maintainer working substrate (Priority: P1) 🎯 MVP

**Goal**: A maintainer cloning the repo can run `npm ci && npm run lint && npm run typecheck && npm run build && npm test` and have every gate pass cleanly on the fresh tree. Failure messages name the affected file/component (FR-006).

**Independent Test**: From a clean tree (no `node_modules`, no `dist`, no `coverage`), execute the gate sequence above. Story is delivered when every gate exits 0 AND a deliberate type error introduced into `src/cli.ts` causes `npm run typecheck` to exit non-zero with `src/cli.ts` named in the failure message.

### Tests for User Story 1

> Constitution-mandated; written alongside the implementation per the constitution §Development Workflow.

- [ ] T010 [P] [US1] Create `src/cli.test.ts` covering the four [contracts/cli.md §Test obligations](contracts/cli.md#test-obligations) cases: (a) `--help` exits 0, stdout non-empty, contains `--help`; (b) `--version` exits 0, stdout exactly matches `package.json` `version`; (c) unknown flag exits non-zero, stderr names the flag, stderr mentions `help`; (d) no-args behaves identically to `--help`. Header: `// Original — no upstream. Tests for the v1 placeholder CLI.`.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create `src/cli.ts` per [research R12](research.md#r12--placeholder-cli-behaviour) and [contracts/cli.md](contracts/cli.md): shebang `#!/usr/bin/env node`, parse `--help` / `--version` via `node:util` `parseArgs` (constitution-mandated CLI parser), print fixed help/version text, exit 0; on unknown flag, catch the `parseArgs` `TypeError`, write the flag name and a `Use --help` hint to `process.stderr`, exit 1. Header: `// Original — no upstream. Placeholder CLI entry-point for the v1 scaffold.`.
- [ ] T012 [US1] Run the full local quality-gate sequence on a clean tree and confirm every gate passes: `rm -rf node_modules dist coverage && npm ci && npm run lint && npm run typecheck && npm run build && npm run test:coverage`. Each `npm run <gate>` must exit 0 (validates [Story 1 AS1](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1) + [SC-002](spec.md#measurable-outcomes)). Coverage report must show statements ≥ 80% (validates the FR-003 coverage sub-bullet).
- [ ] T013 [US1] Verify the FR-007 directory tree is intact post-`npm ci` (the `.gitkeep` placeholders survive the install): run `ls core/upfront core/on-demand families/default templates projects` and confirm `.gitkeep` is present in each (validates [Story 1 AS2](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1) + [SC-008](spec.md#measurable-outcomes)).
- [ ] T014 [US1] Demonstrate the failure-naming contract: temporarily introduce `const x: number = "broken";` into `src/cli.ts`, run `npm run typecheck`, confirm the failure message contains the literal string `src/cli.ts`, then revert. Repeat for `npm run lint` with an unused variable, and for `npm test` with a flipped assertion (validates [Story 1 AS3](spec.md#user-story-1---maintainer-starts-feature-work-on-a-working-substrate-priority-p1) + [SC-003](spec.md#measurable-outcomes) + [FR-006](spec.md#functional-requirements)).

**Checkpoint**: US1 is fully functional. The package is a working, governed substrate even if every later story is deferred. **This is the MVP boundary.**

---

## Phase 4: User Story 2 — Constitution authoritative (Priority: P2) [US2]

**Goal**: The governance constitution exists at the canonical path with a stable shape; reviewers can cite it by principle number.

**Independent Test**: Open `.specify/memory/constitution.md`; confirm Principles I–VII are stated as non-negotiable rules, the `**Version**:` line is visible without scrolling, and the Sync Impact Report comment block is current.

### Implementation for User Story 2

- [ ] T015 [US2] Verify `.specify/memory/constitution.md` (present since commit `653b364`) matches the [data-model.md §Entity 2](data-model.md#entity-2--governance-constitution) contract: lists Principles I–VII, each phrased as a non-negotiable rule, carries `**Version**: 1.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-18`, and the Sync Impact Report comment block at the top reflects `TEMPLATE → 1.0.0`. No edits expected — this task confirms the existing file satisfies [FR-008](spec.md#functional-requirements) + [Story 2 AS1/AS2](spec.md#user-story-2---governance-constitution-exists-and-is-authoritative-priority-p2). If a drift is found, file the fix as a constitution-amendment PR (NOT bundled with feature work, per constitution §Governance).

**Checkpoint**: US2 verified. The constitution is the citable governance authority for the rest of the work in this spec and beyond.

---

## Phase 5: User Story 4 — Landing page self-explanatory (Priority: P3) [US4]

> **Ordering note**: US4 ships **before US3** within the P3 tier because US3's Independent Test ("uses the install and quality-gate commands as documented on the landing page") requires the README to exist.

**Goal**: A visitor opening the repo can answer "what does this package do?", copy a single quickstart command, and find the limitations list — within 60 seconds, without reading source code.

**Independent Test**: Show README to a person with no prior context. Within 60 seconds they: (a) state the package's purpose; (b) locate and copy the quickstart command; (c) find the limitations section. Verify the prominent governance link points to `.specify/memory/constitution.md`.

### Implementation for User Story 4

- [ ] T016 [US4] Author `README.md` at repo root per [research R10](research.md#r10--readme-structure) with the following sections in order: (1) `# @marwansaab/obsidian-vault-bootstrap` H1; (2) one-paragraph description answering "what does this package do?" (realises [SC-004](spec.md#measurable-outcomes)); (3) **Governance** callout near the top with a prominent link to [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (realises [FR-008 last paragraph](spec.md#functional-requirements) + [SC-007](spec.md#measurable-outcomes)); (4) `## Quickstart` containing `git clone ...` + `nvm use 22` + `npm install` + `npm run build` + `npx . --help` (realises [FR-009](spec.md#functional-requirements) quickstart); (5) `## Quality gates` listing lint / typecheck / build / test / coverage with their `npm run` commands (realises [FR-002](spec.md#functional-requirements) documentation); (6) `## Limitations (v0.1)` mirroring the spec's Out-of-Scope items, including "single supported OS in CI: ubuntu-latest" so Windows/macOS contributors know their environment is not gate-verified (realises [FR-009](spec.md#functional-requirements) + [FR-012](spec.md#functional-requirements) "change-log or equivalent"); (7) empty `## Attributions` section as a stable insertion point for future upstream attributions (realises Principle VII).
- [ ] T017 [US4] Verify the README minimum-content gate by opening the file in a fresh viewport and confirming the description, the governance link, and the quickstart command are all visible without scrolling (validates [Story 4 AS1/AS2/AS3](spec.md#user-story-4---landing-page-is-self-explanatory-priority-p3) + [SC-004](spec.md#measurable-outcomes) + [SC-007](spec.md#measurable-outcomes)).

**Checkpoint**: US4 delivered. US3 can now use the README as its acceptance source.

---

## Phase 6: User Story 3 — New contributor green baseline (Priority: P3) [US3]

**Goal**: A stranger cloning the repo on a supported Node version reaches a fully-green state by following the README's quickstart without editing any local configuration. On an unsupported Node version they get an actionable error.

**Independent Test**: From an unrelated directory, `git clone <repo> && cd <repo> && <follow README quickstart>` reaches all gates green with no local edits. On a Node version below 22.11.0, the first `npm ci` exits with a message naming `>=22.11.0`.

### Implementation for User Story 3

- [ ] T018 [US3] Simulate a fresh-clone walkthrough following [quickstart.md](quickstart.md) step-by-step from a clean tree (no cached `node_modules`, no `dist`, no `coverage`). Use only commands published in `README.md` `## Quickstart`. Confirm all five gates green and `npx . --help` exits 0 with non-empty stdout (validates [Story 3 AS1](spec.md#user-story-3---new-contributor-experiences-a-green-baseline-priority-p3) + [SC-001](spec.md#measurable-outcomes) + [SC-002](spec.md#measurable-outcomes)).
- [ ] T019 [US3] Verify the runtime-floor failure path. Either: (a) run `npm ci` on a Node `< 22.11.0` machine and confirm the error message names `>=22.11.0`; OR (b) temporarily set `engine-strict=true` in a local `.npmrc` and run `npm ci` with `nvm` switched to an older Node line and confirm the same error. Revert the `.npmrc` change. Validates [Story 3 AS2](spec.md#user-story-3---new-contributor-experiences-a-green-baseline-priority-p3) + [SC-006](spec.md#measurable-outcomes) + [FR-005](spec.md#functional-requirements).

**Checkpoint**: US3 verified. The substrate is reproducible from a stranger's perspective.

---

## Phase 7: User Story 5 — CI green on first push (Priority: P3) [US5]

**Goal**: GitHub Actions runs the same `npm run` gate sequence as a contributor's local sequence (FR-014 single-source-of-truth) on `ubuntu-latest` only (per Q5), and reports green on a clean push. Failing gates are named clearly enough that a contributor can diagnose without reading the full log.

**Independent Test**: Push the branch; GitHub Actions reports green on every gate step. Push a deliberately-broken change to a feature branch; the workflow summary names the failing step.

### Implementation for User Story 5

- [ ] T020 [US5] Create `.github/workflows/ci.yml` per [research R7](research.md#r7--github-actions-workflow-shape): `name: ci`, `on: [push, pull_request]`, single `ci` job on `runs-on: ubuntu-latest`, steps: `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: "22.11"` + `cache: npm`, then `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:coverage`. The step names match the local `npm run` script names exactly so FR-014 holds. Header comment: `# Original — no upstream. v1 CI workflow. ANY new local quality gate MUST be added to package.json scripts first, then mirrored here (FR-014).`.
- [ ] T021 [US5] Push the branch to GitHub and confirm GitHub Actions reports green on every step in the `ci` job (validates [Story 5 AS1](spec.md#user-story-5---ci-is-green-on-the-first-push-priority-p3) + [SC-005](spec.md#measurable-outcomes)). **Requires the user to push** — this task is the manual hand-off after T020 lands locally.
- [ ] T022 [US5] Validate the CI failure-naming contract: on a throwaway feature branch, introduce a lint violation (`const unused = 1;` in `src/cli.ts`), push, confirm the GitHub Actions workflow summary names the failing step (`Run npm run lint`) and the failing file (`src/cli.ts`) is visible in the step log. Delete the throwaway branch (validates [Story 5 AS2](spec.md#user-story-5---ci-is-green-on-the-first-push-priority-p3) + [FR-006](spec.md#functional-requirements) at the CI surface). **Requires the user to push to a throwaway branch.**

**Checkpoint**: US5 delivered. The same gate sequence enforces locally AND remotely.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify cross-story invariants and finalise documentation. These tasks check the cross-entity invariants from [data-model.md §Cross-entity invariants](data-model.md#cross-entity-invariants) and the final integration via [quickstart.md](quickstart.md).

- [ ] T023 [P] Verify Principle VII (Attribution & Layered Composition Transparency) on every `.ts` file added in v1: `src/cli.ts` and `src/cli.test.ts` both carry an `// Original — no upstream. <intent>.` header. `eslint.config.mjs` and `vitest.config.ts` carry the same. Confirm `README.md` `## Attributions` section exists even if empty. Any file without a header is a Principle VII violation.
- [ ] T024 [P] Verify the FR-014 single-source-of-truth invariant: the set of `npm run` script names in `package.json` matches the set of `npm run` invocations in `.github/workflows/ci.yml`, with no script present in one location and absent from the other (realises [data-model.md cross-entity invariant X-1](data-model.md#cross-entity-invariants) and [SC-005](spec.md#measurable-outcomes)).
- [ ] T025 Final integration check: walk through [quickstart.md](quickstart.md) end-to-end on a fresh clone and confirm every documented expected output (exit codes, stdout shape, coverage percentage, failure-message naming) matches actual. Any mismatch is a quickstart bug to fix before declaring the spec done.
- [ ] T026 [P] Update [checklists/requirements.md](checklists/requirements.md) "Validation Notes" to record that all v1 acceptance scenarios pass (USs 1–5, SCs 1–8). Date-stamp the entry.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1.
- **Phase 3 (US1, P1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 1 only (no toolchain needed — verification of an existing file). Could in principle run in parallel with Phase 2 / Phase 3, but the sequential order shown here keeps the MVP path uncluttered.
- **Phase 5 (US4)**: depends on Phase 4 (US2 must be verified so the governance link points at a confirmed file) AND Phase 3 (US1 must work for the README to advertise truthfully).
- **Phase 6 (US3)**: depends on Phase 5 (US3's test walks the README quickstart).
- **Phase 7 (US5)**: depends on Phase 2's `npm run` scripts existing (T009). Could ship in parallel with Phase 5 / Phase 6 if the team is split.
- **Phase 8 (Polish)**: depends on all desired user stories being complete.

### Within-story task dependencies

- **US1**: T010 (test) and T011 (implementation) are [P] — different files. T012 / T013 / T014 depend on both existing.
- **US2**: T015 is purely verification, depends on nothing in this spec; can run any time after Phase 1.
- **US4**: T016 then T017 (T017 depends on T016 having authored the file).
- **US3**: T018 then T019 (sequential — different aspects of the same fresh-clone walkthrough).
- **US5**: T020 then T021 then T022 (sequential — push depends on workflow file existing; broken-branch verification depends on baseline green).

### Parallel opportunities

- **Phase 1**: T001, T002, T003 can run in parallel (different files). T004 must precede T005 (lockfile generation reads `package.json`).
- **Phase 2**: T006, T007, T008 can run in parallel (different files). T009 must come after T004 (edits `package.json`).
- **Phase 3 (US1)**: T010, T011 can run in parallel. T012, T013, T014 sequence after both.
- **Phase 8**: T023, T024, T026 can run in parallel. T025 should run last (final integration check).

---

## Parallel Example: Phase 1 Setup

```bash
# Launch the three independent root-metadata creations together:
Task: T001 — Create the FR-007 directory tree with .gitkeep placeholders
Task: T002 — Create .gitignore
Task: T003 — Create .gitattributes

# Then sequential:
Task: T004 — Create package.json
Task: T005 — Add devDeps + npm install
```

## Parallel Example: Phase 2 Foundational

```bash
# Once T009 is ready to be touched, run the three config-file creations in parallel:
Task: T006 — Create tsconfig.json
Task: T007 — Create eslint.config.mjs
Task: T008 — Create vitest.config.ts

# Sequential edit on package.json:
Task: T009 — Add scripts block to package.json
```

## Parallel Example: User Story 1

```bash
# Test and implementation file are independent — different files, no shared state:
Task: T010 — Create src/cli.test.ts
Task: T011 — Create src/cli.ts

# Then sequential validations:
Task: T012 — Run full gate sequence on clean tree
Task: T013 — Verify FR-007 directory tree intact
Task: T014 — Demonstrate failure-naming contract by deliberate breakage
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup) — 5 tasks, mostly parallelisable.
2. Phase 2 (Foundational) — 4 tasks, three parallelisable.
3. Phase 3 (US1) — 5 tasks, two parallelisable.
4. **STOP and VALIDATE**: re-run T012 from a truly clean tree (`git clean -xdf` then `npm ci`). The package is now a working, governed scaffold even with no other story shipped.

### Incremental delivery

1. Setup + Foundational → toolchain in place.
2. US1 → MVP scaffold ships.
3. US2 → governance verified (trivial — the file is already there).
4. US4 → landing page lets others find the work.
5. US3 → stranger-perspective verification of US1.
6. US5 → CI enforcement of US1's gates.
7. Polish → cross-story invariants verified.

### Parallel team strategy

If two developers are available after Phase 2:

- Developer A: Phase 3 (US1) → Phase 7 (US5) — the gate-and-CI thread.
- Developer B: Phase 4 (US2) → Phase 5 (US4) → Phase 6 (US3) — the documentation-and-discoverability thread.

The two threads only re-converge at Phase 8 (Polish).

---

## Notes

- **Tests are constitution-required**: every code-changing task ships its test alongside (the constitution §Development Workflow item 4 explicitly demands this; the optionality language in `.specify/templates/tasks-template.md` is overridden here).
- **Commit cadence**: per [CONTRIBUTING.md](../../CONTRIBUTING.md), `feat(specs/001): T0NN — <description>` for implementation tasks, `chore(specs/001): T0NN — <description>` for verification-only tasks. Bodies are mandatory for `feat` commits and the Q&A round 1 lineage should be cited where relevant.
- **`.gitignore` and `.gitattributes` are root files** — neither lives under `src/`. Setting them as Phase 1 tasks (not Foundational) is intentional: they are repo metadata, not toolchain configuration.
- **Avoiding scope creep**: do NOT add `zod`, `handlebars`, `js-yaml`, `glob`, or `@inquirer/prompts` to `package.json` in this spec. They are explicitly deferred by [research R11](research.md#r11--constitution-mandated-dependencies-not-added-in-v1).
- **Follow-ups deferred to spec 002+**: Windows-CI matrix, Handlebars-with-discipline ADR, branch-coverage constitution amendment, and yaml-(eemeli)-swap are all tracked in memory but NOT executed in spec 001. See `memory/project_followups_post_constitution_v1.md`.
- **Push tasks** (T021, T022) require the user — they cannot be executed locally. Surface them as hand-off points when the rest of the phase lands.
