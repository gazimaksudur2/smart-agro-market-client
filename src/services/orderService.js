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
 * Compatible with backend POST /api/orders specification
 */

/**
 * Create a new order
 * Matches backend endpoint: POST /api/orders
 */
export const createOrder = async (orderData) => {
	try {
		// Validate required data before sending to backend
		if (!orderData.items || orderData.items.length === 0) {
			throw new Error("No items in order");
		}

		if (!orderData.shippingAddress || !orderData.shippingAddress.fullName) {
			throw new Error("Shipping address is required");
		}

		if (
			!orderData.paymentMethod ||
			!["cod", "online"].includes(orderData.paymentMethod)
		) {
			throw new Error("Valid payment method is required (cod or online)");
		}

		if (!orderData.userId || !orderData.userEmail) {
			throw new Error("User authentication required");
		}

		// Format request data to match backend expectations
		console.log(orderData);
		const requestData = {
			items: orderData.items.map((item) => ({
				productId: item.productId,
				name: item.name,
				price: item.price,
				quantity: item.quantity,
				unit: item.unit,
				image: item.image || "",
				sellerId: item.seller?.sellerId || "unknown_seller",
				sellerName: item.seller?.name || "Unknown Seller",
			})),
			shippingAddress: {
				fullName: orderData.shippingAddress.fullName,
				email: orderData.shippingAddress.email,
				phone: orderData.shippingAddress.phone,
				address: orderData.shippingAddress.address,
				city: orderData.shippingAddress.city,
				state: orderData.shippingAddress.state,
				zipCode: orderData.shippingAddress.zipCode,
			},
			paymentMethod: orderData.paymentMethod,
			paymentDetails: orderData.paymentDetails || {},
			notes: orderData.notes || "",
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
export const getSellerOrders = async (sellerId, params = {}) => {
	try {
		const queryParams = new URLSearchParams(params).toString();
		const response = await api.get(
			`/api/orders/seller/${sellerId}?${queryParams}`
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
		const response = await api.get(`/api/admin/orders?${queryParams}`);
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
