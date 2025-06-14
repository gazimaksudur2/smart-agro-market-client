import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Example component demonstrating multiple items cart functionality
 * This shows how to add multiple items to cart and merge with existing items
 */
const BulkCartExample = () => {
	const { user } = useAuth();
	const {
		addMultipleItemsToCart,
		mergeItemsWithCart,
		items,
		totalItems,
		totalAmount,
		loading,
	} = useCart();
	const navigate = useNavigate();

	const [selectedItems, setSelectedItems] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);

	// Example product data
	const availableProducts = [
		{
			_id: "1",
			title: "Organic Tomatoes",
			price: 50,
			unit: "kg",
			minimumOrderQuantity: 2,
			images: ["tomato.jpg"],
			category: "Vegetables",
			subcategory: "Fresh Vegetables",
			seller: "Farm Fresh Co.",
		},
		{
			_id: "2",
			title: "Fresh Carrots",
			price: 40,
			unit: "kg",
			minimumOrderQuantity: 1,
			images: ["carrot.jpg"],
			category: "Vegetables",
			subcategory: "Root Vegetables",
			seller: "Green Valley Farm",
		},
		{
			_id: "3",
			title: "Organic Spinach",
			price: 30,
			unit: "bunch",
			minimumOrderQuantity: 3,
			images: ["spinach.jpg"],
			category: "Vegetables",
			subcategory: "Leafy Greens",
			seller: "Organic Farms Ltd.",
		},
	];

	// Handle item selection
	const handleItemSelect = (product, quantity) => {
		const existingIndex = selectedItems.findIndex(
			(item) => item._id === product._id
		);

		if (existingIndex >= 0) {
			// Update existing item
			const updatedItems = [...selectedItems];
			updatedItems[existingIndex] = {
				...product,
				quantity: Math.max(quantity, product.minimumOrderQuantity || 1),
			};
			setSelectedItems(updatedItems);
		} else {
			// Add new item
			setSelectedItems((prev) => [
				...prev,
				{
					...product,
					quantity: Math.max(quantity, product.minimumOrderQuantity || 1),
				},
			]);
		}
	};

	// Remove item from selection
	const handleItemRemove = (productId) => {
		setSelectedItems((prev) => prev.filter((item) => item._id !== productId));
	};

	// Preview cart merge (client-side calculation)
	const previewMerge = () => {
		if (selectedItems.length === 0) return null;

		try {
			return mergeItemsWithCart(selectedItems);
		} catch (error) {
			console.error("Error previewing merge:", error);
			return null;
		}
	};

	// Add selected items to cart
	const handleAddToCart = async () => {
		if (!user) {
			toast.error("Please login to add items to cart");
			navigate("/login");
			return;
		}

		if (selectedItems.length === 0) {
			toast.error("Please select items to add to cart");
			return;
		}

		try {
			setIsProcessing(true);
			await addMultipleItemsToCart(selectedItems);
			setSelectedItems([]); // Clear selection after successful add
		} catch (error) {
			console.error("Error adding items to cart:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	// Calculate selected items total
	const selectedTotal = selectedItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);

	const previewData = previewMerge();

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Bulk Cart Example</h1>

			{/* Current Cart Summary */}
			<div className="bg-blue-50 p-4 rounded-lg mb-6">
				<h2 className="text-xl font-semibold mb-2">Current Cart</h2>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p>
							<strong>Items:</strong> {totalItems}
						</p>
						<p>
							<strong>Total:</strong> ₹{totalAmount}
						</p>
					</div>
					<div>
						<p>
							<strong>Unique Products:</strong> {items.length}
						</p>
						<p>
							<strong>Status:</strong> {loading ? "Loading..." : "Ready"}
						</p>
					</div>
				</div>
			</div>

			{/* Available Products */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-4">Available Products</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{availableProducts.map((product) => {
						const selectedItem = selectedItems.find(
							(item) => item._id === product._id
						);
						const currentQuantity = selectedItem?.quantity || 0;

						return (
							<div key={product._id} className="border rounded-lg p-4">
								<h3 className="font-semibold">{product.title}</h3>
								<p className="text-gray-600">
									₹{product.price}/{product.unit}
								</p>
								<p className="text-sm text-gray-500">
									Min Order: {product.minimumOrderQuantity || 1} {product.unit}
								</p>

								<div className="mt-3 flex items-center gap-2">
									<input
										type="number"
										min={product.minimumOrderQuantity || 1}
										value={currentQuantity}
										onChange={(e) => {
											const quantity = parseInt(e.target.value) || 0;
											if (quantity > 0) {
												handleItemSelect(product, quantity);
											} else {
												handleItemRemove(product._id);
											}
										}}
										className="w-20 px-2 py-1 border rounded"
										placeholder="0"
									/>
									<span className="text-sm">{product.unit}</span>
								</div>

								{selectedItem && (
									<p className="text-green-600 text-sm mt-1">
										Selected: {selectedItem.quantity} {product.unit}
										(₹{selectedItem.price * selectedItem.quantity})
									</p>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Selected Items Summary */}
			{selectedItems.length > 0 && (
				<div className="bg-green-50 p-4 rounded-lg mb-6">
					<h2 className="text-xl font-semibold mb-3">Selected Items</h2>
					<div className="space-y-2">
						{selectedItems.map((item) => (
							<div key={item._id} className="flex justify-between items-center">
								<span>
									{item.title} x {item.quantity} {item.unit}
								</span>
								<span className="font-semibold">
									₹{item.price * item.quantity}
								</span>
							</div>
						))}
					</div>
					<div className="border-t pt-2 mt-2">
						<div className="flex justify-between items-center font-bold">
							<span>Selected Total:</span>
							<span>₹{selectedTotal}</span>
						</div>
					</div>
				</div>
			)}

			{/* Preview Merged Cart */}
			{previewData && (
				<div className="bg-yellow-50 p-4 rounded-lg mb-6">
					<h2 className="text-xl font-semibold mb-3">
						Cart Preview (After Adding)
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p>
								<strong>Total Items:</strong> {previewData.totalItems}
							</p>
							<p>
								<strong>Unique Products:</strong> {previewData.items.length}
							</p>
						</div>
						<div>
							<p>
								<strong>Subtotal:</strong> ₹{previewData.subtotal}
							</p>
							<p>
								<strong>Delivery:</strong> ₹{previewData.deliveryCharge}
							</p>
							<p>
								<strong>Total:</strong> ₹{previewData.totalAmount}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex gap-4">
				<button
					onClick={handleAddToCart}
					disabled={selectedItems.length === 0 || isProcessing || loading}
					className={`px-6 py-3 rounded-lg font-semibold ${
						selectedItems.length === 0 || isProcessing || loading
							? "bg-gray-300 text-gray-500 cursor-not-allowed"
							: "bg-blue-600 text-white hover:bg-blue-700"
					}`}
				>
					{isProcessing
						? "Adding..."
						: `Add ${selectedItems.length} Items to Cart`}
				</button>

				<button
					onClick={() => setSelectedItems([])}
					disabled={selectedItems.length === 0}
					className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
				>
					Clear Selection
				</button>
			</div>

			{/* Usage Instructions */}
			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h3 className="font-semibold mb-2">How it works:</h3>
				<ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
					<li>Select quantities for products you want to add</li>
					<li>The system will merge with your existing cart items</li>
					<li>
						If an item already exists in cart, quantities will be added together
					</li>
					<li>Minimum order quantities are automatically enforced</li>
					<li>Cart totals are recalculated automatically</li>
					<li>All operations require user authentication</li>
				</ul>
			</div>
		</div>
	);
};

export default BulkCartExample;
