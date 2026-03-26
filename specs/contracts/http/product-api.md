# HTTP Contract: product-service

## Overview
Published HTTP API for product-service.
All endpoints are accessible through gateway-service only.
Public endpoints (`/api/products/**`) do not require authentication.
Admin endpoints (`/api/admin/products/**`) require an authenticated admin user (Bearer token, admin role).

---

## Base Path
`/api/products`

---

## Endpoints

### GET /api/products
List products with filtering and pagination.

**Query Parameters**
- `name` (optional) — filter by product name (partial match)
- `categoryId` (optional) — filter by category
- `status` (optional) — filter by status: `ON_SALE`, `SOLD_OUT`, `HIDDEN`
- `page` (default: 0) — page number
- `size` (default: 20) — page size

**Response 200**
```json
{
  "content": [
    {
      "productId": "string (UUID)",
      "name": "string",
      "status": "ON_SALE",
      "price": 10000,
      "thumbnailUrl": "string",
      "categoryId": "string (UUID)"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 100
}
```

---

### GET /api/products/{productId}
Get product detail including variants.

**Response 200**
```json
{
  "productId": "string (UUID)",
  "name": "string",
  "description": "string",
  "status": "ON_SALE",
  "price": 10000,
  "categoryId": "string (UUID)",
  "variants": [
    {
      "variantId": "string (UUID)",
      "optionName": "string",
      "stock": 100,
      "additionalPrice": 0
    }
  ]
}
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Product with given ID does not exist |

---

### POST /api/admin/products
Register a new product. Requires admin role.

**Request Body**
```json
{
  "name": "string",
  "description": "string",
  "price": 10000,
  "categoryId": "string (UUID)",
  "variants": [
    {
      "optionName": "string",
      "stock": 100,
      "additionalPrice": 0
    }
  ]
}
```

**Response 201**
```json
{ "productId": "string (UUID)" }
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing or invalid field |
| 400 | INVALID_CATEGORY | Category with given ID does not exist |
| 403 | ACCESS_DENIED | Admin role required |

---

### PATCH /api/admin/products/{productId}
Update product information. Requires admin role.

**Request Body** (partial update)
```json
{
  "name": "string",
  "description": "string",
  "price": 10000,
  "status": "ON_SALE"
}
```

**Response 200**
```json
{ "productId": "string (UUID)" }
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing or invalid field |
| 403 | ACCESS_DENIED | Admin role required |
| 404 | PRODUCT_NOT_FOUND | Product with given ID does not exist |
| 409 | CONFLICT | Optimistic locking conflict |

---

### PATCH /api/admin/products/{productId}/stock
Adjust inventory stock. Requires admin role.

**Request Body**
```json
{
  "variantId": "string (UUID)",
  "quantity": 50,
  "reason": "RESTOCK | ORDER_RESERVED | ORDER_CANCELLED | ADMIN_ADJUSTMENT"
}
```

**Response 200**
```json
{ "variantId": "string (UUID)", "currentStock": 150 }
```

**Error responses**
| Status | Code | Reason |
|---|---|---|
| 400 | VALIDATION_ERROR | Missing or invalid field |
| 400 | INSUFFICIENT_STOCK | Stock adjustment would result in negative stock |
| 403 | ACCESS_DENIED | Admin role required |
| 404 | PRODUCT_NOT_FOUND | Product with given ID does not exist |
| 404 | VARIANT_NOT_FOUND | Variant with given ID does not exist |

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
- Internal stack traces must not appear in error responses.
- Stock adjustment publishes a `StockChanged` event regardless of the direction (increase or decrease).
