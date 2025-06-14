import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	FiShoppingCart,
	FiTrash2,
	FiPlus,
	FiMinus,
	FiEdit3,
	FiCheck,
	FiX,
	FiRefreshCw,
	FiAlertCircle,
	FiSave,
	FiRotateCcw,
	FiInfo,
} from "react-icons/fi";
import useCart from "../../../../hooks/useCart";
import toast from "react-hot-toast";

const MyCart = () => {
	const {
		items: originalItems,
		loading,
		error,
		totalAmount: originalTotalAmount,
		totalItems: originalTotalItems,
		updateItem,
		removeItem,
		clearCart,
		loadCart,
		batchUpdate,
	} = useCart();

	// Draft state for local changes
	const [draftItems, setDraftItems] = useState([]);
	const [hasChanges, setHasChanges] = useState(false);
	const [savingChanges, setSavingChanges] = useState(false);

	// UI state
	const [editingQuantity, setEditingQuantity] = useState({});
	const [tempQuantities, setTempQuantities] = useState({});
	const [showShippingTerms, setShowShippingTerms] = useState(false);

	// Initialize draft items when original items change
	useEffect(() => {
		setDraftItems([...originalItems]);
		setHasChanges(false);

		// Initialize temp quantities
		const initialQuantities = {};
		originalItems.forEach((item) => {
			const itemId = item.productId || item._id;
			initialQuantities[itemId] = item.quantity;
		});
		setTempQuantities(initialQuantities);
	}, [originalItems]);

	useEffect(() => {
		loadCart();
	}, [loadCart]);

	// Calculate draft totals
	const calculateDraftTotals = () => {
		const totalItems = draftItems.reduce((sum, item) => sum + item.quantity, 0);
		const totalAmount = draftItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		return { totalItems, totalAmount };
	};

	const { totalItems: draftTotalItems, totalAmount: draftTotalAmount } =
		calculateDraftTotals();

	// Check if there are unsaved changes
	const checkForChanges = (newDraftItems) => {
		if (newDraftItems.length !== originalItems.length) {
			setHasChanges(true);
			return;
		}

		const hasQuantityChanges = newDraftItems.some((draftItem) => {
			const originalItem = originalItems.find(
				(item) =>
					(item.productId || item._id) ===
					(draftItem.productId || draftItem._id)
			);
			return !originalItem || originalItem.quantity !== draftItem.quantity;
		});

		setHasChanges(hasQuantityChanges);
	};

	// Draft quantity change (local only)
	const handleDraftQuantityChange = (productId, newQuantity) => {
		if (newQuantity < 1) return;

		const updatedDraftItems = draftItems.map((item) => {
			const itemId = item.productId || item._id;
			if (itemId === productId) {
				return { ...item, quantity: newQuantity };
			}
			return item;
		});

		setDraftItems(updatedDraftItems);
		setTempQuantities((prev) => ({
			...prev,
			[productId]: newQuantity,
		}));
		checkForChanges(updatedDraftItems);
	};

	// Draft item removal (local only)
	const handleDraftRemoveItem = (productId) => {
		if (!window.confirm("Remove this item from your cart?")) {
			return;
		}

		const updatedDraftItems = draftItems.filter(
			(item) => (item.productId || item._id) !== productId
		);

		setDraftItems(updatedDraftItems);
		checkForChanges(updatedDraftItems);
	};

	// Direct quantity editing
	const handleDirectQuantityEdit = (productId) => {
		setEditingQuantity((prev) => ({
			...prev,
			[productId]: true,
		}));
	};

	const handleQuantityInputChange = (productId, value) => {
		const quantity = parseInt(value) || 0;
		setTempQuantities((prev) => ({
			...prev,
			[productId]: quantity,
		}));
	};

	const handleQuantityInputSubmit = (productId) => {
		const newQuantity = tempQuantities[productId];
		const currentItem = draftItems.find(
			(item) => (item.productId || item._id) === productId
		);

		if (!currentItem) return;

		if (newQuantity < 1) {
			toast.error("Quantity must be at least 1");
			setTempQuantities((prev) => ({
				...prev,
				[productId]: currentItem.quantity,
			}));
			setEditingQuantity((prev) => ({
				...prev,
				[productId]: false,
			}));
			return;
		}

		handleDraftQuantityChange(productId, newQuantity);
		setEditingQuantity((prev) => ({
			...prev,
			[productId]: false,
		}));
	};

	const handleQuantityInputCancel = (productId) => {
		const currentItem = draftItems.find(
			(item) => (item.productId || item._id) === productId
		);
		if (currentItem) {
			setTempQuantities((prev) => ({
				...prev,
				[productId]: currentItem.quantity,
			}));
		}
		setEditingQuantity((prev) => ({
			...prev,
			[productId]: false,
		}));
	};

	// Save all changes to backend
	const handleSaveChanges = async () => {
		if (!hasChanges) return;

		setSavingChanges(true);

		try {
			// Prepare batch operations
			const operations = [];

			// Check for removed items
			originalItems.forEach((originalItem) => {
				const itemId = originalItem.productId || originalItem._id;
				const draftItem = draftItems.find(
					(item) => (item.productId || item._id) === itemId
				);

				if (!draftItem) {
					// Item was removed
					operations.push({
						type: "remove",
						productId: itemId,
					});
				}
			});

			// Check for quantity updates
			draftItems.forEach((draftItem) => {
				const itemId = draftItem.productId || draftItem._id;
				const originalItem = originalItems.find(
					(item) => (item.productId || item._id) === itemId
				);

				if (originalItem && originalItem.quantity !== draftItem.quantity) {
					// Quantity was updated
					operations.push({
						type: "update",
						productId: itemId,
						quantity: draftItem.quantity,
					});
				}
			});

			if (operations.length > 0) {
				await batchUpdate(operations);
				toast.success("Cart changes saved successfully!");
			}

			setHasChanges(false);
		} catch (error) {
			console.error("Error saving changes:", error);
			toast.error("Failed to save changes. Please try again.");
		} finally {
			setSavingChanges(false);
		}
	};

	// Discard all local changes
	const handleDiscardChanges = () => {
		if (!hasChanges) return;

		if (window.confirm("Discard all unsaved changes?")) {
			setDraftItems([...originalItems]);
			setHasChanges(false);

			// Reset temp quantities
			const resetQuantities = {};
			originalItems.forEach((item) => {
				const itemId = item.productId || item._id;
				resetQuantities[itemId] = item.quantity;
			});
			setTempQuantities(resetQuantities);

			toast.success("Changes discarded");
		}
	};

	// Clear entire cart
	const handleClearCart = async () => {
		if (
			window.confirm("Clear your entire cart? This action cannot be undone.")
		) {
			await clearCart();
		}
	};

	// Refresh cart
	const handleRefreshCart = async () => {
		if (hasChanges) {
			if (
				!window.confirm(
					"You have unsaved changes. Refreshing will discard them. Continue?"
				)
			) {
				return;
			}
		}

		toast.loading("Refreshing cart...", { id: "refresh-cart" });
		try {
			await loadCart();
			toast.success("Cart refreshed successfully", { id: "refresh-cart" });
		} catch (error) {
			toast.error("Failed to refresh cart", { id: "refresh-cart" });
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
			<div className="bg-red-50 border border-red-200 rounded-lg p-6">
				<div className="flex items-center">
					<FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
					<p className="text-red-600 font-medium">
						Error loading cart: {error}
					</p>
				</div>
				<div className="mt-4 flex space-x-3">
					<button
						onClick={loadCart}
						className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						<FiRefreshCw className="h-4 w-4 mr-1" />
						Try again
					</button>
				</div>
			</div>
		);
	}

	if (!draftItems || draftItems.length === 0) {
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
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
					<p className="text-sm text-gray-500 mt-1">
						Make changes and save when ready
					</p>
				</div>
				<div className="flex space-x-3">
					<button
						onClick={handleRefreshCart}
						className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						<FiRefreshCw className="h-4 w-4 mr-1" />
						Refresh
					</button>
					<button
						onClick={handleClearCart}
						className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						<FiTrash2 className="h-4 w-4 mr-1" />
						Clear Cart
					</button>
				</div>
			</div>

			{/* Unsaved Changes Banner */}
			{hasChanges && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<FiInfo className="h-5 w-5 text-yellow-400 mr-2" />
							<p className="text-yellow-800 font-medium">
								You have unsaved changes to your cart
							</p>
						</div>
						<div className="flex space-x-3">
							<button
								onClick={handleDiscardChanges}
								className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
							>
								<FiRotateCcw className="h-4 w-4 mr-1" />
								Discard Changes
							</button>
							<button
								onClick={handleSaveChanges}
								disabled={savingChanges}
								className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
							>
								{savingChanges ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
								) : (
									<FiSave className="h-4 w-4 mr-1" />
								)}
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Main Content - Parallel Columns */}
			<div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
				{/* Cart Items - Left Column */}
				<div className="lg:col-span-8">
					<div className="bg-white shadow rounded-lg">
						<div className="px-4 py-5 sm:p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Shopping Cart ({draftTotalItems} items)
								{hasChanges && (
									<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										Draft
									</span>
								)}
							</h2>
							<div className="space-y-4">
								{draftItems.map((item) => {
									const itemId = item.productId || item._id;
									const isEditing = editingQuantity[itemId];
									const originalItem = originalItems.find(
										(orig) => (orig.productId || orig._id) === itemId
									);
									const hasItemChanged =
										!originalItem || originalItem.quantity !== item.quantity;

									return (
										<div
											key={itemId}
											className={`flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0 ${
												hasItemChanged ? "bg-yellow-50 border-yellow-200" : ""
											}`}
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
													{hasItemChanged && (
														<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
															Modified
														</span>
													)}
												</h3>
												<p className="text-sm text-gray-500">
													৳{item.price} per {item.unit || "unit"}
												</p>
												{item.category && (
													<p className="text-sm text-gray-400">
														{item.category}
													</p>
												)}
												{item.sellerName && (
													<p className="text-xs text-gray-400">
														Seller: {item.sellerName}
													</p>
												)}
												{item.minimumOrderQuantity &&
													item.minimumOrderQuantity > 1 && (
														<p className="text-xs text-orange-600">
															Min order: {item.minimumOrderQuantity}{" "}
															{item.unit || "units"}
														</p>
													)}
											</div>

											{/* Quantity Controls */}
											<div className="flex items-center space-x-3">
												{isEditing ? (
													// Direct quantity input mode
													<div className="flex items-center space-x-2">
														<input
															type="number"
															min="1"
															value={tempQuantities[itemId] || ""}
															onChange={(e) =>
																handleQuantityInputChange(
																	itemId,
																	e.target.value
																)
															}
															onKeyPress={(e) => {
																if (e.key === "Enter") {
																	handleQuantityInputSubmit(itemId);
																} else if (e.key === "Escape") {
																	handleQuantityInputCancel(itemId);
																}
															}}
															className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
															autoFocus
														/>
														<button
															onClick={() => handleQuantityInputSubmit(itemId)}
															className="p-1 text-green-600 hover:text-green-800"
															title="Save"
														>
															<FiCheck className="h-4 w-4" />
														</button>
														<button
															onClick={() => handleQuantityInputCancel(itemId)}
															className="p-1 text-red-600 hover:text-red-800"
															title="Cancel"
														>
															<FiX className="h-4 w-4" />
														</button>
													</div>
												) : (
													// Normal quantity controls
													<>
														<button
															onClick={() =>
																handleDraftQuantityChange(
																	itemId,
																	item.quantity - 1
																)
															}
															disabled={item.quantity <= 1}
															className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
														>
															<FiMinus className="h-4 w-4" />
														</button>
														<div className="flex items-center">
															<span
																className={`px-4 py-2 text-sm font-medium rounded-lg min-w-[3rem] text-center ${
																	hasItemChanged
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-gray-100"
																}`}
															>
																{item.quantity}
															</span>
															<button
																onClick={() => handleDirectQuantityEdit(itemId)}
																className="ml-1 p-1 text-gray-400 hover:text-gray-600"
																title="Edit quantity directly"
															>
																<FiEdit3 className="h-3 w-3" />
															</button>
														</div>
														<button
															onClick={() =>
																handleDraftQuantityChange(
																	itemId,
																	item.quantity + 1
																)
															}
															className="p-2 rounded-full hover:bg-gray-100"
														>
															<FiPlus className="h-4 w-4" />
														</button>
													</>
												)}
											</div>

											{/* Item Total */}
											<div className="text-right min-w-[80px]">
												<p
													className={`text-lg font-medium ${
														hasItemChanged ? "text-yellow-700" : "text-gray-900"
													}`}
												>
													৳{(item.price * item.quantity).toFixed(2)}
												</p>
											</div>

											{/* Remove Button */}
											<button
												onClick={() => handleDraftRemoveItem(itemId)}
												className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
												title="Remove item"
											>
												<FiTrash2 className="h-5 w-5" />
											</button>
										</div>
									);
								})}
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
								{hasChanges && (
									<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										Draft
									</span>
								)}
							</h3>

							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										Subtotal ({draftTotalItems} items)
									</span>
									<span
										className={`font-medium ${
											hasChanges ? "text-yellow-700" : ""
										}`}
									>
										৳{draftTotalAmount.toFixed(2)}
									</span>
								</div>

								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										Shipping
										<button
											onClick={() => setShowShippingTerms(!showShippingTerms)}
											className="ml-1 text-blue-600 hover:text-blue-800"
											title="View shipping terms"
										>
											<FiInfo className="h-3 w-3 inline" />
										</button>
									</span>
									<span className="font-medium text-green-600">Free</span>
								</div>

								{/* Shipping Terms */}
								{showShippingTerms && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
										<h4 className="font-medium mb-2">
											Shipping Terms & Conditions:
										</h4>
										<ul className="space-y-1 list-disc list-inside">
											<li>Free shipping on orders above ৳500</li>
											<li>Delivery within 2-5 business days</li>
											<li>Fresh produce delivered with cold chain</li>
											<li>Delivery charges apply for remote areas</li>
											<li>Orders placed before 2 PM delivered next day</li>
										</ul>
									</div>
								)}

								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Tax</span>
									<span className="font-medium">৳0.00</span>
								</div>

								<div className="border-t border-gray-200 pt-3">
									<div className="flex justify-between">
										<span className="text-base font-medium text-gray-900">
											Total
										</span>
										<span
											className={`text-xl font-bold ${
												hasChanges ? "text-yellow-700" : "text-gray-900"
											}`}
										>
											৳{draftTotalAmount.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							{/* Save Changes Button */}
							{hasChanges && (
								<div className="mt-6">
									<button
										onClick={handleSaveChanges}
										disabled={savingChanges}
										className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center transition-colors disabled:opacity-50"
									>
										{savingChanges ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
												Saving Changes...
											</>
										) : (
											<>
												<FiSave className="h-5 w-5 mr-2" />
												Save Changes
											</>
										)}
									</button>
								</div>
							)}

							{/* Checkout Button */}
							<div className={hasChanges ? "mt-4" : "mt-6"}>
								<Link
									to="/checkout"
									className={`w-full border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white flex items-center justify-center transition-colors ${
										hasChanges
											? "bg-gray-400 cursor-not-allowed"
											: "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
									}`}
									onClick={(e) => {
										if (hasChanges) {
											e.preventDefault();
											toast.error(
												"Please save your changes before proceeding to checkout"
											);
										}
									}}
								>
									{hasChanges
										? "Save Changes to Checkout"
										: "Proceed to Checkout"}
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
