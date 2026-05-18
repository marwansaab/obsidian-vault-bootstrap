# @marwansaab/obsidian-vault-bootstrap

Initialise a complete Obsidian vault — folder structure, templates, MOCs,
frontmatter conventions — and generate matching agent-instruction files for
Claude, Cursor, Cline, or any AI coding assistant. Q&A-driven, npm-versioned,
single source across your portfolio.

> **Governance.** Every change in this repository is measured against the
> project constitution:
> [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.0.0,
> ratified 2026-05-18). Principles I–VII are non-negotiable; reviewers cite
> them by Roman numeral when accepting or rejecting changes.

## Quickstart

```bash
git clone https://github.com/marwansaab/obsidian-vault-bootstrap.git
cd obsidian-vault-bootstrap
nvm use 22                  # or fnm / volta — Node >= 22.13.0 is required
npm ci                      # honours the lockfile and .npmrc engine-strict
npm run build
npx . --help
```

v0.1 ships a placeholder CLI only — `npx . --help` and `npx . --version` are
the entire end-user surface. See **Limitations (v0.1)** below for what does
not work yet.

## Quality gates

The same six gates run locally and in CI (single source of truth per FR-014).
Each gate exits non-zero on any failure and names the offending file in its
output (FR-006).

| Gate         | Command                 | Strictness bar                                 |
| ------------ | ----------------------- | ---------------------------------------------- |
| format-check | `npm run format:check`  | `prettier --check .` — zero divergence         |
| lint         | `npm run lint`          | `eslint . --max-warnings 0`                    |
| typecheck    | `npm run typecheck`     | `tsc --noEmit` — zero diagnostics, strict mode |
| build        | `npm run build`         | `tsc` — zero warning-severity emit             |
| test         | `npm test`              | `vitest run` — non-zero on any failure         |
| coverage     | `npm run test:coverage` | statements ≥ 80% (vitest threshold)            |

`npm run format` is the local fix-it command (writes prettier-formatted files
back); it is **not** a CI gate.

## Limitations (v0.1)

v0.1 is a scaffold. The following are deliberately deferred — each will land
with the spec that first consumes it. The full version history is in
[`CHANGELOG.md`](CHANGELOG.md).

- No content-rendering pipeline yet — `core/`, `families/`, `templates/`, and
  `projects/` ship empty (with `.gitkeep` placeholders) and will be populated
  by subsequent specs.
- No end-user subcommands beyond `--help` / `--version` — no `init`, no
  `bootstrap`, no profile-driven render.
- No interactive Q&A flow.
- No content-bearing fixtures (instruction-content files, template files,
  project-profile files arrive in later specs).
- Not published to the public npm registry.
- No Obsidian vault-folder initialisation pipeline.
- **Single supported OS in CI: `ubuntu-latest`.** The package itself is Node
  and runs anywhere Node does; the gate-verified OS in CI is Linux only.
  Windows and macOS contributors can use the package, but their environment
  is not covered by the CI matrix.
- No code-graph integration.

## Attributions

v0.1 ships no upstream-derived code; every source file in this commit carries
an `// Original — no upstream. <intent>.` header per constitution Principle
VII. This section exists as a stable insertion point — future modules
adapted from external projects will be listed here with their SPDX
identifier and pinned commit hash.
