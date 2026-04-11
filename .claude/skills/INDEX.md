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
| Backend exception classes and global error handling | `backend/exception-handling.md` |
| Backend input validation (DTO + domain) | `backend/validation.md` |
| Backend DTO/entity mapping between layers | `backend/dto-mapping.md` |
| Backend @Transactional usage and boundaries | `backend/transaction-handling.md` |
| Backend test writing | `backend/testing-backend.md` |
| Full backend implementation workflow | `backend/implementation-workflow.md` |
| Backend refactoring patterns | `backend/refactoring.md` |
| JWT token generation, refresh token rotation, token store | `backend/jwt-auth.md` |
| Redis Sorted Set session management, concurrent limits | `backend/redis-session.md` |
| Redis fixed-window rate limiting with Lua scripts | `backend/rate-limiting.md` |
| Multi-provider OAuth 2.0 integration (Google, Naver) | `backend/oauth-provider.md` |
| API gateway JWT filter, routing, header enrichment | `backend/gateway-security.md` |
| Micrometer business metrics, OTel tracing, MDC | `backend/observability-metrics.md` |
| Audit log entity, REQUIRES_NEW transaction pattern | `backend/audit-logging.md` |
| Shared PageQuery/PageResult pagination DTOs | `backend/pagination.md` |
| Scheduled tasks, outbox polling, batch jobs | `backend/scheduled-tasks.md` |
| @Profile("standalone") in-memory fallbacks for local dev | `backend/standalone-profile.md` |
| Implement Kafka event publisher/consumer | `messaging/event-implementation.md` |
| Implement transactional outbox for reliable events | `messaging/outbox-pattern.md` |
| Implement consumer retry and dead-letter queue | `messaging/consumer-retry-dlq.md` |
| Implement idempotent event consumer | `messaging/idempotent-consumer.md` |
| Database schema changes with Flyway | `database/schema-change-workflow.md` |
| Database index design and optimization | `database/indexing.md` |
| Flyway migration management | `database/migration-strategy.md` |
| Transaction boundary design | `database/transaction-boundary.md` |
| Implement Feature-Sliced Design app (Next.js) | `frontend/architecture/feature-sliced-design.md` |
| Implement Layered by Feature app (Next.js) | `frontend/architecture/layered-by-feature.md` |
| Full frontend implementation workflow | `frontend/implementation-workflow.md` |
| Frontend API client setup and usage | `frontend/api-client.md` |
| Frontend state management with React Query | `frontend/state-management.md` |
| Frontend form handling patterns | `frontend/form-handling.md` |
| Frontend loading and error state handling | `frontend/loading-error-handling.md` |
| Frontend test writing (Vitest + Testing Library) | `frontend/testing-frontend.md` |
| Reusable component primitives, a11y, design tokens | `frontend/component-library.md` |
| Bundle analysis, code splitting, image/font, Core Web Vitals | `frontend/bundling-perf.md` |
| Next.js App Router server actions and revalidation | `frontend/server-actions.md` |
| Frontend auth: HttpOnly cookies, refresh proxy, server boundary | `frontend/auth-client.md` |
| Elasticsearch index management | `search/elasticsearch-index.md` |
| Elasticsearch query building | `search/elasticsearch-query.md` |
| Search index sync via events | `search/index-sync.md` |
| Test type selection and coverage strategy | `testing/test-strategy.md` |
| API and event contract testing | `testing/contract-test.md` |
| End-to-end integration testing | `testing/e2e-test.md` |
| Test data and fixture management | `testing/fixture-management.md` |
| Testcontainers setup and usage | `testing/testcontainers.md` |
| Docker image build patterns | `infra/docker-build.md` |
| Kubernetes deployment manifests | `infra/kubernetes-deploy.md` |
| Terraform module patterns | `infra/terraform-module.md` |
| GitHub Actions CI/CD pipelines | `infra/ci-cd.md` |
| Prometheus/Grafana/Loki/Alertmanager stack as code | `infra/monitoring-stack.md` |
| Secrets storage, sealed secrets, ESO, rotation | `infra/secrets-management.md` |
| Service mesh (Linkerd/Istio) mTLS, traffic split, authz | `infra/service-mesh.md` |
| K8s right-sizing, HPA, spot/ARM, PDB, cost levers | `infra/cost-optimization.md` |
| Cache tier selection, TTL, invalidation policy | `cross-cutting/caching.md` |
| API/event versioning, deprecation, coexistence | `cross-cutting/api-versioning.md` |
| End-to-end observability setup (logs, metrics, traces, alerts) | `cross-cutting/observability-setup.md` |
| OWASP Top 10 hardening checklist | `cross-cutting/security-hardening.md` |
| Performance targets, profiling, load testing | `cross-cutting/performance-tuning.md` |
| Set up a `rest-api` service end-to-end | `service-types/rest-api-setup.md` |
| Set up an `event-consumer` service end-to-end | `service-types/event-consumer-setup.md` |
| Set up a `batch-job` service end-to-end | `service-types/batch-job-setup.md` |
| Set up a `grpc-service` end-to-end | `service-types/grpc-service-setup.md` |
| Set up a `graphql-service` end-to-end | `service-types/graphql-service-setup.md` |
| Set up an `ml-pipeline` service end-to-end | `service-types/ml-pipeline-setup.md` |
| Set up a `frontend-app` service end-to-end | `service-types/frontend-app-setup.md` |
| Code review checklist | `review-checklist.md` |

---

## Default Skill Sets by Task Type

| Task Type | Skills to Read |
|---|---|
| Add backend API | `springboot-api`, matched architecture skill, `exception-handling`, `validation`, `dto-mapping`, `transaction-handling`, `pagination`, `testing-backend` |
| Add auth feature | `jwt-auth`, `redis-session`, `rate-limiting`, `audit-logging`, `testing-backend` |
| Add OAuth provider | `oauth-provider`, `jwt-auth`, `redis-session` |
| Add event publishing | `event-implementation`, `outbox-pattern`, `scheduled-tasks`, `testing-backend` |
| Add event consumer | `event-implementation`, `consumer-retry-dlq`, `idempotent-consumer`, `testing-backend` |
| Add database migration | `schema-change-workflow`, `migration-strategy`, `indexing` |
| Add frontend screen | matched architecture skill, `api-client`, `state-management`, `form-handling`, `loading-error-handling`, `component-library`, `testing-frontend` |
| Add search feature | `elasticsearch-index`, `elasticsearch-query`, `index-sync` |
| Add gateway route/filter | `gateway-security` |
| Add observability/metrics | `observability-metrics` |
| Add standalone support | `standalone-profile` |
| Integration task | backend skills + `e2e-test` + specs as needed |
| Infrastructure task | `docker-build`, `kubernetes-deploy`, `ci-cd` as needed |
| Code review | `review-checklist` + related architecture skill + `testing-backend` or `testing-frontend` |
| Set up new service | matching `service-types/<type>-setup` + `cross-cutting/observability-setup` + `cross-cutting/security-hardening` |
| Add caching layer | `cross-cutting/caching` + `backend/redis-session` (if Redis) |
| Bump API version | `cross-cutting/api-versioning` + `testing/contract-test` |
| Wire observability for a service | `cross-cutting/observability-setup` + `backend/observability-metrics` + `infra/monitoring-stack` |
| Performance investigation | `cross-cutting/performance-tuning` + `cross-cutting/observability-setup` |
| Security hardening pass | `cross-cutting/security-hardening` + `backend/jwt-auth` (if auth) |
