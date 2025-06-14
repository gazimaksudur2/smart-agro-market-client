import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
	createOrder,
	getUserOrders,
	getOrderById,
	updateOrderStatus,
	getSellerOrders,
	getAllOrders,
	cancelOrder,
	getOrderStats,
} from "../services/orderService";

/**
 * Custom hook for order management
 */
const useOrders = () => {
	const { currentUser } = useAuth();
	const user = currentUser?.FirebaseUser;

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Create new order
	const placeOrder = useCallback(
		async (orderData) => {
			if (!user?.uid) {
				toast.error("Please login to place an order");
				return { success: false, error: "User not authenticated" };
			}

			setLoading(true);
			setError(null);

			try {
				// Add user information to order data
				const orderPayload = {
					...orderData,
					userId: user.uid,
					userEmail: user.email,
				};

				const response = await createOrder(orderPayload);

				if (response.success) {
					toast.success("Order placed successfully!");
					return {
						success: true,
						order: response.order,
						orderNumber: response.order.orderNumber,
					};
				} else {
					throw new Error(response.message || "Failed to place order");
				}
			} catch (err) {
				const errorMessage =
					err.response?.data?.message || err.message || "Failed to place order";
				setError(errorMessage);
				toast.error(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setLoading(false);
			}
		},
		[user?.uid, user?.email]
	);

	// Get user's orders
	const fetchUserOrders = useCallback(
		async (params = {}) => {
			if (!user?.uid) {
				return { success: false, error: "User not authenticated" };
			}

			setLoading(true);
			setError(null);

			try {
				const response = await getUserOrders(user.uid, params);
				return {
					success: true,
					orders: response.orders || [],
					pagination: response.pagination,
				};
			} catch (err) {
				const errorMessage =
					err.response?.data?.message ||
					err.message ||
					"Failed to fetch orders";
				setError(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setLoading(false);
			}
		},
		[user?.uid]
	);

	// Get specific order
	const fetchOrderById = useCallback(async (orderId) => {
		setLoading(true);
		setError(null);

		try {
			const response = await getOrderById(orderId);
			return {
				success: true,
				order: response.order,
			};
		} catch (err) {
			const errorMessage =
				err.response?.data?.message || err.message || "Failed to fetch order";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Update order status
	const updateStatus = useCallback(async (orderId, status, notes = null) => {
		setLoading(true);
		setError(null);

		try {
			const response = await updateOrderStatus(orderId, status, notes);
			if (response.success) {
				toast.success(`Order status updated to ${status}`);
				return { success: true, order: response.order };
			} else {
				throw new Error(response.message || "Failed to update order status");
			}
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				err.message ||
				"Failed to update order status";
			setError(errorMessage);
			toast.error(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Get seller orders
	const fetchSellerOrders = useCallback(async (sellerId, params = {}) => {
		setLoading(true);
		setError(null);

		try {
			const response = await getSellerOrders(sellerId, params);
			return {
				success: true,
				orders: response.orders || [],
				pagination: response.pagination,
			};
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				err.message ||
				"Failed to fetch seller orders";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Get all orders (admin)
	const fetchAllOrders = useCallback(async (params = {}) => {
		setLoading(true);
		setError(null);

		try {
			const response = await getAllOrders(params);
			return {
				success: true,
				orders: response.orders || [],
				pagination: response.pagination,
			};
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				err.message ||
				"Failed to fetch all orders";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Cancel order
	const cancelOrderById = useCallback(async (orderId, reason = null) => {
		setLoading(true);
		setError(null);

		try {
			const response = await cancelOrder(orderId, reason);
			if (response.success) {
				toast.success("Order cancelled successfully");
				return { success: true, order: response.order };
			} else {
				throw new Error(response.message || "Failed to cancel order");
			}
		} catch (err) {
			const errorMessage =
				err.response?.data?.message || err.message || "Failed to cancel order";
			setError(errorMessage);
			toast.error(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setLoading(false);
		}
	}, []);

	// Get order statistics
	const fetchOrderStats = useCallback(
		async (sellerId = null) => {
			setLoading(true);
			setError(null);

			try {
				const response = await getOrderStats(user?.uid, sellerId);
				return {
					success: true,
					stats: response.stats,
				};
			} catch (err) {
				const errorMessage =
					err.response?.data?.message ||
					err.message ||
					"Failed to fetch order stats";
				setError(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setLoading(false);
			}
		},
		[user?.uid]
	);

	return {
		// State
		loading,
		error,

		// Actions
		placeOrder,
		fetchUserOrders,
		fetchOrderById,
		updateStatus,
		fetchSellerOrders,
		fetchAllOrders,
		cancelOrderById,
		fetchOrderStats,
	};
};

export default useOrders;
