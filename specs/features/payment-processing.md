# Feature: Payment Processing

## Purpose

Handles payment lifecycle triggered by order events. Processes payments when orders are placed and issues refunds when orders are cancelled. Currently operates in simulated mode without a real payment gateway.

## Related Services

| Service | Role |
|---|---|
| payment-service | Primary owner — payment creation, processing, refund, status management, event publishing |
| order-service | Publishes OrderPlaced and OrderCancelled events that trigger payment operations |
| web-store | Displays payment information on order detail page |
| gateway-service | Request routing, user identity injection (X-User-Id header) |

## User Flows

### Payment Processing (Event-Driven)

1. order-service publishes OrderPlaced event
2. payment-service consumes event and creates payment record in PENDING status
3. payment-service processes payment (simulated)
4. On success: transitions to COMPLETED, publishes PaymentCompleted event
5. On failure: transitions to FAILED, publishes PaymentFailed event

### Refund Processing (Event-Driven)

1. order-service publishes OrderCancelled event
2. payment-service consumes event and locates corresponding payment
3. payment-service processes refund (simulated)
4. Transitions payment to REFUNDED, publishes PaymentRefunded event

### Payment Query

1. Authenticated user sends GET /api/payments/orders/{orderId}
2. payment-service validates ownership (X-User-Id must match payment userId)
3. Returns payment details (paymentId, orderId, amount, status, timestamps)

## Business Rules

- Payment statuses: PENDING → COMPLETED / FAILED; COMPLETED → REFUNDED
- Payment is created automatically on OrderPlaced event — no direct payment creation API
- Only the payment owner (matching userId) can query payment information
- Refund is triggered automatically on OrderCancelled event
- Payment processing is currently simulated (no real payment gateway integration)
- All event consumers handle duplicates idempotently
- Failed events are routed to DLQ

## Related Contracts

- HTTP: `specs/contracts/http/payment-api.md`
- Events: `specs/contracts/events/payment-events.md`

## Related Events

| Event | Publisher | Consumers |
|---|---|---|
| OrderPlaced | order-service | payment-service |
| OrderCancelled | order-service | payment-service |
| PaymentCompleted | payment-service | order-service |
| PaymentFailed | payment-service | order-service |
| PaymentRefunded | payment-service | order-service |
