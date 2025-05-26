import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
	FaWarehouse,
	FaMapMarkerAlt,
	FaFileUpload,
	FaPaperPlane,
	FaInfoCircle,
} from "react-icons/fa";
import DashboardTitle from "../DashboardTitle";
import useAPI from "../../../hooks/useAPI";

export default function AgentApplication() {
	const { currentUser } = useAuth();
	const { apiCall, loading } = useAPI();

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
			return;
		}

		try {
			const applicationData = {
				...formData,
				applicantId: currentUser?.FirebaseUser?.uid,
				applicantName: currentUser?.FirebaseUser?.displayName,
				applicantEmail: currentUser?.FirebaseUser?.email,
				status: "pending",
				submittedAt: new Date().toISOString(),
			};

			await apiCall("/agent-applications", "POST", applicationData);

			alert(
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
			alert("Failed to submit application. Please try again.");
		}
	};

	return (
		<div className="py-6">
			<DashboardTitle title="Apply to Become an Agent" />

			{/* Information Banner */}
			<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
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

			<div className="mt-6 bg-white shadow-sm rounded-lg">
				<form onSubmit={handleSubmit} className="p-6 space-y-8">
					{/* Business Information */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
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
									Business Experience *
								</label>
								<textarea
									name="experience"
									value={formData.experience}
									onChange={handleInputChange}
									rows={3}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
										errors.experience ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="Describe your experience in agricultural business, trading, or logistics"
								/>
								{errors.experience && (
									<p className="mt-1 text-sm text-red-600">
										{errors.experience}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Warehouse Information */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							<FaWarehouse className="inline mr-2" />
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
									placeholder="Enter complete warehouse address"
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
										errors.warehouseSize ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="e.g., 5000 sq ft, 2 floors"
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

					{/* Location & Coverage */}
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							<FaMapMarkerAlt className="inline mr-2" />
							Location & Coverage Area
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
										errors.coverageAreas ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="List all districts/areas you can serve (comma-separated)"
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
									Business License/Registration
								</label>
								<input
									type="text"
									name="businessLicense"
									value={formData.businessLicense}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									placeholder="License number or registration details"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Bank Account Details
								</label>
								<textarea
									name="bankAccountDetails"
									value={formData.bankAccountDetails}
									onChange={handleInputChange}
									rows={2}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									placeholder="Bank name, account number, routing details"
								/>
							</div>

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
									placeholder="Business references with contact information"
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
									placeholder="Explain your motivation and how you plan to contribute to the platform"
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
					<div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary flex items-center"
						>
							<FaPaperPlane className="mr-2 h-4 w-4" />
							{loading ? "Submitting..." : "Submit Application"}
						</button>
					</div>
				</form>

				{/* Application Process Info */}
				<div className="bg-gray-50 border-t border-gray-200 p-6">
					<h3 className="text-sm font-medium text-gray-900 mb-2">
						Application Review Process
					</h3>
					<div className="text-sm text-gray-600 space-y-1">
						<p>
							1. <strong>Application Review:</strong> Our team will review your
							application within 5-7 business days
						</p>
						<p>
							2. <strong>Verification:</strong> We may contact you for
							additional information or verification
						</p>
						<p>
							3. <strong>Interview:</strong> Qualified candidates will be
							invited for a virtual interview
						</p>
						<p>
							4. <strong>Approval:</strong> Successful applicants will receive
							agent credentials and training materials
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
