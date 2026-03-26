---
name: process-all-tasks
description: Analyze all ready tasks, determine optimal strategy, and process them via subagents in dependency order
---

# process-all-tasks

Read all tasks in `tasks/ready/`, analyze dependencies and complexity, then delegate each task to a subagent using the most efficient method.

## Usage

```
/process-all-tasks
/process-all-tasks order-service
/process-all-tasks --dry-run
```

- No argument: process all tasks in `tasks/ready/`
- Service name: filter tasks for that service only
- `--dry-run`: analyze and show execution plan only, do not implement

## Architecture

```
Main context (lightweight — plan + coordinate only)
  ├─ Phase 1~4: Discovery, Analysis, Dependencies, Plan
  ├─ Phase 5: Delegate to subagents
  │    ├─ Round 1: Agent[BE-A] + Agent[BE-B]  (parallel, independent)
  │    ├─ Round 2: Agent[BE-C]                 (sequential, depends on Round 1)
  │    └─ Round N: ...
  └─ Phase 6: Collect results + Summary
```

Main context never reads specs, skills, or source code directly — subagents do all heavy lifting.

## Procedure

### Phase 1: Discovery (main context)

1. Read `CLAUDE.md`
2. List all task files in `tasks/ready/` (exclude `.gitkeep`)
3. Read every task file fully
4. If argument is a service name, filter to tasks matching that Target Service

### Phase 2: Analysis (main context)

For each task, extract and record:
- Task ID, Title, Target Service
- Task Tags (code, event, refactor, etc.)
- Scope (In/Out)
- Related Specs and Related Contracts
- Edge Cases and Failure Scenarios complexity
- Test Requirements

Classify each task into one of:

| Category | Criteria |
|---|---|
| **simple-refactor** | Tag contains `refactor`, no contract changes, no event changes |
| **simple-code** | Single-layer change, no event, no contract change |
| **code-with-event** | Tag contains `event`, or Related Contracts includes event contracts |
| **contract-change** | Requires API or event contract updates before implementation |
| **cross-service** | Scope touches multiple services |

### Phase 3: Dependency Resolution (main context)

Build a dependency graph:

1. **Explicit dependencies**: Check if any task's Implementation Notes or Scope references code that another task modifies
2. **Package/file overlap**: Tasks modifying the same package or class must run sequentially
3. **Refactor-first rule**: Refactoring tasks (package moves, renames) must run before tasks that add code to the same area
4. **Contract-first rule**: Contract changes must complete before implementation tasks that depend on them
5. **Independent tasks**: Tasks with no shared files or dependencies can run in parallel

Output a topological ordering grouped into execution rounds:
```
Round 1 (parallel): [TASK-A, TASK-B]  — no shared files
Round 2 (sequential): [TASK-C]        — depends on A's output
Round 3 (parallel): [TASK-D, TASK-E]  — depend on C but not each other
```

### Phase 4: Execution Plan (main context)

Present the plan before executing:

```
## Execution Plan

| Order | Task ID | Title | Category | Parallel | Depends On |
|---|---|---|---|---|---|

Total: N tasks, M rounds
```

If `--dry-run` is specified, **stop here** and do not proceed to Phase 5.

### Phase 5: Execute via Subagents

**Key principle**: Each task runs in its own subagent. Main context only coordinates.

#### Per-round execution:

1. **Parallel round** (independent tasks):
   - Launch multiple Agent tool calls in a single message
   - Each agent receives a complete, self-contained prompt (see Agent Prompt Template below)
   - Wait for all agents in the round to complete

2. **Sequential round** (dependent tasks):
   - Launch one agent at a time
   - Wait for completion before launching the next

3. **Between rounds**:
   - Check each agent's result (success/failure)
   - If a task failed, mark all tasks that depend on it as `blocked`
   - Do not launch blocked tasks

#### Agent Prompt Template

Each subagent receives this prompt (filled with task-specific values):

```
You are implementing a task in this project. Follow these steps exactly:

## Task
- Task ID: {taskId}
- Task file: tasks/in-progress/{taskFileName}

## Steps
1. Read `CLAUDE.md`
2. Read the task file at `tasks/ready/{taskFileName}`
3. Move task from `tasks/ready/` to `tasks/in-progress/`
4. Read `specs/platform/entrypoint.md` and follow the spec reading order
5. Read all Related Specs listed in the task
6. Read all Related Contracts listed in the task
7. Read `.claude/skills/INDEX.md` and matched skill files
8. Read existing code in the target service
9. Implement the task following specs and architecture rules
10. Write tests as specified in Test Requirements
11. Run tests: ./gradlew :apps:{service}:test
12. Verify all Acceptance Criteria are met
13. Move task from `tasks/in-progress/` to `tasks/review/`

## Category-specific instructions
{categoryInstructions}

## Rules
- Specs win over implementation when they conflict
- Update contract files first if API or event shape changes
- Follow the architecture in `specs/services/{service}/architecture.md`
- Do not ask confirmation questions — proceed autonomously
- If a Hard Stop condition from CLAUDE.md is triggered, stop and return the reason

## Return
When done, return a summary:
- Task ID
- Result: success / failed / blocked
- Files created or modified (list)
- Tests: passed / failed (count)
- Notes: any issues encountered
```

Category-specific instructions per type:

**simple-refactor / simple-code**:
```
Standard implementation. No special handling needed.
```

**code-with-event**:
```
- Read event contracts before implementation
- Implement event publishing logic
- Test event publishing in integration tests
- Follow specs/platform/event-driven-policy.md (outbox pattern, idempotency)
```

**contract-change**:
```
- Update contract files FIRST (specs/contracts/http/ or specs/contracts/events/)
- Then implement against the updated contracts
- Verify contract and implementation are consistent
```

**cross-service**:
```
- Process changes for {primaryService} only
- Verify cross-service contracts are consistent
- Do not modify other services
```

### Phase 6: Summary (main context)

Collect all subagent results and output:

```
## Processing Summary

| Task ID | Title | Category | Result | Files Changed | Tests |
|---|---|---|---|---|---|

Completed: N / Total: M
Failed: [list with reasons]
Blocked: [list with dependency reason]
Moved to review: [list]
```

## Rules

- Follow CLAUDE.md Hard Stop Rules at every step
- Main context does NOT read specs, skills, or source code — subagents do
- Never skip Phase 2 analysis — wrong categorization leads to wrong execution
- If a task fails, log the failure and continue with the next independent task
- Do not launch tasks that depend on a failed task — mark them as blocked
- Proceed without asking confirmation questions (unless `--dry-run`)
- Each subagent must run tests and verify acceptance criteria before moving to review
