import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
	selectCartItems,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
} from "../../../redux/slices/cartSlice";
import { FaTrash, FaShoppingBag, FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardTitle from "../../../components/Dashboard/DashboardTitle";

export default function MyCart() {
	const cartItems = useSelector(selectCartItems);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleQuantityChange = (item, quantity) => {
		if (quantity < item.minimumOrderQuantity) {
			toast.error(
				`Minimum order quantity is ${item.minimumOrderQuantity} ${item.unit}`
			);
			quantity = item.minimumOrderQuantity;
		}

		dispatch(
			updateCartItemQuantity({
				_id: item._id,
				quantity,
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
			<div className="p-6">
				<DashboardTitle title="My Cart" />
				<div className="bg-white rounded-lg shadow p-8 text-center mt-6">
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

	// Calculate totals
	const subtotal = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);
	const deliveryCharge = cartItems.length * 100; // Basic delivery charge calculation
	const total = subtotal + deliveryCharge;

	return (
		<div className="p-6">
			<DashboardTitle title="My Cart" />

			<div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="border-b border-gray-200 pb-6 mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							Cart Items ({cartItems.length})
						</h3>
					</div>

					<div className="divide-y divide-gray-200">
						{cartItems.map((item) => (
							<div
								key={item._id}
								className="py-6 flex flex-col sm:flex-row sm:justify-between"
							>
								<div className="flex">
									<div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
										<img
											src={item.image}
											alt={item.title}
											className="h-full w-full object-cover object-center"
										/>
									</div>
									<div className="ml-4 flex-1">
										<h4 className="text-base font-medium text-gray-900">
											{item.title}
										</h4>
										<p className="mt-1 text-sm text-gray-500">
											Region: {item.region}, {item.district}
										</p>
										<p className="mt-1 text-sm text-gray-500">
											Price: ৳{item.price} per {item.unit}
										</p>
										<button
											onClick={() => handleRemoveItem(item._id)}
											className="mt-2 flex items-center text-sm font-medium text-red-600 hover:text-red-500"
										>
											<FaTrash className="mr-1 h-3 w-3" />
											Remove
										</button>
									</div>
								</div>
								<div className="mt-4 sm:mt-0">
									<div className="flex flex-col items-end">
										<p className="text-sm font-medium text-gray-500">
											Subtotal: ৳{(item.price * item.quantity).toLocaleString()}
										</p>
										<div className="mt-2 flex items-center border border-gray-300 rounded-md">
											<button
												onClick={() =>
													handleQuantityChange(item, item.quantity - 1)
												}
												className="px-3 py-1 text-gray-600 hover:text-gray-700"
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
												className="w-12 text-center focus:outline-none"
											/>
											<button
												onClick={() =>
													handleQuantityChange(item, item.quantity + 1)
												}
												className="px-3 py-1 text-gray-600 hover:text-gray-700"
											>
												+
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="border-t border-gray-200 pt-6 mt-6">
						<div className="flex justify-between items-center">
							<button
								onClick={handleClearCart}
								className="text-red-600 hover:text-red-500 font-medium"
							>
								Clear Cart
							</button>
							<Link
								to="/products"
								className="text-primary-600 hover:text-primary-500 font-medium"
							>
								Continue Shopping
							</Link>
						</div>
					</div>
				</div>

				{/* Order Summary */}
				<div className="bg-gray-50 px-6 py-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Order Summary
					</h3>
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
							className="w-full btn btn-primary py-3 flex justify-center items-center gap-2"
						>
							<FaShoppingBag /> Proceed to Checkout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
