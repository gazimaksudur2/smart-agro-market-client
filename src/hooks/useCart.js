import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import {
	addToCartAsync,
	updateCartItemQuantityAsync,
	removeFromCartAsync,
	clearCartAsync,
	loadCartFromDB,
	loadCartFromLocalStorage,
	mergeCartOnLogin,
	selectCartItems,
	selectCartTotalItems,
	selectCartSubtotal,
	selectCartDeliveryCharge,
	selectCartTotal,
	selectCartSyncStatus,
	selectCartSyncError,
	selectCartLastSync,
} from "../redux/slices/cartSlice";
import toast from "react-hot-toast";

export const useCart = () => {
	const dispatch = useDispatch();
	const { currentUser } = useAuth();
	const cartItems = useSelector(selectCartItems);
	const totalItems = useSelector(selectCartTotalItems);
	const subtotal = useSelector(selectCartSubtotal);
	const deliveryCharge = useSelector(selectCartDeliveryCharge);
	const total = useSelector(selectCartTotal);
	const syncStatus = useSelector(selectCartSyncStatus);
	const syncError = useSelector(selectCartSyncError);
	const lastSync = useSelector(selectCartLastSync);

	const isAuthenticated = !!currentUser?.FirebaseUser;
	const userEmail = currentUser?.FirebaseUser?.email;

	// Load cart on component mount and auth state changes
	useEffect(() => {
		if (isAuthenticated && userEmail) {
			// Check for checkout intent after login
			const checkoutIntent = localStorage.getItem("checkoutIntent");
			if (checkoutIntent) {
				try {
					const intent = JSON.parse(checkoutIntent);
					// Check if the intent is still valid (less than 1 hour old)
					const intentAge =
						new Date().getTime() - new Date(intent.timestamp).getTime();
					if (intentAge < 60 * 60 * 1000) {
						// 1 hour in milliseconds
						// Navigate to checkout after cart is loaded
						setTimeout(() => {
							window.location.href = "/checkout";
						}, 1000); // Wait 1 second for cart to load
						localStorage.removeItem("checkoutIntent");
					} else {
						// Remove expired checkout intent
						localStorage.removeItem("checkoutIntent");
					}
				} catch (error) {
					console.error("Error processing checkout intent:", error);
					localStorage.removeItem("checkoutIntent");
				}
			}

			// User is authenticated - load from database and merge with localStorage if needed
			dispatch(mergeCartOnLogin(userEmail))
				.unwrap()
				.catch((error) => {
					console.error("Error merging cart on login:", error);
					toast.error("Failed to load your cart. Please try again.");
				});
		} else {
			// User is not authenticated - load from localStorage
			dispatch(loadCartFromLocalStorage())
				.unwrap()
				.catch((error) => {
					console.error("Error loading cart from localStorage:", error);
					toast.error("Failed to load your cart. Please try again.");
				});
		}
	}, [isAuthenticated, userEmail, dispatch]);

	// Enhanced add to cart function
	const addItemToCart = async (product, quantity = 1) => {
		try {
			const result = await dispatch(
				addToCartAsync({
					product: { ...product, quantity },
					email: userEmail,
					isAuthenticated,
				})
			).unwrap();

			if (result) {
				toast.success(`${product.title} added to cart`);
			}
		} catch (error) {
			console.error("Error adding item to cart:", error);
			toast.error(error || "Failed to add item to cart");
		}
	};

	// Enhanced update quantity function
	const updateItemQuantity = async (itemId, quantity) => {
		try {
			const result = await dispatch(
				updateCartItemQuantityAsync({
					itemId,
					quantity,
					email: userEmail,
					isAuthenticated,
				})
			).unwrap();

			if (result) {
				toast.success("Cart updated");
			}
		} catch (error) {
			console.error("Error updating item quantity:", error);
			toast.error(error || "Failed to update item quantity");
		}
	};

	// Enhanced remove from cart function
	const removeItemFromCart = async (itemId) => {
		try {
			const result = await dispatch(
				removeFromCartAsync({
					itemId,
					email: userEmail,
					isAuthenticated,
				})
			).unwrap();

			if (result) {
				toast.success("Item removed from cart");
			}
		} catch (error) {
			console.error("Error removing item from cart:", error);
			toast.error(error || "Failed to remove item from cart");
		}
	};

	// Enhanced clear cart function
	const clearCartItems = async () => {
		try {
			const result = await dispatch(
				clearCartAsync({
					email: userEmail,
					isAuthenticated,
				})
			).unwrap();

			if (result) {
				toast.success("Cart cleared");
			}
		} catch (error) {
			console.error("Error clearing cart:", error);
			toast.error(error || "Failed to clear cart");
		}
	};

	// Check if product is in cart
	const isInCart = (productId) => {
		return cartItems.some((item) => item._id === productId);
	};

	// Get item quantity in cart
	const getItemQuantity = (productId) => {
		const item = cartItems.find((item) => item._id === productId);
		return item ? item.quantity : 0;
	};

	// Redirect to login for checkout if not authenticated
	const proceedToCheckout = (navigate) => {
		if (!isAuthenticated) {
			toast.error("Please login to proceed with checkout");
			navigate("/login", { state: { from: "/checkout" } });
			return false;
		}

		if (cartItems.length === 0) {
			toast.error("Your cart is empty");
			return false;
		}

		if (syncStatus === "error") {
			toast.error("There was an error syncing your cart. Please try again.");
			return false;
		}

		navigate("/checkout");
		return true;
	};

	return {
		// Cart state
		cartItems,
		totalItems,
		subtotal,
		deliveryCharge,
		total,
		syncStatus,
		syncError,
		lastSync,
		isAuthenticated,

		// Cart actions
		addItemToCart,
		updateItemQuantity,
		removeItemFromCart,
		clearCartItems,

		// Utility functions
		isInCart,
		getItemQuantity,
		proceedToCheckout,
	};
};
