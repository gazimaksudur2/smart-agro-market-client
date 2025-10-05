import { Link } from "react-router-dom";
import { FaLeaf, FaHandshake, FaTruck, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import useScrollToTop from "../hooks/useScrollToTop";

export default function About() {
	const { currentUser } = useAuth();
	useScrollToTop();
	return (
		<div className="bg-gray-50">
			{/* Hero section */}
			<div className="bg-primary-700 text-white">
				<div className="container mx-auto px-4 py-16 md:py-24">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">
							About SmartAgro Connect
						</h1>
						<p className="text-xl md:text-2xl opacity-90">
							Transforming agricultural trade across Bangladesh with technology
							and trust.
						</p>
					</div>
				</div>
			</div>

			{/* Mission section */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
						Our Mission
					</h2>
					<p className="text-lg text-gray-700 mb-8 text-center">
						SmartAgro Connect was founded with a clear mission: to create a
						fair, efficient, and transparent agricultural marketplace that
						empowers farmers and provides reliable bulk sourcing for businesses
						across Bangladesh.
					</p>

					<div className="bg-white p-8 rounded-lg shadow-md">
						<p className="text-gray-700 mb-4">
							In a country where agriculture is the backbone of the economy, we
							recognized that traditional agricultural trade faces numerous
							challenges:
						</p>

						<ul className="list-disc pl-5 mb-6 text-gray-700 space-y-2">
							<li>
								Farmers often receive unfair prices due to multiple
								intermediaries
							</li>
							<li>
								Wholesale buyers struggle to find reliable sources of quality
								crops
							</li>
							<li>Lack of transparency in pricing and quality assessment</li>
							<li>Inefficient logistics and delivery systems</li>
							<li>Limited access to wider markets for rural farmers</li>
						</ul>

						<p className="text-gray-700">
							SmartAgro Connect addresses these challenges by providing a
							digital platform that directly connects farmers with wholesale
							buyers, backed by a network of verified regional agents who ensure
							quality control and streamlined logistics.
						</p>
					</div>
				</div>
			</div>

			{/* How it works section */}
			<div className="bg-gray-100 py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
						How SmartAgro Connect Works
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{/* Step 1 */}
						<div className="bg-white rounded-lg shadow-md p-6 text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaLeaf className="text-primary-600 text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Farmer Registration
							</h3>
							<p className="text-gray-700">
								Farmers register on our platform and get verified by regional
								agents to ensure authenticity.
							</p>
						</div>

						{/* Step 2 */}
						<div className="bg-white rounded-lg shadow-md p-6 text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaShieldAlt className="text-primary-600 text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Quality Verification
							</h3>
							<p className="text-gray-700">
								Regional agents verify product listings and ensure they meet
								quality standards before approval.
							</p>
						</div>

						{/* Step 3 */}
						<div className="bg-white rounded-lg shadow-md p-6 text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaHandshake className="text-primary-600 text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Transparent Trading
							</h3>
							<p className="text-gray-700">
								Wholesale buyers browse verified products and place bulk orders
								with clear pricing and terms.
							</p>
						</div>

						{/* Step 4 */}
						<div className="bg-white rounded-lg shadow-md p-6 text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaTruck className="text-primary-600 text-2xl" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Managed Delivery
							</h3>
							<p className="text-gray-700">
								Our network of regional agents handles product pickup and
								delivery to ensure smooth logistics.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Team section - can be expanded with actual team members */}
			<div className="container mx-auto px-4 py-16">
				<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
					Our Team
				</h2>
				<p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
					SmartAgro Connect is built by a passionate team of agriculture
					experts, technology specialists, and business professionals committed
					to revolutionizing agricultural trade in Bangladesh.
				</p>

				{/* Team grid would go here */}
				<div className="bg-primary-50 p-8 rounded-lg shadow-md max-w-3xl mx-auto">
					<h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
						Join Our Team
					</h3>
					<p className="text-gray-700 text-center mb-6">
						We're always looking for talented individuals who share our passion
						for agriculture and technology. If you're interested in making a
						difference in Bangladesh's agricultural sector, we'd love to hear
						from you.
					</p>
					<div className="text-center">
						<a
							href="mailto:careers@smartagroconnect.com"
							className="btn btn-primary inline-block"
						>
							Contact Us About Opportunities
						</a>
					</div>
				</div>
			</div>

			{!currentUser?.FirebaseUser && (
				<div className="bg-secondary-500 text-white py-16">
					<div className="container mx-auto px-4 text-center">
						<h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
						<p className="text-xl mb-8 max-w-2xl mx-auto">
							Join thousands of farmers and buyers already using SmartAgro
							Connect to transform their agricultural business.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Link
								to="/register"
								className="btn bg-white text-secondary-700 hover:bg-gray-100 py-3 px-8 text-lg font-medium"
							>
								Create an Account
							</Link>
							<Link
								to="/products"
								className="btn bg-secondary-600 text-white hover:bg-secondary-700 py-3 px-8 text-lg font-medium"
							>
								Browse Products
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
