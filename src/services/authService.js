import axios from "axios";
import { setCookie, removeCookie, getCookie } from "../utils/cookieUtils";

const JWT_TOKEN_KEY = "jwt_token";
const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

/**
 * Auth service to centralize JWT token handling
 */
const authService = {
	/**
	 * Get JWT token from server
	 */
	getToken: async (user) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/jwt/token`,
				{
					uid: user.uid,
					email: user.email,
					role: user.role || "consumer",
				},
				{ withCredentials: true }
			);

			if (response.data.token) {
				return response.data.token;
			}
			return null;
		} catch (error) {
			console.error("Error retrieving JWT token:", error);
			throw error;
		}
	},

	/**
	 * Store token in both cookie and localStorage
	 */
	storeToken: (token) => {
		if (!token) return false;

		// Always set in localStorage as backup
		localStorage.setItem(JWT_TOKEN_KEY, token);

		// Set token in axios headers
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

		return true;
	},

	/**
	 * Clear token from storage and headers
	 */
	clearToken: async () => {
		try {
			// Clear from server
			await axios.post(
				`${API_BASE_URL}/jwt/clear`,
				{},
				{ withCredentials: true }
			);
		} catch (error) {
			console.error("Error clearing server token:", error);
		}

		// Clear localStorage
		localStorage.removeItem(JWT_TOKEN_KEY);

		// Clear cookie
		removeCookie("jwt");

		// Clear from axios headers
		delete axios.defaults.headers.common["Authorization"];

		return true;
	},

	/**
	 * Check if token exists
	 */
	hasToken: () => {
		return getCookie("jwt") || localStorage.getItem(JWT_TOKEN_KEY);
	},

	/**
	 * Initialize token from localStorage if cookie not set
	 */
	initializeToken: () => {
		// If we don't have a cookie but have localStorage token
		if (!getCookie("jwt") && localStorage.getItem(JWT_TOKEN_KEY)) {
			const token = localStorage.getItem(JWT_TOKEN_KEY);
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		}
	},
};

export default authService;
