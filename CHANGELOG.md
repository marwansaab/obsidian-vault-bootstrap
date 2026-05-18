# Changelog

All notable changes to `@marwansaab/obsidian-vault-bootstrap` are documented
here. The format follows [Keep a Changelog](https://keepachangelog.com/) and
this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-05-18

Initial scaffold. See `README.md` §Limitations for the full v0.1 scope
boundaries. v0.1 is a working, governed substrate — six green quality gates
on a fresh clone and in CI — with no end-user feature behaviour beyond a
placeholder `--help` / `--version` entry-point.

The following are explicitly out of scope for v0.1 and will land with their
first consuming spec:

- Content-rendering pipeline (templates, profile-driven render).
- Instruction-content files, template-family files, project-profile files.
- End-user subcommands beyond `--help` / `--version` (no `init`, no
  `bootstrap`).
- Interactive Q&A flow.
- Public npm registry publication.
- Obsidian vault-folder initialisation pipeline.
- Cross-platform CI matrix (v0.1 covers `ubuntu-latest` only).
- Code-graph integration.

### Added

- Top-level directory scaffold per FR-007: `core/upfront/`, `core/on-demand/`,
  `families/default/`, `templates/`, `projects/` (all `.gitkeep`-placeheld);
  `src/` with the placeholder CLI; `.github/workflows/` with the CI workflow.
- Six quality gates wired identically locally and in CI: format-check, lint,
  typecheck, build, test, coverage (statements ≥ 80%).
- Hard runtime-floor enforcement via committed `.npmrc engine-strict=true`
  paired with `engines.node: ">=22.13.0"` (transitive dep
  `eslint-visitor-keys@5` requires `^20.19.0 || ^22.13.0 || >=24`, which
  pushes our effective floor above the constitution's 22.11 minimum;
  constitution-compliant since the constitution sets a floor not a ceiling).
- LF line-ending discipline via committed `.gitattributes`.
- Constitution v1.0.0 at `.specify/memory/constitution.md` (Principles I–VII,
  non-negotiable) — ratified 2026-05-18.
- Spec 001 design artifacts under `specs/001-init-project-scaffold/`.
