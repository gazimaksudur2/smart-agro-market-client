import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * RoleBasedRoute component for protecting routes based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect unauthorized users (default: "/dashboard")
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
export default function RoleBasedRoute({
	children,
	allowedRoles = [],
	redirectTo = "/dashboard/profile",
	requireAuth = true,
}) {
	const { currentUser, loading, isAdmin, isAgent, isSeller, isConsumer } =
		useAuth();
	const location = useLocation();

	// Show loading spinner while authentication state is being determined
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to login if authentication is required but user is not authenticated
	if (requireAuth && !currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// If no role restrictions, allow access for authenticated users
	if (allowedRoles.length === 0) {
		return children;
	}

	// Get current user role
	const userRole = currentUser?.DBUser?.role;

	// Check if user has required role
	const hasRequiredRole = allowedRoles.includes(userRole);

	// Role-based helper functions for more complex role checking
	const roleCheckers = {
		admin: isAdmin,
		agent: isAgent,
		seller: isSeller,
		consumer: isConsumer,
	};

	// Additional role validation using helper functions
	const hasValidRole = allowedRoles.some((role) => {
		const checker = roleCheckers[role];
		return checker && checker();
	});

	// If user doesn't have required role, redirect with appropriate message
	if (!hasRequiredRole && !hasValidRole) {
		// Store the attempted route for potential future access
		const attemptedRoute = location.pathname;

		// Redirect to appropriate dashboard based on user role
		let redirectPath = redirectTo;
		if (userRole) {
			redirectPath = `/dashboard/profile`;
		}


		return (
			<Navigate
				to={redirectPath}
				state={{
					from: location,
					error: "You don't have permission to access this page.",
					attemptedRoute,
				}}
				replace
			/>
		);
	}

	// User has required role, render children
	return children;
}

// Convenience components for specific roles
export const AdminRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["admin"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

export const AgentRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["agent"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

export const SellerRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["seller"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

export const ConsumerRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["consumer"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

// Multi-role route components
export const AgentOrAdminRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["agent", "admin"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

export const SellerOrAgentRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["seller", "agent"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);

export const ConsumerOrSellerRoute = ({ children, redirectTo }) => (
	<RoleBasedRoute allowedRoles={["consumer", "seller"]} redirectTo={redirectTo}>
		{children}
	</RoleBasedRoute>
);
