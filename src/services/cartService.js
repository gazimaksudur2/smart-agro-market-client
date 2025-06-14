import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

// Use consistent token key across the application
const JWT_TOKEN_KEY = "JWT_TOKEN_KEY";

// Create axios instance for cart operations
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
					throw new Error("Authentication required. Please login again.");
				case 404:
					throw new Error(
						"Cart service not found. Please check API configuration."
					);
				case 400:
					throw new Error(data?.message || "Invalid request data.");
				default:
					throw new Error(data?.message || `Server error: ${status}`);
			}
		}

		throw new Error(error.message || "Network error occurred");
	}
);

/**
 * Get user's cart from database
 */
export const getCartFromDB = async (email) => {
	try {
		const response = await api.get(`/api/cart/${email}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Add single item to cart
 */
export const addItemToDB = async (email, item) => {
	try {
		const response = await api.post("/api/cart/add", {
			email,
			...item,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Add multiple items to cart (merges with existing items)
 */
export const addMultipleItemsToCart = async (email, items) => {
	try {
		const response = await api.post("/api/cart/add-multiple", {
			email,
			items,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Update cart item quantity
 */
export const updateCartItemInDB = async (email, productId, quantity) => {
	try {
		const response = await api.put("/api/cart/update", {
			email,
			productId,
			quantity,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Remove item from cart
 */
export const removeCartItemFromDB = async (email, productId) => {
	try {
		const response = await api.delete("/api/cart/remove", {
			data: { email, productId },
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Clear entire cart
 */
export const clearCartInDB = async (email) => {
	try {
		const response = await api.delete(`/api/cart/clear/${email}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Batch update multiple cart items
 */
export const batchUpdateCart = async (email, operations) => {
	try {
		const response = await api.post("/api/cart/batch-update", {
			email,
			operations,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Preview cart merge without saving
 */
export const previewCartMerge = async (email, newItems) => {
	try {
		const response = await api.post("/api/cart/preview-merge", {
			email,
			items: newItems,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get cart summary (totals, item count, etc.)
 */
export const getCartSummary = async (email) => {
	try {
		const response = await api.get(`/api/cart/${email}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Save entire cart to database (replaces existing cart)
 */
export const saveCartToDB = async (email, cartItems) => {
	try {
		const response = await api.post("/api/cart/add-multiple", {
			email,
			items: cartItems,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Client-side helper: Merge new items with existing cart items
 * This function handles the logic of combining items with same productId
 */
export const mergeCartItems = (existingItems, newItems) => {
	const mergedItems = [...existingItems];

	newItems.forEach((newItem) => {
		const existingIndex = mergedItems.findIndex(
			(item) => item.productId === newItem.productId
		);

		if (existingIndex >= 0) {
			// Item exists, add quantities
			mergedItems[existingIndex].quantity += newItem.quantity;
		} else {
			// New item, add to cart
			mergedItems.push(newItem);
		}
	});

	return mergedItems;
};

/**
 * Client-side helper: Calculate cart totals
 */
export const calculateCartTotals = (items) => {
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalAmount = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	return {
		totalItems,
		totalAmount,
		itemCount: items.length,
	};
};

// Default export for backward compatibility
const cartService = {
	getCartFromDB,
	addItemToDB,
	addMultipleItemsToCart,
	updateCartItemInDB,
	removeCartItemFromDB,
	clearCartInDB,
	batchUpdateCart,
	previewCartMerge,
	getCartSummary,
	saveCartToDB,
	mergeCartItems,
	calculateCartTotals,
};

export default cartService;
