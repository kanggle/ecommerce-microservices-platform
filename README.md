# Platform Project

Monorepo platform project for multi-service application development.

This repository is designed for spec-driven, task-driven, and AI-assisted development.

---

## Principles

- `PROJECT.md` declares the project's domain and trait classification (see taxonomy-based rule system below)
- `specs/` are the official source of truth
- work is executed through `tasks/`
- only tasks in `tasks/ready/` may be implemented
- `CLAUDE.md` defines minimum operating rules
- service internal structure is not globally fixed
- each service architecture is declared in `specs/services/<service>/architecture.md`

---

## Document Roles

### `PROJECT.md`
Declares the project's classification — `domain` (one) and `traits` (multiple) — which selects the applicable rule layers under `specs/rules/`. Every new project must update this file first.

### `CLAUDE.md`
Defines the minimum rules for how AI agents and developers must operate. Its "Project Classification (Read First)" section drives the rule-layer resolution.

### `specs/`
Official project rules, contracts, service definitions, feature definitions, and cross-service flows.
- `specs/platform/` — technology-level common rules (architecture, coding, naming, security, testing, observability, etc.) shared across all projects
- `specs/rules/` — taxonomy-based conditional rules (`common.md` index, `domains/<domain>.md`, `traits/<trait>.md`) activated by `PROJECT.md`
- `specs/contracts/` — HTTP and event contracts
- `specs/services/` — per-service architecture, overview, and boundaries
- `specs/features/`, `specs/use-cases/` — feature-level and use-case specs

### `.claude/skills/`
Implementation guidance, working patterns, and checklists.

### `knowledge/`
Reference material for design judgment, trade-offs, and best practices.

### `tasks/`
Executable work units managed by lifecycle state.

### `docs/`
Human-oriented onboarding, operational guides, and runbooks.

---

## Repository Structure

    platform-project/
    ├── README.md
    ├── CLAUDE.md
    ├── PROJECT.md           ← project classification (domain + traits)
    ├── .claude/
    ├── apps/
    ├── packages/
    ├── libs/
    ├── specs/
    │   ├── platform/        ← technology-level common rules (stable)
    │   ├── rules/           ← taxonomy-based rules (common index + domains/ + traits/)
    │   ├── contracts/
    │   ├── services/
    │   ├── features/
    │   └── use-cases/
    ├── knowledge/
    ├── tasks/
    ├── docs/
    ├── tests/
    ├── infrastructure/
    └── scripts/

---

## Implementation Rule

Do not start implementation from existing code.

Read in this order:

1. `CLAUDE.md`
2. `PROJECT.md` — then follow `specs/platform/entrypoint.md` **Step 0** to load the active rule layers (`specs/rules/common.md`, `specs/rules/domains/<domain>.md`, `specs/rules/traits/<trait>.md`)
3. target task in `tasks/ready/`
4. `specs/platform/entrypoint.md` — Core, Service-Type-Specific, and Auxiliary layers
5. relevant platform specs
6. target service specs
7. related contracts
8. related feature specs and use-cases
9. `.claude/skills/`
10. `knowledge/` if needed

Undeclared or unknown `domain`/`trait` values in `PROJECT.md` are a Hard Stop per `CLAUDE.md`.

---

## Service Architecture Rule

Service internal structure is intentionally not standardized globally.

Each service must follow only the architecture declared in:

`specs/services/<service>/architecture.md`

Different services may use different architectures.

Examples:
- `auth-service` -> layered
- `order-service` -> DDD-style
- `payment-service` -> hexagonal

---

## Shared Library Rule

`libs/` is only for reusable technical/common code.

Do not place:
- service-specific domain logic
- service-owned business rules
- service-specific entities
- service-private orchestration logic

See:
- `specs/platform/shared-library-policy.md`

---

## Task Lifecycle

`backlog -> ready -> in-progress -> review -> done -> archive`

Only tasks in `ready/` may be implemented.

See:
- `tasks/INDEX.md`

---

## Notes

- If specs are missing, unclear, or conflicting, stop and report the issue.
- If contracts must change, update contracts first.
- If service architecture must change, update the service spec first.