# HTTP Contract: order-service

## Overview
Published HTTP API for order-service.
All endpoints are accessible through gateway-service only.
All endpoints require an authenticated user (Bearer token).

---

## Base Path
`/api/orders`

---

## Endpoints

### POST /api/orders
Place a new order.

**Request Body**
```json
{
  "items": [
    {
      "productId": "string (UUID)",
      "variantId": "string (UUID)",
      "productName": "string",
      "optionName": "string (optional)",
      "quantity": 2,
      "unitPrice": 15000
    }
  ],
  "shippingAddress": {
    "recipientName": "string",
    "phone": "string",
    "zipCode": "string",
    "address1": "string",
    "address2": "string | null"
  }
}
```

**Response 201**
```json
{
  "orderId": "string (UUID)"
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | INVALID_ORDER_REQUEST | Missing or invalid field |
| 401 | UNAUTHORIZED | Missing or invalid access token |

---

### GET /api/orders
List orders for the authenticated user.

**Query Parameters**
- `page` (default: 0) — page number
- `size` (default: 20) — page size
- `status` (optional) — filter by order status (one of: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

**Response 200**
```json
{
  "content": [
    {
      "orderId": "string (UUID)",
      "status": "PENDING",
      "totalPrice": 30000,
      "itemCount": 2,
      "createdAt": "string (ISO 8601)"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 401 | UNAUTHORIZED | Missing or invalid access token |

---

### GET /api/orders/{orderId}
Get order detail for the authenticated user.

**Response 200**
```json
{
  "orderId": "string (UUID)",
  "status": "PENDING",
  "totalPrice": 30000,
  "items": [
    {
      "productId": "string (UUID)",
      "variantId": "string (UUID)",
      "productName": "string",
      "optionName": "string",
      "quantity": 2,
      "unitPrice": 15000
    }
  ],
  "shippingAddress": {
    "recipientName": "string",
    "phone": "string",
    "zipCode": "string",
    "address1": "string",
    "address2": "string | null"
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 401 | UNAUTHORIZED | Missing or invalid access token |
| 403 | ACCESS_DENIED | Not the order owner |
| 404 | ORDER_NOT_FOUND | Order with given ID does not exist |

---

### POST /api/orders/{orderId}/cancel
Cancel an order. Only the order owner may cancel.

**Request Body**
```json
{}
```

**Response 200**
```json
{
  "orderId": "string (UUID)",
  "status": "CANCELLED"
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 401 | UNAUTHORIZED | Missing or invalid access token |
| 403 | ACCESS_DENIED | Not the order owner |
| 404 | ORDER_NOT_FOUND | Order with given ID does not exist |
| 422 | ORDER_CANNOT_BE_CANCELLED | Order status does not allow cancellation |

---

## Order Status Values

| Status | Description |
|---|---|
| `PENDING` | Order placed, awaiting confirmation |
| `CONFIRMED` | Order confirmed by system or admin |
| `SHIPPED` | Order shipped |
| `DELIVERED` | Order delivered |
| `CANCELLED` | Order cancelled |

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
- `userId` is extracted from the authentication token, not from the request body.
- An order may only be cancelled when its status is `PENDING` or `CONFIRMED`.
- Internal stack traces must not appear in error responses.
