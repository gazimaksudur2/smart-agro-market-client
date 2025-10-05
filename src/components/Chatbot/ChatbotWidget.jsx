import React from "react";

export default function ChatbotWidget({ onOpen, open = false }) {
	return (
		<button
			aria-label="Open SmartAgro Assistant"
			aria-expanded={open}
			onClick={onOpen}
			className="fixed bottom-5 right-5 z-40 group"
		>
			{/* Outer glow/gradient ring */}
			<div
				className={`relative p-[2px] rounded-full transition-transform duration-300 ${
					open ? "scale-105" : "group-hover:scale-105"
				} bg-gradient-to-tr from-primary-600 to-secondary-600`}
				title="SmartAgro Assistant"
			>
				{/* Inner circle */}
				<div
					className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-card text-white transition-colors duration-300 ${
						open ? "bg-primary-700" : "bg-primary-600"
					}`}
				>
					{/* Chat + Leaf icon */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className={`w-7 h-7 transition-transform duration-300 ${
							open ? "rotate-0" : "rotate-0"
						}`}
					>
						{/* Chat bubble */}
						<path d="M12 3c-4.418 0-8 2.91-8 6.5 0 1.69.87 3.22 2.3 4.39l-.94 2.36a1 1 0 001.31 1.31l2.36-.94c.99.37 2.09.58 3.27.58 4.418 0 8-2.91 8-6.5S16.418 3 12 3z" />
						{/* Leaf */}
						<path d="M17.5 6.5c-2.2 0-4.5 1.6-5.5 3.5 0 0 2.6.4 4.5-1.5 0 0-1 2.5-3.5 3.5 0 0 1.5 1 4 0 2.1-.8 3-3.1 3-4.5 0-.6-.5-1-1-1-.6 0-1.1.1-1.5.5z" />
					</svg>

					{/* Subtle breathing ring when closed */}
					{!open && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-500 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-4 w-4 bg-secondary-500"></span>
						</span>
					)}
				</div>
			</div>

			{/* Persistent help pill beside button */}
			<div
				className={`absolute right-16 bottom-1 transition-all duration-300 ${
					open ? "opacity-90 translate-x-0" : "opacity-100 translate-x-0"
				}`}
			>
				<div
					className={`px-3 py-1 rounded-full bg-white shadow-card text-sm text-gray-700 border border-gray-100 flex items-center gap-2 ${
						open ? "" : ""
					}`}
				>
					<span className="text-lg">{open ? "✨" : "🌱"}</span>
					<span className="whitespace-nowrap">
						{open ? "Chat open" : "Need help?"}
					</span>
				</div>
			</div>
		</button>
	);
}
