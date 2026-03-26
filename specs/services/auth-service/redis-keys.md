# auth-service Redis Key Patterns

Defines Redis key naming patterns specific to auth-service.

General Redis key rules are defined in `specs/platform/naming-conventions.md`.

---

# Key Patterns

| Purpose | Pattern | Example |
|---|---|---|
| Refresh token storage | `refresh:{tokenValue}` | `refresh:a1b2c3d4-...` |
| Revoked token marker | `revoked:{tokenValue}` | `revoked:a1b2c3d4-...` |
| Access token blocklist | `blocklist:{tokenHash}` | `blocklist:sha256hex...` |
| User session set | `session:{userId}` | `session:550e8400-...` |
| User refresh token index | `user-tokens:{userId}` | `user-tokens:550e8400-...` |
| Blocked user marker | `blocked-user:{userId}` | `blocked-user:550e8400-...` |

---

# Rules

- All keys must have a TTL. Do not create keys without expiration.
- Refresh token TTL: 30 days.
- Revoked token marker TTL: must match the original refresh token's remaining TTL.
- Access token blocklist TTL: must match the original access token's remaining TTL.
- Session set TTL: aligned with refresh token TTL.
- User refresh token index TTL: aligned with refresh token TTL (save 시 갱신).
- Blocked user marker TTL: aligned with access token TTL.

---

# Change Rule

New key patterns for auth-service must be documented here before implementation.
