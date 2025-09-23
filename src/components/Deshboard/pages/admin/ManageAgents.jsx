import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaUserTie,
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
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending Review" },
		approved: { color: "green", text: "Approved" },
		rejected: { color: "red", text: "Rejected" },
		active: { color: "blue", text: "Active" },
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

export default function ManageAgents() {
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [regionFilter, setRegionFilter] = useState("all");
	const [filteredAgents, setFilteredAgents] = useState([]);
	const [selectedAgent, setSelectedAgent] = useState(null);
	const [activeTab, setActiveTab] = useState("applications"); // applications or active

	// Fetch agent applications and active agents
	const {
		data: agentData,
		isLoading,
		error,
		refetch,
	} = useQuery(["agentManagement"], async () => {
		try {
			const [applications, activeAgents] = await Promise.all([
				apiCall("/admin/agent-applications"),
				apiCall("/admin/agents"),
			]);
			return { applications, activeAgents };
		} catch (error) {
			console.error("Error fetching agent data:", error);
			return { applications: [], activeAgents: [] };
		}
	});

	// Mock data for demo
	const mockAgentData = {
		applications: [
			{
				id: "AGENT-APP-001",
				applicationDate: "2024-01-20",
				personalInfo: {
					name: "Mohammad Hasan",
					email: "hasan@example.com",
					phone: "+8801712345678",
					nid: "1234567890123",
					address: "House 45, Road 12, Dhanmondi, Dhaka",
				},
				businessInfo: {
					companyName: "Dhaka Agricultural Hub",
					businessType: "Agricultural Distribution",
					experience: "5 years",
					warehouseCapacity: "500 tons",
					transportCapacity: "10 trucks",
					coverage: "Dhaka Division",
				},
				location: {
					region: "Dhaka",
					district: "Dhaka",
					upazila: "Dhanmondi",
				},
				documents: {
					nidCopy: "https://example.com/nid.jpg",
					businessLicense: "https://example.com/license.jpg",
					warehousePhotos: ["https://example.com/warehouse1.jpg"],
					bankStatement: "https://example.com/bank.pdf",
				},
				status: "pending",
				submittedAt: "2024-01-20T10:30:00Z",
			},
			{
				id: "AGENT-APP-002",
				applicationDate: "2024-01-18",
				personalInfo: {
					name: "Rashida Khatun",
					email: "rashida@example.com",
					phone: "+8801812345678",
					nid: "9876543210987",
					address: "Village: Comilla, Upazila: Comilla Sadar",
				},
				businessInfo: {
					companyName: "Comilla Agro Services",
					businessType: "Agricultural Services",
					experience: "8 years",
					warehouseCapacity: "300 tons",
					transportCapacity: "6 trucks",
					coverage: "Comilla District",
				},
				location: {
					region: "Chittagong",
					district: "Comilla",
					upazila: "Comilla Sadar",
				},
				documents: {
					nidCopy: "https://example.com/nid2.jpg",
					businessLicense: "https://example.com/license2.jpg",
					warehousePhotos: ["https://example.com/warehouse2.jpg"],
					bankStatement: "https://example.com/bank2.pdf",
				},
				status: "approved",
				submittedAt: "2024-01-18T14:20:00Z",
				approvedAt: "2024-01-19T09:15:00Z",
			},
		],
		activeAgents: [
			{
				id: "AGENT-001",
				name: "Mohammad Ali",
				email: "ali@example.com",
				phone: "+8801912345678",
				region: "Dhaka",
				district: "Manikganj",
				joinDate: "2023-12-01",
				status: "active",
				performance: {
					managedSellers: 25,
					totalProducts: 180,
					monthlyRevenue: 450000,
					rating: 4.7,
				},
				warehouseInfo: {
					capacity: "800 tons",
					currentStock: "320 tons",
					utilization: 40,
				},
			},
			{
				id: "AGENT-002",
				name: "Fatima Begum",
				email: "fatima@example.com",
				phone: "+8801812345678",
				region: "Chittagong",
				district: "Chittagong",
				joinDate: "2023-11-15",
				status: "active",
				performance: {
					managedSellers: 18,
					totalProducts: 142,
					monthlyRevenue: 320000,
					rating: 4.5,
				},
				warehouseInfo: {
					capacity: "600 tons",
					currentStock: "280 tons",
					utilization: 47,
				},
			},
			{
				id: "AGENT-003",
				name: "Karim Uddin",
				email: "karim@example.com",
				phone: "+8801612345678",
				region: "Rajshahi",
				district: "Rajshahi",
				joinDate: "2024-01-10",
				status: "suspended",
				performance: {
					managedSellers: 12,
					totalProducts: 85,
					monthlyRevenue: 180000,
					rating: 3.8,
				},
				warehouseInfo: {
					capacity: "400 tons",
					currentStock: "150 tons",
					utilization: 38,
				},
				suspensionReason: "Performance issues and customer complaints",
			},
		],
	};

	const displayData = agentData || mockAgentData;
	const currentData =
		activeTab === "applications"
			? displayData.applications
			: displayData.activeAgents;

	const regions = [
		"Dhaka",
		"Chittagong",
		"Rajshahi",
		"Khulna",
		"Sylhet",
		"Barisal",
		"Rangpur",
		"Mymensingh",
	];

	// Filter data
	useEffect(() => {
		let filtered = currentData;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter((item) => {
				const name =
					activeTab === "applications" ? item.personalInfo.name : item.name;
				const email =
					activeTab === "applications" ? item.personalInfo.email : item.email;
				const id = item.id;

				return (
					name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					id.toLowerCase().includes(searchTerm.toLowerCase())
				);
			});
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((item) => item.status === statusFilter);
		}

		// Region filter
		if (regionFilter !== "all") {
			filtered = filtered.filter((item) => {
				const region =
					activeTab === "applications" ? item.location.region : item.region;
				return region === regionFilter;
			});
		}

		setFilteredAgents(filtered);
	}, [currentData, searchTerm, statusFilter, regionFilter, activeTab]);

	const handleAgentAction = async (agentId, action, reason = "") => {
		try {
			const endpoint =
				activeTab === "applications"
					? `/admin/agent-applications/${agentId}/${action}`
					: `/admin/agents/${agentId}/${action}`;

			await apiCall(endpoint, "PATCH", {
				reason,
				adminId: currentUser?.FirebaseUser?.uid,
			});
			refetch();
			alert(`Agent ${action} successfully!`);
		} catch (error) {
			console.error(`Error ${action} agent:`, error);
			alert(`Failed to ${action} agent. Please try again.`);
		}
	};

	const getStats = () => {
		if (activeTab === "applications") {
			return {
				total: filteredAgents.length,
				pending: filteredAgents.filter((app) => app.status === "pending")
					.length,
				approved: filteredAgents.filter((app) => app.status === "approved")
					.length,
				rejected: filteredAgents.filter((app) => app.status === "rejected")
					.length,
			};
		} else {
			return {
				total: filteredAgents.length,
				active: filteredAgents.filter((agent) => agent.status === "active")
					.length,
				suspended: filteredAgents.filter(
					(agent) => agent.status === "suspended"
				).length,
				avgRating:
					filteredAgents.length > 0
						? (
								filteredAgents.reduce(
									(sum, agent) => sum + agent.performance.rating,
									0
								) / filteredAgents.length
						  ).toFixed(1)
						: 0,
			};
		}
	};

	const stats = getStats();

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Agents" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Manage Agents" />

			{/* Tabs */}
			<div className="mt-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveTab("applications")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "applications"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Agent Applications
						</button>
						<button
							onClick={() => setActiveTab("active")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "active"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Active Agents
						</button>
					</nav>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaUserTie className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total{" "}
										{activeTab === "applications" ? "Applications" : "Agents"}
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.total}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				{activeTab === "applications" ? (
					<>
						<div className="bg-white overflow-hidden shadow rounded-lg">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<FaClock className="h-6 w-6 text-yellow-600" />
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
										<FaTimes className="h-6 w-6 text-red-600" />
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
					</>
				) : (
					<>
						<div className="bg-white overflow-hidden shadow rounded-lg">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<FaCheck className="h-6 w-6 text-green-600" />
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												Active
											</dt>
											<dd className="text-lg font-medium text-gray-900">
												{stats.active}
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
												Suspended
											</dt>
											<dd className="text-lg font-medium text-gray-900">
												{stats.suspended}
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
										<FaUserTie className="h-6 w-6 text-blue-600" />
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												Avg Rating
											</dt>
											<dd className="text-lg font-medium text-gray-900">
												{stats.avgRating}
											</dd>
										</dl>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow rounded-lg p-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaSearch className="inline mr-1" />
							Search
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by name, email, or ID..."
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
							{activeTab === "applications" ? (
								<>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
								</>
							) : (
								<>
									<option value="active">Active</option>
									<option value="suspended">Suspended</option>
								</>
							)}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Region
						</label>
						<select
							value={regionFilter}
							onChange={(e) => setRegionFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Regions</option>
							{regions.map((region) => (
								<option key={region} value={region}>
									{region}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Data List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						{activeTab === "applications"
							? "Agent Applications"
							: "Active Agents"}
					</h3>
				</div>

				{filteredAgents.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaUserTie className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>
							No {activeTab === "applications" ? "applications" : "agents"}{" "}
							found matching your criteria.
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredAgents.map((item) => (
							<div key={item.id} className="p-6 hover:bg-gray-50">
								{activeTab === "applications" ? (
									// Application View
									<div>
										<div className="flex items-center justify-between mb-4">
											<div>
												<h4 className="text-lg font-medium text-gray-900">
													{item.personalInfo.name}
												</h4>
												<p className="text-sm text-gray-500">
													Application ID: {item.id}
												</p>
												<p className="text-sm text-gray-500">
													Submitted on{" "}
													{new Date(item.submittedAt).toLocaleDateString()}
												</p>
											</div>
											<StatusBadge status={item.status} />
										</div>

										{/* Personal Info */}
										<div className="mb-4 p-4 bg-gray-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-2">
												Personal Information
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
												<div>
													<p>
														<FaEnvelope className="inline mr-1" />
														{item.personalInfo.email}
													</p>
													<p>
														<FaPhone className="inline mr-1" />
														{item.personalInfo.phone}
													</p>
												</div>
												<div>
													<p>
														<FaIdCard className="inline mr-1" />
														{item.personalInfo.nid}
													</p>
													<p>
														<FaMapMarkerAlt className="inline mr-1" />
														{item.personalInfo.address}
													</p>
												</div>
											</div>
										</div>

										{/* Business Info */}
										<div className="mb-4 p-4 bg-blue-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-2">
												Business Information
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
												<div>
													<p>
														<strong>Company:</strong>{" "}
														{item.businessInfo.companyName}
													</p>
													<p>
														<strong>Type:</strong>{" "}
														{item.businessInfo.businessType}
													</p>
													<p>
														<strong>Experience:</strong>{" "}
														{item.businessInfo.experience}
													</p>
												</div>
												<div>
													<p>
														<strong>Warehouse:</strong>{" "}
														{item.businessInfo.warehouseCapacity}
													</p>
													<p>
														<strong>Transport:</strong>{" "}
														{item.businessInfo.transportCapacity}
													</p>
													<p>
														<strong>Coverage:</strong>{" "}
														{item.businessInfo.coverage}
													</p>
												</div>
											</div>
										</div>

										{/* Actions */}
										<div className="flex items-center space-x-3">
											<button
												onClick={() => setSelectedAgent(item)}
												className="btn btn-outline-primary btn-sm"
											>
												<FaEye className="mr-1 h-4 w-4" />
												View Details
											</button>

											{item.status === "pending" && (
												<>
													<button
														onClick={() =>
															handleAgentAction(item.id, "approve")
														}
														disabled={apiLoading}
														className="btn btn-success btn-sm"
													>
														<FaCheck className="mr-1 h-4 w-4" />
														Approve
													</button>
													<button
														onClick={() => {
															const reason = prompt(
																"Please provide a reason for rejection:"
															);
															if (reason) {
																handleAgentAction(item.id, "reject", reason);
															}
														}}
														disabled={apiLoading}
														className="btn btn-outline-red btn-sm"
													>
														<FaTimes className="mr-1 h-4 w-4" />
														Reject
													</button>
												</>
											)}
										</div>
									</div>
								) : (
									// Active Agent View
									<div>
										<div className="flex items-center justify-between mb-4">
											<div>
												<h4 className="text-lg font-medium text-gray-900">
													{item.name}
												</h4>
												<p className="text-sm text-gray-500">
													Agent ID: {item.id}
												</p>
												<p className="text-sm text-gray-500">
													<FaMapMarkerAlt className="inline mr-1" />
													{item.district}, {item.region}
												</p>
											</div>
											<StatusBadge status={item.status} />
										</div>

										{/* Performance Metrics */}
										<div className="mb-4 p-4 bg-green-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-2">
												Performance Metrics
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
												<div className="text-center">
													<p className="font-medium text-gray-900">
														{item.performance.managedSellers}
													</p>
													<p className="text-gray-500">Sellers</p>
												</div>
												<div className="text-center">
													<p className="font-medium text-gray-900">
														{item.performance.totalProducts}
													</p>
													<p className="text-gray-500">Products</p>
												</div>
												<div className="text-center">
													<p className="font-medium text-gray-900">
														৳{item.performance.monthlyRevenue.toLocaleString()}
													</p>
													<p className="text-gray-500">Monthly Revenue</p>
												</div>
												<div className="text-center">
													<p className="font-medium text-gray-900">
														{item.performance.rating}/5
													</p>
													<p className="text-gray-500">Rating</p>
												</div>
											</div>
										</div>

										{/* Warehouse Info */}
										<div className="mb-4 p-4 bg-purple-50 rounded-lg">
											<h5 className="font-medium text-gray-900 mb-2">
												Warehouse Information
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
												<p>
													<strong>Capacity:</strong>{" "}
													{item.warehouseInfo.capacity}
												</p>
												<p>
													<strong>Current Stock:</strong>{" "}
													{item.warehouseInfo.currentStock}
												</p>
												<p>
													<strong>Utilization:</strong>{" "}
													{item.warehouseInfo.utilization}%
												</p>
											</div>
										</div>

										{item.suspensionReason && (
											<div className="mb-4 p-4 bg-red-50 rounded-lg">
												<h5 className="font-medium text-red-900 mb-2">
													Suspension Reason
												</h5>
												<p className="text-sm text-red-800">
													{item.suspensionReason}
												</p>
											</div>
										)}

										{/* Actions */}
										<div className="flex items-center space-x-3">
											<button
												onClick={() => setSelectedAgent(item)}
												className="btn btn-outline-primary btn-sm"
											>
												<FaEye className="mr-1 h-4 w-4" />
												View Details
											</button>

											{item.status === "active" ? (
												<button
													onClick={() => {
														const reason = prompt(
															"Please provide a reason for suspension:"
														);
														if (reason) {
															handleAgentAction(item.id, "suspend", reason);
														}
													}}
													disabled={apiLoading}
													className="btn btn-outline-red btn-sm"
												>
													Suspend Agent
												</button>
											) : (
												<button
													onClick={() => handleAgentAction(item.id, "activate")}
													disabled={apiLoading}
													className="btn btn-success btn-sm"
												>
													<FaCheck className="mr-1 h-4 w-4" />
													Activate
												</button>
											)}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{selectedAgent && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									{activeTab === "applications" ? "Application" : "Agent"}{" "}
									Details -{" "}
									{activeTab === "applications"
										? selectedAgent.personalInfo.name
										: selectedAgent.name}
								</h3>
								<button
									onClick={() => setSelectedAgent(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							<div className="text-sm text-gray-600">
								<p>
									Detailed{" "}
									{activeTab === "applications" ? "application" : "agent"}{" "}
									information would be displayed here...
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
