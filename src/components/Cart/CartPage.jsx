import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FiShoppingCart,
	FiTrash2,
	FiPlus,
	FiMinus,
	FiUser,
} from "react-icons/fi";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";

const CartPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
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

	// Redirect logged-in users to dashboard cart
	useEffect(() => {
		if (currentUser) {
			navigate("/dashboard/my-cart", { replace: true });
		}
	}, [currentUser, navigate]);

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
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-600">Error loading cart: {error}</p>
						<button
							onClick={loadCart}
							className="mt-2 text-red-600 hover:text-red-800 underline"
						>
							Try again
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!items || items.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center py-12">
						<FiShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
						<h1 className="mt-4 text-3xl font-bold text-gray-900">
							Your cart is empty
						</h1>
						<p className="mt-2 text-lg text-gray-500">
							Start shopping to add items to your cart.
						</p>

						{/* Login Encouragement */}
						{!currentUser && (
							<div className="mt-6 max-w-md mx-auto">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center justify-center mb-2">
										<FiUser className="h-5 w-5 text-blue-600 mr-2" />
										<h3 className="text-sm font-medium text-blue-900">
											Better Cart Experience
										</h3>
									</div>
									<p className="text-sm text-blue-800 mb-3">
										Log in to save items, track orders, and get personalized
										recommendations!
									</p>
									<Link
										to="/login"
										className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
									>
										Sign In
									</Link>
								</div>
							</div>
						)}

						<div className="mt-8">
							<Link
								to="/products"
								className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
							>
								<FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
								Start Shopping
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
					<button
						onClick={handleClearCart}
						className="text-red-600 hover:text-red-800 text-sm font-medium"
					>
						Clear Cart
					</button>
				</div>

				<div className="lg:grid lg:grid-cols-12 lg:gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-8">
						<div className="bg-white shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<div className="space-y-6">
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
												<h3 className="text-lg font-medium text-gray-900 truncate">
													{item.name}
												</h3>
												<p className="text-sm text-gray-500">
													৳{item.price} per unit
												</p>
												{item.category && (
													<p className="text-sm text-gray-400">
														{item.category}
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
											<div className="text-right">
												<p className="text-lg font-medium text-gray-900">
													৳{(item.price * item.quantity).toFixed(2)}
												</p>
											</div>

											{/* Remove Button */}
											<button
												onClick={() =>
													handleRemoveItem(item.productId || item._id)
												}
												className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
											>
												<FiTrash2 className="h-5 w-5" />
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-4 mt-8 lg:mt-0">
						<div className="bg-white shadow rounded-lg sticky top-8">
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Order Summary
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											Subtotal ({totalItems} items)
										</span>
										<span>৳{totalAmount.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Shipping</span>
										<span>৳0.00</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Tax</span>
										<span>৳0.00</span>
									</div>
									<div className="border-t border-gray-200 pt-3">
										<div className="flex justify-between">
											<span className="text-base font-medium text-gray-900">
												Total
											</span>
											<span>৳{totalAmount.toFixed(2)}</span>
										</div>
									</div>
								</div>
								{/* Action Buttons */}
								<div className="space-y-4">
									{!currentUser && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
											<div className="flex items-center mb-2">
												<FiUser className="h-4 w-4 text-blue-600 mr-2" />
												<h3 className="text-sm font-medium text-blue-900">
													Enhanced Cart Features
												</h3>
											</div>
											<p className="text-xs text-blue-800 mb-3">
												Log in to save cart changes, track orders, and access
												advanced cart management!
											</p>
											<Link
												to="/login"
												className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
											>
												Sign In for Better Experience
											</Link>
										</div>
									)}

									<div className="mt-6">
										<Link
											to="/checkout"
											className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
										>
											Proceed to Checkout
										</Link>
									</div>
									<div className="mt-6 flex justify-center text-sm text-center text-gray-500">
										<p>
											or{" "}
											<Link
												to="/products"
												className="text-primary-600 font-medium hover:text-primary-500"
											>
												Continue Shopping
												<span aria-hidden="true"> &rarr;</span>
											</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartPage;
