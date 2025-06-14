import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaBoxOpen,
	FaSearch,
	FaFilter,
	FaEye,
	FaCheck,
	FaTimes,
	FaClock,
	FaMoneyBillWave,
	FaUser,
	FaMapMarkerAlt,
	FaImage,
	FaTag,
	FaSpinner,
	FaExclamationTriangle,
	FaBan,
	FaInfoCircle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { ReasonModal } from "../../../common/ReasonModal";
import { toast } from "react-hot-toast";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: {
			text: "Pending Review",
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-800",
			dotColor: "bg-yellow-400",
		},
		approved: {
			text: "Approved",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			dotColor: "bg-green-400",
		},
		rejected: {
			text: "Rejected",
			bgColor: "bg-red-100",
			textColor: "text-red-800",
			dotColor: "bg-red-400",
		},
		live: {
			text: "Live",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			dotColor: "bg-blue-400",
		},
		suspended: {
			text: "Suspended",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			dotColor: "bg-gray-400",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} transition-all duration-200 hover:shadow-sm`}
		>
			<span
				className={`w-2 h-2 rounded-full ${config.dotColor} mr-2 animate-pulse`}
			></span>
			{config.text}
		</span>
	);
};

const CategoryBadge = ({ category }) => {
	return (
		<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
			<FaTag className="mr-1 h-3 w-3" />
			{category}
		</span>
	);
};

export default function VerifyProducts() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [currentAction, setCurrentAction] = useState(null);
	const [currentProductId, setCurrentProductId] = useState(null);

	// Get agent's operational area
	const agentOperationalArea = currentUser?.DBUser?.operationalArea;

	// Check if agent has operational area assigned - ensure it's a proper boolean
	const hasOperationalArea = Boolean(
		agentOperationalArea?.region && agentOperationalArea?.district
	);

	// Build query parameters with regional filtering
	const queryParams = new URLSearchParams({
		page: currentPage.toString(),
		limit: pageSize.toString(),
	});

	// Add regional filtering - essential for agent access control
	if (hasOperationalArea) {
		queryParams.append("region", agentOperationalArea.region);
		queryParams.append("district", agentOperationalArea.district);
	}

	if (statusFilter !== "all") queryParams.append("status", statusFilter);
	if (categoryFilter !== "all") queryParams.append("cropType", categoryFilter);
	if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());

	// Fetch agent's regional products (all products in their operational area)
	const {
		data: productsData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		[
			"agentRegionalProducts",
			queryParams.toString(),
			agentOperationalArea?.region,
			agentOperationalArea?.district,
		],
		async () => {
			if (!hasOperationalArea) {
				throw new Error(
					"Agent operational area not assigned. Please contact administrator."
				);
			}

			try {
				const response = await apiCall(
					`/products/agent/regional?${queryParams}`
				);
				// Check if response has success field and return data accordingly
				if (response?.success) {
					return {
						products: response.products || [],
						totalProducts: response.totalProducts || 0,
						totalPages: response.totalPages || 1,
						currentPage: response.currentPage || 1,
					};
				}
				// Fallback for backward compatibility
				return (
					response || {
						products: [],
						totalProducts: 0,
						totalPages: 1,
						currentPage: 1,
					}
				);
			} catch (error) {
				console.error("Error fetching agent regional products:", error);
				throw error;
			}
		},
		{
			enabled: Boolean(currentUser?.DBUser?._id && hasOperationalArea),
			keepPreviousData: true,
			staleTime: 30000,
			refetchOnWindowFocus: false,
		}
	);

	// Fetch agent statistics for their region
	const { data: agentStats } = useQuery(
		[
			"agentRegionalProductStats",
			agentOperationalArea?.region,
			agentOperationalArea?.district,
		],
		async () => {
			if (!hasOperationalArea) return null;

			try {
				const response = await apiCall("/products/agent/statistics");
				// Check if response has success field and return statistics accordingly
				if (response?.success) {
					return response.statistics;
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching agent product stats:", error);
				return null;
			}
		},
		{
			enabled: Boolean(currentUser?.DBUser?._id && hasOperationalArea),
			staleTime: 60000,
		}
	);

	// Fetch operational area info
	const { data: operationalInfo } = useQuery(
		["agentOperationalAreaProducts"],
		async () => {
			if (!hasOperationalArea) return null;

			try {
				const response = await apiCall("/products/agent/operational-area");
				// Check if response has success field and return operational area accordingly
				if (response?.success) {
					return response.operationalArea;
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching operational area:", error);
				return null;
			}
		},
		{
			enabled: Boolean(currentUser?.DBUser?._id && hasOperationalArea),
			staleTime: 300000, // 5 minutes - rarely changes
		}
	);

	const products = productsData?.products || [];

	const categories = [
		"Grains",
		"Vegetables",
		"Fruits",
		"Dairy",
		"Meat & Poultry",
		"Fish & Seafood",
		"Spices & Herbs",
		"Pulses & Legumes",
		"Oil & Ghee",
		"Others",
	];

	const handleProductAction = async (productId, action, reason = "") => {
		try {
			let endpoint;
			let method = "PATCH";

			// Use correct endpoints based on action
			switch (action) {
				case "approve":
					endpoint = `/products/${productId}/approve`;
					break;
				case "reject":
					endpoint = `/products/${productId}/reject`;
					break;
				case "suspend":
					endpoint = `/products/${productId}/suspend`;
					break;
				default:
					throw new Error(`Invalid action: ${action}`);
			}

			const body = {
				reviewedBy: currentUser?.DBUser?._id,
				agentOperationalArea: agentOperationalArea, // Include agent's operational area
			};

			// Add reason to body - required for reject, optional for approve
			if (action === "reject" || reason) {
				body.reason = reason;
			}

			const response = await apiCall(endpoint, method, body);

			// Check success field in response
			if (response?.success) {
				toast.success(response.message || `Product ${action}d successfully!`);
			} else {
				toast.success(`Product ${action}d successfully!`);
			}
			refetch();
		} catch (error) {
			console.error(`Error ${action}ing product:`, error);
			toast.error(`Failed to ${action} product. Please try again.`);
		}
	};

	const handleReasonConfirm = (reason) => {
		handleProductAction(currentProductId, currentAction, reason);
		setShowReasonModal(false);
		setCurrentAction(null);
		setCurrentProductId(null);
	};

	const handleReasonCancel = () => {
		setShowReasonModal(false);
		setCurrentAction(null);
		setCurrentProductId(null);
	};

	// Handle actions that require reason modal
	const handleActionWithReason = (productId, action) => {
		setCurrentProductId(productId);
		setCurrentAction(action);
		setShowReasonModal(true);
	};

	// Use backend statistics if available, fallback to frontend calculation
	const getProductStats = () => {
		if (agentStats) {
			return agentStats;
		}

		// Fallback calculation
		return {
			total: products.length,
			pending: products.filter((product) => product.status === "pending")
				.length,
			approved: products.filter((product) => product.status === "approved")
				.length,
			rejected: products.filter((product) => product.status === "rejected")
				.length,
			live: products.filter((product) => product.status === "live").length,
			suspended: products.filter((product) => product.status === "suspended")
				.length,
		};
	};

	const stats = getProductStats();

	// No operational area assigned
	if (!hasOperationalArea) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Products" />
				<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
					<FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
					<h3 className="text-lg font-medium text-yellow-800 mb-2">
						Operational Area Not Assigned
					</h3>
					<p className="text-yellow-700 mb-4">
						You don't have an operational area assigned yet. Please contact the
						administrator to assign your region and district.
					</p>
					<div className="text-sm text-yellow-600">
						<p>
							<strong>Your Agent ID:</strong> {currentUser?.DBUser?._id}
						</p>
						<p>
							<strong>Contact Admin:</strong> Request operational area
							assignment
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading && !productsData) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Products" />
				<div className="mt-6 flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
					<span className="ml-2 text-lg text-gray-600">
						Loading products from {agentOperationalArea?.district},{" "}
						{agentOperationalArea?.region}...
					</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Products" />
				<div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<FaExclamationTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Products
					</h3>
					<p className="text-red-600 mb-4">
						{error?.message || "An unexpected error occurred"}
					</p>
					<button
						onClick={() => refetch()}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Verify Products" />

			{/* Operational Area Info */}
			<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-center">
					<FaInfoCircle className="h-5 w-5 text-blue-600 mr-2" />
					<div>
						<h4 className="text-sm font-medium text-blue-800">
							Your Operational Area
						</h4>
						<p className="text-sm text-blue-700">
							<FaMapMarkerAlt className="inline mr-1" />
							{agentOperationalArea?.district}, {agentOperationalArea?.region} -
							You can verify products from sellers in this region only.
						</p>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaBoxOpen className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Products
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.total || 0}
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
										{stats.pending || 0}
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
										Approved
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.approved || 0}
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
								<FaTimes className="h-6 w-6 text-red-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Rejected
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.rejected || 0}
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
								<FaTag className="h-6 w-6 text-blue-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Live Products
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.live || 0}
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
							Search Products
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1); // Reset to first page on search
							}}
							placeholder="Search by product, seller, or ID..."
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
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setCurrentPage(1); // Reset to first page on filter
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending Review</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
							<option value="live">Live</option>
							<option value="suspended">Suspended</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Category
						</label>
						<select
							value={categoryFilter}
							onChange={(e) => {
								setCategoryFilter(e.target.value);
								setCurrentPage(1); // Reset to first page on filter
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Results and pagination info */}
				<div className="mt-4 flex items-center justify-between text-sm text-gray-500">
					<div>
						Showing {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
						to{" "}
						{Math.min(currentPage * pageSize, productsData?.totalProducts || 0)}{" "}
						of {productsData?.totalProducts || 0} products
					</div>
					<div>
						Page {currentPage} of {productsData?.totalPages || 1}
					</div>
				</div>
			</div>

			{/* Products List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Product Submissions - {agentOperationalArea?.district},{" "}
						{agentOperationalArea?.region}
					</h3>
				</div>

				{products.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>
							No products found matching your criteria in your operational area.
						</p>
						<p className="text-sm mt-2">
							Region: {agentOperationalArea?.region} • District:{" "}
							{agentOperationalArea?.district}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{products.map((product) => (
							<div key={product.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-start space-x-4">
									{/* Product Image */}
									<div className="flex-shrink-0">
										<img
											src={product.image || "/placeholder-product.png"}
											alt={product.title}
											className="h-20 w-20 object-cover rounded-lg"
											onError={(e) => {
												e.target.src = "/placeholder-product.png";
											}}
										/>
									</div>

									{/* Product Details */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-2">
											<div>
												<h4 className="text-lg font-medium text-gray-900">
													{product.title}
												</h4>
												<p className="text-sm text-gray-500">
													Product ID: {product.id}
												</p>
											</div>
											<div className="flex items-center space-x-2">
												<CategoryBadge category={product.category} />
												<StatusBadge status={product.status} />
											</div>
										</div>

										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{product.description}
										</p>

										{/* Seller Information */}
										<div className="mb-3 p-3 bg-gray-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-1">
												<FaUser className="inline mr-1" />
												Seller Information
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
												<p>
													<strong>Name:</strong> {product.seller?.name || "N/A"}
												</p>
												<p>
													<strong>Farm:</strong>{" "}
													{product.seller?.farmName || "N/A"}
												</p>
												<p>
													<strong>Email:</strong>{" "}
													{product.seller?.email || "N/A"}
												</p>
												<p>
													<FaMapMarkerAlt className="inline mr-1" />
													<strong>Location:</strong>{" "}
													{product.location?.upazila || "N/A"},{" "}
													{product.location?.district || "N/A"}
												</p>
											</div>
										</div>

										{/* Product Details */}
										<div className="mb-3 p-3 bg-blue-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-1">
												Product Details
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
												<p>
													<FaMoneyBillWave className="inline mr-1" />
													<strong>Price:</strong> ৳{product.price || 0}/
													{product.unit || "unit"}
												</p>
												<p>
													<strong>Min Order:</strong>{" "}
													{product.minimumOrderQuantity || 0}{" "}
													{product.unit || "unit"}
												</p>
												<p>
													<strong>Stock:</strong> {product.stock || 0}{" "}
													{product.unit || "unit"}
												</p>
												<p>
													<strong>Quality Score:</strong>{" "}
													{product.qualityScore || 0}%
												</p>
											</div>
										</div>

										{/* Submission Details */}
										<div className="mb-4 text-sm text-gray-500">
											<p>
												<strong>Submitted:</strong>{" "}
												{product.submittedAt
													? new Date(product.submittedAt).toLocaleDateString()
													: "N/A"}
												{product.submittedAt &&
													" at " +
														new Date(product.submittedAt).toLocaleTimeString()}
											</p>
											{product.status === "approved" && product.approvedAt && (
												<p>
													<strong>Approved:</strong>{" "}
													{new Date(product.approvedAt).toLocaleDateString()}
													{product.approvedBy && (
														<span className="ml-2 text-green-600">
															by {product.approvedBy}
														</span>
													)}
												</p>
											)}
											{product.status === "rejected" && product.rejectedAt && (
												<p>
													<strong>Rejected:</strong>{" "}
													{new Date(product.rejectedAt).toLocaleDateString()}
													{product.rejectionReason && (
														<span className="block text-red-600 mt-1">
															<strong>Reason:</strong> {product.rejectionReason}
														</span>
													)}
												</p>
											)}
											{product.status === "suspended" &&
												product.suspendedAt && (
													<p>
														<strong>Suspended:</strong>{" "}
														{new Date(product.suspendedAt).toLocaleDateString()}
														{product.suspensionReason && (
															<span className="block text-orange-600 mt-1">
																<strong>Reason:</strong>{" "}
																{product.suspensionReason}
															</span>
														)}
													</p>
												)}
										</div>

										{/* Action Buttons */}
										<div className="flex items-center space-x-3">
											<button
												onClick={() => setSelectedProduct(product)}
												className="btn btn-outline-primary btn-sm"
											>
												<FaEye className="mr-1 h-4 w-4" />
												View Details
											</button>

											{/* Pending products - can approve or reject */}
											{product.status === "pending" && (
												<>
													<button
														onClick={() =>
															handleProductAction(product.id, "approve")
														}
														disabled={apiLoading}
														className="btn btn-success btn-sm"
													>
														<FaCheck className="mr-1 h-4 w-4" />
														{apiLoading ? "Processing..." : "Approve Product"}
													</button>
													<button
														onClick={() =>
															handleActionWithReason(product.id, "reject")
														}
														disabled={apiLoading}
														className="btn btn-outline-red btn-sm"
													>
														<FaTimes className="mr-1 h-4 w-4" />
														Reject Product
													</button>
												</>
											)}

											{/* Approved/Live products - can suspend */}
											{(product.status === "approved" ||
												product.status === "live") && (
												<button
													onClick={() =>
														handleActionWithReason(product.id, "suspend")
													}
													disabled={apiLoading}
													className="btn btn-outline-orange btn-sm"
												>
													<FaBan className="mr-1 h-4 w-4" />
													Suspend Product
												</button>
											)}

											{/* Rejected products - can re-approve */}
											{product.status === "rejected" && (
												<button
													onClick={() =>
														handleProductAction(product.id, "approve")
													}
													disabled={apiLoading}
													className="btn btn-success btn-sm"
												>
													<FaCheck className="mr-1 h-4 w-4" />
													Re-approve Product
												</button>
											)}

											{/* Suspended products - can re-approve */}
											{product.status === "suspended" && (
												<button
													onClick={() =>
														handleProductAction(product.id, "approve")
													}
													disabled={apiLoading}
													className="btn btn-success btn-sm"
												>
													<FaCheck className="mr-1 h-4 w-4" />
													Reactivate Product
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{productsData?.totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<label className="text-sm text-gray-700">Show:</label>
								<select
									value={pageSize}
									onChange={(e) => {
										setPageSize(Number(e.target.value));
										setCurrentPage(1);
									}}
									className="px-2 py-1 border border-gray-300 rounded text-sm"
								>
									<option value={5}>5</option>
									<option value={10}>10</option>
									<option value={20}>20</option>
									<option value={50}>50</option>
								</select>
								<span className="text-sm text-gray-700">per page</span>
							</div>

							<div className="flex items-center space-x-2">
								<button
									onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
									disabled={currentPage === 1}
									className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Previous
								</button>

								{/* Page numbers */}
								{Array.from(
									{ length: Math.min(5, productsData.totalPages) },
									(_, i) => {
										const page = i + 1;
										return (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`px-3 py-1 border rounded text-sm ${
													currentPage === page
														? "bg-primary-600 text-white border-primary-600"
														: "border-gray-300 hover:bg-gray-50"
												}`}
											>
												{page}
											</button>
										);
									}
								)}

								<button
									onClick={() =>
										setCurrentPage(
											Math.min(productsData.totalPages, currentPage + 1)
										)
									}
									disabled={currentPage === productsData.totalPages}
									className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Product Detail Modal */}
			{selectedProduct && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Product Details - {selectedProduct.title}
								</h3>
								<button
									onClick={() => setSelectedProduct(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							{/* Detailed modal content */}
							<div className="space-y-4">
								<div className="flex items-center space-x-4">
									<img
										src={selectedProduct.image || "/placeholder-product.png"}
										alt={selectedProduct.title}
										className="h-32 w-32 object-cover rounded-lg"
										onError={(e) => {
											e.target.src = "/placeholder-product.png";
										}}
									/>
									<div>
										<h4 className="text-xl font-bold text-gray-900">
											{selectedProduct.title}
										</h4>
										<p className="text-gray-600">
											{selectedProduct.description}
										</p>
										<div className="mt-2 flex items-center space-x-2">
											<CategoryBadge category={selectedProduct.category} />
											<StatusBadge status={selectedProduct.status} />
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div className="space-y-2">
										<h5 className="font-medium text-gray-900">
											Product Information
										</h5>
										<p>
											<strong>Price:</strong> ৳{selectedProduct.price}/
											{selectedProduct.unit}
										</p>
										<p>
											<strong>Stock:</strong> {selectedProduct.stock}{" "}
											{selectedProduct.unit}
										</p>
										<p>
											<strong>Min Order:</strong>{" "}
											{selectedProduct.minimumOrderQuantity}{" "}
											{selectedProduct.unit}
										</p>
										<p>
											<strong>Quality Score:</strong>{" "}
											{selectedProduct.qualityScore}%
										</p>
									</div>
									<div className="space-y-2">
										<h5 className="font-medium text-gray-900">
											Seller Information
										</h5>
										<p>
											<strong>Name:</strong> {selectedProduct.seller?.name}
										</p>
										<p>
											<strong>Farm:</strong> {selectedProduct.seller?.farmName}
										</p>
										<p>
											<strong>Email:</strong> {selectedProduct.seller?.email}
										</p>
										<p>
											<strong>Location:</strong>{" "}
											{selectedProduct.location?.upazila},{" "}
											{selectedProduct.location?.district}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Reason Modal */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={handleReasonCancel}
				onConfirm={handleReasonConfirm}
				title={`${currentAction === "reject" ? "Reject" : "Suspend"} Product`}
				description={`Please provide a reason for ${
					currentAction === "reject" ? "rejecting" : "suspending"
				} this product. This will help the seller understand the decision.`}
				placeholder={
					currentAction === "reject"
						? "e.g., Poor quality images, incomplete description, price issues..."
						: "e.g., Policy violation, quality concerns, temporary restriction..."
				}
				confirmText={`${
					currentAction === "reject" ? "Reject" : "Suspend"
				} Product`}
				type="danger"
				isLoading={apiLoading}
			/>
		</div>
	);
}
