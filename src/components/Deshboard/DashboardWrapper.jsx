import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardWrapper({ children, requiredRole = null }) {
	const { currentUser, currentRole } = useAuth();
	const navigate = useNavigate();

	// Handle authentication and role-based access
	useEffect(() => {
		if (!currentUser?.FirebaseUser) {
			navigate("/login", { replace: true });
			return;
		}

		// If we have a confirmed role, check if it matches required role
		if (currentRole) {
			if (requiredRole && currentRole !== requiredRole) {
				// User doesn't have required role, redirect to appropriate dashboard
				navigate("/dashboard", { replace: true });
				return;
			}
		}
	}, [currentUser, currentRole, navigate, requiredRole]);

	// If user is not authenticated, show nothing (redirect is happening)
	if (!currentUser?.FirebaseUser) {
		return null;
	}

	// If user has confirmed role, render the dashboard content
	if (currentRole) {
		return children;
	}

	// Show loading state while waiting for role
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Loading Dashboard
				</h2>
				<p className="text-gray-600">
					Please wait while we set up your dashboard...
				</p>
			</div>
		</div>
	);
}
