import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaUsers,
	FaSearch,
	FaFilter,
	FaEye,
	FaEdit,
	FaBan,
	FaCheck,
	FaUserCheck,
	FaUserTimes,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaTimes,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		active: { color: "green", text: "Active" },
		inactive: { color: "gray", text: "Inactive" },
		suspended: { color: "red", text: "Suspended" },
		pending: { color: "yellow", text: "Pending" },
	};

	const config = statusConfig[status] || statusConfig.active;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

const RoleBadge = ({ role }) => {
	const roleConfig = {
		admin: { color: "purple", text: "Admin" },
		agent: { color: "blue", text: "Agent" },
		seller: { color: "green", text: "Seller" },
		consumer: { color: "gray", text: "Consumer" },
	};

	const config = roleConfig[role] || roleConfig.consumer;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

export default function ManageUsers() {
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);

	// Fetch all users
	const {
		data: users,
		isLoading,
		error,
		refetch,
	} = useQuery(["allUsers"], async () => {
		try {
			return await apiCall("/admin/users");
		} catch (error) {
			console.error("Error fetching users:", error);
			return [];
		}
	});

	// Mock data for demo
	const mockUsers = [
		{
			id: "USER-001",
			name: "Ahmed Rahman",
			email: "ahmed.rahman@example.com",
			phone: "+8801712345678",
			role: "seller",
			status: "active",
			joinDate: "2024-01-15",
			lastLogin: "2024-01-22T10:30:00Z",
			address: "Savar, Dhaka",
			profilePicture:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
			verified: true,
			totalOrders: 45,
			totalSpent: 125000,
		},
		{
			id: "USER-002",
			name: "Fatima Khatun",
			email: "fatima.khatun@example.com",
			phone: "+8801812345678",
			role: "consumer",
			status: "active",
			joinDate: "2024-01-10",
			lastLogin: "2024-01-22T14:20:00Z",
			address: "Gulshan, Dhaka",
			profilePicture:
				"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
			verified: true,
			totalOrders: 12,
			totalSpent: 25000,
		},
		{
			id: "USER-003",
			name: "Mohammad Ali",
			email: "mohammad.ali@example.com",
			phone: "+8801912345678",
			role: "agent",
			status: "active",
			joinDate: "2023-12-20",
			lastLogin: "2024-01-22T09:15:00Z",
			address: "Manikganj, Dhaka",
			profilePicture:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
			verified: true,
			region: "Dhaka Division",
			managedSellers: 25,
		},
		{
			id: "USER-004",
			name: "Rashida Begum",
			email: "rashida.begum@example.com",
			phone: "+8801612345678",
			role: "seller",
			status: "suspended",
			joinDate: "2024-01-05",
			lastLogin: "2024-01-18T16:45:00Z",
			address: "Keraniganj, Dhaka",
			profilePicture:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
			verified: false,
			totalOrders: 8,
			totalSpent: 15000,
			suspensionReason: "Violation of platform policies",
		},
		{
			id: "USER-005",
			name: "Karim Uddin",
			email: "karim.uddin@example.com",
			phone: "+8801512345678",
			role: "consumer",
			status: "inactive",
			joinDate: "2023-11-30",
			lastLogin: "2024-01-10T12:00:00Z",
			address: "Gazipur, Dhaka",
			profilePicture:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
			verified: true,
			totalOrders: 3,
			totalSpent: 8500,
		},
	];

	const displayUsers = users || mockUsers;

	// Filter users
	useEffect(() => {
		let filtered = displayUsers;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(user) =>
					user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.phone.includes(searchTerm) ||
					user.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Role filter
		if (roleFilter !== "all") {
			filtered = filtered.filter((user) => user.role === roleFilter);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((user) => user.status === statusFilter);
		}

		setFilteredUsers(filtered);
	}, [displayUsers, searchTerm, roleFilter, statusFilter]);

	const handleUserAction = async (userId, action, reason = "") => {
		try {
			await apiCall(`/admin/users/${userId}/${action}`, "PATCH", {
				reason,
				adminId: currentUser?.FirebaseUser?.uid,
			});
			refetch();
			alert(`User ${action} successfully!`);
		} catch (error) {
			console.error(`Error ${action} user:`, error);
			alert(`Failed to ${action} user. Please try again.`);
		}
	};

	const getUserStats = () => {
		return {
			total: filteredUsers.length,
			active: filteredUsers.filter((user) => user.status === "active").length,
			suspended: filteredUsers.filter((user) => user.status === "suspended")
				.length,
			agents: filteredUsers.filter((user) => user.role === "agent").length,
			sellers: filteredUsers.filter((user) => user.role === "seller").length,
			consumers: filteredUsers.filter((user) => user.role === "consumer")
				.length,
		};
	};

	const stats = getUserStats();

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Manage Users" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Manage Users" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaUsers className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Users
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
								<FaUserCheck className="h-6 w-6 text-green-600" />
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
								<FaUserTimes className="h-6 w-6 text-red-600" />
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
								<FaUserCheck className="h-6 w-6 text-blue-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Agents
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.agents}
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
								<FaUsers className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Sellers
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.sellers}
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
								<FaUsers className="h-6 w-6 text-gray-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Consumers
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.consumers}
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
							Search Users
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by name, email, phone, or ID..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaFilter className="inline mr-1" />
							Role
						</label>
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Roles</option>
							<option value="admin">Admin</option>
							<option value="agent">Agent</option>
							<option value="seller">Seller</option>
							<option value="consumer">Consumer</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="suspended">Suspended</option>
							<option value="pending">Pending</option>
						</select>
					</div>
				</div>
			</div>

			{/* Users List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">Platform Users</h3>
				</div>

				{filteredUsers.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No users found matching your criteria.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role & Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Contact
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Activity
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredUsers.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<img
														className="h-10 w-10 rounded-full object-cover"
														src={user.profilePicture}
														alt={user.name}
													/>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{user.name}
													</div>
													<div className="text-sm text-gray-500">
														ID: {user.id}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="space-y-1">
												<RoleBadge role={user.role} />
												<StatusBadge status={user.status} />
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="space-y-1">
												<p>
													<FaEnvelope className="inline mr-1 text-gray-400" />
													{user.email}
												</p>
												<p>
													<FaPhone className="inline mr-1 text-gray-400" />
													{user.phone}
												</p>
												<p>
													<FaMapMarkerAlt className="inline mr-1 text-gray-400" />
													{user.address}
												</p>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div className="space-y-1">
												<p>
													<FaCalendarAlt className="inline mr-1" />
													Joined: {new Date(user.joinDate).toLocaleDateString()}
												</p>
												<p>
													Last Login:{" "}
													{new Date(user.lastLogin).toLocaleDateString()}
												</p>
												{user.role === "seller" || user.role === "consumer" ? (
													<p>
														Orders: {user.totalOrders} | Spent: ৳
														{user.totalSpent?.toLocaleString()}
													</p>
												) : user.role === "agent" ? (
													<p>Managing: {user.managedSellers} sellers</p>
												) : null}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center space-x-2">
												<button
													onClick={() => setSelectedUser(user)}
													className="text-primary-600 hover:text-primary-900"
												>
													<FaEye className="h-4 w-4" />
												</button>
												<button
													onClick={() => alert("Edit user functionality")}
													className="text-blue-600 hover:text-blue-900"
												>
													<FaEdit className="h-4 w-4" />
												</button>
												{user.status === "active" ? (
													<button
														onClick={() => {
															const reason = prompt(
																"Please provide a reason for suspension:"
															);
															if (reason) {
																handleUserAction(user.id, "suspend", reason);
															}
														}}
														disabled={apiLoading}
														className="text-red-600 hover:text-red-900"
													>
														<FaBan className="h-4 w-4" />
													</button>
												) : user.status === "suspended" ? (
													<button
														onClick={() =>
															handleUserAction(user.id, "activate")
														}
														disabled={apiLoading}
														className="text-green-600 hover:text-green-900"
													>
														<FaCheck className="h-4 w-4" />
													</button>
												) : null}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* User Detail Modal */}
			{selectedUser && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									User Details - {selectedUser.name}
								</h3>
								<button
									onClick={() => setSelectedUser(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							{/* User Profile */}
							<div className="space-y-4">
								<div className="flex items-center space-x-4">
									<img
										src={selectedUser.profilePicture}
										alt={selectedUser.name}
										className="h-20 w-20 rounded-full object-cover"
									/>
									<div>
										<h4 className="text-xl font-bold text-gray-900">
											{selectedUser.name}
										</h4>
										<div className="flex items-center space-x-2 mt-1">
											<RoleBadge role={selectedUser.role} />
											<StatusBadge status={selectedUser.status} />
										</div>
										<p className="text-sm text-gray-500 mt-1">
											User ID: {selectedUser.id}
										</p>
									</div>
								</div>

								{/* Contact Information */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										Contact Information
									</h5>
									<div className="space-y-2 text-sm">
										<p>
											<FaEnvelope className="inline mr-2" />
											{selectedUser.email}
										</p>
										<p>
											<FaPhone className="inline mr-2" />
											{selectedUser.phone}
										</p>
										<p>
											<FaMapMarkerAlt className="inline mr-2" />
											{selectedUser.address}
										</p>
									</div>
								</div>

								{/* Account Information */}
								<div className="bg-blue-50 p-4 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										Account Information
									</h5>
									<div className="space-y-2 text-sm">
										<p>
											<strong>Join Date:</strong>{" "}
											{new Date(selectedUser.joinDate).toLocaleDateString()}
										</p>
										<p>
											<strong>Last Login:</strong>{" "}
											{new Date(selectedUser.lastLogin).toLocaleDateString()}
										</p>
										<p>
											<strong>Verified:</strong>{" "}
											{selectedUser.verified ? "Yes" : "No"}
										</p>
										{selectedUser.suspensionReason && (
											<p className="text-red-600">
												<strong>Suspension Reason:</strong>{" "}
												{selectedUser.suspensionReason}
											</p>
										)}
									</div>
								</div>

								{/* Role-specific Information */}
								{(selectedUser.role === "seller" ||
									selectedUser.role === "consumer") && (
									<div className="bg-green-50 p-4 rounded-lg">
										<h5 className="font-medium text-gray-900 mb-2">
											Activity Summary
										</h5>
										<div className="space-y-2 text-sm">
											<p>
												<strong>Total Orders:</strong>{" "}
												{selectedUser.totalOrders}
											</p>
											<p>
												<strong>Total Spent:</strong> ৳
												{selectedUser.totalSpent?.toLocaleString()}
											</p>
										</div>
									</div>
								)}

								{selectedUser.role === "agent" && (
									<div className="bg-purple-50 p-4 rounded-lg">
										<h5 className="font-medium text-gray-900 mb-2">
											Agent Information
										</h5>
										<div className="space-y-2 text-sm">
											<p>
												<strong>Region:</strong> {selectedUser.region}
											</p>
											<p>
												<strong>Managed Sellers:</strong>{" "}
												{selectedUser.managedSellers}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
