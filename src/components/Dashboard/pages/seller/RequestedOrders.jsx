import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaClipboardList,
	FaSearch,
	FaFilter,
	FaEye,
	FaCheck,
	FaTimes,
	FaClock,
	FaMoneyBillWave,
	FaUser,
	FaMapMarkerAlt,
	FaPhone,
	FaTruck,
	FaCheckCircle,
	FaTimesCircle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useOrders from "../../../../hooks/useOrders";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
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
		processing: {
			color: "bg-orange-100 text-orange-800",
			icon: <FaClock className="h-3 w-3" />,
			label: "Processing",
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

const PriorityBadge = ({ priority }) => {
	const priorityConfig = {
		high: { color: "red", text: "High Priority" },
		medium: { color: "yellow", text: "Medium Priority" },
		low: { color: "green", text: "Low Priority" },
	};

	const config = priorityConfig[priority] || priorityConfig.medium;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

export default function RequestedOrders() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { fetchSellerOrders, updateStatus, loading } = useOrders();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState(null);

	// Fetch seller orders using the API according to documentation
	useEffect(() => {
		const loadSellerOrders = async () => {
			if (!currentUser?.DBUser?._id) return;

			setIsLoading(true);
			try {
				const response = await fetchSellerOrders(currentUser.DBUser.email, {
					page: 1,
					limit: 20,
					...(statusFilter !== "all" && { status: statusFilter }),
				});

				if (response?.success) {
					setOrders(response.orders || []);
					setPagination(response.pagination || null);
				} else {
					// Fallback in case backend doesn't send success flag
					setOrders(response?.orders || []);
					setPagination(response?.pagination || null);
				}
			} catch (error) {
				console.error("Error fetching seller orders:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadSellerOrders();
	}, [currentUser?.DBUser?._id, statusFilter, fetchSellerOrders]);

	// Mock data for demo
	const mockOrders = [
		{
			id: "ORD-2024-001",
			orderDate: "2024-01-22",
			customer: {
				name: "Ahmed Rahman",
				email: "ahmed@example.com",
				phone: "+8801712345678",
				address: "House 45, Road 12, Dhanmondi, Dhaka",
			},
			items: [
				{
					productId: "PROD-001",
					productName: "Organic Basmati Rice",
					quantity: 10,
					unit: "kg",
					pricePerUnit: 120,
					totalPrice: 1200,
				},
			],
			totalAmount: 1200,
			deliveryCharge: 50,
			grandTotal: 1250,
			status: "pending",
			priority: "high",
			paymentMethod: "bKash",
			deliveryAddress: "House 45, Road 12, Dhanmondi, Dhaka",
			requestedDeliveryDate: "2024-01-25",
			notes: "Please deliver in the morning between 9-11 AM",
		},
		{
			id: "ORD-2024-002",
			orderDate: "2024-01-21",
			customer: {
				name: "Fatima Khatun",
				email: "fatima@example.com",
				phone: "+8801812345678",
				address: "Apartment 3B, Green View, Gulshan, Dhaka",
			},
			items: [
				{
					productId: "PROD-002",
					productName: "Fresh Tomatoes",
					quantity: 5,
					unit: "kg",
					pricePerUnit: 80,
					totalPrice: 400,
				},
				{
					productId: "PROD-003",
					productName: "Organic Spinach",
					quantity: 2,
					unit: "bundle",
					pricePerUnit: 25,
					totalPrice: 50,
				},
			],
			totalAmount: 450,
			deliveryCharge: 30,
			grandTotal: 480,
			status: "accepted",
			priority: "medium",
			paymentMethod: "Cash on Delivery",
			deliveryAddress: "Apartment 3B, Green View, Gulshan, Dhaka",
			requestedDeliveryDate: "2024-01-24",
		},
		{
			id: "ORD-2024-003",
			orderDate: "2024-01-20",
			customer: {
				name: "Mohammad Ali",
				email: "ali@example.com",
				phone: "+8801912345678",
				address: "Village: Savar, Upazila: Savar, Dhaka",
			},
			items: [
				{
					productId: "PROD-004",
					productName: "Premium Potatoes",
					quantity: 20,
					unit: "kg",
					pricePerUnit: 45,
					totalPrice: 900,
				},
			],
			totalAmount: 900,
			deliveryCharge: 80,
			grandTotal: 980,
			status: "processing",
			priority: "low",
			paymentMethod: "Nagad",
			deliveryAddress: "Village: Savar, Upazila: Savar, Dhaka",
			requestedDeliveryDate: "2024-01-26",
		},
	];

	// Use real orders if available, otherwise show mock data
	const displayOrders = orders.length > 0 ? orders : mockOrders;

	// Filter orders based on search term (API already filters by status)
	useEffect(() => {
		let filtered = displayOrders;

		// Search filter
		if (searchTerm) {
			const q = searchTerm.toLowerCase();
			filtered = filtered.filter((order) => {
				const inId =
					order.orderNumber?.toLowerCase().includes(q) ||
					order._id?.toLowerCase().includes(q);
				const inEmail =
					order.userEmail?.toLowerCase().includes(q) ||
					order.shippingDetails?.email?.toLowerCase().includes(q);
				const inName =
					order.shippingDetails?.fullName?.toLowerCase().includes(q) ||
					order.customer?.name?.toLowerCase().includes(q);
				const inItems = order.items?.some((item) =>
					item.productId?.toLowerCase().includes(q)
				);
				return inId || inEmail || inName || inItems;
			});
		}

		setFilteredOrders(filtered);
	}, [displayOrders, searchTerm]);

	const handleOrderAction = async (orderId, newStatus) => {
		try {
			const response = await updateStatus(orderId, newStatus);
			if (response.success) {
				// Refresh orders after status update
				const refreshResponse = await fetchSellerOrders(
					currentUser.DBUser.email,
					{
						page: 1,
						limit: 20,
						...(statusFilter !== "all" && { status: statusFilter }),
					}
				);

				if (refreshResponse.success) {
					setOrders(refreshResponse.orders || []);
				}
			}
		} catch (error) {
			console.error(`Error updating order status:`, error);
		}
	};

	const getOrderStats = () => {
		return {
			total: filteredOrders.length,
			pending: filteredOrders.filter((order) => order.status === "pending")
				.length,
			confirmed: filteredOrders.filter((order) => order.status === "confirmed")
				.length,
			processing: filteredOrders.filter(
				(order) => order.status === "processing"
			).length,
			totalRevenue: filteredOrders.reduce(
				(sum, order) => sum + order.grandTotal,
				0
			),
		};
	};

	const stats = getOrderStats();

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Requested Orders" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="">
			<DashboardTitle title="Requested Orders" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaClipboardList className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Orders
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.total}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaClock className="h-6 w-6 text-yellow-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Pending Review
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.pending}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaCheck className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Confirmed
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.confirmed}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaMoneyBillWave className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Revenue
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										৳{stats.totalRevenue.toLocaleString()}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow rounded-lg p-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaSearch className="inline mr-1" />
							Search Orders
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by order number, customer email, or product ID..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaFilter className="inline mr-1" />
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				</div>

				{/* Pagination Info */}
				{pagination && (
					<div className="mt-4 text-sm text-gray-600">
						Showing {pagination.page || pagination.currentPage || 1} of{" "}
						{pagination.totalPages || 1} pages (
						{pagination.total || pagination.totalItems || displayOrders.length}{" "}
						total orders)
					</div>
				)}
			</div>

			{/* Orders List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">Order Requests</h3>
				</div>

				{filteredOrders.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No orders found matching your criteria.</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredOrders.map((order) => (
							<div key={order._id || order.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h4 className="text-lg font-medium text-gray-900">
											Order #{order.orderNumber || order.id}
										</h4>
										<p className="text-sm text-gray-500">
											Ordered on{" "}
											{new Date(
												order.createdAt || order.orderDate
											).toLocaleDateString()}
										</p>
										{order.userEmail && (
											<p className="text-sm text-gray-500">
												Customer: {order.userEmail}
											</p>
										)}
									</div>
									<div className="flex items-center space-x-2">
										{order.priority && (
											<PriorityBadge priority={order.priority} />
										)}
										<StatusBadge status={order.status} />
									</div>
								</div>

								{/* Customer Info */}
								<div className="mb-4 p-4 bg-gray-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaUser className="inline mr-1" />
										Customer Information
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p>
												<strong>Name:</strong>{" "}
												{order.shippingDetails?.fullName ||
													order.customer?.name ||
													"N/A"}
											</p>
											<p>
												<strong>Email:</strong>{" "}
												{order.shippingDetails?.email ||
													order.customer?.email ||
													order.userEmail ||
													"N/A"}
											</p>
										</div>
										<div>
											<p>
												<FaPhone className="inline mr-1" />
												<strong>Phone:</strong>{" "}
												{order.shippingDetails?.phone ||
													order.customer?.phone ||
													"N/A"}
											</p>
											<p>
												<FaMapMarkerAlt className="inline mr-1" />
												<strong>Address:</strong>{" "}
												{order.shippingDetails?.address ||
													order.customer?.address ||
													"N/A"}
											</p>
										</div>
									</div>
								</div>

								{/* Order Items */}
								<div className="mb-4">
									<h5 className="font-medium text-gray-900 mb-2">
										Order Items ({order.items?.length || 0})
									</h5>
									<div className="space-y-2">
										{order.items?.map((item, index) => (
											<div
												key={index}
												className="flex items-center justify-between bg-white p-3 rounded border"
											>
												<div>
													<p className="font-medium text-gray-900">
														{item.productName ||
															`Product ${item.productId?.slice(-4)}`}
													</p>
													<p className="text-sm text-gray-500">
														{item.quantity} {item.unit || "units"} × ৳
														{item.price || item.pricePerUnit}
													</p>
													{item.sellerId && (
														<p className="text-xs text-gray-400">
															Seller ID: {item.sellerId.slice(-6)}
														</p>
													)}
												</div>
												<div className="text-right">
													<p className="font-medium text-gray-900">
														৳
														{(
															item.totalPrice || item.price * item.quantity
														).toLocaleString()}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Summary */}
								<div className="mb-4 p-4 bg-blue-50 rounded-lg">
									{order.subtotal && (
										<div className="flex justify-between items-center text-sm">
											<span>Subtotal:</span>
											<span>৳{order.subtotal.toLocaleString()}</span>
										</div>
									)}
									{(order.shippingCost || order.deliveryCharge) && (
										<div className="flex justify-between items-center text-sm">
											<span>Delivery Charge:</span>
											<span>৳{order.shippingCost || order.deliveryCharge}</span>
										</div>
									)}
									<div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
										<span>Total:</span>
										<span>
											৳
											{(
												order.totalAmount || order.grandTotal
											)?.toLocaleString()}
										</span>
									</div>
								</div>

								{/* Order Details */}
								<div className="mb-4 text-sm text-gray-600">
									<p>
										<strong>Payment Method:</strong> {order.paymentMethod}
									</p>
									<p>
										<strong>Requested Delivery Date:</strong>{" "}
										{new Date(order.requestedDeliveryDate).toLocaleDateString()}
									</p>
									{order.notes && (
										<p>
											<strong>Special Notes:</strong> {order.notes}
										</p>
									)}
								</div>

								{/* Action Buttons */}
								<div className="flex items-center space-x-3">
									<button
										onClick={() => setSelectedOrder(order)}
										className="btn btn-outline-primary btn-sm"
									>
										<FaEye className="mr-1 h-4 w-4" />
										View Details
									</button>

									{order.status === "pending" && (
										<>
											<button
												onClick={() =>
													handleOrderAction(order._id || order.id, "confirmed")
												}
												disabled={loading}
												className="btn btn-success btn-sm"
											>
												<FaCheck className="mr-1 h-4 w-4" />
												Confirm Order
											</button>
											<button
												onClick={() =>
													handleOrderAction(order._id || order.id, "cancelled")
												}
												disabled={loading}
												className="btn btn-outline-red btn-sm"
											>
												<FaTimes className="mr-1 h-4 w-4" />
												Cancel Order
											</button>
										</>
									)}

									{order.status === "confirmed" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "processing")
											}
											disabled={loading}
											className="btn btn-primary btn-sm"
										>
											<FaClock className="mr-1 h-4 w-4" />
											Start Processing
										</button>
									)}

									{order.status === "processing" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "shipped")
											}
											disabled={loading}
											className="btn btn-secondary btn-sm"
										>
											<FaTruck className="mr-1 h-4 w-4" />
											Mark as Shipped
										</button>
									)}

									{order.status === "shipped" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "delivered")
											}
											disabled={loading}
											className="btn btn-success btn-sm"
										>
											<FaCheckCircle className="mr-1 h-4 w-4" />
											Mark as Delivered
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Order Detail Modal */}
			{selectedOrder && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Order Details - #{selectedOrder.id}
								</h3>
								<button
									onClick={() => setSelectedOrder(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							{/* Modal content would go here - similar to the order details above */}
							<div className="text-sm text-gray-600">
								<p>Detailed order information would be displayed here...</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
