import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

/**
 * Cart service to handle database operations only
 */
const cartService = {
	/**
	 * Get cart from database for authenticated user
	 */
	getCartFromDB: async (email) => {
		if (!email) {
			throw new Error("Email is required to fetch cart from database");
		}

		try {
			const response = await axios.get(`${API_BASE_URL}/api/cart/${email}`, {
				withCredentials: true,
			});
			return response.data.cart || { items: [] };
		} catch (error) {
			console.error("Error getting cart from database:", error);
			// Return empty cart if not found (404) instead of throwing error
			if (error.response?.status === 404) {
				return {
					items: [],
					totalItems: 0,
					subtotal: 0,
					deliveryCharge: 0,
					totalAmount: 0,
				};
			}
			throw new Error(
				error.response?.data?.message || "Failed to fetch cart from database"
			);
		}
	},

	/**
	 * Save cart to database for authenticated user
	 */
	saveCartToDB: async (email, cartData) => {
		if (!email) {
			throw new Error("Email is required to save cart to database");
		}

		if (!cartData || !Array.isArray(cartData.items)) {
			throw new Error("Invalid cart data");
		}

		// Validate all items before saving
		cartData.items.forEach((item) => cartService.validateCartItem(item));

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/cart/add-multiple`,
				{
					email,
					items: cartData.items,
				},
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error saving cart to database:", error);
			throw new Error(
				error.response?.data?.message || "Failed to save cart to database"
			);
		}
	},

	/**
	 * Add multiple items to cart (merges with existing items)
	 */
	addMultipleItemsToCart: async (email, items) => {
		if (!email) {
			throw new Error("Email is required to add items to cart");
		}

		if (!Array.isArray(items) || items.length === 0) {
			throw new Error("Items array is required and cannot be empty");
		}

		// Validate all items before adding
		items.forEach((item, index) => {
			try {
				cartService.validateCartItem(item);
			} catch (error) {
				throw new Error(`Invalid item at index ${index}: ${error.message}`);
			}
		});

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/cart/add-multiple`,
				{ email, items },
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error adding multiple items to cart:", error);
			throw new Error(
				error.response?.data?.message || "Failed to add items to cart"
			);
		}
	},

	/**
	 * Batch update cart items (multiple operations in one request)
	 */
	batchUpdateCart: async (email, operations) => {
		if (!email) {
			throw new Error("Email is required for batch cart update");
		}

		if (!Array.isArray(operations) || operations.length === 0) {
			throw new Error("Operations array is required for batch update");
		}

		// Validate operations
		operations.forEach((op, index) => {
			if (!op.type || !op.itemId) {
				throw new Error(
					`Invalid operation at index ${index}: type and itemId are required`
				);
			}
			if (
				op.type === "update" &&
				(typeof op.quantity !== "number" || op.quantity < 0)
			) {
				throw new Error(
					`Invalid operation at index ${index}: quantity must be a non-negative number`
				);
			}
		});

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/cart/batch-update`,
				{ email, operations },
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error batch updating cart:", error);
			throw new Error(
				error.response?.data?.message || "Failed to batch update cart"
			);
		}
	},

	/**
	 * Add single item to cart in database (merges with existing)
	 */
	addItemToDB: async (email, item) => {
		if (!email) {
			throw new Error("Email is required to add item to cart");
		}

		cartService.validateCartItem(item);

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/cart/add`,
				{
					email,
					productId: item._id || item.productId,
					quantity: item.quantity,
				},
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error adding item to cart:", error);
			throw new Error(
				error.response?.data?.message || "Failed to add item to cart"
			);
		}
	},

	/**
	 * Update cart item in database
	 */
	updateCartItemInDB: async (email, itemId, quantity) => {
		if (!email || !itemId) {
			throw new Error("Email and item ID are required");
		}

		if (typeof quantity !== "number" || quantity < 0) {
			throw new Error("Quantity must be a non-negative number");
		}

		try {
			const response = await axios.put(
				`${API_BASE_URL}/api/cart/update`,
				{ email, productId: itemId, quantity },
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error updating cart item:", error);
			throw new Error(
				error.response?.data?.message || "Failed to update cart item"
			);
		}
	},

	/**
	 * Remove item from cart in database
	 */
	removeCartItemFromDB: async (email, itemId) => {
		if (!email || !itemId) {
			throw new Error("Email and item ID are required");
		}

		try {
			const response = await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
				data: { email, productId: itemId },
				withCredentials: true,
			});
			return response.data;
		} catch (error) {
			console.error("Error removing cart item:", error);
			throw new Error(
				error.response?.data?.message || "Failed to remove cart item"
			);
		}
	},

	/**
	 * Clear entire cart in database
	 */
	clearCartInDB: async (email) => {
		if (!email) {
			throw new Error("Email is required to clear cart");
		}

		try {
			const response = await axios.delete(
				`${API_BASE_URL}/api/cart/clear/${email}`,
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error clearing cart:", error);
			throw new Error(error.response?.data?.message || "Failed to clear cart");
		}
	},

	/**
	 * Preview cart merge (optional endpoint)
	 */
	previewCartMerge: async (email, newItems) => {
		if (!email) {
			throw new Error("Email is required for cart merge preview");
		}

		if (!Array.isArray(newItems) || newItems.length === 0) {
			throw new Error("Items array is required for merge preview");
		}

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/cart/preview-merge`,
				{ email, newItems },
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error previewing cart merge:", error);
			throw new Error(
				error.response?.data?.message || "Failed to preview cart merge"
			);
		}
	},

	/**
	 * Get cart summary (items count, total amount) for authenticated user
	 */
	getCartSummary: async (email) => {
		if (!email) {
			throw new Error("Email is required to get cart summary");
		}

		try {
			// Use the main cart endpoint and extract summary data
			const response = await axios.get(`${API_BASE_URL}/api/cart/${email}`, {
				withCredentials: true,
			});
			const cart = response.data.cart || { totalItems: 0, totalAmount: 0 };
			return {
				totalItems: cart.totalItems || 0,
				totalAmount: cart.totalAmount || 0,
			};
		} catch (error) {
			console.error("Error getting cart summary:", error);
			// Return empty summary if not found
			if (error.response?.status === 404) {
				return { totalItems: 0, totalAmount: 0 };
			}
			throw new Error(
				error.response?.data?.message || "Failed to get cart summary"
			);
		}
	},

	/**
	 * Merge items with existing cart (client-side helper)
	 */
	mergeCartItems: (existingItems, newItems) => {
		const mergedItems = [...existingItems];

		newItems.forEach((newItem) => {
			const existingItemIndex = mergedItems.findIndex(
				(item) => item._id === newItem._id
			);

			if (existingItemIndex >= 0) {
				// Item exists, update quantity
				const existingItem = mergedItems[existingItemIndex];
				const newQuantity = existingItem.quantity + newItem.quantity;

				// Ensure quantity meets minimum order requirement
				const minQuantity = Math.max(
					newItem.minimumOrderQuantity || 1,
					existingItem.minimumOrderQuantity || 1
				);

				mergedItems[existingItemIndex] = {
					...existingItem,
					...newItem, // Use new item data (in case of updates)
					quantity: Math.max(newQuantity, minQuantity),
				};
			} else {
				// New item, add to cart
				const minQuantity = newItem.minimumOrderQuantity || 1;
				mergedItems.push({
					...newItem,
					quantity: Math.max(newItem.quantity, minQuantity),
				});
			}
		});

		return mergedItems;
	},

	/**
	 * Calculate cart totals
	 */
	calculateCartTotals: (items) => {
		const totalItems = items.reduce((total, item) => total + item.quantity, 0);
		const subtotal = items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);
		const deliveryCharge = items.length * 100; // Base delivery charge per unique item
		const totalAmount = subtotal + deliveryCharge;

		return {
			totalItems,
			subtotal,
			deliveryCharge,
			totalAmount,
		};
	},

	/**
	 * Validate cart item structure
	 */
	validateCartItem: (item) => {
		if (!item || typeof item !== "object") {
			throw new Error("Invalid cart item");
		}

		const requiredFields = ["_id", "title", "price", "unit"];
		for (const field of requiredFields) {
			if (!item[field]) {
				throw new Error(`Cart item missing required field: ${field}`);
			}
		}

		if (typeof item.price !== "number" || item.price <= 0) {
			throw new Error("Cart item price must be a positive number");
		}

		if (typeof item.quantity !== "number" || item.quantity <= 0) {
			throw new Error("Cart item quantity must be a positive number");
		}

		if (
			item.minimumOrderQuantity &&
			typeof item.minimumOrderQuantity === "number" &&
			item.quantity < item.minimumOrderQuantity
		) {
			throw new Error(
				`Cart item quantity must be at least ${item.minimumOrderQuantity}`
			);
		}
	},
};

export default cartService;
