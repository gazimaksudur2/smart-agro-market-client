import React, { useState } from "react";
import { FiCreditCard, FiLock, FiAlertCircle, FiCheck } from "react-icons/fi";

const StripePaymentForm = ({
	totalAmount,
	onPaymentSuccess,
	onPaymentError,
	isLoading,
	setIsLoading,
}) => {
	const [formData, setFormData] = useState({
		cardNumber: "",
		expiry: "",
		cvc: "",
		name: "",
	});
	const [errors, setErrors] = useState({});

	const formatCardNumber = (value) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || "";
		const parts = [];
		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}
		if (parts.length) {
			return parts.join(" ");
		} else {
			return v;
		}
	};

	const formatExpiry = (value) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		if (v.length >= 2) {
			return v.substring(0, 2) + "/" + v.substring(2, 4);
		}
		return v;
	};

	const validateCard = () => {
		const newErrors = {};

		if (
			!formData.cardNumber ||
			formData.cardNumber.replace(/\s/g, "").length < 16
		) {
			newErrors.cardNumber = "Please enter a valid card number";
		}

		if (!formData.expiry || formData.expiry.length < 5) {
			newErrors.expiry = "Please enter a valid expiry date";
		}

		if (!formData.cvc || formData.cvc.length < 3) {
			newErrors.cvc = "Please enter a valid CVC";
		}

		if (!formData.name.trim()) {
			newErrors.name = "Please enter the cardholder name";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field, value) => {
		let formattedValue = value;

		if (field === "cardNumber") {
			formattedValue = formatCardNumber(value);
		} else if (field === "expiry") {
			formattedValue = formatExpiry(value);
		} else if (field === "cvc") {
			formattedValue = value.replace(/\D/g, "").slice(0, 4);
		}

		setFormData((prev) => ({
			...prev,
			[field]: formattedValue,
		}));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: "",
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateCard()) {
			return;
		}

		setIsLoading(true);

		try {
			// Simulate payment processing
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// In a real implementation, you would:
			// 1. Create payment intent on your backend
			// 2. Confirm payment with Stripe
			// 3. Handle the response

			// For demo purposes, we'll simulate success
			onPaymentSuccess({
				paymentMethod: "card",
				last4: formData.cardNumber.slice(-4),
				cardType: getCardType(formData.cardNumber),
				transactionId: "txn_" + Math.random().toString(36).substr(2, 9),
			});
		} catch (error) {
			onPaymentError("Payment failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const getCardType = (number) => {
		const num = number.replace(/\s/g, "");
		if (num.startsWith("4")) return "visa";
		if (num.startsWith("5") || num.startsWith("2")) return "mastercard";
		if (num.startsWith("3")) return "amex";
		return "card";
	};

	const cardType = getCardType(formData.cardNumber);

	return (
		<div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center">
					<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-md">
						<FiCreditCard className="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
						<p className="text-sm text-gray-600">
							Your information is protected with 256-bit SSL
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full">
						<FiLock className="h-4 w-4 mr-1" />
						<span className="text-xs font-semibold">SECURED</span>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Card Number */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-3">
						Card Number
					</label>
					<div className="relative">
						<input
							type="text"
							value={formData.cardNumber}
							onChange={(e) => handleInputChange("cardNumber", e.target.value)}
							placeholder="1234 5678 9012 3456"
							maxLength="19"
							className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${
								errors.cardNumber
									? "border-red-400 bg-red-50"
									: "border-gray-300 bg-white"
							}`}
						/>
						{cardType && formData.cardNumber.length > 0 && (
							<div className="absolute right-4 top-4">
								<div
									className={`px-3 py-1 rounded-lg text-xs font-bold ${
										cardType === "visa"
											? "bg-blue-600 text-white"
											: cardType === "mastercard"
											? "bg-red-600 text-white"
											: cardType === "amex"
											? "bg-green-600 text-white"
											: "bg-gray-600 text-white"
									}`}
								>
									{cardType.toUpperCase()}
								</div>
							</div>
						)}
					</div>
					{errors.cardNumber && (
						<p className="mt-2 text-sm text-red-600 flex items-center">
							<FiAlertCircle className="h-4 w-4 mr-1" />
							{errors.cardNumber}
						</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-6">
					{/* Expiry Date */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-3">
							Expiry Date
						</label>
						<input
							type="text"
							value={formData.expiry}
							onChange={(e) => handleInputChange("expiry", e.target.value)}
							placeholder="MM/YY"
							maxLength="5"
							className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${
								errors.expiry
									? "border-red-400 bg-red-50"
									: "border-gray-300 bg-white"
							}`}
						/>
						{errors.expiry && (
							<p className="mt-2 text-sm text-red-600 flex items-center">
								<FiAlertCircle className="h-4 w-4 mr-1" />
								{errors.expiry}
							</p>
						)}
					</div>

					{/* CVC */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-3">
							CVC
						</label>
						<input
							type="text"
							value={formData.cvc}
							onChange={(e) => handleInputChange("cvc", e.target.value)}
							placeholder="123"
							maxLength="4"
							className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${
								errors.cvc
									? "border-red-400 bg-red-50"
									: "border-gray-300 bg-white"
							}`}
						/>
						{errors.cvc && (
							<p className="mt-2 text-sm text-red-600 flex items-center">
								<FiAlertCircle className="h-4 w-4 mr-1" />
								{errors.cvc}
							</p>
						)}
					</div>
				</div>

				{/* Cardholder Name */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-3">
						Cardholder Name
					</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) => handleInputChange("name", e.target.value)}
						placeholder="John Doe"
						className={`w-full px-4 py-4 border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${
							errors.name
								? "border-red-400 bg-red-50"
								: "border-gray-300 bg-white"
						}`}
					/>
					{errors.name && (
						<p className="mt-2 text-sm text-red-600 flex items-center">
							<FiAlertCircle className="h-4 w-4 mr-1" />
							{errors.name}
						</p>
					)}
				</div>

				{/* Payment Summary */}
				<div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-inner">
					<div className="flex justify-between items-center">
						<span className="text-lg font-semibold text-gray-700">
							Total Amount:
						</span>
						<span className="text-2xl font-bold text-blue-600">
							৳{totalAmount.toFixed(2)}
						</span>
					</div>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isLoading}
					className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
							Processing Payment...
						</>
					) : (
						<>
							<FiCreditCard className="h-6 w-6 mr-3" />
							Pay ৳{totalAmount.toFixed(2)} Securely
						</>
					)}
				</button>
			</form>

			{/* Security Notices */}
			<div className="mt-6 space-y-3">
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-start">
						<FiCheck className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
						<div className="text-sm text-green-800">
							<p className="font-semibold">Your payment is secure</p>
							<p className="text-xs mt-1">
								We use industry-standard encryption to protect your payment
								information.
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
					<div className="flex items-center">
						<FiLock className="h-3 w-3 mr-1" />
						<span>256-bit SSL</span>
					</div>
					<span>•</span>
					<div className="flex items-center">
						<FiCheck className="h-3 w-3 mr-1" />
						<span>PCI DSS Compliant</span>
					</div>
					<span>•</span>
					<span>Powered by Stripe</span>
				</div>
			</div>
		</div>
	);
};

export default StripePaymentForm;
