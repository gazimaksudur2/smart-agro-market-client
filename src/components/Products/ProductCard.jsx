import { Link } from "react-router-dom";
import {
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaCheckCircle,
	FaStar,
} from "react-icons/fa";
import { format } from "date-fns";

export default function ProductCard({ product }) {
	// Fallback image in case product image is not available
	const fallbackImage =
		"https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

	// Helper functions to get the correct field values with fallbacks
	const getPrice = () => product?.price || product?.pricePerUnit || 0;
	const getStock = () => product?.stock || product?.availableStock || 0;
	const getSeller = () => product?.seller || product?.sellerInfo || {};
	const getLocation = () =>
		product?.location || getSeller()?.operationalArea || {};
	const getHarvestDate = () =>
		product?.specifications?.harvestDate || product?.harvestedOn;
	const getProductId = () => product?.id || product?._id;

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
				{product?.status === "approved" && (
					<div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
						<FaCheckCircle className="mr-1" />
						Verified
					</div>
				)}
				{(product?.averageRating > 0 || getSeller()?.rating > 0) && (
					<div className="absolute bottom-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
						<FaStar className="mr-1" />
						{Number(product?.averageRating || getSeller()?.rating || 0).toFixed(
							1
						)}
					</div>
				)}
			</div>

			<div className="p-4">
				<h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
					{product?.title || "Product Title Unavailable"}
				</h3>

				<div className="flex items-center text-gray-500 text-sm mb-2">
					<FaMapMarkerAlt className="mr-1" />
					<span>
						{getLocation()?.district || "District"},{" "}
						{getLocation()?.region || "Region"}
					</span>
				</div>

				<div className="flex items-center text-gray-500 text-sm mb-3">
					<FaCalendarAlt className="mr-1" />
					<span>
						Harvested:{" "}
						{getHarvestDate()
							? format(new Date(getHarvestDate()), "dd MMM yyyy")
							: "N/A"}
					</span>
				</div>

				<div className="flex items-center justify-between mb-3">
					<div>
						<span className="text-xl font-bold text-primary-600">
							৳{getPrice().toLocaleString()}
						</span>
						<span className="text-gray-500 text-sm">
							/{product?.unit || "unit"}
						</span>
					</div>
					<div className="text-right">
						<div className="text-xs text-gray-500">Stock</div>
						<div
							className={`text-sm font-medium ${
								!getStock() || getStock() <= 0
									? "text-red-500"
									: getStock() < 100
									? "text-yellow-500"
									: "text-green-600"
							}`}
						>
							{getStock() || 0} {product?.unit || "units"}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between mb-3">
					<div className="text-sm text-gray-500">
						Min Order: {product?.minimumOrderQuantity || 0}{" "}
						{product?.unit || "units"}
					</div>
					{getSeller()?.verificationStatus === "verified" && (
						<div className="flex items-center text-green-600 text-xs">
							<FaCheckCircle className="mr-1" />
							Verified Seller
						</div>
					)}
				</div>

				{/* Tags */}
				{product?.tags && product.tags.length > 0 && (
					<div className="mb-3">
						<div className="flex flex-wrap gap-1">
							{product.tags.slice(0, 2).map((tag, index) => (
								<span
									key={index}
									className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full"
								>
									{tag}
								</span>
							))}
							{product.tags.length > 2 && (
								<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
									+{product.tags.length - 2} more
								</span>
							)}
						</div>
					</div>
				)}

				<Link
					to={`/product/${getProductId()}`}
					className="btn btn-primary w-full text-center"
				>
					View Details
				</Link>
			</div>
		</div>
	);
}
