import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {
	FaDollarSign,
	FaShoppingCart,
	FaUsers,
	FaChartBar,
	FaSpinner,
	FaExclamationCircle,
	FaBoxOpen,
	FaListAlt,
} from "react-icons/fa";

// Mock API call - replace with your actual API endpoint
const fetchSalesData = async () => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	// Mocked data (replace with actual API response structure)
	return {
		summary: {
			totalRevenue: 125500.75,
			totalSales: 780,
			newCustomers: 120,
			averageSaleValue: 160.9,
		},
		salesTrend: [
			{ month: "Jan", sales: 40000 },
			{ month: "Feb", sales: 30000 },
			{ month: "Mar", sales: 50000 },
			{ month: "Apr", sales: 45000 },
			{ month: "May", sales: 60000 },
			{ month: "Jun", sales: 55000 },
		],
		productCategories: [
			{ name: "Electronics", value: 400 },
			{ name: "Clothing", value: 300 },
			{ name: "Groceries", value: 200 },
			{ name: "Home Goods", value: 100 },
		],
		recentSales: [
			{
				id: "S001",
				customer: "Alice Smith",
				date: "2024-07-20",
				amount: 250.0,
				status: "Completed",
			},
			{
				id: "S002",
				customer: "Bob Johnson",
				date: "2024-07-19",
				amount: 120.5,
				status: "Processing",
			},
			{
				id: "S003",
				customer: "Carol White",
				date: "2024-07-19",
				amount: 80.75,
				status: "Completed",
			},
			{
				id: "S004",
				customer: "David Brown",
				date: "2024-07-18",
				amount: 300.0,
				status: "Shipped",
			},
			{
				id: "S005",
				customer: "Eve Davis",
				date: "2024-07-17",
				amount: 150.25,
				status: "Completed",
			},
		],
	};
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const SalesAnalytics = () => {
	const { data, isLoading, error } = useQuery("salesAnalytics", fetchSalesData);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<FaSpinner className="animate-spin text-primary-500 text-4xl" />
				<p className="ml-3 text-lg">Loading sales data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center h-screen text-red-500">
				<FaExclamationCircle className="text-4xl mb-3" />
				<p className="text-lg">Error loading sales data: {error.message}</p>
				<p>Please try again later or contact support.</p>
			</div>
		);
	}

	const { summary, salesTrend, productCategories, recentSales } = data;

	const SummaryCard = ({ title, value, icon, bgColor, textColor, unit }) => (
		<div
			className={`shadow-lg rounded-xl p-6 ${bgColor} text-white transform hover:scale-105 transition-transform duration-300`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className={`text-sm font-medium ${textColor} opacity-80`}>
						{title}
					</p>
					<p className="text-3xl font-bold">
						{unit === "currency" && "৳"}
						{value.toLocaleString(undefined, {
							minimumFractionDigits: unit === "currency" ? 2 : 0,
							maximumFractionDigits: unit === "currency" ? 2 : 0,
						})}
					</p>
				</div>
				<div className={`p-3 rounded-full ${textColor} bg-white bg-opacity-20`}>
					{icon}
				</div>
			</div>
		</div>
	);

	return (
		<div className="p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
					<p className="text-gray-600">Overview of your sales performance.</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
				<SummaryCard
					title="Total Revenue"
					value={summary.totalRevenue}
					icon={<FaDollarSign className="h-6 w-6" />}
					bgColor="bg-gradient-to-br from-green-500 to-green-600"
					textColor="text-green-100"
					unit="currency"
				/>
				<SummaryCard
					title="Total Sales"
					value={summary.totalSales}
					icon={<FaShoppingCart className="h-6 w-6" />}
					bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
					textColor="text-blue-100"
				/>
				<SummaryCard
					title="New Customers"
					value={summary.newCustomers}
					icon={<FaUsers className="h-6 w-6" />}
					bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
					textColor="text-purple-100"
				/>
				<SummaryCard
					title="Avg. Sale Value"
					value={summary.averageSaleValue}
					icon={<FaChartBar className="h-6 w-6" />}
					bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
					textColor="text-yellow-100"
					unit="currency"
				/>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				{/* Sales Trend Chart */}
				<div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
						<FaChartBar className="mr-2 text-primary-500" /> Sales Trend
					</h2>
					<p className="text-sm text-gray-500 mb-6">
						Monthly sales performance.
					</p>
					<ResponsiveContainer width="100%" height={350}>
						<BarChart
							data={salesTrend}
							margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
							<XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
							<YAxis
								tickFormatter={(value) => `৳${value / 1000}k`}
								tick={{ fill: "#6b7280" }}
							/>
							<Tooltip
								formatter={(value) => [`৳${value.toLocaleString()}`, "Sales"]}
								cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
							/>
							<Legend />
							<Bar
								dataKey="sales"
								fill="#4CAF50"
								barSize={30}
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Product Categories Pie Chart */}
				<div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
					<h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
						<FaBoxOpen className="mr-2 text-primary-500" /> Product Categories
					</h2>
					<p className="text-sm text-gray-500 mb-6">
						Distribution of sales by category.
					</p>
					<ResponsiveContainer width="100%" height={350}>
						<PieChart>
							<Pie
								data={productCategories}
								cx="50%"
								cy="50%"
								labelLine={false}
								outerRadius={120}
								fill="#8884d8"
								dataKey="value"
								label={({ name, percent }) =>
									`${name} ${(percent * 100).toFixed(0)}%`
								}
							>
								{productCategories.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip formatter={(value, name) => [value, name]} />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Recent Sales Table */}
			<div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
				<h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
					<FaListAlt className="mr-2 text-primary-500" /> Recent Sales
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					A list of the latest transactions.
				</p>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Order ID
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Amount
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{recentSales.map((sale) => (
								<tr
									key={sale.id}
									className="hover:bg-gray-50 transition-colors"
								>
									<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
										{sale.id}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
										{sale.customer}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
										{sale.date}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
										৳{sale.amount.toFixed(2)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												sale.status === "Completed"
													? "bg-green-100 text-green-800"
													: sale.status === "Processing"
													? "bg-yellow-100 text-yellow-800"
													: sale.status === "Shipped"
													? "bg-blue-100 text-blue-800"
													: "bg-red-100 text-red-800" // For "Cancelled" or other statuses
											}`}
										>
											{sale.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default SalesAnalytics;
