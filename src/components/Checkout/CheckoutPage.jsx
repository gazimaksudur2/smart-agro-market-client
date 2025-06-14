import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCreditCard, FiTruck } from "react-icons/fi";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";

const CheckoutPage = () => {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const user = currentUser?.FirebaseUser;
	const { items, loading, error, totalAmount, totalItems, loadCart } =
		useCart();

	const [orderData, setOrderData] = useState({
		shippingAddress: {
			fullName: "",
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

	useEffect(() => {
		loadCart();
	}, [loadCart]);

	// Redirect if cart is empty
	useEffect(() => {
		if (!loading && (!items || items.length === 0)) {
			navigate("/cart");
		}
	}, [items, loading, navigate]);

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
			// Here you would typically submit the order to your backend
			// For now, we'll simulate the process
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Navigate to success page
			navigate("/order-success", {
				state: {
					orderData,
					items,
					totalAmount,
					totalItems,
				},
			});
		} catch (error) {
			console.error("Error submitting order:", error);
			alert("Failed to submit order. Please try again.");
		} finally {
			setIsSubmitting(false);
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
							Add items to your cart before checkout.
						</p>
						<div className="mt-8">
							<button
								onClick={() => navigate("/products")}
								className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
							>
								<FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
								Start Shopping
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

					<form onSubmit={handleSubmit}>
						<div className="lg:grid lg:grid-cols-12 lg:gap-8">
							{/* Checkout Form */}
							<div className="lg:col-span-7">
								<div className="space-y-6">
									{/* Shipping Address */}
									<div className="bg-white shadow rounded-lg p-6">
										<div className="flex items-center mb-4">
											<FiTruck className="h-5 w-5 text-primary-600 mr-2" />
											<h2 className="text-lg font-medium text-gray-900">
												Shipping Address
											</h2>
										</div>
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<div className="sm:col-span-2">
												<label className="block text-sm font-medium text-gray-700">
													Full Name
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
											<div className="sm:col-span-2">
												<label className="block text-sm font-medium text-gray-700">
													Address
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													City
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													State
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													ZIP Code
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Phone
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
													className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
										</div>
									</div>

									{/* Payment Method */}
									<div className="bg-white shadow rounded-lg p-6">
										<div className="flex items-center mb-4">
											<FiCreditCard className="h-5 w-5 text-primary-600 mr-2" />
											<h2 className="text-lg font-medium text-gray-900">
												Payment Method
											</h2>
										</div>
										<div className="space-y-4">
											<div className="flex items-center">
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
													className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
												/>
												<label
													htmlFor="cod"
													className="ml-3 block text-sm font-medium text-gray-700"
												>
													Cash on Delivery
												</label>
											</div>
											<div className="flex items-center">
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
													className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
												/>
												<label
													htmlFor="online"
													className="ml-3 block text-sm font-medium text-gray-700"
												>
													Online Payment
												</label>
											</div>
										</div>
									</div>

									{/* Order Notes */}
									<div className="bg-white shadow rounded-lg p-6">
										<h2 className="text-lg font-medium text-gray-900 mb-4">
											Order Notes (Optional)
										</h2>
										<textarea
											rows={3}
											value={orderData.notes}
											onChange={(e) =>
												setOrderData((prev) => ({
													...prev,
													notes: e.target.value,
												}))
											}
											placeholder="Any special instructions for your order..."
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
										/>
									</div>
								</div>
							</div>

							{/* Order Summary */}
							<div className="lg:col-span-5 mt-8 lg:mt-0">
								<div className="bg-white shadow rounded-lg sticky top-8">
									<div className="px-4 py-5 sm:p-6">
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Order Summary
										</h3>

										{/* Items */}
										<div className="space-y-3 mb-4">
											{items.map((item) => (
												<div
													key={item.productId || item._id}
													className="flex justify-between"
												>
													<div className="flex-1">
														<h4 className="text-sm font-medium text-gray-900 truncate">
															{item.name}
														</h4>
														<p className="text-sm text-gray-500">
															Qty: {item.quantity} × ₹{item.price}
														</p>
													</div>
													<div className="text-sm font-medium text-gray-900">
														₹{(item.price * item.quantity).toFixed(2)}
													</div>
												</div>
											))}
										</div>

										{/* Totals */}
										<div className="border-t border-gray-200 pt-4 space-y-2">
											<div className="flex justify-between text-sm">
												<span>Subtotal ({totalItems} items)</span>
												<span>₹{totalAmount.toFixed(2)}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Shipping</span>
												<span>₹0.00</span>
											</div>
											<div className="flex justify-between text-sm">
												<span>Tax</span>
												<span>₹0.00</span>
											</div>
											<div className="border-t border-gray-200 pt-2">
												<div className="flex justify-between text-base font-medium">
													<span>Total</span>
													<span>₹{totalAmount.toFixed(2)}</span>
												</div>
											</div>
										</div>

										{/* Submit Button */}
										<div className="mt-6">
											<button
												type="submit"
												disabled={isSubmitting}
												className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{isSubmitting ? "Processing..." : "Place Order"}
											</button>
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
