---
name: refactor-safely
description: Safely refactor existing code without changing behavior
---

# refactor-safely

Safely refactor existing code. Improve structure without changing behavior.

## Usage

```
/refactor-safely auth-service presentation layer cleanup
/refactor-safely order-service OrderAggregate method extraction
```

## Procedure

1. Read `specs/services/<service>/architecture.md` for the target service
2. Read the target code and all related code
3. Check existing tests — if no tests exist, write tests before refactoring
4. Run existing tests → verify all pass (baseline)
5. Perform refactoring
6. Re-run existing tests → verify all pass
7. Adjust test code structure if needed (do not change what the tests verify)

## Rules

- No behavior change — externally observable behavior must remain identical
- Tests must pass both before and after refactoring
- Refactor only in the direction consistent with the declared architecture
- Changes affecting API/event contracts are not refactoring — use the `contract-change` workflow instead
- One refactoring at a time — do not mix multiple changes
