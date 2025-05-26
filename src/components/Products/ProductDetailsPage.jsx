import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { FaShoppingCart, FaBolt, FaMinus, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const {
		addItemToCart,
		isInCart,
		getItemQuantity,
		isAuthenticated,
		proceedToCheckout,
	} = useCart();

	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);

	// Mock product data - replace with actual API call
	useEffect(() => {
		// Simulate API call
		setTimeout(() => {
			setProduct({
				_id: id,
				title: "Premium Basmati Rice",
				price: 120,
				unit: "kg",
				minimumOrderQuantity: 10,
				image:
					"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
				description: "High-quality basmati rice sourced directly from farmers.",
				seller: {
					sellerId: "seller123",
					name: "Farmer John",
					location: "Rajshahi",
				},
				category: "Grains",
				stock: 1000,
			});
			setLoading(false);
		}, 1000);
	}, [id]);

	const handleAddToCart = () => {
		if (!product) return;

		if (quantity < product.minimumOrderQuantity) {
			toast.error(
				`Minimum order quantity is ${product.minimumOrderQuantity} ${product.unit}`
			);
			return;
		}

		addItemToCart(product, quantity);
	};

	const handleBuyNow = () => {
		if (!product) return;

		if (!isAuthenticated) {
			toast.error("Please login to place an order");
			navigate("/login", { state: { from: `/products/${id}` } });
			return;
		}

		if (quantity < product.minimumOrderQuantity) {
			toast.error(
				`Minimum order quantity is ${product.minimumOrderQuantity} ${product.unit}`
			);
			return;
		}

		// Add to cart first, then navigate to checkout
		addItemToCart(product, quantity);
		navigate("/checkout", {
			state: {
				buyNow: true,
				productId: product._id,
			},
		});
	};

	const incrementQuantity = () => {
		setQuantity((prev) => prev + 1);
	};

	const decrementQuantity = () => {
		setQuantity((prev) =>
			Math.max(prev - 1, product?.minimumOrderQuantity || 1)
		);
	};

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="bg-gray-300 aspect-square rounded-lg"></div>
						<div className="space-y-4">
							<div className="h-8 bg-gray-300 rounded"></div>
							<div className="h-4 bg-gray-300 rounded w-3/4"></div>
							<div className="h-4 bg-gray-300 rounded w-1/2"></div>
							<div className="h-20 bg-gray-300 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Product not found
					</h1>
					<button
						onClick={() => navigate("/products")}
						className="mt-4 btn btn-primary"
					>
						Back to Products
					</button>
				</div>
			</div>
		);
	}

	const currentCartQuantity = getItemQuantity(product._id);
	const productInCart = isInCart(product._id);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Image */}
				<div className="aspect-square">
					<img
						src={product.image}
						alt={product.title}
						className="w-full h-full object-cover rounded-lg shadow-lg"
					/>
				</div>

				{/* Product Details */}
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							{product.title}
						</h1>
						<p className="text-xl text-primary-600 font-semibold mt-2">
							৳{product.price.toLocaleString()} per {product.unit}
						</p>
						<p className="text-sm text-gray-600 mt-1">
							Minimum order: {product.minimumOrderQuantity} {product.unit}
						</p>
					</div>

					{/* Seller Info */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="font-medium text-gray-900">Seller Information</h3>
						<p className="text-sm text-gray-600">{product.seller.name}</p>
						<p className="text-sm text-gray-600">{product.seller.location}</p>
					</div>

					{/* Product Description */}
					<div>
						<h3 className="font-medium text-gray-900 mb-2">Description</h3>
						<p className="text-gray-600">{product.description}</p>
					</div>

					{/* Stock Status */}
					<div>
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
								product.stock > 0
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{product.stock > 0
								? `${product.stock} ${product.unit} in stock`
								: "Out of stock"}
						</span>
					</div>

					{/* Quantity Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Quantity ({product.unit})
						</label>
						<div className="flex items-center space-x-3">
							<button
								onClick={decrementQuantity}
								className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
								disabled={quantity <= product.minimumOrderQuantity}
							>
								<FaMinus className="h-4 w-4" />
							</button>
							<input
								type="number"
								min={product.minimumOrderQuantity}
								value={quantity}
								onChange={(e) =>
									setQuantity(
										Math.max(
											parseInt(e.target.value) || product.minimumOrderQuantity,
											product.minimumOrderQuantity
										)
									)
								}
								className="w-20 text-center border border-gray-300 rounded-md py-2"
							/>
							<button
								onClick={incrementQuantity}
								className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
							>
								<FaPlus className="h-4 w-4" />
							</button>
						</div>
						<p className="text-sm text-gray-500 mt-1">
							Total: ৳{(quantity * product.price).toLocaleString()}
						</p>
					</div>

					{/* Cart Status */}
					{productInCart && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p className="text-sm text-blue-800">
								This item is already in your cart ({currentCartQuantity}{" "}
								{product.unit})
							</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="space-y-3">
						<button
							onClick={handleAddToCart}
							disabled={product.stock === 0}
							className="w-full btn btn-outline-primary flex items-center justify-center"
						>
							<FaShoppingCart className="mr-2" />
							Add to Cart
						</button>

						<button
							onClick={handleBuyNow}
							disabled={product.stock === 0}
							className="w-full btn btn-primary flex items-center justify-center"
						>
							<FaBolt className="mr-2" />
							Buy Now
						</button>
					</div>

					{/* Authentication Notice */}
					{!isAuthenticated && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
							<p className="text-sm text-yellow-800">
								<strong>Note:</strong> You can add items to cart without logging
								in, but you'll need to login to proceed with checkout.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
