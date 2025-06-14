import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
	FaTractor,
	FaMapMarkerAlt,
	FaFileUpload,
	FaPaperPlane,
	FaInfoCircle,
	FaLeaf,
	FaIdCard,
} from "react-icons/fa";
import useAPI from "../../hooks/useAPI";
import { toast } from "react-hot-toast";
import useRegions from "../../hooks/useRegions";
import { useNavigate } from "react-router-dom";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function SellerApplication() {
	useScrollToTop(true, 200); // Add 200ms delay to ensure content is rendered
	const { currentUser } = useAuth();
	const { apiCall, loading } = useAPI();
	const [districts, setDistricts] = useState([]);
	const regions = useRegions();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		farmName: "",
		farmType: "",
		farmSize: "",
		experience: "",
		farmAddress: "",
		region: "",
		district: "",
		upazila: "",
		village: "",
		specialization: "",
		certifications: "",
		nidNumber: "",
		nidCopy: "",
		farmPhotos: "",
		bankAccountDetails: "",
		references: "",
		motivation: "",
	});
	const [errors, setErrors] = useState({});
	const farmTypes = [
		"Crop Farming",
		"Vegetable Farming",
		"Fruit Farming",
		"Dairy Farming",
		"Poultry Farming",
		"Fish Farming",
		"Livestock Farming",
		"Organic Farming",
		"Mixed Farming",
		"Other",
	];

	// Update available districts when region in formData changes
	useEffect(() => {
		if (formData.region && regions?.length) {
			const selectedRegion = regions.find((r) => r.name === formData.region);
			if (selectedRegion && selectedRegion.districts) {
				setDistricts(selectedRegion.districts);
			} else {
				setDistricts([]);
			}
		} else {
			setDistricts([]);
		}
		// No need to setFormData.district here, handleInputChange will do it if region changes
	}, [formData.region, regions]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const newFormData = { ...prev, [name]: value };
			// If region changes, clear the district selection
			if (name === "region") {
				newFormData.district = "";
			} else if (name === "farmPhotos") {
				newFormData.farmPhotos = value.split(",").map((img) => img.trim());
			}
			return newFormData;
		});

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.farmName.trim()) {
			newErrors.farmName = "Farm name is required";
		}

		if (!formData.farmType) {
			newErrors.farmType = "Farm type is required";
		}

		if (!formData.farmSize.trim()) {
			newErrors.farmSize = "Farm size is required";
		}

		if (!formData.experience.trim()) {
			newErrors.experience = "Experience details are required";
		}

		if (!formData.farmAddress.trim()) {
			newErrors.farmAddress = "Farm address is required";
		}

		if (!formData.region) {
			newErrors.region = "Region is required";
		}

		if (!formData.district.trim()) {
			newErrors.district = "District is required";
		}

		if (!formData.upazila.trim()) {
			newErrors.upazila = "Upazila is required";
		}

		if (!formData.village.trim()) {
			newErrors.village = "Village is required";
		}

		if (!formData.specialization.trim()) {
			newErrors.specialization = "Specialization is required";
		}

		if (!formData.nidNumber.trim()) {
			newErrors.nidNumber = "NID number is required";
		}

		if (!formData.motivation.trim()) {
			newErrors.motivation = "Motivation is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			const applicationData = {
				formData,
				operationalArea: {
					region: formData.region,
					district: formData.district,
				},
				applicantId: currentUser?.DBUser?._id,
				applicantName: currentUser?.FirebaseUser?.displayName,
				applicantEmail: currentUser?.FirebaseUser?.email,
				applicantImg: currentUser?.FirebaseUser?.photoURL,
				applicationType: "seller-application",
				status: "pending",
			};

			const response = await apiCall("/applications", "POST", applicationData);

			// Check success field in response
			if (response?.success) {
				toast.success(
					response.message ||
						"Seller application submitted successfully! We'll review your application and get back to you within 5-7 business days."
				);
			} else {
				toast.success(
					"Seller application submitted successfully! We'll review your application and get back to you within 5-7 business days."
				);
			}
			navigate("/");

			// Reset form
			setFormData({
				farmName: "",
				farmType: "",
				farmSize: "",
				experience: "",
				farmAddress: "",
				region: "",
				district: "",
				upazila: "",
				village: "",
				specialization: "",
				certifications: "",
				nidNumber: "",
				nidCopy: "",
				farmPhotos: "",
				bankAccountDetails: "",
				references: "",
				motivation: "",
			});
		} catch (error) {
			console.error("Error submitting application:", error);
			// Handle error response with success field
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to submit application. Please try again.";
			toast.error(errorMessage);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Apply to Become a Seller
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Join our platform as a verified seller and connect with buyers
						across Bangladesh. Start selling your agricultural products today.
					</p>
				</div>

				{/* Information Banner */}
				<div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
					<div className="flex">
						<div className="flex-shrink-0">
							<FaInfoCircle className="h-5 w-5 text-green-400" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-green-800">
								Seller Program Benefits
							</h3>
							<div className="mt-2 text-sm text-green-700">
								<ul className="list-disc list-inside space-y-1">
									<li>Access to thousands of wholesale buyers</li>
									<li>Direct market access without middlemen</li>
									<li>Fair pricing and transparent transactions</li>
									<li>Support from regional agents for verification</li>
									<li>Tools to manage inventory and orders efficiently</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white shadow-sm rounded-lg">
					<form onSubmit={handleSubmit} className="p-6 space-y-8">
						{/* Farm Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaTractor className="mr-2" />
								Farm Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Farm Name *
									</label>
									<input
										type="text"
										name="farmName"
										value={formData.farmName}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.farmName ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Vai Vai Agro LTD."
									/>
									{errors.farmName && (
										<p className="mt-1 text-sm text-red-600">
											{errors.farmName}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Farm Type *
									</label>
									<select
										name="farmType"
										value={formData.farmType}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.farmType ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Select Farm Type</option>
										{farmTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</select>
									{errors.farmType && (
										<p className="mt-1 text-sm text-red-600">
											{errors.farmType}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Farm Size *
									</label>
									<input
										type="text"
										name="farmSize"
										value={formData.farmSize}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.farmSize ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="e.g., 5 acres, 2 hectares"
									/>
									{errors.farmSize && (
										<p className="mt-1 text-sm text-red-600">
											{errors.farmSize}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Years of Experience *
									</label>
									<input
										type="text"
										name="experience"
										value={formData.experience}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.experience ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="e.g., 5 years in vegetable farming"
									/>
									{errors.experience && (
										<p className="mt-1 text-sm text-red-600">
											{errors.experience}
										</p>
									)}
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaLeaf className="inline mr-1" />
										Specialization *
									</label>
									<textarea
										name="specialization"
										value={formData.specialization}
										onChange={handleInputChange}
										rows={3}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.specialization
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="Describe your main crops/products and specializations"
									/>
									{errors.specialization && (
										<p className="mt-1 text-sm text-red-600">
											{errors.specialization}
										</p>
									)}
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Certifications (if any)
									</label>
									<input
										type="text"
										name="certifications"
										value={formData.certifications}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="e.g., Organic certification, GAP certification"
									/>
								</div>
							</div>
						</div>

						{/* Location Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaMapMarkerAlt className="mr-2" />
								Location Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Region/Division *
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
										{regions?.map((region) => (
											<option key={region.name} value={region.name}>
												{region.name}
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
									<select
										name="district"
										value={formData.district}
										onChange={handleInputChange}
										disabled={!formData.region || districts.length === 0}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.district ? "border-red-500" : "border-gray-300"
										} ${
											!formData.region || districts.length === 0
												? "bg-gray-100 cursor-not-allowed"
												: ""
										}`}
									>
										<option value="">
											{formData.region
												? "Select District"
												: "Select Region First"}
										</option>
										{districts?.map((district) => (
											<option key={district.name} value={district.name}>
												{district.name}
											</option>
										))}
									</select>
									{errors.district && (
										<p className="mt-1 text-sm text-red-600">
											{errors.district}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Upazila *
									</label>
									<input
										type="text"
										name="upazila"
										value={formData.upazila}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.upazila ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Enter upazila name"
									/>
									{errors.upazila && (
										<p className="mt-1 text-sm text-red-600">
											{errors.upazila}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Village *
									</label>
									<input
										type="text"
										name="village"
										value={formData.village}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.village ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Enter village name"
									/>
									{errors.village && (
										<p className="mt-1 text-sm text-red-600">
											{errors.village}
										</p>
									)}
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Farm Address *
									</label>
									<textarea
										name="farmAddress"
										value={formData.farmAddress}
										onChange={handleInputChange}
										rows={2}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.farmAddress ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Complete farm address with landmarks"
									/>
									{errors.farmAddress && (
										<p className="mt-1 text-sm text-red-600">
											{errors.farmAddress}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Personal & Documentation */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaIdCard className="mr-2" />
								Personal & Documentation
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										NID Number *
									</label>
									<input
										type="text"
										name="nidNumber"
										value={formData.nidNumber}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.nidNumber ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Enter NID number"
									/>
									{errors.nidNumber && (
										<p className="mt-1 text-sm text-red-600">
											{errors.nidNumber}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaFileUpload className="inline mr-1" />
										NID Copy (URL)
									</label>
									<input
										type="url"
										name="nidCopy"
										value={formData.nidCopy}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="https://example.com/nid-copy.jpg"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaFileUpload className="inline mr-1" />
										Farm Photos (URLs)
									</label>
									<input
										type="text"
										name="farmPhotos"
										value={formData.farmPhotos}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="Comma-separated photo URLs"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Bank Account Details
									</label>
									<input
										type="text"
										name="bankAccountDetails"
										value={formData.bankAccountDetails}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="Bank name, account number"
									/>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										References
									</label>
									<textarea
										name="references"
										value={formData.references}
										onChange={handleInputChange}
										rows={2}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="Names and contacts of 2-3 references (optional)"
									/>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Why do you want to join SmartAgro Connect? *
									</label>
									<textarea
										name="motivation"
										value={formData.motivation}
										onChange={handleInputChange}
										rows={3}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.motivation ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Describe your motivation and how you plan to contribute"
									/>
									{errors.motivation && (
										<p className="mt-1 text-sm text-red-600">
											{errors.motivation}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Form Actions */}
						<div className="flex items-center justify-center pt-6 border-t border-gray-200">
							<button
								type="submit"
								disabled={loading}
								className="btn btn-primary flex items-center px-8 py-3 text-lg"
							>
								<FaPaperPlane className="mr-2 h-5 w-5" />
								{loading ? "Submitting Application..." : "Submit Application"}
							</button>
						</div>
					</form>

					{/* Information Notice */}
					<div className="bg-green-50 border-t border-green-200 p-6">
						<div className="flex">
							<div className="flex-shrink-0">
								<FaTractor className="h-5 w-5 text-green-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-green-800">
									Application Review Process
								</h3>
								<div className="mt-2 text-sm text-green-700">
									<p>
										Your seller application will be reviewed by our regional
										agents within 5-7 business days. Once approved, you'll
										receive access to add and manage your products on our
										platform. We may contact you for additional information if
										needed.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
