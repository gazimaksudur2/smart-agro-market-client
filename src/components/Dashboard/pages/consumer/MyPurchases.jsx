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
import useOrders from "../../../../hooks/useOrders";
import OrderStatusBadge from "../../../common/OrderStatusBadge";
import useScrollToTop from "../../../../hooks/useScrollToTop";

export default function MyPurchases() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { fetchUserOrders } = useOrders();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("shipped");
	const [dateFilter, setDateFilter] = useState("all");
	const [filteredPurchases, setFilteredPurchases] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	// Reset page to 1 when status filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter]);

	// Fetch shipped orders (purchases)
	useEffect(() => {
		const loadPurchases = async () => {
			if (!currentUser?.DBUser?._id) return;

			setIsLoading(true);
			try {
				const response = await fetchUserOrders({
					page: currentPage,
					limit: 20,
					status: statusFilter === "all" ? undefined : statusFilter,
				});

				if (response.success) {
					setPurchases(response.orders || []);
					setPagination(response.pagination);
				}
			} catch (error) {
				console.error("Error fetching purchases:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPurchases();
	}, [currentUser?.DBUser?._id, fetchUserOrders, statusFilter, currentPage]);

	// Filter purchases
	useEffect(() => {
		let filtered = purchases;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(purchase) =>
					purchase.orderNumber
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					purchase._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					purchase.items?.some((item) =>
						item.productId?.toLowerCase().includes(searchTerm.toLowerCase())
					)
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
					(purchase) => new Date(purchase.createdAt) >= filterDate
				);
			}
		}

		setFilteredPurchases(filtered);
	}, [purchases, searchTerm, dateFilter]);

	const calculateTotalSpent = () => {
		return filteredPurchases.reduce(
			(total, purchase) => total + (purchase.totalAmount || 0),
			0
		);
	};

	const getItemCount = () => {
		return filteredPurchases.reduce(
			(total, purchase) =>
				total +
				(purchase.items?.reduce((sum, item) => sum + item.quantity, 0) || 0),
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
							<option value="all">All Purchases</option>
							<option value="shipped">Shipped</option>
							<option value="pending">Pending</option>
							<option value="processing">Processing</option>
							<option value="confirmed">Confirmed</option>
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
						{pagination && (
							<span className="ml-2 text-sm text-gray-500">
								({pagination.totalItems} total purchases)
							</span>
						)}
					</h3>
				</div>

				{filteredPurchases.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No purchases found matching your criteria.</p>
						{statusFilter === "shipped" && (
							<p className="mt-2 text-sm">
								Your shipped orders will appear here once your orders are
								shipped.
							</p>
						)}
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredPurchases.map((purchase) => (
							<div key={purchase._id} className="p-6 hover:bg-gray-50">
								{/* Purchase Header */}
								<div className="flex items-center justify-between mb-4">
									<div>
										<h4 className="text-lg font-medium text-gray-900">
											Order #{purchase.orderNumber}
										</h4>
										<p className="text-sm text-gray-500">
											Ordered on{" "}
											{new Date(purchase.createdAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "long",
													day: "numeric",
												}
											)}
										</p>
									</div>
									<div className="flex items-center space-x-4">
										<OrderStatusBadge status={purchase.status} />
										<span className="text-lg font-semibold text-gray-900">
											৳{purchase.totalAmount?.toLocaleString()}
										</span>
									</div>
								</div>

								{/* Purchase Items */}
								<div className="mb-4">
									<h5 className="font-medium text-gray-900 mb-3">
										Items ({purchase.items?.length || 0})
									</h5>
									<div className="space-y-3">
										{purchase.items?.map((item, index) => (
											<div
												key={index}
												className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
											>
												<div className="flex-1">
													<p className="font-medium text-gray-900">
														Product ID: {item.productId}
													</p>
													<p className="text-sm text-gray-600">
														Quantity: {item.quantity} units × ৳{item.price}
													</p>
													{item.sellerId && (
														<p className="text-xs text-gray-500">
															Seller: {item.sellerId.slice(-8)}
														</p>
													)}
												</div>
												<div className="text-right">
													<p className="font-semibold text-gray-900">
														৳{item.totalPrice?.toLocaleString()}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Purchase Actions */}
								<div className="flex items-center justify-between pt-4 border-t border-gray-200">
									<div className="flex items-center space-x-4">
										{purchase.paymentMethod && (
											<span className="text-sm text-gray-600">
												Payment:{" "}
												<span className="font-medium">
													{purchase.paymentMethod.toUpperCase()}
												</span>
											</span>
										)}
										{purchase.notes && (
											<span className="text-sm text-gray-600">
												Note: {purchase.notes}
											</span>
										)}
									</div>
									<div className="flex items-center space-x-3">
										{purchase.status === "delivered" && (
											<button className="btn btn-outline-primary btn-sm">
												<FaStar className="mr-1 h-3 w-3" />
												Rate Items
											</button>
										)}
										<button className="btn btn-outline-secondary btn-sm">
											<FaEye className="mr-1 h-3 w-3" />
											View Details
										</button>
										<button className="btn btn-outline-secondary btn-sm">
											<FaDownload className="mr-1 h-3 w-3" />
											Invoice
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination Info */}
				{pagination && pagination.totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-700">
								Showing page {pagination.currentPage} of {pagination.totalPages}
							</p>
							<div className="flex items-center space-x-2">
								<button
									className="btn btn-outline btn-sm"
									disabled={pagination.currentPage === 1}
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
								>
									Previous
								</button>
								<button
									className="btn btn-outline btn-sm"
									disabled={pagination.currentPage === pagination.totalPages}
									onClick={() =>
										setCurrentPage((prev) =>
											Math.min(pagination.totalPages, prev + 1)
										)
									}
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
