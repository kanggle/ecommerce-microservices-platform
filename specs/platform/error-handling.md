# Error Handling

Defines the platform-wide error response format and error code conventions.

---

# Error Response Format

All services must return errors in the following JSON format:

```json
{
  "code": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
```

- `code`: machine-readable error code in UPPER_SNAKE_CASE
- `message`: human-readable description (must not contain sensitive data)
- `timestamp`: UTC time of the error in ISO 8601 format

---

# HTTP Status Code Mapping

| Situation | HTTP Status |
|---|---|
| Validation failure (missing/invalid field) | 400 Bad Request |
| Authentication failure (invalid credentials, missing token) | 401 Unauthorized |
| Authorization failure (insufficient permission) | 403 Forbidden |
| Resource not found | 404 Not Found |
| Conflict (duplicate resource) | 409 Conflict |
| Unprocessable business rule violation | 422 Unprocessable Entity |
| Rate limit exceeded | 429 Too Many Requests |
| Internal server error | 500 Internal Server Error |
| Upstream dependency unavailable | 503 Service Unavailable |

---

# Standard Error Codes

## Authentication

| Code | HTTP | Description |
|---|---|---|
| INVALID_CREDENTIALS | 401 | Email or password is incorrect |
| INVALID_REFRESH_TOKEN | 401 | Refresh token not found or expired |
| REFRESH_TOKEN_REVOKED | 401 | Refresh token has been explicitly revoked |
| UNAUTHORIZED | 401 | Access token missing or invalid |

## Authorization

| Code | HTTP | Description |
|---|---|---|
| ACCESS_DENIED | 403 | Insufficient permissions to access resource |

## Registration

| Code | HTTP | Description |
|---|---|---|
| EMAIL_ALREADY_EXISTS | 409 | Email is already registered |

## Validation

| Code | HTTP | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Request field is missing or fails validation |

## Rate Limiting

| Code | HTTP | Description |
|---|---|---|
| RATE_LIMIT_EXCEEDED | 429 | Too many login attempts. Try again later. |

## General

| Code | HTTP | Description |
|---|---|---|
| NOT_FOUND | 404 | Requested resource does not exist |
| INTERNAL_ERROR | 500 | Unexpected server-side error |
| SERVICE_UNAVAILABLE | 503 | A required upstream service is unavailable |

## Product

| Code | HTTP | Description |
|---|---|---|
| PRODUCT_NOT_FOUND | 404 | Product with given ID does not exist |
| INVALID_CATEGORY | 400 | Category with given ID does not exist |
| VARIANT_NOT_FOUND | 404 | Variant with given ID does not exist |
| INSUFFICIENT_STOCK | 400 | Stock adjustment would result in negative stock |
| CONFLICT | 409 | Optimistic locking conflict on concurrent update |

## Search

| Code | HTTP | Description |
|---|---|---|
| INVALID_SEARCH_REQUEST | 400 | Search request is invalid (missing or blank q parameter, invalid size) |

## Order

| Code | HTTP | Description |
|---|---|---|
| ORDER_NOT_FOUND | 404 | Order with given ID does not exist |
| INVALID_ORDER_REQUEST | 400 | Order request is invalid (missing fields, invalid quantity) |
| ORDER_CANNOT_BE_CANCELLED | 422 | Order cannot be cancelled in its current status |

## Payment

| Code | HTTP | Description |
|---|---|---|
| PAYMENT_NOT_FOUND | 404 | Payment for given order does not exist |
| INVALID_PAYMENT_REQUEST | 400 | Payment request is invalid (missing X-User-Id header) |

## User

| Code | HTTP | Description |
|---|---|---|
| USER_PROFILE_NOT_FOUND | 404 | User profile does not exist |
| ADDRESS_NOT_FOUND | 404 | Address with given ID does not exist |
| ADDRESS_LIMIT_EXCEEDED | 422 | Maximum number of addresses reached (10) |
| DEFAULT_ADDRESS_CANNOT_BE_DELETED | 422 | Cannot delete the default address while other addresses exist |
| USER_ALREADY_WITHDRAWN | 422 | User has already been withdrawn |

---

# Rules

- Services must never expose stack traces, internal class names, or SQL in error responses.
- Error codes must be registered in this document before use.
- `GlobalExceptionHandler` (or equivalent) must handle all unhandled exceptions and return the standard format.
- Validation errors must use `VALIDATION_ERROR` and include the first failing field message.
- Business rule violations must use a domain-specific code (e.g. `EMAIL_ALREADY_EXISTS`), not `VALIDATION_ERROR`.

---

# Change Rule

New error codes must be added to this document before being used in implementation.
