import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../hooks/useCart";
import {
	FaTrash,
	FaMinus,
	FaPlus,
	FaShoppingCart,
	FaArrowRight,
	FaSpinner,
	FaExclamationTriangle,
	FaSave,
	FaUndo,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useScrollToTop from "../../../../hooks/useScrollToTop";

export default function MyCart() {
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
		batchUpdateItems: batchUpdateCartItems,
		loadCart,
		isAuthenticated,
		loading,
		error,
	} = useCart();

	// Local state for batch updates
	const [localCartItems, setLocalCartItems] = useState([]);
	const [pendingChanges, setPendingChanges] = useState({});
	const [hasChanges, setHasChanges] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Load cart data on component mount
	useEffect(() => {
		loadCart();
	}, []);

	// Initialize local cart items when cart items change
	useEffect(() => {
		if (cartItems && Array.isArray(cartItems)) {
			setLocalCartItems([...cartItems]);
			setPendingChanges({});
			setHasChanges(false);
		}
	}, [cartItems]);

	// Calculate local totals based on pending changes
	const calculateLocalTotals = () => {
		if (!localCartItems || !Array.isArray(localCartItems)) {
			return {
				subtotal: 0,
				totalItems: 0,
				deliveryCharge: 0,
				total: 0,
			};
		}

		const localSubtotal = localCartItems.reduce(
			(total, item) => total + (item.price || 0) * item.quantity,
			0
		);
		const localTotalItems = localCartItems.reduce(
			(total, item) => total + item.quantity,
			0
		);
		const localDeliveryCharge = localCartItems.length * 100; // Base delivery charge
		const localTotal = localSubtotal + localDeliveryCharge;

		return {
			subtotal: localSubtotal,
			totalItems: localTotalItems,
			deliveryCharge: localDeliveryCharge,
			total: localTotal,
		};
	};

	const localTotals = calculateLocalTotals();

	const handleQuantityChange = (itemId, newQuantity, minQuantity) => {
		if (newQuantity < minQuantity) {
			return;
		}

		// Update local state
		const updatedItems = localCartItems.map((item) =>
			item._id === itemId ? { ...item, quantity: newQuantity } : item
		);
		setLocalCartItems(updatedItems);

		// Track pending changes
		const originalItem = cartItems.find((item) => item._id === itemId);
		if (originalItem && originalItem.quantity !== newQuantity) {
			setPendingChanges((prev) => ({
				...prev,
				[itemId]: {
					type: "update",
					quantity: newQuantity,
					originalQuantity: originalItem.quantity,
				},
			}));
			setHasChanges(true);
		} else {
			// Remove from pending changes if quantity matches original
			setPendingChanges((prev) => {
				const updated = { ...prev };
				delete updated[itemId];
				return updated;
			});
			setHasChanges(Object.keys(pendingChanges).length > 1);
		}
	};

	const handleRemoveItem = (itemId) => {
		// Update local state
		const updatedItems = localCartItems.filter((item) => item._id !== itemId);
		setLocalCartItems(updatedItems);

		// Track pending changes
		setPendingChanges((prev) => ({
			...prev,
			[itemId]: { type: "remove" },
		}));
		setHasChanges(true);
	};

	const handleSaveChanges = async () => {
		setIsSaving(true);
		try {
			// Convert pending changes to operations array for new batch update structure
			const operations = Object.entries(pendingChanges).map(
				([itemId, change]) => ({
					itemId,
					type: change.type,
					...(change.type === "update" && { quantity: change.quantity }),
				})
			);

			await batchUpdateCartItems(operations);

			// Clear pending changes
			setPendingChanges({});
			setHasChanges(false);
		} catch (error) {
			console.error("Error saving cart changes:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDiscardChanges = () => {
		// Reset local state to match original cart
		if (cartItems && Array.isArray(cartItems)) {
			setLocalCartItems([...cartItems]);
			setPendingChanges({});
			setHasChanges(false);
		}
	};

	const handleClearCart = async () => {
		if (window.confirm("Are you sure you want to clear your cart?")) {
			await clearCartItems();
		}
	};

	const handleCheckout = () => {
		if (hasChanges) {
			if (
				window.confirm("You have unsaved changes. Save them before checkout?")
			) {
				handleSaveChanges().then(() => {
					navigate("/checkout");
				});
			}
		} else {
			navigate("/checkout");
		}
	};

	// Show loading state while cart is loading
	if (loading && (!cartItems || cartItems.length === 0)) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Cart" />
				<div className="mt-6 text-center py-12">
					<FaSpinner className="mx-auto h-12 w-12 text-primary-500 animate-spin" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Loading your cart...
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						Please wait while we fetch your cart items.
					</p>
				</div>
			</div>
		);
	}

	// Show error state if cart loading failed
	if (error) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Cart" />
				<div className="mt-6 text-center py-12">
					<FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Failed to load cart
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						{error || "There was an error loading your cart."}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-6 btn btn-primary"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	// Show empty cart state
	if (!cartItems || cartItems.length === 0) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Cart (0 items)" />
				<div className="mt-6 text-center py-12">
					<FaShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						Your cart is empty
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						Start shopping to add items to your cart.
					</p>
					<button
						onClick={() => navigate("/products")}
						className="mt-6 btn btn-primary flex items-center mx-auto"
					>
						<FaShoppingCart className="mr-2 h-4 w-4" />
						Browse Products
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title={`My Cart (${localTotals.totalItems} items)`} />

			{/* Pending Changes Notice */}
			{hasChanges && (
				<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<FaExclamationTriangle className="h-5 w-5 text-yellow-600 mr-2" />
							<div>
								<p className="text-sm font-medium text-yellow-800">
									You have unsaved changes
								</p>
								<p className="text-xs text-yellow-700">
									{Object.keys(pendingChanges).length} item(s) modified
								</p>
							</div>
						</div>
						<div className="flex space-x-2">
							<button
								onClick={handleDiscardChanges}
								disabled={isSaving}
								className="btn btn-sm btn-outline-secondary flex items-center disabled:opacity-50"
							>
								<FaUndo className="mr-1 h-3 w-3" />
								Discard
							</button>
							<button
								onClick={handleSaveChanges}
								disabled={isSaving}
								className="btn btn-sm btn-primary flex items-center disabled:opacity-50"
							>
								{isSaving ? (
									<FaSpinner className="mr-1 h-3 w-3 animate-spin" />
								) : (
									<FaSave className="mr-1 h-3 w-3" />
								)}
								{isSaving ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Loading indicator for batch operations */}
			{loading && !isSaving && (
				<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
					<div className="flex items-center">
						<FaSpinner className="h-4 w-4 text-blue-600 animate-spin mr-2" />
						<p className="text-sm text-blue-800">Updating cart...</p>
					</div>
				</div>
			)}

			<div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-8">
					<div className="bg-white shadow-sm rounded-lg overflow-hidden">
						<div className="p-4 sm:p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium text-gray-900">
									Cart Items
								</h3>
								<button
									onClick={handleClearCart}
									disabled={loading || isSaving}
									className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Clear Cart
								</button>
							</div>
						</div>

						<ul className="divide-y divide-gray-200">
							{localCartItems.map((item) => {
								const hasItemChanges = pendingChanges[item._id];
								return (
									<li
										key={item._id}
										className={`p-4 sm:p-6 ${
											hasItemChanges ? "bg-yellow-50" : ""
										}`}
									>
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
															{hasItemChanges && (
																<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
																	{hasItemChanges.type === "update"
																		? "Modified"
																		: "To Remove"}
																</span>
															)}
														</h3>
														<p className="text-sm text-gray-500">
															৳{item.price?.toLocaleString() || 0} per{" "}
															{item.unit}
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
														disabled={loading || isSaving}
														className="ml-4 text-red-600 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
														aria-label="Remove item"
													>
														<FaTrash className="h-4 w-4" />
													</button>
												</div>

												{/* Quantity Controls */}
												{hasItemChanges?.type !== "remove" && (
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
																		(item.minimumOrderQuantity || 1) ||
																	loading ||
																	isSaving
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
																disabled={loading || isSaving}
																className="p-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
												)}

												{/* Removed Item Notice */}
												{hasItemChanges?.type === "remove" && (
													<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
														<p className="text-sm text-red-800">
															This item will be removed from your cart
														</p>
													</div>
												)}
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-4 mt-8 lg:mt-0">
					<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 sticky top-4">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Order Summary
						</h3>

						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Subtotal ({localTotals.totalItems} items)
								</span>
								<span className="font-medium">
									৳{localTotals.subtotal.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Delivery Charge</span>
								<span className="font-medium">
									৳{localTotals.deliveryCharge.toLocaleString()}
								</span>
							</div>
							<div className="border-t pt-3">
								<div className="flex justify-between text-base font-medium">
									<span>Total</span>
									<span>৳{localTotals.total.toLocaleString()}</span>
								</div>
							</div>
						</div>

						{hasChanges && (
							<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
								<p className="text-xs text-yellow-800">
									Save changes before checkout
								</p>
							</div>
						)}

						<button
							onClick={handleCheckout}
							disabled={localTotals.totalItems === 0 || loading || isSaving}
							className="w-full mt-6 btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<FaArrowRight className="mr-2 h-4 w-4" />
							{hasChanges ? "Save & Checkout" : "Proceed to Checkout"}
						</button>

						<p className="mt-3 text-xs text-gray-500 text-center">
							Shipping and taxes calculated at checkout
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
