# Spec Entry Point

This document defines the starting point for reading specifications before implementation.

---

# Purpose

Use this file to reduce ambiguity when selecting which platform specs to read first.

AI agents and developers must begin platform-spec reading from this file.

---

# Platform Specs: Core vs Auxiliary

Platform specs are divided into **Core** and **Auxiliary**.

- **Core**: Always read before any implementation task.
- **Auxiliary**: Read only when the task requires it. Check the task's `Related Specs` section.

## Core (Always Read)

1. `architecture.md`
2. `service-boundaries.md`
3. `dependency-rules.md`
4. `shared-library-policy.md`
5. `security-rules.md`

## Auxiliary (Read When Relevant)

| Tag | Specs to Read |
|---|---|
| `api` | `api-gateway-policy.md`, `versioning-policy.md`, `error-handling.md` |
| `event` | `event-driven-policy.md` |
| `deploy` | `deployment-policy.md`, `observability.md` |
| `code` | `naming-conventions.md`, `coding-rules.md`, `testing-strategy.md` |
| `test` | `testing-strategy.md` |
| `adr` | `architecture-decision-rule.md`, `ownership-rule.md` |
| `onboarding` | `glossary.md`, `repository-structure.md` |

Tags are declared in the task file under `Task Tags` (optional section, not required by CLAUDE.md).
If no tags are declared or the section does not exist, read only `error-handling.md` and `testing-strategy.md` as defaults.

---

# Task Navigation Rule

After reading Core platform specs:

1. Read the target task in `tasks/ready/`
2. Read auxiliary specs matching the task's tags
3. Read related API or event contracts in `specs/contracts/`
4. Read the target service specs in `specs/services/<service>/`
5. Read related feature specs in `specs/features/` (if the directory exists and contains files)
6. Read related use-cases in `specs/use-cases/` (if the directory exists and contains files)

If a directory is empty or does not exist, skip it and continue to the next step.

---

# Usage Rules

- Do not start implementation from existing code.
- Do not use `knowledge/` as a substitute for `specs/`.
- Use `.claude/skills/` only after official specs have been read.
- Skip auxiliary specs that are clearly irrelevant to the task.

---

# Conflict Rule

If any document conflicts with a higher-priority spec:

- follow the higher-priority spec
- stop implementation if the conflict blocks the task
- report the conflicting documents explicitly