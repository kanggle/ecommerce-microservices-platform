---
name: design-event
description: Design a new domain event contract or modify an existing one
---

# design-event

Design a new domain event contract or modify an existing one.

## Usage

```
/design-event <description>                                # design a new event contract
/design-event add <EventName> event to <service>-events    # add event to existing contract
```

Examples:

```
/design-event product review created event design
/design-event add OrderShipped event to order-events
```

## Procedure

1. Read `specs/platform/event-driven-policy.md` (envelope, naming, consumer rules)
2. Read `specs/platform/naming-conventions.md` (event topic naming)
3. Read `specs/platform/versioning-policy.md` (event versioning)
4. Read existing `specs/contracts/events/` contract files to understand current patterns
5. Read `specs/services/<service>/overview.md` for the related service (ownership check)
6. Design the event contract following the format below
7. Write to `specs/contracts/events/<service>-events.md`
8. Update related feature/use-case specs and service overview Related Events

## Contract Format

Per event:
- Event Name
- Topic: `{service}.{entity}.{event}`
- Publisher / Consumers
- Trigger (when the event is published)
- Payload fields (camelCase)

## Standard Envelope

```json
{
  "event_id": "UUID",
  "event_type": "EventName",
  "occurred_at": "ISO-8601",
  "source": "service-name",
  "payload": { }
}
```

## Rules

- Envelope fields: snake_case, payload fields: camelCase
- Events represent past facts — immutable after publication
- Topic naming: `{service}.{entity}.{event}` (kebab-case)
- Consumers: idempotent processing required, DLQ required
- Producers: publish after transaction commit (outbox pattern)
- Breaking changes: create new version as `{EventName}V{n}`
