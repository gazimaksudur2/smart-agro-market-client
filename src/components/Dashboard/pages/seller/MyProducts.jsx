import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	FaBoxOpen,
	FaEdit,
	FaTrash,
	FaEye,
	FaPlus,
	FaCheckCircle,
	FaClock,
	FaTimesCircle,
	FaStar,
	FaCalendarAlt,
	FaLeaf,
	FaTags,
	FaMapMarkerAlt,
	FaBox,
	FaShoppingCart,
	FaWarehouse,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { toast } from "react-hot-toast";

const ProductStatusBadge = ({ status }) => {
	const statusConfig = {
		pending: {
			color: "bg-yellow-100 text-yellow-800",
			icon: <FaClock className="h-3 w-3" />,
			label: "Pending Approval",
		},
		approved: {
			color: "bg-green-100 text-green-800",
			icon: <FaCheckCircle className="h-3 w-3" />,
			label: "Approved",
		},
		rejected: {
			color: "bg-red-100 text-red-800",
			icon: <FaTimesCircle className="h-3 w-3" />,
			label: "Rejected",
		},
		draft: {
			color: "bg-gray-100 text-gray-800",
			icon: <FaEdit className="h-3 w-3" />,
			label: "Draft",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
		>
			{config.icon}
			<span className="ml-1">{config.label}</span>
		</span>
	);
};

const QualityBadge = ({ quality }) => {
	const qualityConfig = {
		A: "bg-green-100 text-green-800",
		B: "bg-blue-100 text-blue-800",
		C: "bg-yellow-100 text-yellow-800",
	};

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				qualityConfig[quality] || "bg-gray-100 text-gray-800"
			}`}
		>
			Quality: {quality}
		</span>
	);
};

export default function MyProducts() {
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [selectedProduct, setSelectedProduct] = useState(null);

	// Fetch seller products
	const {
		data: products,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["sellerProducts", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];

			try {
				const response = await apiCall(
					`/products/seller/${currentUser.FirebaseUser.email}`
				);
				// Check if response has success field and return products accordingly
				if (response?.success) {
					return response.products || [];
				}
				// Fallback for backward compatibility
				return response.products || response || [];
			} catch (error) {
				console.error("Error fetching products:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleDeleteProduct = async (productId) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			try {
				const response = await apiCall(`/products/${productId}`, "DELETE");

				// Check success field in response
				if (response?.success) {
					toast.success(response.message || "Product deleted successfully!");
				} else {
					toast.success("Product deleted successfully!");
				}

				// Refresh products list
				refetch();
			} catch (error) {
				console.error("Error deleting product:", error);
				toast.error("Failed to delete product. Please try again.");
			}
		}
	};

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Products" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	if (!products || products.length === 0) {
		return (
			<div className="py-6">
				<DashboardTitle title="My Products" />
				<div className="mt-6 text-center py-12">
					<FaBoxOpen className="mx-auto h-12 w-12 text-gray-400" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						No products yet
					</h2>
					<p className="mt-2 text-sm text-gray-500">
						Start by adding your first product to begin selling.
					</p>
					<Link to="/dashboard/add-product" className="mt-6 btn btn-primary">
						<FaPlus className="mr-2 h-4 w-4" />
						Add Your First Product
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="">
			<div className="flex items-center justify-between mb-6">
				<DashboardTitle title={`My Products (${products.length})`} />
				<Link to="/dashboard/add-product" className="btn btn-primary">
					<FaPlus className="mr-2 h-4 w-4" />
					Add New Product
				</Link>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product) => (
					<div
						key={product._id}
						className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
					>
						{/* Product Image Carousel */}
						<div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
							<img
								src={product.images?.[0] || "https://via.placeholder.com/300"}
								alt={product.title}
								className="w-full h-48 object-cover"
							/>
							{product.images?.length > 1 && (
								<div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
									+{product.images.length - 1} more
								</div>
							)}
							{
								<div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
									<FaStar className="h-3 w-3 mr-1 text-white" />
									<span className="font-medium">
										{product.averageRating &&
											product.averageRating > 0 &&
											Number(product?.averageRating).toFixed(1)}
									</span>
								</div>
							}
						</div>

						{/* Product Details */}
						<div className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="text-lg font-medium text-gray-900 truncate">
										{product.title}
									</h3>
									<p className="text-sm text-gray-500">{product.cropType}</p>
								</div>
								<ProductStatusBadge status={product.status} />
							</div>

							{/* Price and Stock Info */}
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-lg font-semibold text-primary-600">
										৳{product.pricePerUnit?.toLocaleString()} per {product.unit}
									</p>
									{product.quality && (
										<QualityBadge quality={product.quality} />
									)}
								</div>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex items-center text-gray-600">
										<FaShoppingCart className="h-3 w-3 mr-1" />
										Min: {product.minimumOrderQuantity} {product.unit}
									</div>
									<div className="flex items-center text-gray-600">
										<FaWarehouse className="h-3 w-3 mr-1" />
										Stock: {product.availableStock} {product.unit}
									</div>
								</div>
							</div>

							{/* Tags */}
							{product.tags && product.tags.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1">
									<FaTags className="h-3 w-3 text-gray-400 mt-1" />
									{product.tags.map((tag, index) => (
										<span
											key={index}
											className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
										>
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Location and Dates */}
							<div className="mt-3 space-y-1 text-xs text-gray-500">
								<div className="flex items-center">
									<FaMapMarkerAlt className="h-3 w-3 mr-1" />
									{product.sellerInfo?.operationalArea?.region},{" "}
									{product.sellerInfo?.operationalArea?.district}
								</div>
								<div className="flex items-center">
									<FaCalendarAlt className="h-3 w-3 mr-1" />
									Listed: {formatDate(product.createdAt)}
								</div>
								{product.harvestedOn && (
									<div className="flex items-center">
										<FaLeaf className="h-3 w-3 mr-1" />
										Harvested: {formatDate(product.harvestedOn)}
									</div>
								)}
							</div>

							{/* Rejection Reason */}
							{product.status === "rejected" && product.rejectionReason && (
								<div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
									<p className="text-xs text-red-800">
										<strong>Rejection Reason:</strong> {product.rejectionReason}
									</p>
								</div>
							)}

							{/* Action Buttons */}
							<div className="mt-4 flex items-center justify-between">
								<div className="flex space-x-2">
									<button
										onClick={() =>
											setSelectedProduct(
												selectedProduct?._id === product._id ? null : product
											)
										}
										className="btn btn-outline-primary btn-sm flex items-center"
									>
										<FaEye className="mr-1 h-3 w-3" />
										View
									</button>
									<Link
										to={`/dashboard/edit-product/${product._id}`}
										className="btn btn-outline-secondary btn-sm flex items-center"
									>
										<FaEdit className="mr-1 h-3 w-3" />
										Edit
									</Link>
								</div>
								<button
									onClick={() => handleDeleteProduct(product._id)}
									className="btn btn-outline-danger btn-sm flex items-center"
								>
									<FaTrash className="mr-1 h-3 w-3" />
									Delete
								</button>
							</div>
						</div>

						{/* Expanded Product Details */}
						{selectedProduct?._id === product._id && (
							<div className="border-t border-gray-200 bg-gray-50 p-4">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Description
								</h4>
								<p className="text-sm text-gray-600">{product.description}</p>

								{/* Approval Info */}
								{product.status === "approved" && product.approvedBy && (
									<div className="mt-3 text-sm">
										<p className="font-medium text-gray-900">
											Approval Details
										</p>
										<p className="text-gray-600">
											Approved on: {formatDate(product.approvedBy.approvedAt)}
										</p>
										<p className="text-gray-600">
											Agent ID: {product.approvedBy.agentId}
										</p>
										{product.approvalReason && (
											<p className="text-gray-600">
												Reason: {product.approvalReason}
											</p>
										)}
									</div>
								)}

								{/* Specifications */}
								{product.specifications && (
									<div className="mt-3 text-sm">
										<p className="font-medium text-gray-900 mb-2">
											Specifications
										</p>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
											{product.specifications.variety && (
												<p className="text-gray-600">
													<strong>Variety:</strong>{" "}
													{product.specifications.variety}
												</p>
											)}
											{product.specifications.grade && (
												<p className="text-gray-600">
													<strong>Grade:</strong> {product.specifications.grade}
												</p>
											)}
											{product.specifications.processingMethod && (
												<p className="text-gray-600">
													<strong>Processing:</strong>{" "}
													{product.specifications.processingMethod}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Timeline */}
								{product.timeline && (
									<div className="mt-3 text-sm">
										<p className="font-medium text-gray-900 mb-2">Timeline</p>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
											<p className="text-gray-600">
												<strong>Submitted:</strong>{" "}
												{formatDate(product.timeline.submittedAt)}
											</p>
											<p className="text-gray-600">
												<strong>Last Updated:</strong>{" "}
												{formatDate(product.timeline.lastUpdated)}
											</p>
										</div>
									</div>
								)}

								{/* Quick Actions */}
								<div className="mt-4 flex space-x-2">
									<Link
										to={`/product/${product._id}`}
										className={`btn btn-outline-primary btn-sm ${
											product?.status !== "approved" ? "btn-disabled" : ""
										}`}
									>
										View Public Page
									</Link>
									{product.status === "approved" && (
										<button className="btn btn-outline-secondary btn-sm">
											Promote Product
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Summary Stats */}
			<div className="mt-8 bg-white shadow-sm rounded-lg p-6">
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Product Summary
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="text-center p-4 bg-green-50 rounded-lg">
						<p className="text-2xl font-bold text-green-600">
							{products.filter((p) => p.status === "approved").length}
						</p>
						<p className="text-sm text-green-800">Approved</p>
					</div>
					<div className="text-center p-4 bg-yellow-50 rounded-lg">
						<p className="text-2xl font-bold text-yellow-600">
							{products.filter((p) => p.status === "pending").length}
						</p>
						<p className="text-sm text-yellow-800">Pending</p>
					</div>
					<div className="text-center p-4 bg-red-50 rounded-lg">
						<p className="text-2xl font-bold text-red-600">
							{products.filter((p) => p.status === "rejected").length}
						</p>
						<p className="text-sm text-red-800">Rejected</p>
					</div>
					<div className="text-center p-4 bg-blue-50 rounded-lg">
						<p className="text-2xl font-bold text-blue-600">
							{products
								.reduce((total, p) => total + (p.availableStock || 0), 0)
								.toLocaleString()}
						</p>
						<p className="text-sm text-blue-800">Total Stock</p>
					</div>
				</div>
			</div>
		</div>
	);
}
