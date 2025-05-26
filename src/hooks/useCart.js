import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import {
	addToCart,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
	loadCartFromDB,
	loadCartFromLocalStorage,
	mergeCartOnLogin,
	syncCartToDB,
	syncToLocalStorage,
	selectCartItems,
	selectCartTotalItems,
	selectCartSubtotal,
	selectCartDeliveryCharge,
	selectCartTotal,
} from "../redux/slices/cartSlice";
import cartService from "../services/cartService";
import toast from "react-hot-toast";

export const useCart = () => {
	const dispatch = useDispatch();
	const { currentUser } = useAuth();
	const cartItems = useSelector(selectCartItems);
	const totalItems = useSelector(selectCartTotalItems);
	const subtotal = useSelector(selectCartSubtotal);
	const deliveryCharge = useSelector(selectCartDeliveryCharge);
	const total = useSelector(selectCartTotal);
	const { loading, syncStatus } = useSelector((state) => state.cart);

	const isAuthenticated = !!currentUser?.FirebaseUser;
	const userEmail = currentUser?.FirebaseUser?.email;

	// Load cart on component mount and auth state changes
	useEffect(() => {
		if (isAuthenticated && userEmail) {
			// User is authenticated - load from database and merge with localStorage if needed
			dispatch(mergeCartOnLogin(userEmail));
		} else {
			// User is not authenticated - load from localStorage
			dispatch(loadCartFromLocalStorage());
		}
	}, [isAuthenticated, userEmail, dispatch]);

	// Sync cart to appropriate storage when cart changes
	useEffect(() => {
		if (cartItems.length > 0) {
			if (isAuthenticated && userEmail) {
				// Sync to database for authenticated users
				const cartData = {
					items: cartItems,
					totalItems,
					subtotal,
					deliveryCharge,
					totalAmount: total,
				};
				dispatch(syncCartToDB({ email: userEmail, cartData }));
			} else {
				// Sync to localStorage for non-authenticated users
				dispatch(syncToLocalStorage());
			}
		}
	}, [
		cartItems,
		totalItems,
		subtotal,
		deliveryCharge,
		total,
		isAuthenticated,
		userEmail,
		dispatch,
	]);

	// Enhanced add to cart function
	const addItemToCart = async (product, quantity = 1) => {
		try {
			// Check if user is authenticated
			if (!isAuthenticated) {
				// For non-authenticated users, just add to Redux and localStorage
				dispatch(addToCart({ ...product, quantity }));
				toast.success(`${product.title} added to cart`);
				return;
			}

			// For authenticated users, add to Redux (which will sync to DB via useEffect)
			dispatch(addToCart({ ...product, quantity }));
			toast.success(`${product.title} added to cart`);
		} catch (error) {
			console.error("Error adding item to cart:", error);
			toast.error("Failed to add item to cart");
		}
	};

	// Enhanced update quantity function
	const updateItemQuantity = async (itemId, quantity) => {
		try {
			dispatch(updateCartItemQuantity({ _id: itemId, quantity }));

			if (isAuthenticated && userEmail) {
				// For authenticated users, also update in database
				await cartService.updateCartItemInDB(userEmail, itemId, quantity);
			}
		} catch (error) {
			console.error("Error updating item quantity:", error);
			toast.error("Failed to update item quantity");
		}
	};

	// Enhanced remove from cart function
	const removeItemFromCart = async (itemId) => {
		try {
			dispatch(removeFromCart({ _id: itemId }));

			if (isAuthenticated && userEmail) {
				// For authenticated users, also remove from database
				await cartService.removeCartItemFromDB(userEmail, itemId);
			}

			toast.success("Item removed from cart");
		} catch (error) {
			console.error("Error removing item from cart:", error);
			toast.error("Failed to remove item from cart");
		}
	};

	// Enhanced clear cart function
	const clearCartItems = async () => {
		try {
			dispatch(clearCart());

			if (isAuthenticated && userEmail) {
				// For authenticated users, also clear database
				await cartService.clearCartInDB(userEmail);
			} else {
				// For non-authenticated users, clear localStorage
				cartService.clearCartFromLocalStorage();
			}

			toast.success("Cart cleared");
		} catch (error) {
			console.error("Error clearing cart:", error);
			toast.error("Failed to clear cart");
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
		loading,
		syncStatus,
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
