import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	FiShoppingCart,
	FiCreditCard,
	FiTruck,
	FiMapPin,
	FiPhone,
	FiUser,
	FiMail,
	FiCheck,
	FiAlertCircle,
} from "react-icons/fi";
import useCart from "../../hooks/useCart";
import useOrders from "../../hooks/useOrders";
import { useAuth } from "../../contexts/AuthContext";
import StripePaymentForm from "./StripePaymentForm";

const CheckoutPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const user = currentUser?.FirebaseUser;
	const {
		items,
		loading,
		error,
		totalAmount,
		totalItems,
		loadCart,
		clearCart,
	} = useCart();
	const { placeOrder, loading: orderLoading } = useOrders();

	const [orderData, setOrderData] = useState({
		shippingAddress: {
			fullName: "",
			email: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			phone: "",
		},
		paymentMethod: "cod",
		notes: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [cartChecked, setCartChecked] = useState(false);
	const [showStripeForm, setShowStripeForm] = useState(false);

	useEffect(() => {
		loadCart();
	}, [loadCart]);

	useEffect(() => {
		if (!loading && cartChecked) {
			if ((!items || items.length === 0) && totalItems === 0) {
				setTimeout(() => {
					navigate(user ? "/dashboard/my-cart" : "/cart");
				}, 100);
			}
		}
	}, [items, loading, navigate, user, cartChecked, totalItems]);

	useEffect(() => {
		if (!loading) {
			setCartChecked(true);
		}
	}, [loading]);

	useEffect(() => {
		setShowStripeForm(orderData.paymentMethod === "online");
	}, [orderData.paymentMethod]);

	const handleInputChange = (section, field, value) => {
		setOrderData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (orderData.paymentMethod === "online") {
				// The Stripe form will handle payment processing
				return;
			} else {
				await handleCODOrder();
			}
		} catch (error) {
			console.error("Order submission error:", error);
			alert("Failed to submit order. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStripePayment = async (paymentData) => {
		try {
			setIsSubmitting(true);

			// Validate items before processing
			const validatedItems = items.map((item, index) => {
				if (!item.productId || !item.name || !item.price || !item.quantity) {
					throw new Error(`Invalid item data: ${item.name || "Unknown item"}`);
				}

				return {
					productId: item.productId,
					name: item.name,
					price: item.price,
					quantity: item.quantity,
					unit: item.unit || "piece",
					image: item.image || "",
					sellerId: item.sellerId || "unknown_seller",
					sellerName: item.sellerName || "Unknown Seller",
				};
			});

			// Place order with payment data
			const orderResult = await placeOrder({
				items: validatedItems,
				shippingAddress: orderData.shippingAddress,
				paymentMethod: orderData.paymentMethod,
				paymentDetails: paymentData,
				notes: orderData.notes,
			});

			if (orderResult.success) {
				// Clear cart after successful order
				await clearCart();

				// Navigate to success page
				navigateToSuccess(paymentData, orderResult.order);
			} else {
				throw new Error(orderResult.error || "Failed to place order");
			}
		} catch (error) {
			console.error("Payment processing error:", error);
			alert(`Payment failed: ${error.message || "Unknown error"}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCODOrder = async () => {
		try {
			// Validate items before processing
			const validatedItems = items.map((item, index) => {
				if (!item.productId || !item.name || !item.price || !item.quantity) {
					throw new Error(`Invalid item data: ${item.name || "Unknown item"}`);
				}

				return {
					productId: item.productId,
					name: item.name,
					price: item.price,
					quantity: item.quantity,
					unit: item.unit || "piece",
					image: item.image || "",
					sellerId: item.sellerId || "unknown_seller",
					sellerName: item.sellerName || "Unknown Seller",
				};
			});

			// Place order with COD
			const orderResult = await placeOrder({
				items: validatedItems,
				shippingAddress: orderData.shippingAddress,
				paymentMethod: orderData.paymentMethod,
				notes: orderData.notes,
			});

			if (orderResult.success) {
				// Clear cart after successful order
				await clearCart();

				// Navigate to success page
				navigateToSuccess(null, orderResult.order);
			} else {
				throw new Error(orderResult.error || "Failed to place order");
			}
		} catch (error) {
			console.error("COD order error:", error);
			throw error;
		}
	};

	const navigateToSuccess = (paymentData = null, orderInfo = null) => {
		navigate("/order-success", {
			state: {
				orderData,
				items,
				totalAmount,
				totalItems,
				paymentData,
				orderInfo, // Include order information
			},
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
							<p className="mt-4 text-gray-600">Loading your cart...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-md mx-auto">
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
							<FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-red-800 mb-2">
								Error Loading Cart
							</h3>
							<p className="text-red-600 mb-4">{error}</p>
							<button
								onClick={loadCart}
								className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
							>
								Try again
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!items || items.length === 0) {
		if (!loading && cartChecked) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center py-12">
							<div className="max-w-md mx-auto">
								<div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
									<FiShoppingCart className="h-12 w-12 text-gray-400" />
								</div>
								<h1 className="text-3xl font-bold text-gray-900 mb-4">
									Your cart is empty
								</h1>
								<p className="text-lg text-gray-500 mb-8">
									Add items to your cart before checkout.
								</p>
								<div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
									<button
										onClick={() => navigate("/products")}
										className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
									>
										<FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
										Start Shopping
									</button>
									<button
										onClick={() =>
											navigate(user ? "/dashboard/my-cart" : "/cart")
										}
										className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
									>
										View Cart
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-center items-center h-64">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
								<p className="mt-4 text-gray-600">Loading...</p>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							Secure Checkout
						</h1>
						<p className="text-lg text-gray-600">
							Complete your order with confidence
						</p>
						<div className="flex justify-center mt-4">
							<div className="flex items-center space-x-2 text-sm text-green-600">
								<FiCheck className="h-4 w-4" />
								<span>SSL Secured</span>
								<span className="text-gray-400">•</span>
								<span>256-bit Encryption</span>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="lg:grid lg:grid-cols-12 lg:gap-8">
							{/* Checkout Form - Left Column */}
							<div className="lg:col-span-7">
								<div className="space-y-8">
									{/* Shipping Information */}
									<div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
										<div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
											<div className="flex items-center">
												<div className="flex-shrink-0">
													<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
														<FiTruck className="h-5 w-5 text-green-600" />
													</div>
												</div>
												<div className="ml-4">
													<h2 className="text-xl font-bold text-gray-900">
														Shipping Information
													</h2>
													<p className="text-sm text-gray-600">
														Where should we deliver your order?
													</p>
												</div>
											</div>
										</div>
										<div className="px-6 py-6">
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
												<div className="sm:col-span-2">
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														<FiUser className="inline h-4 w-4 mr-2" />
														Full Name *
													</label>
													<input
														type="text"
														required
														value={orderData.shippingAddress.fullName}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"fullName",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your full name"
													/>
												</div>
												<div className="sm:col-span-2">
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														<FiMail className="inline h-4 w-4 mr-2" />
														Email Address *
													</label>
													<input
														type="email"
														required
														value={orderData.shippingAddress.email}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"email",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your email address"
													/>
												</div>
												<div className="sm:col-span-2">
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														<FiMapPin className="inline h-4 w-4 mr-2" />
														Street Address *
													</label>
													<input
														type="text"
														required
														value={orderData.shippingAddress.address}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"address",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your street address"
													/>
												</div>
												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														City *
													</label>
													<input
														type="text"
														required
														value={orderData.shippingAddress.city}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"city",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your city"
													/>
												</div>
												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														State/Province *
													</label>
													<input
														type="text"
														required
														value={orderData.shippingAddress.state}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"state",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your state"
													/>
												</div>
												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														ZIP/Postal Code *
													</label>
													<input
														type="text"
														required
														value={orderData.shippingAddress.zipCode}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"zipCode",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter ZIP code"
													/>
												</div>
												<div>
													<label className="block text-sm font-semibold text-gray-700 mb-2">
														<FiPhone className="inline h-4 w-4 mr-2" />
														Phone Number *
													</label>
													<input
														type="tel"
														required
														value={orderData.shippingAddress.phone}
														onChange={(e) =>
															handleInputChange(
																"shippingAddress",
																"phone",
																e.target.value
															)
														}
														className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
														placeholder="Enter your phone number"
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Payment Method */}
									<div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
										<div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
											<div className="flex items-center">
												<div className="flex-shrink-0">
													<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
														<FiCreditCard className="h-5 w-5 text-blue-600" />
													</div>
												</div>
												<div className="ml-4">
													<h2 className="text-xl font-bold text-gray-900">
														Payment Method
													</h2>
													<p className="text-sm text-gray-600">
														Choose how you'd like to pay
													</p>
												</div>
											</div>
										</div>
										<div className="px-6 py-6">
											<div className="space-y-4">
												<div
													className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
														orderData.paymentMethod === "cod"
															? "border-green-500 bg-green-50"
															: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
													}`}
												>
													<input
														id="cod"
														name="payment-method"
														type="radio"
														value="cod"
														checked={orderData.paymentMethod === "cod"}
														onChange={(e) =>
															setOrderData((prev) => ({
																...prev,
																paymentMethod: e.target.value,
															}))
														}
														className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
													/>
													<label htmlFor="cod" className="ml-3 cursor-pointer">
														<div className="flex items-center justify-between">
															<div>
																<div className="text-lg font-semibold text-gray-900">
																	Cash on Delivery
																</div>
																<div className="text-sm text-gray-600 mt-1">
																	Pay with cash when your order is delivered to
																	you
																</div>
															</div>
															<div className="flex items-center space-x-2">
																<span className="text-sm font-medium text-green-600">
																	Free
																</span>
																{orderData.paymentMethod === "cod" && (
																	<FiCheck className="h-5 w-5 text-green-600" />
																)}
															</div>
														</div>
													</label>
												</div>
												<div
													className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
														orderData.paymentMethod === "online"
															? "border-blue-500 bg-blue-50"
															: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
													}`}
												>
													<input
														id="online"
														name="payment-method"
														type="radio"
														value="online"
														checked={orderData.paymentMethod === "online"}
														onChange={(e) =>
															setOrderData((prev) => ({
																...prev,
																paymentMethod: e.target.value,
															}))
														}
														className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
													/>
													<label
														htmlFor="online"
														className="ml-3 cursor-pointer"
													>
														<div className="flex items-center justify-between">
															<div>
																<div className="text-lg font-semibold text-gray-900">
																	Online Payment
																</div>
																<div className="text-sm text-gray-600 mt-1">
																	Pay securely with your credit or debit card
																</div>
																<div className="mt-2 flex space-x-2">
																	<span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
																		Visa
																	</span>
																	<span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
																		Mastercard
																	</span>
																	<span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
																		Stripe
																	</span>
																</div>
															</div>
															<div className="flex flex-col items-end space-y-1">
																<span className="text-sm font-medium text-green-600">
																	Secure
																</span>
																{orderData.paymentMethod === "online" && (
																	<FiCheck className="h-5 w-5 text-blue-600" />
																)}
															</div>
														</div>
													</label>
												</div>
											</div>

											{/* Stripe Payment Form */}
											{showStripeForm && (
												<div className="mt-6">
													<StripePaymentForm
														totalAmount={totalAmount}
														onPaymentSuccess={handleStripePayment}
														isLoading={isSubmitting}
														setIsLoading={setIsSubmitting}
													/>
												</div>
											)}
										</div>
									</div>

									{/* Order Notes */}
									<div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
										<div className="px-6 py-5 border-b border-gray-100">
											<h2 className="text-xl font-bold text-gray-900">
												Order Notes
											</h2>
											<p className="text-sm text-gray-600">
												Any special instructions? (Optional)
											</p>
										</div>
										<div className="px-6 py-6">
											<textarea
												rows={4}
												value={orderData.notes}
												onChange={(e) =>
													setOrderData((prev) => ({
														...prev,
														notes: e.target.value,
													}))
												}
												placeholder="Any special instructions for your order..."
												className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Order Summary - Right Column */}
							<div className="lg:col-span-5 mt-8 lg:mt-0">
								<div className="bg-white shadow-lg rounded-xl border border-gray-100 sticky top-8 overflow-hidden">
									<div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
										<h3 className="text-xl font-bold text-gray-900">
											Order Summary
										</h3>
										<p className="text-sm text-gray-600">
											{totalItems} {totalItems === 1 ? "item" : "items"} in your
											cart
										</p>
									</div>

									<div className="px-6 py-6">
										{/* Items */}
										<div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
											{items.map((item) => (
												<div
													key={item.productId || item._id}
													className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
												>
													<div className="flex-shrink-0">
														<img
															src={item.image}
															alt={item.name}
															className="w-12 h-12 rounded-lg object-cover border border-gray-200"
														/>
													</div>
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-semibold text-gray-900 truncate">
															{item.name}
														</h4>
														<p className="text-sm text-gray-500">
															Qty: {item.quantity} × ৳{item.price}
														</p>
													</div>
													<div className="text-sm font-bold text-gray-900">
														৳{(item.price * item.quantity).toFixed(2)}
													</div>
												</div>
											))}
										</div>

										{/* Totals */}
										<div className="border-t border-gray-200 pt-4 space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Subtotal</span>
												<span className="font-semibold">
													৳{totalAmount.toFixed(2)}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Shipping</span>
												<span className="font-semibold text-green-600">
													Free
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Tax</span>
												<span className="font-semibold">৳0.00</span>
											</div>
											<div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-3">
												<span>Total</span>
												<span className="text-primary-600">
													৳{totalAmount.toFixed(2)}
												</span>
											</div>
										</div>

										{/* Submit Button */}
										{!showStripeForm && (
											<div className="mt-6">
												<button
													type="submit"
													disabled={isSubmitting}
													className="w-full bg-gradient-to-r from-primary-600 to-primary-700 border border-transparent rounded-xl shadow-lg py-4 px-6 text-lg font-bold text-white hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
												>
													{isSubmitting ? (
														<div className="flex items-center justify-center">
															<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
															Processing Order...
														</div>
													) : (
														<div className="flex items-center justify-center">
															<FiCheck className="h-5 w-5 mr-2" />
															Place Order
														</div>
													)}
												</button>
											</div>
										)}

										{/* Security Notice */}
										<div className="mt-6 flex items-center justify-center text-xs text-gray-500">
											<div className="flex items-center space-x-2">
												<svg
													className="w-4 h-4"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
														clipRule="evenodd"
													/>
												</svg>
												<span>Your information is secure and encrypted</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;
