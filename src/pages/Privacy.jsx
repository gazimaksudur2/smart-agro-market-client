import React, { useState } from "react";
import {
	FaShieldAlt,
	FaChevronDown,
	FaChevronUp,
	FaPrint,
	FaDownload,
	FaLock,
	FaEye,
	FaUserShield,
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

export default function Privacy() {
	const [openSection, setOpenSection] = useState("overview");

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
					<FaShieldAlt className="mx-auto h-16 w-16 mb-6" />
					<h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
					<p className="text-xl text-primary-100 mb-4">
						Your privacy and data security are our top priorities
					</p>
					<p className="text-sm text-primary-200">
						Last updated: January 22, 2024
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

				{/* Privacy Highlights */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaLock className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-lg font-semibold mb-2">Secure Data</h3>
						<p className="text-gray-600 text-sm">
							Your data is encrypted and stored securely using industry-standard
							protocols
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaEye className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-lg font-semibold mb-2">Transparent</h3>
						<p className="text-gray-600 text-sm">
							We clearly explain what data we collect and how we use it
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<FaUserShield className="mx-auto h-12 w-12 text-primary-600 mb-4" />
						<h3 className="text-lg font-semibold mb-2">Your Control</h3>
						<p className="text-gray-600 text-sm">
							You have full control over your personal information and privacy
							settings
						</p>
					</div>
				</div>

				{/* Introduction */}
				<div className="bg-white rounded-lg shadow-md p-8 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Our Commitment to Your Privacy
					</h2>
					<p className="text-gray-600 mb-4">
						At SmartAgroConnect, we are committed to protecting your privacy and
						ensuring the security of your personal information. This Privacy
						Policy explains how we collect, use, disclose, and safeguard your
						information when you use our agricultural marketplace platform.
					</p>
					<p className="text-gray-600">
						This policy applies to all users of SmartAgroConnect, including
						farmers, consumers, agents, and administrators. By using our
						platform, you consent to the data practices described in this
						policy.
					</p>
				</div>

				{/* Privacy Sections */}
				<div className="space-y-2">
					<Section
						title="1. Information We Collect"
						isOpen={openSection === "overview"}
						onToggle={() =>
							setOpenSection(openSection === "overview" ? null : "overview")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Personal Information
							</h4>
							<p>
								We collect information you provide directly to us, including:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Name, email address, and phone number</li>
								<li>Physical address and delivery locations</li>
								<li>
									Farm details and business information (for sellers and agents)
								</li>
								<li>Payment information and financial details</li>
								<li>Profile photos and product images</li>
								<li>Communication preferences and settings</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Usage Information</h4>
							<p>
								We automatically collect certain information about your use of
								our platform:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									Device information (IP address, browser type, operating
									system)
								</li>
								<li>Usage patterns and navigation behavior</li>
								<li>Transaction history and order details</li>
								<li>Search queries and product interactions</li>
								<li>Location data (with your permission)</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Third-Party Information
							</h4>
							<p>We may receive information from third parties, including:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Payment processors and financial institutions</li>
								<li>Delivery partners and logistics providers</li>
								<li>Social media platforms (if you choose to connect)</li>
								<li>Government databases for verification purposes</li>
							</ul>
						</div>
					</Section>

					<Section
						title="2. How We Use Your Information"
						isOpen={openSection === "usage"}
						onToggle={() =>
							setOpenSection(openSection === "usage" ? null : "usage")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Platform Operations
							</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Create and manage your account</li>
								<li>Process transactions and payments</li>
								<li>Facilitate communication between users</li>
								<li>Coordinate deliveries and logistics</li>
								<li>Verify seller and agent credentials</li>
								<li>Provide customer support services</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Personalization and Improvement
							</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Customize your experience and recommendations</li>
								<li>Analyze usage patterns to improve our services</li>
								<li>Develop new features and functionality</li>
								<li>Conduct research and analytics</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Communication</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Send order confirmations and updates</li>
								<li>Provide important platform notifications</li>
								<li>Share promotional offers (with your consent)</li>
								<li>Respond to your inquiries and support requests</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Legal and Security
							</h4>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Comply with legal obligations and regulations</li>
								<li>Prevent fraud and ensure platform security</li>
								<li>Enforce our terms of service</li>
								<li>Protect the rights and safety of our users</li>
							</ul>
						</div>
					</Section>

					<Section
						title="3. Information Sharing and Disclosure"
						isOpen={openSection === "sharing"}
						onToggle={() =>
							setOpenSection(openSection === "sharing" ? null : "sharing")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">With Other Users</h4>
							<p>We share certain information to facilitate transactions:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Contact information between buyers and sellers</li>
								<li>Delivery addresses with assigned agents</li>
								<li>Product information and seller details</li>
								<li>Order status and tracking information</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								With Service Providers
							</h4>
							<p>
								We work with trusted third parties who help us operate our
								platform:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Payment processors (Stripe, bKash, Nagad)</li>
								<li>Cloud hosting and storage providers</li>
								<li>Email and SMS service providers</li>
								<li>Analytics and monitoring services</li>
								<li>Customer support platforms</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Legal Requirements
							</h4>
							<p>We may disclose information when required by law or to:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Comply with legal processes and government requests</li>
								<li>Enforce our terms of service and policies</li>
								<li>Protect the rights, property, or safety of our users</li>
								<li>Prevent fraud or illegal activities</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Business Transfers
							</h4>
							<p>
								In the event of a merger, acquisition, or sale of assets, your
								information may be transferred as part of the business
								transaction, subject to the same privacy protections.
							</p>
						</div>
					</Section>

					<Section
						title="4. Data Security and Protection"
						isOpen={openSection === "security"}
						onToggle={() =>
							setOpenSection(openSection === "security" ? null : "security")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Security Measures</h4>
							<p>
								We implement comprehensive security measures to protect your
								data:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>SSL/TLS encryption for data transmission</li>
								<li>Encrypted storage of sensitive information</li>
								<li>Regular security audits and vulnerability assessments</li>
								<li>Access controls and authentication systems</li>
								<li>Employee training on data protection practices</li>
								<li>Incident response and breach notification procedures</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Payment Security</h4>
							<p>
								Payment information is processed through PCI DSS compliant
								payment processors. We do not store complete credit card numbers
								or sensitive payment data on our servers.
							</p>

							<h4 className="font-semibold text-gray-900">Data Retention</h4>
							<p>
								We retain your information only as long as necessary to provide
								our services and comply with legal obligations. Inactive
								accounts may be deleted after a reasonable period of inactivity.
							</p>
						</div>
					</Section>

					<Section
						title="5. Your Privacy Rights and Choices"
						isOpen={openSection === "rights"}
						onToggle={() =>
							setOpenSection(openSection === "rights" ? null : "rights")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">
								Access and Control
							</h4>
							<p>You have the right to:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Access and review your personal information</li>
								<li>Update or correct inaccurate data</li>
								<li>Delete your account and associated data</li>
								<li>Export your data in a portable format</li>
								<li>Restrict certain uses of your information</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Communication Preferences
							</h4>
							<p>You can control how we communicate with you:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Opt out of promotional emails and SMS</li>
								<li>Customize notification settings</li>
								<li>Choose your preferred communication channels</li>
								<li>Update your contact preferences anytime</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Location Data</h4>
							<p>
								You can control location sharing through your device settings.
								Disabling location services may limit certain platform features.
							</p>

							<h4 className="font-semibold text-gray-900">
								Cookies and Tracking
							</h4>
							<p>
								You can manage cookie preferences through your browser settings.
								Some cookies are essential for platform functionality.
							</p>
						</div>
					</Section>

					<Section
						title="6. Cookies and Tracking Technologies"
						isOpen={openSection === "cookies"}
						onToggle={() =>
							setOpenSection(openSection === "cookies" ? null : "cookies")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Types of Cookies</h4>
							<p>We use different types of cookies and similar technologies:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>
									<strong>Essential Cookies:</strong> Required for basic
									platform functionality
								</li>
								<li>
									<strong>Performance Cookies:</strong> Help us analyze and
									improve our services
								</li>
								<li>
									<strong>Functional Cookies:</strong> Remember your preferences
									and settings
								</li>
								<li>
									<strong>Marketing Cookies:</strong> Used for targeted
									advertising (with consent)
								</li>
							</ul>

							<h4 className="font-semibold text-gray-900">
								Third-Party Analytics
							</h4>
							<p>
								We use analytics services like Google Analytics to understand
								how users interact with our platform. These services may use
								cookies and similar technologies to collect usage information.
							</p>

							<h4 className="font-semibold text-gray-900">Managing Cookies</h4>
							<p>
								You can control cookies through your browser settings, but
								disabling certain cookies may affect platform functionality.
							</p>
						</div>
					</Section>

					<Section
						title="7. Children's Privacy"
						isOpen={openSection === "children"}
						onToggle={() =>
							setOpenSection(openSection === "children" ? null : "children")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Age Restrictions</h4>
							<p>
								SmartAgroConnect is not intended for children under 18 years of
								age. We do not knowingly collect personal information from
								children under 18.
							</p>

							<h4 className="font-semibold text-gray-900">Parental Consent</h4>
							<p>
								If we become aware that we have collected information from a
								child under 18 without parental consent, we will take steps to
								delete such information promptly.
							</p>

							<h4 className="font-semibold text-gray-900">Reporting</h4>
							<p>
								If you believe we have collected information from a child under
								18, please contact us immediately at
								privacy@smartagroconnect.com.
							</p>
						</div>
					</Section>

					<Section
						title="8. International Data Transfers"
						isOpen={openSection === "transfers"}
						onToggle={() =>
							setOpenSection(openSection === "transfers" ? null : "transfers")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Data Location</h4>
							<p>
								Your information may be stored and processed in Bangladesh and
								other countries where our service providers operate. We ensure
								appropriate safeguards are in place for international transfers.
							</p>

							<h4 className="font-semibold text-gray-900">Safeguards</h4>
							<p>
								When transferring data internationally, we use appropriate
								safeguards such as:
							</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Standard contractual clauses</li>
								<li>Adequacy decisions by relevant authorities</li>
								<li>Certification schemes and codes of conduct</li>
								<li>Binding corporate rules</li>
							</ul>
						</div>
					</Section>

					<Section
						title="9. Changes to This Privacy Policy"
						isOpen={openSection === "changes"}
						onToggle={() =>
							setOpenSection(openSection === "changes" ? null : "changes")
						}
					>
						<div className="space-y-4 text-gray-600">
							<h4 className="font-semibold text-gray-900">Policy Updates</h4>
							<p>
								We may update this Privacy Policy from time to time to reflect
								changes in our practices, technology, legal requirements, or
								other factors.
							</p>

							<h4 className="font-semibold text-gray-900">Notification</h4>
							<p>We will notify you of significant changes through:</p>
							<ul className="list-disc list-inside ml-4 space-y-2">
								<li>Email notifications to registered users</li>
								<li>Prominent notices on our platform</li>
								<li>In-app notifications</li>
								<li>Updates to the "Last Updated" date</li>
							</ul>

							<h4 className="font-semibold text-gray-900">Continued Use</h4>
							<p>
								Your continued use of SmartAgroConnect after policy changes
								constitutes acceptance of the updated Privacy Policy.
							</p>
						</div>
					</Section>
				</div>

				{/* Contact Information */}
				<div className="bg-white rounded-lg shadow-md p-8 mt-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Contact Us About Privacy
					</h2>
					<p className="text-gray-600 mb-4">
						If you have any questions, concerns, or requests regarding this
						Privacy Policy or our data practices, please contact us:
					</p>
					<div className="space-y-2 text-gray-600">
						<p>
							<strong>Privacy Officer:</strong> privacy@smartagroconnect.com
						</p>
						<p>
							<strong>General Contact:</strong> support@smartagroconnect.com
						</p>
						<p>
							<strong>Phone:</strong> +880 1234-567890
						</p>
						<p>
							<strong>Address:</strong> House 45, Road 12, Dhanmondi, Dhaka
							1205, Bangladesh
						</p>
					</div>
					<div className="mt-6 p-4 bg-primary-50 rounded-lg">
						<p className="text-sm text-primary-800">
							<strong>Data Protection Rights:</strong> If you are located in the
							European Union or other jurisdictions with data protection laws,
							you may have additional rights regarding your personal
							information. Please contact us to learn more about your rights.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
