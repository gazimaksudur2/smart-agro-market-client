import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import {
	fetchCart,
	addItemToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
	batchUpdateCartItems,
} from "../store/slices/cartSlice";
import toast from "react-hot-toast";
import cartService from "../services/cartService";

/**
 * Custom hook for cart operations (database only)
 */
export const useCart = () => {
	const dispatch = useDispatch();
	const { user } = useAuth();
	const location = useLocation();
	const {
		items,
		totalItems,
		subtotal,
		deliveryCharge,
		totalAmount,
		loading,
		error,
	} = useSelector((state) => state.cart);

	// Only show cart errors on cart-specific pages
	const isCartPage = ["/cart", "/checkout", "/my-cart"].includes(
		location.pathname
	);

	/**
	 * Load cart from database
	 */
	const loadCart = async () => {
		if (!user?.email) {
			console.warn("Cannot load cart: User not authenticated");
			return;
		}

		try {
			await dispatch(fetchCart(user.email)).unwrap();
		} catch (error) {
			console.error("Error loading cart:", error);
			if (isCartPage) {
				toast.error("Failed to load cart");
			}
		}
	};

	/**
	 * Add single item to cart
	 */
	const addToCart = async (item) => {
		if (!user?.email) {
			throw new Error("Authentication required to add items to cart");
		}

		try {
			await dispatch(addItemToCart({ email: user.email, item })).unwrap();
			toast.success(`${item.title} added to cart`);
		} catch (error) {
			console.error("Error adding item to cart:", error);
			toast.error(error.message || "Failed to add item to cart");
			throw error;
		}
	};

	/**
	 * Add multiple items to cart (merges with existing items)
	 */
	const addMultipleItemsToCart = async (items) => {
		if (!user?.email) {
			throw new Error("Authentication required to add items to cart");
		}

		if (!Array.isArray(items) || items.length === 0) {
			throw new Error("Items array is required and cannot be empty");
		}

		try {
			// Use the cart service to add multiple items
			const result = await cartService.addMultipleItemsToCart(
				user.email,
				items
			);

			// Refresh cart to get updated state
			await dispatch(fetchCart(user.email)).unwrap();

			const itemCount = items.length;
			const itemText = itemCount === 1 ? "item" : "items";
			toast.success(`${itemCount} ${itemText} added to cart`);

			return result;
		} catch (error) {
			console.error("Error adding multiple items to cart:", error);
			toast.error(error.message || "Failed to add items to cart");
			throw error;
		}
	};

	/**
	 * Merge items with current cart (client-side helper)
	 */
	const mergeItemsWithCart = (newItems) => {
		if (!Array.isArray(newItems)) {
			throw new Error("Items must be an array");
		}

		const mergedItems = cartService.mergeCartItems(items, newItems);
		const totals = cartService.calculateCartTotals(mergedItems);

		return {
			items: mergedItems,
			...totals,
		};
	};

	/**
	 * Update cart item quantity
	 */
	const updateItem = async (itemId, quantity) => {
		if (!user?.email) {
			throw new Error("Authentication required to update cart");
		}

		try {
			await dispatch(
				updateCartItem({ email: user.email, itemId, quantity })
			).unwrap();

			if (quantity === 0) {
				toast.success("Item removed from cart");
			} else {
				toast.success("Cart updated");
			}
		} catch (error) {
			console.error("Error updating cart item:", error);
			toast.error(error.message || "Failed to update cart");
			throw error;
		}
	};

	/**
	 * Remove item from cart
	 */
	const removeItem = async (itemId) => {
		if (!user?.email) {
			throw new Error("Authentication required to remove items from cart");
		}

		try {
			await dispatch(removeCartItem({ email: user.email, itemId })).unwrap();
			toast.success("Item removed from cart");
		} catch (error) {
			console.error("Error removing cart item:", error);
			toast.error(error.message || "Failed to remove item from cart");
			throw error;
		}
	};

	/**
	 * Clear entire cart
	 */
	const clearCartItems = async () => {
		if (!user?.email) {
			throw new Error("Authentication required to clear cart");
		}

		try {
			await dispatch(clearCart(user.email)).unwrap();
			toast.success("Cart cleared");
		} catch (error) {
			console.error("Error clearing cart:", error);
			toast.error(error.message || "Failed to clear cart");
			throw error;
		}
	};

	/**
	 * Batch update multiple cart items
	 */
	const batchUpdateItems = async (operations) => {
		if (!user?.email) {
			throw new Error("Authentication required to update cart");
		}

		try {
			await dispatch(
				batchUpdateCartItems({ email: user.email, operations })
			).unwrap();
			toast.success("Cart updated successfully");
		} catch (error) {
			console.error("Error batch updating cart:", error);
			toast.error(error.message || "Failed to update cart");
			throw error;
		}
	};

	/**
	 * Get cart item by ID
	 */
	const getCartItem = (itemId) => {
		return items.find((item) => item._id === itemId);
	};

	/**
	 * Check if item exists in cart
	 */
	const isItemInCart = (itemId) => {
		return items.some((item) => item._id === itemId);
	};

	/**
	 * Get total quantity of specific item in cart
	 */
	const getItemQuantity = (itemId) => {
		const item = getCartItem(itemId);
		return item ? item.quantity : 0;
	};

	/**
	 * Calculate cart totals (client-side helper)
	 */
	const calculateTotals = (cartItems = items) => {
		return cartService.calculateCartTotals(cartItems);
	};

	return {
		// State
		items,
		totalItems,
		subtotal,
		deliveryCharge,
		totalAmount,
		loading,
		error,
		isAuthenticated: !!user?.email,

		// Actions
		loadCart,
		addToCart,
		addMultipleItemsToCart,
		mergeItemsWithCart,
		updateItem,
		removeItem,
		clearCartItems,
		batchUpdateItems,

		// Helpers
		getCartItem,
		isItemInCart,
		getItemQuantity,
		calculateTotals,
	};
};
