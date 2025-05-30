/**
 * Essential cookie utility functions for authentication
 */

// Get a cookie by name
export const getCookie = (name) => {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop().split(";").shift();
	}
	return null;
};

// Set a cookie with options
export const setCookie = (name, value, options = {}) => {
	const defaultOptions = {
		path: "/",
		sameSite: "strict",
		secure: window.location.protocol === "https:",
		...options,
	};

	let cookieString = `${name}=${value}`;

	Object.entries(defaultOptions).forEach(([key, val]) => {
		if (val !== undefined && val !== null) {
			cookieString += `; ${key}=${val}`;
		}
	});

	document.cookie = cookieString;
	return true;
};

// Remove a cookie
export const removeCookie = (name) => {
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	return true;
};

// Check if cookies are enabled
export const areCookiesEnabled = () => {
	try {
		document.cookie = "cookietest=1";
		const result = document.cookie.indexOf("cookietest=") !== -1;
		document.cookie = "cookietest=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		return result;
	} catch (e) {
		return false;
	}
};
