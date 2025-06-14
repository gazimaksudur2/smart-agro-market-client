# Smart Agro Connect - Server Documentation

## 📋 Project Overview

Smart Agro Connect is an agricultural marketplace platform that connects farmers, sellers, agents, and consumers. The server provides RESTful APIs for user management, product management, order processing, and application handling.

## 🗄️ Database Models

### User Model (`models/User.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (optional for OAuth),
  provider: Enum ['email-pass', 'google', 'facebook'],
  role: Enum ['admin', 'agent', 'seller', 'consumer'],
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String (default: 'Bangladesh')
  },
  profilePicture: String,
  region: String (required for agents),
  verified: Boolean,
  warehouseAddress: String (required for agents),
  isActive: Boolean (default: true),
  firebaseUID: String,
  operationalArea: {
    region: String,
    district: String
  },
  suspensionReason: String,
  suspendedAt: Date,
  suspendedBy: ObjectId (ref: User),
  lastLoginAt: Date,
  loginCount: Number (default: 0),
  totalOrders: Number (default: 0),
  totalSpent: Number (default: 0),
  totalRevenue: Number (default: 0),
  managedSellers: Number (default: 0),
  commissionEarned: Number (default: 0),
  performanceRating: Number (default: 0),
  createdBy: ObjectId (ref: User),
  lastUpdatedBy: ObjectId (ref: User)
}
```

### Application Model (`models/applicationModel.js`)
```javascript
{
  applicantId: String (ref: User),
  applicantName: String,
  applicantEmail: String,
  applicantImg: String,
  applicationType: Enum ['seller-application', 'agent-application', 'admin-application'],
  status: Enum ['pending', 'approved', 'rejected', 'in-review'],
  formData: Mixed (flexible structure),
  operationalArea: {
    region: String,
    district: String
  },
  reviewedAt: Date,
  reviewedBy: String (ref: User),
  reviewNotes: String
}
```

### Cart Model (`models/Cart.js`)
```javascript
{
  email: String (unique),
  items: [{
    _id: String,
    title: String,
    price: Number,
    unit: String,
    minimumOrderQuantity: Number,
    image: String,
    quantity: Number,
    seller: {
      sellerId: String,
      sellerName: String,
      sellerEmail: String
    }
  }],
  totalItems: Number (auto-calculated),
  subtotal: Number (auto-calculated),
  deliveryCharge: Number (auto-calculated),
  totalAmount: Number (auto-calculated)
}
```

### Order Model (`models/Order.js`)
```javascript
{
  orderNumber: String (unique),
  userId: String (Firebase UID),
  items: [{
    productId: String,
    title: String,
    quantity: Number,
    price: Number,
    totalPrice: Number,
    sellerId: String
  }],
  deliveryDetails: {
    region: String,
    district: String,
    address: String,
    phone: String,
    orderNote: String,
    totalAmount: Number
  },
  totalAmount: Number,
  advancePaymentAmount: Number,
  paymentIntentId: String,
  status: Enum ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  adminNotes: String,
  lastUpdatedBy: ObjectId (ref: User),
  assignedAgent: ObjectId (ref: User),
  agentCommission: Number,
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: ObjectId (ref: User),
    notes: String
  }],
  disputeStatus: String,
  disputeReason: String,
  disputeRaisedAt: Date,
  disputeResolvedAt: Date,
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingNumber: String
}
```

### Product Model (`models/Product.js`)
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  sellerId: ObjectId (ref: User),
  quantity: Number,
  unit: String,
  status: Enum ['pending', 'approved', 'rejected'],
  region: String,
  minimumOrder: Number,
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  rejectedBy: ObjectId (ref: User),
  rejectedAt: Date,
  rejectionReason: String,
  totalOrders: Number (default: 0),
  totalSold: Number (default: 0),
  totalRevenue: Number (default: 0),
  viewCount: Number (default: 0),
  tags: [String],
  featured: Boolean (default: false),
  assignedAgent: ObjectId (ref: User),
  agentCommission: Number
}
```

### Review Model (`models/Review.js`)
```javascript
{
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  helpful: Number (default: 0)
}
```

### Agent Model (`models/Agent.js`)
```javascript
{
  userId: ObjectId (ref: User),
  region: String,
  district: String,
  warehouseAddress: String,
  commissionRate: Number,
  performanceRating: Number,
  totalOrders: Number,
  isActive: Boolean
}
```

## 🛣️ API Routes

### Authentication Routes (`/users`)
```
POST   /users/register          # Register new user
POST   /users/login             # User login
POST   /users/logout            # User logout
GET    /users/verifyUser        # Check if user exists
GET    /users/profile           # Get user profile (protected)
GET    /users/:email            # Get user by email (protected)
PATCH  /users/:email            # Update user profile (protected)
PATCH  /users/updatePassword/:email # Update password (protected)
GET    /users/agents            # Get all agents
GET    /users/agents/:region    # Get agent by region
```

### Admin Routes (`/admin`)
```
PATCH  /admin/users/role        # Update user role (admin only)
GET    /admin/applications      # Get all applications (admin only)
PUT    /admin/applications/:id/status # Update application status (admin only)
POST   /admin/applications/:id/notes  # Add application note (admin only)
GET    /admin/agents            # Get all agents (admin only)
GET    /admin/users?page={page}&limit={limit}&role={role}&status={status}&search={search}
GET    /admin/users/:userId
PUT    /admin/users/:userId
PATCH  /admin/users/:userId/activate
PATCH  /admin/users/:userId/suspend
PATCH  /admin/users/:userId/delete
GET    /admin/products?page={page}&limit={limit}&category={category}&status={status}&search={search}
PATCH  /admin/products/:productId/approve
PATCH  /admin/products/:productId/reject
PATCH  /admin/products/:productId/suspend
PATCH  /admin/products/bulk-action
GET    /admin/orders?page={page}&limit={limit}&status={status}&search={search}&dateFrom={date}&dateTo={date}
PATCH  /admin/orders/:orderId/status
GET    /admin/orders/:orderId
GET    /admin/analytics?range={timeRange}
GET    /admin/dashboard-stats
GET    /admin/agent-applications?page={page}&limit={limit}&status={status}&region={region}
PATCH  /admin/agent-applications/:applicationId/approve
PATCH  /admin/agent-applications/:applicationId/reject
GET    /admin/agents?page={page}&limit={limit}&region={region}&status={status}
PATCH  /admin/agents/:agentId/suspend
PATCH  /admin/agents/:agentId/activate
GET    /admin/system/config
PUT    /admin/system/config
GET    /admin/settings/categories
POST   /admin/settings/categories
PUT    /admin/settings/categories/:categoryId
DELETE /admin/settings/categories/:categoryId
```

### Application Routes (`/applications`)
```
POST   /applications            # Submit new application (protected)
GET    /applications/my-applications # Get user's applications (protected)
GET    /applications/:id        # Get application by ID (protected)
```

### Product Routes (`/products`)
```
GET    /products               # Get all products (with pagination)
GET    /products/:id           # Get product by ID
POST   /products               # Create product (seller/admin only)
PUT    /products/:id           # Update product (seller/admin only)
DELETE /products/:id           # Delete product (seller/admin only)
```

### Order Routes (`/orders`)
```
POST   /orders                 # Create new order (protected)
GET    /orders                 # Get user orders (protected)
GET    /orders/:id             # Get order by ID (protected)
PUT    /orders/:id/status      # Update order status (protected)
DELETE /orders/:id             # Cancel order (protected)
```

### Cart Routes (`/carts`)
```
GET    /carts/:email           # Get user cart (protected)
POST   /carts                  # Save/update cart (protected)
PUT    /carts/:email/items/:itemId # Update cart item quantity (protected)
DELETE /carts/:email/items/:itemId # Remove cart item (protected)
DELETE /carts/:email           # Clear user cart (protected)
```

### Payment Routes (`/`)
```
POST   /create-payment-intent  # Create Stripe payment intent (protected)
```

### Region Routes (`/regions`)
```
GET    /regions                # Get all regions and districts
```

### Review Routes (`/reviews`)
```
GET    /reviews                # Get all reviews
GET    /reviews/:productId     # Get reviews for product
POST   /reviews                # Create review (protected)
PUT    /reviews/:id            # Update review (protected)
DELETE /reviews/:id            # Delete review (protected)
```

### Agent Routes (`/agents`)
```
GET    /agents                 # Get all agents
GET    /agents/:id             # Get agent by ID
POST   /agents                 # Create agent profile (protected)
PUT    /agents/:id             # Update agent profile (protected)
```

## 🔐 Middleware

### Authentication Middleware (`middleware/auth.js`)
- `verifyJWT`: Validates JWT token from cookies or headers
- `verifyRole(roles)`: Checks user role authorization
- `verifyUserEmail`: Ensures user can only access their own data
- `generateJWT(user)`: Creates JWT token
- `getCookieOptions()`: Returns secure cookie configuration

### Error Handler (`middleware/errorHandler.js`)
- Centralized error handling for all routes
- Returns consistent error response format

## ⚙️ Configuration

### Environment Variables (`.env`)
```bash
# Database
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
DB_USER=your_db_user
DB_PASS=your_db_password
DB_CLUSTER=your_cluster_name.mongodb.net

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development

# Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Firebase (optional)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Database Configuration (`config/db.js`)
- MongoDB connection using Mongoose
- Connection string fallback options
- Error handling for database connectivity

### CORS Configuration
```javascript
{
  origin: [
    "*",
    "https://smartagroconnect-79578.web.app",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://smart-agro-connect-server.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}
```

## 🚀 Quick Setup Guide

### 1. Installation
```bash
# Clone repository
git clone <repository-url>
cd smart-agro-connect-server

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Create .env file
cp .env.example .env

# Edit .env with your configurations
nano .env
```

### 3. Database Setup
```bash
# Ensure MongoDB is running locally or update DB_URI for cloud
# Database will be created automatically on first connection
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Test API
```bash
# Base endpoint
curl http://localhost:5000

# Health check
curl http://localhost:5000/users/agents
```

## 🛡️ Security Features

### Authentication
- JWT tokens with secure HTTP-only cookies
- Token expiration (24 hours)
- Role-based access control (RBAC)
- Email-based user verification

### Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment variable security

### API Security
- Protected routes with middleware
- User data access restrictions
- Admin-only endpoints
- Request rate limiting ready

## 📊 API Response Format

### Success Response
```javascript
{
  success: true,
  message?: string,
  data: {
    users?: User[],
    products?: Product[],
    orders?: Order[],
    analytics?: AnalyticsData,
    pagination?: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    },
    statistics?: {
      total: number,
      active: number,
      suspended: number
    }
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: string,
  error?: string,
  code?: string
}
```

## 🔄 Common Workflows

### User Registration & Login
1. `POST /users/register` → Creates user + returns JWT
2. JWT stored in HTTP-only cookie
3. Subsequent requests authenticated via cookie

### Application Process
1. User submits application: `POST /applications`
2. Admin reviews: `GET /admin/applications`
3. Admin approves/rejects: `PUT /admin/applications/:id/status`
4. User role updated automatically on approval

### Order Process
1. User adds items to cart: `POST /carts`
2. Creates payment intent: `POST /create-payment-intent`
3. Places order: `POST /orders`
4. Tracks order status: `GET /orders/:id`

## 🐛 Debugging

### Common Issues
1. **MongoDB Connection**: Check DB_URI and network access
2. **JWT Issues**: Verify JWT_SECRET and cookie settings
3. **CORS Errors**: Update allowed origins in CORS config
4. **Port Conflicts**: Change PORT in .env file

### Logs
- Server logs include request details
- Database connection status
- Authentication failures
- Error stack traces (development only)

## 📝 Additional Notes

- All timestamps use UTC
- File uploads require separate implementation
- Real-time features require WebSocket setup
- API versioning not implemented (can be added via `/api/v1/`)
- Rate limiting not implemented (recommended for production) 
