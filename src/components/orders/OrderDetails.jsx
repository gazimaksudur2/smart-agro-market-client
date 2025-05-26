import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaArrowLeft,
	FaCalendarAlt,
	FaMapMarkerAlt,
	FaUser,
	FaPhone,
	FaEnvelope,
	FaBoxOpen,
	FaMoneyBillWave,
	FaTruck,
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
	FaDownload,
	FaStar,
	FaEdit,
} from "react-icons/fa";
import useAPI from "../../hooks/useAPI";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending", icon: FaClock },
		confirmed: { color: "blue", text: "Confirmed", icon: FaCheckCircle },
		processing: { color: "purple", text: "Processing", icon: FaBoxOpen },
		shipped: { color: "indigo", text: "Shipped", icon: FaTruck },
		delivered: { color: "green", text: "Delivered", icon: FaCheckCircle },
		cancelled: { color: "red", text: "Cancelled", icon: FaTimesCircle },
		refunded: { color: "gray", text: "Refunded", icon: FaTimesCircle },
	};

	const config = statusConfig[status] || statusConfig.pending;
	const IconComponent = config.icon;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			<IconComponent className="mr-1 h-4 w-4" />
			{config.text}
		</span>
	);
};

const OrderTimeline = ({
	status,
	orderDate,
	deliveryDate,
	estimatedDelivery,
}) => {
	const steps = [
		{ key: "pending", label: "Order Placed", icon: FaCheckCircle },
		{ key: "confirmed", label: "Order Confirmed", icon: FaCheckCircle },
		{ key: "processing", label: "Processing", icon: FaBoxOpen },
		{ key: "shipped", label: "Shipped", icon: FaTruck },
		{ key: "delivered", label: "Delivered", icon: FaCheckCircle },
	];

	const statusOrder = [
		"pending",
		"confirmed",
		"processing",
		"shipped",
		"delivered",
	];
	const currentIndex = statusOrder.indexOf(status);

	return (
		<div className="bg-white p-6 rounded-lg shadow">
			<h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
			<div className="space-y-4">
				{steps.map((step, index) => {
					const IconComponent = step.icon;
					const isCompleted = index <= currentIndex;
					const isCurrent = index === currentIndex;

					return (
						<div key={step.key} className="flex items-center">
							<div
								className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
									isCompleted
										? "bg-green-100 text-green-600"
										: "bg-gray-100 text-gray-400"
								}`}
							>
								<IconComponent className="h-4 w-4" />
							</div>
							<div className="ml-4 flex-1">
								<p
									className={`text-sm font-medium ${
										isCompleted ? "text-gray-900" : "text-gray-500"
									}`}
								>
									{step.label}
								</p>
								{isCurrent && (
									<p className="text-xs text-gray-500">Current status</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default function OrderDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { currentUser, isConsumer, isSeller, isAgent, isAdmin } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();

	// Fetch order details
	const {
		data: order,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["orderDetails", id],
		async () => {
			try {
				return await apiCall(`/orders/${id}`);
			} catch (error) {
				console.error("Error fetching order details:", error);
				return null;
			}
		},
		{
			enabled: !!id,
		}
	);

	// Mock data for demo
	const mockOrder = {
		id: "ORD-2024-001",
		orderDate: "2024-01-22T10:30:00Z",
		status: "shipped",
		customer: {
			name: "Ahmed Rahman",
			email: "ahmed@example.com",
			phone: "+8801712345678",
			address: "House 45, Road 12, Dhanmondi, Dhaka",
		},
		seller: {
			name: "Green Valley Farms",
			email: "seller@greenvalley.com",
			phone: "+8801812345678",
			farmName: "Green Valley Organic Farm",
		},
		items: [
			{
				id: "ITEM-001",
				productName: "Organic Basmati Rice",
				quantity: 10,
				unit: "kg",
				pricePerUnit: 120,
				totalPrice: 1200,
				image:
					"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
			},
			{
				id: "ITEM-002",
				productName: "Fresh Tomatoes",
				quantity: 2,
				unit: "kg",
				pricePerUnit: 80,
				totalPrice: 160,
				image:
					"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
			},
		],
		subtotal: 1360,
		deliveryCharge: 50,
		tax: 68,
		total: 1478,
		paymentMethod: "bKash",
		paymentStatus: "paid",
		deliveryAddress: "House 45, Road 12, Dhanmondi, Dhaka",
		estimatedDelivery: "2024-01-25T18:00:00Z",
		deliveryDate: null,
		trackingNumber: "TRK-2024-001",
		notes: "Please deliver in the morning between 9-11 AM",
	};

	const displayOrder = order || mockOrder;

	const handleStatusUpdate = async (newStatus) => {
		try {
			await apiCall(`/orders/${id}/status`, "PATCH", { status: newStatus });
			refetch();
			alert(`Order status updated to ${newStatus}`);
		} catch (error) {
			console.error("Error updating order status:", error);
			alert("Failed to update order status");
		}
	};

	const canUpdateStatus = () => {
		return isSeller() || isAgent() || isAdmin();
	};

	const getAvailableStatusUpdates = () => {
		const currentStatus = displayOrder.status;
		const statusFlow = {
			pending: ["confirmed", "cancelled"],
			confirmed: ["processing", "cancelled"],
			processing: ["shipped", "cancelled"],
			shipped: ["delivered"],
			delivered: [],
			cancelled: [],
		};
		return statusFlow[currentStatus] || [];
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!displayOrder) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Order Not Found
					</h2>
					<p className="text-gray-600 mb-6">
						The order you're looking for doesn't exist.
					</p>
					<Link to="/dashboard" className="btn btn-primary">
						<FaArrowLeft className="mr-2" />
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
					>
						<FaArrowLeft className="mr-2" />
						Back
					</button>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Order #{displayOrder.id}
							</h1>
							<p className="text-gray-600">
								<FaCalendarAlt className="inline mr-1" />
								Placed on{" "}
								{new Date(displayOrder.orderDate).toLocaleDateString()}
							</p>
						</div>
						<div className="mt-4 md:mt-0">
							<StatusBadge status={displayOrder.status} />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Order Items */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Order Items
							</h2>
							<div className="space-y-4">
								{displayOrder.items.map((item) => (
									<div
										key={item.id}
										className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
									>
										<img
											src={item.image}
											alt={item.productName}
											className="w-16 h-16 object-cover rounded-lg"
										/>
										<div className="flex-1">
											<h3 className="font-medium text-gray-900">
												{item.productName}
											</h3>
											<p className="text-sm text-gray-600">
												{item.quantity} {item.unit} × ৳{item.pricePerUnit}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium text-gray-900">
												৳{item.totalPrice.toLocaleString()}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Customer Information */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								<FaUser className="inline mr-2" />
								Customer Information
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="font-medium text-gray-900">
										{displayOrder.customer.name}
									</p>
									<p className="text-sm text-gray-600">
										<FaEnvelope className="inline mr-1" />
										{displayOrder.customer.email}
									</p>
									<p className="text-sm text-gray-600">
										<FaPhone className="inline mr-1" />
										{displayOrder.customer.phone}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										<FaMapMarkerAlt className="inline mr-1" />
										<strong>Delivery Address:</strong>
									</p>
									<p className="text-sm text-gray-600">
										{displayOrder.deliveryAddress}
									</p>
								</div>
							</div>
						</div>

						{/* Seller Information */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Seller Information
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="font-medium text-gray-900">
										{displayOrder.seller.farmName}
									</p>
									<p className="text-sm text-gray-600">
										Contact: {displayOrder.seller.name}
									</p>
									<p className="text-sm text-gray-600">
										<FaEnvelope className="inline mr-1" />
										{displayOrder.seller.email}
									</p>
									<p className="text-sm text-gray-600">
										<FaPhone className="inline mr-1" />
										{displayOrder.seller.phone}
									</p>
								</div>
							</div>
						</div>

						{/* Special Notes */}
						{displayOrder.notes && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h3 className="font-medium text-blue-900 mb-2">
									Special Instructions
								</h3>
								<p className="text-blue-800">{displayOrder.notes}</p>
							</div>
						)}

						{/* Actions */}
						{canUpdateStatus() && (
							<div className="bg-white rounded-lg shadow p-6">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									Order Actions
								</h2>
								<div className="flex flex-wrap gap-3">
									{getAvailableStatusUpdates().map((status) => (
										<button
											key={status}
											onClick={() => handleStatusUpdate(status)}
											disabled={apiLoading}
											className={`btn ${
												status === "cancelled"
													? "btn-outline-red"
													: "btn-primary"
											}`}
										>
											Update to{" "}
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Order Summary */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Order Summary
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Subtotal</span>
									<span className="font-medium">
										৳{displayOrder.subtotal.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Delivery Charge</span>
									<span className="font-medium">
										৳{displayOrder.deliveryCharge}
									</span>
								</div>
								{displayOrder.tax > 0 && (
									<div className="flex justify-between">
										<span className="text-gray-600">Tax</span>
										<span className="font-medium">৳{displayOrder.tax}</span>
									</div>
								)}
								<div className="border-t pt-3">
									<div className="flex justify-between">
										<span className="text-lg font-semibold">Total</span>
										<span className="text-lg font-semibold">
											৳{displayOrder.total.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Payment Information */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								<FaMoneyBillWave className="inline mr-2" />
								Payment Information
							</h2>
							<div className="space-y-2">
								<p className="text-sm">
									<strong>Method:</strong> {displayOrder.paymentMethod}
								</p>
								<p className="text-sm">
									<strong>Status:</strong>{" "}
									<span
										className={`font-medium ${
											displayOrder.paymentStatus === "paid"
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{displayOrder.paymentStatus.charAt(0).toUpperCase() +
											displayOrder.paymentStatus.slice(1)}
									</span>
								</p>
								{displayOrder.trackingNumber && (
									<p className="text-sm">
										<strong>Tracking:</strong> {displayOrder.trackingNumber}
									</p>
								)}
							</div>
						</div>

						{/* Order Timeline */}
						<OrderTimeline
							status={displayOrder.status}
							orderDate={displayOrder.orderDate}
							deliveryDate={displayOrder.deliveryDate}
							estimatedDelivery={displayOrder.estimatedDelivery}
						/>

						{/* Quick Actions */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Quick Actions
							</h2>
							<div className="space-y-3">
								<button className="w-full btn btn-outline-primary">
									<FaDownload className="mr-2" />
									Download Invoice
								</button>
								{displayOrder.status === "delivered" && isConsumer() && (
									<button className="w-full btn btn-outline-secondary">
										<FaStar className="mr-2" />
										Rate & Review
									</button>
								)}
								{(displayOrder.status === "pending" ||
									displayOrder.status === "confirmed") &&
									isConsumer() && (
										<button className="w-full btn btn-outline-red">
											<FaTimesCircle className="mr-2" />
											Cancel Order
										</button>
									)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
