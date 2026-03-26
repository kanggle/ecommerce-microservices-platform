---
name: implement-task
description: Implement the given task end-to-end following the standard workflow
---

# implement-task

Implement the given task end-to-end.

## Usage

```
/implement-task TASK-BE-113
```

## Procedure

1. Read `CLAUDE.md`
2. Find and read the task file matching the given ID in `tasks/ready/`
3. If the task is not in `tasks/ready/`, **stop immediately** — do not implement tasks from other directories
4. Verify all required sections exist (Goal, Scope, Acceptance Criteria, Related Specs, Related Contracts, Edge Cases, Failure Scenarios) — stop if any is missing
5. Read Related Specs in the order defined by `specs/platform/entrypoint.md`
6. Read Related Contracts
7. Read `.claude/skills/INDEX.md` → read skill files matching Related Skills
8. Read existing code in the target service to understand current patterns and structure
9. Move task from `tasks/ready/` → `tasks/in-progress/`
10. Implement
11. Write and run tests as specified in Test Requirements
12. Verify all Acceptance Criteria are met
13. Move task from `tasks/in-progress/` → `tasks/review/`

## Rules

- Specs win over implementation when they conflict
- Update contract files first if API or event shape changes
- Follow the architecture style declared in `specs/services/<service>/architecture.md`
- Proceed without asking confirmation questions
