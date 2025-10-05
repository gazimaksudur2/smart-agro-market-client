import { Outlet } from "react-router-dom";
import Navbar from "../components/Shared/Navbar";
import Footer from "../components/Shared/Footer";
import React, { useState } from "react";
import ChatbotWidget from "../components/Chatbot/ChatbotWidget";
import ChatbotModal from "../components/Chatbot/ChatbotModal";

export default function MainLayout() {
	const [chatOpen, setChatOpen] = useState(false);
	return (
		<div className="flex flex-col min-h-screen bg-">
			<Navbar />
			<main className="flex-grow">
				<Outlet />
			</main>
			<Footer />
			<ChatbotWidget open={chatOpen} onOpen={() => setChatOpen((v) => !v)} />
			<ChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
		</div>
	);
}
