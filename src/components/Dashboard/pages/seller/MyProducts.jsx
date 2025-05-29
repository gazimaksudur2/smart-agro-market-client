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
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

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

export default function MyProducts() {
	const { currentUser } = useAuth();
	const { apiCall } = useAPI();
	const [selectedProduct, setSelectedProduct] = useState(null);

	// Fetch seller products
	const {
		data: products,
		isLoading,
		error,
	} = useQuery(
		["sellerProducts", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];

			try {
				const response = await apiCall(
					`/products/seller/${currentUser.FirebaseUser.uid}`
				);
				return response.products || [];
			} catch (error) {
				console.error("Error fetching products:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	// Mock products for demo
	const mockProducts = [
		{
			_id: "prod_001",
			title: "Premium Basmati Rice",
			price: 120,
			unit: "kg",
			minimumOrderQuantity: 10,
			stock: 1000,
			status: "approved",
			category: "Grains",
			image:
				"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300",
			description: "High-quality basmati rice sourced directly from farmers.",
			createdAt: "2024-01-10T10:30:00Z",
			region: "Rajshahi",
			district: "Rajshahi",
		},
		{
			_id: "prod_002",
			title: "Fresh Potatoes",
			price: 50,
			unit: "kg",
			minimumOrderQuantity: 5,
			stock: 500,
			status: "pending",
			category: "Vegetables",
			image:
				"https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300",
			description: "Fresh potatoes harvested from organic farms.",
			createdAt: "2024-01-15T14:20:00Z",
			region: "Dhaka",
			district: "Gazipur",
		},
		{
			_id: "prod_003",
			title: "Organic Tomatoes",
			price: 80,
			unit: "kg",
			minimumOrderQuantity: 3,
			stock: 200,
			status: "approved",
			category: "Vegetables",
			image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300",
			description: "Organic tomatoes grown without pesticides.",
			createdAt: "2024-01-12T09:15:00Z",
			region: "Chittagong",
			district: "Chittagong",
		},
		{
			_id: "prod_004",
			title: "Premium Wheat",
			price: 60,
			unit: "kg",
			minimumOrderQuantity: 25,
			stock: 800,
			status: "rejected",
			category: "Grains",
			image:
				"https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300",
			description: "High-quality wheat for flour production.",
			createdAt: "2024-01-08T16:45:00Z",
			region: "Rajshahi",
			district: "Bogra",
			rejectionReason: "Product images need to be clearer and more detailed.",
		},
	];

	const displayProducts =
		products && products.length > 0 ? products : mockProducts;

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
				await apiCall(`/products/${productId}`, "DELETE");
				// Refresh products list
				window.location.reload();
			} catch (error) {
				console.error("Error deleting product:", error);
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

	if (displayProducts.length === 0) {
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
				<DashboardTitle title={`My Products (${displayProducts.length})`} />
				<Link to="/dashboard/add-product" className="btn btn-primary">
					<FaPlus className="mr-2 h-4 w-4" />
					Add New Product
				</Link>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{displayProducts.map((product) => (
					<div
						key={product._id}
						className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow"
					>
						{/* Product Image */}
						<div className="aspect-w-16 aspect-h-9">
							<img
								src={product.image}
								alt={product.title}
								className="w-full h-48 object-cover"
							/>
						</div>

						{/* Product Details */}
						<div className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="text-lg font-medium text-gray-900 truncate">
										{product.title}
									</h3>
									<p className="text-sm text-gray-500">{product.category}</p>
								</div>
								<ProductStatusBadge status={product.status} />
							</div>

							<div className="mt-2 space-y-1">
								<p className="text-lg font-semibold text-primary-600">
									৳{product.price.toLocaleString()} per {product.unit}
								</p>
								<p className="text-sm text-gray-500">
									Min. order: {product.minimumOrderQuantity} {product.unit}
								</p>
								<p className="text-sm text-gray-500">
									Stock: {product.stock} {product.unit}
								</p>
								<p className="text-xs text-gray-400">
									Listed on {formatDate(product.createdAt)}
								</p>
							</div>

							{/* Location */}
							<div className="mt-2">
								<p className="text-xs text-gray-500">
									📍 {product.region}, {product.district}
								</p>
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

								{/* Product Stats */}
								<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="font-medium text-gray-900">Total Views</p>
										<p className="text-gray-600">
											{product.views || Math.floor(Math.random() * 500) + 50}
										</p>
									</div>
									<div>
										<p className="font-medium text-gray-900">Orders</p>
										<p className="text-gray-600">
											{product.orders || Math.floor(Math.random() * 20) + 1}
										</p>
									</div>
								</div>

								{/* Quick Actions */}
								<div className="mt-4 flex space-x-2">
									<Link
										to={`/products/${product._id}`}
										className="btn btn-outline-primary btn-sm"
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
					<div className="text-center">
						<p className="text-2xl font-bold text-green-600">
							{displayProducts.filter((p) => p.status === "approved").length}
						</p>
						<p className="text-sm text-gray-500">Approved</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-yellow-600">
							{displayProducts.filter((p) => p.status === "pending").length}
						</p>
						<p className="text-sm text-gray-500">Pending</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-red-600">
							{displayProducts.filter((p) => p.status === "rejected").length}
						</p>
						<p className="text-sm text-gray-500">Rejected</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-primary-600">
							{displayProducts
								.reduce((total, p) => total + p.stock, 0)
								.toLocaleString()}
						</p>
						<p className="text-sm text-gray-500">Total Stock</p>
					</div>
				</div>
			</div>
		</div>
	);
}
