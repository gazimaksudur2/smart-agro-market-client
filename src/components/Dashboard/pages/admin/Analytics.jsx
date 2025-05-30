import { useState } from "react";
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
	FaArrowUp,
	FaArrowDown,
	FaExclamationTriangle,
	FaCheckCircle,
} from "react-icons/fa";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	AreaChart,
	Area,
} from "recharts";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

const MetricCard = ({ title, value, change, changeType, icon, color }) => (
	<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300">
		<div className="p-6">
			<div className="flex items-center">
				<div className="flex-shrink-0">
					<div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
				</div>
				<div className="ml-5 w-0 flex-1">
					<dl>
						<dt className="text-sm font-medium text-gray-500 truncate">
							{title}
						</dt>
						<dd className="text-2xl font-bold text-gray-900">{value}</dd>
						{change && (
							<dd
								className={`text-sm flex items-center mt-1 ${
									changeType === "positive" ? "text-green-600" : "text-red-600"
								}`}
							>
								{changeType === "positive" ? (
									<FaArrowUp className="mr-1 h-3 w-3" />
								) : (
									<FaArrowDown className="mr-1 h-3 w-3" />
								)}
								{change}
							</dd>
						)}
					</dl>
				</div>
			</div>
		</div>
	</div>
);

const CustomTooltip = ({ active, payload, label, formatValue }) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
				<p className="font-medium text-gray-900 mb-2">{label}</p>
				{payload.map((entry, index) => (
					<p key={index} className="text-sm" style={{ color: entry.color }}>
						{`${entry.dataKey}: ${
							formatValue ? formatValue(entry.value) : entry.value
						}`}
					</p>
				))}
			</div>
		);
	}
	return null;
};

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
		refetch,
	} = useQuery(["analytics", timeRange], async () => {
		try {
			return await apiCall(`/admin/analytics?range=${timeRange}`);
		} catch (error) {
			console.error("Error fetching analytics:", error);
			return null;
		}
	});

	// Enhanced mock data for development
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
			{ month: "Jan", users: 1200, agents: 35, sellers: 180, consumers: 985 },
			{ month: "Feb", users: 1450, agents: 38, sellers: 210, consumers: 1202 },
			{ month: "Mar", users: 1680, agents: 42, sellers: 245, consumers: 1393 },
			{ month: "Apr", users: 1920, agents: 45, sellers: 280, consumers: 1595 },
			{ month: "May", users: 2150, agents: 48, sellers: 315, consumers: 1787 },
			{ month: "Jun", users: 2380, agents: 52, sellers: 350, consumers: 1978 },
		],
		revenueData: [
			{ month: "Jan", revenue: 180000, commission: 18000, orders: 450 },
			{ month: "Feb", revenue: 220000, commission: 22000, orders: 520 },
			{ month: "Mar", revenue: 280000, commission: 28000, orders: 680 },
			{ month: "Apr", revenue: 320000, commission: 32000, orders: 780 },
			{ month: "May", revenue: 380000, commission: 38000, orders: 890 },
			{ month: "Jun", revenue: 450000, commission: 45000, orders: 1020 },
		],
		categoryDistribution: [
			{ category: "Vegetables", percentage: 35, value: 980, color: "#10b981" },
			{ category: "Grains", percentage: 25, value: 710, color: "#f59e0b" },
			{ category: "Fruits", percentage: 20, value: 568, color: "#ef4444" },
			{ category: "Dairy", percentage: 12, value: 341, color: "#8b5cf6" },
			{ category: "Others", percentage: 8, value: 227, color: "#6b7280" },
		],
		regionPerformance: [
			{
				region: "Dhaka",
				orders: 3200,
				revenue: 980000,
				growth: "+18%",
				sellers: 120,
			},
			{
				region: "Chittagong",
				orders: 2100,
				revenue: 650000,
				growth: "+12%",
				sellers: 85,
			},
			{
				region: "Rajshahi",
				orders: 1500,
				revenue: 420000,
				growth: "+8%",
				sellers: 60,
			},
			{
				region: "Khulna",
				orders: 980,
				revenue: 280000,
				growth: "+15%",
				sellers: 45,
			},
			{
				region: "Sylhet",
				orders: 640,
				revenue: 120000,
				growth: "+5%",
				sellers: 25,
			},
		],
		topSellers: [
			{
				name: "Green Valley Farms",
				revenue: 85000,
				orders: 245,
				rating: 4.8,
				growth: "+25%",
			},
			{
				name: "Sunrise Organic",
				revenue: 72000,
				orders: 198,
				rating: 4.7,
				growth: "+18%",
			},
			{
				name: "Golden Harvest",
				revenue: 68000,
				orders: 186,
				rating: 4.6,
				growth: "+15%",
			},
			{
				name: "Fresh Fields",
				revenue: 54000,
				orders: 142,
				rating: 4.5,
				growth: "+12%",
			},
			{
				name: "Nature's Best",
				revenue: 48000,
				orders: 128,
				rating: 4.4,
				growth: "+8%",
			},
		],
		alerts: [
			{
				type: "warning",
				message: "Low stock alerts for 15 products",
				count: 15,
			},
			{ type: "info", message: "5 new agent applications pending", count: 5 },
			{
				type: "success",
				message: "Revenue target achieved for this month",
				count: 1,
			},
		],
	};

	const displayAnalytics = analytics || mockAnalytics;

	const timeRanges = [
		{ value: "7d", label: "Last 7 Days" },
		{ value: "30d", label: "Last 30 Days" },
		{ value: "90d", label: "Last 3 Months" },
		{ value: "6m", label: "Last 6 Months" },
		{ value: "1y", label: "Last Year" },
	];

	const formatCurrency = (value) => {
		return `৳${value.toLocaleString()}`;
	};

	const exportData = () => {
		// Enhanced export functionality
		const dataToExport = {
			overview: displayAnalytics.overview,
			timeRange,
			exportDate: new Date().toISOString(),
			userGrowth: displayAnalytics.userGrowth,
			revenueData: displayAnalytics.revenueData,
		};

		// Convert to CSV format for download
		const csvContent = Object.entries(dataToExport.overview)
			.map(([key, value]) => `${key},${value}`)
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `analytics-${timeRange}-${
			new Date().toISOString().split("T")[0]
		}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
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

			{/* Alerts Section */}
			{displayAnalytics.alerts && displayAnalytics.alerts.length > 0 && (
				<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
					{displayAnalytics.alerts.map((alert, index) => (
						<div
							key={index}
							className={`p-4 rounded-lg border ${
								alert.type === "warning"
									? "bg-yellow-50 border-yellow-200"
									: alert.type === "info"
									? "bg-blue-50 border-blue-200"
									: "bg-green-50 border-green-200"
							}`}
						>
							<div className="flex items-center">
								{alert.type === "warning" ? (
									<FaExclamationTriangle className="text-yellow-600 mr-2" />
								) : alert.type === "info" ? (
									<FaCalendarAlt className="text-blue-600 mr-2" />
								) : (
									<FaCheckCircle className="text-green-600 mr-2" />
								)}
								<span className="text-sm font-medium">{alert.message}</span>
							</div>
						</div>
					))}
				</div>
			)}

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
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						>
							{timeRanges.map((range) => (
								<option key={range.value} value={range.value}>
									{range.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaFilter className="inline mr-1" />
							Metric Focus
						</label>
						<select
							value={selectedMetric}
							onChange={(e) => setSelectedMetric(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						>
							<option value="revenue">Revenue</option>
							<option value="users">Users</option>
							<option value="orders">Orders</option>
							<option value="products">Products</option>
						</select>
					</div>
				</div>
				<button
					onClick={exportData}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
				>
					<FaDownload className="mr-2 h-4 w-4" />
					Export Report
				</button>
			</div>

			{/* Overview Metrics */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Revenue"
					value={formatCurrency(displayAnalytics.overview.totalRevenue)}
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
				<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							<FaChartLine className="inline mr-2" />
							User Growth Trends
						</h3>
						<div className="text-sm text-gray-500">
							Total:{" "}
							{displayAnalytics.userGrowth[
								displayAnalytics.userGrowth.length - 1
							]?.users.toLocaleString()}
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={displayAnalytics.userGrowth}>
								<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
								<XAxis
									dataKey="month"
									stroke="#6b7280"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="#6b7280"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend />
								<Area
									type="monotone"
									dataKey="consumers"
									stackId="1"
									stroke="#3b82f6"
									fill="#3b82f6"
									fillOpacity={0.6}
									name="Consumers"
								/>
								<Area
									type="monotone"
									dataKey="sellers"
									stackId="1"
									stroke="#10b981"
									fill="#10b981"
									fillOpacity={0.6}
									name="Sellers"
								/>
								<Area
									type="monotone"
									dataKey="agents"
									stackId="1"
									stroke="#8b5cf6"
									fill="#8b5cf6"
									fillOpacity={0.6}
									name="Agents"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Revenue Chart */}
				<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							<FaChartBar className="inline mr-2" />
							Revenue & Orders Analytics
						</h3>
						<div className="text-sm text-gray-500">
							Monthly:{" "}
							{formatCurrency(
								displayAnalytics.revenueData[
									displayAnalytics.revenueData.length - 1
								]?.revenue
							)}
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={displayAnalytics.revenueData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
								<XAxis
									dataKey="month"
									stroke="#6b7280"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									yAxisId="left"
									stroke="#6b7280"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `৳${value / 1000}k`}
								/>
								<YAxis
									yAxisId="right"
									orientation="right"
									stroke="#6b7280"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<Tooltip
									content={<CustomTooltip formatValue={formatCurrency} />}
								/>
								<Legend />
								<Bar
									yAxisId="left"
									dataKey="revenue"
									name="Revenue"
									fill="#10b981"
									radius={[4, 4, 0, 0]}
								/>
								<Line
									yAxisId="right"
									type="monotone"
									dataKey="orders"
									name="Orders"
									stroke="#f59e0b"
									strokeWidth={3}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Category Distribution & Regional Performance */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Category Distribution */}
				<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-medium text-gray-900 mb-6">
						<FaChartPie className="inline mr-2" />
						Product Category Distribution
					</h3>
					<div className="h-64 mb-6">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={displayAnalytics.categoryDistribution}
									cx="50%"
									cy="50%"
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label={({ category, percentage }) =>
										`${category}: ${percentage}%`
									}
								>
									{displayAnalytics.categoryDistribution.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(value, name) => [`${value} products`, name]}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="space-y-2">
						{displayAnalytics.categoryDistribution.map((category, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center">
									<div
										className="w-3 h-3 rounded-full mr-3"
										style={{ backgroundColor: category.color }}
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
				<div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-medium text-gray-900 mb-6">
						Regional Performance Overview
					</h3>
					<div className="space-y-4">
						{displayAnalytics.regionPerformance.map((region, index) => (
							<div
								key={index}
								className="border-l-4 border-primary-500 pl-4 pb-4 border-b border-gray-100 last:border-b-0"
							>
								<div className="flex items-center justify-between mb-2">
									<h4 className="font-medium text-gray-900">{region.region}</h4>
									<span className="text-sm font-medium text-green-600 flex items-center">
										<FaArrowUp className="mr-1 h-3 w-3" />
										{region.growth}
									</span>
								</div>
								<div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
									<div>
										<span className="block font-medium">{region.orders}</span>
										<span>Orders</span>
									</div>
									<div>
										<span className="block font-medium">
											{formatCurrency(region.revenue)}
										</span>
										<span>Revenue</span>
									</div>
									<div>
										<span className="block font-medium">{region.sellers}</span>
										<span>Sellers</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Top Performers */}
			<div className="mt-8 bg-white shadow-lg rounded-xl border border-gray-200">
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
									Rank
								</th>
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
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Growth
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{displayAnalytics.topSellers.map((seller, index) => (
								<tr key={index} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center justify-center">
											<span
												className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
													index === 0
														? "bg-yellow-100 text-yellow-800"
														: index === 1
														? "bg-gray-100 text-gray-800"
														: index === 2
														? "bg-orange-100 text-orange-800"
														: "bg-blue-100 text-blue-800"
												}`}
											>
												#{index + 1}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10">
												<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
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
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{formatCurrency(seller.revenue)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{seller.orders}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<span className="text-sm text-gray-900 mr-2">
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
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
											{seller.growth}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Key Insights */}
			<div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
				<h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
					<FaChartLine className="mr-2" />
					Key Insights & Recommendations
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
					<div>
						<h4 className="font-medium mb-3 flex items-center">
							<FaArrowUp className="mr-2" />
							Growth Highlights
						</h4>
						<ul className="space-y-2">
							<li className="flex items-start">
								<FaCheckCircle className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
								User registration increased by 8.3% this month
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
								Revenue growth of 12.5% compared to last period
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
								22.1% increase in product listings
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-medium mb-3 flex items-center">
							<FaExclamationTriangle className="mr-2" />
							Action Items
						</h4>
						<ul className="space-y-2">
							<li className="flex items-start">
								<FaExclamationTriangle className="mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
								Focus on expanding in Sylhet region (lowest growth)
							</li>
							<li className="flex items-start">
								<FaExclamationTriangle className="mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
								Promote dairy category to increase diversity
							</li>
							<li className="flex items-start">
								<FaExclamationTriangle className="mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
								Implement seller incentive programs for top performers
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
