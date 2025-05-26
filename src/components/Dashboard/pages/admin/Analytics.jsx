import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaChartLine,
	FaChartBar,
	FaChartPie,
	FaUsers,
	FaBoxOpen,
	FaMoneyBillWave,
	FaTruck,
	FaCalendarAlt,
	FaDownload,
	FaFilter,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

const MetricCard = ({ title, value, change, changeType, icon, color }) => (
	<div className="bg-white overflow-hidden shadow rounded-lg">
		<div className="p-5">
			<div className="flex items-center">
				<div className="flex-shrink-0">
					<div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
				</div>
				<div className="ml-5 w-0 flex-1">
					<dl>
						<dt className="text-sm font-medium text-gray-500 truncate">
							{title}
						</dt>
						<dd className="text-lg font-medium text-gray-900">{value}</dd>
						{change && (
							<dd
								className={`text-sm ${
									changeType === "positive" ? "text-green-600" : "text-red-600"
								}`}
							>
								{changeType === "positive" ? "↗" : "↘"} {change}
							</dd>
						)}
					</dl>
				</div>
			</div>
		</div>
	</div>
);

export default function Analytics() {
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [timeRange, setTimeRange] = useState("30d");
	const [selectedMetric, setSelectedMetric] = useState("revenue");

	// Fetch analytics data
	const {
		data: analytics,
		isLoading,
		error,
	} = useQuery(["analytics", timeRange], async () => {
		try {
			return await apiCall(`/admin/analytics?range=${timeRange}`);
		} catch (error) {
			console.error("Error fetching analytics:", error);
			return null;
		}
	});

	// Mock data for demo
	const mockAnalytics = {
		overview: {
			totalRevenue: 2450000,
			revenueChange: "+12.5%",
			totalUsers: 12500,
			usersChange: "+8.3%",
			totalOrders: 8420,
			ordersChange: "+15.2%",
			totalProducts: 2840,
			productsChange: "+22.1%",
		},
		userGrowth: [
			{ month: "Jan", users: 1200, agents: 35, sellers: 180 },
			{ month: "Feb", users: 1450, agents: 38, sellers: 210 },
			{ month: "Mar", users: 1680, agents: 42, sellers: 245 },
			{ month: "Apr", users: 1920, agents: 45, sellers: 280 },
			{ month: "May", users: 2150, agents: 48, sellers: 315 },
			{ month: "Jun", users: 2380, agents: 52, sellers: 350 },
		],
		revenueData: [
			{ month: "Jan", revenue: 180000, commission: 18000 },
			{ month: "Feb", revenue: 220000, commission: 22000 },
			{ month: "Mar", revenue: 280000, commission: 28000 },
			{ month: "Apr", revenue: 320000, commission: 32000 },
			{ month: "May", revenue: 380000, commission: 38000 },
			{ month: "Jun", revenue: 450000, commission: 45000 },
		],
		categoryDistribution: [
			{ category: "Vegetables", percentage: 35, value: 980 },
			{ category: "Grains", percentage: 25, value: 710 },
			{ category: "Fruits", percentage: 20, value: 568 },
			{ category: "Dairy", percentage: 12, value: 341 },
			{ category: "Others", percentage: 8, value: 227 },
		],
		regionPerformance: [
			{ region: "Dhaka", orders: 3200, revenue: 980000, growth: "+18%" },
			{ region: "Chittagong", orders: 2100, revenue: 650000, growth: "+12%" },
			{ region: "Rajshahi", orders: 1500, revenue: 420000, growth: "+8%" },
			{ region: "Khulna", orders: 980, revenue: 280000, growth: "+15%" },
			{ region: "Sylhet", orders: 640, revenue: 120000, growth: "+5%" },
		],
		topSellers: [
			{ name: "Green Valley Farms", revenue: 85000, orders: 245, rating: 4.8 },
			{ name: "Sunrise Organic", revenue: 72000, orders: 198, rating: 4.7 },
			{ name: "Golden Harvest", revenue: 68000, orders: 186, rating: 4.6 },
			{ name: "Fresh Fields", revenue: 54000, orders: 142, rating: 4.5 },
			{ name: "Nature's Best", revenue: 48000, orders: 128, rating: 4.4 },
		],
	};

	const displayAnalytics = analytics || mockAnalytics;

	const timeRanges = [
		{ value: "7d", label: "Last 7 Days" },
		{ value: "30d", label: "Last 30 Days" },
		{ value: "90d", label: "Last 3 Months" },
		{ value: "1y", label: "Last Year" },
	];

	const exportData = () => {
		// Mock export functionality
		alert("Analytics data exported successfully!");
	};

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Analytics & Reports" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Analytics & Reports" />

			{/* Controls */}
			<div className="mt-6 flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaCalendarAlt className="inline mr-1" />
							Time Range
						</label>
						<select
							value={timeRange}
							onChange={(e) => setTimeRange(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							{timeRanges.map((range) => (
								<option key={range.value} value={range.value}>
									{range.label}
								</option>
							))}
						</select>
					</div>
				</div>
				<button onClick={exportData} className="btn btn-outline-primary">
					<FaDownload className="mr-2 h-4 w-4" />
					Export Report
				</button>
			</div>

			{/* Overview Metrics */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Revenue"
					value={`৳${displayAnalytics.overview.totalRevenue.toLocaleString()}`}
					change={displayAnalytics.overview.revenueChange}
					changeType="positive"
					icon={<FaMoneyBillWave className="h-6 w-6 text-green-600" />}
					color="green"
				/>
				<MetricCard
					title="Total Users"
					value={displayAnalytics.overview.totalUsers.toLocaleString()}
					change={displayAnalytics.overview.usersChange}
					changeType="positive"
					icon={<FaUsers className="h-6 w-6 text-blue-600" />}
					color="blue"
				/>
				<MetricCard
					title="Total Orders"
					value={displayAnalytics.overview.totalOrders.toLocaleString()}
					change={displayAnalytics.overview.ordersChange}
					changeType="positive"
					icon={<FaTruck className="h-6 w-6 text-purple-600" />}
					color="purple"
				/>
				<MetricCard
					title="Total Products"
					value={displayAnalytics.overview.totalProducts.toLocaleString()}
					change={displayAnalytics.overview.productsChange}
					changeType="positive"
					icon={<FaBoxOpen className="h-6 w-6 text-orange-600" />}
					color="orange"
				/>
			</div>

			{/* Charts Section */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* User Growth Chart */}
				<div className="bg-white shadow rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-gray-900">
							<FaChartLine className="inline mr-2" />
							User Growth Trends
						</h3>
					</div>
					<div className="h-64 flex items-center justify-center bg-gray-50 rounded">
						<div className="text-center text-gray-500">
							<FaChartLine className="mx-auto h-12 w-12 mb-2" />
							<p>User Growth Chart</p>
							<p className="text-sm">
								Interactive chart would be displayed here
							</p>
						</div>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-4 text-sm">
						<div className="text-center">
							<p className="font-medium text-gray-900">Total Users</p>
							<p className="text-blue-600">2,380</p>
						</div>
						<div className="text-center">
							<p className="font-medium text-gray-900">Agents</p>
							<p className="text-green-600">52</p>
						</div>
						<div className="text-center">
							<p className="font-medium text-gray-900">Sellers</p>
							<p className="text-purple-600">350</p>
						</div>
					</div>
				</div>

				{/* Revenue Chart */}
				<div className="bg-white shadow rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-gray-900">
							<FaChartBar className="inline mr-2" />
							Revenue Analytics
						</h3>
					</div>
					<div className="h-64 flex items-center justify-center bg-gray-50 rounded">
						<div className="text-center text-gray-500">
							<FaChartBar className="mx-auto h-12 w-12 mb-2" />
							<p>Revenue Chart</p>
							<p className="text-sm">
								Interactive chart would be displayed here
							</p>
						</div>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
						<div className="text-center">
							<p className="font-medium text-gray-900">Monthly Revenue</p>
							<p className="text-green-600">৳4,50,000</p>
						</div>
						<div className="text-center">
							<p className="font-medium text-gray-900">Commission</p>
							<p className="text-blue-600">৳45,000</p>
						</div>
					</div>
				</div>
			</div>

			{/* Category Distribution & Regional Performance */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Category Distribution */}
				<div className="bg-white shadow rounded-lg p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						<FaChartPie className="inline mr-2" />
						Product Category Distribution
					</h3>
					<div className="space-y-3">
						{displayAnalytics.categoryDistribution.map((category, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center">
									<div
										className={`w-4 h-4 rounded mr-3 bg-${
											["blue", "green", "yellow", "purple", "red"][index]
										}-500`}
									></div>
									<span className="text-sm font-medium text-gray-900">
										{category.category}
									</span>
								</div>
								<div className="text-right">
									<span className="text-sm font-medium text-gray-900">
										{category.percentage}%
									</span>
									<p className="text-xs text-gray-500">
										{category.value} products
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Regional Performance */}
				<div className="bg-white shadow rounded-lg p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Regional Performance
					</h3>
					<div className="space-y-4">
						{displayAnalytics.regionPerformance.map((region, index) => (
							<div
								key={index}
								className="border-b border-gray-200 pb-3 last:border-b-0"
							>
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium text-gray-900">
											{region.region}
										</h4>
										<p className="text-sm text-gray-500">
											{region.orders} orders • ৳
											{region.revenue.toLocaleString()}
										</p>
									</div>
									<span className="text-sm font-medium text-green-600">
										{region.growth}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Top Performers */}
			<div className="mt-8 bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Top Performing Sellers
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Seller
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Revenue
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Orders
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Rating
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{displayAnalytics.topSellers.map((seller, index) => (
								<tr key={index} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-8 w-8">
												<div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
													<span className="text-sm font-medium text-primary-600">
														{seller.name.charAt(0)}
													</span>
												</div>
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-900">
													{seller.name}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										৳{seller.revenue.toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{seller.orders}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<span className="text-sm text-gray-900 mr-1">
												{seller.rating}
											</span>
											<div className="flex text-yellow-400">
												{[...Array(5)].map((_, i) => (
													<svg
														key={i}
														className={`h-4 w-4 ${
															i < Math.floor(seller.rating)
																? "text-yellow-400"
																: "text-gray-300"
														}`}
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
												))}
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Key Insights */}
			<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 className="text-lg font-medium text-blue-900 mb-4">Key Insights</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
					<div>
						<h4 className="font-medium mb-2">Growth Highlights</h4>
						<ul className="space-y-1">
							<li>• User registration increased by 8.3% this month</li>
							<li>• Revenue growth of 12.5% compared to last period</li>
							<li>• 22.1% increase in product listings</li>
						</ul>
					</div>
					<div>
						<h4 className="font-medium mb-2">Recommendations</h4>
						<ul className="space-y-1">
							<li>• Focus on expanding in Sylhet region (lowest growth)</li>
							<li>• Promote dairy category to increase diversity</li>
							<li>• Implement seller incentive programs</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
