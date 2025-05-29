import axios from "axios";
import { removeCookie } from "../utils/cookieUtils";

const JWT_TOKEN_KEY = "jwt_token";
const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

/**
 * Auth service to centralize JWT token handling
 */
const authService = {
	/**
	 * Check if current token is valid by decoding and checking expiration
	 */
	isTokenValid: (token) => {
		if (!token) return false;

		try {
			// Decode JWT payload (simple base64 decode)
			const payload = JSON.parse(atob(token.split(".")[1]));
			const currentTime = Date.now() / 1000;

			// Check if token is expired (with 5 minute buffer)
			return payload.exp && payload.exp > currentTime + 300;
		} catch (error) {
			console.error("Error validating token:", error);
			return false;
		}
	},

	/**
	 * Get current stored token
	 */
	getCurrentToken: () => {
		return localStorage.getItem(JWT_TOKEN_KEY);
	},

	/**
	 * Get JWT token from server (only if needed)
	 */
	getToken: async (user, password = null) => {
		try {
			// Check if we already have a valid token
			const existingToken = authService.getCurrentToken();
			if (existingToken && authService.isTokenValid(existingToken)) {
				console.log("Using existing valid token");
				return existingToken;
			}

			console.log("Fetching new token from server");
			const response = await axios.post(
				`${API_BASE_URL}/users/login`,
				{
					uid: user.uid,
					email: user.email,
					...(password && { password }),
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
	 * Store token in localStorage and set axios headers
	 */
	storeToken: (token) => {
		if (!token) return false;

		// Store in localStorage
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
				`${API_BASE_URL}/users/logout`,
				{},
				{ withCredentials: true }
			);
		} catch (error) {
			console.error("Error clearing server token:", error);
		}

		// Clear localStorage
		localStorage.removeItem(JWT_TOKEN_KEY);

		// Clear cookie (if any exists)
		removeCookie("jwt");

		// Clear from axios headers
		delete axios.defaults.headers.common["Authorization"];

		return true;
	},

	/**
	 * Check if token exists and is valid
	 */
	hasValidToken: () => {
		const token = authService.getCurrentToken();
		return token && authService.isTokenValid(token);
	},

	/**
	 * Initialize token from localStorage on app start
	 */
	initializeToken: () => {
		const token = authService.getCurrentToken();
		if (token && authService.isTokenValid(token)) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			return true;
		} else if (token) {
			// Remove invalid token
			authService.clearToken();
		}
		return false;
	},
};

export default authService;
