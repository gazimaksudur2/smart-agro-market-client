import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function useApplicationAuth() {
	const { currentUser, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const toastShown = useRef(false);

	useEffect(() => {
		if (!loading && !currentUser && !toastShown.current) {
			// Show toast message before redirecting
			toast.error("You need to be an user of our platform first");
			toastShown.current = true;

			// Store the intended destination
			const intendedPath = location.pathname;
			localStorage.setItem("redirectAfterLogin", intendedPath);

			// Redirect to login
			navigate("/login");
		}
	}, [currentUser, loading, navigate, location.pathname]);

	return { currentUser, loading, isAuthenticated: !!currentUser };
}
