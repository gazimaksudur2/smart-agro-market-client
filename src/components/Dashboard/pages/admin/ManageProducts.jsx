import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { toast } from "react-hot-toast";
import useScrollToTop from "../../../../hooks/useScrollToTop";

// Import modular components
import { ProductStatsCards } from "./components/StatsCards";
import { ProductFiltersPanel } from "./components/FiltersPanel";
import { DataTable, Pagination } from "./components/DataTable";
import { ProductModal } from "./components/ProductModal";
import { ReasonModal } from "../../../common/ReasonModal";
import { StatusBadge, QualityBadge, CategoryBadge } from "./components/Badges";

// Custom hook for debounced value
const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

export default function ManageProducts() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();

	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [qualityFilter, setQualityFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [showProductModal, setShowProductModal] = useState(false);
	const [bulkSelected, setBulkSelected] = useState([]);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [showBulkReasonModal, setShowBulkReasonModal] = useState(false);
	const [bulkAction, setBulkAction] = useState(null);

	// Debounce search term to avoid excessive API calls
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Memoized query parameters to prevent unnecessary recalculations
	const queryParams = useMemo(() => {
		const params = new URLSearchParams({
			page: currentPage.toString(),
			limit: pageSize.toString(),
		});

		if (categoryFilter !== "all") params.append("cropType", categoryFilter);
		if (statusFilter !== "all") params.append("status", statusFilter);
		if (qualityFilter !== "all") params.append("quality", qualityFilter);
		if (debouncedSearchTerm.trim())
			params.append("search", debouncedSearchTerm.trim());
		if (sortBy) params.append("sortBy", sortBy);
		if (sortOrder) params.append("sortOrder", sortOrder);

		return params.toString();
	}, [
		currentPage,
		pageSize,
		categoryFilter,
		statusFilter,
		qualityFilter,
		debouncedSearchTerm,
		sortBy,
		sortOrder,
	]);

	// Reset current page when search term changes
	useEffect(() => {
		if (searchTerm !== debouncedSearchTerm && debouncedSearchTerm.length >= 0) {
			setCurrentPage(1);
			setBulkSelected([]);
		}
	}, [debouncedSearchTerm, searchTerm]);

	// Fetch products with react-query
	const {
		data: productsData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["adminProducts", queryParams],
		async () => {
			try {
				const response = await apiCall(`/products/admin/all?${queryParams}`);
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
				return response;
			} catch (error) {
				console.error("Error fetching products:", error);
				throw error;
			}
		},
		{
			keepPreviousData: true,
			staleTime: 30000, // 30 seconds
			refetchOnWindowFocus: false,
		}
	);

	// Fetch admin product statistics
	const { data: adminStats } = useQuery(
		["adminProductStatistics"],
		async () => {
			try {
				const response = await apiCall("/products/admin/statistics");
				// Check if response has success field and return statistics accordingly
				if (response?.success) {
					return response.statistics;
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching admin product statistics:", error);
				return null;
			}
		},
		{
			enabled: !!currentUser?.DBUser?._id,
			staleTime: 60000,
		}
	);

	// Handle product actions
	const handleProductAction = async (productId, action, reason = "") => {
		try {
			const endpoint = `/products/admin/${action}/${productId}`;
			const body = {
				reviewedBy: currentUser?.DBUser?._id,
			};

			// Add reason to body - required for reject, optional for approve
			if (action === "reject" || reason) {
				body.reason = reason;
			}

			const response = await apiCall(endpoint, "PATCH", body);

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

	// Handle bulk actions with reason
	const handleBulkActionWithReason = (action) => {
		if (bulkSelected.length === 0) {
			toast.warning("Please select products first");
			return;
		}

		setBulkAction(action);
		setShowBulkReasonModal(true);
	};

	// Execute bulk action
	const executeBulkAction = async (reason) => {
		try {
			const response = await apiCall("/products/bulk-action", "PATCH", {
				productIds: bulkSelected,
				action: bulkAction,
				reason,
				reviewedBy: currentUser?.DBUser?._id,
			});

			// Check success field and show appropriate message
			if (response?.success) {
				toast.success(
					response.message || `Bulk ${bulkAction} completed successfully!`
				);
				// Log results if available
				if (response.results) {
					console.log("Bulk action results:", response.results);
				}
			} else {
				toast.success(`Bulk ${bulkAction} completed successfully!`);
			}
			setBulkSelected([]);
			refetch();
		} catch (error) {
			console.error(`Error in bulk ${bulkAction}:`, error);
			toast.error(`Failed to perform bulk ${bulkAction}`);
		}
	};

	// Handle pagination
	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
		setBulkSelected([]); // Clear selections when changing pages
	};

	// Handle sorting
	const handleSort = (field, direction) => {
		setSortBy(field);
		setSortOrder(direction);
		setCurrentPage(1); // Reset to first page when sorting
	};

	// Handle row click
	const handleRowClick = (product) => {
		setSelectedProduct(product);
		setShowProductModal(true);
	};

	// Get product statistics
	const getProductStats = () => {
		if (adminStats) {
			return adminStats;
		}

		// Fallback calculation if backend stats are not available
		if (!productsData?.products) {
			return { total: 0, approved: 0, pending: 0, rejected: 0, outOfStock: 0 };
		}

		const products = productsData.products;
		return {
			total: productsData.totalProducts || 0,
			approved: products.filter((p) => p.status === "approved").length,
			pending: products.filter((p) => p.status === "pending").length,
			rejected: products.filter((p) => p.status === "rejected").length,
			outOfStock: products.filter((p) => p.availableStock === 0).length,
		};
	};

	const stats = getProductStats();

	// Format currency
	const formatCurrency = (value) => `৳${value.toLocaleString()}`;
	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

	// Define table columns
	const columns = [
		{
			key: "title",
			title: "Product",
			sortable: true,
			render: (value, product) => (
				<div className="flex items-center">
					<img
						src={product.images?.[0] || "https://via.placeholder.com/48"}
						alt={value}
						className="h-12 w-12 rounded-lg object-cover mr-3"
						onError={(e) => {
							e.target.src = "https://via.placeholder.com/48?text=No+Image";
						}}
					/>
					<div>
						<div className="text-sm font-medium text-gray-900 max-w-xs truncate">
							{value}
						</div>
						<div className="text-sm text-gray-500">
							{product.sellerInfo?.name}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "cropType",
			title: "Category",
			render: (value) => <CategoryBadge category={value} />,
		},
		{
			key: "pricePerUnit",
			title: "Price",
			render: (value, product) => (
				<span className="text-sm font-medium text-green-600">
					{formatCurrency(value)}/{product.unit}
				</span>
			),
		},
		{
			key: "availableStock",
			title: "Stock",
			render: (value, product) => (
				<span
					className={`text-sm font-medium ${
						value === 0 ? "text-red-600" : "text-gray-900"
					}`}
				>
					{value} {product.unit}
				</span>
			),
		},
		{
			key: "quality",
			title: "Quality",
			render: (value) => <QualityBadge quality={value} />,
		},
		{
			key: "status",
			title: "Status",
			render: (value) => <StatusBadge status={value} />,
		},
		{
			key: "createdAt",
			title: "Created",
			sortable: true,
			render: (value) => (
				<span className="text-sm text-gray-500">{formatDate(value)}</span>
			),
		},
	];

	// Loading state
	if (isLoading && !productsData) {
		return (
			<div className="">
				<DashboardTitle title="Manage Products" />
				<div className="mt-6 flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
					<span className="ml-2 text-lg text-gray-600">
						Loading products...
					</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="">
				<DashboardTitle title="Manage Products" />
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
		<div className="">
			<DashboardTitle title="Manage Products" />

			{/* Statistics Cards */}
			<div className="mt-6">
				<ProductStatsCards stats={stats} />
			</div>

			{/* Filters Panel */}
			<div className="mt-6">
				<ProductFiltersPanel
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					categoryFilter={categoryFilter}
					setCategoryFilter={setCategoryFilter}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					qualityFilter={qualityFilter}
					setQualityFilter={setQualityFilter}
					pageSize={pageSize}
					setPageSize={setPageSize}
					setCurrentPage={setCurrentPage}
					bulkSelected={bulkSelected}
					onBulkAction={handleBulkActionWithReason}
					onClearBulkSelection={() => setBulkSelected([])}
					isLoading={isLoading}
				/>
			</div>

			{/* Data Table */}
			<div className="mt-6">
				<DataTable
					columns={columns}
					data={productsData?.products || []}
					loading={isLoading}
					onRowClick={handleRowClick}
					onSort={handleSort}
					sortField={sortBy}
					sortDirection={sortOrder}
					selectedItems={bulkSelected}
					onSelectionChange={setBulkSelected}
				/>
			</div>

			{/* Pagination */}
			{productsData && (
				<Pagination
					currentPage={currentPage}
					totalPages={productsData.totalPages}
					totalItems={productsData.totalProducts}
					pageSize={pageSize}
					onPageChange={handlePageChange}
					loading={isLoading}
				/>
			)}

			{/* Product Modal */}
			<ProductModal
				product={selectedProduct}
				isOpen={showProductModal}
				onClose={() => {
					setShowProductModal(false);
					setSelectedProduct(null);
				}}
				onProductAction={handleProductAction}
				isLoading={apiLoading}
			/>

			{/* Bulk Action Reason Modal */}
			<ReasonModal
				isOpen={showBulkReasonModal}
				onClose={() => {
					setShowBulkReasonModal(false);
					setBulkAction(null);
				}}
				onConfirm={executeBulkAction}
				title={`Bulk ${
					bulkAction === "approve"
						? "Approve"
						: bulkAction === "reject"
						? "Reject"
						: "Suspend"
				} Products`}
				description={`Please provide a reason for ${
					bulkAction === "approve"
						? "approving"
						: bulkAction === "reject"
						? "rejecting"
						: "suspending"
				} ${bulkSelected.length} selected product${
					bulkSelected.length > 1 ? "s" : ""
				}. This reason will be shared with all affected sellers.`}
				placeholder={
					bulkAction === "approve"
						? "e.g., Quality verified, meets standards, batch approval..."
						: bulkAction === "reject"
						? "e.g., Poor quality, incomplete information, policy violation..."
						: "e.g., Temporary quality concerns, policy review required..."
				}
				confirmText={`${
					bulkAction === "approve"
						? "Approve"
						: bulkAction === "reject"
						? "Reject"
						: "Suspend"
				} ${bulkSelected.length} Product${bulkSelected.length > 1 ? "s" : ""}`}
				type={bulkAction === "approve" ? "info" : "danger"}
				isLoading={apiLoading}
			/>
		</div>
	);
}
