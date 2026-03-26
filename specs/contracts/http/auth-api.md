# HTTP Contract: auth-service

## Overview
Authentication APIs provided by auth-service.
All endpoints are routed through gateway-service.

---

## POST /api/auth/signup

Register a new user account.

**Auth required:** No

**Request**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response 201**
```json
{
  "userId": "string (UUID)",
  "email": "string",
  "name": "string",
  "createdAt": "string (ISO 8601)"
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing or invalid field |
| 409 | EMAIL_ALREADY_EXISTS | Email already registered |

---

## POST /api/auth/login

Authenticate and issue JWT tokens.

**Auth required:** No

**Request**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (opaque)",
  "expiresIn": 3600
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing field |
| 401 | INVALID_CREDENTIALS | Email or password incorrect |
| 429 | RATE_LIMIT_EXCEEDED | Too many login attempts |

---

## POST /api/auth/refresh

Issue a new access token using a valid refresh token.

**Auth required:** No

**Request**
```json
{
  "refreshToken": "string"
}
```

**Response 200**
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (opaque UUID, rotated)",
  "expiresIn": 3600
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing field |
| 401 | INVALID_REFRESH_TOKEN | Token not found or expired |
| 401 | REFRESH_TOKEN_REVOKED | Token has been revoked |

---

## POST /api/auth/logout

Revoke the current refresh token.

**Auth required:** Yes (Bearer JWT)

**Request**
```json
{
  "refreshToken": "string"
}
```

**Response 204**

No body.

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing field |
| 401 | UNAUTHORIZED | Invalid or missing access token |

---

## Token Rules

- Access token: JWT, signed with HS256 (HMAC-SHA256, secret key must be at least 32 bytes), TTL 1 hour
- Refresh token: opaque UUID, stored in Redis, TTL 30 days
- On refresh: a new refresh token is issued and the old one is immediately revoked (token rotation). Clients must replace the stored refresh token after every refresh call.
- Token rotation must be atomic: old token revocation and new token creation must happen in a single Redis operation (Lua script or transaction). If atomicity cannot be guaranteed, fail the request rather than leaving both tokens valid.
- Reuse detection: if a previously rotated (already consumed) refresh token is used, the server must reject the request with `REFRESH_TOKEN_REVOKED`. The server should not invalidate the user's current valid session on reuse detection (future enhancement may add this).
- Concurrent refresh: if two refresh requests arrive simultaneously with the same token, only the first to execute succeeds. The second receives `REFRESH_TOKEN_REVOKED`.
- On logout: refresh token is removed from Redis (immediate revocation)
- Expired access tokens must not be accepted by any service

---

## Error Response Format (common)

```json
{
  "code": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
```

## Notes
- Internal stack traces must not appear in error responses.
- Passwords must be hashed before storage; raw passwords must never be logged or returned.
- Refresh token rotation is mandatory on every refresh call (see Token Rules above).
