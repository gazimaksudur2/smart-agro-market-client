# Missing Cart and Order API Endpoints

## Overview
This document identifies the missing API endpoints that are essential for a complete cart and order functionality in the SmartAgro Connect agricultural marketplace. These endpoints complement the existing API documentation in `API_Cart_Order_Routes.md`.

---

## 🛒 Missing Cart API Endpoints

### GET /api/cart/items/details/:email
- **Purpose**: Get cart with full product details (name, image, description, availability)
- **Auth**: Required; email must match authenticated user or admin
- **URL params**:
  - `email` (string) – user's email
- **Response 200**:
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "productId": "64...",
        "price": 120,
        "quantity": 2,
        "addedAt": "2025-01-01T00:00:00.000Z",
        "totalPrice": 240,
        "product": {
          "name": "Organic Tomatoes",
          "image": "https://...",
          "unit": "kg",
          "minimumOrderQuantity": 10,
          "availability": "in-stock",
          "quality": "A",
          "description": "Fresh organic tomatoes",
          "seller": {
            "id": "seller123",
            "name": "Green Farm Ltd",
            "rating": 4.5,
            "location": "Dhaka"
          }
        }
      }
    ],
    "totalItems": 2,
    "subtotal": 240,
    "deliveryCharge": 50,
    "totalAmount": 290
  }
}
```

### POST /api/cart/validate
- **Purpose**: Validate cart items (check availability, price changes, minimum quantities)
- **Auth**: Required
- **Request body**:
```json
{
  "email": "user@example.com"
}
```
- **Response 200**:
```json
{
  "success": true,
  "validation": {
    "isValid": false,
    "issues": [
      {
        "productId": "64...",
        "type": "price_change",
        "oldPrice": 120,
        "newPrice": 130,
        "message": "Price has increased by ৳10"
      },
      {
        "productId": "65...",
        "type": "out_of_stock",
        "message": "Product is no longer available"
      },
      {
        "productId": "66...",
        "type": "quantity_below_minimum",
        "currentQuantity": 5,
        "minimumQuantity": 10,
        "message": "Quantity is below minimum order requirement"
      }
    ],
    "totalIssues": 3,
    "requiresAction": true
  }
}
```

### POST /api/cart/save-for-later
- **Purpose**: Move cart items to saved for later (wishlist-like functionality)
- **Auth**: Required
- **Request body**:
```json
{
  "email": "user@example.com",
  "productIds": ["64...", "65..."]
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "2 items moved to saved for later",
  "cart": { /* updated cart */ },
  "savedItems": { /* saved items */ }
}
```

### GET /api/cart/saved/:email
- **Purpose**: Get user's saved for later items
- **Auth**: Required
- **URL params**:
  - `email` (string) – user's email
- **Response 200**:
```json
{
  "success": true,
  "savedItems": [
    {
      "productId": "64...",
      "price": 120,
      "quantity": 2,
      "savedAt": "2025-01-01T00:00:00.000Z",
      "product": { /* full product details */ }
    }
  ],
  "totalSavedItems": 1
}
```

### POST /api/cart/restore-from-saved
- **Purpose**: Move saved items back to active cart
- **Auth**: Required
- **Request body**:
```json
{
  "email": "user@example.com",
  "productIds": ["64...", "65..."]
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "2 items restored to cart",
  "cart": { /* updated cart */ },
  "savedItems": { /* remaining saved items */ }
}
```

### GET /api/cart/summary/:email
- **Purpose**: Get cart summary with delivery estimates and pricing breakdown
- **Auth**: Required
- **URL params**:
  - `email` (string) – user's email
- **Query params**:
  - `deliveryArea` (string, optional) - for delivery charge calculation
- **Response 200**:
```json
{
  "success": true,
  "summary": {
    "itemCount": 3,
    "totalQuantity": 8,
    "subtotal": 480,
    "deliveryCharge": 100,
    "serviceCharge": 20,
    "discount": 0,
    "totalAmount": 600,
    "estimatedDelivery": "2-3 business days",
    "deliveryOptions": [
      {
        "type": "standard",
        "charge": 100,
        "duration": "2-3 days"
      },
      {
        "type": "express",
        "charge": 200,
        "duration": "1-2 days"
      }
    ],
    "breakdown": {
      "sellers": [
        {
          "sellerId": "seller1",
          "sellerName": "Green Farm",
          "itemCount": 2,
          "subtotal": 300
        }
      ]
    }
  }
}
```

---

## 📦 Missing Order API Endpoints

### GET /api/api/orders/statistics
- **Purpose**: Get order statistics for current user
- **Auth**: Required
- **Query params**:
  - `period` (string, optional) - "week", "month", "year", default "all"
- **Response 200**:
```json
{
  "success": true,
  "statistics": {
    "totalOrders": 25,
    "totalSpent": 12500,
    "averageOrderValue": 500,
    "ordersByStatus": {
      "pending": 2,
      "confirmed": 3,
      "processing": 1,
      "shipped": 5,
      "delivered": 14,
      "cancelled": 0
    },
    "recentActivity": [
      {
        "orderId": "67...",
        "orderNumber": "SAC-2025-001",
        "status": "delivered",
        "amount": 480,
        "date": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### PUT /api/api/orders/:orderId/cancel
- **Purpose**: Cancel an order (by customer)
- **Auth**: Required; must be order owner
- **URL params**:
  - `orderId` (string)
- **Request body**:
```json
{
  "reason": "Changed my mind",
  "note": "Optional additional note"
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": { /* updated order with cancelled status */ }
}
```

### POST /api/api/orders/:orderId/feedback
- **Purpose**: Submit feedback/rating for completed order
- **Auth**: Required; must be order owner
- **URL params**:
  - `orderId` (string)
- **Request body**:
```json
{
  "overallRating": 4,
  "productRatings": [
    {
      "productId": "64...",
      "rating": 5,
      "comment": "Excellent quality tomatoes"
    }
  ],
  "deliveryRating": 4,
  "sellerRatings": [
    {
      "sellerId": "seller1",
      "rating": 4,
      "comment": "Good communication"
    }
  ],
  "comments": "Overall satisfied with the order"
}
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedbackId": "feedback123"
}
```

### GET /api/api/orders/:orderId/tracking
- **Purpose**: Get detailed tracking information for an order
- **Auth**: Required; accessible by order owner, admin, or seller
- **URL params**:
  - `orderId` (string)
- **Response 200**:
```json
{
  "success": true,
  "tracking": {
    "orderId": "67...",
    "orderNumber": "SAC-2025-001",
    "currentStatus": "shipped",
    "estimatedDelivery": "2025-01-03T18:00:00.000Z",
    "trackingNumber": "TRK123456",
    "courierService": "Smart Delivery BD",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-01-01T10:00:00.000Z",
        "description": "Order placed",
        "location": "Dhaka"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-01-01T12:00:00.000Z",
        "description": "Order confirmed by seller",
        "location": "Green Farm, Savar"
      },
      {
        "status": "processing",
        "timestamp": "2025-01-02T08:00:00.000Z",
        "description": "Items being prepared",
        "location": "Green Farm, Savar"
      },
      {
        "status": "shipped",
        "timestamp": "2025-01-02T16:00:00.000Z",
        "description": "Order shipped",
        "location": "Savar Hub"
      }
    ],
    "deliveryAgent": {
      "name": "Karim Ahmed",
      "phone": "+8801711111111",
      "vehicleNumber": "DHA-1234"
    }
  }
}
```

### GET /api/api/orders/:orderId/invoice
- **Purpose**: Generate and download order invoice
- **Auth**: Required; accessible by order owner, admin, or seller
- **URL params**:
  - `orderId` (string)
- **Query params**:
  - `format` (string, optional) - "pdf", "json", default "json"
- **Response 200**:
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-SAC-2025-001",
    "orderNumber": "SAC-2025-001",
    "issueDate": "2025-01-01T00:00:00.000Z",
    "dueDate": "2025-01-01T00:00:00.000Z",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Street, Dhaka"
    },
    "items": [
      {
        "description": "Organic Tomatoes",
        "quantity": 2,
        "unit": "kg",
        "unitPrice": 120,
        "totalPrice": 240
      }
    ],
    "subtotal": 240,
    "deliveryCharge": 50,
    "totalAmount": 290,
    "paymentMethod": "cod",
    "paymentStatus": "pending"
  }
}
```

### POST /api/api/orders/:orderId/reorder
- **Purpose**: Create a new order based on a previous order
- **Auth**: Required; must be order owner
- **URL params**:
  - `orderId` (string)
- **Request body**:
```json
{
  "shippingDetails": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "address": "123 Street",
    "city": "Dhaka",
    "state": "Dhaka Division",
    "zip": "1000",
    "phone": "+8801..."
  },
  "paymentMethod": "cod",
  "notes": "Reordering previous items"
}
```
- **Response 201**:
```json
{
  "success": true,
  "message": "Reorder created successfully",
  "newOrder": { /* new order details */ },
  "warnings": [
    {
      "productId": "64...",
      "message": "Price has changed from ৳120 to ৳130"
    }
  ]
}
```

---

## 💳 Missing Payment API Endpoints

### POST /api/api/payments/create-intent
- **Purpose**: Create Stripe payment intent for order
- **Auth**: Required
- **Request body**:
```json
{
  "orderId": "67...",
  "amount": 29000,
  "currency": "bdt",
  "metadata": {
    "orderNumber": "SAC-2025-001",
    "customerEmail": "john@example.com"
  }
}
```
- **Response 200**:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 29000,
  "currency": "bdt"
}
```

### POST /api/api/payments/verify
- **Purpose**: Verify payment completion and update order
- **Auth**: Required
- **Request body**:
```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": "67..."
}
```
- **Response 200**:
```json
{
  "success": true,
  "paymentStatus": "succeeded",
  "order": { /* updated order with payment status */ },
  "transactionId": "txn_xxx"
}
```

### GET /api/api/payments/methods
- **Purpose**: Get available payment methods for user's region
- **Auth**: Required
- **Query params**:
  - `region` (string, optional) - user's region
- **Response 200**:
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "cod",
      "name": "Cash on Delivery",
      "description": "Pay when you receive your order",
      "available": true,
      "fee": 0,
      "minAmount": 0,
      "maxAmount": 50000
    },
    {
      "id": "bkash",
      "name": "bKash",
      "description": "Mobile financial service",
      "available": true,
      "fee": 15,
      "minAmount": 100,
      "maxAmount": 25000
    },
    {
      "id": "card",
      "name": "Credit/Debit Card",
      "description": "Visa, Mastercard, American Express",
      "available": true,
      "fee": 25,
      "minAmount": 100,
      "maxAmount": 100000
    }
  ]
}
```

---

## 🚚 Missing Delivery API Endpoints

### GET /api/delivery/areas
- **Purpose**: Get available delivery areas and charges
- **Auth**: Optional
- **Query params**:
  - `region` (string, optional) - filter by region
- **Response 200**:
```json
{
  "success": true,
  "deliveryAreas": [
    {
      "areaId": "dhaka-city",
      "name": "Dhaka City",
      "region": "Dhaka",
      "standardCharge": 80,
      "expressCharge": 150,
      "deliveryDays": {
        "standard": "2-3",
        "express": "1-2"
      },
      "availableServices": ["standard", "express"],
      "cutoffTime": "15:00"
    }
  ]
}
```

### POST /api/delivery/estimate
- **Purpose**: Calculate delivery cost and time for specific items and location
- **Auth**: Required
- **Request body**:
```json
{
  "items": [
    {
      "productId": "64...",
      "quantity": 2,
      "weight": 2.5,
      "sellerId": "seller1"
    }
  ],
  "deliveryArea": "dhaka-city",
  "deliveryType": "standard"
}
```
- **Response 200**:
```json
{
  "success": true,
  "estimate": {
    "totalWeight": 2.5,
    "deliveryCharge": 80,
    "estimatedDays": "2-3",
    "estimatedDelivery": "2025-01-04T18:00:00.000Z",
    "breakdown": [
      {
        "sellerId": "seller1",
        "sellerName": "Green Farm",
        "charge": 80,
        "estimatedDays": "2-3"
      }
    ]
  }
}
```

---

## 📊 Missing Analytics API Endpoints

### GET /api/api/orders/analytics/trends
- **Purpose**: Get order trends and patterns for admin/seller analytics
- **Auth**: Required; admin or seller
- **Query params**:
  - `period` (string) - "week", "month", "quarter", "year"
  - `sellerId` (string, optional) - filter by seller (for admin)
- **Response 200**:
```json
{
  "success": true,
  "trends": {
    "period": "month",
    "totalOrders": 150,
    "totalRevenue": 75000,
    "averageOrderValue": 500,
    "trends": [
      {
        "date": "2025-01-01",
        "orders": 12,
        "revenue": 6000
      }
    ],
    "topProducts": [
      {
        "productId": "64...",
        "name": "Organic Tomatoes",
        "orderCount": 45,
        "revenue": 5400
      }
    ],
    "customerInsights": {
      "newCustomers": 25,
      "returningCustomers": 85,
      "customerRetentionRate": 0.77
    }
  }
}
```

### GET /api/cart/analytics/abandonment
- **Purpose**: Get cart abandonment analytics for admin
- **Auth**: Required; admin only
- **Query params**:
  - `period` (string) - "week", "month", "quarter"
- **Response 200**:
```json
{
  "success": true,
  "abandonment": {
    "period": "month",
    "totalCarts": 500,
    "abandonedCarts": 200,
    "abandonmentRate": 0.4,
    "recoveredCarts": 25,
    "recoveryRate": 0.125,
    "commonReasons": [
      {
        "reason": "high_delivery_charge",
        "count": 80,
        "percentage": 0.4
      },
      {
        "reason": "price_change",
        "count": 60,
        "percentage": 0.3
      }
    ],
    "abandonmentByStage": {
      "cart_view": 100,
      "checkout_start": 70,
      "shipping_details": 30
    }
  }
}
```

---

## 🔔 Missing Notification API Endpoints

### POST /api/notifications/cart-reminder
- **Purpose**: Send cart abandonment reminder to user
- **Auth**: Required; admin or system
- **Request body**:
```json
{
  "email": "user@example.com",
  "reminderType": "abandoned_cart",
  "cartId": "cart123"
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Cart reminder sent successfully",
  "notificationId": "notif123"
}
```

### POST /api/notifications/order-status
- **Purpose**: Send order status update notification
- **Auth**: Required; admin, seller, or system
- **Request body**:
```json
{
  "orderId": "67...",
  "status": "shipped",
  "message": "Your order has been shipped and is on the way",
  "channels": ["email", "sms", "push"]
}
```
- **Response 200**:
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "sentChannels": ["email", "push"],
  "failedChannels": ["sms"]
}
```

---

## Summary of Missing Endpoints

### Cart APIs (8 missing):
1. `GET /api/cart/items/details/:email` - Cart with full product details
2. `POST /api/cart/validate` - Validate cart items
3. `POST /api/cart/save-for-later` - Save items for later
4. `GET /api/cart/saved/:email` - Get saved items
5. `POST /api/cart/restore-from-saved` - Restore saved items
6. `GET /api/cart/summary/:email` - Cart summary with delivery estimates
7. `GET /api/cart/analytics/abandonment` - Cart abandonment analytics
8. `POST /api/notifications/cart-reminder` - Cart reminder notifications

### Order APIs (8 missing):
1. `GET /api/api/orders/statistics` - Order statistics
2. `PUT /api/api/orders/:orderId/cancel` - Cancel order
3. `POST /api/api/orders/:orderId/feedback` - Submit feedback
4. `GET /api/api/orders/:orderId/tracking` - Tracking information
5. `GET /api/api/orders/:orderId/invoice` - Generate invoice
6. `POST /api/api/orders/:orderId/reorder` - Reorder functionality
7. `GET /api/api/orders/analytics/trends` - Order trends analytics
8. `POST /api/notifications/order-status` - Order status notifications

### Payment APIs (3 missing):
1. `POST /api/api/payments/create-intent` - Create payment intent
2. `POST /api/api/payments/verify` - Verify payment
3. `GET /api/api/payments/methods` - Available payment methods

### Delivery APIs (2 missing):
1. `GET /api/delivery/areas` - Available delivery areas
2. `POST /api/delivery/estimate` - Delivery cost estimation

## Total Missing Endpoints: 21

These endpoints would provide a complete, enterprise-grade cart and order management system suitable for an agricultural marketplace platform.
