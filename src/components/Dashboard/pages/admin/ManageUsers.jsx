import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { toast } from "react-hot-toast";

// Import modular components
import { UserStatsCards } from "./components/StatsCards";
import { UserFiltersPanel } from "./components/FiltersPanel";
import { DataTable, Pagination } from "./components/DataTable";
import { UserModal } from "./components/UserModal";
import { StatusBadge, RoleBadge, VerificationBadge } from "./components/Badges";

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

export default function ManageUsers() {
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();

	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showUserModal, setShowUserModal] = useState(false);
	const [bulkSelected, setBulkSelected] = useState([]);
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");

	// Debounce search term to avoid excessive API calls
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Memoized query parameters to prevent unnecessary recalculations
	const queryParams = useMemo(() => {
		const params = new URLSearchParams({
			page: currentPage.toString(),
			limit: pageSize.toString(),
		});

		if (roleFilter !== "all") params.append("role", roleFilter);
		// Map status filter values to what the API expects
		if (statusFilter === "active") params.append("isActive", "true");
		if (statusFilter === "inactive") params.append("isActive", "false");
		if (debouncedSearchTerm.trim())
			params.append("search", debouncedSearchTerm.trim());
		if (sortBy) params.append("sortBy", sortBy);
		if (sortOrder) params.append("sortOrder", sortOrder);

		return params.toString();
	}, [
		currentPage,
		pageSize,
		roleFilter,
		statusFilter,
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

	// Fetch users with react-query
	const {
		data: usersData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["adminUsers", queryParams],
		async () => {
			try {
				const response = await apiCall(`/admin/users?${queryParams}`);
				return response;
			} catch (error) {
				console.error("Error fetching users:", error);
				throw error;
			}
		},
		{
			keepPreviousData: true,
			staleTime: 30000, // 30 seconds
			refetchOnWindowFocus: false,
		}
	);

	// Handle user actions
	const handleUserAction = async (userId, action, reason = "") => {
		try {
			await apiCall(`/admin/users/${userId}/${action}`, "PATCH", {
				reason,
				adminId: currentUser?.FirebaseUser?.uid,
			});

			toast.success(`User ${action}d successfully!`);
			refetch();
		} catch (error) {
			console.error(`Error ${action}ing user:`, error);
			toast.error(`Failed to ${action} user. Please try again.`);
		}
	};

	// Handle bulk actions
	const handleBulkAction = async (action) => {
		if (bulkSelected.length === 0) {
			toast.warning("Please select users first");
			return;
		}

		const reason = prompt(`Please provide a reason for bulk ${action}:`);
		if (!reason) return;

		try {
			await Promise.all(
				bulkSelected.map((userId) =>
					apiCall(`/admin/users/${userId}/${action}`, "PATCH", {
						reason,
						adminId: currentUser?.FirebaseUser?.uid,
					})
				)
			);

			toast.success(`Bulk ${action} completed successfully!`);
			setBulkSelected([]);
			refetch();
		} catch (error) {
			console.error(`Error in bulk ${action}:`, error);
			toast.error(`Failed to perform bulk ${action}`);
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
	const handleRowClick = (user) => {
		setSelectedUser(user);
		setShowUserModal(true);
	};

	// Get user statistics
	const getUserStats = () => {
		if (!usersData?.users)
			return {
				total: 0,
				active: 0,
				inactive: 0,
				agents: 0,
				sellers: 0,
				consumers: 0,
			};

		const users = usersData.users;
		return {
			total: usersData.totalUsers || 0,
			active: users.filter((u) => u.isActive).length,
			inactive: users.filter((u) => !u.isActive).length,
			agents: users.filter((u) => u.role === "agent").length,
			sellers: users.filter((u) => u.role === "seller").length,
			consumers: users.filter((u) => u.role === "consumer").length,
		};
	};

	const stats = getUserStats();
	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

	// Define table columns
	const columns = [
		{
			key: "name",
			title: "User",
			sortable: true,
			render: (value, user) => (
				<div className="flex items-center">
					<img
						src={
							user.profilePicture ||
							`https://ui-avatars.com/api/?name=${encodeURIComponent(
								value
							)}&background=6366f1&color=fff&size=48`
						}
						alt={value}
						className="h-12 w-12 rounded-full object-cover mr-3"
						onError={(e) => {
							e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
								value
							)}&background=6366f1&color=fff&size=48`;
						}}
					/>
					<div>
						<div className="text-sm font-medium text-gray-900">{value}</div>
						<div className="text-sm text-gray-500">{user.email}</div>
					</div>
				</div>
			),
		},
		{
			key: "role",
			title: "Role",
			render: (value) => <RoleBadge role={value} />,
		},
		{
			key: "isActive",
			title: "Status",
			render: (value) => <StatusBadge isActive={value} type="user" />,
		},
		{
			key: "verified",
			title: "Verification",
			render: (value) => <VerificationBadge verified={value} />,
		},
		{
			key: "phoneNumber",
			title: "Contact",
			render: (value, user) => (
				<div className="text-sm">
					{value && <div>{value}</div>}
					{user.address && (
						<div className="text-gray-500 truncate max-w-32">
							{user.address.city || user.address.state || "N/A"}
						</div>
					)}
				</div>
			),
		},
		{
			key: "createdAt",
			title: "Joined",
			sortable: true,
			render: (value) => (
				<span className="text-sm text-gray-500">{formatDate(value)}</span>
			),
		},
	];

	// Loading state
	if (isLoading && !usersData) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Users" />
				<div className="mt-6 flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
					<span className="ml-2 text-lg text-gray-600">Loading users...</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Users" />
				<div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<FaExclamationTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Users
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
			<DashboardTitle title="Manage Users" />

			{/* Statistics Cards */}
			<div className="mt-6">
				<UserStatsCards stats={stats} />
			</div>

			{/* Filters Panel */}
			<div className="mt-6">
				<UserFiltersPanel
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					roleFilter={roleFilter}
					setRoleFilter={setRoleFilter}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					pageSize={pageSize}
					setPageSize={setPageSize}
					setCurrentPage={setCurrentPage}
					bulkSelected={bulkSelected}
					onBulkAction={handleBulkAction}
					onClearBulkSelection={() => setBulkSelected([])}
					isLoading={isLoading}
				/>
			</div>

			{/* Data Table */}
			<div className="mt-6">
				<DataTable
					columns={columns}
					data={usersData?.users || []}
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
			{usersData && (
				<Pagination
					currentPage={currentPage}
					totalPages={usersData.totalPages}
					totalItems={usersData.totalUsers}
					pageSize={pageSize}
					onPageChange={handlePageChange}
					loading={isLoading}
				/>
			)}

			{/* User Modal */}
			<UserModal
				user={selectedUser}
				isOpen={showUserModal}
				onClose={() => {
					setShowUserModal(false);
					setSelectedUser(null);
				}}
				onUserAction={handleUserAction}
				isLoading={apiLoading}
			/>
		</div>
	);
}
