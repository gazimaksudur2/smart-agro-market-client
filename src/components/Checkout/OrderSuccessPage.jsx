import { Link } from "react-router-dom";
import { FaCheckCircle, FaBox, FaHome, FaFileAlt } from "react-icons/fa";

export default function OrderSuccessPage() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-16">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
				<FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
				<h1 className="mt-6 text-3xl font-bold text-gray-900">
					Order Placed Successfully!
				</h1>
				<p className="mt-2 text-lg text-gray-600">
					Thank you for your order. We've received your payment and your order
					is now being processed.
				</p>

				<div className="mt-8 bg-gray-50 rounded-lg p-6 text-left">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						What happens next?
					</h2>
					<ol className="space-y-4">
						<li className="flex items-start">
							<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold mr-3">
								1
							</span>
							<div>
								<p className="text-gray-700">
									Your order will be verified by the seller.
								</p>
								<p className="text-sm text-gray-500">
									The seller will confirm availability and prepare your items.
								</p>
							</div>
						</li>
						<li className="flex items-start">
							<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold mr-3">
								2
							</span>
							<div>
								<p className="text-gray-700">
									Products will be transported to your region's agent.
								</p>
								<p className="text-sm text-gray-500">
									Our logistics team will handle the inter-regional
									transportation.
								</p>
							</div>
						</li>
						<li className="flex items-start">
							<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold mr-3">
								3
							</span>
							<div>
								<p className="text-gray-700">
									Your agent will notify you when the order arrives.
								</p>
								<p className="text-sm text-gray-500">
									You'll receive a notification when your order reaches your
									local agent's warehouse.
								</p>
							</div>
						</li>
						<li className="flex items-start">
							<span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold mr-3">
								4
							</span>
							<div>
								<p className="text-gray-700">
									Collect your order from your regional agent.
								</p>
								<p className="text-sm text-gray-500">
									Pay the remaining balance when you collect your order.
								</p>
							</div>
						</li>
					</ol>
				</div>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						to="/dashboard/my-orders"
						className="btn btn-outline-primary py-3 flex justify-center items-center gap-2"
					>
						<FaFileAlt />
						<span>View My Orders</span>
					</Link>
					<Link
						to="/products"
						className="btn btn-outline-primary py-3 flex justify-center items-center gap-2"
					>
						<FaBox />
						<span>Continue Shopping</span>
					</Link>
					<Link
						to="/"
						className="btn btn-primary py-3 flex justify-center items-center gap-2"
					>
						<FaHome />
						<span>Return to Home</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
