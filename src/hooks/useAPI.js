import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook for making API calls with automatic handling of authentication
 * Works with both cookie-based auth and token-based auth (fallback)
 */
export const useAPI = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { usingCookies, accessToken, logout } = useAuth();

	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	const apiCall = useCallback(
		async (endpoint, method = "GET", data = null, customHeaders = {}) => {
			setLoading(true);
			setError(null);

			try {
				// Prepare headers
				const headers = {
					...customHeaders,
					"Content-Type": "application/json",
				};

				// If we're not using cookies, add the token as Authorization header
				if (!usingCookies && accessToken) {
					headers["Authorization"] = `Bearer ${accessToken}`;
				} else if (!usingCookies) {
					// Try to get token from localStorage as fallback
					const localToken = localStorage.getItem("jwt_token");
					if (localToken) {
						headers["Authorization"] = `Bearer ${localToken}`;
					}
				}

				// Make the API call
				const config = {
					method,
					url: `${apiBaseUrl}${endpoint}`,
					headers,
					withCredentials: true, // Always include credentials for CORS
				};

				// Add data if provided
				if (data) {
					config.data = data;
				}

				const response = await axios(config);
				setLoading(false);
				return response.data;
			} catch (err) {
				setLoading(false);

				// Handle authentication errors
				const status = err.response?.status;

				if (status === 401 || status === 403) {
					// Unauthorized - token might be expired
					// Logout the user
					console.error("Authentication error:", err);
					logout();
				}

				setError(
					err.response?.data?.message || err.message || "An error occurred"
				);
				throw err;
			}
		},
		[usingCookies, accessToken, logout]
	);

	return {
		apiCall,
		loading,
		error,
	};
};

export default useAPI;
