# Skills Index

Use this index to find relevant skills for a task.
Read only the matched skill files — do not read unrelated ones.

---

## Available Skills

| Situation | Skill |
|---|---|
| Implement Spring Boot REST API | `backend/springboot-api.md` |
| Implement Layered Architecture service | `backend/architecture/layered.md` |
| Implement DDD Architecture service | `backend/architecture/ddd.md` |
| Implement Hexagonal Architecture service | `backend/architecture/hexagonal.md` |
| Implement Clean Architecture service | `backend/architecture/clean.md` |
| Backend test writing | `backend/testing-backend.md` |
| Full backend implementation workflow | `backend/implementation-workflow.md` |
| Implement Feature-Sliced Design app (Next.js) | `frontend/architecture/feature-sliced-design.md` |
| Implement Layered by Feature app (Next.js) | `frontend/architecture/layered-by-feature.md` |

All other skill files (30 out of 39 total) are empty placeholders. Do not attempt to read them. If a task requires guidance from an empty skill, use the corresponding specs as primary guidance instead.

**Empty skills by category:**
- `backend/`: dto-mapping, exception-handling, transaction-handling, validation (4)
- `database/`: indexing, migration-strategy, schema-change-workflow, transaction-boundary (4)
- `frontend/`: api-client, implementation-workflow, form-handling, loading-error-handling, state-management, testing-frontend (6)
- `messaging/`: consumer-retry-dlq, event-implementation, idempotent-consumer, outbox-pattern (4)
- `search/`: elasticsearch-index, elasticsearch-query, index-sync (3)
- `testing/`: contract-test, e2e-test, fixture-management, test-strategy, testcontainers (5)
- `infra/`: ci-cd, docker-build, kubernetes-deploy, terraform-module (4)

---

## Default Skill Sets by Task Type

| Task Type | Skills to Read |
|---|---|
| Add backend API | `springboot-api`, matched architecture skill, `testing-backend` |
| Add event publishing | (not written — use specs only) |
| Add event consumer | (not written — use specs only) |
| Add frontend screen | matched architecture skill (`feature-sliced-design` or `layered-by-feature`) — `testing-frontend` is not written, use specs only |
| Integration task | backend skills + specs as needed |
