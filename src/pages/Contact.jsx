import React, { useState } from "react";
import {
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaClock,
	FaFacebook,
	FaTwitter,
	FaLinkedin,
	FaInstagram,
	FaPaperPlane,
	FaHeadset,
	FaQuestionCircle,
	FaBug,
} from "react-icons/fa";

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		category: "general",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate form submission
		setTimeout(() => {
			setSubmitStatus("success");
			setIsSubmitting(false);
			setFormData({
				name: "",
				email: "",
				phone: "",
				subject: "",
				category: "general",
				message: "",
			});
		}, 2000);
	};

	const contactMethods = [
		{
			icon: FaPhone,
			title: "Phone Support",
			description: "Speak directly with our support team",
			contact: "+880 1234-567890",
			availability: "9 AM - 6 PM (Sat-Thu)",
		},
		{
			icon: FaEnvelope,
			title: "Email Support",
			description: "Send us an email and we'll respond within 24 hours",
			contact: "support@smartagroconnect.com",
			availability: "24/7 Response",
		},
		{
			icon: FaHeadset,
			title: "Live Chat",
			description: "Get instant help through our live chat",
			contact: "Available on website",
			availability: "9 AM - 9 PM (Daily)",
		},
	];

	const offices = [
		{
			city: "Dhaka",
			address: "House 45, Road 12, Dhanmondi, Dhaka 1205",
			phone: "+880 2-9876543",
			email: "dhaka@smartagroconnect.com",
		},
		{
			city: "Chittagong",
			address: "Building 23, Agrabad Commercial Area, Chittagong 4100",
			phone: "+880 31-654321",
			email: "chittagong@smartagroconnect.com",
		},
		{
			city: "Sylhet",
			address: "Plot 15, Zindabazar, Sylhet 3100",
			phone: "+880 821-123456",
			email: "sylhet@smartagroconnect.com",
		},
	];

	const categories = [
		{ value: "general", label: "General Inquiry" },
		{ value: "technical", label: "Technical Support" },
		{ value: "billing", label: "Billing & Payments" },
		{ value: "seller", label: "Seller Support" },
		{ value: "agent", label: "Agent Support" },
		{ value: "partnership", label: "Partnership" },
		{ value: "feedback", label: "Feedback" },
		{ value: "bug", label: "Report a Bug" },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-primary-600 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<FaEnvelope className="mx-auto h-16 w-16 mb-6" />
					<h1 className="text-4xl font-bold mb-4">Contact Us</h1>
					<p className="text-xl text-primary-100">
						We're here to help you succeed with SmartAgroConnect
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Contact Methods */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
					{contactMethods.map((method, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-md p-6 text-center"
						>
							<method.icon className="mx-auto h-12 w-12 text-primary-600 mb-4" />
							<h3 className="text-xl font-semibold mb-2">{method.title}</h3>
							<p className="text-gray-600 mb-4">{method.description}</p>
							<p className="font-medium text-gray-900">{method.contact}</p>
							<p className="text-sm text-gray-500">{method.availability}</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Form */}
					<div className="bg-white rounded-lg shadow-md p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">
							Send us a Message
						</h2>

						{submitStatus === "success" && (
							<div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
								Thank you for your message! We'll get back to you within 24
								hours.
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Full Name *
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Email Address *
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Phone Number
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label
										htmlFor="category"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Category *
									</label>
									<select
										id="category"
										name="category"
										value={formData.category}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									>
										{categories.map((category) => (
											<option key={category.value} value={category.value}>
												{category.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label
									htmlFor="subject"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Subject *
								</label>
								<input
									type="text"
									id="subject"
									name="subject"
									value={formData.subject}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label
									htmlFor="message"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Message *
								</label>
								<textarea
									id="message"
									name="message"
									value={formData.message}
									onChange={handleInputChange}
									required
									rows={6}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									placeholder="Please describe your inquiry in detail..."
								/>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
										Sending...
									</>
								) : (
									<>
										<FaPaperPlane className="mr-2" />
										Send Message
									</>
								)}
							</button>
						</form>
					</div>

					{/* Office Locations & Additional Info */}
					<div className="space-y-8">
						{/* Office Locations */}
						<div className="bg-white rounded-lg shadow-md p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								<FaMapMarkerAlt className="inline mr-2" />
								Our Offices
							</h2>
							<div className="space-y-6">
								{offices.map((office, index) => (
									<div
										key={index}
										className="border-b border-gray-200 pb-4 last:border-b-0"
									>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{office.city} Office
										</h3>
										<p className="text-gray-600 mb-2">{office.address}</p>
										<p className="text-sm text-gray-600">
											<FaPhone className="inline mr-1" />
											{office.phone}
										</p>
										<p className="text-sm text-gray-600">
											<FaEnvelope className="inline mr-1" />
											{office.email}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Business Hours */}
						<div className="bg-white rounded-lg shadow-md p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								<FaClock className="inline mr-2" />
								Business Hours
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Saturday - Thursday</span>
									<span className="font-medium">9:00 AM - 6:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Friday</span>
									<span className="font-medium">Closed</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Emergency Support</span>
									<span className="font-medium">24/7 Available</span>
								</div>
							</div>
						</div>

						{/* Social Media */}
						<div className="bg-white rounded-lg shadow-md p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Follow Us
							</h2>
							<div className="flex space-x-4">
								<a
									href="#"
									className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
								>
									<FaFacebook />
								</a>
								<a
									href="#"
									className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
								>
									<FaTwitter />
								</a>
								<a
									href="#"
									className="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors"
								>
									<FaLinkedin />
								</a>
								<a
									href="#"
									className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
								>
									<FaInstagram />
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div className="bg-primary-50 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Quick Help
							</h3>
							<div className="space-y-3">
								<a
									href="/help"
									className="flex items-center text-primary-600 hover:text-primary-700"
								>
									<FaQuestionCircle className="mr-2" />
									Frequently Asked Questions
								</a>
								<a
									href="/help"
									className="flex items-center text-primary-600 hover:text-primary-700"
								>
									<FaBug className="mr-2" />
									Report a Bug
								</a>
								<a
									href="/help"
									className="flex items-center text-primary-600 hover:text-primary-700"
								>
									<FaHeadset className="mr-2" />
									Live Chat Support
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
