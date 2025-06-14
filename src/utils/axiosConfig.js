import axios from "axios";

// Configure axios to include credentials in all requests
axios.defaults.withCredentials = true;

// Add default headers
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Use consistent token key
const JWT_TOKEN_KEY = "JWT_TOKEN_KEY";

// Initialize auth token from localStorage if available
const token = localStorage.getItem(JWT_TOKEN_KEY);
if (token) {
	axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Intercept requests to handle authentication
axios.interceptors.request.use(
	(config) => {
		// For API calls to external services, don't send credentials
		if (
			config.url &&
			!config.url.includes(import.meta.env.VITE_SERVER_API_URL)
		) {
			config.withCredentials = false;

			// Don't send auth tokens to external services
			if (config.headers && config.headers.Authorization) {
				delete config.headers.Authorization;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Intercept responses to handle auth errors
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle authentication errors
		if (error.response && error.response.status === 401) {
			console.error("Authentication failed:", error.response.data);
			// Redirect to login if not already there
			if (!window.location.pathname.includes("/login")) {
				console.log("Redirecting to login due to auth error");
			}
		}
		return Promise.reject(error);
	}
);

export default axios;
