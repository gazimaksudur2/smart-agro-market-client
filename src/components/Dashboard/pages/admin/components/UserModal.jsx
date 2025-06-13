import { useState } from "react";
import {
	FaCheck,
	FaBan,
	FaEdit,
	FaUser,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaInfoCircle,
	FaIdCard,
	FaHistory,
} from "react-icons/fa";
import {
	ModernModal,
	ActionButton,
	InfoCard,
	DetailRow,
	TabPanel,
} from "./ModernModal";
import { StatusBadge, RoleBadge, VerificationBadge } from "./Badges";
import { ReasonModal } from "../../../../common/ReasonModal";

export const UserModal = ({
	user,
	isOpen,
	onClose,
	onUserAction,
	isLoading = false,
}) => {
	const [activeTab, setActiveTab] = useState("overview");
	const [showSuspendReasonModal, setShowSuspendReasonModal] = useState(false);

	if (!user) return null;

	const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
	const formatAddress = (address) => {
		if (!address) return "No address provided";
		const { street, city, state, zip } = address;
		return `${street || ""}, ${city || ""}, ${state || ""} ${
			zip || ""
		}`.replace(/^,\s*|,\s*$/g, "");
	};
	const formatOperationalArea = (operationalArea) => {
		if (!operationalArea) return "Not specified";
		const { region, district } = operationalArea;
		return `${region || ""}, ${district || ""}`.replace(/^,\s*|,\s*$/g, "");
	};

	const handleAction = async (action, reason = "") => {
		if (action === "suspend") {
			setShowSuspendReasonModal(true);
			return;
		}

		await onUserAction(user._id, action, reason);
		onClose();
	};

	const handleSuspend = async (reason) => {
		await onUserAction(user._id, "suspend", reason);
		onClose();
	};

	const tabs = [
		{
			id: "overview",
			label: "Overview",
			icon: FaInfoCircle,
			content: (
				<div className="space-y-6">
					{/* User Profile */}
					<div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
						<img
							src={
								user.profilePicture ||
								`https://ui-avatars.com/api/?name=${encodeURIComponent(
									user.name
								)}&background=6366f1&color=fff&size=128`
							}
							alt={user.name}
							className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
							onError={(e) => {
								e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
									user.name
								)}&background=6366f1&color=fff&size=128`;
							}}
						/>
						<div className="flex-1">
							<h4 className="text-2xl font-bold text-gray-900 mb-2">
								{user.name}
							</h4>
							<p className="text-gray-600 mb-3">{user.email}</p>
							<div className="flex items-center space-x-3">
								<RoleBadge role={user.role} />
								<StatusBadge isActive={user.isActive} type="user" />
								<VerificationBadge verified={user.verified} />
							</div>
						</div>
					</div>

					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<InfoCard title="Contact Information" color="blue">
							<div className="space-y-3">
								<DetailRow
									label="Email"
									value={
										<div className="flex items-center">
											<FaEnvelope className="mr-2 h-3 w-3 text-gray-400" />
											{user.email}
										</div>
									}
								/>
								{user.phoneNumber && (
									<DetailRow
										label="Phone"
										value={
											<div className="flex items-center">
												<FaPhone className="mr-2 h-3 w-3 text-gray-400" />
												{user.phoneNumber}
											</div>
										}
									/>
								)}
								<DetailRow
									label="Address"
									value={
										<div className="flex items-start">
											<FaMapMarkerAlt className="mr-2 h-3 w-3 text-gray-400 mt-0.5" />
											<span className="text-sm">
												{formatAddress(user.address)}
											</span>
										</div>
									}
								/>
							</div>
						</InfoCard>

						<InfoCard title="Account Information" color="green">
							<div className="space-y-3">
								<DetailRow
									label="Provider"
									value={user.provider || "email-pass"}
								/>
								<DetailRow
									label="Firebase UID"
									value={user.firebaseUID || "N/A"}
								/>
								<DetailRow
									label="Verified"
									value={user.verified ? "Yes" : "No"}
								/>
								<DetailRow
									label="Active"
									value={user.isActive ? "Yes" : "No"}
								/>
							</div>
						</InfoCard>
					</div>
				</div>
			),
		},
		{
			id: "details",
			label: "Details",
			icon: FaIdCard,
			content: (
				<div className="space-y-6">
					{/* Operational Area */}
					{user.operationalArea && (
						<InfoCard title="Operational Area" color="purple">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<DetailRow label="Region" value={user.operationalArea.region} />
								<DetailRow
									label="District"
									value={user.operationalArea.district}
								/>
							</div>
						</InfoCard>
					)}

					{/* Full Address Details */}
					{user.address && (
						<InfoCard title="Address Details" color="blue">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{user.address.street && (
									<DetailRow label="Street" value={user.address.street} />
								)}
								{user.address.city && (
									<DetailRow label="City" value={user.address.city} />
								)}
								{user.address.state && (
									<DetailRow label="State" value={user.address.state} />
								)}
								{user.address.zip && (
									<DetailRow label="ZIP Code" value={user.address.zip} />
								)}
								{user.address.country && (
									<DetailRow label="Country" value={user.address.country} />
								)}
								{user.fullAddress && (
									<DetailRow label="Full Address" value={user.fullAddress} />
								)}
							</div>
						</InfoCard>
					)}

					{/* Timestamps */}
					<InfoCard title="Account Timeline" color="gray">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<DetailRow
								label="Created"
								value={
									<div className="flex items-center">
										<FaCalendarAlt className="mr-2 h-3 w-3 text-gray-400" />
										{formatDate(user.createdAt)}
									</div>
								}
							/>
							<DetailRow
								label="Last Updated"
								value={
									<div className="flex items-center">
										<FaCalendarAlt className="mr-2 h-3 w-3 text-gray-400" />
										{formatDate(user.updatedAt)}
									</div>
								}
							/>
						</div>
					</InfoCard>

					{/* Technical Details */}
					<InfoCard title="Technical Information" color="yellow">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<DetailRow label="User ID" value={user._id} />
							<DetailRow
								label="Firebase UID"
								value={user.firebaseUID || "Not linked"}
							/>
							<DetailRow
								label="Auth Provider"
								value={user.provider || "email-password"}
							/>
							<DetailRow label="Version" value={user.__v || "0"} />
						</div>
					</InfoCard>
				</div>
			),
		},
		{
			id: "activity",
			label: "Activity",
			icon: FaHistory,
			content: (
				<div className="space-y-6">
					<InfoCard title="Recent Activity" color="gray">
						<div className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center">
									<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
										<FaUser className="h-4 w-4 text-blue-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">
											Account Created
										</p>
										<p className="text-xs text-gray-500">
											{formatDate(user.createdAt)}
										</p>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center">
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
										<FaEdit className="h-4 w-4 text-green-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">
											Profile Updated
										</p>
										<p className="text-xs text-gray-500">
											{formatDate(user.updatedAt)}
										</p>
									</div>
								</div>
							</div>

							{user.verified && (
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div className="flex items-center">
										<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
											<FaCheck className="h-4 w-4 text-green-600" />
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												Account Verified
											</p>
											<p className="text-xs text-gray-500">
												Email verification completed
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="text-center py-8 text-gray-500">
								<FaHistory className="mx-auto h-8 w-8 mb-2" />
								<p className="text-sm">
									More detailed activity logs coming soon
								</p>
							</div>
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
			Edit User
		</ActionButton>,
		...(user.isActive
			? [
					<ActionButton
						key="suspend"
						onClick={() => handleAction("suspend")}
						variant="danger"
						icon={FaBan}
						loading={isLoading}
					>
						Suspend User
					</ActionButton>,
			  ]
			: [
					<ActionButton
						key="activate"
						onClick={() => handleAction("activate")}
						variant="success"
						icon={FaCheck}
						loading={isLoading}
					>
						Activate User
					</ActionButton>,
			  ]),
	];

	return (
		<>
			<ModernModal
				isOpen={isOpen}
				onClose={onClose}
				title={`User Details - ${user.name}`}
				size="xlarge"
				actions={modalActions}
			>
				<TabPanel
					tabs={tabs}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
				/>
			</ModernModal>

			{/* Suspend Reason Modal */}
			<ReasonModal
				isOpen={showSuspendReasonModal}
				onClose={() => setShowSuspendReasonModal(false)}
				onConfirm={handleSuspend}
				title="Suspend User"
				description={`Please provide a reason for suspending ${user.name}'s account. The user will be notified and their account will be temporarily disabled.`}
				placeholder="e.g., Violation of terms of service, suspicious activity, temporary restriction..."
				confirmText="Suspend User"
				type="danger"
				isLoading={isLoading}
			/>
		</>
	);
};
