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
} from "react-icons/fa";
import {
	ModernModal,
	ActionButton,
	InfoCard,
	ImageGallery,
	DetailRow,
	TabPanel,
} from "./ModernModal";
import { StatusBadge, QualityBadge, CategoryBadge } from "./Badges";

export const ProductModal = ({
	product,
	isOpen,
	onClose,
	onProductAction,
	isLoading = false,
}) => {
	const [activeTab, setActiveTab] = useState("overview");

	if (!product) return null;

	const formatCurrency = (value) => `৳${value.toLocaleString()}`;
	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

	const handleAction = async (action, reason = "") => {
		if (action === "reject" || action === "suspend") {
			const userReason = prompt(
				`Please provide a reason for ${action}ing this product:`
			);
			if (!userReason) return;
			reason = userReason;
		}

		await onProductAction(product._id, action, reason);
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
								</>
							)}
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
						<InfoCard title="Approval Information" color="yellow">
							<div className="space-y-3">
								<DetailRow
									label="Approved By Agent"
									value={product.approvedBy.agentId}
								/>
								<DetailRow
									label="Approved At"
									value={formatDate(product.approvedBy.approvedAt)}
								/>
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
										{formatDate(product.createdAt)}
									</div>
								}
							/>
							<DetailRow
								label="Last Updated"
								value={
									<div className="flex items-center">
										<FaCalendarAlt className="mr-1 h-3 w-3 text-gray-400" />
										{formatDate(product.updatedAt)}
									</div>
								}
							/>
						</div>
					</InfoCard>
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
		<ModernModal
			isOpen={isOpen}
			onClose={onClose}
			title={`Product Details - ${product.title}`}
			size="xlarge"
			actions={modalActions}
		>
			<TabPanel tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
		</ModernModal>
	);
};
