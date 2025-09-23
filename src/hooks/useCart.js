import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
	getCartFromDB,
	addItemToDB,
	updateCartItemInDB,
	removeCartItemFromDB,
	clearCartInDB,
	addMultipleItemsToCart,
	batchUpdateCart,
	previewCartMerge,
} from "../services/cartService";

/**
 * Industry Standard Cart Hook
 * Backend as Single Source of Truth
 * Minimal client-side state for performance
 */
const useCart = () => {
	const { currentUser } = useAuth();
	const user = currentUser?.FirebaseUser;

	// Minimal client state - only for UI performance
	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalItems, setTotalItems] = useState(0);

	// Calculate totals from items
	const calculateTotals = useCallback((items) => {
		const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
		const amount = items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		setTotalItems(itemCount);
		setTotalAmount(amount);

		return { totalItems: itemCount, totalAmount: amount };
	}, []);

	// Load cart from backend (single source of truth)
	const loadCart = useCallback(async () => {
		if (!user?.email) {
			setCartItems([]);
			setTotalItems(0);
			setTotalAmount(0);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await getCartFromDB(user.email);

			// Handle backend response format per API spec: { success: true, cart: { items: [...] } }
			const backendItems = response.cart?.items || [];

			// Map backend format to frontend format
			// Backend stores ONLY: productId, price, quantity, addedAt, totalPrice (derived)
			// Per API spec, NO other fields are returned from backend
			const items = backendItems.map((item) => ({
				productId: item.productId,
				productTitle: item.product.title,
				productImage: item.product.images[0],
				price: item.price,
				quantity: item.quantity,
				totalPrice: item.totalPrice,
				minimumOrderQuantity: item.product.minimumOrderQuantity,
				availableStock: item.product.availableStock,
				unit: item.product.unit,
				addedAt: item.addedAt,
			}));

			setCartItems(items);

			// Use backend totals from API response (as per API spec)
			if (
				response.cart?.totalItems !== undefined &&
				response.cart?.totalAmount !== undefined
			) {
				setTotalItems(response.cart.totalItems);
				setTotalAmount(response.cart.totalAmount);
			} else {
				// Fallback calculation if backend doesn't provide totals
				const calculated = calculateTotals(items);
			}
		} catch (err) {
			setError(err.message || "Failed to load cart");
			setCartItems([]);
			setTotalItems(0);
			setTotalAmount(0);
		} finally {
			setLoading(false);
		}
	}, [user?.email, calculateTotals]);

	// Add single item to cart
	const addItem = useCallback(
		async (product, quantity = 1) => {
			if (!user?.email) {
				toast.error("Please login to add items to cart");
				return false;
			}

			if (!product || !product.productId) {
				console.log("product", product);
				toast.error("Invalid product data");
				return false;
			}

			if (quantity <= 0) {
				toast.error("Quantity must be greater than 0");
				return false;
			}

			setLoading(true);
			setError(null);

			try {
				// Send data in backend expected format (API spec: productId, price, quantity)
				const cartItem = {
					productId: product.productId,
					price: product.price,
					quantity: quantity,
				};

				await addItemToDB(user.email, cartItem);

				// Reload cart from backend to ensure consistency
				await loadCart();

				toast.success(`Product added to cart`);
				return true;
			} catch (err) {
				const errorMessage = err.message || "Failed to add item to cart";
				setError(errorMessage);
				toast.error(errorMessage);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[user?.email, loadCart]
	);

	// Add multiple items to cart
	const addMultipleItems = useCallback(
		async (items) => {
			if (!user?.email) {
				toast.error("Please login to add items to cart");
				return false;
			}

			if (!Array.isArray(items) || items.length === 0) {
				toast.error("No items provided");
				return false;
			}

			// Validate and transform items to backend format (API spec: productId, price, quantity)
			const backendItems = [];
			for (const item of items) {
				if (!item.productId || !item.price || item.quantity <= 0) {
					toast.error("Invalid item data provided");
					return false;
				}

				// Transform to backend format
				backendItems.push({
					...item,
				});
			}

			setLoading(true);
			setError(null);

			try {
				await addMultipleItemsToCart(user.email, backendItems);

				// Reload cart from backend to ensure consistency
				await loadCart();

				toast.success(`Products added to cart`);
				return true;
			} catch (err) {
				const errorMessage = err.message || "Failed to add items to cart";
				setError(errorMessage);
				toast.error(errorMessage);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[user?.email, loadCart]
	);

	// Update item quantity
	const updateItem = useCallback(
		async (productId, quantity) => {
			if (!user?.email) {
				toast.error("Please login to update cart");
				return false;
			}

			if (quantity <= 0) {
				toast.error("Quantity must be greater than 0");
				return false;
			}

			setLoading(true);
			setError(null);

			try {
				// API spec: email, productId, quantity
				await updateCartItemInDB(user.email, productId, quantity);

				// Reload cart from backend to ensure consistency
				await loadCart();

				toast.success("Cart updated successfully");
				return true;
			} catch (err) {
				const errorMessage = err.message || "Failed to update cart";
				setError(errorMessage);
				toast.error(errorMessage);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[user?.email, loadCart]
	);

	// Remove item from cart
	const removeItem = useCallback(
		async (productId) => {
			if (!user?.email) {
				toast.error("Please login to remove items");
				return false;
			}

			setLoading(true);
			setError(null);

			try {
				// API spec: email, productId
				await removeCartItemFromDB(user.email, productId);

				// Reload cart from backend to ensure consistency
				await loadCart();

				toast.success("Item removed from cart");
				return true;
			} catch (err) {
				const errorMessage = err.message || "Failed to remove item";
				setError(errorMessage);
				toast.error(errorMessage);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[user?.email, loadCart]
	);

	// Clear entire cart
	const clearCart = useCallback(async () => {
		if (!user?.email) {
			toast.error("Please login to clear cart");
			return false;
		}

		setLoading(true);
		setError(null);

		try {
			await clearCartInDB(user.email);

			// Update local state immediately
			setCartItems([]);
			setTotalItems(0);
			setTotalAmount(0);

			toast.success("Cart cleared successfully");
			return true;
		} catch (err) {
			const errorMessage = err.message || "Failed to clear cart";
			setError(errorMessage);
			toast.error(errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	}, [user?.email]);

	// Batch update operations
	const batchUpdate = useCallback(
		async (operations) => {
			if (!user?.email) {
				throw new Error("User not authenticated");
			}

			setLoading(true);
			setError(null);

			try {
				// Use the batch update service function
				await batchUpdateCart(user.email, operations);

				// Reload cart after all operations
				await loadCart();
				return true;
			} catch (error) {
				console.error("Batch update error:", error);
				setError(error.message || "Failed to update cart");
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[user?.email, loadCart]
	);

	// Preview merge items with cart (for UI preview)
	const previewMergeItems = useCallback(
		async (newItems) => {
			if (!user?.email) {
				return { success: false, error: "Please login first" };
			}

			if (!Array.isArray(newItems) || newItems.length === 0) {
				return { success: false, error: "No items provided" };
			}

			try {
				const response = await previewCartMerge(user.email, newItems);
				return {
					success: true,
					data: response.data,
				};
			} catch (err) {
				return {
					success: false,
					error: err.message || "Failed to preview merge",
				};
			}
		},
		[user?.email]
	);

	// Get item quantity by product ID
	const getItemQuantity = useCallback(
		(productId) => {
			const item = cartItems.find((item) => item.productId === productId);
			return item ? item.quantity : 0;
		},
		[cartItems]
	);

	// Check if item exists in cart
	const isItemInCart = useCallback(
		(productId) => {
			return cartItems.some((item) => item.productId === productId);
		},
		[cartItems]
	);

	// Load cart when user changes
	useEffect(() => {
		loadCart();
	}, [loadCart]);

	return {
		// State
		items: cartItems,
		loading,
		error,
		totalAmount,
		totalItems,

		// Actions
		addItem,
		addMultipleItems,
		updateItem,
		removeItem,
		clearCart,
		loadCart,
		batchUpdate,
		previewMergeItems,

		// Helpers
		getItemQuantity,
		isItemInCart,
		calculateTotals,
	};
};

export default useCart;
