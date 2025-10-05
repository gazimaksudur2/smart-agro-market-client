import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

// Use consistent token key across the application
const JWT_TOKEN_KEY = "JWT_TOKEN_KEY";

// Create axios instance for user operations
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(JWT_TOKEN_KEY);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.code === "ECONNREFUSED") {
			throw new Error(
				"Backend server is not running. Please start the server."
			);
		}

		if (error.response) {
			const { status, data } = error.response;
			switch (status) {
				case 401:
					throw new Error("Authentication required. Please login again.");
				case 404:
					throw new Error("User not found.");
				case 400:
					throw new Error(data?.message || "Invalid request data.");
				default:
					throw new Error(data?.message || `Server error: ${status}`);
			}
		}

		throw new Error(error.message || "Network error occurred");
	}
);

/**
 * Update user profile including shipping address
 * @param {string} email - User email
 * @param {Object} updateData - Profile data to update
 * @param {boolean} updateShippingAddress - Whether to update default shipping address
 */
export const updateUserProfile = async (
	email,
	updateData,
	updateShippingAddress = false
) => {
	try {
		const endpoint = updateShippingAddress ? `/api/users/me` : `/api/users/me`;

		const response = await api.patch(endpoint, updateData);
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Update only the default shipping address
 * @param {string} email - User email
 * @param {Object} shippingAddress - Shipping address data
 */
export const updateDefaultShippingAddress = async (email, shippingAddress) => {
	try {
		const response = await api.patch(`/api/users/me`, {
			shippingAddress,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

/**
 * Get user profile data
 * @param {string} email - User email
 */
export const getUserProfile = async (email) => {
	try {
		const response = await api.get(`/api/users/me`);
		return response.data;
	} catch (error) {
		throw error;
	}
};
