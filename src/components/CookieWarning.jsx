import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { areCookiesEnabled } from "../utils/cookieUtils";

const CookieWarning = () => {
	const [showWarning, setShowWarning] = useState(false);
	const { usingCookies } = useAuth();

	useEffect(() => {
		// Only show warning if cookies are disabled and we're in production
		if (!usingCookies && process.env.NODE_ENV === "production") {
			setShowWarning(true);
		}
	}, [usingCookies]);

	if (!showWarning) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4 shadow-lg border-t border-yellow-300 z-50">
			<div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center">
				<div className="mb-3 sm:mb-0">
					<h4 className="font-bold text-yellow-800">Cookie Settings</h4>
					<p className="text-sm text-yellow-700">
						This site requires cookies to function properly. Please enable
						cookies in your browser settings for full functionality.
					</p>
					<p className="text-sm text-yellow-700 mt-1">
						Using fallback authentication mode which may have limited
						functionality.
					</p>
				</div>
				<button
					onClick={() => setShowWarning(false)}
					className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm"
				>
					Understood
				</button>
			</div>
		</div>
	);
};

export default CookieWarning;
