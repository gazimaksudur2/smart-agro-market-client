import axios from "axios";

export function getQuickSuggestions(context = "general") {
	// Suggestions vary slightly based on context
	const base = [
		{ label: "How to browse products", intent: "products" },
		{ label: "Create an account", intent: "register" },
		{ label: "Seller application", intent: "seller-application" },
		{ label: "Agent application", intent: "agent-application" },
		{ label: "View my cart", intent: "cart" },
		{ label: "Checkout help", intent: "checkout" },
		{ label: "Contact support", intent: "contact" },
		{ label: "Privacy & terms", intent: "legal" },
	];
	return base;
}

export function routeForIntent(intent) {
	switch (intent) {
		case "home":
			return "/";
		case "products":
			return "/products";
		case "product-details":
			return "/product/1"; // demo
		case "cart":
			return "/cart";
		case "checkout":
			return "/checkout";
		case "register":
			return "/register";
		case "login":
			return "/login";
		case "seller-application":
			return "/seller-application";
		case "agent-application":
			return "/agent-application";
		case "help":
			return "/help";
		case "contact":
			return "/contact";
		case "legal":
			return "/terms";
		default:
			return "/";
	}
}

/**
 * Calls the SmartAgro FAQ answering endpoint
 * @param {string} message
 * @returns {Promise<{text: string}>}
 */
export async function askWebsiteFaq(message) {
	const url =
		"https://cmfwhobq0z11po3wtod9iv3xd.agent.a.smyth.ai/api/answerWebsiteFaq";
	try {
		const { data } = await axios.post(url, { messagerequest: message });
		const replyRaw = data?.result?.Reply || "";
		return { text: String(replyRaw || "Sorry, I couldn't find an answer.") };
	} catch (error) {
		// Network or server error fallback
		const fallback =
			"Sorry, I'm having trouble reaching the assistant right now. Please try again in a moment.";
		return { text: fallback };
	}
}
