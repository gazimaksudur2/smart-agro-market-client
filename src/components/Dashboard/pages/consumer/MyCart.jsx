import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import useCart from "../../../../hooks/useCart";

const MyCart = () => {
	const {
		items,
		loading,
		error,
		totalAmount,
		totalItems,
		updateItem,
		removeItem,
		clearCart,
		loadCart,
	} = useCart();

	useEffect(() => {
		loadCart();
	}, [loadCart]);

	const handleQuantityChange = async (productId, newQuantity) => {
		if (newQuantity < 1) return;
		await updateItem(productId, newQuantity);
	};

	const handleRemoveItem = async (productId) => {
		await removeItem(productId);
	};

	const handleClearCart = async () => {
		if (window.confirm("Are you sure you want to clear your cart?")) {
			await clearCart();
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600">Error loading cart: {error}</p>
				<button
					onClick={loadCart}
					className="mt-2 text-red-600 hover:text-red-800 underline"
				>
					Try again
				</button>
			</div>
		);
	}

	if (!items || items.length === 0) {
		return (
			<div className="text-center py-12">
				<FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-sm font-medium text-gray-900">
					Your cart is empty
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					Start shopping to add items to your cart.
				</p>
				<div className="mt-6">
					<Link
						to="/products"
						className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						<FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
						Start Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
				<button
					onClick={handleClearCart}
					className="text-red-600 hover:text-red-800 text-sm font-medium"
				>
					Clear Cart
				</button>
			</div>

			{/* Main Content - Parallel Columns */}
			<div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
				{/* Cart Items - Left Column */}
				<div className="lg:col-span-8">
					<div className="bg-white shadow rounded-lg">
						<div className="px-4 py-5 sm:p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Shopping Cart ({totalItems} items)
							</h2>
							<div className="space-y-4">
								{items.map((item) => (
									<div
										key={item.productId || item._id}
										className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
									>
										{/* Product Image */}
										<div className="flex-shrink-0">
											<img
												className="h-20 w-20 rounded-lg object-cover"
												src={item.image || "/placeholder-image.jpg"}
												alt={item.name}
												onError={(e) => {
													e.target.src = "/placeholder-image.jpg";
												}}
											/>
										</div>

										{/* Product Details */}
										<div className="flex-1 min-w-0">
											<h3 className="text-base font-medium text-gray-900 truncate">
												{item.name}
											</h3>
											<p className="text-sm text-gray-500">
												₹{item.price} per {item.unit || "unit"}
											</p>
											{item.category && (
												<p className="text-sm text-gray-400">{item.category}</p>
											)}
											{item.sellerName && (
												<p className="text-xs text-gray-400">
													Seller: {item.sellerName}
												</p>
											)}
										</div>

										{/* Quantity Controls */}
										<div className="flex items-center space-x-3">
											<button
												onClick={() =>
													handleQuantityChange(
														item.productId || item._id,
														item.quantity - 1
													)
												}
												disabled={item.quantity <= 1}
												className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<FiMinus className="h-4 w-4" />
											</button>
											<span className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg min-w-[3rem] text-center">
												{item.quantity}
											</span>
											<button
												onClick={() =>
													handleQuantityChange(
														item.productId || item._id,
														item.quantity + 1
													)
												}
												className="p-2 rounded-full hover:bg-gray-100"
											>
												<FiPlus className="h-4 w-4" />
											</button>
										</div>

										{/* Item Total */}
										<div className="text-right min-w-[80px]">
											<p className="text-lg font-medium text-gray-900">
												₹{(item.price * item.quantity).toFixed(2)}
											</p>
										</div>

										{/* Remove Button */}
										<button
											onClick={() =>
												handleRemoveItem(item.productId || item._id)
											}
											className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
											title="Remove item"
										>
											<FiTrash2 className="h-5 w-5" />
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Order Summary - Right Column */}
				<div className="lg:col-span-4">
					<div className="bg-white shadow rounded-lg sticky top-4">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Order Summary
							</h3>

							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										Subtotal ({totalItems} items)
									</span>
									<span className="font-medium">₹{totalAmount.toFixed(2)}</span>
								</div>

								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Shipping</span>
									<span className="font-medium text-green-600">Free</span>
								</div>

								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Tax</span>
									<span className="font-medium">₹0.00</span>
								</div>

								<div className="border-t border-gray-200 pt-3">
									<div className="flex justify-between">
										<span className="text-base font-medium text-gray-900">
											Total
										</span>
										<span className="text-xl font-bold text-gray-900">
											₹{totalAmount.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							{/* Checkout Button */}
							<div className="mt-6">
								<Link
									to="/checkout"
									className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center transition-colors"
								>
									Proceed to Checkout
								</Link>
							</div>

							{/* Continue Shopping */}
							<div className="mt-4">
								<Link
									to="/products"
									className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center transition-colors"
								>
									Continue Shopping
								</Link>
							</div>

							{/* Security Badge */}
							<div className="mt-6 flex items-center justify-center text-sm text-gray-500">
								<svg
									className="w-4 h-4 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clipRule="evenodd"
									/>
								</svg>
								Secure checkout
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyCart;
