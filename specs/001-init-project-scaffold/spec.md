# Feature Specification: Initialise Project Scaffolding

**Feature Branch**: `001-init-project-scaffold`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "The empty project repository becomes a working, governed code package that a contributor can clone, install dependencies into, and immediately run the package's quality gates against — with a governance document codifying how subsequent work must be done."

## Clarifications

### Session 2026-05-18

- Q: FR-007 directory tree scope — which directories MUST the v1 scaffold ship? → A: Top-level dir set per AI Instructions Distribution Channel §Source Repo Shape + BI-0092 coverage-matrix files. Empty-with-`.gitkeep`: `core/upfront/`, `core/on-demand/`, `families/default/`, `templates/`, `projects/`. Non-empty at scaffold: `src/`, `.github/workflows/`, `.specify/templates/`, `.specify/memory/`. `.specify/working/` gitignored (BI-0092 step 7) and not committed. Each dir traced to a named source: ADR-019, [[Instruction Categories]], AI Instructions Distribution Channel doc, BI-0092 task list. Top-level placement explicitly rejects `src/<pkg>/`-nested alternatives.
- Q: FR-003 "no warnings" — what is the per-gate enforcement bar? → A: Option B (warning-severity output from gate tools fails their gate) as base rule, with BI-0092 step-15 peer-dependency carve-out: undocumented peer-dep warnings fail; documented ones tolerated. Per-gate bars per BI-0092: lint = `eslint . --max-warnings 0` (step 4); type-check = `tsc --noEmit` zero-diagnostics at configured strict level; build = `tsc` zero-warning emit at strict level; test = `vitest` non-zero on test failure or runner-warning (unhandled-promise, deprecated-API); coverage = `vitest` fails when statement coverage drops below 80% (step 6); install = peer-dep warnings fail unless documented (step 15), transitive-dep deprecation noise + package-manager version banners tolerated. Rejects A (stderr-as-warning over-brittle), C (tracked-allowlist file heavier than BI requires), D (strips FR-003 teeth, contradicts BI-0092 step-15 literal "zero warnings").
- Q: FR-008 / SC-007 — what is the governance constitution's canonical location? → A: Option A — `.specify/memory/constitution.md` is canonical (reuses the Spec Kit convention and the existing file from commit `653b364`); the README adds a prominent governance link near the top to satisfy SC-007's 30-second discoverability. Single source of truth, no symlink portability risk. (Q3 on coverage-gate enforcement resolved early by Q2's answer — 80% statement floor per BI-0092 step 6.)
- Q: FR-011 — what is the placeholder entry-point invocation surface? → A: Option A — declare a Node `bin` in `package.json`, README quick-start command is `npx . --help` (idiomatic, single-token, no `dist/` path leak, works from a fresh clone pre-publish AND from `npx <package>` post-publish without README changes). Rejects B (script-name leaks into docs), C (duplicated invocation surface for no v1 benefit), D (leaks build-output path, requires build-first).
- Q: FR-013 / `.github/workflows/` — which OS does the v1 CI matrix target? → A: Option A — `ubuntu-latest` only. Honours the "single supported OS" assumption + the "cross-platform CI matrix out-of-scope" Out-of-Scope item verbatim; matches the standard Node CI default. LF/CRLF drift between the Windows dev environment and Linux CI is handled by a committed `.gitattributes` (declarative, runs at git-level on every platform) rather than by adding a windows-latest CI job. Rejects B (mild "single OS" violation for marginal extra coverage), C (atypical for Node, slower runners, Windows-specific lock-in), D (spec ships `.github/workflows/` already, needs an OS contract now).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer starts feature work on a working substrate (Priority: P1)

The project maintainer needs a fully-configured repository scaffold so that every subsequent feature spec can land against a substrate that already passes its own quality gates. On a freshly-cloned repository the maintainer runs install, then runs build, lint, type-check, and test — each completes successfully without warnings. The directory tree already contains every folder later specs will need (even when empty), and when a deliberately-broken line is introduced the affected gate fails with a message that names the broken file.

**Why this priority**: This is the foundational MVP. Without a substrate that builds and self-verifies, no other story can land — every later spec depends on it. Delivering only this story already produces a viable, working, governed package skeleton.

**Independent Test**: Clone the repository on a supported runtime, run the install command, then run the documented quality-gate sequence. The story is delivered when each gate passes on a clean tree and each gate fails informatively on a deliberately-broken tree.

**Acceptance Scenarios**:

1. **Given** a freshly-cloned repository, **When** the maintainer installs dependencies and runs the build, lint, type-check, and test commands in sequence, **Then** each command completes successfully and emits no warnings.
2. **Given** the scaffolded repository, **When** the maintainer inspects the directory tree, **Then** every directory expected by subsequent feature work exists (kept under version control with a placeholder if empty), so no later spec is blocked on "where does X live?".
3. **Given** the scaffolded repository, **When** the maintainer adds a deliberately-broken line to a source file and re-runs the local quality gates, **Then** the affected gate exits non-zero with a message that names the broken file.

---

### User Story 2 - Governance constitution exists and is authoritative (Priority: P2)

The project maintainer needs a governance document codifying the principles every later change is checked against, rather than relying on ad-hoc preference. The constitution lives alongside the code, names its principles, states each principle as a non-negotiable rule, and carries a stable version stamp so reviewers can cite specific principles when accepting or rejecting changes.

**Why this priority**: Without the constitution, every later review devolves into preference-by-preference negotiation. Landing it on day one means every subsequent spec, plan, and pull request can be measured against a named, versioned rulebook. It is orthogonal to the build substrate (Story 1) but equally load-bearing for collaboration — hence P2.

**Independent Test**: Open the governance document at its declared location. The story is delivered when the document lists named principles, each phrased as a non-negotiable rule, carries a version stamp, and a contributor can quote a specific principle when justifying acceptance or rejection of a proposed change.

**Acceptance Scenarios**:

1. **Given** the scaffolded repository, **When** the maintainer or a future contributor opens the governance document, **Then** it states a named set of principles, with each principle stated as a non-negotiable rule, and the document carries a stable version stamp.
2. **Given** a proposed change to the codebase, **When** the change is reviewed, **Then** the constitution can be cited by name for accepting or rejecting it.

---

### User Story 3 - New contributor experiences a green baseline (Priority: P3)

A new contributor cloning the repository for the first time should experience every defined quality gate passing on a fresh clone with zero local tweaks. If they happen to be on a runtime version below the declared floor, the failure message must clearly name the runtime-floor requirement instead of producing an opaque error. This story verifies the substrate from Story 1 from an outsider's perspective.

**Why this priority**: P1 verifies the maintainer can land feature work; P3 verifies the same substrate is reproducible for a stranger. It is essential for adoption but logically follows the maintainer-facing baseline — hence P3.

**Independent Test**: A contributor with no prior context clones the repository on a supported runtime, runs the install and quality-gate commands as documented on the landing page, and reaches a fully-green state without editing any local configuration. Repeat on an unsupported runtime and confirm the error message names the runtime-floor requirement.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository on a supported runtime version, **When** the contributor installs dependencies and runs the full quality-gate sequence, **Then** every gate passes without local configuration changes.
2. **Given** the same clone on a runtime version below the declared floor, **When** the contributor attempts to install or run the package, **Then** the failure message clearly names the runtime-floor requirement.

---

### User Story 4 - Landing page is self-explanatory (Priority: P3)

A visitor to the repository's landing page should be able to answer "what does this package do?" without reading source code, copy a single quick-start command to try the primary entry-point, and find a clearly-named list of current limitations so they can decide whether to adopt.

**Why this priority**: Adoption gate. Without a clear landing page, even a perfectly-scaffolded repository will not be picked up. It depends on Stories 1 and 2 being in place to have anything truthful to advertise, so it sits at P3.

**Independent Test**: Show the repository's landing page to a person with no prior context. The story is delivered when they can, within 60 seconds: state what the package does, copy and run the quick-start command, and find the limitations section.

**Acceptance Scenarios**:

1. **Given** a visitor to the repository's landing page, **When** they read the top-of-page description, **Then** they can answer "what does this package do?" without reading source code.
2. **Given** the same visitor, **When** they read the quick-start section, **Then** they can copy a single command and invoke the package's primary entry-point.
3. **Given** the same visitor, **When** they look for what is not yet supported, **Then** the landing page or change-log clearly names the current limitations.

---

### User Story 5 - CI is green on the first push (Priority: P3)

An automated continuous-integration run on the first push to the default branch should execute every quality gate that runs locally and report green. On a hypothetical broken pull request the failing gate must be named clearly enough that the contributor knows which gate to fix without reading the full log.

**Why this priority**: CI is the long-term enforcement layer for Stories 1 and 3. It is essential, but only meaningful once the local gates exist, and it can land last without blocking earlier stories — hence P3.

**Independent Test**: Push the initial commit on the default branch and observe CI run to green. Then push a branch with a deliberately-broken change and confirm the CI summary names the failing gate.

**Acceptance Scenarios**:

1. **Given** the initial commit pushed to the default branch, **When** continuous integration runs, **Then** every quality gate that runs locally also runs remotely and reports green.
2. **Given** a hypothetical broken change on a pull request, **When** continuous integration runs against it, **Then** the failing gate is named clearly enough that the contributor knows which gate to fix.

---

### Edge Cases

- **Stale dependency cache**: A contributor who pulls newer code without re-running install should either succeed (if deps unchanged) or receive a clearly-named "dependencies out of date" failure rather than a confusing downstream error.
- **Unsupported operating system**: v1 supports a single OS. A contributor on a different OS should see a documented limitation on the landing page, not a silent breakage mid-install.
- **Empty placeholder directories deleted by tooling**: Some tools prune empty directories. The scaffold must use a placeholder file (e.g., `.gitkeep`) so the expected tree survives clone-and-clean cycles.
- **Quality gate command renamed mid-development**: If a gate command is renamed, the landing page, CI configuration, and constitution must all agree. The CI gate sequence and the documented local sequence are the same list, referenced from one source where feasible.
- **Constitution edits without version stamp bump**: A change to the governance document that does not also update the version stamp should be flagged so reviewers can detect silent rule drift.
- **Quality gate exits zero on partial failure**: A gate that crashes mid-run but still exits zero would silently pass the scaffold. Each gate MUST exit non-zero on any failure, including its own internal errors. Verified by the Polish-phase gate-self-failure check (corrupt each gate's config file, confirm the gate exits non-zero with the config-file path named in the error message; per analyzer finding **U1**).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Repository MUST provide a single documented command that installs all declared dependencies on a fresh clone.
- **FR-002**: Repository MUST expose named, documented commands for each quality gate: **format-check, lint, type-check, build, test, and coverage measurement**. (Per analyzer finding **I1**, `format:check` is promoted from "formatter of record" guidance to an enforced gate so a contributor cannot ship code that diverges from prettier without a gate failure.)
- **FR-003**: Every quality gate MUST pass without warnings on a freshly-cloned repository on a supported runtime, with no local configuration changes. "Without warnings" is enforced per-gate as follows; the strict bar applies to the gate tools' own warning-severity output, while pure stderr noise from sources outside the gate tools (transitive-dep deprecation notices, package-manager version banners) is tolerated:
  - **format-check**: zero formatter-reported drift from the formatter tool itself; a contributor whose code is not prettier-formatted sees a non-zero exit naming the divergent files (per analyzer finding **I1**).
  - **lint**: zero warning-severity findings from the lint tool itself (per BI-0092 step 4).
  - **type-check**: zero diagnostics at the configured strict level.
  - **build**: zero warning-severity emit from the build tool at the configured strict level.
  - **test**: non-zero exit on any test failure AND on any runner warning output (e.g. unhandled-promise rejection, deprecated-API notice).
  - **coverage**: gate fails when the measured coverage drops below the declared floor (see Assumptions for the v1 floor).
  - **install**: peer-dependency warnings fail the install gate UNLESS the originating change description documents the warning and the reason for tolerating it (per BI-0092 step 15 carve-out). Pure transitive-dep deprecation noise and package-manager version banners are tolerated. Engine-version (Node) violations are made **hard errors**, not warnings, via a committed `.npmrc` with `engine-strict=true` (per analyzer finding **F1 (HIGH)** — required for FR-005 / SC-006 to hold).
- **FR-004**: Repository MUST declare a minimum supported runtime version in a discoverable location — specifically, the `engines.node` field of `package.json` (per analyzer finding **A2**, location inlined for spec-standalone readability).
- **FR-005**: When invoked on a runtime version below the declared floor, the package MUST **fail (non-zero exit, not a warning)** with an error message that explicitly names the runtime-floor requirement. The enforcement mechanism is a committed `.npmrc` at repo root containing `engine-strict=true`, which converts npm's default engines-violation warning into a hard error for both local `npm ci`/`npm install` and CI `npm ci` invocations (per analyzer finding **F1 (HIGH)**). Without `engine-strict=true`, `engines.node` is a soft warning that the contributor can ignore — the spec requirement would silently pass.
- **FR-006**: When a quality gate fails, its failure message MUST identify the affected file or component by name so the contributor can locate the problem without parsing the full log.
- **FR-007**: Repository MUST ship the following directory tree on first commit, each entry traceable to a named source (per SC-008). Empty directories carry a `.gitkeep` so they survive clone-and-clean cycles (per the **Empty placeholder directories deleted by tooling** edge case).

  Empty-with-`.gitkeep` (placeholder for planned subsequent specs):
  - `core/upfront/` — source: ADR-019 + [[Instruction Categories]].
  - `core/on-demand/` — source: ADR-019.
  - `families/default/` — source: ADR-019 Decision paragraph ("single default family covering all current projects; split later") + AI Instructions Distribution Channel §Source Repo Shape + §Open Questions Q6.
  - `templates/` — source: AI Instructions Distribution Channel architecture diagram.
  - `projects/` — source: AI Instructions Distribution Channel §Per-Project Profile.

  Non-empty at scaffold (already contain content as part of v1):
  - `src/` — source: BI-0092 step 9.
  - `.github/workflows/` — source: BI-0092 step 8.
  - `.specify/templates/` and `.specify/memory/` — source: BI-0092 step 10.

  Explicitly excluded from version control:
  - `.specify/working/` — gitignored per BI-0092 step 7; never committed.

  Content directories live at the top level, **not** nested under `src/<pkg>/`. `src/` contains the code package only; instructional, template, family, and project-profile content lives at the top level per the architecture in AI Instructions Distribution Channel §Source Repo Shape.
- **FR-008**: Repository MUST include a governance constitution document at the canonical path `.specify/memory/constitution.md` (the Spec Kit convention; reuses the file added in commit `653b364`). The document MUST:
  - list a named set of principles;
  - state each principle as a non-negotiable rule;
  - carry a stable version stamp that updates when rules change.

  The landing page (FR-009) MUST link to the constitution from a prominent location near the top of the README so a stranger can reach it without searching the directory tree (this is the operational realisation of SC-007).
- **FR-009**: Repository MUST include a landing page (README) that covers, at minimum: a one-line description of what the package does, the install command, a quick-start invocation of the primary entry-point, the current limitations / unsupported scenarios, and a **prominent (visible without scrolling on a standard 1080p viewport at the README's default render width)** governance link to `.specify/memory/constitution.md` placed near the top of the page (per FR-008; metric inlined per analyzer finding **A1**).
- **FR-010**: Repository MUST include a license file and any required third-party attributions.
- **FR-011**: Repository MUST include a placeholder entry-point invokable after install, exposing at least a help / version-style interface, with no end-user feature behavior in v1. The entry-point is wired as a Node `bin` declared in `package.json` (per Q4). The canonical invocation from a fresh clone is `npx . --help` (no build-output path leak, no script-name memorisation, identical surface pre- and post-publish).
- **FR-012**: Repository MUST include a `CHANGELOG.md` at repo root capturing the v0.1.0 baseline (per analyzer finding **U2**, "or equivalent" tightened to the named conventional file). The README's `## Limitations (v0.1)` section additionally serves the user-facing "what does not work yet?" question; the two artifacts have distinct audiences (CHANGELOG = future archaeology; README §Limitations = current-state visitor info) and both ship in v1.
- **FR-013**: Repository MUST include continuous-integration configuration that executes the same quality-gate sequence as the local commands and reports a clear, gate-named failure summary on any failure. The v1 CI matrix targets `ubuntu-latest` only on GitHub Actions (per Q5; matches the "single supported OS" assumption and the "cross-platform CI matrix" Out-of-Scope item).
- **FR-014**: The local quality-gate sequence and the CI gate sequence MUST be derived from a single source of truth so they cannot drift out of agreement without an intentional edit.

### Key Entities *(include if feature involves data)*

- **Quality Gate**: A named, individually-invokable verification step (lint, type-check, build, test, coverage). Each has a documented command, a pass/fail contract (non-zero exit on any failure), and a failure-message contract (name the affected file or component).
- **Governance Constitution**: A versioned document of named, non-negotiable principles. Identified by a stable path, a version stamp, and a ratification date. Cited as the authority during reviews.
- **Scaffold Directory Map**: The concrete set of directories enumerated in FR-007 that the repository ships on first commit, each traceable to a named source (ADR-019, [[Instruction Categories]], AI Instructions Distribution Channel doc, or BI-0092). Top-level placement is part of the contract — content directories are siblings of `src/`, not nested under it. Kept stable across clean clones via `.gitkeep` files where directories would otherwise be empty.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor cloning the repository on a supported runtime can reach "all quality gates passing" within 5 minutes, executing only commands published on the landing page.
- **SC-002**: 100% of the declared quality gates pass on a freshly-cloned repository with zero local configuration changes.
- **SC-003**: 100% of quality-gate failures produced by a deliberately-broken file identify the affected file or component by name in their failure message.
- **SC-004**: A first-time visitor can answer "what does this package do?" within 60 seconds of opening the landing page, using only the landing page text.
- **SC-005**: 100% of the quality gates documented for local execution also execute in continuous integration on every push and pull request, with no gate present in one location and absent from the other.
- **SC-006**: A contributor on a runtime version below the declared floor sees an error message that names the runtime requirement on the first install or run attempt — not a downstream stack trace.
- **SC-007**: The governance constitution can be located by a new contributor within 30 seconds of opening the repository — specifically, via a prominent link near the top of the README that points to `.specify/memory/constitution.md`. The constitution's current version stamp is visible without scrolling once the file is open.
- **SC-008**: Every directory the repository ships in v1 has at least one named subsequent spec or planned use that justifies its presence; no directory exists "just in case".

## Assumptions

- **Single primary runtime / language**: per BI-0092 the v1 commitment is **TypeScript on Node** with `eslint` for lint, `tsc` for type-check and build, and `vitest` for test and coverage. The plan (`/speckit-plan`) formalises Node minimum version, package-manager choice, exact configuration files, and exact invocation. The spec's gate names (lint, type-check, build, test, coverage) remain the canonical contract; the named tools are how that contract is honoured in v1.
- **Single supported operating system in CI**: `ubuntu-latest` on GitHub Actions (per Q5). The package itself is Node and runs anywhere Node does; the **supported-in-CI** OS is what the v1 contract covers. The landing page documents this clearly so a Windows or macOS contributor knows their environment is not gate-verified.
- **Line-ending discipline**: a committed `.gitattributes` enforces LF in the repository (declarative, cross-platform). This compensates for the Windows-dev / Linux-CI split surfaced by Q5 without requiring a Windows runner in the CI matrix.
- **The placeholder entry-point** is wired as a Node `bin` declared in `package.json` and invoked `npx . --help` from a fresh clone (per Q4). It exposes only help / version-style behavior in v1 — no end-user feature behavior, no question-and-answer flow, no content-rendering pipeline, and no content-bearing fixtures (per **Out of Scope**).
- **The governance constitution** is the existing Spec Kit `.specify/memory/constitution.md` from commit `653b364` (per Q3). It is the canonical and single source of truth — no top-level alias, no symlink, no duplicated copy. The README links to it (per FR-009) to satisfy SC-007's discoverability bar. Any future change to the constitution updates that file in place and bumps its version stamp.
- **Coverage gate** measures **statement coverage** with `vitest` and fails when statement coverage drops below **80%** (per BI-0092 step 6). Branch / function / line thresholds, per-file granularity, and any coverage-collection configuration are planning decisions.
- **The CI provider** is GitHub Actions (implicit in BI-0092 step 8's `.github/workflows/` and pinned by Q5); multi-provider CI is out of scope.
- **Contributors** have Git installed, a working network connection capable of fetching declared dependencies, and a runtime at or above the declared floor.
- **Vault-folder initialisation** (the eventual Obsidian-vault side of this package) is explicitly deferred; the v1 scaffold only prepares the agent-instruction-generation side.
- **Code-graph integration** is deferred until codebase size justifies the maintenance cost, per **Out of Scope**.

## Out of Scope

- Feature implementation (content-rendering pipeline, end-user subcommands beyond a placeholder help / version entry-point, question-and-answer flow, content-bearing fixtures).
- Initial content (instruction-content files, template files, project-profile files arrive in subsequent specs).
- Public package-registry publication.
- Obsidian vault-folder initialisation.
- Cross-platform CI matrix.
- Code-graph integration.
