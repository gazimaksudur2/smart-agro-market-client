import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import {
	FaBoxOpen,
	FaImage,
	FaMapMarkerAlt,
	FaSave,
	FaTimes,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";

export default function AddProduct() {
	const { currentUser } = useAuth();
	const navigate = useNavigate();
	const { apiCall, loading } = useAPI();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "",
		price: "",
		unit: "kg",
		minimumOrderQuantity: "",
		stock: "",
		region: "",
		district: "",
		image: "",
	});

	const [errors, setErrors] = useState({});

	const categories = [
		"Grains",
		"Vegetables",
		"Fruits",
		"Dairy",
		"Meat & Poultry",
		"Fish & Seafood",
		"Spices & Herbs",
		"Pulses & Legumes",
		"Oil & Ghee",
		"Others",
	];

	const regions = [
		"Dhaka",
		"Chittagong",
		"Rajshahi",
		"Khulna",
		"Barisal",
		"Sylhet",
		"Rangpur",
		"Mymensingh",
	];

	const units = ["kg", "gram", "liter", "piece", "dozen", "bundle"];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.title.trim()) {
			newErrors.title = "Product title is required";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Product description is required";
		}

		if (!formData.category) {
			newErrors.category = "Category is required";
		}

		if (!formData.price || parseFloat(formData.price) <= 0) {
			newErrors.price = "Valid price is required";
		}

		if (
			!formData.minimumOrderQuantity ||
			parseInt(formData.minimumOrderQuantity) <= 0
		) {
			newErrors.minimumOrderQuantity =
				"Valid minimum order quantity is required";
		}

		if (!formData.stock || parseInt(formData.stock) <= 0) {
			newErrors.stock = "Valid stock quantity is required";
		}

		if (!formData.region) {
			newErrors.region = "Region is required";
		}

		if (!formData.district.trim()) {
			newErrors.district = "District is required";
		}

		if (!formData.image.trim()) {
			newErrors.image = "Product image URL is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			const productData = {
				...formData,
				price: parseFloat(formData.price),
				minimumOrderQuantity: parseInt(formData.minimumOrderQuantity),
				stock: parseInt(formData.stock),
				sellerId: currentUser?.FirebaseUser?.uid,
				status: "pending", // Products need agent approval
			};

			await apiCall("/products", "POST", productData);

			// Show success message and redirect
			alert(
				"Product added successfully! It will be reviewed by an agent before going live."
			);
			navigate("/dashboard/my-products");
		} catch (error) {
			console.error("Error adding product:", error);
			alert("Failed to add product. Please try again.");
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/my-products");
	};

	return (
		<div className="py-6">
			<DashboardTitle title="Add New Product" />

			<div className="mt-6 bg-white shadow-sm rounded-lg">
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Product Information */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Product Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Product Title *
								</label>
								<input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.title ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="Enter product title"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title}</p>
								)}
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description *
								</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={4}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.description ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="Describe your product in detail"
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600">
										{errors.description}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Category *
								</label>
								<select
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.category ? "border-red-500" : "border-gray-300"
									}`}
								>
									<option value="">Select Category</option>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								{errors.category && (
									<p className="mt-1 text-sm text-red-600">{errors.category}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									<FaImage className="inline mr-1" />
									Product Image URL *
								</label>
								<input
									type="url"
									name="image"
									value={formData.image}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.image ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="https://example.com/image.jpg"
								/>
								{errors.image && (
									<p className="mt-1 text-sm text-red-600">{errors.image}</p>
								)}
							</div>
						</div>
					</div>

					{/* Pricing & Quantity */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Pricing & Quantity
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Price per Unit (৳) *
								</label>
								<input
									type="number"
									name="price"
									value={formData.price}
									onChange={handleInputChange}
									min="0"
									step="0.01"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.price ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="0.00"
								/>
								{errors.price && (
									<p className="mt-1 text-sm text-red-600">{errors.price}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Unit *
								</label>
								<select
									name="unit"
									value={formData.unit}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
								>
									{units.map((unit) => (
										<option key={unit} value={unit}>
											{unit}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Minimum Order Quantity *
								</label>
								<input
									type="number"
									name="minimumOrderQuantity"
									value={formData.minimumOrderQuantity}
									onChange={handleInputChange}
									min="1"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.minimumOrderQuantity
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder="1"
								/>
								{errors.minimumOrderQuantity && (
									<p className="mt-1 text-sm text-red-600">
										{errors.minimumOrderQuantity}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Available Stock *
								</label>
								<input
									type="number"
									name="stock"
									value={formData.stock}
									onChange={handleInputChange}
									min="1"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.stock ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="100"
								/>
								{errors.stock && (
									<p className="mt-1 text-sm text-red-600">{errors.stock}</p>
								)}
							</div>
						</div>
					</div>

					{/* Location */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							<FaMapMarkerAlt className="inline mr-2" />
							Location
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Region *
								</label>
								<select
									name="region"
									value={formData.region}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.region ? "border-red-500" : "border-gray-300"
									}`}
								>
									<option value="">Select Region</option>
									{regions.map((region) => (
										<option key={region} value={region}>
											{region}
										</option>
									))}
								</select>
								{errors.region && (
									<p className="mt-1 text-sm text-red-600">{errors.region}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									District *
								</label>
								<input
									type="text"
									name="district"
									value={formData.district}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.district ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="Enter district name"
								/>
								{errors.district && (
									<p className="mt-1 text-sm text-red-600">{errors.district}</p>
								)}
							</div>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={handleCancel}
							className="btn btn-outline-secondary flex items-center"
						>
							<FaTimes className="mr-2 h-4 w-4" />
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary flex items-center"
						>
							<FaSave className="mr-2 h-4 w-4" />
							{loading ? "Adding Product..." : "Add Product"}
						</button>
					</div>
				</form>

				{/* Information Notice */}
				<div className="bg-blue-50 border-t border-blue-200 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<FaBoxOpen className="h-5 w-5 text-blue-400" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800">
								Product Review Process
							</h3>
							<div className="mt-2 text-sm text-blue-700">
								<p>
									Your product will be reviewed by a regional agent before it
									goes live. This ensures quality and authenticity for our
									marketplace. You'll be notified once the review is complete.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
