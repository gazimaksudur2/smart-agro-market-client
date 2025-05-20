import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook for making API calls with automatic handling of authentication
 */
export const useAPI = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { logout } = useAuth();

	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	const apiCall = useCallback(
		async (endpoint, method = "GET", data = null, customHeaders = {}) => {
			setLoading(true);
			setError(null);

			try {
				// Prepare config
				const config = {
					method,
					url: `${apiBaseUrl}${endpoint}`,
					headers: customHeaders,
					withCredentials: true, // Always include credentials
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
					console.error("Authentication error:", err.response?.data);
					logout();
				}

				setError(
					err.response?.data?.message || err.message || "An error occurred"
				);
				throw err;
			}
		},
		[logout]
	);

	return {
		apiCall,
		loading,
		error,
	};
};

export default useAPI;
