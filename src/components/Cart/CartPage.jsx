import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import {
	FaTrash,
	FaMinus,
	FaPlus,
	FaShoppingCart,
	FaArrowRight,
} from "react-icons/fa";
import useScrollToTop from "../../hooks/useScrollToTop";
import React from "react";

export default function CartPage() {
	useScrollToTop();
	const navigate = useNavigate();
	const {
		items: cartItems,
		totalItems,
		subtotal,
		deliveryCharge,
		totalAmount: total,
		updateItem: updateItemQuantity,
		removeItem: removeItemFromCart,
		clearCartItems,
		isAuthenticated,
		loading,
		loadCart,
	} = useCart();

	// Load cart on component mount
	React.useEffect(() => {
		loadCart();
	}, []);

	const handleQuantityChange = async (itemId, newQuantity, minQuantity) => {
		if (newQuantity < minQuantity) {
			return;
		}
		try {
			await updateItemQuantity(itemId, newQuantity);
		} catch (error) {
			console.error("Error updating quantity:", error);
		}
	};

	const handleCheckout = () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { from: "/checkout" } });
			return;
		}
		navigate("/checkout");
	};

	const handleRemoveItem = async (itemId) => {
		try {
			await removeItemFromCart(itemId);
		} catch (error) {
			console.error("Error removing item:", error);
		}
	};

	const handleClearCart = async () => {
		if (window.confirm("Are you sure you want to clear your cart?")) {
			try {
				await clearCartItems();
			} catch (error) {
				console.error("Error clearing cart:", error);
			}
		}
	};

	if (loading && (!cartItems || cartItems.length === 0)) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Loading your cart...
					</h2>
				</div>
			</div>
		);
	}

	if (!cartItems || cartItems.length === 0) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center py-12">
					<FaShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Your cart is empty
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						Start shopping to add items to your cart.
					</p>
					<button
						onClick={() => navigate("/products")}
						className="mt-6 btn btn-primary"
					>
						Continue Shopping
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
					Shopping Cart ({totalItems} items)
				</h1>
				<button
					onClick={handleClearCart}
					disabled={loading}
					className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
				>
					Clear Cart
				</button>
			</div>

			<div className="lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-8">
					<div className="bg-white shadow-sm rounded-lg overflow-hidden">
						<ul className="divide-y divide-gray-200">
							{cartItems.map((item) => (
								<li key={item._id} className="p-4 sm:p-6">
									<div className="flex items-start space-x-4">
										{/* Product Image */}
										<div className="flex-shrink-0">
											<img
												src={item.image}
												alt={item.title}
												className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
												onError={(e) => {
													e.target.src = "/placeholder-image.jpg";
												}}
											/>
										</div>

										{/* Product Details */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3 className="text-base font-medium text-gray-900 truncate">
														{item.title}
													</h3>
													<p className="text-sm text-gray-500">
														৳{item.price?.toLocaleString() || 0} per {item.unit}
													</p>
													<p className="text-xs text-gray-400">
														Min. order: {item.minimumOrderQuantity || 1}{" "}
														{item.unit}
													</p>
													{item.seller && (
														<p className="text-xs text-gray-400 mt-1">
															Seller: {item.seller.name || item.seller}
														</p>
													)}
												</div>

												{/* Remove Button */}
												<button
													onClick={() => handleRemoveItem(item._id)}
													disabled={loading}
													className="ml-4 text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
													aria-label="Remove item"
												>
													<FaTrash className="h-4 w-4" />
												</button>
											</div>

											{/* Quantity Controls */}
											<div className="mt-4 flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<button
														onClick={() =>
															handleQuantityChange(
																item._id,
																item.quantity - 1,
																item.minimumOrderQuantity || 1
															)
														}
														disabled={
															item.quantity <=
																(item.minimumOrderQuantity || 1) || loading
														}
														className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<FaMinus className="h-3 w-3" />
													</button>
													<span className="text-sm font-medium min-w-[3rem] text-center">
														{item.quantity} {item.unit}
													</span>
													<button
														onClick={() =>
															handleQuantityChange(
																item._id,
																item.quantity + 1,
																item.minimumOrderQuantity || 1
															)
														}
														disabled={loading}
														className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
													>
														<FaPlus className="h-3 w-3" />
													</button>
												</div>

												{/* Item Total */}
												<div className="text-right">
													<p className="text-sm font-medium text-gray-900">
														৳
														{(
															(item.price || 0) * item.quantity
														).toLocaleString()}
													</p>
												</div>
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Order Summary */}
				<div className="mt-8 lg:mt-0 lg:col-span-4">
					<div className="bg-white shadow-sm rounded-lg p-6 lg:sticky lg:top-8">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Order Summary
						</h2>

						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Subtotal ({totalItems} items)
								</span>
								<span className="font-medium">
									৳{subtotal?.toLocaleString() || 0}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Delivery Charge</span>
								<span className="font-medium">
									৳{deliveryCharge?.toLocaleString() || 0}
								</span>
							</div>
							<div className="border-t border-gray-200 pt-3">
								<div className="flex justify-between text-base font-medium">
									<span>Total</span>
									<span>৳{total?.toLocaleString() || 0}</span>
								</div>
							</div>
						</div>

						{/* Authentication Notice */}
						{!isAuthenticated && (
							<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
								<p className="text-sm text-yellow-800">
									<strong>Note:</strong> You'll need to login to proceed with
									checkout.
								</p>
							</div>
						)}

						{/* Checkout Button */}
						<button
							onClick={handleCheckout}
							disabled={loading || totalItems === 0}
							className="w-full mt-6 btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isAuthenticated ? "Proceed to Checkout" : "Login & Checkout"}
							<FaArrowRight className="ml-2 h-4 w-4" />
						</button>

						{/* Continue Shopping */}
						<button
							onClick={() => navigate("/products")}
							className="w-full mt-3 btn btn-outline-primary"
						>
							Continue Shopping
						</button>

						{/* Delivery Info */}
						<div className="mt-6 text-xs text-gray-500">
							<p className="mb-2">
								<strong>Delivery Information:</strong>
							</p>
							<ul className="space-y-1">
								<li>• Advance payment required (2x delivery charge)</li>
								<li>• Delivery handled by regional agents</li>
								<li>• Balance payment on delivery</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
