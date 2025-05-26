import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaCubes,
	FaSearch,
	FaFilter,
	FaEye,
	FaEdit,
	FaBan,
	FaCheck,
	FaTimes,
	FaExclamationTriangle,
	FaMoneyBillWave,
	FaWarehouse,
	FaUser,
	FaCalendarAlt,
	FaWeight,
	FaTag,
	FaImage,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { toast } from "react-hot-toast";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		approved: { color: "green", text: "Approved" },
		pending: { color: "yellow", text: "Pending" },
		rejected: { color: "red", text: "Rejected" },
		suspended: { color: "orange", text: "Suspended" },
		outofstock: { color: "gray", text: "Out of Stock" },
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
	const categoryColors = {
		vegetables: "green",
		fruits: "orange",
		grains: "yellow",
		spices: "red",
		dairy: "blue",
		fish: "cyan",
		meat: "purple",
		other: "gray",
	};

	const color = categoryColors[category.toLowerCase()] || "gray";

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
		>
			{category}
		</span>
	);
};

export default function ManageProducts() {
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [showProductModal, setShowProductModal] = useState(false);

	// Fetch all products
	const {
		data: products,
		isLoading,
		error,
		refetch,
	} = useQuery(["allProducts"], async () => {
		try {
			return await apiCall("/admin/products");
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	});

	// Mock data for demo
	const mockProducts = [
		{
			id: "PROD-001",
			name: "Premium Basmati Rice",
			description: "High-quality aromatic basmati rice from northern regions",
			category: "Grains",
			price: 850,
			originalPrice: 900,
			unit: "kg",
			minimumOrder: 50,
			stock: 500,
			status: "approved",
			createdAt: "2024-01-15T10:30:00Z",
			updatedAt: "2024-01-20T14:20:00Z",
			seller: {
				id: "SELLER-001",
				name: "Ahmed Rahman",
				email: "ahmed.rahman@example.com",
				farmName: "Rahman Rice Farm",
			},
			agent: {
				id: "AGENT-001",
				name: "Mohammad Ali",
				region: "Dhaka Division",
			},
			images: [
				"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300",
			],
			totalOrders: 45,
			totalSold: 2250,
			revenue: 1912500,
		},
		{
			id: "PROD-002",
			name: "Fresh Tomatoes",
			description: "Farm-fresh organic tomatoes",
			category: "Vegetables",
			price: 120,
			originalPrice: 150,
			unit: "kg",
			minimumOrder: 10,
			stock: 200,
			status: "pending",
			createdAt: "2024-01-18T08:15:00Z",
			updatedAt: "2024-01-18T08:15:00Z",
			seller: {
				id: "SELLER-002",
				name: "Fatima Khatun",
				email: "fatima.khatun@example.com",
				farmName: "Green Valley Farm",
			},
			agent: null,
			images: [
				"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300",
			],
			totalOrders: 0,
			totalSold: 0,
			revenue: 0,
		},
		{
			id: "PROD-003",
			name: "Hilsa Fish",
			description: "Fresh Hilsa fish from Padma river",
			category: "Fish",
			price: 1200,
			originalPrice: 1200,
			unit: "kg",
			minimumOrder: 5,
			stock: 0,
			status: "outofstock",
			createdAt: "2024-01-10T16:45:00Z",
			updatedAt: "2024-01-22T09:30:00Z",
			seller: {
				id: "SELLER-003",
				name: "Rashida Begum",
				email: "rashida.begum@example.com",
				farmName: "River Fresh Fish",
			},
			agent: {
				id: "AGENT-002",
				name: "Karim Uddin",
				region: "Dhaka Division",
			},
			images: [
				"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300",
			],
			totalOrders: 23,
			totalSold: 115,
			revenue: 138000,
		},
		{
			id: "PROD-004",
			name: "Red Chili Powder",
			description: "Pure red chili powder with authentic taste",
			category: "Spices",
			price: 350,
			originalPrice: 350,
			unit: "kg",
			minimumOrder: 5,
			stock: 100,
			status: "rejected",
			createdAt: "2024-01-12T12:20:00Z",
			updatedAt: "2024-01-16T11:15:00Z",
			seller: {
				id: "SELLER-004",
				name: "Mohammad Hasan",
				email: "mohammad.hasan@example.com",
				farmName: "Spice Garden",
			},
			agent: {
				id: "AGENT-001",
				name: "Mohammad Ali",
				region: "Dhaka Division",
			},
			images: [
				"https://images.unsplash.com/photo-1505253213348-cd54c92b37bf?w=300",
			],
			totalOrders: 0,
			totalSold: 0,
			revenue: 0,
			rejectionReason: "Quality standards not met",
		},
		{
			id: "PROD-005",
			name: "Organic Potatoes",
			description: "Chemical-free organic potatoes",
			category: "Vegetables",
			price: 45,
			originalPrice: 50,
			unit: "kg",
			minimumOrder: 25,
			stock: 1000,
			status: "suspended",
			createdAt: "2024-01-08T14:10:00Z",
			updatedAt: "2024-01-19T10:45:00Z",
			seller: {
				id: "SELLER-005",
				name: "Abdul Karim",
				email: "abdul.karim@example.com",
				farmName: "Organic Valley",
			},
			agent: {
				id: "AGENT-003",
				name: "Nazrul Islam",
				region: "Rajshahi Division",
			},
			images: [
				"https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300",
			],
			totalOrders: 18,
			totalSold: 450,
			revenue: 20250,
			suspensionReason: "Seller account under review",
		},
	];

	const displayProducts = products || mockProducts;

	// Filter products
	useEffect(() => {
		let filtered = displayProducts;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.description
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.seller.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(product) =>
					product.category.toLowerCase() === categoryFilter.toLowerCase()
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((product) => product.status === statusFilter);
		}

		setFilteredProducts(filtered);
	}, [displayProducts, searchTerm, categoryFilter, statusFilter]);

	const handleProductAction = async (productId, action, reason = "") => {
		try {
			await apiCall(`/admin/products/${productId}/${action}`, "PATCH", {
				reason,
			});

			toast.success(
				`Product ${
					action === "approve"
						? "approved"
						: action === "reject"
						? "rejected"
						: action
				}d successfully`
			);
			refetch();
		} catch (error) {
			toast.error(`Failed to ${action} product`);
		}
	};

	const getProductStats = () => {
		const stats = {
			total: displayProducts.length,
			approved: displayProducts.filter((p) => p.status === "approved").length,
			pending: displayProducts.filter((p) => p.status === "pending").length,
			rejected: displayProducts.filter((p) => p.status === "rejected").length,
			outOfStock: displayProducts.filter((p) => p.status === "outofstock")
				.length,
		};
		return stats;
	};

	const stats = getProductStats();

	const ProductModal = ({ product, onClose }) => (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
				<div className="flex justify-between items-center pb-4 border-b">
					<h3 className="text-lg font-bold text-gray-900">Product Details</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<FaTimes className="h-6 w-6" />
					</button>
				</div>

				<div className="mt-4 space-y-4">
					{/* Product Image */}
					{product.images && product.images.length > 0 && (
						<div className="flex justify-center">
							<img
								src={product.images[0]}
								alt={product.name}
								className="h-48 w-48 object-cover rounded-lg"
							/>
						</div>
					)}

					{/* Basic Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-medium text-gray-500">Product Name</p>
							<p className="text-lg font-semibold">{product.name}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Status</p>
							<StatusBadge status={product.status} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Category</p>
							<CategoryBadge category={product.category} />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Price</p>
							<p className="text-lg font-semibold">
								৳{product.price}/{product.unit}
							</p>
						</div>
					</div>

					{/* Description */}
					<div>
						<p className="text-sm font-medium text-gray-500">Description</p>
						<p className="text-gray-900">{product.description}</p>
					</div>

					{/* Seller Info */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h4 className="font-medium text-gray-900 mb-2">
							Seller Information
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							<p>
								<span className="font-medium">Name:</span> {product.seller.name}
							</p>
							<p>
								<span className="font-medium">Farm:</span>{" "}
								{product.seller.farmName}
							</p>
							<p>
								<span className="font-medium">Email:</span>{" "}
								{product.seller.email}
							</p>
						</div>
					</div>

					{/* Agent Info */}
					{product.agent && (
						<div className="bg-blue-50 p-4 rounded-lg">
							<h4 className="font-medium text-gray-900 mb-2">
								Agent Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								<p>
									<span className="font-medium">Name:</span>{" "}
									{product.agent.name}
								</p>
								<p>
									<span className="font-medium">Region:</span>{" "}
									{product.agent.region}
								</p>
							</div>
						</div>
					)}

					{/* Stats */}
					<div className="bg-green-50 p-4 rounded-lg">
						<h4 className="font-medium text-gray-900 mb-2">Performance</h4>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<p className="text-sm text-gray-500">Total Orders</p>
								<p className="text-xl font-bold">{product.totalOrders}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Total Sold</p>
								<p className="text-xl font-bold">
									{product.totalSold} {product.unit}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Revenue</p>
								<p className="text-xl font-bold">
									৳{product.revenue?.toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-3 pt-4 border-t">
						{product.status === "pending" && (
							<>
								<button
									onClick={() => {
										handleProductAction(product.id, "approve");
										onClose();
									}}
									className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
								>
									<FaCheck className="inline mr-1" /> Approve
								</button>
								<button
									onClick={() => {
										handleProductAction(
											product.id,
											"reject",
											"Quality concerns"
										);
										onClose();
									}}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
								>
									<FaTimes className="inline mr-1" /> Reject
								</button>
							</>
						)}
						{product.status === "approved" && (
							<button
								onClick={() => {
									handleProductAction(
										product.id,
										"suspend",
										"Administrative review"
									);
									onClose();
								}}
								className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
							>
								<FaBan className="inline mr-1" /> Suspend
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
				<DashboardTitle title="Manage Products" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Manage Products" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaCubes className="h-6 w-6 text-gray-400" />
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
								<FaCheck className="h-6 w-6 text-green-400" />
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
								<FaTimes className="h-6 w-6 text-red-400" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Rejected
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.rejected}
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
								<FaWarehouse className="h-6 w-6 text-gray-400" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Out of Stock
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.outOfStock}
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
								placeholder="Search products..."
								className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* Category Filter */}
						<select
							className="block w-full px-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
						>
							<option value="all">All Categories</option>
							<option value="vegetables">Vegetables</option>
							<option value="fruits">Fruits</option>
							<option value="grains">Grains</option>
							<option value="spices">Spices</option>
							<option value="fish">Fish</option>
							<option value="dairy">Dairy</option>
							<option value="meat">Meat</option>
						</select>

						{/* Status Filter */}
						<select
							className="block w-full px-3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="approved">Approved</option>
							<option value="pending">Pending</option>
							<option value="rejected">Rejected</option>
							<option value="suspended">Suspended</option>
							<option value="outofstock">Out of Stock</option>
						</select>

						{/* Clear Filters */}
						<button
							onClick={() => {
								setSearchTerm("");
								setCategoryFilter("all");
								setStatusFilter("all");
							}}
							className="btn btn-outline"
						>
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Products Table */}
			<div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
				<ul className="divide-y divide-gray-200">
					{filteredProducts.map((product) => (
						<li key={product.id}>
							<div className="px-4 py-4 flex items-center justify-between">
								<div className="flex items-center min-w-0 flex-1">
									{/* Product Image */}
									<div className="flex-shrink-0 h-16 w-16">
										{product.images && product.images.length > 0 ? (
											<img
												className="h-16 w-16 rounded-lg object-cover"
												src={product.images[0]}
												alt={product.name}
											/>
										) : (
											<div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
												<FaImage className="h-6 w-6 text-gray-400" />
											</div>
										)}
									</div>

									{/* Product Info */}
									<div className="ml-4 flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-lg font-medium text-gray-900 truncate">
													{product.name}
												</p>
												<p className="text-sm text-gray-500 truncate">
													{product.description}
												</p>
												<div className="mt-1 flex items-center space-x-2">
													<CategoryBadge category={product.category} />
													<StatusBadge status={product.status} />
												</div>
											</div>
											<div className="ml-4 text-right">
												<p className="text-lg font-bold text-gray-900">
													৳{product.price}/{product.unit}
												</p>
												<p className="text-sm text-gray-500">
													Stock: {product.stock} {product.unit}
												</p>
												<p className="text-sm text-gray-500">
													Min Order: {product.minimumOrder} {product.unit}
												</p>
											</div>
										</div>

										{/* Seller Info */}
										<div className="mt-2 flex items-center text-sm text-gray-500">
											<FaUser className="mr-1 h-3 w-3" />
											<span>{product.seller.name}</span>
											<span className="mx-2">•</span>
											<span>{product.seller.farmName}</span>
											{product.agent && (
												<>
													<span className="mx-2">•</span>
													<span>Agent: {product.agent.name}</span>
												</>
											)}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="ml-6 flex items-center space-x-2">
									<button
										onClick={() => {
											setSelectedProduct(product);
											setShowProductModal(true);
										}}
										className="text-primary-600 hover:text-primary-900"
										title="View Details"
									>
										<FaEye className="h-5 w-5" />
									</button>

									{product.status === "pending" && (
										<>
											<button
												onClick={() =>
													handleProductAction(product.id, "approve")
												}
												className="text-green-600 hover:text-green-900"
												title="Approve Product"
											>
												<FaCheck className="h-5 w-5" />
											</button>
											<button
												onClick={() =>
													handleProductAction(
														product.id,
														"reject",
														"Quality concerns"
													)
												}
												className="text-red-600 hover:text-red-900"
												title="Reject Product"
											>
												<FaTimes className="h-5 w-5" />
											</button>
										</>
									)}

									{product.status === "approved" && (
										<button
											onClick={() =>
												handleProductAction(
													product.id,
													"suspend",
													"Administrative review"
												)
											}
											className="text-orange-600 hover:text-orange-900"
											title="Suspend Product"
										>
											<FaBan className="h-5 w-5" />
										</button>
									)}
								</div>
							</div>
						</li>
					))}
				</ul>

				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<FaCubes className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No products found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Try adjusting your search criteria.
						</p>
					</div>
				)}
			</div>

			{/* Product Modal */}
			{showProductModal && selectedProduct && (
				<ProductModal
					product={selectedProduct}
					onClose={() => {
						setShowProductModal(false);
						setSelectedProduct(null);
					}}
				/>
			)}
		</div>
	);
}
