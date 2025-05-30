import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	FaHome,
	FaUser,
	FaShoppingCart,
	FaClipboardList,
	FaBoxOpen,
	FaPlus,
	FaWarehouse,
	FaUsers,
	FaUserCheck,
	FaTruck,
	FaCog,
	FaChartBar,
	FaFileInvoice,
	FaStore,
	FaHeart,
	FaCubes,
	FaReceipt,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { AvatarWithInitials } from "../UI/Avatar";

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
	const { currentUser, currentRole } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const closeSidebar = () => {
		setSidebarOpen(false);
	};

	const isActive = (path) => {
		// Handle exact match for dashboard home route
		if (path === "/dashboard") {
			return (
				location.pathname === "/dashboard" ||
				location.pathname === "/dashboard/"
			);
		}
		return location.pathname === path;
	};

	// Mobile backdrop
	const mobileBackdrop = sidebarOpen && (
		<div
			className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
			onClick={closeSidebar}
		/>
	);

	// Common links for all users
	const commonLinks = [
		{
			to: "/dashboard/profile",
			icon: <FaUser className="mr-3 h-6 w-6" />,
			label: "Profile",
		},
	];

	// Role-specific links with comprehensive navigation
	const roleLinks = {
		admin: [
			{
				to: "/dashboard/analytics",
				icon: <FaChartBar className="mr-3 h-6 w-6" />,
				label: "Platform Analytics",
			},
			{
				to: "/dashboard/manage-products",
				icon: <FaCubes className="mr-3 h-6 w-6" />,
				label: "Manage Products",
			},
			{
				to: "/dashboard/manage-orders",
				icon: <FaReceipt className="mr-3 h-6 w-6" />,
				label: "Manage Orders",
			},
			{
				to: "/dashboard/manage-users",
				icon: <FaUsers className="mr-3 h-6 w-6" />,
				label: "Manage Users",
			},
			{
				to: "/dashboard/manage-applications",
				icon: <FaUserCheck className="mr-3 h-6 w-6" />,
				label: "Manage Applications",
			},
			{
				to: "/dashboard/system-settings",
				icon: <FaCog className="mr-3 h-6 w-6" />,
				label: "System Settings",
			},
		],
		agent: [
			{
				to: "/dashboard/agent",
				icon: <FaHome className="mr-3 h-6 w-6" />,
				label: "Agent Home",
			},
			{
				to: "/dashboard/verify-sellers",
				icon: <FaUserCheck className="mr-3 h-6 w-6" />,
				label: "Verify Sellers",
			},
			{
				to: "/dashboard/verify-products",
				icon: <FaBoxOpen className="mr-3 h-6 w-6" />,
				label: "Verify Products",
			},
			{
				to: "/dashboard/manage-deliveries",
				icon: <FaTruck className="mr-3 h-6 w-6" />,
				label: "Manage Deliveries",
			},
			{
				to: "/dashboard/warehouse-management",
				icon: <FaWarehouse className="mr-3 h-6 w-6" />,
				label: "Warehouse Management",
			},
		],
		seller: [
			{
				to: "/dashboard/my-products",
				icon: <FaBoxOpen className="mr-3 h-6 w-6" />,
				label: "My Products",
			},
			{
				to: "/dashboard/add-product",
				icon: <FaPlus className="mr-3 h-6 w-6" />,
				label: "Add New Product",
			},
			{
				to: "/dashboard/requested-orders",
				icon: <FaFileInvoice className="mr-3 h-6 w-6" />,
				label: "Handle Orders",
			},
			{
				to: "/dashboard/sales-analytics",
				icon: <FaChartBar className="mr-3 h-6 w-6" />,
				label: "Sales Analytics",
			},
		],
		consumer: [
			{
				to: "/dashboard/my-cart",
				icon: <FaShoppingCart className="mr-3 h-6 w-6" />,
				label: "My Cart",
			},
			{
				to: "/dashboard/my-orders",
				icon: <FaClipboardList className="mr-3 h-6 w-6" />,
				label: "My Orders",
			},
			{
				to: "/dashboard/my-purchases",
				icon: <FaStore className="mr-3 h-6 w-6" />,
				label: "Purchase History",
			},
			{
				to: "/dashboard/wishlist",
				icon: <FaHeart className="mr-3 h-6 w-6" />,
				label: "Wishlist",
			},
		],
	};

	// Get links based on user role
	const getNavLinks = () => {
		// Use currentRole directly
		if (!currentRole) {
			return commonLinks;
		}

		return [...commonLinks, ...(roleLinks[currentRole] || [])];
	};

	// Create nav link with proper accessibility
	const NavLink = ({ to, icon, label }) => (
		<Link
			to={to}
			className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
				isActive(to)
					? "bg-primary-100 text-primary-900 border-r-2 border-primary-500"
					: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
			}`}
			onClick={() => setSidebarOpen(false)}
			aria-current={isActive(to) ? "page" : undefined}
		>
			{icon}
			{label}
		</Link>
	);

	return (
		<>
			{/* Mobile backdrop */}
			{mobileBackdrop}

			{/* Sidebar for mobile */}
			<div
				className={`fixed inset-0 flex z-40 lg:hidden transform ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				} transition-transform duration-300 ease-in-out`}
			>
				<div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
					{/* Close button */}
					<div className="absolute top-0 right-0 -mr-12 pt-2">
						<button
							type="button"
							className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							onClick={closeSidebar}
							aria-label="Close sidebar"
						>
							<span className="sr-only">Close sidebar</span>
							<svg
								className="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Mobile sidebar content */}
					<div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
						<div className="flex-shrink-0 flex items-center px-4">
							<Link to="/" className="flex items-center">
								<span className="text-xl font-display font-bold text-primary-600">
									SmartAgro
								</span>
								<span className="ml-1 text-xl font-display font-bold text-gray-700">
									Connect
								</span>
							</Link>
						</div>
						<div className="mt-5 px-2 space-y-1">
							{getNavLinks().map((link, index) => (
								<NavLink key={index} {...link} />
							))}
						</div>
					</div>

					{/* User info for mobile */}
					<Link
						to={"/dashboard/profile"}
						className="flex-shrink-0 flex border-t border-gray-200 p-4"
					>
						<div className="flex items-center w-full">
							<div className="flex-shrink-0">
								<AvatarWithInitials
									src={currentUser?.FirebaseUser?.photoURL}
									userName={currentUser?.FirebaseUser?.displayName || "User"}
									size="lg"
									className="inline-block"
								/>
							</div>
							<div className="ml-3 flex-1 min-w-0">
								<p className="text-base font-medium text-gray-700 truncate">
									{currentUser?.FirebaseUser?.displayName || "User"}
								</p>
								<p className="text-sm font-medium text-gray-500 truncate capitalize">
									{currentRole || "Loading..."}
								</p>
							</div>
						</div>
					</Link>
				</div>

				<div className="flex-shrink-0 w-14" aria-hidden="true">
					{/* Force sidebar to shrink to fit close icon */}
				</div>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:flex lg:flex-shrink-0">
				<div className="flex flex-col w-64 xl:w-72">
					<div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
						<div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
							<Link to="/" className="flex items-center">
								<span className="text-xl font-display font-bold text-primary-600">
									SmartAgro
								</span>
								<span className="ml-1 text-xl font-display font-bold text-gray-700">
									Connect
								</span>
							</Link>
						</div>
						<div className="flex-1 flex flex-col overflow-y-auto pt-4">
							<nav className="flex-1 px-2 pb-4 space-y-1" aria-label="Sidebar">
								{getNavLinks().map((link, index) => (
									<NavLink key={index} {...link} />
								))}
							</nav>
						</div>

						{/* User info for desktop */}
						<div className="flex-shrink-0 flex border-t border-gray-200 p-4">
							<div className="flex items-center w-full">
								<div className="flex-shrink-0">
									<AvatarWithInitials
										src={currentUser?.FirebaseUser?.photoURL}
										userName={currentUser?.FirebaseUser?.displayName || "User"}
										size="md"
										className="inline-block"
									/>
								</div>
								<Link to={"/dashboard/profile"} className="ml-3 flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-700 truncate">
										{currentUser?.FirebaseUser?.displayName || "User"}
									</p>
									<p className="text-xs font-medium text-gray-500 truncate capitalize">
										{currentRole || "Loading..."}
									</p>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
