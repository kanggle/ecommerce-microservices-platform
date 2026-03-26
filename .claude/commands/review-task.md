---
name: review-task
description: Review the implementation of a task in tasks/review/
---

# review-task

Review the implementation of a task in `tasks/review/`.

## Usage

```
/review-task TASK-BE-024
```

## Procedure

1. Find and read the task file matching the given ID in `tasks/review/`
2. If the task is not in `tasks/review/`, **stop immediately**
3. Read Related Specs and Related Contracts
4. Read the implementation code in the target service
5. Run the review checklist below
6. If no issues: move task from `tasks/review/` → `tasks/done/`
7. If issues found: create a fix task in `tasks/ready/` (referencing the original task ID), then move the original task to `tasks/done/`

## Review Checklist

### Spec Compliance
- [ ] All Acceptance Criteria met
- [ ] Related Specs rules followed
- [ ] Field names, types, and error codes match Related Contracts

### Architecture Compliance
- [ ] Follows the architecture style declared in `specs/services/<service>/architecture.md`
- [ ] Layer dependency direction is correct
- [ ] No forbidden dependencies

### Code Quality
- [ ] `specs/platform/coding-rules.md` followed
- [ ] `specs/platform/naming-conventions.md` followed
- [ ] Error response format matches `specs/platform/error-handling.md`
- [ ] No `specs/platform/security-rules.md` violations

### Testing
- [ ] Required test levels from `specs/platform/testing-strategy.md` are covered
- [ ] All tests pass
- [ ] Tests cover Edge Cases and Failure Scenarios

## Rules

- Do not modify code of a task under review directly
- Create a fix task when issues are found
- If no issues, move to done in one step
