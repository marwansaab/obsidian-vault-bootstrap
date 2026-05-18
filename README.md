# @marwansaab/obsidian-vault-bootstrap

[![npm version](https://img.shields.io/npm/v/@marwansaab/obsidian-vault-bootstrap.svg)](https://www.npmjs.com/package/@marwansaab/obsidian-vault-bootstrap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Initialise a complete Obsidian vault — folder structure, templates, MOCs,
frontmatter conventions — and generate matching agent-instruction files for
Claude, Cursor, Cline, or any AI coding assistant. Q&A-driven, npm-versioned,
single source across your portfolio.

> [!NOTE]
> **Status — actively work in progress.** The tool surface, error contracts, and module layout still evolve from release to release. Pin a version if stability matters; expect breaking changes before `v1.0`.

> [!IMPORTANT]
> **Personal project.** Built and maintained for my own use. External support is not guaranteed — use at your own discretion. Issues and pull requests are welcome but may sit unattended.

## Purpose

Bootstrap an Obsidian vault and its companion agent-instruction files from a single source of truth, via Q&A.

Replaces hand-maintained runbooks with a renderer that produces:

- The standard vault folder structure — 3-digit-prefix convention; Meta / Process / Solution / Artifacts / External Knowledge categories.
- Templates, MOCs, sentinel files, and frontmatter conventions.
- Matching agent-instruction files for whichever AI coding assistant the project uses — Claude Code, Cursor, Cline, Windsurf, Continue, or any combination — via per-assistant template families.

Each consumer project commits the rendered output to its own Git repo. A small `claude.profile.yaml` per project pins the desired source-repo version. Rule clarifications at the source propagate via opt-in version-bump — no submodule, no plugin install, no machine-local state.

## Vision

Make starting a new Obsidian-vault-backed project — for use with any AI coding assistant — as simple as `npx @marwansaab/obsidian-vault-bootstrap init`.

The package treats vault content and agent instructions as a single shipped artefact, versioned and distributed via npm. A change at the source repo reaches every consumer via opt-in version-bump; a new project starts with the latest content at zero copy-paste cost. LLM-agnostic by design — support for a new assistant arrives as a new template family, not a code branch.

## Install

Not ready yet!

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

- [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman) — the caveman compression skill. Agent-facing files in this package use the discipline it codifies.
- [github/spec-kit](https://github.com/github/spec-kit) — governance framework. This project uses `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, and `/speckit-implement` for spec-driven development.
