import React, { useState } from "react";
import {
	FaFileContract,
	FaChevronDown,
	FaChevronUp,
	FaPrint,
	FaDownload,
} from "react-icons/fa";

const Section = ({ title, children, isOpen, onToggle }) => (
	<div className="border border-gray-200 rounded-lg mb-4">
		<button
			className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
			onClick={onToggle}
		>
			<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
			{isOpen ? (
				<FaChevronUp className="text-gray-500" />
			) : (
				<FaChevronDown className="text-gray-500" />
			)}
		</button>
		{isOpen && <div className="px-6 pb-6">{children}</div>}
	</div>
);

export default function Terms() {
	const [openSection, setOpenSection] = useState("acceptance");

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {
		// In a real application, this would generate and download a PDF
		alert("PDF download functionality would be implemented here");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-primary-600 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<FaFileContract className="mx-auto h-16 w-16 mb-6" />
					<h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
					<p className="text-xl text-primary-100 mb-4">
						SmartAgroConnect Platform Terms and Conditions
					</p>
					<p className="text-sm text-primary-200">
						Last updated: May 25, 2025
					</p>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Action Buttons */}
				<div className="flex justify-end space-x-4 mb-8">
					<button onClick={handlePrint} className="btn btn-outline-primary">
						<FaPrint className="mr-2" />
						Print
					</button>
					<button onClick={handleDownload} className="btn btn-outline-primary">
						<FaDownload className="mr-2" />
						Download PDF
					</button>
				</div>

				{/* Introduction */}
				<div className="bg-white rounded-lg shadow-md p-8 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Welcome to SmartAgroConnect
					</h2>
					<p className="text-gray-600 mb-4">
						These Terms of Service ("Terms") govern your use of the
						SmartAgroConnect platform, a comprehensive agricultural marketplace
						connecting farmers, wholesalers, retailers, agents, and consumers
						across Bangladesh.
					</p>
					<p className="text-gray-600">
						By accessing or using our platform, you agree to be bound by these
						Terms. If you disagree with any part of these terms, you may not
						access the service.
					</p>
				</div>

				{/* Terms Sections */}
				<div className="space-y-2">
					<Section
						title="1. Acceptance of Terms"
						isOpen={openSection === "acceptance"}
						onToggle={() =>
							setOpenSection(openSection === "acceptance" ? null : "acceptance")
						}
					>
						<div className="space-y-4 text-gray-600">
							<p>
								By creating an account or using SmartAgroConnect, you
								acknowledge that you have read, understood, and agree to be
								bound by these Terms of Service and our Privacy Policy.
							</p>
							<p>
								These Terms apply to all users of the platform, including but
								not limited to:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									<strong>Farmers/Sellers:</strong> Agricultural producers
									selling their products
								</li>
								<li>
									<strong>Consumers:</strong> Wholesalers, retailers, and end
									consumers purchasing products
								</li>
								<li>
									<strong>Agents:</strong> Regional representatives managing
									local operations
								</li>
								<li>
									<strong>Administrators:</strong> Platform managers overseeing
									operations
								</li>
							</ul>
						</div>
					</Section>

					<Section
						title="2. User Accounts and Registration"
						isOpen={openSection === "registration"}
						onToggle={() =>
							setOpenSection(
								openSection === "registration" ? null : "registration"
							)
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Account Creation</h4>
							<p>
								To use SmartAgroConnect, you must create an account by providing
								accurate, current, and complete information. You are responsible
								for maintaining the confidentiality of your account credentials.
							</p>

							<h4 className="font-semibold text-gray-900">
								Verification Requirements
							</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									<strong>Sellers:</strong> Must be verified by regional agents
									before listing products
								</li>
								<li>
									<strong>Agents:</strong> Require admin approval and payment of
									membership fees
								</li>
								<li>
									<strong>All Users:</strong> Must provide valid contact
									information and documentation
								</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Account Responsibilities
							</h4>
							<p>
								You are responsible for all activities that occur under your
								account. You must notify us immediately of any unauthorized use
								of your account.
							</p>
						</div>
					</Section>

					<Section
						title="3. Platform Services"
						isOpen={openSection === "services"}
						onToggle={() =>
							setOpenSection(openSection === "services" ? null : "services")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Marketplace Services
							</h4>
							<p>
								SmartAgroConnect provides a digital marketplace platform that
								facilitates transactions between agricultural producers and
								consumers through our agent-based delivery network.
							</p>

							<h4 className="font-semibold text-gray-900">Agent Network</h4>
							<p>Our platform operates through regional agents who:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Verify and approve sellers in their regions</li>
								<li>Review and approve product listings</li>
								<li>Manage warehouse operations and inventory</li>
								<li>Coordinate delivery logistics</li>
								<li>Ensure quality standards and compliance</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Payment Processing
							</h4>
							<p>
								Our platform requires advance payment of 2x delivery charges to
								ensure commitment from both buyers and sellers. Remaining
								payments are processed upon successful delivery.
							</p>
						</div>
					</Section>

					<Section
						title="4. User Obligations and Conduct"
						isOpen={openSection === "conduct"}
						onToggle={() =>
							setOpenSection(openSection === "conduct" ? null : "conduct")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Prohibited Activities
							</h4>
							<p>Users are prohibited from:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Providing false or misleading product information</li>
								<li>
									Engaging in fraudulent transactions or payment activities
								</li>
								<li>Violating any applicable laws or regulations</li>
								<li>Interfering with platform operations or security</li>
								<li>Harassing or abusing other users</li>
								<li>Selling prohibited or restricted items</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Quality Standards</h4>
							<p>
								Sellers must ensure that all products meet quality standards and
								match their descriptions. Misrepresentation of products may
								result in account suspension or termination.
							</p>

							<h4 className="font-semibold text-gray-900">Compliance</h4>
							<p>
								All users must comply with local agricultural regulations, food
								safety standards, and applicable laws in Bangladesh.
							</p>
						</div>
					</Section>

					<Section
						title="5. Orders and Payments"
						isOpen={openSection === "payments"}
						onToggle={() =>
							setOpenSection(openSection === "payments" ? null : "payments")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Order Process</h4>
							<p>
								Orders are subject to seller acceptance and agent approval.
								Minimum order quantities apply as specified by individual
								sellers.
							</p>

							<h4 className="font-semibold text-gray-900">Payment Terms</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									Advance payment of 2x delivery charge required at order
									placement
								</li>
								<li>Remaining balance due upon delivery confirmation</li>
								<li>
									Supported payment methods: bKash, Nagad, Credit/Debit Cards
								</li>
								<li>
									All payments are processed securely through our payment
									partners
								</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Refunds and Cancellations
							</h4>
							<p>
								Cancellation and refund policies vary by product type and order
								status. Fresh produce has different policies compared to
								processed goods. Contact customer support for specific cases.
							</p>
						</div>
					</Section>

					<Section
						title="6. Delivery and Logistics"
						isOpen={openSection === "delivery"}
						onToggle={() =>
							setOpenSection(openSection === "delivery" ? null : "delivery")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Delivery Network</h4>
							<p>
								Delivery is managed through our network of regional agents with
								established warehouse and logistics capabilities.
							</p>

							<h4 className="font-semibold text-gray-900">Delivery Terms</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Delivery times vary by location and product type</li>
								<li>Customers must be available to receive deliveries</li>
								<li>
									Delivery address changes must be requested within 24 hours
								</li>
								<li>
									Special handling requirements must be specified at order time
								</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Risk of Loss</h4>
							<p>
								Risk of loss transfers to the buyer upon delivery confirmation.
								Damage or loss during transit is covered by our delivery
								insurance.
							</p>
						</div>
					</Section>

					<Section
						title="7. Intellectual Property"
						isOpen={openSection === "ip"}
						onToggle={() => setOpenSection(openSection === "ip" ? null : "ip")}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Platform Content</h4>
							<p>
								All content on the SmartAgroConnect platform, including but not
								limited to text, graphics, logos, and software, is owned by
								SmartAgroConnect or its licensors and is protected by
								intellectual property laws.
							</p>

							<h4 className="font-semibold text-gray-900">User Content</h4>
							<p>
								Users retain ownership of content they upload but grant
								SmartAgroConnect a license to use, display, and distribute such
								content for platform operations.
							</p>

							<h4 className="font-semibold text-gray-900">Trademark</h4>
							<p>
								SmartAgroConnect and related marks are trademarks of our
								company. Unauthorized use is prohibited.
							</p>
						</div>
					</Section>

					<Section
						title="8. Limitation of Liability"
						isOpen={openSection === "liability"}
						onToggle={() =>
							setOpenSection(openSection === "liability" ? null : "liability")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Service Availability
							</h4>
							<p>
								While we strive for continuous service availability,
								SmartAgroConnect does not guarantee uninterrupted access to the
								platform.
							</p>

							<h4 className="font-semibold text-gray-900">
								Third-Party Services
							</h4>
							<p>
								We are not responsible for the actions of third-party service
								providers, including payment processors and delivery partners,
								beyond our direct control.
							</p>

							<h4 className="font-semibold text-gray-900">Limitation</h4>
							<p>
								Our liability is limited to the maximum extent permitted by law.
								We are not liable for indirect, incidental, or consequential
								damages.
							</p>
						</div>
					</Section>

					<Section
						title="9. Termination"
						isOpen={openSection === "termination"}
						onToggle={() =>
							setOpenSection(
								openSection === "termination" ? null : "termination"
							)
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Account Termination
							</h4>
							<p>
								Either party may terminate the account relationship at any time.
								SmartAgroConnect reserves the right to suspend or terminate
								accounts for violations of these Terms.
							</p>

							<h4 className="font-semibold text-gray-900">
								Effect of Termination
							</h4>
							<p>
								Upon termination, your right to use the platform ceases
								immediately. Pending transactions will be completed according to
								existing agreements.
							</p>

							<h4 className="font-semibold text-gray-900">Data Retention</h4>
							<p>
								We may retain certain information as required by law or for
								legitimate business purposes after account termination.
							</p>
						</div>
					</Section>

					<Section
						title="10. Changes to Terms"
						isOpen={openSection === "changes"}
						onToggle={() =>
							setOpenSection(openSection === "changes" ? null : "changes")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Modifications</h4>
							<p>
								SmartAgroConnect reserves the right to modify these Terms at any
								time. Changes will be effective upon posting to the platform.
							</p>

							<h4 className="font-semibold text-gray-900">Notification</h4>
							<p>
								We will notify users of significant changes through email or
								platform notifications. Continued use constitutes acceptance of
								modified Terms.
							</p>
						</div>
					</Section>
				</div>

				{/* Contact Information */}
				<div className="bg-white rounded-lg shadow-md p-8 mt-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Contact Information
					</h2>
					<p className="text-gray-600 mb-4">
						If you have any questions about these Terms of Service, please
						contact us:
					</p>
					<div className="space-y-2 text-gray-600">
						<p>
							<strong>Email:</strong> legal@smartagroconnect.com
						</p>
						<p>
							<strong>Phone:</strong> +880 1234-567890
						</p>
						<p>
							<strong>Address:</strong> House 45, Road 12, Dhanmondi, Dhaka
							1205, Bangladesh
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
