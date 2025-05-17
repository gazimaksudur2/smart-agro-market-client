import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { FaLeaf, FaTractor, FaWarehouse, FaTruckMoving } from "react-icons/fa";
import { BsShieldCheck, BsCashCoin } from "react-icons/bs";
import ProductCard from "../components/Products/ProductCard";

export default function Home() {
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Fetch featured products
	const { data: featuredProducts, isLoading } = useQuery(
		"featuredProducts",
		async () => {
			try {
				const { data } = await axios.get(`${apiBaseUrl}/products?limit=4`);
				return data;
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
							src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
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

			{/* Call to Action */}
			<section className="py-16 bg-secondary-50">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto mb-8">
						Join thousands of farmers and buyers already using SmartAgro Connect
						to streamline their agricultural trade.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							to="/register"
							className="btn btn-primary py-3 px-8 font-medium"
						>
							Create an Account
						</Link>
						<Link to="/about" className="btn btn-outline py-3 px-8 font-medium">
							Learn More
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
