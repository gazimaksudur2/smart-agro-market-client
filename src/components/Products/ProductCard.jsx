import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";

export default function ProductCard({ product }) {
	// Fallback image in case product image is not available
	const fallbackImage =
		"https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

	return (
		<div className="card overflow-hidden hover:scale-[1.02] transition-transform duration-300">
			<div className="relative">
				<img
					src={product?.images?.[0] || fallbackImage}
					alt={product?.title || "Agricultural product"}
					className="w-full h-48 object-cover"
				/>
				<div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
					{product?.quality || "A"} Grade
				</div>
			</div>

			<div className="p-4">
				<h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
					{product?.title || "Product Title Unavailable"}
				</h3>

				<div className="flex items-center text-gray-500 text-sm mb-2">
					<FaMapMarkerAlt className="mr-1" />
					<span>
						{product?.sellerInfo?.operationalArea?.district || "District"},{" "}
						{product?.sellerInfo?.operationalArea?.region || "Region"}
					</span>
				</div>

				<div className="flex items-center text-gray-500 text-sm mb-3">
					<FaCalendarAlt className="mr-1" />
					<span>
						Harvested:{" "}
						{product?.harvestedOn
							? format(new Date(product.harvestedOn), "dd MMM yyyy")
							: "N/A"}
					</span>
				</div>

				<div className="flex justify-between items-center mb-3">
					<div>
						<span className="text-lg font-bold text-gray-900">
							৳{product?.pricePerUnit.toLocaleString() || "0"}
						</span>
						<span className="text-sm text-gray-500 ml-1">
							per {product?.unit || "kg"}
						</span>
					</div>
					<div className="text-sm text-gray-500">
						Min. order: {product?.minimumOrderQuantity || "1"}{" "}
						{product?.unit || "kg"}
					</div>
				</div>

				<div className="flex justify-between items-center">
					<div className="text-sm">
						<span className="text-gray-600 font-medium">Stock: </span>
						<span
							className={`font-medium ${
								!product?.availableStock || product?.availableStock <= 0
									? "text-red-500"
									: product?.availableStock < 100
									? "text-yellow-500"
									: "text-green-600"
							}`}
						>
							{product?.availableStock
								? `${product.availableStock} ${product.unit}`
								: "Out of stock"}
						</span>
					</div>
					<Link
						to={`/product/${product?._id}`}
						state={{ product }}
						className="btn btn-primary py-1.5"
					>
						View Details
					</Link>
				</div>
			</div>
		</div>
	);
}
