import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
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
	FaCertificate,
	FaHistory,
	FaCheckCircle,
	FaInfoCircle,
} from "react-icons/fa";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import useCart from "../../hooks/useCart";
import axios from "axios";
import toast from "react-hot-toast";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function ProductDetails() {
	useScrollToTop();
	const [selectedImage, setSelectedImage] = useState(0);
	const [product, setProduct] = useState({});
	const [quantity, setQuantity] = useState(1);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);
	const { user, currentUser } = useAuth();
	const { addItem, addMultipleItems } = useCart();
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();

	// Fallback image in case product image is not available
	const fallbackImage =
		"https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

	const handleAddToCart = async () => {
		// Check if user is authenticated
		if (!user && !currentUser?.FirebaseUser) {
			toast.error("Please login to add items to cart");
			navigate("/login", {
				state: {
					from: location.pathname,
					action: "addToCart",
					productId: params.id,
					quantity: quantity,
				},
			});
			return;
		}

		try {
			setIsAddingToCart(true);

			const productToAdd = {
				_id: product?.id || product?._id,
				name: product?.title,
				price: product?.price || product?.pricePerUnit,
				image: product?.images?.[0] || fallbackImage,
				category: product?.category,
				sellerId: product?.seller?.id,
				sellerName: product?.seller?.name,
				unit: product?.unit,
				minimumOrderQuantity: product?.minimumOrderQuantity || 1,
			};

			await addItem(
				productToAdd,
				Math.max(quantity, product?.minimumOrderQuantity || 1)
			);
		} catch (error) {
			console.error("Error adding to cart:", error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleBuyNow = async () => {
		// Check if user is authenticated
		if (!user && !currentUser?.FirebaseUser) {
			toast.error("Please login to proceed with purchase");
			navigate("/login", {
				state: {
					from: location.pathname,
					action: "buyNow",
					productId: params.id,
					quantity: quantity,
				},
			});
			return;
		}

		try {
			setIsBuyingNow(true);

			const productToAdd = {
				_id: product?.id || product?._id,
				name: product?.title,
				price: product?.price || product?.pricePerUnit,
				image: product?.images?.[0] || fallbackImage,
				category: product?.category,
				sellerId: product?.seller?.id,
				sellerName: product?.seller?.name,
				unit: product?.unit,
				minimumOrderQuantity: product?.minimumOrderQuantity || 1,
			};

			// Add to cart first
			await addItem(
				productToAdd,
				Math.max(quantity, product?.minimumOrderQuantity || 1)
			);

			// Then navigate to checkout
			navigate("/checkout", {
				state: {
					buyNow: true,
					productId: product?.id || product?._id,
				},
			});
		} catch (error) {
			console.error("Error in buy now:", error);
		} finally {
			setIsBuyingNow(false);
		}
	};

	// Handle bulk add to cart (example for multiple items)
	const handleBulkAddToCart = async (items) => {
		if (!user && !currentUser?.FirebaseUser) {
			navigate("/login", {
				state: {
					from: location.pathname,
					action: "bulkAddToCart",
					items: items,
				},
			});
			return;
		}

		try {
			setIsAddingToCart(true);

			// Validate and format items
			const cartItems = items.map((item) => ({
				productId: item._id || item.id,
				name: item.title,
				price: item.price || item.pricePerUnit,
				quantity: item.quantity || item.minimumOrderQuantity || 1,
				image: item.images?.[0] || fallbackImage,
				category: item.category,
				sellerId: item.seller?.id,
				sellerName: item.seller?.name,
				unit: item.unit,
				minimumOrderQuantity: item.minimumOrderQuantity || 1,
			}));

			await addMultipleItems(cartItems);
		} catch (error) {
			console.error("Error adding multiple items to cart:", error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	// Set initial quantity based on minimum order quantity
	useEffect(() => {
		if (product?.minimumOrderQuantity) {
			setQuantity(product.minimumOrderQuantity);
		}
	}, [product?.minimumOrderQuantity]);

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_SERVER_API_URL}/products/${params.id}`)
			.then((res) => {
				// Check if response has success field and access product accordingly
				if (res.data?.success) {
					setProduct(res.data.product);
				} else {
					// Fallback for backward compatibility
					setProduct(res.data.product || res.data);
				}
			})
			.catch((err) => {
				console.error("Error fetching product:", err);
				toast.error("Failed to load product details");
			});
	}, [params.id]);

	// Helper function to get the correct field value with fallbacks
	const getPrice = () => product?.price || product?.pricePerUnit || 0;
	const getStock = () => product?.stock || product?.availableStock || 0;
	const getSeller = () => product?.seller || product?.sellerInfo || {};
	const getLocation = () =>
		product?.location || getSeller()?.operationalArea || {};
	const getHarvestDate = () =>
		product?.specifications?.harvestDate || product?.harvestedOn;
	const getProductId = () => product?.id || product?._id;

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
							src={product?.images?.[selectedImage]}
							alt={product?.title}
							className="w-full h-[400px] object-cover"
						/>
						<div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-md text-sm font-medium">
							{product?.quality || "A"} Grade
						</div>
						{product?.status === "approved" && (
							<div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center">
								<FaCheckCircle className="mr-1" />
								Verified
							</div>
						)}
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
									src={image}
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
									{product?.averageRating || getSeller()?.rating || 0}
								</span>
							</div>
							<span className="text-gray-500">|</span>
							<span className="text-gray-500">
								{getSeller()?.verificationStatus === "verified"
									? "Verified Seller"
									: "Seller"}
							</span>
						</div>
					</div>

					{/* Price and Stock */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<div className="flex justify-between items-center mb-4">
							<div>
								<span className="text-3xl font-bold text-gray-900">
									৳{getPrice().toLocaleString()}
								</span>
								<span className="text-gray-500 ml-2">per {product?.unit}</span>
							</div>
							<div className="text-right">
								<div className="text-sm text-gray-500">Available Stock</div>
								<div
									className={`font-medium ${
										!getStock() || getStock() <= 0
											? "text-red-500"
											: getStock() < 100
											? "text-yellow-500"
											: "text-green-600"
									}`}
								>
									{getStock()
										? `${getStock()} ${product?.unit}`
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
								{getLocation()?.district}, {getLocation()?.region}
							</span>
						</div>
						<div className="flex items-center text-gray-600">
							<FaCalendarAlt className="mr-2" />
							<span>
								Harvested on:{" "}
								{getHarvestDate() &&
									format(new Date(getHarvestDate()), "dd MMM yyyy")}
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

					{/* Specifications */}
					{product?.specifications && (
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
								<FaCertificate className="mr-2" />
								Specifications
							</h2>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{product.specifications.variety && (
										<div>
											<span className="text-sm font-medium text-gray-500">
												Variety:
											</span>
											<p className="text-gray-900">
												{product.specifications.variety}
											</p>
										</div>
									)}
									{product.specifications.grade && (
										<div>
											<span className="text-sm font-medium text-gray-500">
												Grade:
											</span>
											<p className="text-gray-900">
												{product.specifications.grade}
											</p>
										</div>
									)}
									{product.specifications.processingMethod && (
										<div>
											<span className="text-sm font-medium text-gray-500">
												Processing:
											</span>
											<p className="text-gray-900">
												{product.specifications.processingMethod}
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Tags */}
					{product?.tags && product.tags.length > 0 && (
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

					{/* Approval Information */}
					{product?.approvedBy && (
						<div className="bg-green-50 p-4 rounded-lg border border-green-200">
							<h2 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
								<FaCheckCircle className="mr-2" />
								Approval Information
							</h2>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-green-700">Approved by Agent:</span>
									<span className="text-green-900 font-medium">
										{product.approvedBy.agentId}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-green-700">Approved on:</span>
									<span className="text-green-900 font-medium">
										{format(
											new Date(product.approvedBy.approvedAt),
											"dd MMM yyyy, hh:mm a"
										)}
									</span>
								</div>
								{product?.approvalReason && (
									<div className="mt-2">
										<span className="text-green-700">Reason:</span>
										<p className="text-green-900 mt-1">
											{product.approvalReason}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Timeline Information */}
					{product?.timeline && (
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
								<FaHistory className="mr-2" />
								Timeline
							</h2>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-blue-700">Submitted:</span>
									<span className="text-blue-900 font-medium">
										{format(
											new Date(product.timeline.submittedAt),
											"dd MMM yyyy, hh:mm a"
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-blue-700">Last Updated:</span>
									<span className="text-blue-900 font-medium">
										{format(
											new Date(product.timeline.lastUpdated),
											"dd MMM yyyy, hh:mm a"
										)}
									</span>
								</div>
								{product.timeline.reviewDeadline && (
									<div className="flex justify-between">
										<span className="text-blue-700">Review Deadline:</span>
										<span className="text-blue-900 font-medium">
											{format(
												new Date(product.timeline.reviewDeadline),
												"dd MMM yyyy, hh:mm a"
											)}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Seller Information */}
					{getSeller() && Object.keys(getSeller()).length > 0 && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<h2 className="text-lg font-semibold text-gray-900 mb-3">
								Seller Information
							</h2>
							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<FaUser className="mr-2" />
									<span>{getSeller().name}</span>
									{getSeller().verificationStatus === "verified" && (
										<FaCheckCircle className="ml-2 text-green-500" />
									)}
								</div>
								<div className="flex items-center text-gray-600">
									<FaPhone className="mr-2" />
									<span>{getSeller().phone}</span>
								</div>
								<div className="flex items-center text-gray-600">
									<FaEnvelope className="mr-2" />
									<span>{getSeller().email}</span>
								</div>
								{getSeller().farmName && (
									<div className="flex items-center text-gray-600">
										<FaInfoCircle className="mr-2" />
										<span>Farm: {getSeller().farmName}</span>
									</div>
								)}
								<div className="flex items-center text-gray-600">
									<FaStar className="mr-2" />
									<span>Rating: {getSeller().rating || 0}/5</span>
								</div>
								<div className="flex items-center text-gray-600">
									<FaBox className="mr-2" />
									<span>Total Products: {getSeller().totalProducts || 0}</span>
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
							disabled={!getStock() || getStock() <= 0}
						>
							<FaCartPlus />
							<span>Add to Cart</span>
						</button>
						<button
							onClick={handleBuyNow}
							className="btn btn-primary py-3 flex justify-center items-center gap-2"
							disabled={!getStock() || getStock() <= 0}
						>
							<FaShoppingBag />
							<span>Buy Now</span>
						</button>
					</div>
				</div>
			</div>

			{/* Admin History Section */}
			{product?.adminHistory && product.adminHistory.length > 0 && (
				<div className="mt-8 bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900 flex items-center">
							<FaHistory className="mr-2" />
							Admin History
						</h2>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{product.adminHistory.map((entry, index) => (
								<div
									key={entry._id || index}
									className="border-l-4 border-blue-500 pl-4 py-2"
								>
									<div className="flex items-center justify-between mb-2">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												entry.action === "approved"
													? "bg-green-100 text-green-800"
													: entry.action === "rejected"
													? "bg-red-100 text-red-800"
													: entry.action === "suspended"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{entry.action.charAt(0).toUpperCase() +
												entry.action.slice(1)}
										</span>
										<span className="text-sm text-gray-500">
											{format(
												new Date(entry.timestamp),
												"dd MMM yyyy, hh:mm a"
											)}
										</span>
									</div>
									{entry.details?.reason && (
										<p className="text-sm text-gray-700 mb-1">
											<strong>Reason:</strong> {entry.details.reason}
										</p>
									)}
									{entry.details?.adminEmail && (
										<p className="text-sm text-gray-500">
											<strong>By:</strong> {entry.details.adminEmail}
										</p>
									)}
									{entry.details?.previousStatus && (
										<p className="text-sm text-gray-500">
											<strong>Previous Status:</strong>{" "}
											{entry.details.previousStatus}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
