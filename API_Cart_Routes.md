# Cart API Routes Documentation

## Base URL: `/api/cart`

### 1. **GET /api/cart/:email** - Get User Cart
**Purpose**: Retrieve complete cart data for a user

**Route**: `GET /api/cart/:email`
**Params**: 
- `email` (string) - User's email address

**Query**: None
**Body**: None

**Expected Response**:
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "_id": "product_id",
        "title": "Product Name",
        "price": 100,
        "quantity": 2,
        "unit": "kg",
        "image": "image_url",
        "minimumOrderQuantity": 1,
        "seller": {
          "sellerId": "seller_id",
          "name": "Seller Name"
        },
        "category": "Category Name"
      }
    ],
    "totalItems": 2,
    "subtotal": 200,
    "deliveryCharge": 0,
    "totalAmount": 200
  }
}
```

### 2. **POST /api/cart/add** - Add Single Item
**Purpose**: Add a single item to cart (merge if exists)

**Route**: `POST /api/cart/add`
**Params**: None
**Query**: None

**Body**:
```json
{
  "email": "user@example.com",
  "_id": "product_id",
  "title": "Product Name",
  "price": 100,
  "quantity": 1,
  "unit": "kg",
  "image": "image_url",
  "minimumOrderQuantity": 1,
  "category": "Category",
  "seller": {
    "sellerId": "seller_id",
    "name": "Seller Name"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "items": [...],
    "totalItems": 3,
    "totalAmount": 300
  }
}
```

### 3. **POST /api/cart/add-multiple** - Add Multiple Items
**Purpose**: Add multiple items to cart at once

**Route**: `POST /api/cart/add-multiple`
**Params**: None
**Query**: None

**Body**:
```json
{
  "email": "user@example.com",
  "items": [
    {
      "_id": "product_id_1",
      "title": "Product 1",
      "price": 100,
      "quantity": 2,
      "unit": "kg",
      "image": "image_url",
      "category": "Category",
      "seller": {
        "sellerId": "seller_id",
        "name": "Seller Name"
      }
    }
  ]
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Items added to cart successfully",
  "cart": {
    "items": [...],
    "totalItems": 5,
    "totalAmount": 500
  }
}
```

### 4. **PUT /api/cart/update** - Update Item Quantity
**Purpose**: Update quantity of existing cart item

**Route**: `PUT /api/cart/update`
**Params**: None
**Query**: None

**Body**:
```json
{
  "email": "user@example.com",
  "productId": "product_id",
  "quantity": 5
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {
    "items": [...],
    "totalItems": 8,
    "totalAmount": 800
  }
}
```

### 5. **DELETE /api/cart/remove** - Remove Single Item
**Purpose**: Remove a specific item from cart

**Route**: `DELETE /api/cart/remove`
**Params**: None
**Query**: None

**Body**:
```json
{
  "email": "user@example.com",
  "productId": "product_id"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {
    "items": [...],
    "totalItems": 5,
    "totalAmount": 500
  }
}
```

### 6. **DELETE /api/cart/clear/:email** - Clear Entire Cart
**Purpose**: Remove all items from user's cart

**Route**: `DELETE /api/cart/clear/:email`
**Params**: 
- `email` (string) - User's email address

**Query**: None
**Body**: None

**Expected Response**:
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "items": [],
    "totalItems": 0,
    "totalAmount": 0
  }
}
```

### 7. **POST /api/cart/batch-update** - Batch Update Multiple Items
**Purpose**: Update multiple items in a single request

**Route**: `POST /api/cart/batch-update`
**Params**: None
**Query**: None

**Body**:
```json
{
  "email": "user@example.com",
  "operations": [
    {
      "type": "update",
      "productId": "product_id_1",
      "quantity": 3
    },
    {
      "type": "remove",
      "productId": "product_id_2"
    },
    {
      "type": "add",
      "item": {
        "_id": "product_id_3",
        "title": "New Product",
        "price": 150,
        "quantity": 1
      }
    }
  ]
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {
    "items": [...],
    "totalItems": 4,
    "totalAmount": 600
  }
}
```

## Cart Logic Rules

### **Merge Logic**:
1. If item exists in cart → Add quantities together
2. If item doesn't exist → Add as new item
3. Respect minimum order quantities
4. Update totals automatically

### **Validation Rules**:
1. Quantity must be > 0
2. Price must be > 0
3. Product ID must be valid
4. User email must be authenticated

### **Error Responses**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```
