import { useState } from "react";
import {
	FaTimes,
	FaUser,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaBuilding,
	FaIdCard,
	FaSeedling,
	FaTractor,
	FaWarehouse,
	FaTruck,
	FaCalendarAlt,
	FaClock,
	FaCheckCircle,
	FaTimesCircle,
	FaExclamationCircle,
	FaExpand,
	FaCompress,
	FaCheck,
	FaTimes as FaReject,
	FaEye,
	FaBriefcase,
	FaGraduationCap,
	FaCamera,
	FaFile,
	FaUsers,
	FaHeart,
	FaImages,
	FaCertificate,
	FaExclamationTriangle,
	FaExternalLinkAlt,
} from "react-icons/fa";
import { ModernModal, ActionButton, InfoCard, DetailRow } from "./ModernModal";
import { ReasonModal } from "../../../../common/ReasonModal";

// Simple TabContent component for showing/hiding tab content
const TabContent = ({ isActive, children }) => {
	if (!isActive) return null;
	return <div>{children}</div>;
};

export const ApplicationModal = ({
	application,
	isOpen,
	onClose,
	onApprove,
	onReject,
	isLoading = false,
}) => {
	const [activeTab, setActiveTab] = useState("overview");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showReasonModal, setShowReasonModal] = useState(false);

	if (!application) return null;

	const getStatusIcon = (status) => {
		switch (status) {
			case "approved":
				return <FaCheckCircle className="h-5 w-5 text-green-600" />;
			case "rejected":
				return <FaTimesCircle className="h-5 w-5 text-red-600" />;
			default:
				return <FaExclamationCircle className="h-5 w-5 text-yellow-600" />;
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "approved":
				return "text-green-800 bg-green-100 border-green-200";
			case "rejected":
				return "text-red-800 bg-red-100 border-red-200";
			default:
				return "text-yellow-800 bg-yellow-100 border-yellow-200";
		}
	};

	const isSellerApplication =
		application.applicationType === "seller-application";
	const formData = application.formData || {};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const tabs = [
		{ id: "overview", label: "Overview", icon: FaUser },
		{
			id: "details",
			label: isSellerApplication ? "Farm Details" : "Business Details",
			icon: isSellerApplication ? FaSeedling : FaBuilding,
		},
		{ id: "documents", label: "Documents", icon: FaFile },
		{ id: "raw", label: "Raw Data", icon: FaEye },
	];

	const handleReject = (reason) => {
		onReject(application._id, reason);
	};

	return (
		<>
			<ModernModal
				isOpen={isOpen}
				onClose={onClose}
				title={`${isSellerApplication ? "Seller" : "Agent"} Application`}
				isFullscreen={isFullscreen}
				onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
			>
				<div className="flex flex-col h-full">
					{/* Header with Applicant Info */}
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
						<div className="flex items-center space-x-4">
							<div className="relative">
								<img
									src={
										application.applicantImg ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(
											application.applicantName
										)}&background=6366f1&color=fff&size=80`
									}
									alt={application.applicantName}
									className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
									onError={(e) => {
										e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
											application.applicantName
										)}&background=6366f1&color=fff&size=80`;
									}}
								/>
								<div className="absolute -bottom-1 -right-1">
									{isSellerApplication ? (
										<div className="bg-green-500 text-white rounded-full p-1.5">
											<FaSeedling className="h-3 w-3" />
										</div>
									) : (
										<div className="bg-blue-500 text-white rounded-full p-1.5">
											<FaBriefcase className="h-3 w-3" />
										</div>
									)}
								</div>
							</div>
							<div className="flex-1">
								<h3 className="text-2xl font-bold text-gray-900 mb-1">
									{application.applicantName}
								</h3>
								<p className="text-gray-600 mb-2 flex items-center">
									<FaEnvelope className="h-4 w-4 mr-2" />
									{application.applicantEmail}
								</p>
								<div className="flex items-center space-x-4">
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
											application.status
										)}`}
									>
										{getStatusIcon(application.status)}
										<span className="ml-2 capitalize">
											{application.status}
										</span>
									</span>
									<span className="text-sm text-gray-500 flex items-center">
										<FaMapMarkerAlt className="h-4 w-4 mr-1" />
										{application.operationalArea.district},{" "}
										{application.operationalArea.region}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Tab Navigation */}
					<div className="border-b border-gray-200 mb-6">
						<nav className="-mb-px flex space-x-8">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
											activeTab === tab.id
												? "border-blue-500 text-blue-600"
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										}`}
									>
										<Icon className="inline h-4 w-4 mr-2" />
										{tab.label}
									</button>
								);
							})}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto">
						<TabContent isActive={activeTab === "overview"}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Application Info */}
								<InfoCard
									title="Application Information"
									color="blue"
									icon={FaIdCard}
								>
									<DetailRow label="Application ID" value={application._id} />
									<DetailRow
										label="Application Type"
										value={
											<span className="capitalize">
												{application.applicationType.replace("-", " ")}
											</span>
										}
									/>
									<DetailRow
										label="Submitted"
										value={
											<span className="flex items-center">
												<FaCalendarAlt className="h-4 w-4 mr-1 text-gray-400" />
												{formatDate(application.createdAt)}
											</span>
										}
									/>
									{application.updatedAt !== application.createdAt && (
										<DetailRow
											label="Last Updated"
											value={
												<span className="flex items-center">
													<FaClock className="h-4 w-4 mr-1 text-gray-400" />
													{formatDate(application.updatedAt)}
												</span>
											}
										/>
									)}
								</InfoCard>

								{/* Location Info */}
								<InfoCard
									title="Location Details"
									color="green"
									icon={FaMapMarkerAlt}
								>
									<DetailRow
										label="Region"
										value={application.operationalArea.region}
									/>
									<DetailRow
										label="District"
										value={application.operationalArea.district}
									/>
									{formData.upazila && (
										<DetailRow label="Upazila" value={formData.upazila} />
									)}
									{formData.village && (
										<DetailRow label="Village" value={formData.village} />
									)}
								</InfoCard>
							</div>
						</TabContent>

						<TabContent isActive={activeTab === "details"}>
							{isSellerApplication ? (
								// Seller Application Details
								<div className="space-y-6">
									<InfoCard
										title="Farm Information"
										color="green"
										icon={FaSeedling}
									>
										<DetailRow label="Farm Name" value={formData.farmName} />
										<DetailRow label="Farm Type" value={formData.farmType} />
										<DetailRow label="Farm Size" value={formData.farmSize} />
										<DetailRow label="Experience" value={formData.experience} />
										<DetailRow
											label="Farm Address"
											value={formData.farmAddress}
										/>
									</InfoCard>

									<InfoCard
										title="Specialization & Certifications"
										color="blue"
										icon={FaGraduationCap}
									>
										<DetailRow
											label="Specialization"
											value={formData.specialization}
										/>
										<DetailRow
											label="Certifications"
											value={formData.certifications || "None specified"}
										/>
									</InfoCard>

									<InfoCard
										title="Personal Information"
										color="purple"
										icon={FaUser}
									>
										<DetailRow label="NID Number" value={formData.nidNumber} />
										<DetailRow
											label="Bank Account Details"
											value={formData.bankAccountDetails}
										/>
										<DetailRow label="References" value={formData.references} />
									</InfoCard>

									<InfoCard title="Motivation" color="orange" icon={FaHeart}>
										<p className="text-gray-700 leading-relaxed">
											{formData.motivation || "No motivation provided"}
										</p>
									</InfoCard>
								</div>
							) : (
								// Agent Application Details
								<div className="space-y-6">
									<InfoCard
										title="Business Information"
										color="blue"
										icon={FaBuilding}
									>
										<DetailRow
											label="Business Name"
											value={formData.businessName}
										/>
										<DetailRow
											label="Business Type"
											value={formData.businessType}
										/>
										<DetailRow label="Experience" value={formData.experience} />
										<DetailRow
											label="Coverage Areas"
											value={formData.coverageAreas}
										/>
									</InfoCard>

									<InfoCard
										title="Warehouse Details"
										color="purple"
										icon={FaWarehouse}
									>
										<DetailRow
											label="Warehouse Address"
											value={formData.warehouseAddress}
										/>
										<DetailRow
											label="Warehouse Size"
											value={formData.warehouseSize}
										/>
									</InfoCard>

									<InfoCard
										title="Business Documents"
										color="green"
										icon={FaFile}
									>
										<DetailRow
											label="Business License"
											value={formData.businessLicense || "Not provided"}
										/>
										<DetailRow
											label="Bank Account Details"
											value={formData.bankAccountDetails}
										/>
										<DetailRow label="References" value={formData.references} />
									</InfoCard>

									<InfoCard title="Motivation" color="orange" icon={FaHeart}>
										<p className="text-gray-700 leading-relaxed">
											{formData.motivation || "No motivation provided"}
										</p>
									</InfoCard>
								</div>
							)}
						</TabContent>

						<TabContent isActive={activeTab === "documents"}>
							<div className="space-y-6">
								{/* NID Copy Section */}
								<InfoCard
									title="National ID Document"
									color="blue"
									icon={FaIdCard}
								>
									{formData.nidCopy ? (
										<div className="space-y-3">
											<div className="relative group">
												<img
													src={formData.nidCopy}
													alt="National ID Copy"
													className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
													onClick={() =>
														window.open(formData.nidCopy, "_blank")
													}
												/>
												<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:bg-opacity-20">
													<FaEye className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity duration-200" />
												</div>
											</div>
											<button
												onClick={() => window.open(formData.nidCopy, "_blank")}
												className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
											>
												<FaExternalLinkAlt className="mr-1.5" size={12} />
												View Full Document
											</button>
										</div>
									) : (
										<div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
											<div className="text-center">
												<FaExclamationTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
												<p className="text-sm text-gray-500">
													No NID copy uploaded
												</p>
											</div>
										</div>
									)}
								</InfoCard>

								{/* Business License Section (Agent only) */}
								{!isSellerApplication && (
									<InfoCard
										title="Business License"
										color="green"
										icon={FaCertificate}
									>
										{formData.businessLicense ? (
											<div className="space-y-3">
												<div className="relative group">
													<img
														src={formData.businessLicense}
														alt="Business License"
														className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
														onClick={() =>
															window.open(formData.businessLicense, "_blank")
														}
													/>
													<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:bg-opacity-20">
														<FaEye className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity duration-200" />
													</div>
												</div>
												<button
													onClick={() =>
														window.open(formData.businessLicense, "_blank")
													}
													className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
												>
													<FaExternalLinkAlt className="mr-1.5" size={12} />
													View Full License
												</button>
											</div>
										) : (
											<div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
												<div className="text-center">
													<FaExclamationTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
													<p className="text-sm text-gray-500">
														No business license uploaded
													</p>
												</div>
											</div>
										)}
									</InfoCard>
								)}

								{/* Photos/Images Section */}
								<InfoCard
									title={
										isSellerApplication ? "Farm Photos" : "Warehouse Images"
									}
									color="purple"
									icon={FaImages}
								>
									{(() => {
										const images =
											formData.farmPhotos || formData.warehouseImages;
										if (images && images.length > 0) {
											return (
												<div className="space-y-4">
													<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
														{images.map((image, index) => (
															<div key={index} className="relative group">
																<img
																	src={image}
																	alt={`${
																		isSellerApplication ? "Farm" : "Warehouse"
																	} photo ${index + 1}`}
																	className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
																	onClick={() => window.open(image, "_blank")}
																/>
																<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer">
																	<FaEye className="text-white opacity-0 group-hover:opacity-100 text-lg transition-opacity duration-200" />
																</div>
																<div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
																	{index + 1}
																</div>
															</div>
														))}
													</div>
													<div className="flex items-center justify-between pt-2 border-t border-gray-100">
														<span className="text-sm text-gray-600">
															{images.length} image
															{images.length !== 1 ? "s" : ""} uploaded
														</span>
														<button
															onClick={() => {
																images.forEach((image, index) => {
																	setTimeout(
																		() => window.open(image, "_blank"),
																		index * 100
																	);
																});
															}}
															className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
														>
															<FaExternalLinkAlt className="mr-1.5" size={12} />
															View All Images
														</button>
													</div>
												</div>
											);
										} else {
											return (
												<div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
													<div className="text-center">
														<FaImages className="mx-auto h-8 w-8 text-gray-400 mb-2" />
														<p className="text-sm text-gray-500">
															No{" "}
															{isSellerApplication
																? "farm photos"
																: "warehouse images"}{" "}
															uploaded
														</p>
													</div>
												</div>
											);
										}
									})()}
								</InfoCard>

								<InfoCard
									title="Document Status"
									color="green"
									icon={FaCheckCircle}
								>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-gray-700">
												NID Copy
											</span>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													formData.nidCopy
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{formData.nidCopy ? "Uploaded" : "Missing"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-gray-700">
												{isSellerApplication
													? "Farm Photos"
													: "Warehouse Images"}
											</span>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													formData.farmPhotos || formData.warehouseImages
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{formData.farmPhotos || formData.warehouseImages
													? "Uploaded"
													: "Missing"}
											</span>
										</div>
										{!isSellerApplication && (
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-700">
													Business License
												</span>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														formData.businessLicense
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{formData.businessLicense ? "Uploaded" : "Missing"}
												</span>
											</div>
										)}
									</div>
								</InfoCard>
							</div>
						</TabContent>

						<TabContent isActive={activeTab === "raw"}>
							<InfoCard title="Raw Application Data" color="gray" icon={FaEye}>
								<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
									<pre className="text-xs text-gray-600 overflow-auto max-h-96 whitespace-pre-wrap">
										{JSON.stringify(application, null, 2)}
									</pre>
								</div>
							</InfoCard>
						</TabContent>
					</div>

					{/* Action Buttons */}
					{application.status === "pending" && (
						<div className="border-t border-gray-200 pt-6 mt-6">
							<div className="flex justify-end space-x-3">
								<ActionButton
									variant="danger"
									onClick={() => setShowReasonModal(true)}
									disabled={isLoading}
									icon={FaReject}
								>
									Reject Application
								</ActionButton>
								<ActionButton
									variant="success"
									onClick={() => onApprove(application._id)}
									disabled={isLoading}
									icon={FaCheck}
								>
									Approve Application
								</ActionButton>
							</div>
						</div>
					)}
				</div>
			</ModernModal>

			{/* Reason Modal for Rejection */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={() => setShowReasonModal(false)}
				onConfirm={handleReject}
				title="Reject Application"
				description={`Please provide a reason for rejecting ${
					application.applicantName
				}'s ${
					isSellerApplication ? "seller" : "agent"
				} application. This will help them understand the decision and improve future applications.`}
				placeholder="e.g., Incomplete documentation, insufficient experience, location restrictions..."
				confirmText="Reject Application"
				type="danger"
				isLoading={isLoading}
			/>
		</>
	);
};
