import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaUserCheck,
	FaSearch,
	FaFilter,
	FaEye,
	FaCheck,
	FaTimes,
	FaClock,
	FaUser,
	FaMapMarkerAlt,
	FaStore,
	FaSpinner,
	FaExclamationTriangle,
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
		"in-review": {
			text: "In Review",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			dotColor: "bg-blue-400",
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

export default function VerifySellers() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedSeller, setSelectedSeller] = useState(null);

	// ReasonModal state
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [currentAction, setCurrentAction] = useState("");
	const [currentSellerId, setCurrentSellerId] = useState("");

	// Build query parameters for agent-specific applications
	const queryParams = new URLSearchParams({
		page: currentPage.toString(),
		limit: pageSize.toString(),
	});

	if (statusFilter !== "all") queryParams.append("status", statusFilter);
	if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());

	// Fetch agent's seller applications using agent-specific endpoint
	const {
		data: applicationsData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["agentApplications", queryParams.toString()],
		async () => {
			try {
				const response = await apiCall(
					`/applications/agent/applications?${queryParams}`
				);
				// Check if response has success field and return data accordingly
				if (response?.success) {
					return {
						applications: response.applications || [],
						totalApplications: response.totalApplications || 0,
						totalPages: response.totalPages || 1,
						currentPage: response.currentPage || 1,
						pageSize: response.pageSize || 10,
					};
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching agent applications:", error);
				throw error;
			}
		},
		{
			enabled: !!currentUser?.DBUser?._id,
			keepPreviousData: true,
			staleTime: 30000,
			refetchOnWindowFocus: false,
		}
	);

	// Fetch agent statistics
	const { data: agentStats } = useQuery(
		["agentStatistics"],
		async () => {
			try {
				const response = await apiCall("/applications/agent/statistics");
				// Check if response has success field and return statistics accordingly
				if (response?.success) {
					return response.statistics;
				}
				// Fallback for backward compatibility
				return response;
			} catch (error) {
				console.error("Error fetching agent statistics:", error);
				return null;
			}
		},
		{
			enabled: !!currentUser?.DBUser?._id,
			staleTime: 60000,
		}
	);

	// Fetch agent operational area info
	const { data: operationalInfo } = useQuery(
		["agentOperationalArea"],
		async () => {
			try {
				const response = await apiCall("/applications/agent/operational-area");
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
			enabled: !!currentUser?.DBUser?._id,
			staleTime: 300000, // 5 minutes - rarely changes
		}
	);

	const applications = applicationsData?.applications || [];

	const handleSellerAction = async (applicationId, action, reason = "") => {
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

	const handleReasonConfirm = (reason) => {
		handleSellerAction(currentSellerId, currentAction, reason);
		setShowReasonModal(false);
		setCurrentAction("");
		setCurrentSellerId("");
	};

	const handleReasonCancel = () => {
		setShowReasonModal(false);
		setCurrentAction("");
		setCurrentSellerId("");
	};

	// Use backend statistics if available, fallback to frontend calculation
	const getSellerStats = () => {
		if (agentStats) {
			return agentStats;
		}

		// Fallback calculation
		return {
			total: applications.length,
			pending: applications.filter((app) => app.status === "pending").length,
			approved: applications.filter((app) => app.status === "approved").length,
			rejected: applications.filter((app) => app.status === "rejected").length,
			inReview: applications.filter((app) => app.status === "in-review").length,
		};
	};

	const stats = getSellerStats();

	// Loading state
	if (isLoading && !applicationsData) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Sellers" />
				<div className="mt-6 flex justify-center items-center h-64">
					<FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
					<span className="ml-2 text-lg text-gray-600">
						Loading seller applications...
					</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Sellers" />
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
		<div className="py-6">
			<DashboardTitle title="Verify Sellers" />

			{/* Operational Area Info */}
			{operationalInfo && (
				<div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
					<div className="flex items-center">
						<FaMapMarkerAlt className="h-5 w-5 text-blue-600 mr-2" />
						<span className="text-sm font-medium text-blue-800">
							Your Operational Area: {operationalInfo.region}
							{operationalInfo.district && ` - ${operationalInfo.district}`}
						</span>
					</div>
				</div>
			)}

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="p-3 rounded-full bg-primary-100">
								<FaUser className="h-6 w-6 text-primary-600" />
							</div>
						</div>
						<div className="ml-5 w-0 flex-1">
							<dl>
								<dt className="text-sm font-medium text-gray-500 truncate">
									Total Applications
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
									Pending Review
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
								<FaUserCheck className="h-6 w-6 text-green-600" />
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
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							<FaSearch className="inline mr-2 h-4 w-4" />
							Search Applications
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by name, email, farm name..."
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							<FaFilter className="inline mr-2 h-4 w-4" />
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
						>
							<option value="all">All Status</option>
							<option value="pending">⏳ Pending Review</option>
							<option value="in-review">👁️ In Review</option>
							<option value="approved">✅ Approved</option>
							<option value="rejected">❌ Rejected</option>
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
			</div>

			{/* Seller Applications List */}
			<div className="mt-6 bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
				<div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
					<h3 className="text-lg font-medium text-gray-900">
						Seller Applications
						{applicationsData?.totalApplications && (
							<span className="ml-2 text-sm text-gray-600">
								({applicationsData.totalApplications} total)
							</span>
						)}
					</h3>
				</div>

				{applications.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No seller applications found matching your criteria.</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{applications.map((application) => (
							<div
								key={application._id}
								className="p-6 hover:bg-gray-50 transition-colors duration-200"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center">
										<img
											src={
												application.applicantImg ||
												`https://ui-avatars.com/api/?name=${encodeURIComponent(
													application.applicantName
												)}&background=6366f1&color=fff&size=48`
											}
											alt={application.applicantName}
											className="h-12 w-12 rounded-full object-cover mr-4"
											onError={(e) => {
												e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
													application.applicantName
												)}&background=6366f1&color=fff&size=48`;
											}}
										/>
										<div>
											<h4 className="text-lg font-medium text-gray-900">
												{application.applicantName}
											</h4>
											<p className="text-sm text-gray-500">
												{application.applicantEmail}
											</p>
											<p className="text-sm text-gray-500">
												Applied on{" "}
												{new Date(application.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className="text-right">
										<StatusBadge status={application.status} />
									</div>
								</div>

								{/* Application Information */}
								<div className="mb-4 p-4 bg-gray-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaStore className="inline mr-1" />
										Business Information
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p>
												<strong>Farm Name:</strong>{" "}
												{application.formData?.farmName || "Not provided"}
											</p>
											<p>
												<strong>Farm Type:</strong>{" "}
												{application.formData?.farmType || "Not provided"}
											</p>
											<p>
												<strong>Farm Size:</strong>{" "}
												{application.formData?.farmSize || "Not provided"}
											</p>
										</div>
										<div>
											<p>
												<strong>Experience:</strong>{" "}
												{application.formData?.experience || "Not provided"}
											</p>
											<p>
												<strong>Specialization:</strong>{" "}
												{application.formData?.specialization || "Not provided"}
											</p>
										</div>
									</div>
								</div>

								{/* Location Information */}
								<div className="mb-4 p-4 bg-green-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaMapMarkerAlt className="inline mr-1" />
										Location Details
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<p>
											<strong>Region:</strong>{" "}
											{application.operationalArea?.region || "Not provided"}
										</p>
										<p>
											<strong>District:</strong>{" "}
											{application.operationalArea?.district || "Not provided"}
										</p>
									</div>
								</div>

								{/* Review Information */}
								{application.reviewedAt && (
									<div className="mb-4 p-4 bg-blue-50 rounded-lg">
										<h5 className="font-medium text-gray-900 mb-2">
											Review Information
										</h5>
										<div className="text-sm">
											<p>
												<strong>Reviewed on:</strong>{" "}
												{new Date(application.reviewedAt).toLocaleDateString()}
											</p>
											{application.reviewNotes && (
												<p>
													<strong>Notes:</strong> {application.reviewNotes}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex items-center space-x-3">
									<button
										onClick={() => setSelectedSeller(application)}
										className="flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 border border-primary-200 rounded-lg hover:bg-primary-200 transition-all duration-200"
									>
										<FaEye className="mr-2 h-4 w-4" />
										View Details
									</button>

									{application.status === "pending" && (
										<>
											<button
												onClick={() =>
													handleSellerAction(application._id, "approve")
												}
												disabled={apiLoading}
												className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-all duration-200 disabled:opacity-50"
											>
												<FaCheck className="mr-2 h-4 w-4" />
												Approve
											</button>
											<button
												onClick={() => {
													setCurrentSellerId(application._id);
													setCurrentAction("reject");
													setShowReasonModal(true);
												}}
												disabled={apiLoading}
												className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-all duration-200 disabled:opacity-50"
											>
												<FaTimes className="mr-2 h-4 w-4" />
												Reject
											</button>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Pagination */}
			{applicationsData && applicationsData.totalPages > 1 && (
				<div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
					<div className="flex-1 flex justify-between sm:hidden">
						<button
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
						>
							Previous
						</button>
						<button
							onClick={() =>
								setCurrentPage(
									Math.min(applicationsData.totalPages, currentPage + 1)
								)
							}
							disabled={currentPage === applicationsData.totalPages}
							className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
						>
							Next
						</button>
					</div>
					<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700">
								Showing{" "}
								<span className="font-medium">
									{(currentPage - 1) * pageSize + 1}
								</span>{" "}
								to{" "}
								<span className="font-medium">
									{Math.min(
										currentPage * pageSize,
										applicationsData.totalApplications
									)}
								</span>{" "}
								of{" "}
								<span className="font-medium">
									{applicationsData.totalApplications}
								</span>{" "}
								results
							</p>
						</div>
						<div>
							<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
								<button
									onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
									disabled={currentPage === 1}
									className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
								>
									Previous
								</button>
								<span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
									Page {currentPage} of {applicationsData.totalPages}
								</span>
								<button
									onClick={() =>
										setCurrentPage(
											Math.min(applicationsData.totalPages, currentPage + 1)
										)
									}
									disabled={currentPage === applicationsData.totalPages}
									className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
								>
									Next
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}

			{/* Seller Detail Modal */}
			{selectedSeller && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Seller Application Details - {selectedSeller.applicantName}
								</h3>
								<button
									onClick={() => setSelectedSeller(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							{/* Detailed application content */}
							<div className="space-y-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-900 mb-2">
										Personal Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<p>
											<strong>Email:</strong> {selectedSeller.applicantEmail}
										</p>
										<p>
											<strong>NID:</strong>{" "}
											{selectedSeller.formData?.nidNumber || "Not provided"}
										</p>
									</div>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-900 mb-2">
										Farm Details
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<p>
											<strong>Farm Address:</strong>{" "}
											{selectedSeller.formData?.farmAddress || "Not provided"}
										</p>
										<p>
											<strong>Certifications:</strong>{" "}
											{selectedSeller.formData?.certifications || "None"}
										</p>
									</div>
								</div>

								{selectedSeller.formData?.motivation && (
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="font-medium text-gray-900 mb-2">
											Motivation
										</h4>
										<p className="text-sm">
											{selectedSeller.formData.motivation}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ReasonModal */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={handleReasonCancel}
				onConfirm={handleReasonConfirm}
				title="Reject Seller Application"
				description="Please provide a reason for rejecting this seller application. This will help the seller understand the decision and improve future applications."
				placeholder="e.g., Incomplete documentation, insufficient experience, location restrictions..."
				confirmText="Reject Application"
				type="danger"
				isLoading={apiLoading}
			/>
		</div>
	);
}
