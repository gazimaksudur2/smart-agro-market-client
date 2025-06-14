import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
	CardElement,
	Elements,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import useScrollToTop from "../../hooks/useScrollToTop";

// Load Stripe outside of component render to avoid recreating the Stripe object
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Regions and districts data
const regionsData = {
	Rajshahi: ["Rajshahi", "Bogra", "Pabna", "Natore"],
	Chittagong: ["Chittagong", "Comilla", "Cox's Bazar", "Bandarban"],
	Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail"],
	Khulna: ["Khulna", "Jessore", "Satkhira", "Bagerhat"],
	Barisal: ["Barisal", "Bhola", "Patuakhali", "Pirojpur"],
	Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
};

function CheckoutForm({
	advancePaymentAmount,
	deliveryDetails,
	items,
	onSuccess,
}) {
	const stripe = useStripe();
	const elements = useElements();
	const [error, setError] = useState(null);
	const [processing, setProcessing] = useState(false);
	const { user, currentUser } = useAuth();

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setProcessing(true);

		try {
			// Create payment intent on the server
			const { data } = await axios.post(
				`${import.meta.env.VITE_SERVER_API_URL}/create-payment-intent`,
				{
					amount: advancePaymentAmount, // amount in smallest currency unit (cents/paisa)
					userId: user?.uid || currentUser?.FirebaseUser?.uid,
					items: items.map((item) => ({
						id: item._id,
						title: item.title,
						quantity: item.quantity,
						price: item.price,
					})),
					deliveryDetails,
				}
			);

			// Confirm card payment
			const result = await stripe.confirmCardPayment(data.clientSecret, {
				payment_method: {
					card: elements.getElement(CardElement),
					billing_details: {
						name:
							user?.displayName ||
							currentUser?.FirebaseUser?.displayName ||
							"Customer",
						email: user?.email || currentUser?.FirebaseUser?.email,
					},
				},
			});

			if (result.error) {
				setError(result.error.message);
				toast.error(result.error.message);
			} else {
				if (result.paymentIntent.status === "succeeded") {
					// Create the order in database
					await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/orders`, {
						userId: user?.uid || currentUser?.FirebaseUser?.uid,
						items: items.map((item) => ({
							productId: item._id,
							title: item.title,
							quantity: item.quantity,
							price: item.price,
							totalPrice: item.price * item.quantity,
							sellerId: item.seller?.sellerId,
						})),
						deliveryDetails,
						totalAmount: deliveryDetails.totalAmount,
						advancePaymentAmount,
						paymentIntentId: result.paymentIntent.id,
						status: "pending",
					});

					toast.success("Payment successful! Your order has been placed.");
					onSuccess();
				}
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			setError(
				"An error occurred while processing your payment. Please try again."
			);
			toast.error("Payment failed. Please try again.");
		}

		setProcessing(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="p-4 border border-gray-300 rounded-md">
				<div className="mb-4">
					<h3 className="text-lg font-medium text-gray-900">
						Payment Information
					</h3>
					<p className="text-sm text-gray-600">
						All transactions are secure and encrypted. You'll be charged ৳
						{advancePaymentAmount.toLocaleString()} as advance payment.
					</p>
				</div>
				<div className="bg-white p-4 border border-gray-200 rounded-md">
					<CardElement
						options={{
							style: {
								base: {
									fontSize: "16px",
									color: "#424770",
									"::placeholder": {
										color: "#aab7c4",
									},
								},
								invalid: {
									color: "#9e2146",
								},
							},
						}}
					/>
				</div>
				{error && <div className="text-red-500 text-sm mt-2">{error}</div>}
			</div>

			<div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="btn btn-outline-primary px-6 py-2 order-2 sm:order-1"
				>
					<FaArrowLeft className="mr-2" /> Back
				</button>
				<button
					type="submit"
					disabled={!stripe || processing}
					className="btn btn-primary px-8 py-2 flex items-center justify-center order-1 sm:order-2"
				>
					{processing ? "Processing..." : "Pay & Place Order"}{" "}
					<FaLock className="ml-2" />
				</button>
			</div>
		</form>
	);
}

export default function CheckoutPage() {
	useScrollToTop();
	const {
		items: cartItems,
		subtotal: initialSubtotal,
		deliveryCharge: initialDeliveryCharge,
		totalAmount: initialTotal,
		updateItem,
		clearCartItems,
		loadCart,
		loading,
	} = useCart();
	const navigate = useNavigate();
	const location = useLocation();
	const { user, currentUser } = useAuth();

	const [selectedRegion, setSelectedRegion] = useState("");
	const [selectedDistrict, setSelectedDistrict] = useState("");
	const [selectedQuantities, setSelectedQuantities] = useState({});
	const [availableDistricts, setAvailableDistricts] = useState([]);
	const [deliveryAddress, setDeliveryAddress] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [orderNote, setOrderNote] = useState("");
	const [deliveryCharge, setDeliveryCharge] = useState(
		initialDeliveryCharge || 0
	);
	const [advancePaymentAmount, setAdvancePaymentAmount] = useState(0);
	const [items, setItems] = useState([]);

	// Load cart on component mount
	useEffect(() => {
		loadCart();
	}, []);

	// Handle buy now scenario
	useEffect(() => {
		const buyNow = location.state?.buyNow;
		const productId = location.state?.productId;

		if (!cartItems || cartItems.length === 0) {
			if (!buyNow) {
				navigate("/cart");
				return;
			}
		}

		if (buyNow && productId && cartItems) {
			const buyNowItems = cartItems.filter((item) => item._id === productId);
			setItems(buyNowItems);
		} else if (cartItems) {
			setItems(cartItems);
		}

		// Initialize selected quantities
		if (cartItems) {
			const quantities = {};
			cartItems.forEach((item) => {
				quantities[item._id] = item.quantity;
			});
			setSelectedQuantities(quantities);
		}
	}, [cartItems, location.state, navigate]);

	// Update delivery charge and advance payment when items or region changes
	useEffect(() => {
		if (items.length > 0) {
			const baseDeliveryCharge = items.length * 100;
			const regionMultiplier = selectedRegion === "Dhaka" ? 1 : 1.5;
			const finalDeliveryCharge = Math.round(
				baseDeliveryCharge * regionMultiplier
			);

			setDeliveryCharge(finalDeliveryCharge);
			setAdvancePaymentAmount(finalDeliveryCharge * 2);
		}
	}, [items, selectedRegion]);

	const handleRegionChange = (e) => {
		const region = e.target.value;
		setSelectedRegion(region);
		setSelectedDistrict("");
		setAvailableDistricts(regionsData[region] || []);
	};

	const handleDistrictChange = (e) => {
		setSelectedDistrict(e.target.value);
	};

	const handleQuantityChange = async (itemId, quantity) => {
		if (quantity < 1) return;

		setSelectedQuantities((prev) => ({
			...prev,
			[itemId]: quantity,
		}));

		// Update in cart
		try {
			await updateItem(itemId, quantity);
		} catch (error) {
			console.error("Error updating quantity:", error);
		}
	};

	const handleContinueToPayment = () => {
		// Validation
		if (!selectedRegion || !selectedDistrict) {
			toast.error("Please select your region and district");
			return;
		}

		if (!deliveryAddress.trim()) {
			toast.error("Please enter your delivery address");
			return;
		}

		if (!phoneNumber.trim()) {
			toast.error("Please enter your phone number");
			return;
		}

		// Phone number validation (basic)
		const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
		if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
			toast.error("Please enter a valid Bangladeshi phone number");
			return;
		}

		// Scroll to payment section
		document.getElementById("payment-section")?.scrollIntoView({
			behavior: "smooth",
		});
	};

	const handlePaymentSuccess = () => {
		// Clear cart after successful payment
		clearCartItems();

		// Navigate to success page or orders
		navigate("/dashboard/my-purchases", {
			state: { orderSuccess: true },
		});
	};

	const calculateFinalTotal = () => {
		const itemsSubtotal = items.reduce(
			(total, item) =>
				total + item.price * (selectedQuantities[item._id] || item.quantity),
			0
		);
		return itemsSubtotal + deliveryCharge;
	};

	// Show loading state
	if (loading && (!cartItems || cartItems.length === 0)) {
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Loading checkout...
					</h2>
				</div>
			</div>
		);
	}

	// Redirect if no items
	if (!items || items.length === 0) {
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center py-12">
					<h2 className="text-lg font-medium text-gray-900">
						No items to checkout
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						Add items to your cart before proceeding to checkout.
					</p>
					<button
						onClick={() => navigate("/products")}
						className="mt-6 btn btn-primary"
					>
						Browse Products
					</button>
				</div>
			</div>
		);
	}

	const deliveryDetails = {
		region: selectedRegion,
		district: selectedDistrict,
		address: deliveryAddress,
		phoneNumber,
		orderNote,
		deliveryCharge,
		totalAmount: calculateFinalTotal(),
	};

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
					Checkout
				</h1>
				<p className="mt-2 text-sm text-gray-600">
					Review your order and complete your purchase
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column - Order Details & Delivery Info */}
				<div className="space-y-6">
					{/* Order Summary */}
					<div className="bg-white shadow-sm rounded-lg p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Order Summary ({items.length} items)
						</h2>
						<div className="space-y-4">
							{items.map((item) => (
								<div key={item._id} className="flex items-center space-x-4">
									<img
										src={item.image}
										alt={item.title}
										className="w-16 h-16 object-cover rounded-md"
										onError={(e) => {
											e.target.src = "/placeholder-image.jpg";
										}}
									/>
									<div className="flex-1">
										<h3 className="text-sm font-medium text-gray-900">
											{item.title}
										</h3>
										<p className="text-sm text-gray-500">
											৳{item.price?.toLocaleString() || 0} per {item.unit}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() =>
												handleQuantityChange(
													item._id,
													(selectedQuantities[item._id] || item.quantity) - 1
												)
											}
											disabled={
												(selectedQuantities[item._id] || item.quantity) <= 1
											}
											className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
										>
											-
										</button>
										<span className="text-sm font-medium min-w-[2rem] text-center">
											{selectedQuantities[item._id] || item.quantity}
										</span>
										<button
											onClick={() =>
												handleQuantityChange(
													item._id,
													(selectedQuantities[item._id] || item.quantity) + 1
												)
											}
											className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
										>
											+
										</button>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium text-gray-900">
											৳
											{(
												(item.price || 0) *
												(selectedQuantities[item._id] || item.quantity)
											).toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Delivery Information */}
					<div className="bg-white shadow-sm rounded-lg p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Delivery Information
						</h2>
						<div className="space-y-4">
							{/* Region Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Region *
								</label>
								<select
									value={selectedRegion}
									onChange={handleRegionChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									required
								>
									<option value="">Select Region</option>
									{Object.keys(regionsData).map((region) => (
										<option key={region} value={region}>
											{region}
										</option>
									))}
								</select>
							</div>

							{/* District Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									District *
								</label>
								<select
									value={selectedDistrict}
									onChange={handleDistrictChange}
									disabled={!selectedRegion}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
									required
								>
									<option value="">Select District</option>
									{availableDistricts.map((district) => (
										<option key={district} value={district}>
											{district}
										</option>
									))}
								</select>
							</div>

							{/* Delivery Address */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Delivery Address *
								</label>
								<textarea
									value={deliveryAddress}
									onChange={(e) => setDeliveryAddress(e.target.value)}
									placeholder="Enter your complete delivery address"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									rows={3}
									required
								/>
							</div>

							{/* Phone Number */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number *
								</label>
								<input
									type="tel"
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value)}
									placeholder="01XXXXXXXXX"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									required
								/>
							</div>

							{/* Order Note */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Order Note (Optional)
								</label>
								<textarea
									value={orderNote}
									onChange={(e) => setOrderNote(e.target.value)}
									placeholder="Any special instructions for delivery"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									rows={2}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Payment Summary & Payment Form */}
				<div className="space-y-6">
					{/* Payment Summary */}
					<div className="bg-white shadow-sm rounded-lg p-6 sticky top-4">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Payment Summary
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-medium">
									৳
									{items
										.reduce(
											(total, item) =>
												total +
												item.price *
													(selectedQuantities[item._id] || item.quantity),
											0
										)
										.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Delivery Charge ({selectedRegion || "Select region"})
								</span>
								<span className="font-medium">
									৳{deliveryCharge.toLocaleString()}
								</span>
							</div>
							<div className="border-t pt-3">
								<div className="flex justify-between text-base font-medium">
									<span>Total</span>
									<span>৳{calculateFinalTotal().toLocaleString()}</span>
								</div>
							</div>
							<div className="border-t pt-3">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										Advance Payment (2x delivery)
									</span>
									<span className="font-medium text-primary-600">
										৳{advancePaymentAmount.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm mt-1">
									<span className="text-gray-600">Balance on Delivery</span>
									<span className="font-medium">
										৳
										{(
											calculateFinalTotal() - advancePaymentAmount
										).toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						{/* Continue to Payment Button */}
						{(!selectedRegion ||
							!selectedDistrict ||
							!deliveryAddress ||
							!phoneNumber) && (
							<button
								onClick={handleContinueToPayment}
								className="w-full mt-6 btn btn-primary"
							>
								Continue to Payment
							</button>
						)}
					</div>

					{/* Payment Form */}
					{selectedRegion &&
						selectedDistrict &&
						deliveryAddress &&
						phoneNumber && (
							<div
								id="payment-section"
								className="bg-white shadow-sm rounded-lg p-6"
							>
								<h2 className="text-lg font-medium text-gray-900 mb-4">
									Payment
								</h2>
								<Elements stripe={stripePromise}>
									<CheckoutForm
										advancePaymentAmount={advancePaymentAmount}
										deliveryDetails={deliveryDetails}
										items={items}
										onSuccess={handlePaymentSuccess}
									/>
								</Elements>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
