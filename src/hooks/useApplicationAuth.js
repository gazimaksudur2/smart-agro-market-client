import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function useApplicationAuth() {
	const { currentUser, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (!loading && !currentUser) {
			// Store the intended destination
			const intendedPath = location.pathname;
			localStorage.setItem("redirectAfterLogin", intendedPath);

			// Redirect to login
			navigate("/login");
		}
	}, [currentUser, loading, navigate, location.pathname]);

	return { currentUser, loading, isAuthenticated: !!currentUser };
}
