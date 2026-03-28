# Service Architecture

## Service
`notification-service`

## Architecture Style
`Hexagonal Architecture`

## Why This Architecture
Notification service integrates with multiple external channels (email, SMS, push) that may change independently.

Hexagonal architecture isolates the core notification logic from external channel adapters, making it easy to swap or add channels without modifying business rules.

The primary flow is event-driven (inbound ports from Kafka) with outbound ports to external delivery systems.

## Internal Structure Rule
This service uses a hexagonal internal structure.

Recommended internal areas:
- adapter/in (inbound adapters: HTTP controllers, Kafka consumers)
- adapter/out (outbound adapters: email sender, SMS sender, push sender, persistence)
- application (use-cases, ports)
- domain

Key domain concepts:
- Entities: Notification, NotificationTemplate, UserNotificationPreference
- Value Objects: NotificationChannel (EMAIL, SMS, PUSH), NotificationStatus (PENDING, SENT, FAILED), TemplateType
- Ports (inbound): SendNotificationUseCase, ManageTemplateUseCase, ManagePreferenceUseCase
- Ports (outbound): NotificationSender, NotificationRepository, TemplateRepository

## Allowed Dependencies
- adapter/in -> application (inbound ports)
- adapter/out -> application (outbound ports)
- application -> domain
- domain depends on nothing

## Forbidden Dependencies
- domain must not depend on framework, persistence, or external channel details
- adapters must not contain business logic
- application must not directly reference adapter implementations
- inbound adapters must not call outbound adapters directly

## Boundary Rules
- inbound adapters handle HTTP mapping, Kafka message deserialization, and delegation to use-cases
- application layer coordinates notification orchestration and template rendering
- domain layer owns notification rules and preference constraints
- outbound adapters implement channel-specific delivery and persistence

## Domain Scope
- Notification (recipient, channel, subject, body, status, sent/failed timestamps)
- NotificationTemplate (type, channel, subject template, body template, variables)
- UserNotificationPreference (user reference, channel opt-in/out settings)

## Domain Constraints
- notification-service must NOT own user profile or order data
- Notifications must respect user channel preferences (opt-out channels skipped)
- Failed notifications must be retried according to retry policy
- Duplicate event consumption must not produce duplicate notifications (idempotency via event_id)

## Integration Rules
- Event consumption must follow published event contracts
- HTTP behavior must follow published contracts
- External channel adapters must be behind outbound port interfaces
- Shared libraries may be used only under shared-library policy

## Events
- Consumes: `OrderPlaced` (order-service), `PaymentCompleted` (payment-service), `ShippingStatusChanged` (shipping-service), `UserSignedUp` (auth-service)
- Publishes: none

## Testing Expectations
Required emphasis:
- use-case / application service tests
- inbound adapter tests (Kafka consumer, HTTP controller)
- outbound adapter tests (mocked external channels)
- template rendering tests
- idempotency tests

## Change Rule
Any architectural change to this service must be documented here first before implementation.
