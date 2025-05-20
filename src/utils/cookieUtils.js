/**
 * Cookie utility functions optimized for authentication
 */

// Get a cookie by name
export const getCookie = (name) => {
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	if (match) return match[2];
	return null;
};

// Set a cookie with optimal security settings for JWT
export const setCookie = (name, value, options = {}) => {
	const {
		path = "/",
		maxAge = 86400 * 30, // 30 days by default
		secure = window.location.protocol === "https:",
		sameSite = "lax", // 'strict', 'lax', or 'none'
	} = options;

	// For cross-domain cookies with SameSite=None, Secure must be true
	const securePart = secure || sameSite === "none" ? "; Secure" : "";
	const sameSitePart = sameSite ? `; SameSite=${sameSite}` : "";

	document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}${securePart}${sameSitePart}`;

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

// Get all cookies as an object
export const getAllCookies = () => {
	return document.cookie.split("; ").reduce((acc, curr) => {
		const [key, value] = curr.split("=");
		if (key) acc[key] = value;
		return acc;
	}, {});
};
