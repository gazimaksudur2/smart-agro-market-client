import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaShoppingBag,
	FaEye,
	FaTruck,
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const OrderStatusBadge = ({ status }) => {
	const statusConfig = {
		pending: {
			color: "bg-yellow-100 text-yellow-800",
			icon: <FaClock className="h-3 w-3" />,
			label: "Pending",
		},
		confirmed: {
			color: "bg-blue-100 text-blue-800",
			icon: <FaCheckCircle className="h-3 w-3" />,
			label: "Confirmed",
		},
		shipped: {
			color: "bg-purple-100 text-purple-800",
			icon: <FaTruck className="h-3 w-3" />,
			label: "Shipped",
		},
		delivered: {
			color: "bg-green-100 text-green-800",
			icon: <FaCheckCircle className="h-3 w-3" />,
			label: "Delivered",
		},
		cancelled: {
			color: "bg-red-100 text-red-800",
			icon: <FaTimesCircle className="h-3 w-3" />,
			label: "Cancelled",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
		>
			{config.icon}
			<span className="ml-1">{config.label}</span>
		</span>
	);
};

export default function MyOrders() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [selectedOrder, setSelectedOrder] = useState(null);

	// Fetch user orders
	const {
		data: orders,
		isLoading,
		error,
	} = useQuery(
		["userOrders", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];

			try {
				const response = await apiCall(
					`/orders/user/${currentUser.FirebaseUser.uid}`
				);
				return response.orders || [];
			} catch (error) {
				console.error("Error fetching orders:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	// Mock orders for demo
	const mockOrders = [
		{
			_id: "order_001",
			orderNumber: "ORD-2024-001",
			status: "delivered",
			totalAmount: 2450,
			advancePaymentAmount: 400,
			createdAt: "2024-01-15T10:30:00Z",
			deliveryDetails: {
				region: "Dhaka",
				district: "Dhaka",
				address: "123 Main Street, Dhanmondi",
				phone: "+880 1712345678",
			},
			items: [
				{
					productId: "prod_001",
					title: "Premium Basmati Rice",
					quantity: 10,
					price: 120,
					totalPrice: 1200,
					unit: "kg",
				},
				{
					productId: "prod_002",
					title: "Fresh Potatoes",
					quantity: 25,
					price: 50,
					totalPrice: 1250,
					unit: "kg",
				},
			],
		},
		{
			_id: "order_002",
			orderNumber: "ORD-2024-002",
			status: "shipped",
			totalAmount: 1800,
			advancePaymentAmount: 300,
			createdAt: "2024-01-20T14:15:00Z",
			deliveryDetails: {
				region: "Dhaka",
				district: "Gazipur",
				address: "456 Garden Road, Gazipur Sadar",
				phone: "+880 1712345678",
			},
			items: [
				{
					productId: "prod_003",
					title: "Organic Tomatoes",
					quantity: 15,
					price: 80,
					totalPrice: 1200,
					unit: "kg",
				},
				{
					productId: "prod_004",
					title: "Fresh Onions",
					quantity: 20,
					price: 30,
					totalPrice: 600,
					unit: "kg",
				},
			],
		},
		{
			_id: "order_003",
			orderNumber: "ORD-2024-003",
			status: "pending",
			totalAmount: 3200,
			advancePaymentAmount: 500,
			createdAt: "2024-01-22T09:45:00Z",
			deliveryDetails: {
				region: "Chittagong",
				district: "Chittagong",
				address: "789 Hill View, Chittagong",
				phone: "+880 1712345678",
			},
			items: [
				{
					productId: "prod_005",
					title: "Premium Wheat",
					quantity: 50,
					price: 60,
					totalPrice: 3000,
					unit: "kg",
				},
			],
		},
	];

	const displayOrders = orders && orders.length > 0 ? orders : mockOrders;

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Orders" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	if (displayOrders.length === 0) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Orders" />
				<div className="mt-6 text-center py-12">
					<FaShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						No orders yet
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						You haven't placed any orders yet. Start shopping to see your orders
						here.
					</p>
					<button
						onClick={() => (window.location.href = "/products")}
						className="mt-6 btn btn-primary"
					>
						Browse Products
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="My Orders" />

			<div className="mt-6 space-y-6">
				{displayOrders.map((order) => (
					<div
						key={order._id}
						className="bg-white shadow-sm rounded-lg overflow-hidden"
					>
						{/* Order Header */}
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-medium text-gray-900">
										Order #{order.orderNumber}
									</h3>
									<p className="text-sm text-gray-500">
										Placed on {formatDate(order.createdAt)}
									</p>
								</div>
								<div className="flex items-center space-x-4">
									<OrderStatusBadge status={order.status} />
									<button
										onClick={() =>
											setSelectedOrder(
												selectedOrder?._id === order._id ? null : order
											)
										}
										className="btn btn-outline-primary btn-sm flex items-center"
									>
										<FaEye className="mr-1 h-3 w-3" />
										{selectedOrder?._id === order._id ? "Hide" : "View"} Details
									</button>
								</div>
							</div>
						</div>

						{/* Order Summary */}
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm font-medium text-gray-500">
										Total Amount
									</p>
									<p className="text-lg font-semibold text-gray-900">
										৳{order.totalAmount.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Advance Paid
									</p>
									<p className="text-lg font-semibold text-green-600">
										৳{order.advancePaymentAmount.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Balance Due
									</p>
									<p className="text-lg font-semibold text-orange-600">
										৳
										{(
											order.totalAmount - order.advancePaymentAmount
										).toLocaleString()}
									</p>
								</div>
							</div>

							{/* Order Items Preview */}
							<div className="mt-4">
								<p className="text-sm font-medium text-gray-500 mb-2">
									Items ({order.items.length})
								</p>
								<div className="flex flex-wrap gap-2">
									{order.items.slice(0, 3).map((item, index) => (
										<span
											key={index}
											className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
										>
											{item.title} ({item.quantity} {item.unit})
										</span>
									))}
									{order.items.length > 3 && (
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
											+{order.items.length - 3} more
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Expanded Order Details */}
						{selectedOrder?._id === order._id && (
							<div className="border-t border-gray-200 bg-gray-50 p-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Order Items */}
									<div>
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Order Items
										</h4>
										<div className="space-y-3">
											{order.items.map((item, index) => (
												<div
													key={index}
													className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
												>
													<div>
														<p className="text-sm font-medium text-gray-900">
															{item.title}
														</p>
														<p className="text-xs text-gray-500">
															{item.quantity} {item.unit} × ৳{item.price}
														</p>
													</div>
													<p className="text-sm font-medium text-gray-900">
														৳{item.totalPrice.toLocaleString()}
													</p>
												</div>
											))}
										</div>
									</div>

									{/* Delivery Details */}
									<div>
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Delivery Information
										</h4>
										<div className="space-y-2 text-sm text-gray-600">
											<p>
												<span className="font-medium">Region:</span>{" "}
												{order.deliveryDetails.region}
											</p>
											<p>
												<span className="font-medium">District:</span>{" "}
												{order.deliveryDetails.district}
											</p>
											<p>
												<span className="font-medium">Address:</span>{" "}
												{order.deliveryDetails.address}
											</p>
											<p>
												<span className="font-medium">Phone:</span>{" "}
												{order.deliveryDetails.phone}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
