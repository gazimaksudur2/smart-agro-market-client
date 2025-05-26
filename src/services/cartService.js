import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";
const CART_STORAGE_KEY = "smart_agro_cart";

/**
 * Cart service to handle database synchronization and localStorage
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
			const response = await axios.get(`${API_BASE_URL}/carts/${email}`, {
				withCredentials: true,
			});
			return response.data.cart || { items: [] };
		} catch (error) {
			console.error("Error getting cart from database:", error);
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
				`${API_BASE_URL}/carts`,
				{
					email,
					items: cartData.items,
					totalItems: cartData.totalItems,
					subtotal: cartData.subtotal,
					deliveryCharge: cartData.deliveryCharge,
					totalAmount: cartData.totalAmount,
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
	 * Update cart item in database
	 */
	updateCartItemInDB: async (email, itemId, quantity) => {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/carts/${email}/items/${itemId}`,
				{ quantity },
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error updating cart item in database:", error);
			throw error;
		}
	},

	/**
	 * Remove cart item from database
	 */
	removeCartItemFromDB: async (email, itemId) => {
		try {
			const response = await axios.delete(
				`${API_BASE_URL}/carts/${email}/items/${itemId}`,
				{ withCredentials: true }
			);
			return response.data;
		} catch (error) {
			console.error("Error removing cart item from database:", error);
			throw new Error(
				error.response?.data?.message || "Failed to remove item from cart"
			);
		}
	},

	/**
	 * Clear cart in database
	 */
	clearCartInDB: async (email) => {
		try {
			const response = await axios.delete(`${API_BASE_URL}/carts/${email}`, {
				withCredentials: true,
			});
			return response.data;
		} catch (error) {
			console.error("Error clearing cart in database:", error);
			throw error;
		}
	},

	/**
	 * Get cart from localStorage
	 */
	getCartFromLocalStorage: () => {
		try {
			const cart = localStorage.getItem(CART_STORAGE_KEY);
			return cart ? JSON.parse(cart) : { items: [] };
		} catch (error) {
			console.error("Error getting cart from localStorage:", error);
			return { items: [] };
		}
	},

	/**
	 * Save cart to localStorage
	 */
	saveCartToLocalStorage: (cartData) => {
		try {
			localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
		} catch (error) {
			console.error("Error saving cart to localStorage:", error);
		}
	},

	/**
	 * Clear cart from localStorage
	 */
	clearCartFromLocalStorage: () => {
		try {
			localStorage.removeItem(CART_STORAGE_KEY);
		} catch (error) {
			console.error("Error clearing cart from localStorage:", error);
		}
	},

	/**
	 * Transfer cart from localStorage to database when user logs in
	 */
	transferCartToDatabase: async (email) => {
		try {
			const localCart = cartService.getCartFromLocalStorage();

			if (localCart.items && localCart.items.length > 0) {
				// Save local cart to database
				await cartService.saveCartToDB(email, localCart);

				// Clear localStorage after successful transfer
				cartService.clearCartFromLocalStorage();

				return localCart;
			}

			return null;
		} catch (error) {
			console.error("Error transferring cart to database:", error);
			throw error;
		}
	},

	/**
	 * Merge carts when transferring from localStorage to database
	 */
	mergeAndTransferCart: async (email) => {
		if (!email) {
			throw new Error("Email is required to merge carts");
		}

		try {
			const [localCart, dbCart] = await Promise.all([
				cartService.getCartFromLocalStorage(),
				cartService.getCartFromDB(email),
			]);

			// Validate both carts
			if (localCart.items && !Array.isArray(localCart.items)) {
				throw new Error("Invalid local cart items");
			}
			if (dbCart.items && !Array.isArray(dbCart.items)) {
				throw new Error("Invalid database cart items");
			}

			// If no local cart items, just return database cart
			if (!localCart.items || localCart.items.length === 0) {
				return dbCart;
			}

			// If no database cart items, transfer local cart
			if (!dbCart.items || dbCart.items.length === 0) {
				await cartService.saveCartToDB(email, localCart);
				cartService.clearCartFromLocalStorage();
				return localCart;
			}

			// Validate all items before merging
			[...localCart.items, ...dbCart.items].forEach((item) =>
				cartService.validateCartItem(item)
			);

			// Merge carts - combine items, avoiding duplicates
			const mergedItems = [...dbCart.items];

			localCart.items.forEach((localItem) => {
				const existingItemIndex = mergedItems.findIndex(
					(item) => item._id === localItem._id
				);

				if (existingItemIndex !== -1) {
					// Update quantity if item exists
					mergedItems[existingItemIndex].quantity += localItem.quantity;
				} else {
					// Add new item
					mergedItems.push(localItem);
				}
			});

			// Calculate merged cart totals
			const mergedCart = {
				items: mergedItems,
				totalItems: mergedItems.reduce(
					(total, item) => total + item.quantity,
					0
				),
				subtotal: mergedItems.reduce(
					(total, item) => total + item.price * item.quantity,
					0
				),
				deliveryCharge: mergedItems.length * 100, // Base delivery charge
				totalAmount: 0,
			};
			mergedCart.totalAmount = mergedCart.subtotal + mergedCart.deliveryCharge;

			// Save merged cart to database
			await cartService.saveCartToDB(email, mergedCart);

			// Clear localStorage
			cartService.clearCartFromLocalStorage();

			return mergedCart;
		} catch (error) {
			console.error("Error merging and transferring cart:", error);
			throw error;
		}
	},

	/**
	 * Validate cart item before adding/updating
	 */
	validateCartItem: (item) => {
		if (!item) {
			throw new Error("Invalid cart item");
		}

		const requiredFields = [
			"_id",
			"title",
			"price",
			"quantity",
			"unit",
			"minimumOrderQuantity",
		];
		const missingFields = requiredFields.filter((field) => !item[field]);

		if (missingFields.length > 0) {
			throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
		}

		if (item.quantity < item.minimumOrderQuantity) {
			throw new Error(
				`Quantity must be at least ${item.minimumOrderQuantity} ${item.unit}`
			);
		}

		if (item.price <= 0) {
			throw new Error("Invalid price");
		}

		return true;
	},
};

export default cartService;
