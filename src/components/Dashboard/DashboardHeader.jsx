import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaBell } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { AvatarWithInitials } from "../UI/Avatar";

export default function DashboardHeader({ setSidebarOpen }) {
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();

	// Handle user logout
	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Failed to log out", error);
		}
	};

	return (
		<header className="flex-shrink-0 relative h-16 bg-white shadow">
			<div className="flex items-center justify-between h-full px-4 sm:px-6">
				{/* Left side - Mobile menu button */}
				<div className="flex items-center">
					<button
						type="button"
						className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
						onClick={() => setSidebarOpen(true)}
					>
						<span className="sr-only">Open sidebar</span>
						<FaBars className="block h-6 w-6" aria-hidden="true" />
					</button>

					{/* Page title - could be dynamic based on current route */}
					<h1 className="text-lg font-medium text-gray-900 ml-2 lg:ml-0">
						Dashboard
					</h1>
				</div>

				{/* Right side - User menu and notifications */}
				<div className="ml-auto flex items-center space-x-4">
					{/* Notifications dropdown */}
					<div className="relative">
						<button
							type="button"
							className="p-1 text-gray-500 rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
							onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
						>
							<span className="sr-only">View notifications</span>
							<FaBell className="h-6 w-6" />
							{/* Notification badge */}
							<span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
						</button>

						{/* Notification dropdown menu */}
						{notificationMenuOpen && (
							<div
								className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="notification-menu"
							>
								<div className="py-1" role="none">
									<div className="px-4 py-2 border-b border-gray-100">
										<p className="text-sm font-medium text-gray-900">
											Notifications
										</p>
									</div>

									{/* Notification items - could be mapped from a notifications array */}
									<div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
										<div className="flex items-start">
											<div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
												<span className="text-primary-600">🔔</span>
											</div>
											<div className="ml-3 w-0 flex-1">
												<p className="text-sm font-medium text-gray-900">
													New order received
												</p>
												<p className="mt-1 text-sm text-gray-500">
													Order #1234 has been placed
												</p>
												<p className="mt-1 text-xs text-gray-400">
													3 minutes ago
												</p>
											</div>
										</div>
									</div>

									<div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
										<div className="flex items-start">
											<div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
												<span className="text-green-600">✓</span>
											</div>
											<div className="ml-3 w-0 flex-1">
												<p className="text-sm font-medium text-gray-900">
													Product approved
												</p>
												<p className="mt-1 text-sm text-gray-500">
													Your product "Premium Rice" has been approved
												</p>
												<p className="mt-1 text-xs text-gray-400">1 hour ago</p>
											</div>
										</div>
									</div>

									<div className="px-4 py-2 text-center border-t border-gray-100">
										<Link
											to="/dashboard/notifications"
											className="text-sm font-medium text-primary-600 hover:text-primary-500"
										>
											View all notifications
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Profile dropdown */}
					<div className="relative">
						<button
							type="button"
							className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
							id="user-menu"
							aria-expanded="false"
							aria-haspopup="true"
							onClick={() => setUserMenuOpen(!userMenuOpen)}
						>
							<span className="sr-only">Open user menu</span>
							<AvatarWithInitials
								src={currentUser?.FirebaseUser?.photoURL}
								userName={currentUser?.FirebaseUser?.displayName || "User"}
								size="md"
							/>
							<span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
								{currentUser?.FirebaseUser?.displayName || "User"}
							</span>
						</button>

						{/* Profile dropdown menu */}
						{userMenuOpen && (
							<div
								className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="user-menu"
							>
								<div className="py-1" role="none">
									<Link
										to="/dashboard/profile"
										className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										role="menuitem"
										onClick={() => setUserMenuOpen(false)}
									>
										Your Profile
									</Link>
									<Link
										to="/dashboard/settings"
										className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										role="menuitem"
										onClick={() => setUserMenuOpen(false)}
									>
										Settings
									</Link>
									<button
										onClick={() => {
											setUserMenuOpen(false);
											handleLogout();
										}}
										className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										role="menuitem"
									>
										Sign out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
