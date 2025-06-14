import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useCart from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Example component demonstrating multiple items cart functionality
 * This shows how to add multiple items to cart and merge with existing items
 */
const BulkCartExample = () => {
	const { user } = useAuth();
	const { addMultipleItems, items, totalItems, totalAmount, loading } =
		useCart();
	const navigate = useNavigate();

	const [selectedItems, setSelectedItems] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);

	// Example product data
	const availableProducts = [
		{
			_id: "1",
			name: "Organic Tomatoes",
			price: 50,
			category: "Vegetables",
			image: "tomato.jpg",
			sellerId: "seller1",
		},
		{
			_id: "2",
			name: "Fresh Carrots",
			price: 40,
			category: "Vegetables",
			image: "carrot.jpg",
			sellerId: "seller2",
		},
		{
			_id: "3",
			name: "Organic Spinach",
			price: 30,
			category: "Vegetables",
			image: "spinach.jpg",
			sellerId: "seller3",
		},
	];

	// Handle item selection
	const handleItemSelect = (product, quantity) => {
		const existingIndex = selectedItems.findIndex(
			(item) => item.productId === product._id
		);

		if (existingIndex >= 0) {
			// Update existing item
			const updatedItems = [...selectedItems];
			updatedItems[existingIndex] = {
				productId: product._id,
				name: product.name,
				price: product.price,
				quantity: Math.max(quantity, 1),
				image: product.image,
				category: product.category,
				sellerId: product.sellerId,
			};
			setSelectedItems(updatedItems);
		} else {
			// Add new item
			setSelectedItems((prev) => [
				...prev,
				{
					productId: product._id,
					name: product.name,
					price: product.price,
					quantity: Math.max(quantity, 1),
					image: product.image,
					category: product.category,
					sellerId: product.sellerId,
				},
			]);
		}
	};

	// Remove item from selection
	const handleItemRemove = (productId) => {
		setSelectedItems((prev) =>
			prev.filter((item) => item.productId !== productId)
		);
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
			await addMultipleItems(selectedItems);
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
							<strong>Total:</strong> ৳{totalAmount}
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
							(item) => item.productId === product._id
						);
						const currentQuantity = selectedItem?.quantity || 0;

						return (
							<div key={product._id} className="border rounded-lg p-4">
								<h3 className="font-semibold">{product.name}</h3>
								<p className="text-gray-600">৳{product.price}</p>
								<p className="text-sm text-gray-500">
									Category: {product.category}
								</p>

								<div className="mt-3 flex items-center gap-2">
									<input
										type="number"
										min={1}
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
									<span className="text-sm text-gray-500">qty</span>
								</div>

								{selectedItem && (
									<p className="text-sm text-green-600 mt-1">
										Selected: {selectedItem.quantity} × ৳{product.price} = ৳
										{selectedItem.quantity * product.price}
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
					<h2 className="text-xl font-semibold mb-2">Selected Items</h2>
					<div className="space-y-2">
						{selectedItems.map((item) => (
							<div
								key={item.productId}
								className="flex justify-between items-center"
							>
								<span>
									{item.name} × {item.quantity}
								</span>
								<span>৳{item.price * item.quantity}</span>
							</div>
						))}
					</div>
					<div className="border-t pt-2 mt-2">
						<div className="flex justify-between items-center font-semibold">
							<span>Total Selected:</span>
							<span>৳{selectedTotal}</span>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex gap-4">
				<button
					onClick={handleAddToCart}
					disabled={selectedItems.length === 0 || isProcessing || loading}
					className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isProcessing
						? "Adding..."
						: `Add ${selectedItems.length} Items to Cart`}
				</button>

				<button
					onClick={() => setSelectedItems([])}
					disabled={selectedItems.length === 0}
					className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Clear Selection
				</button>
			</div>

			{/* Cart Items Display */}
			{items.length > 0 && (
				<div className="mt-8">
					<h2 className="text-xl font-semibold mb-4">Current Cart Items</h2>
					<div className="space-y-2">
						{items.map((item) => (
							<div
								key={item.productId}
								className="flex justify-between items-center p-3 bg-gray-50 rounded"
							>
								<div>
									<span className="font-medium">{item.name}</span>
									<span className="text-gray-600 ml-2">× {item.quantity}</span>
								</div>
								<span>৳{item.price * item.quantity}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default BulkCartExample;
