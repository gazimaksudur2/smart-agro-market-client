import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import {
	getAvatarUrl,
	getNextFallbackUrl,
	DEFAULT_AVATAR_DATA_URL,
} from "../../utils/avatarUtils";

/**
 * Avatar component with robust fallback handling
 * @param {Object} props - Component props
 * @param {string} props.src - The primary image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS classes for styling
 * @param {string} props.userName - User name for generating initials fallback
 * @param {string} props.size - Size preset (sm, md, lg, xl)
 * @param {boolean} props.showIcon - Whether to show icon fallback instead of initials
 */
export default function Avatar({
	src,
	alt = "Avatar",
	className = "",
	userName = "User",
	size = "md",
	showIcon = false,
	...props
}) {
	const [currentSrc, setCurrentSrc] = useState(src);
	const [hasError, setHasError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	// Size presets
	const sizeClasses = {
		sm: "h-6 w-6",
		md: "h-8 w-8",
		lg: "h-12 w-12",
		xl: "h-16 w-16",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-6 w-6",
		xl: "h-8 w-8",
	};

	// Reset error state when src changes
	useEffect(() => {
		if (src !== currentSrc) {
			setCurrentSrc(src);
			setHasError(false);
			setRetryCount(0);
		}
	}, [src, currentSrc]);

	// Handle image load error
	const handleImageError = () => {
		if (retryCount < 3) {
			// Try next fallback URL
			const nextUrl = getNextFallbackUrl(currentSrc);
			setCurrentSrc(nextUrl);
			setRetryCount((prev) => prev + 1);
		} else {
			// Final fallback - show icon or initials
			setHasError(true);
		}
	};

	// Get initial avatar URL with fallback
	const avatarUrl = getAvatarUrl(currentSrc, userName);

	// If we've exhausted all image options or want to show icon
	if (hasError || showIcon) {
		return (
			<div
				className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center ${className}`}
				{...props}
			>
				<FaUser className={`${iconSizes[size]} text-gray-600`} />
			</div>
		);
	}

	// Show image with error handling
	return (
		<img
			className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
			src={avatarUrl}
			alt={alt}
			onError={handleImageError}
			loading="lazy"
			{...props}
		/>
	);
}

/**
 * Avatar with initials fallback
 */
export function AvatarWithInitials({
	src,
	userName = "User",
	className = "",
	size = "md",
	...props
}) {
	const [hasError, setHasError] = useState(false);

	const sizeClasses = {
		sm: "h-6 w-6 text-xs",
		md: "h-8 w-8 text-sm",
		lg: "h-12 w-12 text-lg",
		xl: "h-16 w-16 text-xl",
	};

	// Get initials from name
	const getInitials = (name) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.substring(0, 2)
			.toUpperCase();
	};

	const handleImageError = () => {
		setHasError(true);
	};

	// Reset error when src changes
	useEffect(() => {
		setHasError(false);
	}, [src]);

	if (hasError || !src) {
		return (
			<div
				className={`${sizeClasses[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium ${className}`}
				{...props}
			>
				{getInitials(userName)}
			</div>
		);
	}

	return (
		<img
			className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
			src={src}
			alt={`${userName}'s avatar`}
			onError={handleImageError}
			loading="lazy"
			{...props}
		/>
	);
}
