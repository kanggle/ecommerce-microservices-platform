---
name: validate-rules
description: Scan all rule files (CLAUDE.md, specs, skills, agents, commands) for inconsistencies
---

# validate-rules

Scan all rule files for inconsistencies, conflicts, duplications, and missing references.

## Usage

```
/validate-rules                                            # full scan of all rule files
/validate-rules --focus=<type>                             # scan only a specific type
```

Focus values: `specs`, `skills`, `agents`, `commands`

Examples:

```
/validate-rules
/validate-rules --focus=agents
/validate-rules --focus=skills
```

## Procedure

### Phase 1: Collect all rule files

1. Read `CLAUDE.md`
2. List and read all files in:
   - `specs/platform/`
   - `.claude/skills/` (non-empty files only, per INDEX.md)
   - `.claude/agents/`
   - `.claude/commands/`

### Phase 2: Cross-reference checks

#### 2-1. Spec Consistency
- [ ] No two platform specs define the same rule differently
- [ ] Cross-references between specs point to existing files
- [ ] `CLAUDE.md` rules do not conflict with platform specs

#### 2-2. Skill → Spec Alignment
- [ ] Every skill references at least one spec as prerequisite
- [ ] Skill patterns match the rules in referenced specs
- [ ] Skill code examples follow `coding-rules.md` and `naming-conventions.md`
- [ ] No skill contradicts its referenced spec

#### 2-3. Agent → Skill/Spec Alignment
- [ ] Agent `skills:` field references existing skill files
- [ ] Agent checklist items align with referenced specs
- [ ] Agent `Does NOT` section does not conflict with workflow steps
- [ ] No two agents have overlapping responsibilities without clear boundaries

#### 2-4. Command → Agent/Skill/Spec Alignment
- [ ] Command procedures reference existing specs and skills
- [ ] Command agent prompt templates are consistent with agent definitions
- [ ] No two commands do the same thing (functional duplication)
- [ ] Command names follow a consistent naming pattern
- [ ] Composite commands (e.g., `process-tasks`) that reference other commands' procedures remain consistent with those commands' current rules (subagent_type, isolation, merge order, etc.)

#### 2-5. Reference Integrity
- [ ] All `specs/` paths referenced in skills, agents, and commands exist
- [ ] All `.claude/skills/` paths referenced in agents exist
- [ ] `skills/INDEX.md` lists all non-empty skill files
- [ ] No orphaned skill files (exist but not in INDEX)

### Phase 3: Report

Output the validation report:

```
## Rule Validation Report

### Critical (must fix)
- [file] description of conflict or inconsistency

### Warning (should fix)
- [file] description of issue

### Info (consider)
- [file] suggestion for improvement

### Summary
- Files scanned: N
- Critical: N
- Warning: N
- Info: N
- Status: PASS / FAIL
```

## Rules

- Read-only — do not modify any files
- Report all issues found, do not stop at the first one
- Classify severity: Critical (contradictions, missing refs) > Warning (duplications, weak refs) > Info (naming, suggestions)
- When reporting a conflict between two documents, always specify which document is authoritative per CLAUDE.md Source of Truth Priority (higher-priority document wins, lower-priority document should be corrected)
- Proceed without asking confirmation questions
