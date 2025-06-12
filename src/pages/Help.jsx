import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
	FaQuestionCircle,
	FaBook,
	FaHeadset,
	FaEnvelope,
	FaPhone,
	FaChevronDown,
	FaChevronUp,
	FaSearch,
	FaUsers,
	FaShoppingCart,
	FaTruck,
	FaMoneyBillWave,
} from "react-icons/fa";
import useScrollToTop from "../hooks/useScrollToTop";

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
	<div className="border border-gray-200 rounded-lg mb-4">
		<button
			className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
			onClick={onToggle}
		>
			<span className="font-medium text-gray-900">{question}</span>
			{isOpen ? (
				<FaChevronUp className="text-gray-500" />
			) : (
				<FaChevronDown className="text-gray-500" />
			)}
		</button>
		{isOpen && (
			<div className="px-6 pb-4">
				<p className="text-gray-600">{answer}</p>
			</div>
		)}
	</div>
);

export default function Help() {
	useScrollToTop();
	const [openFAQ, setOpenFAQ] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const faqs = [
		{
			id: 1,
			category: "Getting Started",
			question: "How do I register as a seller on SmartAgroConnect?",
			answer:
				"To register as a seller, click on 'Register' and select 'Seller' as your role. You'll need to provide your farm details, contact information, and upload necessary documents. After registration, you'll need to be verified by a regional agent before you can start selling.",
		},
		{
			id: 2,
			category: "Getting Started",
			question: "What is the role of agents in SmartAgroConnect?",
			answer:
				"Agents act as regional branches with warehouses. They verify sellers in their region, approve product listings, manage deliveries, and ensure quality standards. Agents require admin approval and pay membership fees to operate.",
		},
		{
			id: 3,
			category: "Orders & Payments",
			question: "How does the payment system work?",
			answer:
				"SmartAgroConnect requires 2x delivery charge as advance payment when placing an order. This ensures commitment from both buyers and sellers. The remaining amount is paid upon delivery. We support various payment methods including bKash, Nagad, and card payments.",
		},
		{
			id: 4,
			category: "Orders & Payments",
			question: "What is the minimum order quantity?",
			answer:
				"Each product has its own minimum order quantity set by the seller. This is displayed on the product page. The minimum order system helps farmers manage their inventory efficiently and ensures viable transactions.",
		},
		{
			id: 5,
			category: "Delivery",
			question: "How does delivery work?",
			answer:
				"Delivery is managed between agents with platform logistics. Once your order is confirmed, the regional agent coordinates with the seller and arranges delivery to your specified location. You can track your order status in real-time.",
		},
		{
			id: 6,
			category: "Delivery",
			question: "Can I change my delivery address after placing an order?",
			answer:
				"You can change your delivery address within 24 hours of placing the order, provided the order hasn't been processed yet. Contact customer support or the seller directly to make changes.",
		},
		{
			id: 7,
			category: "Products",
			question: "How are product quality and authenticity ensured?",
			answer:
				"All products must be approved by regional agents before being listed. Agents verify the quality, authenticity, and compliance with platform standards. Sellers must provide accurate product descriptions and images.",
		},
		{
			id: 8,
			category: "Products",
			question: "Can I return products if I'm not satisfied?",
			answer:
				"Returns are handled on a case-by-case basis depending on the product type and condition. Fresh produce has different return policies compared to processed goods. Contact customer support within 24 hours of delivery for return requests.",
		},
	];

	const guides = [
		{
			title: "Getting Started as a Farmer/Seller",
			description:
				"Complete guide to registering, getting verified, and listing your first product",
			icon: FaUsers,
			link: "#",
		},
		{
			title: "How to Buy Agricultural Products",
			description:
				"Step-by-step guide for consumers to browse, order, and receive products",
			icon: FaShoppingCart,
			link: "#",
		},
		{
			title: "Understanding the Delivery System",
			description: "Learn how our agent-based delivery network works",
			icon: FaTruck,
			link: "#",
		},
		{
			title: "Payment Methods & Security",
			description:
				"Information about supported payment methods and security measures",
			icon: FaMoneyBillWave,
			link: "#",
		},
	];

	const filteredFAQs = faqs.filter(
		(faq) =>
			faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			faq.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-primary-600 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<FaQuestionCircle className="mx-auto h-16 w-16 mb-6" />
					<h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
					<p className="text-xl text-primary-100 mb-8">
						Find answers to common questions and get support for
						SmartAgroConnect
					</p>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto relative">
						<FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search for help topics..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
						/>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Quick Help Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaBook className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-xl font-semibold mb-2">User Guides</h3>
						<p className="text-gray-600 mb-4">
							Step-by-step guides for using SmartAgroConnect
						</p>
						<a href="#guides" className="btn btn-outline-primary">
							Browse Guides
						</a>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaHeadset className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-xl font-semibold mb-2">Live Support</h3>
						<p className="text-gray-600 mb-4">
							Get real-time help from our support team
						</p>
						<Link to="/contact" className="btn btn-outline-primary">
							Contact Support
						</Link>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaQuestionCircle className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-xl font-semibold mb-2">FAQs</h3>
						<p className="text-gray-600 mb-4">
							Find quick answers to common questions
						</p>
						<a href="#faqs" className="btn btn-outline-primary">
							View FAQs
						</a>
					</div>
				</div>

				{/* User Guides Section */}
				<section id="guides" className="mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">User Guides</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{guides.map((guide, index) => (
							<div
								key={index}
								className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
							>
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<guide.icon className="h-8 w-8 text-primary-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-gray-900 mb-2">
											{guide.title}
										</h3>
										<p className="text-gray-600 mb-4">{guide.description}</p>
										<a
											href={guide.link}
											className="text-primary-600 hover:text-primary-700 font-medium"
										>
											Read Guide →
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* FAQs Section */}
				<section id="faqs">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						Frequently Asked Questions
					</h2>

					{filteredFAQs.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-600">
								No FAQs found matching your search.
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{filteredFAQs.map((faq) => (
								<FAQItem
									key={faq.id}
									question={faq.question}
									answer={faq.answer}
									isOpen={openFAQ === faq.id}
									onToggle={() =>
										setOpenFAQ(openFAQ === faq.id ? null : faq.id)
									}
								/>
							))}
						</div>
					)}
				</section>

				{/* Contact Section */}
				<section className="mt-12 bg-white rounded-lg shadow-md p-8">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Still need help?
						</h2>
						<p className="text-gray-600 mb-6">
							Our support team is here to help you with any questions or issues.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/contact" className="btn btn-primary">
								<FaEnvelope className="mr-2" />
								Contact Support
							</Link>
							<a href="tel:+8801234567890" className="btn btn-outline-primary">
								<FaPhone className="mr-2" />
								Call Us
							</a>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
