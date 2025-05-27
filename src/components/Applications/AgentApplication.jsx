import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
	FaWarehouse,
	FaMapMarkerAlt,
	FaFileUpload,
	FaPaperPlane,
	FaInfoCircle,
	FaBuilding,
} from "react-icons/fa";
import useAPI from "../../hooks/useAPI";
import { toast } from "react-hot-toast";
import useRegions from "../../hooks/useRegions";

export default function AgentApplication() {
	const { currentUser } = useAuth();
	const { apiCall, loading } = useAPI();
	const allRegions = useRegions();
	const [districts, setDistricts] = useState([]);

	const [formData, setFormData] = useState({
		businessName: "",
		businessType: "",
		experience: "",
		warehouseAddress: "",
		warehouseSize: "",
		region: "",
		district: "",
		coverageAreas: "",
		businessLicense: "",
		warehouseImages: "",
		bankAccountDetails: "",
		references: "",
		motivation: "",
	});

	const [errors, setErrors] = useState({});

	const businessTypes = [
		"Agricultural Trading",
		"Wholesale Distribution",
		"Logistics & Transportation",
		"Cold Storage",
		"Food Processing",
		"Import/Export",
		"Other",
	];

	useEffect(() => {
		if (formData.region && allRegions?.length) {
			const selectedRegion = allRegions.find((r) => r.name === formData.region);
			if (selectedRegion && selectedRegion.districts) {
				setDistricts(selectedRegion.districts);
			} else {
				setDistricts([]);
			}
		} else {
			setDistricts([]);
		}
	}, [formData.region, allRegions]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const newFormData = { ...prev, [name]: value };
			if (name === "region") {
				newFormData.district = "";
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

		if (!formData.businessName.trim()) {
			newErrors.businessName = "Business name is required";
		}

		if (!formData.businessType) {
			newErrors.businessType = "Business type is required";
		}

		if (!formData.experience.trim()) {
			newErrors.experience = "Experience details are required";
		}

		if (!formData.warehouseAddress.trim()) {
			newErrors.warehouseAddress = "Warehouse address is required";
		}

		if (!formData.warehouseSize.trim()) {
			newErrors.warehouseSize = "Warehouse size is required";
		}

		if (!formData.region) {
			newErrors.region = "Region is required";
		}

		if (!formData.district.trim()) {
			newErrors.district = "District is required";
		}

		if (!formData.coverageAreas.trim()) {
			newErrors.coverageAreas = "Coverage areas are required";
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
					district: formData.district
				},
				applicantId: currentUser?.DBUser?._id,
				applicantName: currentUser?.FirebaseUser?.displayName,
				applicantEmail: currentUser?.FirebaseUser?.email,
				applicantImg: currentUser?.FirebaseUser?.photoURL,
				applicationType: "agent-application",
				status: "pending",
			};

			await apiCall("/applications", "POST", applicationData);

			toast.success(
				"Agent application submitted successfully! We'll review your application and get back to you within 5-7 business days."
			);

			// Reset form
			setFormData({
				businessName: "",
				businessType: "",
				experience: "",
				warehouseAddress: "",
				warehouseSize: "",
				region: "",
				district: "",
				coverageAreas: "",
				businessLicense: "",
				warehouseImages: "",
				bankAccountDetails: "",
				references: "",
				motivation: "",
			});
		} catch (error) {
			console.error("Error submitting application:", error);
			toast.error(error.response.data.message || "Failed to submit application. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Apply to Become an Agent
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Join our platform as a regional agent and help connect farmers with
						buyers while building your agricultural business network.
					</p>
				</div>

				{/* Information Banner */}
				<div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
					<div className="flex">
						<div className="flex-shrink-0">
							<FaInfoCircle className="h-5 w-5 text-blue-400" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800">
								Agent Program Benefits
							</h3>
							<div className="mt-2 text-sm text-blue-700">
								<ul className="list-disc list-inside space-y-1">
									<li>Earn commission on every transaction in your region</li>
									<li>Manage local sellers and product approvals</li>
									<li>Handle delivery logistics and warehousing</li>
									<li>Build your agricultural business network</li>
									<li>Access to platform analytics and tools</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white shadow-sm rounded-lg">
					<form onSubmit={handleSubmit} className="p-6 space-y-8">
						{/* Business Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaBuilding className="mr-2" />
								Business Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Business Name *
									</label>
									<input
										type="text"
										name="businessName"
										value={formData.businessName}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.businessName ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Enter your business name"
									/>
									{errors.businessName && (
										<p className="mt-1 text-sm text-red-600">
											{errors.businessName}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Business Type *
									</label>
									<select
										name="businessType"
										value={formData.businessType}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.businessType ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Select Business Type</option>
										{businessTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</select>
									{errors.businessType && (
										<p className="mt-1 text-sm text-red-600">
											{errors.businessType}
										</p>
									)}
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Experience *
									</label>
									<textarea
										name="experience"
										value={formData.experience}
										onChange={handleInputChange}
										rows={3}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.experience ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Describe your experience in agricultural business, logistics, or related fields"
									/>
									{errors.experience && (
										<p className="mt-1 text-sm text-red-600">
											{errors.experience}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaFileUpload className="inline mr-1" />
										Business License (URL)
									</label>
									<input
										type="url"
										name="businessLicense"
										value={formData.businessLicense}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="https://example.com/business-license.jpg"
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
										placeholder="Bank name, account number, routing info"
									/>
								</div>
							</div>
						</div>

						{/* Warehouse Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaWarehouse className="mr-2" />
								Warehouse Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Warehouse Address *
									</label>
									<textarea
										name="warehouseAddress"
										value={formData.warehouseAddress}
										onChange={handleInputChange}
										rows={2}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.warehouseAddress
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="Complete warehouse address with landmarks"
									/>
									{errors.warehouseAddress && (
										<p className="mt-1 text-sm text-red-600">
											{errors.warehouseAddress}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Warehouse Size *
									</label>
									<input
										type="text"
										name="warehouseSize"
										value={formData.warehouseSize}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.warehouseSize
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="e.g., 1000 sq ft, 500 sq meters"
									/>
									{errors.warehouseSize && (
										<p className="mt-1 text-sm text-red-600">
											{errors.warehouseSize}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaFileUpload className="inline mr-1" />
										Warehouse Images (URLs)
									</label>
									<input
										type="text"
										name="warehouseImages"
										value={formData.warehouseImages}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="Comma-separated image URLs"
									/>
								</div>
							</div>
						</div>

						{/* Coverage Area */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<FaMapMarkerAlt className="mr-2" />
								Coverage Area
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Primary Region *
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
										{allRegions?.map((region) => (
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
										Primary District *
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

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Coverage Areas *
									</label>
									<textarea
										name="coverageAreas"
										value={formData.coverageAreas}
										onChange={handleInputChange}
										rows={2}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.coverageAreas
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="List all districts/areas you can cover for deliveries and operations"
									/>
									{errors.coverageAreas && (
										<p className="mt-1 text-sm text-red-600">
											{errors.coverageAreas}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Additional Information
							</h3>
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										References
									</label>
									<textarea
										name="references"
										value={formData.references}
										onChange={handleInputChange}
										rows={2}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										placeholder="Names and contacts of 2-3 business references (optional)"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Why do you want to become an agent? *
									</label>
									<textarea
										name="motivation"
										value={formData.motivation}
										onChange={handleInputChange}
										rows={3}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											errors.motivation ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Describe your motivation and how you plan to contribute to our platform"
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
					<div className="bg-blue-50 border-t border-blue-200 p-6">
						<div className="flex">
							<div className="flex-shrink-0">
								<FaWarehouse className="h-5 w-5 text-blue-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-blue-800">
									Application Review Process
								</h3>
								<div className="mt-2 text-sm text-blue-700">
									<p>
										Your agent application will be reviewed by our team within
										5-7 business days. We'll verify your business credentials,
										warehouse facilities, and coverage capabilities. Once
										approved, you'll gain access to our agent dashboard and
										training materials.
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
