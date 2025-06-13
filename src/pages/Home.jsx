import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { FaLeaf, FaTractor, FaWarehouse, FaTruckMoving } from "react-icons/fa";
import { BsShieldCheck, BsCashCoin } from "react-icons/bs";
import ProductCard from "../components/Products/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import useScrollToTop from "../hooks/useScrollToTop";

export default function Home() {
	useScrollToTop();
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	const { currentUser, currentRole } = useAuth();

	// Fetch featured products
	const { data: featuredProducts, isLoading } = useQuery(
		"featuredProducts",
		async () => {
			try {
				const { data } = await axios.get(`${apiBaseUrl}/products?limit=4`);

				// Check if response has success field and return products accordingly
				if (data?.success) {
					return data.products || [];
				}
				// Fallback for backward compatibility
				return data.products || data || [];
			} catch (error) {
				console.error("Error fetching featured products:", error);
				return [];
			}
		}
	);

	return (
		<div>
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
				<div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
					<div className="md:w-1/2 mb-10 md:mb-0">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							Connecting Farmers and Buyers Across Bangladesh
						</h1>
						<p className="text-lg mb-8">
							SmartAgro Connect is a platform for bulk agricultural trade,
							connecting farmers with wholesale buyers for efficient,
							transparent crop trading.
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								to="/products"
								className="btn bg-white text-primary-700 hover:bg-gray-100 py-3 px-6 font-medium rounded-button text-center"
							>
								Browse Products
							</Link>
							<Link
								to="/register"
								className="btn bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-6 font-medium rounded-button text-center"
							>
								Join Now
							</Link>
						</div>
					</div>
					<div className="md:w-1/2 flex justify-center">
						<img
							src="https://res.cloudinary.com/dsawnilz3/image/upload/v1749729345/banner_image_bg37ky.png"
							alt="Farmers and crops"
							className="rounded-lg shadow-lg object-cover"
						/>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							How SmartAgro Connect Works
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Our platform streamlines the agricultural trade process, making it
							easier for farmers to sell their produce and for buyers to find
							quality crops in bulk.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Step 1 */}
						<div className="bg-white p-6 rounded-card shadow-card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FaLeaf className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-bold mb-2">Farmers List Products</h3>
							<p className="text-gray-600">
								Farmers create listings with detailed information about their
								crops, pricing, and availability.
							</p>
						</div>

						{/* Step 2 */}
						<div className="bg-white p-6 rounded-card shadow-card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<BsShieldCheck className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-bold mb-2">Agent Verification</h3>
							<p className="text-gray-600">
								Regional agents verify sellers and product listings to ensure
								quality and authenticity.
							</p>
						</div>

						{/* Step 3 */}
						<div className="bg-white p-6 rounded-card shadow-card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<BsCashCoin className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-bold mb-2">Seamless Transactions</h3>
							<p className="text-gray-600">
								Buyers place orders, make secure payments, and receive quality
								crops through our managed delivery system.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900">
							Featured Products
						</h2>
						<Link
							to="/products"
							className="text-primary-600 hover:text-primary-700 font-medium"
						>
							View All Products →
						</Link>
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{featuredProducts && featuredProducts.length > 0 ? (
								featuredProducts.map((product) => (
									<ProductCard key={product._id} product={product} />
								))
							) : (
								<div className="col-span-full text-center py-10 text-gray-500">
									No products available at the moment.
								</div>
							)}
						</div>
					)}
				</div>
			</section>

			{/* Platform Benefits */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Benefits of Our Platform
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							SmartAgro Connect provides numerous advantages for both farmers
							and buyers in the agricultural supply chain.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{/* Benefit 1 */}
						<div className="flex flex-col items-center">
							<div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4">
								<FaTractor className="w-7 h-7 text-primary-600" />
							</div>
							<h3 className="text-lg font-bold mb-2 text-center">
								Farmer Empowerment
							</h3>
							<p className="text-gray-600 text-center">
								Farmers get direct market access and fair prices for their
								produce.
							</p>
						</div>

						{/* Benefit 2 */}
						<div className="flex flex-col items-center">
							<div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4">
								<FaWarehouse className="w-7 h-7 text-primary-600" />
							</div>
							<h3 className="text-lg font-bold mb-2 text-center">
								Quality Assurance
							</h3>
							<p className="text-gray-600 text-center">
								All products are verified by regional agents for quality and
								authenticity.
							</p>
						</div>

						{/* Benefit 3 */}
						<div className="flex flex-col items-center">
							<div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4">
								<FaTruckMoving className="w-7 h-7 text-primary-600" />
							</div>
							<h3 className="text-lg font-bold mb-2 text-center">
								Efficient Delivery
							</h3>
							<p className="text-gray-600 text-center">
								Our structured delivery system ensures crops reach buyers in
								optimal condition.
							</p>
						</div>

						{/* Benefit 4 */}
						<div className="flex flex-col items-center">
							<div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4">
								<BsCashCoin className="w-7 h-7 text-primary-600" />
							</div>
							<h3 className="text-lg font-bold mb-2 text-center">
								Transparent Pricing
							</h3>
							<p className="text-gray-600 text-center">
								Clear pricing structure with no hidden fees for all
								transactions.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Join Our Platform Section */}
			{(currentRole === "consumer" || !currentUser?.FirebaseUser) && (
				<>
					<section className="py-16">
						<div className="container mx-auto px-4">
							<div className="text-center mb-16">
								<h2 className="text-3xl font-bold text-gray-900 mb-4">
									Join Our Platform
								</h2>
								<p className="text-gray-600 max-w-2xl mx-auto">
									Become part of Bangladesh's leading agricultural marketplace.
									Whether you're a farmer or an agent, we have opportunities for
									you.
								</p>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Seller Application Section */}
								<div className="bg-green-50 rounded-lg p-8 border border-green-200">
									<div className="flex items-center justify-center mb-6">
										<img
											src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
											alt="Harvesting crops"
											className="w-full h-48 object-cover rounded-lg shadow-md"
										/>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<FaTractor className="w-8 h-8 text-green-600" />
										</div>
										<h3 className="text-2xl font-bold text-gray-900 mb-3">
											Become a Seller
										</h3>
										<p className="text-gray-600 mb-6">
											Join as a verified seller and connect directly with
											wholesale buyers. Get fair prices for your crops without
											middlemen and grow your agricultural business.
										</p>
										<ul className="text-left text-gray-600 mb-6 space-y-2">
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-green-600 mr-2" />
												Direct access to wholesale buyers
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-green-600 mr-2" />
												Fair pricing and transparent transactions
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-green-600 mr-2" />
												Agent support for verification
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-green-600 mr-2" />
												Easy inventory management tools
											</li>
										</ul>
										<Link
											to="/seller-application"
											className="btn bg-green-600 hover:bg-green-700 text-white py-3 px-6 font-medium rounded-button w-full"
										>
											Apply as Seller
										</Link>
									</div>
								</div>

								{/* Agent Application Section */}
								<div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
									<div className="flex items-center justify-center mb-6">
										<img
											src="https://images.pexels.com/photos/221047/pexels-photo-221047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
											alt="Warehouse and logistics"
											className="w-full h-48 object-cover rounded-lg shadow-md"
										/>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<FaWarehouse className="w-8 h-8 text-blue-600" />
										</div>
										<h3 className="text-2xl font-bold text-gray-900 mb-3">
											Become an Agent
										</h3>
										<p className="text-gray-600 mb-6">
											Join as a regional agent and help connect farmers with
											buyers. Manage logistics, verify sellers, and earn
											commission on every successful transaction.
										</p>
										<ul className="text-left text-gray-600 mb-6 space-y-2">
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-blue-600 mr-2" />
												Earn commission on transactions
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-blue-600 mr-2" />
												Manage regional operations
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-blue-600 mr-2" />
												Build agricultural business network
											</li>
											<li className="flex items-center">
												<BsShieldCheck className="w-4 h-4 text-blue-600 mr-2" />
												Access to platform analytics
											</li>
										</ul>
										<Link
											to="/agent-application"
											className="btn bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 font-medium rounded-button w-full"
										>
											Apply as Agent
										</Link>
									</div>
								</div>
							</div>
						</div>
					</section>
				</>
			)}

			{/* Call to Action */}
			{!!currentUser?.FirebaseUser || (
				<>
					<section className="py-16 bg-secondary-50">
						<div className="container mx-auto px-4 text-center">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								Ready to Get Started?
							</h2>
							<p className="text-gray-600 max-w-2xl mx-auto mb-8">
								Join thousands of farmers and buyers already using SmartAgro
								Connect to streamline their agricultural trade.
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Link
									to="/register"
									className="btn btn-primary py-3 px-8 font-medium"
								>
									Create an Account
								</Link>
								<Link
									to="/about"
									className="btn btn-outline py-3 px-8 font-medium"
								>
									Learn More
								</Link>
							</div>
						</div>
					</section>
				</>
			)}
		</div>
	);
}
