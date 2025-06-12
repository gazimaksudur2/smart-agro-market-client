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
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending Review" },
		accepted: { color: "green", text: "Accepted" },
		rejected: { color: "red", text: "Rejected" },
		processing: { color: "blue", text: "Processing" },
		shipped: { color: "purple", text: "Shipped" },
		delivered: { color: "green", text: "Delivered" },
		cancelled: { color: "gray", text: "Cancelled" },
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
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
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [selectedOrder, setSelectedOrder] = useState(null);

	// Fetch seller orders
	const {
		data: orders,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["sellerOrders", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];
			try {
				return await apiCall(`/orders/seller/${currentUser.FirebaseUser.uid}`);
			} catch (error) {
				console.error("Error fetching seller orders:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

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

	const displayOrders = orders || mockOrders;

	// Filter orders
	useEffect(() => {
		let filtered = displayOrders;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(order) =>
					order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
					order.customer.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					order.items.some((item) =>
						item.productName.toLowerCase().includes(searchTerm.toLowerCase())
					)
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((order) => order.status === statusFilter);
		}

		// Priority filter
		if (priorityFilter !== "all") {
			filtered = filtered.filter((order) => order.priority === priorityFilter);
		}

		setFilteredOrders(filtered);
	}, [displayOrders, searchTerm, statusFilter, priorityFilter]);

	const handleOrderAction = async (orderId, action) => {
		try {
			await apiCall(`/orders/${orderId}/${action}`, "PATCH");
			refetch();
			alert(`Order ${action} successfully!`);
		} catch (error) {
			console.error(`Error ${action} order:`, error);
			alert(`Failed to ${action} order. Please try again.`);
		}
	};

	const getOrderStats = () => {
		return {
			total: filteredOrders.length,
			pending: filteredOrders.filter((order) => order.status === "pending")
				.length,
			accepted: filteredOrders.filter((order) => order.status === "accepted")
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
										Accepted
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.accepted}
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaSearch className="inline mr-1" />
							Search Orders
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by order ID, customer, or product..."
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
							<option value="pending">Pending Review</option>
							<option value="accepted">Accepted</option>
							<option value="rejected">Rejected</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Priority
						</label>
						<select
							value={priorityFilter}
							onChange={(e) => setPriorityFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Priorities</option>
							<option value="high">High Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="low">Low Priority</option>
						</select>
					</div>
				</div>
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
							<div key={order.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h4 className="text-lg font-medium text-gray-900">
											Order #{order.id}
										</h4>
										<p className="text-sm text-gray-500">
											Ordered on{" "}
											{new Date(order.orderDate).toLocaleDateString()}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<PriorityBadge priority={order.priority} />
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
												<strong>Name:</strong> {order.customer.name}
											</p>
											<p>
												<strong>Email:</strong> {order.customer.email}
											</p>
										</div>
										<div>
											<p>
												<FaPhone className="inline mr-1" />
												<strong>Phone:</strong> {order.customer.phone}
											</p>
											<p>
												<FaMapMarkerAlt className="inline mr-1" />
												<strong>Address:</strong> {order.customer.address}
											</p>
										</div>
									</div>
								</div>

								{/* Order Items */}
								<div className="mb-4">
									<h5 className="font-medium text-gray-900 mb-2">
										Order Items
									</h5>
									<div className="space-y-2">
										{order.items.map((item, index) => (
											<div
												key={index}
												className="flex items-center justify-between bg-white p-3 rounded border"
											>
												<div>
													<p className="font-medium text-gray-900">
														{item.productName}
													</p>
													<p className="text-sm text-gray-500">
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

								{/* Order Summary */}
								<div className="mb-4 p-4 bg-blue-50 rounded-lg">
									<div className="flex justify-between items-center text-sm">
										<span>Subtotal:</span>
										<span>৳{order.totalAmount.toLocaleString()}</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span>Delivery Charge:</span>
										<span>৳{order.deliveryCharge}</span>
									</div>
									<div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
										<span>Total:</span>
										<span>৳{order.grandTotal.toLocaleString()}</span>
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
												onClick={() => handleOrderAction(order.id, "accept")}
												disabled={apiLoading}
												className="btn btn-success btn-sm"
											>
												<FaCheck className="mr-1 h-4 w-4" />
												Accept Order
											</button>
											<button
												onClick={() => handleOrderAction(order.id, "reject")}
												disabled={apiLoading}
												className="btn btn-outline-red btn-sm"
											>
												<FaTimes className="mr-1 h-4 w-4" />
												Reject Order
											</button>
										</>
									)}

									{order.status === "accepted" && (
										<button
											onClick={() => handleOrderAction(order.id, "process")}
											disabled={apiLoading}
											className="btn btn-primary btn-sm"
										>
											Start Processing
										</button>
									)}

									{order.status === "processing" && (
										<button
											onClick={() => handleOrderAction(order.id, "ship")}
											disabled={apiLoading}
											className="btn btn-secondary btn-sm"
										>
											Mark as Shipped
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
