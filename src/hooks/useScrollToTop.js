import { useEffect, useLayoutEffect } from "react";

/**
 * Custom hook to scroll to top of the page when component mounts
 * Uses both useLayoutEffect and useEffect for maximum compatibility
 * Temporarily disables smooth scrolling to ensure instant scroll works
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export default function useScrollToTop(smooth = true) {
	// useLayoutEffect runs synchronously after all DOM mutations but before paint
	// This ensures we scroll before any visual updates
	useLayoutEffect(() => {
		// Store original scroll behavior
		const originalScrollBehavior =
			document.documentElement.style.scrollBehavior;

		// Temporarily disable smooth scrolling for instant effect
		document.documentElement.style.scrollBehavior = "auto";
		window.scrollTo(0, 0);

		// Restore original scroll behavior after a brief moment
		setTimeout(() => {
			document.documentElement.style.scrollBehavior = originalScrollBehavior;
		}, 10);
	}, []);

	// useEffect as a backup and to handle async rendering scenarios
	useEffect(() => {
		// Store original scroll behavior
		const originalScrollBehavior =
			document.documentElement.style.scrollBehavior;

		// Force instant scroll by temporarily disabling smooth behavior
		document.documentElement.style.scrollBehavior = "auto";
		window.scrollTo(0, 0);

		// Restore smooth behavior if requested
		setTimeout(() => {
			document.documentElement.style.scrollBehavior = smooth
				? "smooth"
				: originalScrollBehavior;
		}, 10);

		// Additional scroll after a brief delay to override any other scroll behavior
		const timeoutId = setTimeout(() => {
			// Ensure we're still at the top
			if (window.scrollY > 0) {
				document.documentElement.style.scrollBehavior = "auto";
				window.scrollTo(0, 0);
				setTimeout(() => {
					document.documentElement.style.scrollBehavior = smooth
						? "smooth"
						: originalScrollBehavior;
				}, 10);
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [smooth]);
}
