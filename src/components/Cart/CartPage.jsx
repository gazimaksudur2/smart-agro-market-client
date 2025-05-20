import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaTrash, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import {
	selectCartItems,
	selectCartSubtotal,
	selectCartDeliveryCharge,
	selectCartTotal,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
} from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";

export default function CartPage() {
	const cartItems = useSelector(selectCartItems);
	const subtotal = useSelector(selectCartSubtotal);
	const deliveryCharge = useSelector(selectCartDeliveryCharge);
	const total = useSelector(selectCartTotal);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleQuantityChange = (item, newQuantity) => {
		if (newQuantity < item.minimumOrderQuantity) {
			toast.error(
				`Minimum order quantity is ${item.minimumOrderQuantity} ${item.unit}`
			);
			newQuantity = item.minimumOrderQuantity;
		}

		dispatch(
			updateCartItemQuantity({
				_id: item._id,
				quantity: newQuantity,
			})
		);
	};

	const handleRemoveItem = (itemId) => {
		dispatch(removeFromCart({ _id: itemId }));
		toast.success("Item removed from cart");
	};

	const handleClearCart = () => {
		if (window.confirm("Are you sure you want to clear your cart?")) {
			dispatch(clearCart());
			toast.success("Cart cleared successfully");
		}
	};

	const handleCheckout = () => {
		navigate("/checkout");
	};

	if (cartItems.length === 0) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<FaShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
					<h2 className="mt-4 text-2xl font-bold text-gray-900">
						Your cart is empty
					</h2>
					<p className="mt-2 text-gray-600">
						Looks like you haven't added any products to your cart yet.
					</p>
					<div className="mt-6">
						<Link to="/products" className="btn btn-primary px-6 py-3">
							Browse Products
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

			<div className="lg:grid lg:grid-cols-12 lg:gap-8">
				{/* Cart Items */}
				<div className="lg:col-span-8">
					<div className="border-t border-b border-gray-200 divide-y divide-gray-200">
						{cartItems.map((item) => (
							<div key={item._id} className="py-6 sm:flex sm:justify-between">
								<div className="flex sm:w-8/12">
									<div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
										<img
											src={item.image}
											alt={item.title}
											className="h-full w-full object-cover object-center"
										/>
									</div>
									<div className="ml-4 flex flex-1 flex-col justify-between">
										<div>
											<h3 className="text-lg font-medium text-gray-900">
												{item.title}
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												Region: {item.region}, {item.district}
											</p>
											<p className="mt-1 text-sm text-gray-500">
												Min. Order: {item.minimumOrderQuantity} {item.unit}
											</p>
										</div>
										<div className="mt-2">
											<button
												onClick={() => handleRemoveItem(item._id)}
												className="flex items-center text-sm font-medium text-red-600 hover:text-red-500"
											>
												<FaTrash className="mr-1 h-3 w-3" />
												Remove
											</button>
										</div>
									</div>
								</div>
								<div className="mt-4 sm:mt-0 sm:w-auto">
									<div className="flex flex-col items-end">
										<p className="text-lg font-medium text-gray-900">
											৳{item.price.toLocaleString()} per {item.unit}
										</p>
										<p className="mt-1 text-sm font-medium text-gray-500">
											Subtotal: ৳{(item.price * item.quantity).toLocaleString()}
										</p>
										<div className="mt-2 flex items-center border border-gray-300 rounded-md">
											<button
												onClick={() =>
													handleQuantityChange(item, item.quantity - 1)
												}
												className="px-3 py-1 text-gray-600 hover:text-gray-700 border-r border-gray-300"
											>
												-
											</button>
											<input
												type="number"
												min={item.minimumOrderQuantity}
												value={item.quantity}
												onChange={(e) =>
													handleQuantityChange(item, parseInt(e.target.value))
												}
												className="w-16 text-center focus:outline-none"
											/>
											<button
												onClick={() =>
													handleQuantityChange(item, item.quantity + 1)
												}
												className="px-3 py-1 text-gray-600 hover:text-gray-700 border-l border-gray-300"
											>
												+
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="mt-6 flex justify-between">
						<Link
							to="/products"
							className="flex items-center text-primary-600 hover:text-primary-500"
						>
							<FaArrowLeft className="mr-2 h-4 w-4" />
							Continue Shopping
						</Link>
						<button
							onClick={handleClearCart}
							className="text-red-600 hover:text-red-500 font-medium"
						>
							Clear Cart
						</button>
					</div>
				</div>

				{/* Order Summary */}
				<div className="mt-8 lg:mt-0 lg:col-span-4">
					<div className="bg-gray-50 rounded-lg p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Order Summary
						</h2>
						<div className="flow-root">
							<div className="divide-y divide-gray-200">
								<div className="py-4 flex items-center justify-between">
									<dt className="text-gray-600">Subtotal</dt>
									<dd className="font-medium text-gray-900">
										৳{subtotal.toLocaleString()}
									</dd>
								</div>
								<div className="py-4 flex items-center justify-between">
									<dt className="text-gray-600">Estimated Delivery</dt>
									<dd className="font-medium text-gray-900">
										৳{deliveryCharge.toLocaleString()}
									</dd>
								</div>
								<div className="py-4 flex items-center justify-between">
									<dt className="text-base font-medium text-gray-900">
										Order Total
									</dt>
									<dd className="text-base font-bold text-gray-900">
										৳{total.toLocaleString()}
									</dd>
								</div>
							</div>
						</div>
						<div className="mt-6">
							<button
								onClick={handleCheckout}
								className="w-full btn btn-primary py-3 text-lg font-medium"
							>
								Checkout
							</button>
						</div>
					</div>
					<div className="mt-4 bg-gray-50 rounded-lg p-6">
						<h3 className="text-sm font-medium text-gray-900 mb-2">
							Important Note:
						</h3>
						<p className="text-sm text-gray-600 mb-2">
							• You need to pay 2x the delivery charge as advance to confirm
							your order.
						</p>
						<p className="text-sm text-gray-600 mb-2">
							• Minimum order quantities apply to each product.
						</p>
						<p className="text-sm text-gray-600">
							• Delivery charges vary based on your location and order size.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
