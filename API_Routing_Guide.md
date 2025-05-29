# Smart Agro Connect API Routing Guide

## Base Configuration

```javascript
const BASE_URL = 'http://localhost:5000'; // or your production URL
const API_CONFIG = {
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  }
};
```

## Authentication & Authorization

### Public Routes (No Auth Required)

#### User Registration
```javascript
POST /users/register
Body: {
  name: string,
  email: string,
  password: string,
  provider?: string, // 'local', 'google', 'facebook'
  role?: string, // 'consumer' (default)
  phoneNumber?: string,
  address?: string,
  firebaseUID?: string,
  profilePicture?: string
}
Response: {
  success: boolean,
  token: string,
  user: { id, name, email, role }
}
```

#### User Login
```javascript
POST /users/login
Body: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  token: string,
  user: { id, name, email, role }
}
```

#### User Logout
```javascript
POST /users/logout
Response: {
  success: boolean,
  message: string
}
```

#### Verify User Exists
```javascript
GET /users/verifyUser?email={email}
Response: {
  success: boolean,
  message: string
}
```

#### Get All Agents
```javascript
GET /users/agents
Response: {
  success: boolean,
  agents: Array<User>
}
```

#### Get Agent by Region
```javascript
GET /users/agents/{region}
Response: {
  success: boolean,
  agent: User
}
```

### Protected Routes (Auth Required)

#### Get User Profile
```javascript
GET /users/profile
Headers: { Authorization: 'Bearer {token}' } // or use cookies
Response: {
  success: boolean,
  user: User
}
```

#### Get User by Email
```javascript
GET /users/{email}
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  user: User
}
```

#### Update User Profile
```javascript
PATCH /users/{email}
Headers: { Authorization: 'Bearer {token}' }
Body: {
  name?: string,
  phoneNumber?: string,
  address?: string,
  profilePicture?: string
  // Note: password, email, firebaseUID, _id cannot be updated via this endpoint
}
Response: {
  success: boolean,
  message: string,
  user: User
}
```

### Admin Only Routes

#### Update User Role
```javascript
PATCH /users/role
Headers: { Authorization: 'Bearer {token}' }
Body: {
  userId: string,
  role: 'admin' | 'agent' | 'seller' | 'consumer'
}
Response: {
  success: boolean,
  user: User
}
```

## Application Management

### User Routes

#### Submit Application
```javascript
POST /applications
Headers: { Authorization: 'Bearer {token}' }
Body: {
  applicantId: string,
  applicantName: string,
  applicantEmail: string,
  applicantImg: string,
  applicationType: 'seller-application' | 'agent-application' | 'admin-application',
  formData: {
    // Flexible object based on application type
    // For seller: businessName, businessRegistration, etc.
    // For agent: experience, certifications, etc.
    // For admin: reason, qualifications, etc.
  },
  operationalArea: {
    region: string,
    district: string
  }
}
Response: {
  success: boolean,
  message: string,
  application: Application
}
```

#### Get My Applications
```javascript
GET /applications/my-applications
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  applications: Array<Application>
}
```

#### Get Application by ID
```javascript
GET /applications/{id}
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  application: Application
}
```

### Admin/Reviewer Routes

#### Get All Applications
```javascript
GET /applications?status={status}&type={type}&page={page}&limit={limit}
Headers: { Authorization: 'Bearer {token}' }
Query Parameters:
- status: 'pending' | 'approved' | 'rejected' | 'in-review' (optional)
- type: 'seller-application' | 'agent-application' | 'admin-application' (optional)
- page: number (default: 1)
- limit: number (default: 10)
Response: {
  success: boolean,
  applications: Array<Application>,
  totalPages: number,
  currentPage: number,
  totalApplications: number
}
```

#### Update Application Status
```javascript
PUT /applications/{id}/status
Headers: { Authorization: 'Bearer {token}' }
Body: {
  status: 'pending' | 'approved' | 'rejected' | 'in-review',
  reviewNotes?: string
}
Response: {
  success: boolean,
  message: string,
  application: Application
}
```

#### Add Application Note
```javascript
POST /applications/{id}/notes
Headers: { Authorization: 'Bearer {token}' }
Body: {
  noteText: string
}
Response: {
  success: boolean,
  message: string,
  application: Application
}
```

## Regional Data

#### Get All Regions
```javascript
GET /regions
Response: {
  success: boolean,
  regions: Array<{
    region: string,
    districts: Array<string>
  }>
}
```

#### Get Districts by Region
```javascript
GET /regions/{regionName}
Response: {
  success: boolean,
  districts: Array<string>
}
```

## Cart Management

#### Add Item to Cart
```javascript
POST /carts/add
Headers: { Authorization: 'Bearer {token}' }
Body: {
  productId: string,
  quantity: number,
  price: number
}
Response: {
  success: boolean,
  message: string,
  cart: Cart
}
```

#### Get User Cart
```javascript
GET /carts
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  cart: Cart
}
```

#### Update Cart Item
```javascript
PUT /carts/update
Headers: { Authorization: 'Bearer {token}' }
Body: {
  productId: string,
  quantity: number
}
Response: {
  success: boolean,
  message: string,
  cart: Cart
}
```

#### Remove Item from Cart
```javascript
DELETE /carts/remove/{productId}
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  message: string,
  cart: Cart
}
```

#### Clear Cart
```javascript
DELETE /carts/clear
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  message: string
}
```

## Payment Processing

#### Create Payment Intent
```javascript
POST /create-payment-intent
Headers: { Authorization: 'Bearer {token}' }
Body: {
  amount: number, // in cents
  currency?: string, // default: 'usd'
  metadata?: object
}
Response: {
  success: boolean,
  clientSecret: string,
  paymentIntentId: string
}
```

#### Verify Payment
```javascript
POST /verify-payment
Headers: { Authorization: 'Bearer {token}' }
Body: {
  paymentIntentId: string
}
Response: {
  success: boolean,
  message: string,
  paymentStatus: string
}
```

## Orders Management

#### Create Order
```javascript
POST /orders
Headers: { Authorization: 'Bearer {token}' }
Body: {
  items: Array<{
    productId: string,
    quantity: number,
    price: number
  }>,
  shippingAddress: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  paymentMethod: string,
  paymentIntentId?: string
}
Response: {
  success: boolean,
  message: string,
  order: Order
}
```

#### Get User Orders
```javascript
GET /orders
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  orders: Array<Order>
}
```

#### Get Order by ID
```javascript
GET /orders/{id}
Headers: { Authorization: 'Bearer {token}' }
Response: {
  success: boolean,
  order: Order
}
```

## Products Management

#### Get All Products
```javascript
GET /products?page={page}&limit={limit}&category={category}&search={search}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- category: string (optional)
- search: string (optional)
Response: {
  success: boolean,
  products: Array<Product>,
  totalPages: number,
  currentPage: number,
  totalProducts: number
}
```

#### Get Product by ID
```javascript
GET /products/{id}
Response: {
  success: boolean,
  product: Product
}
```

#### Create Product (Seller/Admin only)
```javascript
POST /products
Headers: { Authorization: 'Bearer {token}' }
Body: {
  name: string,
  description: string,
  price: number,
  category: string,
  images: Array<string>,
  inventory: number,
  unit: string
}
Response: {
  success: boolean,
  message: string,
  product: Product
}
```

## Error Handling

All API responses follow this error format:

```javascript
{
  success: false,
  message: string,
  error?: string // Only in development mode
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Authentication Implementation

### Using Axios (Recommended)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

// Add request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Examples

```javascript
// Login
const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
    throw error;
  }
};

// Submit Application
const submitApplication = async (applicationData) => {
  try {
    const response = await api.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    console.error('Application submission failed:', error.response?.data?.message);
    throw error;
  }
};

// Get Products
const getProducts = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/products?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response?.data?.message);
    throw error;
  }
};
```

## Important Notes

1. **Authentication**: The API uses JWT tokens stored in HTTP-only cookies for security. Make sure to set `withCredentials: true` in your HTTP client.

2. **CORS**: The server is configured to accept requests from specified origins. Update the CORS configuration if you're running the client on a different port.

3. **Rate Limiting**: Consider implementing rate limiting on the client side to avoid overwhelming the server.

4. **Error Handling**: Always implement proper error handling for network requests and API errors.

5. **Data Validation**: Validate data on the client side before sending to the API, but remember that server-side validation is the source of truth.

6. **File Uploads**: For file uploads (like profile pictures), use `multipart/form-data` content type.

7. **Real-time Updates**: Consider implementing WebSocket or Server-Sent Events for real-time application status updates. 