# HTTP Contract: payment-service

## Overview
Published HTTP API for payment-service.
All endpoints are accessible through gateway-service only.
All endpoints require an authenticated user (Bearer token).

---

## Base Path
`/api/payments`

---

## Endpoints

### GET /api/payments/orders/{orderId}
Get payment information for a given order.
Only the payment owner (userId matching X-User-Id) may access.

**Request Headers**
- `X-User-Id: string` (required)

**Response 200**
```json
{
  "paymentId": "string (UUID)",
  "orderId": "string (UUID)",
  "userId": "string (UUID)",
  "amount": 30000,
  "status": "COMPLETED",
  "createdAt": "string (ISO 8601)",
  "paidAt": "string (ISO 8601)",
  "refundedAt": null
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | INVALID_PAYMENT_REQUEST | Missing or invalid field |
| 401 | UNAUTHORIZED | Missing or invalid access token |
| 403 | ACCESS_DENIED | Not the payment owner |
| 404 | PAYMENT_NOT_FOUND | Payment for given order does not exist |

---

## Payment Status Values

| Status | Description |
|---|---|
| `PENDING` | Payment initiated, processing not yet complete |
| `COMPLETED` | Payment successfully processed |
| `FAILED` | Payment processing failed |
| `REFUNDED` | Payment has been refunded |

---

## Error Response Format
```json
{
  "code": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
```

## Notes
- `userId` is extracted from the `X-User-Id` header, not from the request body.
- Internal stack traces must not appear in error responses.
