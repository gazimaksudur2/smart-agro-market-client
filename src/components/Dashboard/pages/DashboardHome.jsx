import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaBoxOpen,
	FaShoppingCart,
	FaUsers,
	FaChartLine,
	FaMoneyBillWave,
	FaTruck,
	FaUserCheck,
	FaWarehouse,
	FaClipboardList,
} from "react-icons/fa";
import useAPI from "../../../hooks/useAPI";
import DashboardTitle from "../DashboardTitle";

// Dashboard statistics card
const StatCard = ({ title, value, icon, color }) => (
	<div className="bg-white rounded-lg shadow p-5">
		<div className="flex justify-between items-center">
			<div>
				<p className="text-sm font-medium text-gray-500">{title}</p>
				<p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
			</div>
			<div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
		</div>
	</div>
);

export default function DashboardHome() {
	const { currentUser } = useAuth();
	const userRole = currentUser?.DBUser?.role || "consumer";
	const navigate = useNavigate();
	const [stats, setStats] = useState({});
	const { apiCall, loading: apiLoading } = useAPI();

	// Fetch dashboard stats based on user role
	const { data, isLoading, error } = useQuery(
		["dashboardStats", userRole],
		async () => {
			if (!currentUser) return null;

			try {
				// Use our custom API hook instead of direct axios call
				return await apiCall("/dashboard/stats");
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
				return null;
			}
		}
	);

	useEffect(() => {
		if (data) {
			setStats(data);
		}
	}, [data]);

	// Get role-specific title
	const getDashboardTitle = () => {
		switch (userRole) {
			case "admin":
				return "Admin Dashboard";
			case "agent":
				return "Agent Dashboard";
			case "seller":
				return "Seller Dashboard";
			case "consumer":
				return "Consumer Dashboard";
			default:
				return "Dashboard";
		}
	};

	// Placeholder stats for frontend demo
	const placeholderStats = {
		products: 24,
		orders: 12,
		revenue: "৳ 54,500",
		growth: "8.2%",
	};

	// Role-specific stats configuration
	const getStatsConfig = () => {
		switch (userRole) {
			case "admin":
				return [
					{
						title: "Total Users",
						value: stats?.totalUsers || 1250,
						icon: <FaUsers className="h-6 w-6 text-primary-600" />,
						color: "primary",
					},
					{
						title: "Active Agents",
						value: stats?.activeAgents || 45,
						icon: <FaUserCheck className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
					},
					{
						title: "Total Products",
						value: stats?.totalProducts || 2840,
						icon: <FaBoxOpen className="h-6 w-6 text-green-600" />,
						color: "green",
					},
					{
						title: "Platform Revenue",
						value: stats?.platformRevenue || "৳ 2,45,000",
						icon: <FaMoneyBillWave className="h-6 w-6 text-accent-600" />,
						color: "accent",
					},
				];

			case "agent":
				return [
					{
						title: "Verified Sellers",
						value: stats?.verifiedSellers || 28,
						icon: <FaUserCheck className="h-6 w-6 text-primary-600" />,
						color: "primary",
					},
					{
						title: "Pending Products",
						value: stats?.pendingProducts || 12,
						icon: <FaBoxOpen className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
					},
					{
						title: "Active Deliveries",
						value: stats?.activeDeliveries || 18,
						icon: <FaTruck className="h-6 w-6 text-green-600" />,
						color: "green",
					},
					{
						title: "Warehouse Stock",
						value: stats?.warehouseStock || "85%",
						icon: <FaWarehouse className="h-6 w-6 text-accent-600" />,
						color: "accent",
					},
				];

			case "seller":
				return [
					{
						title: "Total Products",
						value: stats?.productCount || placeholderStats.products,
						icon: <FaBoxOpen className="h-6 w-6 text-primary-600" />,
						color: "primary",
					},
					{
						title: "Pending Orders",
						value: stats?.pendingOrderCount || 5,
						icon: <FaShoppingCart className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
					},
					{
						title: "Total Sales",
						value: stats?.totalSales || placeholderStats.revenue,
						icon: <FaMoneyBillWave className="h-6 w-6 text-green-600" />,
						color: "green",
					},
					{
						title: "Growth",
						value: stats?.growth || placeholderStats.growth,
						icon: <FaChartLine className="h-6 w-6 text-accent-600" />,
						color: "accent",
					},
				];

			case "consumer":
			default:
				return [
					{
						title: "Total Orders",
						value: stats?.orderCount || placeholderStats.orders,
						icon: <FaShoppingCart className="h-6 w-6 text-primary-600" />,
						color: "primary",
					},
					{
						title: "Active Orders",
						value: stats?.activeOrderCount || 3,
						icon: <FaTruck className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
					},
					{
						title: "Total Spent",
						value: stats?.totalSpent || "৳ 28,750",
						icon: <FaMoneyBillWave className="h-6 w-6 text-green-600" />,
						color: "green",
					},
					{
						title: "Favorite Sellers",
						value: stats?.favoriteSellersCount || 7,
						icon: <FaUsers className="h-6 w-6 text-accent-600" />,
						color: "accent",
					},
				];
		}
	};

	const statsConfig = getStatsConfig();

	return (
		<div className="py-6">
			<DashboardTitle title={getDashboardTitle()} />

			{/* Welcome message */}
			<div className="mt-2 mb-6">
				<p className="text-gray-700">
					Welcome back,{" "}
					<span className="font-medium">
						{currentUser?.FirebaseUser?.displayName || "User"}
					</span>
					! Here's what's happening with your account.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{statsConfig.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			{/* Recent Activity Section */}
			<div className="mt-8">
				<h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
				<div className="mt-3 bg-white shadow overflow-hidden rounded-lg">
					{isLoading || apiLoading ? (
						<div className="p-10 flex justify-center">
							<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
						</div>
					) : error ? (
						<div className="p-6 text-center text-gray-500">
							Failed to load recent activity
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{/* If no recent activity is available */}
							{!stats?.recentActivity || stats.recentActivity.length === 0 ? (
								<div className="p-6 text-center text-gray-500">
									No recent activity found
								</div>
							) : (
								stats.recentActivity.map((activity, index) => (
									<div key={index} className="p-4 hover:bg-gray-50">
										<div className="flex items-center">
											<div className="flex-shrink-0">
												<div
													className={`p-2 rounded-full bg-${
														activity.color || "primary"
													}-100`}
												>
													{activity.icon || (
														<FaBoxOpen
															className={`h-5 w-5 text-${
																activity.color || "primary"
															}-600`}
														/>
													)}
												</div>
											</div>
											<div className="ml-4">
												<p className="text-sm font-medium text-gray-900">
													{activity.title}
												</p>
												<p className="text-sm text-gray-500">
													{activity.description}
												</p>
											</div>
											<div className="ml-auto">
												<p className="text-sm text-gray-400">{activity.time}</p>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mt-8">
				<h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
				<div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{userRole === "seller" && (
						<>
							<button
								onClick={() => navigate("/dashboard/add-product")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaBoxOpen className="h-8 w-8 text-primary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Add New Product</h3>
								<p className="text-sm text-gray-500">
									List a new product for sale
								</p>
							</button>
							<button
								onClick={() => navigate("/dashboard/my-products")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaClipboardList className="h-8 w-8 text-secondary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Manage Products</h3>
								<p className="text-sm text-gray-500">
									View and edit your products
								</p>
							</button>
						</>
					)}

					{userRole === "consumer" && (
						<>
							<button
								onClick={() => navigate("/products")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaShoppingCart className="h-8 w-8 text-primary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Browse Products</h3>
								<p className="text-sm text-gray-500">
									Discover fresh agricultural products
								</p>
							</button>
							<button
								onClick={() => navigate("/dashboard/my-orders")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaClipboardList className="h-8 w-8 text-secondary-600 mb-2" />
								<h3 className="font-medium text-gray-900">My Orders</h3>
								<p className="text-sm text-gray-500">Track your order status</p>
							</button>
						</>
					)}

					{userRole === "agent" && (
						<>
							<button
								onClick={() => navigate("/dashboard/agent/sellers")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaUserCheck className="h-8 w-8 text-primary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Verify Sellers</h3>
								<p className="text-sm text-gray-500">
									Review seller applications
								</p>
							</button>
							<button
								onClick={() => navigate("/dashboard/agent/products")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaBoxOpen className="h-8 w-8 text-secondary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Product Approval</h3>
								<p className="text-sm text-gray-500">
									Approve pending products
								</p>
							</button>
						</>
					)}

					{userRole === "admin" && (
						<>
							<button
								onClick={() => navigate("/dashboard/admin/agents")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaUserCheck className="h-8 w-8 text-primary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Manage Agents</h3>
								<p className="text-sm text-gray-500">
									Review agent applications
								</p>
							</button>
							<button
								onClick={() => navigate("/dashboard/admin/users")}
								className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<FaUsers className="h-8 w-8 text-secondary-600 mb-2" />
								<h3 className="font-medium text-gray-900">Manage Users</h3>
								<p className="text-sm text-gray-500">
									View and manage all users
								</p>
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
