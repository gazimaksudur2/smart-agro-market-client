import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	FaUserCheck,
	FaBoxOpen,
	FaTruck,
	FaWarehouse,
	FaClipboardList,
	FaMoneyBillWave,
	FaClock,
	FaCheckCircle,
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

export default function AgentDashboard() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [stats, setStats] = useState({});

	// Fetch agent dashboard stats
	const { data, isLoading, error } = useQuery(
		["agentDashboardStats", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return null;
			try {
				return await apiCall(
					`/agent/dashboard-stats/${currentUser.FirebaseUser.uid}`
				);
			} catch (error) {
				console.error("Error fetching agent stats:", error);
				return null;
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	useEffect(() => {
		if (data) {
			setStats(data);
		}
	}, [data]);

	// Mock data for demo
	const mockStats = {
		verifiedSellers: 28,
		pendingSellerApplications: 5,
		pendingProducts: 12,
		approvedProducts: 156,
		activeDeliveries: 18,
		completedDeliveries: 234,
		warehouseCapacity: 85,
		monthlyCommission: 12500,
		recentActivity: [
			{
				type: "seller_verification",
				title: "Seller Verified",
				description: "Green Valley Farms has been verified",
				time: "1 hour ago",
				color: "green",
			},
			{
				type: "product_approval",
				title: "Product Approved",
				description: "Organic Tomatoes approved for listing",
				time: "3 hours ago",
				color: "blue",
			},
			{
				type: "delivery_completed",
				title: "Delivery Completed",
				description: "Order #ORD-2024-156 delivered successfully",
				time: "5 hours ago",
				color: "green",
			},
		],
	};

	const displayStats = data || mockStats;

	const agentStats = [
		{
			title: "Verified Sellers",
			value: displayStats.verifiedSellers || "28",
			icon: <FaUserCheck className="h-6 w-6 text-primary-600" />,
			color: "primary",
			trend: { positive: true, value: "+3 this week" },
			link: "/dashboard/verify-sellers",
		},
		{
			title: "Pending Products",
			value: displayStats.pendingProducts || "12",
			icon: <FaBoxOpen className="h-6 w-6 text-secondary-600" />,
			color: "secondary",
			link: "/dashboard/verify-products",
		},
		{
			title: "Active Deliveries",
			value: displayStats.activeDeliveries || "18",
			icon: <FaTruck className="h-6 w-6 text-green-600" />,
			color: "green",
			link: "/dashboard/manage-deliveries",
		},
		{
			title: "Monthly Commission",
			value: `৳${displayStats.monthlyCommission?.toLocaleString() || "12,500"}`,
			icon: <FaMoneyBillWave className="h-6 w-6 text-accent-600" />,
			color: "accent",
			trend: { positive: true, value: "+15% from last month" },
		},
	];

	const pendingTasks = [
		{
			title: "Seller Applications",
			count: displayStats.pendingSellerApplications || 5,
			icon: <FaUserCheck className="h-5 w-5 text-blue-600" />,
			link: "/dashboard/verify-sellers",
			priority: "high",
		},
		{
			title: "Product Approvals",
			count: displayStats.pendingProducts || 12,
			icon: <FaBoxOpen className="h-5 w-5 text-orange-600" />,
			link: "/dashboard/verify-products",
			priority: "medium",
		},
		{
			title: "Delivery Assignments",
			count: displayStats.pendingDeliveries || 8,
			icon: <FaTruck className="h-5 w-5 text-green-600" />,
			link: "/dashboard/manage-deliveries",
			priority: "high",
		},
	];

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Agent Dashboard" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Agent Dashboard" />

			{/* Welcome Message */}
			<div className="mt-2 mb-6">
				<p className="text-gray-700">
					Welcome back,{" "}
					<span className="font-medium">
						{currentUser?.FirebaseUser?.displayName}
					</span>
					! Here's your regional overview.
				</p>
				<p className="text-sm text-gray-500 mt-1">
					Region: {currentUser?.DBUser?.region || "Dhaka"} | Coverage:{" "}
					{currentUser?.DBUser?.coverageAreas || "Dhaka, Gazipur, Narayanganj"}
				</p>
			</div>

			{/* Agent Statistics */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{agentStats.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			{/* Pending Tasks & Warehouse Status */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Pending Tasks */}
				<div className="bg-white shadow-sm rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Pending Tasks
					</h2>
					<div className="space-y-4">
						{pendingTasks.map((task, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center">
									<div className="flex-shrink-0">{task.icon}</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">
											{task.title}
										</p>
										<div className="flex items-center">
											<p className="text-xs text-gray-500">
												{task.count} pending
											</p>
											{task.priority === "high" && (
												<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
													High Priority
												</span>
											)}
										</div>
									</div>
								</div>
								<Link to={task.link} className="btn btn-outline-primary btn-sm">
									Review
								</Link>
							</div>
						))}
					</div>
				</div>

				{/* Warehouse Status */}
				<div className="bg-white shadow-sm rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						<FaWarehouse className="inline mr-2" />
						Warehouse Status
					</h2>
					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Storage Capacity</span>
								<span className="font-medium">
									{displayStats.warehouseCapacity || 85}%
								</span>
							</div>
							<div className="mt-1 w-full bg-gray-200 rounded-full h-2">
								<div
									className={`h-2 rounded-full ${
										(displayStats.warehouseCapacity || 85) > 90
											? "bg-red-600"
											: (displayStats.warehouseCapacity || 85) > 75
											? "bg-yellow-600"
											: "bg-green-600"
									}`}
									style={{ width: `${displayStats.warehouseCapacity || 85}%` }}
								></div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-4">
							<div className="text-center">
								<p className="text-2xl font-bold text-green-600">
									{displayStats.approvedProducts || 156}
								</p>
								<p className="text-xs text-gray-500">Products Stored</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-blue-600">
									{displayStats.completedDeliveries || 234}
								</p>
								<p className="text-xs text-gray-500">Deliveries This Month</p>
							</div>
						</div>

						<div className="pt-4 border-t border-gray-200">
							<Link
								to="/dashboard/manage-warehouse"
								className="btn btn-outline-primary btn-sm w-full"
							>
								Manage Warehouse
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mt-8 bg-white shadow-sm rounded-lg p-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Link
						to="/dashboard/verify-sellers"
						className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<FaUserCheck className="h-8 w-8 text-primary-600 mb-2" />
						<h3 className="font-medium text-gray-900 text-sm">
							Verify Sellers
						</h3>
						<p className="text-xs text-gray-500">Review applications</p>
					</Link>

					<Link
						to="/dashboard/verify-products"
						className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<FaBoxOpen className="h-8 w-8 text-secondary-600 mb-2" />
						<h3 className="font-medium text-gray-900 text-sm">
							Approve Products
						</h3>
						<p className="text-xs text-gray-500">Review listings</p>
					</Link>

					<Link
						to="/dashboard/manage-deliveries"
						className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<FaTruck className="h-8 w-8 text-green-600 mb-2" />
						<h3 className="font-medium text-gray-900 text-sm">
							Manage Deliveries
						</h3>
						<p className="text-xs text-gray-500">Track shipments</p>
					</Link>

					<Link
						to="/dashboard/reports"
						className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<FaClipboardList className="h-8 w-8 text-accent-600 mb-2" />
						<h3 className="font-medium text-gray-900 text-sm">View Reports</h3>
						<p className="text-xs text-gray-500">Analytics & insights</p>
					</Link>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="mt-8 bg-white shadow-sm rounded-lg">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
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
											{activity.type === "seller_verification" && (
												<FaUserCheck
													className={`h-5 w-5 text-${activity.color}-600`}
												/>
											)}
											{activity.type === "product_approval" && (
												<FaBoxOpen
													className={`h-5 w-5 text-${activity.color}-600`}
												/>
											)}
											{activity.type === "delivery_completed" && (
												<FaTruck
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

			{/* Performance Metrics */}
			<div className="mt-8 bg-white shadow-sm rounded-lg p-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Performance Metrics
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<FaCheckCircle className="h-5 w-5 text-green-500 mr-1" />
							<span className="text-sm font-medium text-gray-900">
								Approval Rate
							</span>
						</div>
						<p className="text-2xl font-bold text-green-600">94%</p>
						<p className="text-xs text-gray-500">Products approved</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<FaClock className="h-5 w-5 text-blue-500 mr-1" />
							<span className="text-sm font-medium text-gray-900">
								Avg. Response
							</span>
						</div>
						<p className="text-2xl font-bold text-blue-600">2.3h</p>
						<p className="text-xs text-gray-500">Response time</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<FaTruck className="h-5 w-5 text-purple-500 mr-1" />
							<span className="text-sm font-medium text-gray-900">
								Delivery Success
							</span>
						</div>
						<p className="text-2xl font-bold text-purple-600">98%</p>
						<p className="text-xs text-gray-500">On-time delivery</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<FaMoneyBillWave className="h-5 w-5 text-green-500 mr-1" />
							<span className="text-sm font-medium text-gray-900">
								Commission
							</span>
						</div>
						<p className="text-2xl font-bold text-green-600">
							৳{(displayStats.monthlyCommission || 12500).toLocaleString()}
						</p>
						<p className="text-xs text-gray-500">This month</p>
					</div>
				</div>
			</div>
		</div>
	);
}
