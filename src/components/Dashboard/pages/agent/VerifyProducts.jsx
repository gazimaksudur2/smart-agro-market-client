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
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { ReasonModal } from "../../../common/ReasonModal";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending Review" },
		approved: { color: "green", text: "Approved" },
		rejected: { color: "red", text: "Rejected" },
		live: { color: "blue", text: "Live" },
		suspended: { color: "gray", text: "Suspended" },
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

const CategoryBadge = ({ category }) => {
	return (
		<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [currentAction, setCurrentAction] = useState(null);
	const [currentProductId, setCurrentProductId] = useState(null);

	// Fetch products for this agent's region
	const {
		data: products,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["agentProducts", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];
			try {
				return await apiCall(`/agent/products/${currentUser.FirebaseUser.uid}`);
			} catch (error) {
				console.error("Error fetching products:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	const displayProducts = products || [];

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

	// Filter products
	useEffect(() => {
		let filtered = displayProducts;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(product) =>
					product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.seller.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.seller.farmName
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((product) => product.status === statusFilter);
		}

		// Category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(product) => product.category === categoryFilter
			);
		}

		setFilteredProducts(filtered);
	}, [displayProducts, searchTerm, statusFilter, categoryFilter]);

	const handleProductAction = async (productId, action, reason = "") => {
		if (action === "reject" || action === "suspend") {
			setCurrentProductId(productId);
			setCurrentAction(action);
			setShowReasonModal(true);
			return;
		}

		try {
			await apiCall(`/agent/products/${productId}/${action}`, "PATCH", {
				reason,
				agentId: currentUser?.DBUser?._id,
			});
			refetch();
			alert(`Product ${action} successfully!`);
		} catch (error) {
			console.error(`Error ${action} product:`, error);
			alert(`Failed to ${action} product. Please try again.`);
		}
	};

	const handleReasonConfirm = async (reason) => {
		try {
			await apiCall(
				`/agent/products/${currentProductId}/${currentAction}`,
				"PATCH",
				{
					reason,
					agentId: currentUser?.DBUser?._id,
				}
			);
			refetch();
			alert(`Product ${currentAction} successfully!`);
		} catch (error) {
			console.error(`Error ${currentAction} product:`, error);
			alert(`Failed to ${currentAction} product. Please try again.`);
		}
	};

	const getProductStats = () => {
		return {
			total: filteredProducts.length,
			pending: filteredProducts.filter(
				(product) => product.status === "pending"
			).length,
			approved: filteredProducts.filter(
				(product) => product.status === "approved"
			).length,
			rejected: filteredProducts.filter(
				(product) => product.status === "rejected"
			).length,
			avgQualityScore:
				filteredProducts.length > 0
					? Math.round(
							filteredProducts.reduce(
								(sum, product) => sum + product.qualityScore,
								0
							) / filteredProducts.length
					  )
					: 0,
		};
	};

	const stats = getProductStats();

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Products" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Verify Products" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
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
										Approved
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.approved}
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
										Avg Quality Score
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.avgQualityScore}%
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
							onChange={(e) => setSearchTerm(e.target.value)}
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
							onChange={(e) => setStatusFilter(e.target.value)}
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
							onChange={(e) => setCategoryFilter(e.target.value)}
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
			</div>

			{/* Products List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Product Submissions
					</h3>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No products found matching your criteria.</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredProducts.map((product) => (
							<div key={product.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-start space-x-4">
									{/* Product Image */}
									<div className="flex-shrink-0">
										<img
											src={product.image}
											alt={product.title}
											className="h-20 w-20 object-cover rounded-lg"
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
													<strong>Name:</strong> {product.seller.name}
												</p>
												<p>
													<strong>Farm:</strong> {product.seller.farmName}
												</p>
												<p>
													<strong>Email:</strong> {product.seller.email}
												</p>
												<p>
													<FaMapMarkerAlt className="inline mr-1" />
													<strong>Location:</strong> {product.location.upazila},{" "}
													{product.location.district}
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
													<strong>Price:</strong> ৳{product.price}/
													{product.unit}
												</p>
												<p>
													<strong>Min Order:</strong>{" "}
													{product.minimumOrderQuantity} {product.unit}
												</p>
												<p>
													<strong>Stock:</strong> {product.stock} {product.unit}
												</p>
												<p>
													<strong>Quality Score:</strong> {product.qualityScore}
													%
												</p>
											</div>
										</div>

										{/* Submission Details */}
										<div className="mb-4 text-sm text-gray-500">
											<p>
												<strong>Submitted:</strong>{" "}
												{new Date(product.submittedAt).toLocaleDateString()} at{" "}
												{new Date(product.submittedAt).toLocaleTimeString()}
											</p>
											{product.status === "approved" && product.approvedAt && (
												<p>
													<strong>Approved:</strong>{" "}
													{new Date(product.approvedAt).toLocaleDateString()}
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
														Approve Product
													</button>
													<button
														onClick={() =>
															handleProductAction(product.id, "reject")
														}
														disabled={apiLoading}
														className="btn btn-outline-red btn-sm"
													>
														<FaTimes className="mr-1 h-4 w-4" />
														Reject Product
													</button>
												</>
											)}

											{product.status === "approved" && (
												<button
													onClick={() =>
														handleProductAction(product.id, "suspend")
													}
													disabled={apiLoading}
													className="btn btn-outline-red btn-sm"
												>
													Suspend Product
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
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
										src={selectedProduct.image}
										alt={selectedProduct.title}
										className="h-32 w-32 object-cover rounded-lg"
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

								<div className="text-sm text-gray-600">
									<p>
										Detailed product information, seller verification status,
										and quality assessment would be displayed here...
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Reason Modal */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={() => {
					setShowReasonModal(false);
					setCurrentAction(null);
					setCurrentProductId(null);
				}}
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
