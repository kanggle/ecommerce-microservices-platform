# Task ID

TASK-BE-119

# Title

auth-service AuthEvent → Kafka 발행 브리지 구현 — 인메모리 이벤트를 실제 Kafka로 전송

# Status

ready

# Owner

backend

# Task Tags

- code
- event
- test

---

# Required Sections (must exist)

- Goal
- Scope (in/out)
- Acceptance Criteria
- Related Specs
- Related Contracts
- Edge Cases
- Failure Scenarios

---

# Goal

auth-service의 `SpringAuthEventPublisher.publish()`가 현재 Spring `ApplicationEventPublisher`로 인메모리 이벤트만 발행하고, 이를 Kafka로 전송하는 브리지가 존재하지 않는 버그를 수정한다.

현재 상태:
- `SignupService`, `OAuthService`, `UserSignupRepublishService` 등이 `eventPublisher.publish(AuthEvent.of(new UserSignedUp(...)))` 호출
- `SpringAuthEventPublisher`는 `applicationEventPublisher.publishEvent(event)`만 호출
- 이벤트를 listen하여 Kafka로 발행하는 `@EventListener`/`@TransactionalEventListener` 없음
- `KafkaTemplate.send()` 호출이 전체 auth-service 코드에 0건
- 결과: `auth.user.signed-up` 토픽에 아무 메시지도 발행되지 않아 user-service `UserSignedUpConsumer`가 영구히 굶고, 모든 가입 유저의 `user_profiles` 행이 누락

본 태스크 완료 후: 가입(`SignupService`, `OAuthService`) 시 `auth.user.signed-up` 이벤트가 Kafka로 정상 발행되어 user-service가 `user_profiles` 행을 자동 생성한다. TASK-BE-118의 republish 엔드포인트도 함께 정상 동작하게 된다.

---

# Scope

## In Scope

- `AuthEventKafkaBridge`(또는 동등 이름) 인프라 컴포넌트 생성
  - `@TransactionalEventListener(phase = AFTER_COMMIT)` 또는 `@EventListener`로 `AuthEvent` 수신
  - event 타입별 토픽 매핑: `UserSignedUp` → `auth.user.signed-up`
  - `KafkaTemplate<String, String>` 사용, payload는 JSON 직렬화
  - eventId를 메시지 key로 사용 (파티셔닝 일관성)
- `application.yml`에 Kafka producer 설정 추가 (이미 있으면 확인만)
- 실패 시 로깅 + `AuthMetricsRecorder.incrementEventPublishFailure(eventType)` 호출 (기존 메트릭 재사용)
- 통합 테스트: Testcontainers Kafka 기반, SignupService 호출 → Kafka 토픽 메시지 검증
- 단위 테스트: Bridge 빈이 AuthEvent 수신 시 KafkaTemplate.send를 올바른 토픽/페이로드로 호출하는지

## Out of Scope

- Transactional Outbox 패턴 전면 도입 (별도 태스크 — `@TransactionalEventListener(AFTER_COMMIT)`까지만)
- 신규 이벤트 타입 추가 (기존 `UserSignedUp` 및 기타 정의된 AuthEvent만 처리)
- user-service 측 변경 (컨슈머 및 핸들러는 이미 멱등, 정상 작동)
- 과거 가입 유저 백필 (TASK-BE-118의 republish 엔드포인트로 수동 처리)
- DLQ/재시도 정책 튜닝 (기존 KafkaConsumerConfig 정책 재사용)

---

# Acceptance Criteria

- [ ] 새 가입(`POST /api/auth/signup`) 시 `auth.user.signed-up` Kafka 토픽에 메시지가 발행된다
- [ ] 메시지 payload가 `specs/contracts/events/auth.user.signed-up.md` 스키마와 일치한다 (envelope: eventId, eventType, occurredAt, payload)
- [ ] OAuth 최초 로그인(`OAuthService.findOrCreateUser`에서 신규 유저 저장 시) 에도 동일하게 발행된다
- [ ] TASK-BE-118의 `POST /api/internal/users/republish-signup-events` 호출 시 모든 users 행에 대해 Kafka 발행이 이뤄진다
- [ ] Kafka 브로커 장애 시 `AuthMetricsRecorder.incrementEventPublishFailure`가 호출되고, signup 자체는 실패하지 않는다 (AFTER_COMMIT 단계)
- [ ] 통합 테스트가 Testcontainers Kafka로 실제 발행을 검증한다
- [ ] 기존 auth-service 테스트가 모두 통과한다

---

# Related Specs

> **Before reading Related Specs**: Follow `specs/platform/entrypoint.md` Step 0 — read `PROJECT.md`, then load `specs/rules/common.md` plus any `specs/rules/domains/<domain>.md` and `specs/rules/traits/<trait>.md` matching the declared classification.

- `specs/platform/event-driven-policy.md`
- `specs/platform/error-handling.md`
- `specs/services/auth-service/architecture.md`
- `specs/platform/testing-strategy.md`

# Related Skills

- `.claude/skills/backend/springboot-api.md`
- `.claude/skills/backend/testing-backend.md`
- `.claude/skills/backend/implementation-workflow.md`

---

# Related Contracts

- `specs/contracts/events/auth.user.signed-up.md` — 기존 스키마 준수 (변경 없음)

---

# Target Service

- `auth-service`

---

# Architecture

Follow:

- `specs/services/auth-service/architecture.md`

수정 대상 계층:
- Infrastructure: 신규 `AuthEventKafkaBridge` (또는 `event/` 하위) — `@TransactionalEventListener` 리스너
- Infrastructure config: Kafka producer 설정 확인/보강 (`application.yml`)
- 변경 없음: Application/Domain/Presentation 계층 (기존 `AuthEventPublisher` 인터페이스 그대로 사용)

---

# Implementation Notes

### 왜 @TransactionalEventListener(AFTER_COMMIT)

- 회원가입 트랜잭션이 커밋된 뒤에만 Kafka로 발행 → 트랜잭션 롤백 시 잘못된 이벤트 송출 방지
- AFTER_COMMIT은 Outbox보다 약하지만 portfolio 규모에는 충분. Outbox 도입은 별도 태스크로 분리

### 페이로드 구조

기존 `AuthEvent` 레코드의 `envelope` + `payload` 형식을 JSON 직렬화. `ObjectMapper` 빈 재사용.

### 토픽 매핑

- `UserSignedUp` → `auth.user.signed-up`
- 향후 다른 AuthEvent 타입 추가 시 매핑 확장 가능하도록 `Map<Class<?>, String>` 또는 switch 문 사용

### 실패 처리

- `KafkaTemplate.send().whenComplete(...)`로 비동기 실패 훅 등록 → 실패 시 `authMetrics.incrementEventPublishFailure(eventType)` 호출
- signup 트랜잭션은 이미 커밋된 상태이므로 예외를 삼킨다 (메트릭으로만 표출)

---

# Edge Cases

- Kafka 브로커 미기동 상태에서 signup → AFTER_COMMIT 단계에서 발행 실패 → signup 자체는 성공, 메트릭만 증가
- `UserSignupRepublishService`는 트랜잭션 컨텍스트 없이 호출됨 → `@EventListener`(non-transactional fallback)도 함께 지원해야 하는지 확인 필요. 만약 AFTER_COMMIT만 지원하면 republish 경로에서 이벤트가 안 나감. → 구현 시 두 단계 모두 리스닝하는 전략 또는 republish 서비스가 `@Transactional` 내에서 실행되도록 조정
- 동일 eventId가 재발행돼 Kafka에 중복 메시지 → user-service가 멱등이므로 영향 없음

---

# Failure Scenarios

- Kafka 장애 → 발행 실패 메트릭, signup 성공 유지
- 직렬화 실패(이벤트 payload에 문제) → 로그 + 메트릭, signup 성공 유지
- Spring 이벤트 전파 실패 → 애플리케이션 기동 실패로 빠르게 노출

---

# Test Requirements

- 단위 테스트: `AuthEventKafkaBridge` — `AuthEvent(UserSignedUp)` 수신 시 KafkaTemplate.send가 `auth.user.signed-up` 토픽으로 호출되고 payload JSON이 스펙 일치
- 통합 테스트(Testcontainers Kafka): `POST /api/auth/signup` → 토픽에 메시지 수신 확인 (consumer 스텁 또는 KafkaConsumer 직접 poll)
- 통합 테스트(Testcontainers Kafka): `POST /api/internal/users/republish-signup-events` → 기존 유저 수만큼 메시지 발행 확인
- 기존 auth-service 테스트 전체 통과

---

# Definition of Done

- [ ] Implementation completed
- [ ] Tests added
- [ ] Tests passing
- [ ] Contracts updated if needed (변경 없을 가능성 높음)
- [ ] Specs updated first if required
- [ ] Ready for review
