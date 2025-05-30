import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import {
	FaBoxOpen,
	FaImage,
	FaSave,
	FaTimes,
	FaUpload,
	FaTrash,
	FaSpinner,
	FaCalendarAlt,
	FaTags,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { uploadImageToCloudinary } from "../../../../services/imageUploadService";
import { toast } from "react-hot-toast";
import useCropTypes from "../../../../hooks/useCropTypes";

export default function AddProduct() {
	const { currentUser } = useAuth();
	const navigate = useNavigate();
	const { apiCall } = useAPI();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		cropType: "",
		pricePerUnit: "",
		unit: "kg",
		minimumOrderQuantity: "",
		stock: "",
		images: [],
		harvestedOn: "",
		tags: [],
	});

	const [customCropType, setCustomCropType] = useState("");
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
	const [tagInput, setTagInput] = useState("");
	const fileInputRef = useRef(null);

	const [errors, setErrors] = useState({});
	const { cropTypes } = useCropTypes();

	const categories = cropTypes ? [...cropTypes, "Others"] : ["Others"];

	const units = [
		"gram",
		"kg",
		"quintal",
		"liter",
		"piece",
		"dozen",
		"bundle",
		"feet",
	];

	const handleFileSelect = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		if (file.size > 3 * 1024 * 1024) {
			toast.error("Image size must be less than 3MB.");
			return;
		}

		setSelectedFiles((prevFiles) => [...prevFiles, file]);

		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviews((prevPreviews) => [...prevPreviews, reader.result]);
		};
		reader.readAsDataURL(file);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeImage = (indexToRemove) => {
		setSelectedFiles((prevFiles) =>
			prevFiles.filter((_, index) => index !== indexToRemove)
		);
		setPreviews((prevPreviews) =>
			prevPreviews.filter((_, index) => index !== indexToRemove)
		);
	};

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

		// Reset custom cropType when cropType changes to something other than "Others"
		if (name === "cropType" && value !== "Others") {
			setCustomCropType("");
		}
	};

	const handleTagInput = (e) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const newTag = tagInput.trim().toLowerCase();
			if (newTag && !formData.tags.includes(newTag)) {
				setFormData((prev) => ({
					...prev,
					tags: [...prev.tags, newTag],
				}));
				setTagInput("");
			}
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.title.trim()) {
			newErrors.title = "Product title is required";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Product description is required";
		}

		if (!formData.cropType) {
			newErrors.cropType = "Crop type is required";
		}

		if (formData.cropType === "Others" && !customCropType.trim()) {
			newErrors.customCropType = "Please specify your crop type";
		}

		if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
			newErrors.pricePerUnit = "Valid price per unit is required";
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

		if (previews.length === 0) {
			newErrors.images = "At least one product image is required";
		}

		if (!formData.harvestedOn) {
			newErrors.harvestedOn = "Harvest date is required";
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
			setIsSubmitting(true);
			setUploadProgress(0);

			// Upload images
			const uploadedImageUrls = [];
			const totalFiles = selectedFiles.length;

			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				const imageUrl = await uploadImageToCloudinary(file, { maxSizeMB: 3 });

				if (imageUrl) {
					uploadedImageUrls.push(imageUrl);
					setUploadProgress(((i + 1) / totalFiles) * 100);
				} else {
					toast.error(`Failed to upload ${file.name}. Product not added.`);
					setIsSubmitting(false);
					return;
				}
			}

			const productData = {
				...formData,
				cropType:
					formData.cropType === "Others"
						? customCropType.trim().toLowerCase()
						: formData.cropType.toLowerCase(),
				images: uploadedImageUrls,
				pricePerUnit: parseFloat(formData.pricePerUnit),
				minimumOrderQuantity: parseInt(formData.minimumOrderQuantity),
				availableStock: parseInt(formData.stock),
				harvestedOn: new Date(formData.harvestedOn).toISOString(),
				tags: formData.tags,
				sellerInfo: {
					_id: currentUser.DBUser?._id,
					name: currentUser?.DBUser?.name,
					email: currentUser?.DBUser?.email,
					phone: currentUser?.DBUser?.phoneNumber,
					operationalArea: currentUser?.DBUser?.operationalArea,
				},
				status: "pending",
			};

			await apiCall("/products/add-product", "POST", productData);
			toast.success(
				"Product added successfully! It will be reviewed by an agent before going live."
			);
			navigate("/dashboard/my-products");
		} catch (error) {
			console.error("Error adding product:", error);
			toast.error("Failed to add product. Please try again.");
		} finally {
			setIsSubmitting(false);
			setUploadProgress(0);
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/my-products");
	};

	return (
		<div className="">
			<DashboardTitle title="Add A New Product" />

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
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FaImage className="inline mr-1" />
									Product Images (Max 3MB each) *
								</label>
								<div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
									<input
										type="file"
										accept="image/jpeg, image/png, image/gif, image/jpg"
										onChange={handleFileSelect}
										ref={fileInputRef}
										className="hidden"
										id="imageUploadInput"
									/>
									<label
										htmlFor="imageUploadInput"
										className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
									>
										<FaUpload className="mr-2" />
										Choose Image(s)
									</label>
								</div>

								{previews.length > 0 && (
									<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
										{previews.map((previewUrl, index) => (
											<div key={index} className="relative group aspect-square">
												<img
													src={previewUrl}
													alt={`Preview ${index + 1}`}
													className="w-full h-full object-cover rounded-md shadow-md"
												/>
												<button
													type="button"
													onClick={() => removeImage(index)}
													className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
													title="Remove image"
												>
													<FaTrash className="h-3 w-3" />
												</button>
											</div>
										))}
									</div>
								)}
								{errors.images && (
									<p className="mt-1 text-sm text-red-600">{errors.images}</p>
								)}
							</div>

							<div className=" flex flex-col gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Crop-Type *
									</label>
									<select
										name="cropType"
										value={formData.cropType}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md capitalize focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.cropType ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Select Crop-Type</option>
										{categories.map((cropType) => (
											<option
												className="capitalize"
												key={cropType}
												value={cropType}
											>
												{cropType}
											</option>
										))}
									</select>
									{errors.cropType && (
										<p className="mt-1 text-sm text-red-600">
											{errors.cropType}
										</p>
									)}
								</div>

								{formData.cropType === "Others" && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Mention your Crop-Type *
										</label>
										<input
											type="text"
											value={customCropType}
											onChange={(e) => setCustomCropType(e.target.value)}
											className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
												errors.customCropType
													? "border-red-500"
													: "border-gray-300"
											}`}
											placeholder="Enter your Crop-Type"
										/>
										{errors.customCropType && (
											<p className="mt-1 text-sm text-red-600">
												{errors.customCropType}
											</p>
										)}
									</div>
								)}
							</div>

							{/* Harvest Date */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FaCalendarAlt className="inline mr-2" />
									Harvested On *
								</label>
								<input
									type="date"
									name="harvestedOn"
									value={formData.harvestedOn}
									onChange={handleInputChange}
									max={new Date().toISOString().split("T")[0]}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.harvestedOn ? "border-red-500" : "border-gray-300"
									}`}
								/>
								{errors.harvestedOn && (
									<p className="mt-1 text-sm text-red-600">
										{errors.harvestedOn}
									</p>
								)}
							</div>

							{/* Tags */}
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									<FaTags className="inline mr-2" />
									Your Product Tags
								</label>
								<div
									className={
										formData?.tags?.length > 0
											? `flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 mb-2`
											: "hidden"
									}
								>
									{formData?.tags?.map((tag, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
										>
											{tag}
											<button
												type="button"
												onClick={() => removeTag(tag)}
												className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-200 hover:bg-primary-300 transition-colors"
											>
												×
											</button>
										</span>
									))}
								</div>
								<div className="flex items-center">
									<input
										type="text"
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyDown={handleTagInput}
										className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"
										placeholder="Type tag and press Enter or comma (,)"
									/>
								</div>
								<p className="mt-1 text-xs text-gray-500">
									Example tags: rice, boro, aromatic, kalijira
								</p>
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
									name="pricePerUnit"
									value={formData.pricePerUnit}
									onChange={handleInputChange}
									min="0"
									step="0.01"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 no-spinner ${
										errors.pricePerUnit ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="0.00"
								/>
								{errors.pricePerUnit && (
									<p className="mt-1 text-sm text-red-600">
										{errors.pricePerUnit}
									</p>
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
									Minimum Order Quantity in Selected Unit*
								</label>
								<input
									type="number"
									name="minimumOrderQuantity"
									value={formData.minimumOrderQuantity}
									onChange={handleInputChange}
									min="1"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 no-spinner ${
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
									Available Stock in Selected Unit*
								</label>
								<input
									type="number"
									name="stock"
									value={formData.stock}
									onChange={handleInputChange}
									min="1"
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 no-spinner ${
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

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={handleCancel}
							disabled={isSubmitting}
							className="btn btn-outline flex items-center disabled:opacity-50"
						>
							<FaTimes className="mr-2 h-4 w-4" />
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-primary flex items-center min-w-[150px] justify-center disabled:opacity-50"
						>
							{isSubmitting ? (
								<>
									<FaSpinner className="mr-2 h-4 w-4 animate-spin" />
									{uploadProgress < 100
										? "Uploading Images..."
										: "Adding Product..."}
								</>
							) : (
								<>
									<FaSave className="mr-2 h-4 w-4" />
									Add Product
								</>
							)}
						</button>
					</div>

					{/* Submission Overlay */}
					{isSubmitting && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
								<FaSpinner className="h-8 w-8 animate-spin text-primary-600 mb-4" />
								<p className="text-lg font-medium text-gray-900">
									{uploadProgress < 100
										? "Uploading Images..."
										: "Adding Your Product..."}
								</p>
								{uploadProgress < 100 && (
									<div className="w-full mt-3">
										<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-primary-600 transition-all duration-300"
												style={{ width: `${uploadProgress}%` }}
											></div>
										</div>
										<p className="text-sm text-gray-500 text-center mt-2">
											{Math.round(uploadProgress)}% Complete
										</p>
									</div>
								)}
								<p className="text-sm text-gray-500 mt-2">
									Please wait, this may take a moment.
								</p>
							</div>
						</div>
					)}
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
