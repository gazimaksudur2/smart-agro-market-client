import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

// Use consistent token key across the application
const JWT_TOKEN_KEY = "JWT_TOKEN_KEY";

// Create axios instance for order operations
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(JWT_TOKEN_KEY);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.code === "ECONNREFUSED") {
			throw new Error(
				"Backend server is not running. Please start the server."
			);
		}

		if (error.response) {
			const { status, data } = error.response;
			switch (status) {
				case 401:
					throw new Error(data?.message || "Access denied - Invalid token");
				case 400:
					throw new Error(data?.message || "Invalid order data");
				case 404:
					throw new Error(data?.message || "Order service not found");
				case 500:
					throw new Error(data?.message || "Server error occurred");
				default:
					throw new Error(data?.message || `Server error: ${status}`);
			}
		}

		throw new Error(error.message || "Network error occurred");
	}
);

/**
 * Order Service - Handles all order-related API calls
 * Compatible with backend POST /api/api/orders specification
 */

/**
 * Create a new order
 * Matches backend endpoint: POST /api/api/orders
 */
export const createOrder = async (orderData) => {
	try {
		// Validate required data before sending to backend
		if (!orderData.items || orderData.items.length === 0) {
			throw new Error("No items in order");
		}

		// Validate each item has required fields
		orderData.items.forEach((item, index) => {
			if (!item.productId) {
				throw new Error(`Item ${index + 1}: Product ID is required`);
			}
			if (!item.quantity || item.quantity < 1) {
				throw new Error(`Item ${index + 1}: Quantity must be at least 1`);
			}
			if (!item.price || item.price < 0) {
				throw new Error(`Item ${index + 1}: Valid price is required`);
			}
		});

		// Validate shipping details (required fields according to schema)
		if (!orderData.shippingAddress || !orderData.shippingAddress.fullName) {
			throw new Error("Shipping address with full name is required");
		}
		if (!orderData.shippingAddress.email) {
			throw new Error("Shipping email is required");
		}

		// Validate payment method
		if (
			!orderData.paymentMethod ||
			!["cod", "online"].includes(orderData.paymentMethod)
		) {
			throw new Error("Valid payment method is required (cod or online)");
		}

		if (!orderData.userEmail) {
			throw new Error("User authentication required");
		}

		// Calculate totals
		const subtotal = orderData.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		const shippingCost = orderData.shippingCost || 0;
		const totalAmount = subtotal + shippingCost;

		// Format request data to match backend expectations (API spec format)
		const requestData = {
			items: orderData.items.map((item) => ({
				productId: item.productId,
				quantity: Number(item.quantity),
				price: Number(item.price),
				sellerId: item.sellerId || null, // Optional field
				totalPrice: Number(item.price) * Number(item.quantity),
			})),
			subtotal: Number(subtotal),
			shippingCost: Number(shippingCost),
			totalAmount: Number(totalAmount),
			shippingDetails: {
				fullName: orderData.shippingAddress.fullName,
				email: orderData.shippingAddress.email,
				address: orderData.shippingAddress.address || "",
				city: orderData.shippingAddress.city || "",
				state: orderData.shippingAddress.state || "",
				zip: orderData.shippingAddress.zipCode || "",
				phone: orderData.shippingAddress.phone || "",
			},
			paymentMethod: orderData.paymentMethod,
			paymentDetails: {
				transactionId: orderData.paymentDetails?.transactionId || null,
				cardType: orderData.paymentDetails?.cardType || null,
				last4: orderData.paymentDetails?.last4 || null,
				paymentDate: orderData.paymentDetails?.paymentDate || null,
			},
			notes: orderData.notes || "",
			userEmail: orderData.userEmail,
		};
		const response = await api.post("/api/orders", requestData);
		return response.data;
	} catch (error) {
		// Handle specific backend error messages
		if (error.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw error;
	}
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId, params = {}) => {
	try {
		const queryParams = new URLSearchParams(params).toString();
		const response = await api.get(`/api/orders/user/${userId}?${queryParams}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get specific order by ID
 */
export const getOrderById = async (orderId) => {
	try {
		const response = await api.get(`/api/orders/${orderId}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status, notes = null) => {
	try {
		const response = await api.put(`/api/orders/${orderId}/status`, {
			status,
			notes,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get seller orders
 */
export const getSellerOrders = async (sellerEmailOrId, params = {}) => {
	try {
		const queryParams = new URLSearchParams(params).toString();
		// v2.0 docs use seller email as path param; still works with legacy id
		const identifier = encodeURIComponent(sellerEmailOrId);
		const response = await api.get(
			`/api/orders/seller/${identifier}?${queryParams}`
		);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get all orders (admin)
 */
export const getAllOrders = async (params = {}) => {
	try {
		const queryParams = new URLSearchParams(params).toString();
		const response = await api.get(`/api/orders/admin/all?${queryParams}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason = null) => {
	try {
		const response = await api.put(`/api/orders/${orderId}/cancel`, {
			reason,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get order statistics
 */
export const getOrderStats = async (userId = null, sellerId = null) => {
	try {
		const params = {};
		if (userId) params.userId = userId;
		if (sellerId) params.sellerId = sellerId;

		const queryParams = new URLSearchParams(params).toString();
		const response = await api.get(`/api/orders/stats?${queryParams}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

// Default export for backward compatibility
const orderService = {
	createOrder,
	getUserOrders,
	getOrderById,
	updateOrderStatus,
	getSellerOrders,
	getAllOrders,
	cancelOrder,
	getOrderStats,
};

export default orderService;
