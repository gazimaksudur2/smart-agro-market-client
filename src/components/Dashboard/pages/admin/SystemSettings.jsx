import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	FaUsers,
	FaUserCheck,
	FaBoxOpen,
	FaShoppingCart,
	FaMoneyBillWave,
	FaChartLine,
	FaExclamationTriangle,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatCard = ({ title, value, icon, color, trend, link }) => (
	<div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
		<div className="flex justify-between items-start">
			<div className="flex-1">
				<p className="text-sm font-medium text-gray-500">{title}</p>
				<p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
				{trend && (
					<p
						className={`text-sm mt-1 ${
							trend.positive ? "text-green-600" : "text-red-600"
						}`}
					>
						{trend.positive ? "↗" : "↘"} {trend.value}
					</p>
				)}
				{link && (
					<Link
						to={link}
						className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
					>
						View Details →
					</Link>
				)}
			</div>
			<div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
		</div>
	</div>
);

export default function SystemSettings() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [stats, setStats] = useState({});

	// Fetch admin dashboard stats
	const { data, isLoading, error } = useQuery(
		["adminDashboardStats"],
		async () => {
			try {
				return await apiCall("/admin/dashboard-stats");
			} catch (error) {
				console.error("Error fetching admin stats:", error);
				return null;
			}
		}
	);

	useEffect(() => {
		if (data) {
			setStats(data);
		}
	}, [data]);

	// Mock data for demo
	const mockStats = {
		totalUsers: 1250,
		activeAgents: 45,
		pendingAgentApplications: 12,
		totalProducts: 2840,
		pendingProducts: 156,
		totalOrders: 8420,
		activeOrders: 234,
		platformRevenue: 245000,
		monthlyGrowth: 8.2,
		recentActivity: [
			{
				type: "agent_application",
				title: "New Agent Application",
				description: "Rahman Trading Co. applied to become an agent",
				time: "2 hours ago",
				color: "blue",
			},
			{
				type: "product_approval",
				title: "Product Approved",
				description: "Premium Basmati Rice approved by Agent Dhaka-01",
				time: "4 hours ago",
				color: "green",
			},
			{
				type: "user_registration",
				title: "New User Registration",
				description: "5 new users registered today",
				time: "6 hours ago",
				color: "primary",
			},
		],
	};

	const displayStats = data || mockStats;

	const platformStats = [
		{
			title: "Total Users",
			value: displayStats.totalUsers?.toLocaleString() || "1,250",
			icon: <FaUsers className="h-6 w-6 text-primary-600" />,
			color: "primary",
			trend: { positive: true, value: "+12% this month" },
			link: "/dashboard/manage-users",
		},
		{
			title: "Active Agents",
			value: displayStats.activeAgents || "45",
			icon: <FaUserCheck className="h-6 w-6 text-secondary-600" />,
			color: "secondary",
			trend: { positive: true, value: "+3 this week" },
			link: "/dashboard/manage-agents",
		},
		{
			title: "Total Products",
			value: displayStats.totalProducts?.toLocaleString() || "2,840",
			icon: <FaBoxOpen className="h-6 w-6 text-green-600" />,
			color: "green",
			trend: { positive: true, value: "+156 this week" },
			link: "/dashboard/manage-products",
		},
		{
			title: "Platform Revenue",
			value: `৳${displayStats.platformRevenue?.toLocaleString() || "2,45,000"}`,
			icon: <FaMoneyBillWave className="h-6 w-6 text-accent-600" />,
			color: "accent",
			trend: { positive: true, value: "+8.2% this month" },
		},
	];

	const pendingItems = [
		{
			title: "Agent Applications",
			count: displayStats.pendingAgentApplications || 12,
			icon: <FaUserCheck className="h-5 w-5 text-blue-600" />,
			link: "/dashboard/manage-agents",
			urgent: displayStats.pendingAgentApplications > 10,
		},
		{
			title: "Product Approvals",
			count: displayStats.pendingProducts || 156,
			icon: <FaBoxOpen className="h-5 w-5 text-orange-600" />,
			link: "/dashboard/manage-products",
			urgent: displayStats.pendingProducts > 100,
		},
		{
			title: "Active Orders",
			count: displayStats.activeOrders || 234,
			icon: <FaShoppingCart className="h-5 w-5 text-green-600" />,
			link: "/dashboard/manage-orders",
		},
	];

	if (isLoading) {
		return (
			<div className="">
				<DashboardTitle title="Admin Dashboard" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="">
			<DashboardTitle title="System Settings" />

			{/* Welcome Message */}
			<div className="mt-2 mb-6">
				<p className="text-gray-700">
					Welcome back,{" "}
					<span className="font-medium">
						{currentUser?.FirebaseUser?.displayName}
					</span>
					! Here's your platform overview.
				</p>
			</div>

			{/* Platform Statistics */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{platformStats.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			{/* Pending Items & Quick Actions */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Pending Items */}
				<div className="bg-white shadow-sm rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Items Requiring Attention
					</h2>
					<div className="space-y-4">
						{pendingItems.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center">
									<div className="flex-shrink-0">{item.icon}</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">
											{item.title}
										</p>
										<p className="text-xs text-gray-500">
											{item.count} pending
										</p>
									</div>
									{item.urgent && (
										<FaExclamationTriangle className="ml-2 h-4 w-4 text-red-500" />
									)}
								</div>
								<Link to={item.link} className="btn btn-outline-primary btn-sm">
									Review
								</Link>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white shadow-sm rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Quick Actions
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<Link
							to="/dashboard/manage-agents"
							className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<FaUserCheck className="h-8 w-8 text-secondary-600 mb-2" />
							<h3 className="font-medium text-gray-900 text-sm">
								Manage Agents
							</h3>
							<p className="text-xs text-gray-500">Review applications</p>
						</Link>

						<Link
							to="/dashboard/manage-users"
							className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<FaUsers className="h-8 w-8 text-primary-600 mb-2" />
							<h3 className="font-medium text-gray-900 text-sm">
								Manage Users
							</h3>
							<p className="text-xs text-gray-500">View all users</p>
						</Link>

						<Link
							to="/dashboard/manage-products"
							className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<FaBoxOpen className="h-8 w-8 text-green-600 mb-2" />
							<h3 className="font-medium text-gray-900 text-sm">
								All Products
							</h3>
							<p className="text-xs text-gray-500">Monitor listings</p>
						</Link>

						<Link
							to="/dashboard/analytics"
							className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<FaChartLine className="h-8 w-8 text-accent-600 mb-2" />
							<h3 className="font-medium text-gray-900 text-sm">Analytics</h3>
							<p className="text-xs text-gray-500">View reports</p>
						</Link>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="mt-8 bg-white shadow-sm rounded-lg">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-lg font-medium text-gray-900">
						Recent Platform Activity
					</h2>
				</div>
				<div className="divide-y divide-gray-200">
					{displayStats.recentActivity?.length > 0 ? (
						displayStats.recentActivity.map((activity, index) => (
							<div key={index} className="p-6 hover:bg-gray-50">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div
											className={`p-2 rounded-full bg-${activity.color}-100`}
										>
											{activity.type === "agent_application" && (
												<FaUserCheck
													className={`h-5 w-5 text-${activity.color}-600`}
												/>
											)}
											{activity.type === "product_approval" && (
												<FaBoxOpen
													className={`h-5 w-5 text-${activity.color}-600`}
												/>
											)}
											{activity.type === "user_registration" && (
												<FaUsers
													className={`h-5 w-5 text-${activity.color}-600`}
												/>
											)}
										</div>
									</div>
									<div className="ml-4 flex-1">
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
					) : (
						<div className="p-6 text-center text-gray-500">
							No recent activity found
						</div>
					)}
				</div>
			</div>

			{/* System Health */}
			<div className="mt-8 bg-white shadow-sm rounded-lg p-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					System Health
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="text-center">
						<div className="flex items-center justify-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
							<span className="text-sm font-medium text-gray-900">
								API Status
							</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							All systems operational
						</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center">
							<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
							<span className="text-sm font-medium text-gray-900">
								Database
							</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">Response time: 45ms</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center">
							<div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
							<span className="text-sm font-medium text-gray-900">Storage</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">78% capacity used</p>
					</div>
				</div>
			</div>
		</div>
	);
}
