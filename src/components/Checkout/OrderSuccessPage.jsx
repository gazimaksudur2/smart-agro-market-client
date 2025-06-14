import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	FaCheckCircle,
	FaBox,
	FaHome,
	FaFileAlt,
	FaCreditCard,
	FaMoneyBill,
} from "react-icons/fa";
import {
	FiTruck,
	FiMail,
	FiMapPin,
	FiShoppingBag,
	FiCheck,
	FiPackage,
} from "react-icons/fi";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function OrderSuccessPage() {
	useScrollToTop();
	const location = useLocation();
	const navigate = useNavigate();
	const orderDetails = location.state;

	// If no order details, redirect to products
	if (!orderDetails) {
		navigate("/products");
		return null;
	}

	const { orderData, items, totalAmount, totalItems, paymentData } =
		orderDetails;

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
					{/* Success Header */}
					<div className="text-center py-8 px-6 bg-gradient-to-r from-green-500 to-blue-600">
						<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
							<FaCheckCircle className="h-12 w-12 text-green-500" />
						</div>
						<h1 className="text-4xl font-bold text-white mb-2">
							Order Placed Successfully!
						</h1>
						<p className="text-lg text-green-100">
							Thank you for your order. We've received your payment and your
							order is now being processed.
						</p>
					</div>

					<div className="p-8">
						{/* Order Details Section */}
						<div className="mb-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Order Details
							</h2>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
								{/* Shipping Information */}
								<div className="bg-gray-50 rounded-lg p-6">
									<div className="flex items-center mb-4">
										<FiTruck className="h-5 w-5 text-blue-600 mr-2" />
										<h3 className="text-lg font-semibold text-gray-900">
											Shipping Information
										</h3>
									</div>
									<div className="space-y-2">
										<p className="font-medium text-gray-900">
											{orderData?.shippingAddress?.fullName}
										</p>
										<div className="flex items-center text-gray-600">
											<FiMail className="h-4 w-4 mr-2" />
											<span>{orderData?.shippingAddress?.email}</span>
										</div>
										<p className="text-gray-600">
											{orderData?.shippingAddress?.phone}
										</p>
										<div className="flex items-start text-gray-600">
											<FiMapPin className="h-4 w-4 mr-2 mt-1" />
											<div>
												<p>{orderData?.shippingAddress?.address}</p>
												<p>
													{orderData?.shippingAddress?.city},{" "}
													{orderData?.shippingAddress?.state}{" "}
													{orderData?.shippingAddress?.zipCode}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Payment Information */}
								<div className="bg-gray-50 rounded-lg p-6">
									<div className="flex items-center mb-4">
										{orderData?.paymentMethod === "cod" ? (
											<FaMoneyBill className="h-5 w-5 text-green-600 mr-2" />
										) : (
											<FaCreditCard className="h-5 w-5 text-blue-600 mr-2" />
										)}
										<h3 className="text-lg font-semibold text-gray-900">
											Payment Method
										</h3>
									</div>

									{orderData?.paymentMethod === "cod" ? (
										<div className="flex items-center">
											<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
												<FiPackage className="h-4 w-4 text-green-600" />
											</div>
											<div>
												<p className="font-medium text-gray-900">
													Cash on Delivery
												</p>
												<p className="text-sm text-gray-600">
													Pay when you receive your order
												</p>
											</div>
										</div>
									) : (
										<div className="flex items-center">
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
												<FaCreditCard className="h-4 w-4 text-blue-600" />
											</div>
											<div>
												<p className="font-medium text-gray-900">
													Card Payment
												</p>
												{paymentData && (
													<div className="text-sm text-gray-600">
														<p>
															**** **** **** {paymentData.last4} (
															{paymentData.cardType?.toUpperCase()})
														</p>
														{paymentData.transactionId && (
															<p className="text-xs text-gray-500 mt-1">
																Transaction ID: {paymentData.transactionId}
															</p>
														)}
													</div>
												)}
											</div>
										</div>
									)}

									<div className="mt-4 pt-4 border-t border-gray-200">
										<div className="flex justify-between items-center text-lg font-bold">
											<span>Total Amount:</span>
											<span className="text-green-600">
												৳{totalAmount?.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Order Items */}
							{items && items.length > 0 && (
								<div className="mb-8">
									<div className="flex items-center mb-4">
										<FiShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
										<h3 className="text-lg font-semibold text-gray-900">
											Items Ordered ({totalItems}{" "}
											{totalItems === 1 ? "item" : "items"})
										</h3>
									</div>
									<div className="bg-gray-50 rounded-lg p-4">
										<div className="space-y-3">
											{items.map((item, index) => (
												<div
													key={index}
													className="flex items-center justify-between py-2"
												>
													<div className="flex items-center space-x-3">
														<img
															src={item.image}
															alt={item.name}
															className="w-12 h-12 rounded-lg object-cover border border-gray-200"
														/>
														<div>
															<p className="font-medium text-gray-900">
																{item.name}
															</p>
															<p className="text-sm text-gray-600">
																Qty: {item.quantity} × ৳{item.price}
															</p>
														</div>
													</div>
													<p className="font-semibold text-gray-900">
														৳{(item.price * item.quantity).toFixed(2)}
													</p>
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Special Instructions */}
							{orderData?.notes && (
								<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
									<h4 className="font-medium text-gray-900 mb-2">
										Special Instructions
									</h4>
									<p className="text-gray-700">{orderData.notes}</p>
								</div>
							)}
						</div>

						{/* What happens next section */}
						<div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								What happens next?
							</h2>
							<ol className="space-y-4">
								<li className="flex items-start">
									<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-3 text-sm">
										1
									</span>
									<div>
										<p className="text-gray-700 font-medium">
											Your order will be verified by the seller.
										</p>
										<p className="text-sm text-gray-500">
											The seller will confirm availability and prepare your
											items.
										</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-3 text-sm">
										2
									</span>
									<div>
										<p className="text-gray-700 font-medium">
											Products will be transported to your region's agent.
										</p>
										<p className="text-sm text-gray-500">
											Our logistics team will handle the inter-regional
											transportation.
										</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-3 text-sm">
										3
									</span>
									<div>
										<p className="text-gray-700 font-medium">
											Your agent will notify you when the order arrives.
										</p>
										<p className="text-sm text-gray-500">
											You'll receive a notification when your order reaches your
											local agent's warehouse.
										</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-3 text-sm">
										4
									</span>
									<div>
										<p className="text-gray-700 font-medium">
											Collect your order from your regional agent.
										</p>
										<p className="text-sm text-gray-500">
											{orderData?.paymentMethod === "cod"
												? "Pay the remaining balance when you collect your order."
												: "Your payment is already processed. Simply collect your order."}
										</p>
									</div>
								</li>
							</ol>
						</div>

						{/* Action Buttons */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Link
								to="/dashboard/my-orders"
								className="flex items-center justify-center px-6 py-3 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
							>
								<FaFileAlt className="mr-2" />
								<span>View My Orders</span>
							</Link>
							<Link
								to="/products"
								className="flex items-center justify-center px-6 py-3 border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
							>
								<FaBox className="mr-2" />
								<span>Continue Shopping</span>
							</Link>
							<Link
								to="/"
								className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
							>
								<FaHome className="mr-2" />
								<span>Return to Home</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
