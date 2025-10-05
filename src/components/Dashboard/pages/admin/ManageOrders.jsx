import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaReceipt,
	FaSearch,
	FaEye,
	FaCheck,
	FaTimes,
	FaTruck,
	FaExclamationTriangle,
	FaUser,
	FaCalendarAlt,
	FaMoneyBillWave,
	FaClock,
	FaCheckCircle,
	FaTimesCircle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useOrders from "../../../../hooks/useOrders";
import { toast } from "react-hot-toast";
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

const PaymentBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
		paid: { color: "bg-green-100 text-green-800", text: "Paid" },
		failed: { color: "bg-red-100 text-red-800", text: "Failed" },
		refunded: { color: "bg-gray-100 text-gray-800", text: "Refunded" },
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
		>
			{config.text}
		</span>
	);
};

export default function ManageOrders() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { fetchAllOrders, updateStatus, loading } = useOrders();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [userFilter, setUserFilter] = useState("");
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [showOrderModal, setShowOrderModal] = useState(false);
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState(null);

	// Fetch all orders using admin API
	useEffect(() => {
		const loadAllOrders = async () => {
			setIsLoading(true);
			try {
				const response = await fetchAllOrders({
					page: 1,
					limit: 20,
					...(statusFilter !== "all" && { status: statusFilter }),
					...(userFilter && { userId: userFilter }),
				});

				if (response.success) {
					setOrders(response.orders || []);
					setPagination(response.pagination);
				}
			} catch (error) {
				console.error("Error fetching all orders:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadAllOrders();
	}, [statusFilter, userFilter, fetchAllOrders]);

	// Mock data for demo
	const mockOrders = [
		{
			id: "ORD-001",
			orderNumber: "SAC-2024-001",
			customer: {
				id: "CUST-001",
				name: "Rahman Chowdhury",
				email: "rahman.chowdhury@example.com",
				phone: "+8801712345678",
			},
			seller: {
				id: "SELLER-001",
				name: "Ahmed Rahman",
				farmName: "Rahman Rice Farm",
			},
			agent: {
				id: "AGENT-001",
				name: "Mohammad Ali",
				region: "Dhaka Division",
			},
			products: [
				{
					id: "PROD-001",
					name: "Premium Basmati Rice",
					quantity: 100,
					unit: "kg",
					price: 850,
					total: 85000,
				},
			],
			status: "confirmed",
			paymentStatus: "paid",
			totalAmount: 85000,
			shippingCost: 500,
			grandTotal: 85500,
			orderDate: "2024-01-20T10:30:00Z",
			deliveryDate: "2024-01-25T00:00:00Z",
			shippingAddress: {
				address: "House 123, Road 456",
				city: "Dhaka",
				district: "Dhaka",
				postalCode: "1000",
			},
		},
		{
			id: "ORD-002",
			orderNumber: "SAC-2024-002",
			customer: {
				id: "CUST-002",
				name: "Fatima Khatun",
				email: "fatima.khatun@example.com",
				phone: "+8801812345678",
			},
			seller: {
				id: "SELLER-002",
				name: "Rashida Begum",
				farmName: "Green Valley Farm",
			},
			agent: null,
			products: [
				{
					id: "PROD-002",
					name: "Fresh Tomatoes",
					quantity: 20,
					unit: "kg",
					price: 120,
					total: 2400,
				},
			],
			status: "pending",
			paymentStatus: "pending",
			totalAmount: 2400,
			shippingCost: 200,
			grandTotal: 2600,
			orderDate: "2024-01-22T14:15:00Z",
			deliveryDate: null,
			shippingAddress: {
				address: "Flat 5B, Building 789",
				city: "Chittagong",
				district: "Chittagong",
				postalCode: "4000",
			},
		},
		{
			id: "ORD-003",
			orderNumber: "SAC-2024-003",
			customer: {
				id: "CUST-003",
				name: "Karim Uddin",
				email: "karim.uddin@example.com",
				phone: "+8801912345678",
			},
			seller: {
				id: "SELLER-003",
				name: "Abdul Karim",
				farmName: "River Fresh Fish",
			},
			agent: {
				id: "AGENT-002",
				name: "Nazrul Islam",
				region: "Rajshahi Division",
			},
			products: [
				{
					id: "PROD-003",
					name: "Hilsa Fish",
					quantity: 5,
					unit: "kg",
					price: 1200,
					total: 6000,
				},
			],
			status: "delivered",
			paymentStatus: "paid",
			totalAmount: 6000,
			shippingCost: 300,
			grandTotal: 6300,
			orderDate: "2024-01-18T16:45:00Z",
			deliveryDate: "2024-01-21T11:30:00Z",
			shippingAddress: {
				address: "Village Kamarpara",
				city: "Manikganj",
				district: "Dhaka",
				postalCode: "1800",
			},
		},
	];

	// Use real orders if available, otherwise show mock data
	const displayOrders = orders.length > 0 ? orders : mockOrders;

	// Filter orders based on search term (API already filters by status and user)
	useEffect(() => {
		let filtered = displayOrders;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(order) =>
					order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					order.userId?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		setFilteredOrders(filtered);
	}, [displayOrders, searchTerm]);

	const handleOrderAction = async (orderId, newStatus) => {
		try {
			const response = await updateStatus(orderId, newStatus);
			if (response.success) {
				toast.success(`Order ${newStatus} successfully`);
				// Refresh orders after status update
				const refreshResponse = await fetchAllOrders({
					page: 1,
					limit: 20,
					...(statusFilter !== "all" && { status: statusFilter }),
					...(userFilter && { userId: userFilter }),
				});

				if (refreshResponse.success) {
					setOrders(refreshResponse.orders || []);
				}
			}
		} catch (error) {
			toast.error(`Failed to update order status`);
		}
	};

	const getOrderStats = () => {
		const stats = {
			total: displayOrders.length,
			pending: displayOrders?.filter((o) => o.status === "pending").length,
			confirmed: displayOrders?.filter((o) => o.status === "confirmed").length,
			processing: displayOrders?.filter((o) => o.status === "processing")
				.length,
			shipped: displayOrders?.filter((o) => o.status === "shipped").length,
			delivered: displayOrders?.filter((o) => o.status === "delivered").length,
			totalRevenue: displayOrders.reduce(
				(sum, order) => sum + order.grandTotal,
				0
			),
		};
		return stats;
	};

	const stats = getOrderStats();

	const OrderModal = ({ order, onClose }) => (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
				<div className="flex justify-between items-center pb-4 border-b">
					<h3 className="text-lg font-bold text-gray-900">Order Details</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<FaTimes className="h-6 w-6" />
					</button>
				</div>

				<div className="mt-4 space-y-4">
					{/* Order Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-medium text-gray-500">Order Number</p>
							<p className="text-lg font-semibold">{order.orderNumber}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Status</p>
							<StatusBadge status={order.status} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">
								Payment Status
							</p>
							<PaymentBadge status={order.paymentStatus} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Total Amount</p>
							<p className="text-lg font-semibold">
								৳{order.grandTotal?.toLocaleString()}
							</p>
						</div>
					</div>

					{/* Customer Info */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h4 className="font-medium text-gray-900 mb-2">
							Customer Information
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							<p>
								<span className="font-medium">Name:</span> {order.customer.name}
							</p>
							<p>
								<span className="font-medium">Email:</span>{" "}
								{order.customer.email}
							</p>
							<p>
								<span className="font-medium">Phone:</span>{" "}
								{order.customer.phone}
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-3 pt-4 border-t">
						{order.status === "pending" && (
							<button
								onClick={() => {
									handleOrderAction(order.id, "confirm");
									onClose();
								}}
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
							>
								<FaCheck className="inline mr-1" /> Confirm
							</button>
						)}
						{order.status === "confirmed" && (
							<button
								onClick={() => {
									handleOrderAction(order.id, "process");
									onClose();
								}}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								<FaTruck className="inline mr-1" /> Process
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Orders" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Manage Orders" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaReceipt className="h-6 w-6 text-gray-400" />
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
								<FaExclamationTriangle className="h-6 w-6 text-yellow-400" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Pending
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
								<FaCheck className="h-6 w-6 text-green-400" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Delivered
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.delivered}
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
								<FaMoneyBillWave className="h-6 w-6 text-green-400" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Revenue
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										৳{stats.totalRevenue?.toLocaleString()}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
						{/* Search */}
						<div className="relative">
							<FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search orders..."
								className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* Status Filter */}
						<select
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
						</select>

						{/* User Filter */}
						<input
							type="text"
							placeholder="Filter by User ID..."
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							value={userFilter}
							onChange={(e) => setUserFilter(e.target.value)}
						/>

						{/* Clear Filters */}
						<button
							onClick={() => {
								setSearchTerm("");
								setStatusFilter("all");
								setUserFilter("");
							}}
							className="btn btn-outline"
						>
							Clear Filters
						</button>
					</div>

					{/* Pagination Info */}
					{pagination && (
						<div className="mt-4 text-sm text-gray-600">
							Showing {pagination.currentPage} of {pagination.totalPages} pages
							({pagination.totalItems} total orders)
						</div>
					)}
				</div>
			</div>

			{/* Orders Table */}
			<div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
				<ul className="divide-y divide-gray-200">
					{filteredOrders.map((order) => (
						<li key={order._id || order.id}>
							<div className="px-4 py-4 flex items-center justify-between">
								<div className="flex items-center min-w-0 flex-1">
									<div className="ml-4 flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-lg font-medium text-gray-900 truncate">
													{order.orderNumber}
												</p>
												<p className="text-sm text-gray-500 truncate">
													{order.userEmail
														? `Customer: ${order.userEmail}`
														: order.customer
														? `Customer: ${order.customer.name}`
														: `User ID: ${order.userId}`}
												</p>
												<div className="mt-1 flex items-center space-x-2">
													<StatusBadge status={order.status} />
													{order.paymentStatus && (
														<PaymentBadge status={order.paymentStatus} />
													)}
												</div>
											</div>
											<div className="ml-4 text-right">
												<p className="text-lg font-bold text-gray-900">
													৳
													{(
														order.totalAmount || order.grandTotal
													)?.toLocaleString()}
												</p>
												<p className="text-sm text-gray-500">
													{new Date(
														order.createdAt || order.orderDate
													).toLocaleDateString()}
												</p>
											</div>
										</div>

										{/* Additional Info */}
										<div className="mt-2 flex items-center text-sm text-gray-500">
											<FaUser className="mr-1 h-3 w-3" />
											{order.seller ? (
												<span>Seller: {order.seller.name}</span>
											) : (
												<span>Items: {order.items?.length || 0}</span>
											)}
											{order.agent && (
												<>
													<span className="mx-2">•</span>
													<span>Agent: {order.agent.name}</span>
												</>
											)}
											{order.paymentMethod && (
												<>
													<span className="mx-2">•</span>
													<span>Payment: {order.paymentMethod}</span>
												</>
											)}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="ml-6 flex items-center space-x-2">
									<button
										onClick={() => {
											setSelectedOrder(order);
											setShowOrderModal(true);
										}}
										className="text-primary-600 hover:text-primary-900"
										title="View Details"
									>
										<FaEye className="h-5 w-5" />
									</button>

									{order.status === "pending" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "confirmed")
											}
											className="text-green-600 hover:text-green-900"
											title="Confirm Order"
											disabled={loading}
										>
											<FaCheck className="h-5 w-5" />
										</button>
									)}

									{order.status === "confirmed" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "processing")
											}
											className="text-blue-600 hover:text-blue-900"
											title="Process Order"
											disabled={loading}
										>
											<FaTruck className="h-5 w-5" />
										</button>
									)}

									{order.status === "processing" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "shipped")
											}
											className="text-purple-600 hover:text-purple-900"
											title="Mark as Shipped"
											disabled={loading}
										>
											<FaTruck className="h-5 w-5" />
										</button>
									)}

									{order.status === "shipped" && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "delivered")
											}
											className="text-green-600 hover:text-green-900"
											title="Mark as Delivered"
											disabled={loading}
										>
											<FaCheckCircle className="h-5 w-5" />
										</button>
									)}

									{["pending", "confirmed"].includes(order.status) && (
										<button
											onClick={() =>
												handleOrderAction(order._id || order.id, "cancelled")
											}
											className="text-red-600 hover:text-red-900"
											title="Cancel Order"
											disabled={loading}
										>
											<FaTimes className="h-5 w-5" />
										</button>
									)}
								</div>
							</div>
						</li>
					))}
				</ul>

				{filteredOrders.length === 0 && (
					<div className="text-center py-12">
						<FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No orders found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Try adjusting your search criteria.
						</p>
					</div>
				)}
			</div>

			{/* Order Modal */}
			{showOrderModal && selectedOrder && (
				<OrderModal
					order={selectedOrder}
					onClose={() => {
						setShowOrderModal(false);
						setSelectedOrder(null);
					}}
				/>
			)}
		</div>
	);
}
