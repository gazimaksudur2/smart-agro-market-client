import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	FaShoppingBag,
	FaCalendarAlt,
	FaMoneyBillWave,
	FaSearch,
	FaFilter,
	FaEye,
	FaDownload,
	FaStar,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending" },
		confirmed: { color: "blue", text: "Confirmed" },
		processing: { color: "purple", text: "Processing" },
		shipped: { color: "indigo", text: "Shipped" },
		delivered: { color: "green", text: "Delivered" },
		cancelled: { color: "red", text: "Cancelled" },
		refunded: { color: "gray", text: "Refunded" },
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

export default function MyPurchases() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState("all");
	const [filteredPurchases, setFilteredPurchases] = useState([]);

	// Fetch purchases
	const {
		data: purchases,
		isLoading,
		error,
	} = useQuery(
		["userPurchases", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];
			try {
				return await apiCall(`/orders/user/${currentUser.FirebaseUser.uid}`);
			} catch (error) {
				console.error("Error fetching purchases:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	// Mock data for demo
	const mockPurchases = [
		{
			id: "PUR-2024-001",
			orderDate: "2024-01-15",
			items: [
				{
					productName: "Organic Basmati Rice",
					quantity: 5,
					unit: "kg",
					price: 120,
					seller: "Green Valley Farms",
				},
				{
					productName: "Fresh Tomatoes",
					quantity: 2,
					unit: "kg",
					price: 80,
					seller: "Sunny Gardens",
				},
			],
			totalAmount: 760,
			status: "delivered",
			deliveryDate: "2024-01-18",
			paymentMethod: "bKash",
		},
		{
			id: "PUR-2024-002",
			orderDate: "2024-01-20",
			items: [
				{
					productName: "Premium Potatoes",
					quantity: 10,
					unit: "kg",
					price: 45,
					seller: "Farm Fresh Co.",
				},
			],
			totalAmount: 450,
			status: "shipped",
			estimatedDelivery: "2024-01-23",
			paymentMethod: "Nagad",
		},
		{
			id: "PUR-2024-003",
			orderDate: "2024-01-22",
			items: [
				{
					productName: "Organic Spinach",
					quantity: 1,
					unit: "bundle",
					price: 25,
					seller: "Green Leaf Farms",
				},
				{
					productName: "Fresh Carrots",
					quantity: 3,
					unit: "kg",
					price: 60,
					seller: "Harvest Time",
				},
			],
			totalAmount: 205,
			status: "processing",
			paymentMethod: "Cash on Delivery",
		},
	];

	const displayPurchases = purchases || mockPurchases;

	// Filter purchases
	useEffect(() => {
		let filtered = displayPurchases;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(purchase) =>
					purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
					purchase.items.some((item) =>
						item.productName.toLowerCase().includes(searchTerm.toLowerCase())
					) ||
					purchase.items.some((item) =>
						item.seller.toLowerCase().includes(searchTerm.toLowerCase())
					)
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter(
				(purchase) => purchase.status === statusFilter
			);
		}

		// Date filter
		if (dateFilter !== "all") {
			const now = new Date();
			let filterDate = new Date();

			switch (dateFilter) {
				case "week":
					filterDate.setDate(now.getDate() - 7);
					break;
				case "month":
					filterDate.setMonth(now.getMonth() - 1);
					break;
				case "3months":
					filterDate.setMonth(now.getMonth() - 3);
					break;
				default:
					filterDate = null;
			}

			if (filterDate) {
				filtered = filtered.filter(
					(purchase) => new Date(purchase.orderDate) >= filterDate
				);
			}
		}

		setFilteredPurchases(filtered);
	}, [displayPurchases, searchTerm, statusFilter, dateFilter]);

	const calculateTotalSpent = () => {
		return filteredPurchases.reduce(
			(total, purchase) => total + purchase.totalAmount,
			0
		);
	};

	const getItemCount = () => {
		return filteredPurchases.reduce(
			(total, purchase) =>
				total + purchase.items.reduce((sum, item) => sum + item.quantity, 0),
			0
		);
	};

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Purchases" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="My Purchases" />

			{/* Summary Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaShoppingBag className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Orders
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{filteredPurchases.length}
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
										Total Spent
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										৳{calculateTotalSpent().toLocaleString()}
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
								<FaShoppingBag className="h-6 w-6 text-secondary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Items Purchased
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{getItemCount()}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow rounded-lg p-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaSearch className="inline mr-1" />
							Search
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search orders, products, or sellers..."
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

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaCalendarAlt className="inline mr-1" />
							Time Period
						</label>
						<select
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Time</option>
							<option value="week">Last Week</option>
							<option value="month">Last Month</option>
							<option value="3months">Last 3 Months</option>
						</select>
					</div>

					<div className="flex items-end">
						<button className="w-full btn btn-outline-primary">
							<FaDownload className="mr-2 h-4 w-4" />
							Export
						</button>
					</div>
				</div>
			</div>

			{/* Purchase History */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Purchase History
					</h3>
				</div>

				{filteredPurchases.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No purchases found matching your criteria.</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredPurchases.map((purchase) => (
							<div key={purchase.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h4 className="text-lg font-medium text-gray-900">
											Order #{purchase.id}
										</h4>
										<p className="text-sm text-gray-500">
											<FaCalendarAlt className="inline mr-1" />
											Ordered on{" "}
											{new Date(purchase.orderDate).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<StatusBadge status={purchase.status} />
										<p className="text-lg font-bold text-gray-900 mt-1">
											৳{purchase.totalAmount.toLocaleString()}
										</p>
									</div>
								</div>

								{/* Order Items */}
								<div className="space-y-3">
									{purchase.items.map((item, index) => (
										<div
											key={index}
											className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
										>
											<div className="flex-1">
												<h5 className="font-medium text-gray-900">
													{item.productName}
												</h5>
												<p className="text-sm text-gray-500">
													Seller: {item.seller}
												</p>
											</div>
											<div className="text-right">
												<p className="font-medium text-gray-900">
													{item.quantity} {item.unit} × ৳{item.price}
												</p>
												<p className="text-sm text-gray-500">
													৳{(item.quantity * item.price).toLocaleString()}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Order Details */}
								<div className="mt-4 flex items-center justify-between text-sm text-gray-500">
									<div>
										<span className="font-medium">Payment:</span>{" "}
										{purchase.paymentMethod}
									</div>
									<div>
										{purchase.status === "delivered" &&
											purchase.deliveryDate && (
												<span>
													<span className="font-medium">Delivered:</span>{" "}
													{new Date(purchase.deliveryDate).toLocaleDateString()}
												</span>
											)}
										{purchase.status === "shipped" &&
											purchase.estimatedDelivery && (
												<span>
													<span className="font-medium">Est. Delivery:</span>{" "}
													{new Date(
														purchase.estimatedDelivery
													).toLocaleDateString()}
												</span>
											)}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="mt-4 flex items-center space-x-3">
									<Link
										to={`/dashboard/order/${purchase.id}`}
										className="btn btn-outline-primary btn-sm"
									>
										<FaEye className="mr-1 h-4 w-4" />
										View Details
									</Link>
									{purchase.status === "delivered" && (
										<button className="btn btn-outline-secondary btn-sm">
											<FaStar className="mr-1 h-4 w-4" />
											Rate & Review
										</button>
									)}
									{(purchase.status === "pending" ||
										purchase.status === "confirmed") && (
										<button className="btn btn-outline-red btn-sm">
											Cancel Order
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
