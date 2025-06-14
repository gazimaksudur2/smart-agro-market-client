import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import useCart from "../../hooks/useCart";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();
	const { totalItems } = useCart();

	// Handle user logout
	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Failed to log out", error);
		}
	};

	// Get dashboard route based on user role
	const getDashboardRoute = () => {
		if (!currentUser) return "/dashboard";

		return "/dashboard/profile";
	};

	return (
		<nav className="bg-white shadow-md">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						{/* Logo */}
						<Link to="/" className="flex-shrink-0 flex items-center">
							<span className="text-2xl font-display font-bold text-primary-600">
								SmartAgro
							</span>
							<span className="ml-1 text-2xl font-display font-bold text-gray-700">
								Connect
							</span>
						</Link>

						{/* Desktop Nav Links */}
						<div className="hidden md:ml-6 md:flex md:space-x-6">
							<NavLink
								to="/"
								className={({ isActive }) =>
									`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										isActive
											? "border-primary-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`
								}
							>
								Home
							</NavLink>
							<NavLink
								to="/products"
								className={({ isActive }) =>
									`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										isActive
											? "border-primary-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`
								}
							>
								Products
							</NavLink>
							<NavLink
								to="/about"
								className={({ isActive }) =>
									`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										isActive
											? "border-primary-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`
								}
							>
								About
							</NavLink>
							<NavLink
								to="/help"
								className={({ isActive }) =>
									`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										isActive
											? "border-primary-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`
								}
							>
								Help
							</NavLink>
							<NavLink
								to="/contact"
								className={({ isActive }) =>
									`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										isActive
											? "border-primary-500 text-gray-900"
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
									}`
								}
							>
								Contact
							</NavLink>
						</div>
					</div>

					{/* Right side menu (desktop) */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						{/* Shopping Cart */}
						<Link
							to={currentUser ? "/dashboard/my-cart" : "/cart"}
							className="relative p-1 text-gray-700 hover:text-primary-600"
						>
							<FaShoppingCart className="h-6 w-6" />
							{totalItems > 0 && (
								<span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary-600 text-white rounded-full h-5 w-5 text-xs">
									{totalItems}
								</span>
							)}
						</Link>

						{currentUser ? (
							<div className="flex items-center">
								{/* Dashboard Button */}
								<Link
									to={getDashboardRoute()}
									className="btn btn-outline py-1.5"
								>
									Dashboard
								</Link>

								{/* Profile Menu */}
								<div className="relative ml-3">
									<div className="flex items-center">
										<button
											onClick={handleLogout}
											className="ml-2 flex items-center text-gray-700 hover:text-primary-600"
										>
											<IoLogOutOutline className="w-5 h-5 mr-1" />
											<span>Logout</span>
										</button>
									</div>
								</div>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<Link to="/login" className="btn btn-outline py-1.5">
									Login
								</Link>
								<Link to="/register" className="btn btn-primary py-1.5">
									Register
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center md:hidden">
						{/* Mobile Shopping Cart */}
						<Link
							to={currentUser ? "/dashboard/my-cart" : "/cart"}
							className="relative p-1 mr-2 text-gray-700 hover:text-primary-600"
						>
							<FaShoppingCart className="h-6 w-6" />
							{totalItems > 0 && (
								<span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary-600 text-white rounded-full h-5 w-5 text-xs">
									{totalItems}
								</span>
							)}
						</Link>

						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
						>
							<span className="sr-only">Open main menu</span>
							{isOpen ? (
								<FiX className="block h-6 w-6" aria-hidden="true" />
							) : (
								<FiMenu className="block h-6 w-6" aria-hidden="true" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden">
					<div className="pt-2 pb-3 space-y-1">
						<NavLink
							to="/"
							className={({ isActive }) =>
								`block pl-3 pr-4 py-2 text-base font-medium ${
									isActive
										? "text-primary-700 bg-primary-50 border-r-4 border-primary-500"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								}`
							}
						>
							Home
						</NavLink>
						<NavLink
							to="/products"
							className={({ isActive }) =>
								`block pl-3 pr-4 py-2 text-base font-medium ${
									isActive
										? "text-primary-700 bg-primary-50 border-r-4 border-primary-500"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								}`
							}
						>
							Products
						</NavLink>
						<NavLink
							to="/about"
							className={({ isActive }) =>
								`block pl-3 pr-4 py-2 text-base font-medium ${
									isActive
										? "text-primary-700 bg-primary-50 border-r-4 border-primary-500"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								}`
							}
						>
							About
						</NavLink>
						<NavLink
							to="/help"
							className={({ isActive }) =>
								`block pl-3 pr-4 py-2 text-base font-medium ${
									isActive
										? "text-primary-700 bg-primary-50 border-r-4 border-primary-500"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								}`
							}
						>
							Help
						</NavLink>
						<NavLink
							to="/contact"
							className={({ isActive }) =>
								`block pl-3 pr-4 py-2 text-base font-medium ${
									isActive
										? "text-primary-700 bg-primary-50 border-r-4 border-primary-500"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								}`
							}
						>
							Contact
						</NavLink>
					</div>

					{/* Mobile user menu */}
					<div className="pt-4 pb-3 border-t border-gray-200">
						{currentUser ? (
							<div className="space-y-1">
								<Link
									to={getDashboardRoute()}
									className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								>
									Dashboard
								</Link>
								<button
									onClick={handleLogout}
									className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="space-y-1">
								<Link
									to="/login"
									className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								>
									Login
								</Link>
								<Link
									to="/register"
									className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
								>
									Register
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
