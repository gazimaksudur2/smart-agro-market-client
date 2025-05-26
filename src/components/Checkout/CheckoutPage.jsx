import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
	selectCartItems,
	selectCartSubtotal,
	selectCartDeliveryCharge,
	selectCartTotal,
	updateDeliveryCharge,
	updateCartItemQuantity,
	clearCart,
} from "../../redux/slices/cartSlice";
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
	const { currentUser } = useAuth();

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
					userId: currentUser.FirebaseUser.uid,
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
						name: currentUser.FirebaseUser.displayName || "Customer",
						email: currentUser.FirebaseUser.email,
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
						userId: currentUser.FirebaseUser.uid,
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
	const cartItems = useSelector(selectCartItems);
	const subtotal = useSelector(selectCartSubtotal);
	const initialDeliveryCharge = useSelector(selectCartDeliveryCharge);
	const total = useSelector(selectCartTotal);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { currentUser } = useAuth();

	const [selectedRegion, setSelectedRegion] = useState("");
	const [selectedDistrict, setSelectedDistrict] = useState("");
	const [selectedQuantities, setSelectedQuantities] = useState({});
	const [availableDistricts, setAvailableDistricts] = useState([]);
	const [deliveryAddress, setDeliveryAddress] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [orderNote, setOrderNote] = useState("");
	const [deliveryCharge, setDeliveryCharge] = useState(initialDeliveryCharge);
	const [advancePaymentAmount, setAdvancePaymentAmount] = useState(
		initialDeliveryCharge * 2
	);
	const [showPayment, setShowPayment] = useState(false);
	const [items, setItems] = useState([]);

	// For "Buy Now" flow
	const buyNow = location.state?.buyNow || false;
	const productId = location.state?.productId || null;

	useEffect(() => {
		if (cartItems.length === 0 && !buyNow) {
			toast.error("Your cart is empty");
			navigate("/cart");
			return;
		}

		// If in "Buy Now" mode, filter to just the selected product
		if (buyNow && productId) {
			const buyNowItems = cartItems.filter((item) => item._id === productId);
			setItems(buyNowItems);
		} else {
			setItems(cartItems);
		}

		// Initialize selected quantities
		const initialQuantities = {};
		cartItems.forEach((item) => {
			initialQuantities[item._id] = item.quantity;
		});
		setSelectedQuantities(initialQuantities);
	}, [cartItems, buyNow, productId]);

	// Update delivery charge when region/district changes
	useEffect(() => {
		if (selectedRegion && selectedDistrict) {
			// Recalculate delivery charge based on location
			let baseCharge = items.length * 100; // Base price

			if (selectedRegion === "Chittagong") {
				baseCharge += 200;
			} else if (selectedRegion === "Rajshahi") {
				baseCharge += 100;
			} else if (selectedRegion === "Dhaka") {
				baseCharge += 150;
			} else {
				baseCharge += 300; // Other regions
			}

			setDeliveryCharge(baseCharge);
			setAdvancePaymentAmount(baseCharge * 2); // 2x delivery charge as advance

			// Update in Redux
			dispatch(
				updateDeliveryCharge({
					region: selectedRegion,
					district: selectedDistrict,
				})
			);
		}
	}, [selectedRegion, selectedDistrict, items]);

	const handleRegionChange = (e) => {
		const region = e.target.value;
		setSelectedRegion(region);
		setSelectedDistrict("");
		setAvailableDistricts(regionsData[region] || []);
	};

	const handleDistrictChange = (e) => {
		setSelectedDistrict(e.target.value);
	};

	const handleQuantityChange = (itemId, quantity) => {
		const item = items.find((item) => item._id === itemId);
		if (item && quantity >= item.minimumOrderQuantity) {
			setSelectedQuantities({ ...selectedQuantities, [itemId]: quantity });
			dispatch(updateCartItemQuantity({ _id: itemId, quantity }));
		} else {
			toast.error(
				`Minimum order quantity is ${item.minimumOrderQuantity} ${item.unit}`
			);
		}
	};

	const handleContinueToPayment = () => {
		// Validate all fields
		if (!selectedRegion) {
			toast.error("Please select a region");
			return;
		}

		if (!selectedDistrict) {
			toast.error("Please select a district");
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

		setShowPayment(true);
	};

	const handlePaymentSuccess = () => {
		// Clear cart (or just the bought item if "Buy Now")
		if (buyNow) {
			// Just remove the specific product
			dispatch(updateCartItemQuantity({ _id: productId, quantity: 0 }));
		} else {
			dispatch(clearCart());
		}

		// Navigate to order success page
		navigate("/order-success");
	};

	// Calculate the final total based on updated quantities and delivery charge
	const calculateFinalTotal = () => {
		const itemsTotal = items.reduce(
			(total, item) =>
				total + item.price * (selectedQuantities[item._id] || item.quantity),
			0
		);
		return itemsTotal + deliveryCharge;
	};

	const finalTotal = calculateFinalTotal();

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
				Checkout
			</h1>

			<div className="lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Left Column - Customer Information */}
				<div className="lg:col-span-8">
					{!showPayment ? (
						<div className="space-y-6 md:space-y-8">
							{/* Delivery Location */}
							<div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
								<h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
									Delivery Location
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="region"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Region
										</label>
										<select
											id="region"
											value={selectedRegion}
											onChange={handleRegionChange}
											className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										>
											<option value="">Select a Region</option>
											{Object.keys(regionsData).map((region) => (
												<option key={region} value={region}>
													{region}
												</option>
											))}
										</select>
									</div>
									<div>
										<label
											htmlFor="district"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											District
										</label>
										<select
											id="district"
											value={selectedDistrict}
											onChange={handleDistrictChange}
											className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
											disabled={!selectedRegion}
										>
											<option value="">Select a District</option>
											{availableDistricts.map((district) => (
												<option key={district} value={district}>
													{district}
												</option>
											))}
										</select>
									</div>
								</div>
								<div className="mt-4">
									<label
										htmlFor="address"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Detailed Address
									</label>
									<textarea
										id="address"
										value={deliveryAddress}
										onChange={(e) => setDeliveryAddress(e.target.value)}
										className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										rows="3"
										placeholder="Enter your full address including postal code"
									></textarea>
								</div>
								<div className="mt-4">
									<label
										htmlFor="phone"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Phone Number
									</label>
									<input
										id="phone"
										type="tel"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										placeholder="Enter your phone number"
									/>
								</div>
							</div>

							{/* Order Items */}
							<div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
								<h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
									Order Items
								</h2>
								<div className="space-y-4">
									{items.map((item) => (
										<div
											key={item._id}
											className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
										>
											<div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
												<img
													src={item.image}
													alt={item.title}
													className="w-16 h-16 object-cover rounded-md"
												/>
												<div className="ml-4">
													<h3 className="text-base font-medium text-gray-900">
														{item.title}
													</h3>
													<p className="text-sm text-gray-500">
														৳{item.price.toLocaleString()} per {item.unit}
													</p>
													<p className="text-xs text-gray-500">
														Min. Order: {item.minimumOrderQuantity} {item.unit}
													</p>
												</div>
											</div>
											<div className="flex items-center justify-between w-full sm:w-auto">
												<label
													htmlFor={`quantity-${item._id}`}
													className="sm:sr-only text-sm mr-2 sm:mr-0"
												>
													Quantity:
												</label>
												<div className="flex items-center border border-gray-300 rounded-md">
													<button
														type="button"
														onClick={() =>
															handleQuantityChange(
																item._id,
																Math.max(
																	(selectedQuantities[item._id] ||
																		item.quantity) - 1,
																	item.minimumOrderQuantity
																)
															)
														}
														className="px-3 py-1 text-gray-600 hover:text-gray-700"
														aria-label="Decrease quantity"
													>
														-
													</button>
													<input
														id={`quantity-${item._id}`}
														type="number"
														min={item.minimumOrderQuantity}
														value={
															selectedQuantities[item._id] || item.quantity
														}
														onChange={(e) =>
															handleQuantityChange(
																item._id,
																parseInt(e.target.value)
															)
														}
														className="w-12 text-center focus:outline-none"
													/>
													<button
														type="button"
														onClick={() =>
															handleQuantityChange(
																item._id,
																(selectedQuantities[item._id] ||
																	item.quantity) + 1
															)
														}
														className="px-3 py-1 text-gray-600 hover:text-gray-700"
														aria-label="Increase quantity"
													>
														+
													</button>
												</div>
												<div className="ml-4 text-right">
													<span className="block font-medium">
														৳
														{(
															(selectedQuantities[item._id] || item.quantity) *
															item.price
														).toLocaleString()}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Order Notes */}
							<div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
								<h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
									Additional Notes
								</h2>
								<textarea
									value={orderNote}
									onChange={(e) => setOrderNote(e.target.value)}
									className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									rows="3"
									placeholder="Any special instructions for your order or delivery (optional)"
								></textarea>
							</div>

							<div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
								<button
									type="button"
									onClick={() => navigate("/cart")}
									className="btn btn-outline-primary px-6 py-2 order-2 sm:order-1"
								>
									<FaArrowLeft className="mr-2" /> Back to Cart
								</button>
								<button
									type="button"
									onClick={handleContinueToPayment}
									className="btn btn-primary px-6 py-2 order-1 sm:order-2"
								>
									Continue to Payment
								</button>
							</div>
						</div>
					) : (
						<Elements stripe={stripePromise}>
							<CheckoutForm
								advancePaymentAmount={advancePaymentAmount}
								deliveryDetails={{
									region: selectedRegion,
									district: selectedDistrict,
									address: deliveryAddress,
									phone: phoneNumber,
									orderNote,
									totalAmount: finalTotal,
								}}
								items={items}
								onSuccess={handlePaymentSuccess}
							/>
						</Elements>
					)}
				</div>

				{/* Order Summary */}
				<div className="mt-8 lg:mt-0 lg:col-span-4">
					<div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 lg:sticky lg:top-8">
						<h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
							Order Summary
						</h2>

						<div className="flow-root">
							<div className="divide-y divide-gray-200">
								<div className="py-3 flex justify-between">
									<dt className="text-sm text-gray-600">Subtotal</dt>
									<dd className="text-sm font-medium text-gray-900">
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
									</dd>
								</div>
								<div className="py-3 flex justify-between">
									<dt className="text-sm text-gray-600">Delivery Charge</dt>
									<dd className="text-sm font-medium text-gray-900">
										৳{deliveryCharge.toLocaleString()}
									</dd>
								</div>
								<div className="py-3 flex justify-between font-medium">
									<dt className="text-base text-gray-900">Total</dt>
									<dd className="text-base text-gray-900">
										৳{finalTotal.toLocaleString()}
									</dd>
								</div>
								<div className="py-3 flex justify-between text-primary-700 font-medium">
									<dt className="text-sm">Advance Payment (2x Delivery)</dt>
									<dd className="text-sm">
										৳{advancePaymentAmount.toLocaleString()}
									</dd>
								</div>
								<div className="py-3 flex justify-between text-gray-500">
									<dt className="text-sm">Balance on Delivery</dt>
									<dd className="text-sm">
										৳{(finalTotal - advancePaymentAmount).toLocaleString()}
									</dd>
								</div>
							</div>
						</div>

						<div className="mt-6 space-y-4">
							<div className="bg-primary-50 p-4 rounded-md text-sm text-gray-700">
								<p className="mb-2">
									<strong>Important:</strong> You are required to pay{" "}
									{advancePaymentAmount.toLocaleString()} taka (2x delivery
									charge) as advance to place this order.
								</p>
								<p>
									The remaining amount will be collected upon delivery. Delivery
									is handled through our verified agents in your region.
								</p>
							</div>

							<div className="bg-gray-50 p-4 rounded-md">
								<h3 className="text-sm font-medium text-gray-900 mb-2">
									Cancellation Policy:
								</h3>
								<p className="text-xs text-gray-600">
									Orders can be cancelled within 12 hours of placement. Advance
									payments will be refunded according to our refund policy.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
