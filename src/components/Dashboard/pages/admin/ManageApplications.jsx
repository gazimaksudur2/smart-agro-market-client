import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaUserTie,
	FaUser,
	FaSearch,
	FaFilter,
	FaEye,
	FaCheck,
	FaTimes,
	FaClock,
	FaMapMarkerAlt,
	FaPhone,
	FaEnvelope,
	FaIdCard,
	FaBuilding,
	FaUsers,
	FaBoxOpen,
	FaMoneyBillWave,
	FaSpinner,
	FaExclamationTriangle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { toast } from "react-hot-toast";
import useScrollToTop from "../../../../hooks/useScrollToTop";

// Import modular components
import { DataTable, Pagination } from "./components/DataTable";
import {
	ModernModal,
	ActionButton,
	InfoCard,
	DetailRow,
	TabPanel,
} from "./components/ModernModal";
import { ApplicationModal } from "./components/ApplicationModal";
import { ReasonModal } from "../../../common/ReasonModal";
import useRegions from "../../../../hooks/useRegions";

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

const ApplicationTypeBadge = ({ type }) => {
	const typeConfig = {
		"seller-application": {
			text: "Seller",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			icon: "🌱",
		},
		"agent-application": {
			text: "Agent",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			icon: "🤝",
		},
	};

	const config = typeConfig[type] || typeConfig["seller-application"];

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} transition-all duration-200 hover:shadow-sm hover:scale-105`}
		>
			<span className="mr-1.5">{config.icon}</span>
			{config.text}
		</span>
	);
};

export default function ManageApplications() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();

	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [regionFilter, setRegionFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [showApplicationModal, setShowApplicationModal] = useState(false);
	const [bulkSelected, setBulkSelected] = useState([]);
	const [showBulkReasonModal, setShowBulkReasonModal] = useState(false);
	const [bulkAction, setBulkAction] = useState(null);

	// Debounce search term
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Build query parameters
	const queryParams = useMemo(() => {
		const params = new URLSearchParams({
			page: currentPage.toString(),
			limit: pageSize.toString(),
		});

		if (statusFilter !== "all") params.append("status", statusFilter);
		if (typeFilter !== "all") params.append("applicationType", typeFilter);
		if (regionFilter !== "all") params.append("region", regionFilter);
		if (debouncedSearchTerm.trim())
			params.append("search", debouncedSearchTerm.trim());

		return params.toString();
	}, [
		currentPage,
		pageSize,
		statusFilter,
		typeFilter,
		regionFilter,
		debouncedSearchTerm,
	]);

	// Reset current page when search term changes
	useEffect(() => {
		if (searchTerm !== debouncedSearchTerm && debouncedSearchTerm.length >= 0) {
			setCurrentPage(1);
			setBulkSelected([]);
		}
	}, [debouncedSearchTerm, searchTerm]);

	// Fetch applications
	const {
		data: applicationsData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["applications", queryParams],
		async () => {
			try {
				const response = await apiCall(
					`/applications/all-applications?${queryParams}`
				);
				// Check if response has success field and return data accordingly
				if (response?.success) {
					return {
						applications: response.applications || [],
						totalApplications: response.totalApplications || 0,
						totalPages: response.totalPages || 1,
						currentPage: response.currentPage || 1,
						pageSize: response.pageSize || 10,
						userRole: response.userRole || "admin",
					};
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching applications:", error);
				throw error;
			}
		},
		{
			keepPreviousData: true,
			staleTime: 30000,
			refetchOnWindowFocus: false,
		}
	);

	// Fetch admin statistics
	const { data: adminStats } = useQuery(
		["adminStatistics"],
		async () => {
			try {
				const response = await apiCall("/applications/statistics");
				// Check if response has success field and return statistics accordingly
				if (response?.success) {
					return response.statistics;
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching admin statistics:", error);
				return null;
			}
		},
		{
			enabled: !!currentUser?.DBUser?._id,
			staleTime: 60000,
		}
	);

	const regions = useRegions().map((region) => region.name);

	// Handle application actions
	const handleApplicationAction = async (
		applicationId,
		action,
		reason = ""
	) => {
		try {
			const endpoint = `/applications/${applicationId}/${action}`;
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
				toast.success(
					response.message || `Application ${action}d successfully!`
				);
			} else {
				toast.success(`Application ${action}d successfully!`);
			}
			refetch();
		} catch (error) {
			console.error(`Error ${action}ing application:`, error);
			toast.error(`Failed to ${action} application. Please try again.`);
		}
	};

	// Handle bulk actions with reason
	const handleBulkActionWithReason = (action) => {
		if (bulkSelected.length === 0) {
			toast.warning("Please select applications first");
			return;
		}

		setBulkAction(action);
		setShowBulkReasonModal(true);
	};

	// Execute bulk action
	const executeBulkAction = async (reason) => {
		try {
			const response = await apiCall("/applications/bulk-action", "PATCH", {
				applicationIds: bulkSelected,
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
		setBulkSelected([]);
	};

	// Handle row click
	const handleRowClick = (application) => {
		setSelectedApplication(application);
		setShowApplicationModal(true);
	};

	// Get statistics - use backend stats if available, fallback to frontend calculation
	const getStats = () => {
		if (adminStats) {
			return adminStats;
		}

		// Fallback calculation if backend stats are not available
		if (!applicationsData?.applications) {
			return {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0,
				sellers: 0,
				agents: 0,
				byType: {
					"seller-application": 0,
					"agent-application": 0,
				},
			};
		}

		const applications = applicationsData.applications;
		return {
			total: applicationsData.totalApplications || 0,
			pending: applications.filter((app) => app.status === "pending").length,
			approved: applications.filter((app) => app.status === "approved").length,
			rejected: applications.filter((app) => app.status === "rejected").length,
			sellers: applications.filter(
				(app) => app.applicationType === "seller-application"
			).length,
			agents: applications.filter(
				(app) => app.applicationType === "agent-application"
			).length,
		};
	};

	const stats = getStats();

	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

	// Define table columns
	const columns = [
		{
			key: "applicantName",
			title: "Applicant",
			sortable: true,
			render: (value, application) => (
				<div className="flex items-center">
					<img
						src={
							application.applicantImg ||
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
						<div className="text-sm text-gray-500">
							{application.applicantEmail}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "applicationType",
			title: "Type",
			render: (value) => <ApplicationTypeBadge type={value} />,
		},
		{
			key: "operationalArea",
			title: "Location",
			render: (value) => (
				<div className="text-sm">
					<div className="font-medium text-gray-900">{value.district}</div>
					<div className="text-gray-500">{value.region}</div>
				</div>
			),
		},
		{
			key: "status",
			title: "Status",
			render: (value) => <StatusBadge status={value} />,
		},
		{
			key: "createdAt",
			title: "Applied",
			sortable: true,
			render: (value) => (
				<span className="text-sm text-gray-500">{formatDate(value)}</span>
			),
		},
	];

	// Loading state
	if (isLoading && !applicationsData) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Applications" />
				<div className="mt-6 flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
					<span className="ml-2 text-lg text-gray-600">
						Loading applications...
					</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Applications" />
				<div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<FaExclamationTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
					<h3 className="text-lg font-medium text-red-800 mb-2">
						Error Loading Applications
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
			<DashboardTitle title="Manage Applications" />

			{/* Statistics Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-primary-100">
								<FaUsers className="h-6 w-6 text-primary-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Total
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats.total}
								</dd>
							</dl>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-yellow-100">
								<FaClock className="h-6 w-6 text-yellow-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Pending
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats.pending}
								</dd>
							</dl>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-green-100">
								<FaCheck className="h-6 w-6 text-green-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Approved
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats.approved}
								</dd>
							</dl>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-red-100">
								<FaTimes className="h-6 w-6 text-red-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Rejected
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats.rejected}
								</dd>
							</dl>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-green-100">
								<FaUser className="h-6 w-6 text-green-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Sellers
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats?.byType?.["seller-application"]}
								</dd>
							</dl>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-blue-100">
								<FaUserTie className="h-6 w-6 text-blue-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Agents
								</dt>
								<dd className="text-3xl font-bold text-gray-900">
									{stats?.byType?.["agent-application"]}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			{/* Filters Panel */}
			<div className="mt-6 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							<FaSearch className="inline mr-2 h-4 w-4" />
							Search Applications
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by name, email..."
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							<FaFilter className="inline mr-2 h-4 w-4" />
							Type
						</label>
						<select
							value={typeFilter}
							onChange={(e) => {
								setTypeFilter(e.target.value);
								setCurrentPage(1);
							}}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						>
							<option value="all">All Types</option>
							<option value="seller-application">🌱 Sellers</option>
							<option value="agent-application">🤝 Agents</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setCurrentPage(1);
							}}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						>
							<option value="all">All Status</option>
							<option value="pending">⏳ Pending</option>
							<option value="approved">✅ Approved</option>
							<option value="rejected">❌ Rejected</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							Region
						</label>
						<select
							value={regionFilter}
							onChange={(e) => {
								setRegionFilter(e.target.value);
								setCurrentPage(1);
							}}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						>
							<option value="all">All Regions</option>
							{regions.map((region) => (
								<option key={region} value={region}>
									{region}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							Items Per Page
						</label>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setCurrentPage(1);
							}}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						>
							<option value={10}>10 per page</option>
							<option value={20}>20 per page</option>
							<option value={50}>50 per page</option>
						</select>
					</div>
				</div>

				{/* Bulk Actions */}
				{bulkSelected.length > 0 && (
					<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
									<span className="text-blue-600 font-semibold text-sm">
										{bulkSelected.length}
									</span>
								</div>
								<span className="text-sm font-medium text-blue-800">
									{bulkSelected.length} application
									{bulkSelected.length > 1 ? "s" : ""} selected
								</span>
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() => handleBulkActionWithReason("approve")}
									className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105"
								>
									<FaCheck className="inline mr-1 h-4 w-4" />
									Approve
								</button>
								<button
									onClick={() => handleBulkActionWithReason("reject")}
									className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105"
								>
									<FaTimes className="inline mr-1 h-4 w-4" />
									Reject
								</button>
								<button
									onClick={() => setBulkSelected([])}
									className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Data Table */}
			<div className="mt-6">
				<DataTable
					columns={columns}
					data={applicationsData?.applications || []}
					loading={isLoading}
					onRowClick={handleRowClick}
					selectedItems={bulkSelected}
					onSelectionChange={setBulkSelected}
				/>
			</div>

			{/* Pagination */}
			{applicationsData && (
				<Pagination
					currentPage={currentPage}
					totalPages={applicationsData.totalPages}
					totalItems={applicationsData.totalApplications}
					pageSize={pageSize}
					onPageChange={handlePageChange}
					loading={isLoading}
				/>
			)}

			{/* Application Modal */}
			<ApplicationModal
				application={selectedApplication}
				isOpen={showApplicationModal}
				onClose={() => {
					setSelectedApplication(null);
					setShowApplicationModal(false);
				}}
				onApprove={(applicationId) => {
					handleApplicationAction(applicationId, "approve");
					setSelectedApplication(null);
					setShowApplicationModal(false);
				}}
				onReject={(applicationId, reason) => {
					handleApplicationAction(applicationId, "reject", reason);
					setSelectedApplication(null);
					setShowApplicationModal(false);
				}}
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
					bulkAction === "approve" ? "Approve" : "Reject"
				} Applications`}
				description={`Please provide a reason for ${
					bulkAction === "approve" ? "approving" : "rejecting"
				} ${bulkSelected.length} selected application${
					bulkSelected.length > 1 ? "s" : ""
				}. This reason will be shared with all affected applicants.`}
				placeholder={
					bulkAction === "approve"
						? "e.g., All requirements met, applications approved in batch..."
						: "e.g., Missing documentation, batch rejection due to policy changes..."
				}
				confirmText={`${bulkAction === "approve" ? "Approve" : "Reject"} ${
					bulkSelected.length
				} Application${bulkSelected.length > 1 ? "s" : ""}`}
				type={bulkAction === "approve" ? "info" : "danger"}
				isLoading={apiLoading}
			/>
		</div>
	);
}
