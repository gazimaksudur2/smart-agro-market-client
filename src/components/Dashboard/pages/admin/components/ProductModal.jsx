import { useState } from "react";
import {
	FaCheck,
	FaTimes,
	FaBan,
	FaEdit,
	FaStar,
	FaTag,
	FaUser,
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaWarehouse,
	FaMoneyBillWave,
	FaInfoCircle,
	FaCertificate,
	FaImage,
	FaHistory,
	FaCheckCircle,
} from "react-icons/fa";
import {
	ModernModal,
	ActionButton,
	InfoCard,
	ImageGallery,
	DetailRow,
	TabPanel,
} from "./ModernModal";
import {
	StatusBadge,
	CategoryBadge,
	QualityBadge,
	VerificationBadge,
} from "./Badges";
import { ReasonModal } from "../../../../common/ReasonModal";

export const ProductModal = ({
	product,
	isOpen,
	onClose,
	onProductAction,
	isLoading = false,
}) => {
	const [activeTab, setActiveTab] = useState("overview");
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [currentAction, setCurrentAction] = useState(null);

	if (!product) return null;

	const formatCurrency = (value) => `৳${(value ?? 0).toLocaleString()}`;
	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
	const formatDateTime = (dateString) => new Date(dateString).toLocaleString();

	const handleAction = async (action, reason = "") => {
		if (action === "reject" || action === "suspend") {
			setCurrentAction(action);
			setShowReasonModal(true);
			return;
		}

		await onProductAction(product._id, action, reason);
		onClose();
	};

	const handleReasonConfirm = async (reason) => {
		await onProductAction(product._id, currentAction, reason);
		onClose();
	};

	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: FaInfoCircle,
			content: (
				<div className="space-y-6">
					{/* Product Images */}
					<ImageGallery images={product.images} title={product.title} />

					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<InfoCard title="Product Information" color="gray">
							<div className="space-y-3">
								<DetailRow label="Title" value={product.title} />
								<DetailRow
									label="Category"
									value={<CategoryBadge category={product.cropType} />}
								/>
								<DetailRow
									label="Quality"
									value={<QualityBadge quality={product.quality} />}
								/>
								<DetailRow
									label="Status"
									value={<StatusBadge status={product.status} />}
								/>
								{product.averageRating > 0 && (
									<DetailRow
										label="Rating"
										value={
											<div className="flex items-center">
												<FaStar className="h-4 w-4 text-yellow-400 mr-1" />
												<span>{product.averageRating}</span>
											</div>
										}
									/>
								)}
							</div>
						</InfoCard>

						<InfoCard title="Pricing & Stock" color="blue">
							<div className="space-y-3">
								<DetailRow
									label="Price"
									value={
										<span className="font-semibold text-green-600">
											{formatCurrency(product.pricePerUnit)}/{product.unit}
										</span>
									}
								/>
								<DetailRow
									label="Available Stock"
									value={`${product.availableStock} ${product.unit}`}
								/>
								<DetailRow
									label="Minimum Order"
									value={`${product.minimumOrderQuantity} ${product.unit}`}
								/>
								{product.harvestedOn && (
									<DetailRow
										label="Harvested On"
										value={formatDate(product.harvestedOn)}
									/>
								)}
							</div>
						</InfoCard>
					</div>

					{/* Description */}
					<InfoCard title="Description" color="green">
						<p className="text-gray-700 leading-relaxed">
							{product.description}
						</p>
					</InfoCard>

					{/* Specifications */}
					{product.specifications && (
						<InfoCard title="Specifications" color="purple">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{product.specifications.variety && (
									<DetailRow
										label="Variety"
										value={product.specifications.variety}
									/>
								)}
								{product.specifications.grade && (
									<DetailRow
										label="Grade"
										value={product.specifications.grade}
									/>
								)}
								{product.specifications.processingMethod && (
									<DetailRow
										label="Processing Method"
										value={product.specifications.processingMethod}
									/>
								)}
							</div>
						</InfoCard>
					)}

					{/* Timeline Information */}
					{product.timeline && (
						<InfoCard title="Timeline" color="blue">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<DetailRow
									label="Submitted At"
									value={formatDateTime(product.timeline.submittedAt)}
								/>
								<DetailRow
									label="Last Updated"
									value={formatDateTime(product.timeline.lastUpdated)}
								/>
							</div>
						</InfoCard>
					)}
				</div>
			),
		},
		{
			id: "seller",
			label: "Seller",
			icon: FaUser,
			content: (
				<InfoCard title="Seller Information" color="green">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<DetailRow label="Name" value={product.sellerInfo.name} />
							<DetailRow label="Email" value={product.sellerInfo.email} />
							{product.sellerInfo.phone && (
								<DetailRow label="Phone" value={product.sellerInfo.phone} />
							)}
							<DetailRow label="Seller ID" value={product.sellerInfo._id} />
							{product.sellerInfo.farmName && (
								<DetailRow
									label="Farm Name"
									value={product.sellerInfo.farmName}
								/>
							)}
						</div>
						<div className="space-y-3">
							{product.sellerInfo.operationalArea && (
								<>
									<DetailRow
										label="Region"
										value={product.sellerInfo.operationalArea.region}
									/>
									<DetailRow
										label="District"
										value={product.sellerInfo.operationalArea.district}
									/>
									{product.sellerInfo.operationalArea.upazila && (
										<DetailRow
											label="Upazila"
											value={product.sellerInfo.operationalArea.upazila}
										/>
									)}
									{product.sellerInfo.operationalArea.address && (
										<DetailRow
											label="Address"
											value={product.sellerInfo.operationalArea.address}
										/>
									)}
								</>
							)}
							<DetailRow
								label="Verification Status"
								value={
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
											product.sellerInfo.verificationStatus === "verified"
												? "bg-green-100 text-green-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{product.sellerInfo.verificationStatus === "verified" && (
											<FaCheckCircle className="mr-1" />
										)}
										{product.sellerInfo.verificationStatus || "Pending"}
									</span>
								}
							/>
							<DetailRow
								label="Rating"
								value={
									<div className="flex items-center">
										<FaStar className="h-4 w-4 text-yellow-400 mr-1" />
										<span>{product.sellerInfo.rating || 0}/5</span>
									</div>
								}
							/>
							<DetailRow
								label="Total Products"
								value={product.sellerInfo.totalProducts || 0}
							/>
						</div>
					</div>
				</InfoCard>
			),
		},
		{
			id: "details",
			label: "Details",
			icon: FaCertificate,
			content: (
				<div className="space-y-6">
					{/* Tags */}
					{product.tags && product.tags.length > 0 && (
						<InfoCard title="Tags" color="purple">
							<div className="flex flex-wrap gap-2">
								{product.tags.map((tag, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
									>
										<FaTag className="mr-1 h-3 w-3" />
										{tag}
									</span>
								))}
							</div>
						</InfoCard>
					)}

					{/* Approval Information */}
					{product.approvedBy && product.approvedBy.agentId && (
						<InfoCard title="Approval Information" color="green">
							<div className="space-y-3">
								<DetailRow
									label="Approved By Agent"
									value={product.approvedBy.agentId}
								/>
								<DetailRow
									label="Approved At"
									value={formatDateTime(product.approvedBy.approvedAt)}
								/>
								{product.approvalReason && (
									<DetailRow
										label="Approval Reason"
										value={product.approvalReason}
									/>
								)}
							</div>
						</InfoCard>
					)}

					{/* Status Reasons */}
					{(product.rejectionReason ||
						product.suspensionReason ||
						product.statusReason) && (
						<InfoCard title="Status Information" color="yellow">
							<div className="space-y-3">
								{product.rejectionReason && (
									<DetailRow
										label="Rejection Reason"
										value={product.rejectionReason}
									/>
								)}
								{product.suspensionReason && (
									<DetailRow
										label="Suspension Reason"
										value={product.suspensionReason}
									/>
								)}
								{product.statusReason && (
									<DetailRow
										label="Status Reason"
										value={product.statusReason}
									/>
								)}
							</div>
						</InfoCard>
					)}

					{/* Timestamps */}
					<InfoCard title="Timestamps" color="gray">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<DetailRow
								label="Created"
								value={
									<div className="flex items-center">
										<FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
										{formatDateTime(product.createdAt)}
									</div>
								}
							/>
							<DetailRow
								label="Last Updated"
								value={
									<div className="flex items-center">
										<FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
										{formatDateTime(product.updatedAt)}
									</div>
								}
							/>
							{product.lastModified && (
								<DetailRow
									label="Last Modified"
									value={formatDateTime(product.lastModified)}
								/>
							)}
							{product.lastModifiedBy && (
								<DetailRow
									label="Last Modified By"
									value={product.lastModifiedBy}
								/>
							)}
						</div>
					</InfoCard>
				</div>
			),
		},
		{
			id: "history",
			label: "History",
			icon: FaHistory,
			content: (
				<div className="space-y-6">
					{/* Admin History */}
					{product.adminHistory && product.adminHistory.length > 0 ? (
						<InfoCard title="Admin History" color="blue">
							<div className="space-y-4">
								{product.adminHistory.map((entry, index) => (
									<div
										key={entry._id || index}
										className="border-l-4 border-blue-500 pl-4 py-2"
									>
										<div className="flex items-center justify-between mb-2">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													entry.action === "approved"
														? "bg-green-100 text-green-800"
														: entry.action === "rejected"
														? "bg-red-100 text-red-800"
														: entry.action === "suspended"
														? "bg-yellow-100 text-yellow-800"
														: "bg-gray-100 text-gray-800"
												}`}
											>
												{entry.action.charAt(0).toUpperCase() +
													entry.action.slice(1)}
											</span>
											<span className="text-sm text-gray-500">
												{formatDateTime(entry.timestamp)}
											</span>
										</div>
										{entry.details?.reason && (
											<p className="text-sm text-gray-700 mb-1">
												<strong>Reason:</strong> {entry.details.reason}
											</p>
										)}
										{entry.details?.adminEmail && (
											<p className="text-sm text-gray-500">
												<strong>By:</strong> {entry.details.adminEmail}
											</p>
										)}
										{entry.details?.previousStatus && (
											<p className="text-sm text-gray-500">
												<strong>Previous Status:</strong>{" "}
												{entry.details.previousStatus}
											</p>
										)}
										{entry.details?.updatedFields &&
											entry.details.updatedFields.length > 0 && (
												<p className="text-sm text-gray-500">
													<strong>Updated Fields:</strong>{" "}
													{entry.details.updatedFields.join(", ")}
												</p>
											)}
									</div>
								))}
							</div>
						</InfoCard>
					) : (
						<InfoCard title="Admin History" color="gray">
							<p className="text-gray-500 text-center py-4">
								No admin history available
							</p>
						</InfoCard>
					)}
				</div>
			),
		},
	];

	const modalActions = [
		<ActionButton key="close" onClick={onClose} variant="outline">
			Close
		</ActionButton>,
		<ActionButton
			key="edit"
			onClick={() => alert("Edit functionality coming soon")}
			variant="primary"
			icon={FaEdit}
		>
			Edit Product
		</ActionButton>,
		...(product.status === "pending"
			? [
					<ActionButton
						key="approve"
						onClick={() => handleAction("approve")}
						variant="success"
						icon={FaCheck}
						loading={isLoading}
					>
						Approve
					</ActionButton>,
					<ActionButton
						key="reject"
						onClick={() => handleAction("reject")}
						variant="danger"
						icon={FaTimes}
						loading={isLoading}
					>
						Reject
					</ActionButton>,
			  ]
			: []),
		...(product.status === "approved"
			? [
					<ActionButton
						key="suspend"
						onClick={() => handleAction("suspend")}
						variant="warning"
						icon={FaBan}
						loading={isLoading}
					>
						Suspend
					</ActionButton>,
			  ]
			: []),
	];

	return (
		<>
			<ModernModal
				isOpen={isOpen}
				onClose={onClose}
				title={`Product Details - ${product.title}`}
				size="xlarge"
				actions={modalActions}
			>
				<TabPanel
					tabs={tabs}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
				/>
			</ModernModal>

			{/* Reason Modal */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={() => {
					setShowReasonModal(false);
					setCurrentAction(null);
				}}
				onConfirm={handleReasonConfirm}
				title={`${currentAction === "reject" ? "Reject" : "Suspend"} Product`}
				description={`Please provide a reason for ${
					currentAction === "reject" ? "rejecting" : "suspending"
				} "${
					product.title
				}". This will help the seller understand the decision.`}
				placeholder={
					currentAction === "reject"
						? "e.g., Poor quality images, incomplete description, price issues..."
						: "e.g., Policy violation, quality concerns, temporary restriction..."
				}
				confirmText={`${
					currentAction === "reject" ? "Reject" : "Suspend"
				} Product`}
				type="danger"
				isLoading={isLoading}
			/>
		</>
	);
};
