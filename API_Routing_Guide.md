## Smart Agro Connect – Cart API Documentation

Base path: `/api`

Authentication
- All endpoints require a valid session/JWT (sent via cookie or Authorization header).
- Authorization: Users may only access/modify their own cart unless they have the `admin` role.

Error format (all endpoints)
```json
{
  "success": false,
  "message": "Human-readable error",
  "error": "Optional technical details"
}
```

---

## Data Models (Effective Shapes)

Cart (persisted)
```json
{
  "userId": "string",
  "userEmail": "string",
  "items": [
    {
      "productId": "string",
      "price": 120,
      "quantity": 2,
      "addedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalItems": 2,
  "subtotal": 240,
  "deliveryCharge": 0,
  "totalAmount": 240,
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "lastUpdated": "ISODate"
}
```

Cart item in responses
```json
{
  "productId": "string",
  "price": 120,
  "quantity": 2,
  "addedAt": "ISODate",
  "totalPrice": 240 // derived = price * quantity
}
```

Notes
- The cart stores `productId`, `price`, and `quantity`. UI-facing fields (title, image, etc.) should be fetched separately from the Product API when rendering.
- Price sent by the client is accepted into the cart; final pricing for checkout is validated and derived from Product at order creation time.

---

## Endpoints

### GET /api/cart/:email
Retrieve a user's cart. If the cart does not exist, an empty one is created and returned.

Auth: required (user must match `:email` or be `admin`)

Path params
- `email` (string) – User's email address

Response 200
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": "65f...",
        "price": 120,
        "quantity": 2,
        "addedAt": "2025-01-01T00:00:00.000Z",
        "totalPrice": 240
      }
    ],
    "totalItems": 2,
    "subtotal": 240,
    "deliveryCharge": 0,
    "totalAmount": 240
  }
}
```

Possible errors
- 401 Unauthorized (email mismatch)

---

### POST /api/cart/add
Add a single item to the cart. If the product already exists in the cart, the quantity is incremented (merge behavior).

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "productId": "65f...", // or "_id"
  "price": 120,
  "quantity": 1
}
```

Response 200
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": { /* full cart object as in GET */ }
}
```

Validations
- `email` must match the authenticated user (or requester is admin)
- `productId` required
- `price` > 0
- `quantity` > 0

---

### POST /api/cart/add-multiple
Add multiple items in one request. Items with the same productId are merged by increasing quantity.

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "items": [
    { "productId": "65f...", "price": 120, "quantity": 2 },
    { "_id": "65a...", "price": 50, "quantity": 3 }
  ]
}
```

Response 200
```json
{
  "success": true,
  "message": "Items added to cart successfully (X new, Y merged)",
  "cart": { /* full cart */ }
}
```

Validations
- `email` must match requester
- `items` must be a non-empty array
- Each item must include `productId` (or `_id`), `price` > 0, `quantity` > 0

---

### PUT /api/cart/update
Update the quantity of a single product in the cart.

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "productId": "65f...",
  "quantity": 5
}
```

Response 200
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": { /* full cart */ }
}
```

Validations
- `quantity` must be > 0

---

### DELETE /api/cart/remove
Remove a single product from the cart.

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "productId": "65f..."
}
```

Response 200
```json
{
  "success": true,
  "message": "Item \"65f...\" removed from cart",
  "cart": { /* full cart */ }
}
```

---

### DELETE /api/cart/clear/:email
Remove all items from a user's cart.

Auth: required

Path params
- `email` (string)

Response 200
```json
{
  "success": true,
  "message": "Cart cleared successfully (N items removed)",
  "cart": { /* now-empty cart */ }
}
```

---

### POST /api/cart/batch-update
Perform multiple operations (add, update, remove) atomically. If any validation fails, no changes are applied.

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "operations": [
    { "type": "add", "item": { "productId": "65f...", "price": 120, "quantity": 1 } },
    { "type": "update", "productId": "65f...", "quantity": 3 },
    { "type": "remove", "productId": "65a..." }
  ]
}
```

Response 200
```json
{
  "success": true,
  "message": "Batch update completed successfully (3 operations processed)",
  "cart": { /* full cart */ },
  "operationResults": [
    "Added 65f... (qty: 1)",
    "Updated <productId>: 2 → 3",
    "Removed 65a..."
  ]
}
```

Validations
- Each operation is validated before processing; errors returned collectively.

---

### POST /api/cart/preview-merge
Preview how a set of items would merge into the current cart (no changes applied).

Auth: required

Request body
```json
{
  "email": "user@example.com",
  "newItems": [ { "productId": "65f...", "quantity": 2 }, { "_id": "65a...", "quantity": 1 } ]
}
```

Response 200
```json
{
  "success": true,
  "preview": {
    "currentItems": 3,
    "newItems": 2,
    "finalItems": 4,
    "mergedItems": 1,
    "totalQuantityIncrease": 3,
    "mergeDetails": [
      { "productId": "65f...", "action": "merge", "currentQuantity": 1, "addingQuantity": 2, "finalQuantity": 3 },
      { "productId": "65a...", "action": "add", "quantity": 1 }
    ]
  }
}
```

---

## Integration Notes (Frontend)

- Always send `email` matching the authenticated user for cart operations.
- Keep local product metadata (title, image) in the frontend store; the cart API returns just identifiers and numeric quantities.
- Treat cart prices as provisional; the final price used for payment is validated server-side against the Product when creating an order.
- Debounce frequent quantity updates to avoid excessive requests.


