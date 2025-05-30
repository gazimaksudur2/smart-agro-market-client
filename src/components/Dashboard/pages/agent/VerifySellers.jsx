import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaUserCheck,
	FaSearch,
	FaFilter,
	FaEye,
	FaCheck,
	FaTimes,
	FaClock,
	FaUser,
	FaMapMarkerAlt,
	FaPhone,
	FaEnvelope,
	FaIdCard,
	FaStore,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import { ReasonModal } from "../../../common/ReasonModal";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending Review" },
		verified: { color: "green", text: "Verified" },
		rejected: { color: "red", text: "Rejected" },
		suspended: { color: "gray", text: "Suspended" },
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

export default function VerifySellers() {
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [filteredSellers, setFilteredSellers] = useState([]);
	const [selectedSeller, setSelectedSeller] = useState(null);

	// ReasonModal state
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [currentAction, setCurrentAction] = useState("");
	const [currentSellerId, setCurrentSellerId] = useState("");

	// Fetch seller applications for this agent's region
	const {
		data: sellers,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["sellerApplications", currentUser?.FirebaseUser?.uid],
		async () => {
			if (!currentUser?.FirebaseUser?.uid) return [];
			try {
				return await apiCall(
					`/agent/seller-applications/${currentUser.FirebaseUser.uid}`
				);
			} catch (error) {
				console.error("Error fetching seller applications:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.FirebaseUser?.uid,
		}
	);

	// Mock data for demo
	const mockSellers = [
		{
			id: "SELLER-2024-001",
			applicationDate: "2024-01-20",
			personalInfo: {
				name: "Rahman Ahmed",
				email: "rahman.ahmed@example.com",
				phone: "+8801712345678",
				nid: "1234567890123",
				address: "Village: Savar, Upazila: Savar, Dhaka",
			},
			businessInfo: {
				farmName: "Green Valley Organic Farm",
				farmSize: "5 acres",
				farmType: "Organic Vegetables",
				experience: "8 years",
				specialization: "Organic vegetables, rice, and seasonal fruits",
				certifications: "Organic Certification from BSTI",
			},
			location: {
				region: "Dhaka",
				district: "Dhaka",
				upazila: "Savar",
				village: "Savar",
			},
			documents: {
				nidCopy: "https://example.com/nid.jpg",
				farmPhotos: [
					"https://example.com/farm1.jpg",
					"https://example.com/farm2.jpg",
				],
				certifications: ["https://example.com/cert1.jpg"],
			},
			status: "pending",
			submittedAt: "2024-01-20T10:30:00Z",
		},
		{
			id: "SELLER-2024-002",
			applicationDate: "2024-01-18",
			personalInfo: {
				name: "Fatima Begum",
				email: "fatima.begum@example.com",
				phone: "+8801812345678",
				nid: "9876543210987",
				address: "Village: Keraniganj, Upazila: Keraniganj, Dhaka",
			},
			businessInfo: {
				farmName: "Sunrise Poultry & Dairy",
				farmSize: "3 acres",
				farmType: "Poultry & Dairy",
				experience: "12 years",
				specialization: "Chicken, eggs, milk, and dairy products",
				certifications: "Halal Certification, Veterinary License",
			},
			location: {
				region: "Dhaka",
				district: "Dhaka",
				upazila: "Keraniganj",
				village: "Keraniganj",
			},
			documents: {
				nidCopy: "https://example.com/nid2.jpg",
				farmPhotos: ["https://example.com/farm3.jpg"],
				certifications: ["https://example.com/cert2.jpg"],
			},
			status: "verified",
			submittedAt: "2024-01-18T14:20:00Z",
			verifiedAt: "2024-01-19T09:15:00Z",
		},
		{
			id: "SELLER-2024-003",
			applicationDate: "2024-01-15",
			personalInfo: {
				name: "Karim Uddin",
				email: "karim.uddin@example.com",
				phone: "+8801912345678",
				nid: "5555666677778",
				address: "Village: Manikganj, Upazila: Manikganj, Dhaka",
			},
			businessInfo: {
				farmName: "Golden Harvest Fish Farm",
				farmSize: "2 acres",
				farmType: "Fish Farming",
				experience: "6 years",
				specialization: "Rohu, Katla, Tilapia, and other freshwater fish",
				certifications: "Aquaculture License",
			},
			location: {
				region: "Dhaka",
				district: "Manikganj",
				upazila: "Manikganj",
				village: "Manikganj",
			},
			documents: {
				nidCopy: "https://example.com/nid3.jpg",
				farmPhotos: [
					"https://example.com/farm4.jpg",
					"https://example.com/farm5.jpg",
				],
				certifications: ["https://example.com/cert3.jpg"],
			},
			status: "pending",
			submittedAt: "2024-01-15T11:45:00Z",
		},
	];

	const displaySellers = sellers || mockSellers;

	// Filter sellers
	useEffect(() => {
		let filtered = displaySellers;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(seller) =>
					seller.personalInfo.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					seller.personalInfo.email
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					seller.businessInfo.farmName
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					seller.id.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((seller) => seller.status === statusFilter);
		}

		setFilteredSellers(filtered);
	}, [displaySellers, searchTerm, statusFilter]);

	const handleSellerAction = async (sellerId, action, reason = "") => {
		try {
			await apiCall(
				`/agent/seller-applications/${sellerId}/${action}`,
				"PATCH",
				{
					reason,
					agentId: currentUser?.DBUser?._id,
				}
			);
			refetch();
			alert(`Seller application ${action} successfully!`);
		} catch (error) {
			console.error(`Error ${action} seller:`, error);
			alert(`Failed to ${action} seller application. Please try again.`);
		}
	};

	const handleReasonConfirm = (reason) => {
		handleSellerAction(currentSellerId, currentAction, reason);
		setShowReasonModal(false);
		setCurrentAction("");
		setCurrentSellerId("");
	};

	const handleReasonCancel = () => {
		setShowReasonModal(false);
		setCurrentAction("");
		setCurrentSellerId("");
	};

	const getSellerStats = () => {
		return {
			total: filteredSellers.length,
			pending: filteredSellers.filter((seller) => seller.status === "pending")
				.length,
			verified: filteredSellers.filter((seller) => seller.status === "verified")
				.length,
			rejected: filteredSellers.filter((seller) => seller.status === "rejected")
				.length,
		};
	};

	const stats = getSellerStats();

	if (isLoading) {
		return (
			<div className="py-6">
				<DashboardTitle title="Verify Sellers" />
				<div className="mt-6 flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<DashboardTitle title="Verify Sellers" />

			{/* Stats Cards */}
			<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaUser className="h-6 w-6 text-primary-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Applications
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.total}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaClock className="h-6 w-6 text-yellow-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Pending Review
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.pending}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaUserCheck className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Verified
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.verified}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<FaTimes className="h-6 w-6 text-red-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Rejected
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{stats.rejected}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mt-6 bg-white shadow rounded-lg p-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaSearch className="inline mr-1" />
							Search Applications
						</label>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search by name, email, farm name, or ID..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<FaFilter className="inline mr-1" />
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending Review</option>
							<option value="verified">Verified</option>
							<option value="rejected">Rejected</option>
							<option value="suspended">Suspended</option>
						</select>
					</div>
				</div>
			</div>

			{/* Seller Applications List */}
			<div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Seller Applications
					</h3>
				</div>

				{filteredSellers.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						<FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p>No seller applications found matching your criteria.</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredSellers.map((seller) => (
							<div key={seller.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h4 className="text-lg font-medium text-gray-900">
											{seller.personalInfo.name}
										</h4>
										<p className="text-sm text-gray-500">
											Application ID: {seller.id}
										</p>
										<p className="text-sm text-gray-500">
											Submitted on{" "}
											{new Date(seller.submittedAt).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<StatusBadge status={seller.status} />
									</div>
								</div>

								{/* Personal Information */}
								<div className="mb-4 p-4 bg-gray-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaUser className="inline mr-1" />
										Personal Information
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p>
												<FaEnvelope className="inline mr-1" />
												<strong>Email:</strong> {seller.personalInfo.email}
											</p>
											<p>
												<FaPhone className="inline mr-1" />
												<strong>Phone:</strong> {seller.personalInfo.phone}
											</p>
										</div>
										<div>
											<p>
												<FaIdCard className="inline mr-1" />
												<strong>NID:</strong> {seller.personalInfo.nid}
											</p>
											<p>
												<FaMapMarkerAlt className="inline mr-1" />
												<strong>Address:</strong> {seller.personalInfo.address}
											</p>
										</div>
									</div>
								</div>

								{/* Business Information */}
								<div className="mb-4 p-4 bg-blue-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaStore className="inline mr-1" />
										Business Information
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p>
												<strong>Farm Name:</strong>{" "}
												{seller.businessInfo.farmName}
											</p>
											<p>
												<strong>Farm Size:</strong>{" "}
												{seller.businessInfo.farmSize}
											</p>
											<p>
												<strong>Farm Type:</strong>{" "}
												{seller.businessInfo.farmType}
											</p>
										</div>
										<div>
											<p>
												<strong>Experience:</strong>{" "}
												{seller.businessInfo.experience}
											</p>
											<p>
												<strong>Specialization:</strong>{" "}
												{seller.businessInfo.specialization}
											</p>
											<p>
												<strong>Certifications:</strong>{" "}
												{seller.businessInfo.certifications}
											</p>
										</div>
									</div>
								</div>

								{/* Location Information */}
								<div className="mb-4 p-4 bg-green-50 rounded-lg">
									<h5 className="font-medium text-gray-900 mb-2">
										<FaMapMarkerAlt className="inline mr-1" />
										Location Details
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
										<p>
											<strong>Region:</strong> {seller.location.region}
										</p>
										<p>
											<strong>District:</strong> {seller.location.district}
										</p>
										<p>
											<strong>Upazila:</strong> {seller.location.upazila}
										</p>
										<p>
											<strong>Village:</strong> {seller.location.village}
										</p>
									</div>
								</div>

								{/* Documents */}
								<div className="mb-4">
									<h5 className="font-medium text-gray-900 mb-2">Documents</h5>
									<div className="flex flex-wrap gap-2">
										<a
											href={seller.documents.nidCopy}
											target="_blank"
											rel="noopener noreferrer"
											className="btn btn-outline-primary btn-sm"
										>
											View NID Copy
										</a>
										{seller.documents.farmPhotos.map((photo, index) => (
											<a
												key={index}
												href={photo}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-outline-secondary btn-sm"
											>
												Farm Photo {index + 1}
											</a>
										))}
										{seller.documents.certifications.map((cert, index) => (
											<a
												key={index}
												href={cert}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-outline-accent btn-sm"
											>
												Certificate {index + 1}
											</a>
										))}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center space-x-3">
									<button
										onClick={() => setSelectedSeller(seller)}
										className="btn btn-outline-primary btn-sm"
									>
										<FaEye className="mr-1 h-4 w-4" />
										View Details
									</button>

									{seller.status === "pending" && (
										<>
											<button
												onClick={() => handleSellerAction(seller.id, "verify")}
												disabled={apiLoading}
												className="btn btn-success btn-sm"
											>
												<FaCheck className="mr-1 h-4 w-4" />
												Verify Seller
											</button>
											<button
												onClick={() => {
													setCurrentSellerId(seller.id);
													setCurrentAction("reject");
													setShowReasonModal(true);
												}}
												disabled={apiLoading}
												className="btn btn-outline-red btn-sm"
											>
												<FaTimes className="mr-1 h-4 w-4" />
												Reject Application
											</button>
										</>
									)}

									{seller.status === "verified" && (
										<button
											onClick={() => {
												setCurrentSellerId(seller.id);
												setCurrentAction("suspend");
												setShowReasonModal(true);
											}}
											disabled={apiLoading}
											className="btn btn-outline-red btn-sm"
										>
											Suspend Seller
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Seller Detail Modal */}
			{selectedSeller && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Seller Application Details -{" "}
									{selectedSeller.personalInfo.name}
								</h3>
								<button
									onClick={() => setSelectedSeller(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<FaTimes className="h-6 w-6" />
								</button>
							</div>

							{/* Detailed modal content would go here */}
							<div className="text-sm text-gray-600">
								<p>
									Detailed seller application information would be displayed
									here...
								</p>
								<p>
									This would include all documents, verification history, and
									detailed business information.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ReasonModal */}
			<ReasonModal
				isOpen={showReasonModal}
				onClose={handleReasonCancel}
				onConfirm={handleReasonConfirm}
				title={`${
					currentAction === "reject" ? "Reject" : "Suspend"
				} Seller Application`}
				description={`Please provide a reason for ${
					currentAction === "reject" ? "rejecting" : "suspending"
				} this seller application. This will help the seller understand the decision and improve future applications.`}
				placeholder={
					currentAction === "reject"
						? "e.g., Incomplete documentation, insufficient experience, location restrictions..."
						: "e.g., Policy violation, suspicious activity, verification concerns..."
				}
				confirmText={`${
					currentAction === "reject" ? "Reject" : "Suspend"
				} Application`}
				type="danger"
				isLoading={apiLoading}
			/>
		</div>
	);
}
