# CLAUDE.md

This document defines the minimum operating rules for AI agents and developers in this repository.

---

# Core Principles

- Specifications are the source of truth.
- Work must be executed through tasks.
- Only tasks in `tasks/ready/` may be implemented.
- Follow the standard workflow: plan → implement → test → review.
- If specifications are missing, unclear, or conflicting, stop and report the issue.

---

# Source of Truth Priority

Use documents in the following order:

1. `specs/platform/`
   - Within `specs/platform/service-types/`, only the file matching the target service's declared `Service Type` is read; other service-type files are skipped.
2. `specs/contracts/`
3. `specs/services/`
4. `specs/features/`
5. `specs/use-cases/`
6. `tasks/ready/`
7. `.claude/skills/`
8. `knowledge/`
9. `docs/` (excluding `docs/guides/`)

> `docs/guides/` is for human reference only. AI agents must NOT read or use it as a source of truth.
10. existing code

If any lower-priority source conflicts with a higher-priority source, follow the higher-priority source.
If a source is empty or does not exist, skip it and follow the next priority source.

---

# Task Rules

- Do not implement work without a task.
- Do not implement tasks outside `tasks/ready/`.
- If a task conflicts with specs, specs win.
- If implementation requires spec or contract changes, update them first.
- Tasks missing required sections must not be implemented.
- Review and lifecycle rules are defined in `tasks/INDEX.md`.

Required task sections:

- Goal
- Scope
- Acceptance Criteria
- Related Specs
- Related Contracts
- Edge Cases
- Failure Scenarios

---

# Required Workflow

For any implementation task:

1. Read `CLAUDE.md`
2. Read the target task in `tasks/ready/`
3. Follow `specs/platform/entrypoint.md` for spec reading order
4. Determine the target service's `Service Type` from `specs/services/<service>/architecture.md` and read the matching `specs/platform/service-types/<type>.md` (exactly one file)
5. Read `.claude/skills/INDEX.md` and matched skill files for implementation guidance
6. Use `knowledge/` for design judgment only
7. Read existing code in the target service to understand current patterns, conventions, and structure
8. Implement and test
9. Prepare for review

---

# Hard Stop Rules

Stop immediately if any of the following is true:

- the task is not in `tasks/ready/`
- required specifications do not exist
- specifications conflict
- acceptance criteria are unclear
- required contracts are missing
- the task requires architecture decisions not documented in specs
- the target service's `Service Type` is undeclared or not in the catalog at `specs/platform/service-types/INDEX.md`

If stopped, report the blocking issue explicitly.

Do not attempt workaround implementation.

---

# Architecture Rule

Service architecture rules follow `specs/platform/architecture-decision-rule.md`.

Each service must follow the architecture declared in `specs/services/<service>/architecture.md`.

---

# Shared Library Rule

Shared libraries must follow `specs/platform/shared-library-policy.md`.

Do not move service-owned domain logic into `libs/`.

---

# Contract Rule

API and event changes must update contracts before implementation.

---

# Testing Rule

Every implementation must include tests appropriate to the task scope and follow:

- `specs/platform/testing-strategy.md`
