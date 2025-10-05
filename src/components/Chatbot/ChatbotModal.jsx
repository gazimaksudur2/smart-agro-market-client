import React, { useEffect, useRef, useState } from "react";
import { askWebsiteFaq } from "../../services/chatbotService";
import { FaPaperPlane } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

export default function ChatbotModal({ open, onClose }) {
	const STORAGE_KEY = "sac_chat_messages";
	const [messages, setMessages] = useState(() => {
		try {
			const saved = sessionStorage.getItem(STORAGE_KEY);
			const parsed = saved ? JSON.parse(saved) : null;
			if (Array.isArray(parsed) && parsed.length > 0) return parsed;
		} catch {}
		return [
			{
				id: "greet",
				role: "bot",
				text: "Hi! I’m your SmartAgro assistant. How can I help you today?",
			},
		];
	});
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const listRef = useRef(null);

	useEffect(() => {
		if (open) {
			setTimeout(
				() =>
					listRef.current?.scrollTo({
						top: listRef.current.scrollHeight,
						behavior: "smooth",
					}),
				50
			);
		}
	}, [open, messages.length]);

	useEffect(() => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
		} catch {}
	}, [messages]);

	const handleSend = async (text) => {
		const trimmed = (text ?? input).trim();
		if (!trimmed) return;

		const userMsg = { id: Date.now() + "-u", role: "user", text: trimmed };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsSending(true);

		const { text: botText } = await askWebsiteFaq(trimmed);
		const botMsg = { id: Date.now() + "-b", role: "bot", text: botText };
		setMessages((prev) => [...prev, botMsg]);
		setIsSending(false);
	};

	const handleReset = () => {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
		} catch {}
		setMessages([
			{
				id: "greet",
				role: "bot",
				text: "Hi! I’m your SmartAgro assistant. How can I help you today?",
			},
		]);
		setInput("");
		setIsSending(false);
	};

	return (
		<div
			className={`fixed z-50 right-5 bottom-24 md:bottom-24 transition-all duration-300 ${
				open
					? "opacity-100 translate-y-0 pointer-events-auto"
					: "opacity-0 translate-y-4 pointer-events-none"
			}`}
		>
			<div className="relative w-[90vw] max-w-md max-h-[75vh] rounded-card shadow-card bg-white overflow-hidden border border-gray-100 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-5 h-5"
							>
								<path d="M12 3c-4.418 0-8 2.91-8 6.5 0 1.69.87 3.22 2.3 4.39l-.94 2.36a1 1 0 001.31 1.31l2.36-.94c.99.37 2.09.58 3.27.58 4.418 0 8-2.91 8-6.5S16.418 3 12 3z" />
								<path d="M17.5 6.5c-2.2 0-4.5 1.6-5.5 3.5 0 0 2.6.4 4.5-1.5 0 0-1 2.5-3.5 3.5 0 0 1.5 1 4 0 2.1-.8 3-3.1 3-4.5 0-.6-.5-1-1-1-.6 0-1.1.1-1.5.5z" />
							</svg>
						</div>
						<div>
							<p className="font-semibold leading-tight">SmartAgro Assistant</p>
							<p className="text-xs opacity-90">Here to guide you</p>
						</div>
					</div>
					<button
						onClick={handleReset}
						className="daisy-btn daisy-btn-xs daisy-btn-ghost text-white flex items-center gap-1"
						title="Restart chat"
					>
						<FiRefreshCw className="w-4 h-4" />
						<span className="hidden sm:inline">Restart</span>
					</button>
					<button
						onClick={onClose}
						className="daisy-btn daisy-btn-xs daisy-btn-ghost text-white"
					>
						Close
					</button>
				</div>

				{/* Messages */}
				<div
					ref={listRef}
					className="overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-primary-50 to-white flex-1"
				>
					{messages.map((m) => (
						<div
							key={m.id}
							className={`flex ${
								m.role === "user" ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`${
									m.role === "user"
										? "bg-secondary-600 text-white"
										: "bg-white text-gray-800 border border-gray-100"
								} rounded-2xl px-3 py-2 shadow-sm max-w-[80%] whitespace-pre-wrap`}
							>
								{m.text}
							</div>
						</div>
					))}
					{isSending && (
						<div className="flex justify-start">
							<div className="bg-white text-gray-800 border border-gray-100 rounded-2xl px-3 py-2 shadow-sm max-w-[80%]">
								<span className="inline-flex items-center gap-1">
									<span
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									></span>
									<span
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "100ms" }}
									></span>
									<span
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{ animationDelay: "200ms" }}
									></span>
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Composer */}
				<div className="p-3 border-t bg-white">
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask anything..."
							className="w-full h-11 px-4 rounded-full border border-gray-200 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSend();
							}}
							disabled={isSending}
						/>
						<button
							aria-label="Send message"
							className={`h-11 w-11 rounded-full flex items-center justify-center text-white shadow-sm transition-colors ${
								isSending
									? "bg-gray-300"
									: "bg-primary-600 hover:bg-primary-700"
							}`}
							onClick={() => handleSend()}
							disabled={isSending}
						>
							<FaPaperPlane className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
