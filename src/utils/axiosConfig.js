import axios from "axios";

// Configure axios to include credentials in all requests
axios.defaults.withCredentials = true;

// Add default headers for CORS
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Intercept responses to handle token refresh or auth errors
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle error cases like 401 Unauthorized
		if (error.response && error.response.status === 401) {
			// Could handle token refresh here
			console.log("Authentication error occurred");
		}
		return Promise.reject(error);
	}
);

export default axios;
