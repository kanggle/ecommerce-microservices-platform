# Platform Project

Monorepo platform project for multi-service application development.

This repository is designed for spec-driven, task-driven, and AI-assisted development.

---

## Principles

- `specs/` are the official source of truth
- work is executed through `tasks/`
- only tasks in `tasks/ready/` may be implemented
- `CLAUDE.md` defines minimum operating rules
- service internal structure is not globally fixed
- each service architecture is declared in `specs/services/<service>/architecture.md`

---

## Document Roles

### `CLAUDE.md`
Defines the minimum rules for how AI agents and developers must operate.

### `specs/`
Official project rules, contracts, service definitions, feature definitions, and cross-service flows.

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
    ├── .claude/
    ├── apps/
    ├── packages/
    ├── libs/
    ├── specs/
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
2. target task in `tasks/ready/`
3. `specs/platform/entrypoint.md`
4. relevant platform specs
5. target service specs
6. related contracts
7. related feature specs and use-cases
8. `.claude/skills/`
9. `knowledge/` if needed

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