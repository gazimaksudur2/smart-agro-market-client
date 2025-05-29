/**
 * Essential cookie utility functions for authentication
 */

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
