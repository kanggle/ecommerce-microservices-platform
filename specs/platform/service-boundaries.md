# Service Boundaries

Defines ownership rules and cross-service interaction constraints.

---

# Ownership Rule

Each service owns its domain exclusively.

- A service owns its data, business rules, and published interfaces.
- No other service may read or write another service's database directly.
- Cross-service data access must go through published contracts only.

---

# Service Boundary Constraints

For each service's primary responsibility, see the Services table in `architecture.md`.

The constraints below define what each service **must not** own or do:

| Service | Must NOT |
|---|---|
| `gateway-service` | Contain business logic; persist domain data |
| `auth-service` | Own user profile data; other services must not replicate its auth logic |
| `user-service` | Own authentication credentials; must expose data only through published contracts |
| `order-service` | Own payment logic |
| `payment-service` | Own order aggregate state |
| `batch-worker` | Own primary domain state; call non-public endpoints |

---

# Cross-Service Interaction Rules

## Synchronous
- Services communicate via HTTP through published contracts only.
- A service must not call another service's internal endpoints.
- Circular synchronous dependencies are forbidden.

### HTTP Dependency Matrix

All client-facing HTTP requests enter through `gateway-service`.

| Caller | Callee | Contract | Purpose |
|---|---|---|---|
| gateway-service | auth-service | `auth-api.md` | Authentication (signup, login, refresh, logout) |
| gateway-service | user-service | `user-api.md` | User profile and address management |
| gateway-service | product-service | `product-api.md` | Product catalog and admin management |
| gateway-service | search-service | `search-api.md` | Product search by keyword and filters |
| gateway-service | order-service | `order-api.md` | Order placement, listing, cancellation |
| gateway-service | payment-service | `payment-api.md` | Payment status queries |
| order-service | product-service | `product-api.md` | Stock validation at order placement |

- No circular synchronous dependencies exist.
- All other inter-service communication uses events (see `event-driven-policy.md`).

## Asynchronous
- Services communicate via domain events on shared messaging infrastructure.
- Event contracts must be defined in `specs/contracts/events/` before use.

## Data
- Each service has its own database. Shared databases are forbidden.
- A service must not import or embed another service's entity or table.
- Cross-service data access must go through contracts or local projections.
