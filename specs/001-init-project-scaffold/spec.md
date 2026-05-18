# Feature Specification: Initialise Project Scaffolding

**Feature Branch**: `001-init-project-scaffold`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "The empty project repository becomes a working, governed code package that a contributor can clone, install dependencies into, and immediately run the package's quality gates against — with a governance document codifying how subsequent work must be done."

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
- **Quality gate exits zero on partial failure**: A gate that crashes mid-run but still exits zero would silently pass the scaffold. Each gate must exit non-zero on any failure, including its own internal errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Repository MUST provide a single documented command that installs all declared dependencies on a fresh clone.
- **FR-002**: Repository MUST expose named, documented commands for each quality gate: lint, type-check, build, test, and coverage measurement.
- **FR-003**: Every quality gate MUST pass without warnings on a freshly-cloned repository on a supported runtime, with no local configuration changes.
- **FR-004**: Repository MUST declare a minimum supported runtime version in a discoverable location.
- **FR-005**: When invoked on a runtime version below the declared floor, the package MUST fail with an error message that explicitly names the runtime-floor requirement.
- **FR-006**: When a quality gate fails, its failure message MUST identify the affected file or component by name so the contributor can locate the problem without parsing the full log.
- **FR-007**: Repository MUST include every directory expected by planned subsequent feature work, each kept under version control (with a placeholder file when empty) so later specs are not blocked on "where does X live?".
- **FR-008**: Repository MUST include a governance constitution document at a stable, discoverable path that:
  - lists a named set of principles;
  - states each principle as a non-negotiable rule;
  - carries a stable version stamp that updates when rules change.
- **FR-009**: Repository MUST include a landing page (README) that covers, at minimum: a one-line description of what the package does, the install command, a quick-start invocation of the primary entry-point, and the current limitations / unsupported scenarios.
- **FR-010**: Repository MUST include a license file and any required third-party attributions.
- **FR-011**: Repository MUST include a placeholder entry-point invokable after install, exposing at least a help / version-style interface, with no end-user feature behavior in v1.
- **FR-012**: Repository MUST include a change-log (or equivalent) capturing the v0.1 baseline and naming the limitations from the **Out of Scope** items the maintainer intends to advertise.
- **FR-013**: Repository MUST include continuous-integration configuration that executes the same quality-gate sequence as the local commands and reports a clear, gate-named failure summary on any failure.
- **FR-014**: The local quality-gate sequence and the CI gate sequence MUST be derived from a single source of truth so they cannot drift out of agreement without an intentional edit.

### Key Entities *(include if feature involves data)*

- **Quality Gate**: A named, individually-invokable verification step (lint, type-check, build, test, coverage). Each has a documented command, a pass/fail contract (non-zero exit on any failure), and a failure-message contract (name the affected file or component).
- **Governance Constitution**: A versioned document of named, non-negotiable principles. Identified by a stable path, a version stamp, and a ratification date. Cited as the authority during reviews.
- **Scaffold Directory Map**: The set of directories the repository ships with on first commit, each justified by a planned subsequent spec. Kept stable across clean clones via placeholder files where directories would otherwise be empty.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor cloning the repository on a supported runtime can reach "all quality gates passing" within 5 minutes, executing only commands published on the landing page.
- **SC-002**: 100% of the declared quality gates pass on a freshly-cloned repository with zero local configuration changes.
- **SC-003**: 100% of quality-gate failures produced by a deliberately-broken file identify the affected file or component by name in their failure message.
- **SC-004**: A first-time visitor can answer "what does this package do?" within 60 seconds of opening the landing page, using only the landing page text.
- **SC-005**: 100% of the quality gates documented for local execution also execute in continuous integration on every push and pull request, with no gate present in one location and absent from the other.
- **SC-006**: A contributor on a runtime version below the declared floor sees an error message that names the runtime requirement on the first install or run attempt — not a downstream stack trace.
- **SC-007**: The governance constitution can be located by a new contributor within 30 seconds of opening the repository, and its current version stamp is visible without scrolling.
- **SC-008**: Every directory the repository ships in v1 has at least one named subsequent spec or planned use that justifies its presence; no directory exists "just in case".

## Assumptions

- **Single primary runtime / language** is sufficient for v1. The choice of runtime, build tool, lint tool, type-checker, and test runner is deferred to the planning phase (`/speckit-plan`); the spec deliberately names gates abstractly (lint, type-check, build, test, coverage) so plan selection does not invalidate the spec.
- **Single supported operating system** is sufficient for v1 (cross-platform CI matrix is explicitly out of scope per the user input). The supported OS is documented on the landing page.
- **The placeholder entry-point** exposes only help / version-style behavior in v1; no end-user feature behavior, no question-and-answer flow, no content-rendering pipeline, and no content-bearing fixtures (per **Out of Scope**).
- **The governance constitution** may build on the existing Spec Kit `.specify/memory/constitution.md` that is already present from the prior `[Spec Kit] Add project constitution` commit, provided it satisfies FR-008. A net-new file is acceptable if the existing one is unsuitable.
- **Coverage gate** measures and reports coverage; the precise threshold (if any) is a planning decision. The acceptance bar at spec level is "the gate exists, runs, and reports", not a numeric percentage.
- **The CI provider** is a single hosted CI provider on the same hosting platform as the repository; multi-provider CI is out of scope.
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
