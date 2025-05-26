import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
	FaExclamationTriangle,
	FaInfoCircle,
	FaTimes,
} from "react-icons/fa";
import useAPI from "../../../hooks/useAPI";
import DashboardTitle from "../DashboardTitle";

// Dashboard statistics card
const StatCard = ({ title, value, icon, color, onClick }) => (
	<div
		className={`bg-white rounded-lg shadow p-5 transition-all duration-200 ${
			onClick ? "cursor-pointer hover:shadow-md hover:scale-105" : ""
		}`}
		onClick={onClick}
	>
		<div className="flex justify-between items-center">
			<div>
				<p className="text-sm font-medium text-gray-500">{title}</p>
				<p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
			</div>
			<div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
		</div>
	</div>
);

// Alert component for showing messages
const Alert = ({ type, message, onClose }) => {
	const alertStyles = {
		error: "bg-red-50 border-red-200 text-red-800",
		warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
		info: "bg-blue-50 border-blue-200 text-blue-800",
		success: "bg-green-50 border-green-200 text-green-800",
	};

	const iconMap = {
		error: <FaExclamationTriangle className="h-5 w-5" />,
		warning: <FaExclamationTriangle className="h-5 w-5" />,
		info: <FaInfoCircle className="h-5 w-5" />,
		success: <FaInfoCircle className="h-5 w-5" />,
	};

	return (
		<div className={`border rounded-lg p-4 mb-6 ${alertStyles[type]}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					{iconMap[type]}
					<span className="ml-2 text-sm font-medium">{message}</span>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<FaTimes className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
};

export default function DashboardHome() {
	const { currentUser, isAdmin, isAgent, isSeller, isConsumer } = useAuth();
	const userRole = currentUser?.DBUser?.role || "consumer";
	const navigate = useNavigate();
	const location = useLocation();
	const [stats, setStats] = useState({});
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertType, setAlertType] = useState("info");
	const { apiCall, loading: apiLoading } = useAPI();

	// Check for error messages from navigation state
	useEffect(() => {
		if (location.state?.error) {
			setAlertMessage(location.state.error);
			setAlertType("warning");
			setShowAlert(true);

			// Clear the state to prevent showing the message again
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	// Auto-redirect based on user role for better UX
	useEffect(() => {
		if (currentUser && userRole) {
			// Only redirect if this is the exact dashboard root path
			if (location.pathname === "/dashboard") {
				let redirectPath = null;

				if (isAdmin()) {
					redirectPath = "/dashboard/admin";
				} else if (isAgent()) {
					redirectPath = "/dashboard/agent";
				} else if (isSeller()) {
					redirectPath = "/dashboard/my-products";
				} else if (isConsumer()) {
					redirectPath = "/dashboard/my-orders";
				}

				if (redirectPath) {
					navigate(redirectPath, { replace: true });
				}
			}
		}
	}, [
		currentUser,
		userRole,
		location.pathname,
		navigate,
		isAdmin,
		isAgent,
		isSeller,
		isConsumer,
	]);

	// Fetch dashboard stats based on user role
	const { data, isLoading, error } = useQuery(
		["dashboardStats", userRole],
		async () => {
			if (!currentUser) return null;

			try {
				return await apiCall("/dashboard/stats");
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
				return null;
			}
		},
		{
			enabled: !!currentUser,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	useEffect(() => {
		if (data) {
			setStats(data);
		}
	}, [data]);

	// Get role-specific title and subtitle
	const getDashboardInfo = () => {
		switch (userRole) {
			case "admin":
				return {
					title: "Admin Dashboard",
					subtitle: "Manage platform operations and monitor system performance",
				};
			case "agent":
				return {
					title: "Agent Dashboard",
					subtitle:
						"Manage regional operations, verify sellers, and coordinate deliveries",
				};
			case "seller":
				return {
					title: "Seller Dashboard",
					subtitle:
						"Manage your products, track orders, and analyze sales performance",
				};
			case "consumer":
				return {
					title: "Consumer Dashboard",
					subtitle: "Track your orders, manage cart, and discover new products",
				};
			default:
				return {
					title: "Dashboard",
					subtitle: "Welcome to SmartAgroConnect",
				};
		}
	};

	// Placeholder stats for frontend demo
	const placeholderStats = {
		products: 24,
		orders: 12,
		revenue: "৳ 54,500",
		growth: "8.2%",
	};

	// Role-specific stats configuration with navigation
	const getStatsConfig = () => {
		switch (userRole) {
			case "admin":
				return [
					{
						title: "Total Users",
						value: stats?.totalUsers || 1250,
						icon: <FaUsers className="h-6 w-6 text-primary-600" />,
						color: "primary",
						onClick: () => navigate("/dashboard/manage-users"),
					},
					{
						title: "Active Agents",
						value: stats?.activeAgents || 45,
						icon: <FaUserCheck className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
						onClick: () => navigate("/dashboard/manage-agents"),
					},
					{
						title: "Total Products",
						value: stats?.totalProducts || 2840,
						icon: <FaBoxOpen className="h-6 w-6 text-green-600" />,
						color: "green",
						onClick: () => navigate("/dashboard/analytics"),
					},
					{
						title: "Platform Revenue",
						value: stats?.platformRevenue || "৳ 2,45,000",
						icon: <FaMoneyBillWave className="h-6 w-6 text-accent-600" />,
						color: "accent",
						onClick: () => navigate("/dashboard/analytics"),
					},
				];

			case "agent":
				return [
					{
						title: "Verified Sellers",
						value: stats?.verifiedSellers || 28,
						icon: <FaUserCheck className="h-6 w-6 text-primary-600" />,
						color: "primary",
						onClick: () => navigate("/dashboard/verify-sellers"),
					},
					{
						title: "Pending Products",
						value: stats?.pendingProducts || 12,
						icon: <FaBoxOpen className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
						onClick: () => navigate("/dashboard/verify-products"),
					},
					{
						title: "Active Deliveries",
						value: stats?.activeDeliveries || 18,
						icon: <FaTruck className="h-6 w-6 text-green-600" />,
						color: "green",
						onClick: () => navigate("/dashboard/manage-deliveries"),
					},
					{
						title: "Warehouse Stock",
						value: stats?.warehouseStock || "85%",
						icon: <FaWarehouse className="h-6 w-6 text-accent-600" />,
						color: "accent",
						onClick: () => navigate("/dashboard/warehouse-management"),
					},
				];

			case "seller":
				return [
					{
						title: "Total Products",
						value: stats?.productCount || placeholderStats.products,
						icon: <FaBoxOpen className="h-6 w-6 text-primary-600" />,
						color: "primary",
						onClick: () => navigate("/dashboard/my-products"),
					},
					{
						title: "Pending Orders",
						value: stats?.pendingOrderCount || 5,
						icon: <FaShoppingCart className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
						onClick: () => navigate("/dashboard/requested-orders"),
					},
					{
						title: "Total Sales",
						value: stats?.totalSales || placeholderStats.revenue,
						icon: <FaMoneyBillWave className="h-6 w-6 text-green-600" />,
						color: "green",
						onClick: () => navigate("/dashboard/sales-analytics"),
					},
					{
						title: "Growth",
						value: stats?.growth || placeholderStats.growth,
						icon: <FaChartLine className="h-6 w-6 text-accent-600" />,
						color: "accent",
						onClick: () => navigate("/dashboard/sales-analytics"),
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
						onClick: () => navigate("/dashboard/my-orders"),
					},
					{
						title: "Active Orders",
						value: stats?.activeOrderCount || 3,
						icon: <FaTruck className="h-6 w-6 text-secondary-600" />,
						color: "secondary",
						onClick: () => navigate("/dashboard/my-orders"),
					},
					{
						title: "Total Spent",
						value: stats?.totalSpent || "৳ 28,750",
						icon: <FaMoneyBillWave className="h-6 w-6 text-green-600" />,
						color: "green",
						onClick: () => navigate("/dashboard/my-purchases"),
					},
					{
						title: "Cart Items",
						value: stats?.cartItemsCount || 4,
						icon: <FaShoppingCart className="h-6 w-6 text-accent-600" />,
						color: "accent",
						onClick: () => navigate("/dashboard/my-cart"),
					},
				];
		}
	};

	// Get role-specific quick actions
	const getQuickActions = () => {
		switch (userRole) {
			case "admin":
				return [
					{
						title: "Manage Users",
						description: "View and manage platform users",
						icon: <FaUsers className="h-8 w-8 text-primary-600 mb-2" />,
						onClick: () => navigate("/dashboard/manage-users"),
					},
					{
						title: "Platform Analytics",
						description: "View comprehensive platform statistics",
						icon: <FaChartLine className="h-8 w-8 text-secondary-600 mb-2" />,
						onClick: () => navigate("/dashboard/analytics"),
					},
					{
						title: "Manage Agents",
						description: "Approve and manage regional agents",
						icon: <FaUserCheck className="h-8 w-8 text-green-600 mb-2" />,
						onClick: () => navigate("/dashboard/manage-agents"),
					},
				];

			case "agent":
				return [
					{
						title: "Verify Sellers",
						description: "Review and approve seller applications",
						icon: <FaUserCheck className="h-8 w-8 text-primary-600 mb-2" />,
						onClick: () => navigate("/dashboard/verify-sellers"),
					},
					{
						title: "Manage Deliveries",
						description: "Coordinate and track deliveries",
						icon: <FaTruck className="h-8 w-8 text-secondary-600 mb-2" />,
						onClick: () => navigate("/dashboard/manage-deliveries"),
					},
					{
						title: "Warehouse Management",
						description: "Manage inventory and warehouse operations",
						icon: <FaWarehouse className="h-8 w-8 text-green-600 mb-2" />,
						onClick: () => navigate("/dashboard/warehouse-management"),
					},
				];

			case "seller":
				return [
					{
						title: "Add New Product",
						description: "List a new product for sale",
						icon: <FaBoxOpen className="h-8 w-8 text-primary-600 mb-2" />,
						onClick: () => navigate("/dashboard/add-product"),
					},
					{
						title: "View Orders",
						description: "Check and manage incoming orders",
						icon: (
							<FaClipboardList className="h-8 w-8 text-secondary-600 mb-2" />
						),
						onClick: () => navigate("/dashboard/requested-orders"),
					},
					{
						title: "My Products",
						description: "Manage your product listings",
						icon: <FaBoxOpen className="h-8 w-8 text-green-600 mb-2" />,
						onClick: () => navigate("/dashboard/my-products"),
					},
				];

			case "consumer":
			default:
				return [
					{
						title: "Browse Products",
						description: "Discover fresh agricultural products",
						icon: <FaShoppingCart className="h-8 w-8 text-primary-600 mb-2" />,
						onClick: () => navigate("/products"),
					},
					{
						title: "My Orders",
						description: "Track your order status",
						icon: (
							<FaClipboardList className="h-8 w-8 text-secondary-600 mb-2" />
						),
						onClick: () => navigate("/dashboard/my-orders"),
					},
					{
						title: "My Cart",
						description: "Review items in your cart",
						icon: <FaShoppingCart className="h-8 w-8 text-green-600 mb-2" />,
						onClick: () => navigate("/dashboard/my-cart"),
					},
				];
		}
	};

	const dashboardInfo = getDashboardInfo();
	const statsConfig = getStatsConfig();
	const quickActions = getQuickActions();

	if (isLoading || apiLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<DashboardTitle
				title={dashboardInfo.title}
				subtitle={dashboardInfo.subtitle}
			/>

			{/* Alert for unauthorized access attempts */}
			{showAlert && (
				<Alert
					type={alertType}
					message={alertMessage}
					onClose={() => setShowAlert(false)}
				/>
			)}

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsConfig.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{quickActions.map((action, index) => (
						<button
							key={index}
							onClick={action.onClick}
							className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-primary-300"
						>
							{action.icon}
							<h3 className="font-medium text-gray-900">{action.title}</h3>
							<p className="text-sm text-gray-500">{action.description}</p>
						</button>
					))}
				</div>
			</div>

			{/* Welcome Message for New Users */}
			{!stats || Object.keys(stats).length === 0 ? (
				<div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
					<div className="flex items-center">
						<FaInfoCircle className="h-6 w-6 text-primary-600 mr-3" />
						<div>
							<h3 className="text-lg font-medium text-primary-900">
								Welcome to SmartAgroConnect!
							</h3>
							<p className="text-primary-700 mt-1">
								{userRole === "seller" &&
									"Start by adding your first product to begin selling."}
								{userRole === "consumer" &&
									"Explore our marketplace to find fresh agricultural products."}
								{userRole === "agent" &&
									"Begin by verifying sellers and managing your regional operations."}
								{userRole === "admin" &&
									"Monitor platform performance and manage system operations."}
							</p>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
