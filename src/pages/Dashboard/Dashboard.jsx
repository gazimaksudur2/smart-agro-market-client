import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "react-query";
import axios from "axios";
import {
	FaBoxOpen,
	FaShoppingCart,
	FaUsers,
	FaChartLine,
	FaMoneyBillWave,
	FaTruck,
} from "react-icons/fa";

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

export default function Dashboard() {
	const { userRole, currentUser, accessToken } = useAuth();
	const navigate = useNavigate();
	const [stats, setStats] = useState({});
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Fetch dashboard stats based on user role
	const { data, isLoading, error } = useQuery(
		["dashboardStats", userRole],
		async () => {
			if (!currentUser) return null;

			try {
				const { data } = await axios.get(`${apiBaseUrl}/dashboard/stats`);
				return data;
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

	// Redirect to role-specific dashboard if needed
	useEffect(() => {
		if (userRole === "admin") {
			navigate("/dashboard/admin");
		} else if (userRole === "agent") {
			navigate("/dashboard/agent");
		}
	}, [userRole, navigate]);

	// Placeholder stats for frontend demo
	const placeholderStats = {
		products: 24,
		orders: 12,
		revenue: "৳ 54,500",
		growth: "8.2%",
	};

	return (
		<div className="py-6">
			<div className="px-4 sm:px-6 md:px-8">
				<h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

				{/* Welcome message */}
				<div className="mt-2 mb-6">
					<p className="text-gray-700">
						Welcome back,{" "}
						<span className="font-medium">
							{currentUser?.displayName || "User"}
						</span>
						! Here's what's happening with your account.
					</p>
				</div>

				{/* Stats Grid */}
				<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{userRole === "seller" && (
						<>
							<StatCard
								title="Total Products"
								value={stats?.productCount || placeholderStats.products}
								icon={<FaBoxOpen className="h-6 w-6 text-primary-600" />}
								color="primary"
							/>
							<StatCard
								title="Pending Orders"
								value={stats?.pendingOrderCount || 5}
								icon={<FaShoppingCart className="h-6 w-6 text-secondary-600" />}
								color="secondary"
							/>
							<StatCard
								title="Total Sales"
								value={stats?.totalSales || placeholderStats.revenue}
								icon={<FaMoneyBillWave className="h-6 w-6 text-green-600" />}
								color="green"
							/>
							<StatCard
								title="Growth"
								value={stats?.growth || placeholderStats.growth}
								icon={<FaChartLine className="h-6 w-6 text-accent-600" />}
								color="accent"
							/>
						</>
					)}

					{userRole === "consumer" && (
						<>
							<StatCard
								title="Total Orders"
								value={stats?.orderCount || placeholderStats.orders}
								icon={<FaShoppingCart className="h-6 w-6 text-primary-600" />}
								color="primary"
							/>
							<StatCard
								title="Active Orders"
								value={stats?.activeOrderCount || 3}
								icon={<FaTruck className="h-6 w-6 text-secondary-600" />}
								color="secondary"
							/>
							<StatCard
								title="Total Spent"
								value={stats?.totalSpent || "৳ 28,750"}
								icon={<FaMoneyBillWave className="h-6 w-6 text-green-600" />}
								color="green"
							/>
							<StatCard
								title="Favorite Sellers"
								value={stats?.favoriteSellersCount || 7}
								icon={<FaUsers className="h-6 w-6 text-accent-600" />}
								color="accent"
							/>
						</>
					)}
				</div>

				{/* Recent Activity Section */}
				<div className="mt-8">
					<h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
					<div className="mt-3 bg-white shadow overflow-hidden rounded-lg">
						{isLoading ? (
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
													<p className="text-sm text-gray-400">
														{activity.time}
													</p>
												</div>
											</div>
										</div>
									))
								)}

								{/* Placeholder activity items for frontend demo */}
								{(!stats?.recentActivity ||
									stats.recentActivity.length === 0) && (
									<>
										<div className="p-4 hover:bg-gray-50">
											<div className="flex items-center">
												<div className="flex-shrink-0">
													<div className="p-2 rounded-full bg-green-100">
														<FaBoxOpen className="h-5 w-5 text-green-600" />
													</div>
												</div>
												<div className="ml-4">
													<p className="text-sm font-medium text-gray-900">
														New product added
													</p>
													<p className="text-sm text-gray-500">
														You added "Premium Quality Rice" to your products
													</p>
												</div>
												<div className="ml-auto">
													<p className="text-sm text-gray-400">2 hours ago</p>
												</div>
											</div>
										</div>
										<div className="p-4 hover:bg-gray-50">
											<div className="flex items-center">
												<div className="flex-shrink-0">
													<div className="p-2 rounded-full bg-secondary-100">
														<FaShoppingCart className="h-5 w-5 text-secondary-600" />
													</div>
												</div>
												<div className="ml-4">
													<p className="text-sm font-medium text-gray-900">
														New order received
													</p>
													<p className="text-sm text-gray-500">
														Order #1234 has been placed
													</p>
												</div>
												<div className="ml-auto">
													<p className="text-sm text-gray-400">Yesterday</p>
												</div>
											</div>
										</div>
										<div className="p-4 hover:bg-gray-50">
											<div className="flex items-center">
												<div className="flex-shrink-0">
													<div className="p-2 rounded-full bg-primary-100">
														<FaChartLine className="h-5 w-5 text-primary-600" />
													</div>
												</div>
												<div className="ml-4">
													<p className="text-sm font-medium text-gray-900">
														Monthly summary available
													</p>
													<p className="text-sm text-gray-500">
														Your April 2023 sales summary is now available
													</p>
												</div>
												<div className="ml-auto">
													<p className="text-sm text-gray-400">3 days ago</p>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
