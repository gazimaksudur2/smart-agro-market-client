/**
 * Avatar utility functions for consistent fallback handling
 */

// Default avatar as a data URL (base64 encoded SVG)
export const DEFAULT_AVATAR_DATA_URL = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#e5e7eb"/>
  <circle cx="50" cy="35" r="15" fill="#9ca3af"/>
  <path d="M20 80 Q20 65 35 65 L65 65 Q80 65 80 80 L80 100 L20 100 Z" fill="#9ca3af"/>
</svg>
`)}`;

// Alternative reliable fallback URLs
export const FALLBACK_AVATAR_URLS = [
	"https://ui-avatars.com/api/?name=User&background=e5e7eb&color=6b7280&size=200",
	"https://via.placeholder.com/200x200/e5e7eb/6b7280?text=User",
	DEFAULT_AVATAR_DATA_URL,
];

/**
 * Get a reliable avatar URL with fallback handling
 * @param {string} userPhotoURL - The user's photo URL
 * @param {string} userName - The user's name for generating initials
 * @returns {string} A reliable avatar URL
 */
export const getAvatarUrl = (userPhotoURL, userName = "User") => {
	// If user has a photo URL, return it (error handling should be done in component)
	if (userPhotoURL && userPhotoURL.trim()) {
		return userPhotoURL;
	}

	// Generate initials-based avatar
	const initials = userName
		.split(" ")
		.map((name) => name.charAt(0))
		.join("")
		.substring(0, 2)
		.toUpperCase();

	return `https://ui-avatars.com/api/?name=${encodeURIComponent(
		initials
	)}&background=e5e7eb&color=6b7280&size=200`;
};

/**
 * Get the next fallback URL when an image fails to load
 * @param {string} currentUrl - The current URL that failed
 * @returns {string} The next fallback URL
 */
export const getNextFallbackUrl = (currentUrl) => {
	const currentIndex = FALLBACK_AVATAR_URLS.indexOf(currentUrl);
	const nextIndex = currentIndex + 1;

	if (nextIndex < FALLBACK_AVATAR_URLS.length) {
		return FALLBACK_AVATAR_URLS[nextIndex];
	}

	// Return the data URL as the final fallback
	return DEFAULT_AVATAR_DATA_URL;
};

/**
 * Check if a URL is a fallback URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a fallback URL
 */
export const isFallbackUrl = (url) => {
	return FALLBACK_AVATAR_URLS.some((fallbackUrl) =>
		url.includes(fallbackUrl.split("?")[0])
	);
};
