import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaStar,
	FaUser,
	FaPhone,
	FaEnvelope,
	FaBox,
	FaTruck,
	FaShieldAlt,
	FaTag,
	FaCartPlus,
	FaShoppingBag,
} from "react-icons/fa";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../hooks/useCart";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductDetails() {
	const [selectedImage, setSelectedImage] = useState(0);
	const [product, setProduct] = useState({});
	const { currentUser } = useAuth();
	const { addItemToCart } = useCart();
	const navigate = useNavigate();
	const params = useParams();

	// Fallback image in case product image is not available
	const fallbackImage =
		"https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

	const handleAddToCart = () => {
		const productToAdd = {
			_id: product?._id,
			title: product?.title,
			price: product?.pricePerUnit,
			unit: product?.unit,
			minimumOrderQuantity: product?.minimumOrderQuantity,
			image: product?.images?.[0] || fallbackImage,
			quantity: product?.minimumOrderQuantity,
			seller: product?.sellerInfo,
			region: product?.region,
			district: product?.district,
		};

		// Add to cart regardless of authentication status
		// The useCart hook will handle localStorage for unauthenticated users
		// and database sync for authenticated users
		addItemToCart(productToAdd, product?.minimumOrderQuantity);
	};

	const handleBuyNow = () => {
		const productToAdd = {
			_id: product?._id,
			title: product?.title,
			price: product?.pricePerUnit,
			unit: product?.unit,
			minimumOrderQuantity: product?.minimumOrderQuantity,
			image: product?.images?.[0] || fallbackImage,
			quantity: product?.minimumOrderQuantity,
			seller: product?.sellerInfo,
			region: product?.region,
			district: product?.district,
		};

		// Add to cart first (works for both authenticated and unauthenticated users)
		addItemToCart(productToAdd, product?.minimumOrderQuantity);

		// Check authentication only when proceeding to checkout
		if (!currentUser) {
			// Store checkout intent and redirect to login
			localStorage.setItem(
				"checkoutIntent",
				JSON.stringify({
					buyNow: true,
					productId: product?._id,
					timestamp: new Date().toISOString(),
				})
			);
			navigate("/login", { state: { from: `/product/${product?._id}` } });
			return;
		}

		// Navigate to checkout page for authenticated users
		navigate("/checkout", {
			state: {
				buyNow: true,
				productId: product?._id,
			},
		});
	};

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_SERVER_API_URL}/products/${params.id}`)
			.then((res) => {
				setProduct(res.data.product);
			})
			.catch((err) => {
				toast.error(err.message);
			});
	}, []);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Breadcrumb */}
			<div className="mb-6">
				<nav className="flex" aria-label="Breadcrumb">
					<ol className="inline-flex items-center space-x-1 md:space-x-3">
						<li className="inline-flex items-center">
							<Link to="/" className="text-gray-500 hover:text-primary-600">
								Home
							</Link>
						</li>
						<li>
							<div className="flex items-center">
								<span className="mx-2 text-gray-400">/</span>
								<Link
									to="/products"
									className="text-gray-500 hover:text-primary-600"
								>
									Products
								</Link>
							</div>
						</li>
						<li>
							<div className="flex items-center">
								<span className="mx-2 text-gray-400">/</span>
								<span className="text-gray-900">{product?.title}</span>
							</div>
						</li>
					</ol>
				</nav>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column - Images */}
				<div className="space-y-4">
					{/* Main Image */}
					<div className="relative rounded-lg overflow-hidden bg-gray-100">
						<img
							src={product?.images?.[selectedImage] || fallbackImage}
							alt={product?.title}
							className="w-full h-[400px] object-cover"
						/>
						<div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-md text-sm font-medium">
							{product?.quality || "A"} Grade
						</div>
					</div>

					{/* Thumbnail Images */}
					<div className="grid grid-cols-4 gap-4">
						{product?.images?.map((image, index) => (
							<button
								key={index}
								onClick={() => setSelectedImage(index)}
								className={`relative rounded-lg overflow-hidden h-24 ${
									selectedImage === index ? "ring-2 ring-primary-500" : ""
								}`}
							>
								<img
									src={image || fallbackImage}
									alt={`${product?.title} - ${index + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>
				</div>

				{/* Right Column - Product Info */}
				<div className="space-y-6">
					{/* Title and Rating */}
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{product?.title}
						</h1>
						<div className="flex items-center space-x-2">
							<div className="flex items-center">
								<FaStar className="text-yellow-400" />
								<span className="ml-1 font-medium">
									{product?.averageRating}
								</span>
							</div>
							<span className="text-gray-500">|</span>
							<span className="text-gray-500">Verified Seller</span>
						</div>
					</div>

					{/* Price and Stock */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<div className="flex justify-between items-center mb-4">
							<div>
								<span className="text-3xl font-bold text-gray-900">
									৳{product?.pricePerUnit?.toLocaleString()}
								</span>
								<span className="text-gray-500 ml-2">per {product?.unit}</span>
							</div>
							<div className="text-right">
								<div className="text-sm text-gray-500">Available Stock</div>
								<div
									className={`font-medium ${
										!product?.availableStock || product?.availableStock <= 0
											? "text-red-500"
											: product?.availableStock < 100
											? "text-yellow-500"
											: "text-green-600"
									}`}
								>
									{product?.availableStock
										? `${product?.availableStock} ${product?.unit}`
										: "Out of stock"}
								</div>
							</div>
						</div>
						<div className="text-sm text-gray-500">
							Minimum Order: {product?.minimumOrderQuantity} {product?.unit}
						</div>
					</div>

					{/* Location and Harvest Date */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center text-gray-600">
							<FaMapMarkerAlt className="mr-2" />
							<span>
								{product?.sellerInfo?.operationalArea?.district},{" "}
								{product?.sellerInfo?.operationalArea?.region}
							</span>
						</div>
						<div className="flex items-center text-gray-600">
							<FaCalendarAlt className="mr-2" />
							<span>
								Harvested on:{" "}
								{product?.harvestedOn &&
									format(new Date(product?.harvestedOn), "dd MMM yyyy")}
							</span>
						</div>
					</div>

					{/* Description */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							Description
						</h2>
						<p className="text-gray-600">{product?.description}</p>
					</div>

					{/* Tags */}
					{product?.tags && (
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
							<div className="flex flex-wrap gap-2">
								{product?.tags.map((tag, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
									>
										<FaTag className="mr-1" />
										{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Seller Information */}
					{product?.sellerInfo && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<h2 className="text-lg font-semibold text-gray-900 mb-3">
								Seller Information
							</h2>
							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<FaUser className="mr-2" />
									<span>{product?.sellerInfo.name}</span>
								</div>
								<div className="flex items-center text-gray-600">
									<FaPhone className="mr-2" />
									<span>{product?.sellerInfo.phone}</span>
								</div>
								<div className="flex items-center text-gray-600">
									<FaEnvelope className="mr-2" />
									<span>{product?.sellerInfo.email}</span>
								</div>
							</div>
						</div>
					)}

					{/* Delivery Information */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h2 className="text-lg font-semibold text-gray-900 mb-3">
							Delivery Information
						</h2>
						<div className="space-y-3">
							<div className="flex items-center text-gray-600">
								<FaBox className="mr-2" />
								<span>Delivery through verified agents</span>
							</div>
							<div className="flex items-center text-gray-600">
								<FaTruck className="mr-2" />
								<span>Platform managed delivery service</span>
							</div>
							<div className="flex items-center text-gray-600">
								<FaShieldAlt className="mr-2" />
								<span>Secure payment and delivery process</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="grid grid-cols-2 gap-4">
						<button
							onClick={handleAddToCart}
							className="btn btn-outline-primary py-3 flex justify-center items-center gap-2"
							disabled={
								!product?.availableStock || product?.availableStock <= 0
							}
						>
							<FaCartPlus />
							<span>Add to Cart</span>
						</button>
						<button
							onClick={handleBuyNow}
							className="btn btn-primary py-3 flex justify-center items-center gap-2"
							disabled={
								!product?.availableStock || product?.availableStock <= 0
							}
						>
							<FaShoppingBag />
							<span>Buy Now</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
