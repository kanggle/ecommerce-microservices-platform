# Use Case: 결제 및 환불

---

## UC-1: 주문 결제

### 액터

- 시스템 (order-service → payment-service)

### 사전조건

- 주문이 생성되어 `OrderPlaced` 이벤트가 발행됨

### 정상 흐름

1. order-service가 `OrderPlaced` 이벤트를 발행한다.
2. payment-service가 이벤트를 수신한다.
3. payment-service가 결제를 PENDING 상태로 생성한다.
4. 결제 처리를 수행한다 (현재 시뮬레이션 — 실제 결제 게이트웨이 미연동).
5. 결제가 성공하면 상태를 COMPLETED로 변경한다.
6. payment-service가 `PaymentCompleted` 이벤트를 발행한다 (paymentId, orderId, userId, amount, paidAt).
7. order-service가 이벤트를 수신하여 주문 상태를 CONFIRMED로 변경한다.

### 대안 흐름

- **AF-1: 결제 실패** — 결제 처리가 실패하면 상태를 FAILED로 변경한다.

### 예외 흐름

- **EF-1: 이벤트 수신 실패** — `OrderPlaced` 이벤트 처리 실패 시 재시도 메커니즘을 통해 최종 일관성을 보장한다.

---

## UC-2: 주문 취소에 의한 환불

### 액터

- 시스템 (order-service → payment-service)

### 사전조건

- 주문이 취소되어 `OrderCancelled` 이벤트가 발행됨
- 해당 주문의 결제가 COMPLETED 상태임

### 정상 흐름

1. order-service가 `OrderCancelled` 이벤트를 발행한다.
2. payment-service가 이벤트를 수신한다.
3. 해당 orderId의 결제 정보를 조회한다.
4. 환불 처리를 수행한다 (현재 시뮬레이션).
5. 결제 상태를 REFUNDED로 변경한다.
6. payment-service가 `PaymentRefunded` 이벤트를 발행한다 (paymentId, orderId, userId, amount, refundedAt).
7. order-service가 이벤트를 수신하여 환불 완료를 기록한다.

### 대안 흐름

- **AF-1: 결제 미완료 상태 취소** — 결제가 PENDING 또는 FAILED 상태에서 주문이 취소되면 환불 없이 결제를 종료한다.

### 예외 흐름

- **EF-1: 이벤트 수신 실패** — `OrderCancelled` 이벤트 처리 실패 시 재시도 메커니즘을 통해 최종 일관성을 보장한다.

---

## UC-3: 결제 내역 조회

### 액터

- 인증된 사용자 (Authenticated User)

### 사전조건

- 사용자가 로그인되어 있음
- 해당 주문의 결제 정보가 존재함

### 정상 흐름

1. 사용자가 주문의 결제 정보를 확인한다.
2. 클라이언트가 GET /api/payments/orders/{orderId} 요청을 보낸다 (X-User-Id 헤더 포함).
3. payment-service가 소유권을 검증한다 (X-User-Id와 결제의 userId 일치 확인).
4. 결제 상세 정보를 반환한다 (paymentId, orderId, userId, amount, status, timestamps).

### 대안 흐름

- 없음

### 예외 흐름

- **EF-1: 결제 미존재** — 해당 orderId의 결제 정보가 없으면 `PAYMENT_NOT_FOUND` 오류를 반환한다 (404).
- **EF-2: 소유권 불일치** — X-User-Id가 결제 소유자와 다르면 `ACCESS_DENIED` 오류를 반환한다 (403).
- **EF-3: 잘못된 요청** — 유효하지 않은 orderId 형식이면 `INVALID_PAYMENT_REQUEST` 오류를 반환한다 (400).
