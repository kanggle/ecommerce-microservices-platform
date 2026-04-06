---
name: design-api
description: Design a new HTTP API contract or modify an existing one
---

# design-api

Design a new HTTP API contract or modify an existing one.

## Usage

```
/design-api <description>                                  # design a new API contract
/design-api <modification> to <service>-api                # modify an existing contract
```

Examples:

```
/design-api product review API design
/design-api add profile image upload endpoint to user-api
```

## Procedure

1. Read `specs/platform/naming-conventions.md` (URL and field naming rules)
2. Read `specs/platform/error-handling.md` (error response format, status codes)
3. Read `specs/platform/api-gateway-policy.md` (public/authenticated routes, rate limits)
4. Read `specs/platform/versioning-policy.md` (breaking change criteria)
5. Read existing `specs/contracts/http/` contract files to understand current patterns
6. Read `specs/services/<service>/overview.md` for the related service (scope check)
7. Design the API contract following the format below
8. Write to `specs/contracts/http/<service>-api.md`
9. Update related feature/use-case specs if needed

## Contract Format

Per endpoint:
- Method + Path
- Description
- Auth required (yes/no)
- Request (Path Params, Query Params, Body)
- Response (success + errors)
- Status codes

## Standard Rules

- Pagination response: `{ content, page, size, totalElements }`
- Error response: `{ code, message, timestamp }`
- JSON fields: camelCase
- URL paths: kebab-case, plural nouns
- ID fields: `string (UUID)`, `{entityType}Id` format
- Public endpoints must be registered in `api-gateway-policy.md`
