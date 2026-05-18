<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
[specs/001-init-project-scaffold/plan.md](specs/001-init-project-scaffold/plan.md)

Companion artifacts from the same `/speckit-plan` run:

- [Spec](specs/001-init-project-scaffold/spec.md) (post-clarification)
- [Research / Phase 0 decisions](specs/001-init-project-scaffold/research.md)
- [Data model](specs/001-init-project-scaffold/data-model.md)
- [CLI contract](specs/001-init-project-scaffold/contracts/cli.md)
- [Quickstart / validation walkthrough](specs/001-init-project-scaffold/quickstart.md)

Governance: [.specify/memory/constitution.md](.specify/memory/constitution.md) — defer to it where this file or any plan disagrees.

<!-- SPECKIT END -->

## References

This project's design rationale is documented in three locations — one committed in this repo, two maintainer-local mirrors. Consult them **before** proposing or making design decisions, and cite the relevant principle / ADR / architecture page when justifying choices:

- **[.specify/memory/constitution.md](.specify/memory/constitution.md)** — Seven non-negotiable principles (I–VII) every change must satisfy. Each PR's Constitution Compliance checklist marks Y / N / N/A per principle; any `N` requires a Complexity Tracking entry in the plan. **Committed and authoritative in this repo.**
- **Architecture Decision Records (ADRs)** — recorded under `200-Decisions/` in the maintainer's Obsidian vault (The Setup) and locally mirrored under a `.decisions/` folder on the maintainer's machine. **`.decisions/` is `.gitignore`-d**, so cloners do not receive the ADR text via `git clone`; rationale that affects implementation work is summarised in the `## Rationale` sections of the relevant `specs/<spec>/plan.md` or in the constitution itself. Maintainer sessions reading from `C:\Github\obsidian-vault-bootstrap` see the local `.decisions/Decision Log.md` index + individual `ADR-NNN - <Title>.md` files; cloners do not.
- **High-level architecture notes** — recorded at `230-Vault Bootstrap/Obsidian Vault Bootstrap - Architecture.md` (ARCH-015) in the maintainer's Obsidian vault (The Setup) and locally mirrored under a `.architecture/` folder on the maintainer's machine. **`.architecture/` is `.gitignore`-d**, same treatment as `.decisions/`. Maintainer sessions reading from `C:\Github\obsidian-vault-bootstrap` see the local `.architecture/Obsidian Vault Bootstrap - Architecture.md` file; cloners do not. The architecture page captures the renderer's five-stage pipeline, the zod boundary seams between stages, canonical contracts (renderer input / output / failure mode), and a Resolution Index of architectural questions surfaced and resolved to date.

When a design choice conflicts with an existing ADR or contradicts the architecture page, surface the conflict rather than silently overriding it — superseding an ADR is a deliberate act that produces a new ADR, not undocumented drift; changing the architecture is a documented amendment to ARCH-015, not an implicit shift.
