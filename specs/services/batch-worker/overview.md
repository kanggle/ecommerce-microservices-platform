# Service Overview

## Service
`batch-worker`

## Responsibility
Owns scheduled and batch processing tasks for platform-wide maintenance, cleanup, and data aggregation.

## In Scope
- expired session cleanup (auth-service sessions past inactivity timeout)
- stale order cancellation (orders stuck in PENDING beyond timeout)
- daily sales aggregation (order/payment summary)
- Elasticsearch index consistency check (product data sync verification)
- job execution history tracking and observability

## Out of Scope
- real-time request handling (no HTTP APIs exposed)
- business domain ownership (operates on other services' data via approved contracts)
- user-facing functionality

## Owned Data
- batch job execution history (job name, status, started_at, finished_at, error_message)

## Published Interfaces
- None (does not expose HTTP APIs)
- may publish events to notify other services of completed batch operations

## Dependent Systems
- persistence (own PostgreSQL database for job history)
- messaging infrastructure (Kafka — event consumption and publication)
- other services via HTTP contracts (read-only access where needed)
