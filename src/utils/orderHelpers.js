/**
 * Utility functions for order handling across different user roles
 */

/**
 * Format order data to handle both API response and mock data formats
 */
export const formatOrderForDisplay = (order) => {
	return {
		id: order._id || order.id,
		orderNumber: order.orderNumber,
		status: order.status,
		totalAmount: order.totalAmount || order.grandTotal,
		subtotal: order.subtotal,
		shippingCost: order.shippingCost || order.deliveryCharge,
		paymentMethod: order.paymentMethod,
		paymentStatus: order.paymentStatus,
		createdAt: order.createdAt || order.orderDate,
		updatedAt: order.updatedAt,
		userId: order.userId,
		userEmail: order.userEmail,
		notes: order.notes,
		items:
			order.items?.map((item) => ({
				productId: item.productId,
				productName: item.productName || item.title,
				quantity: item.quantity,
				price: item.price || item.pricePerUnit,
				totalPrice: item.totalPrice || item.price * item.quantity,
				unit: item.unit || "units",
				sellerId: item.sellerId,
			})) || [],
		shippingDetails: order.shippingDetails || {
			fullName: order.customer?.name,
			email: order.customer?.email || order.userEmail,
			phone: order.customer?.phone,
			address: order.deliveryDetails?.address || order.customer?.address,
			city: order.deliveryDetails?.city || order.shippingAddress?.city,
			state: order.deliveryDetails?.district || order.shippingAddress?.district,
			zip: order.shippingAddress?.postalCode,
		},
	};
};

/**
 * Get order statistics from orders array
 */
export const getOrderStatistics = (orders) => {
	return {
		total: orders.length,
		pending: orders.filter((order) => order.status === "pending").length,
		confirmed: orders.filter((order) => order.status === "confirmed").length,
		processing: orders.filter((order) => order.status === "processing").length,
		shipped: orders.filter((order) => order.status === "shipped").length,
		delivered: orders.filter((order) => order.status === "delivered").length,
		cancelled: orders.filter((order) => order.status === "cancelled").length,
		totalRevenue: orders.reduce(
			(sum, order) => sum + (order.totalAmount || order.grandTotal || 0),
			0
		),
		paidOrders: orders.filter((order) => order.paymentStatus === "paid").length,
		pendingPayments: orders.filter((order) => order.paymentStatus === "pending")
			.length,
	};
};

/**
 * Filter orders based on search term and criteria
 */
export const filterOrders = (
	orders,
	{ searchTerm, status, userId, sellerId }
) => {
	let filtered = orders;

	if (searchTerm) {
		const searchLower = searchTerm.toLowerCase();
		filtered = filtered.filter(
			(order) =>
				order.orderNumber?.toLowerCase().includes(searchLower) ||
				order._id?.toLowerCase().includes(searchLower) ||
				order.userEmail?.toLowerCase().includes(searchLower) ||
				order.userId?.toLowerCase().includes(searchLower) ||
				order.items?.some(
					(item) =>
						item.productId?.toLowerCase().includes(searchLower) ||
						item.productName?.toLowerCase().includes(searchLower)
				)
		);
	}

	if (status && status !== "all") {
		filtered = filtered.filter((order) => order.status === status);
	}

	if (userId) {
		filtered = filtered.filter((order) => order.userId === userId);
	}

	if (sellerId) {
		filtered = filtered.filter((order) =>
			order.items?.some((item) => item.sellerId === sellerId)
		);
	}

	return filtered;
};

/**
 * Determine available actions for an order based on status and user role
 */
export const getAvailableActions = (order, userRole) => {
	const actions = [];

	// Common actions for all roles
	actions.push({ id: "view", label: "View Details", icon: "eye" });

	switch (userRole) {
		case "seller":
			if (order.status === "pending") {
				actions.push(
					{
						id: "confirm",
						label: "Confirm Order",
						icon: "check",
						color: "green",
					},
					{ id: "cancel", label: "Cancel Order", icon: "times", color: "red" }
				);
			}
			if (order.status === "confirmed") {
				actions.push({
					id: "process",
					label: "Start Processing",
					icon: "clock",
					color: "blue",
				});
			}
			if (order.status === "processing") {
				actions.push({
					id: "ship",
					label: "Mark as Shipped",
					icon: "truck",
					color: "purple",
				});
			}
			if (order.status === "shipped") {
				actions.push({
					id: "deliver",
					label: "Mark as Delivered",
					icon: "check-circle",
					color: "green",
				});
			}
			break;

		case "admin":
			if (["pending", "confirmed"].includes(order.status)) {
				actions.push({
					id: "cancel",
					label: "Cancel Order",
					icon: "times",
					color: "red",
				});
			}
			if (order.status === "pending") {
				actions.push({
					id: "confirm",
					label: "Confirm Order",
					icon: "check",
					color: "green",
				});
			}
			if (order.status === "confirmed") {
				actions.push({
					id: "process",
					label: "Process Order",
					icon: "truck",
					color: "blue",
				});
			}
			if (order.status === "processing") {
				actions.push({
					id: "ship",
					label: "Mark as Shipped",
					icon: "truck",
					color: "purple",
				});
			}
			if (order.status === "shipped") {
				actions.push({
					id: "deliver",
					label: "Mark as Delivered",
					icon: "check-circle",
					color: "green",
				});
			}
			break;

		case "consumer":
			if (["pending", "confirmed"].includes(order.status)) {
				actions.push({
					id: "cancel",
					label: "Cancel Order",
					icon: "times",
					color: "red",
				});
			}
			break;
	}

	return actions;
};

/**
 * Validate order status transition
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
	const validTransitions = {
		pending: ["confirmed", "cancelled"],
		confirmed: ["processing", "cancelled"],
		processing: ["shipped", "cancelled"],
		shipped: ["delivered"],
		delivered: [],
		cancelled: [],
	};

	return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Format currency value for display
 */
export const formatCurrency = (amount, currency = "BDT") => {
	if (!amount && amount !== 0) return "N/A";

	const symbol = currency === "BDT" ? "৳" : "$";
	return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Format date for display
 */
export const formatOrderDate = (dateString) => {
	if (!dateString) return "N/A";

	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch (error) {
		return "Invalid Date";
	}
};
