import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
	FaUser,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaEdit,
	FaSave,
	FaTimes,
} from "react-icons/fa";
import DashboardTitle from "../DashboardTitle";

export default function Profile() {
	const { currentUser } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		displayName: currentUser?.FirebaseUser?.displayName || "",
		email: currentUser?.FirebaseUser?.email || "",
		phone: currentUser?.DBUser?.phone || "",
		address: currentUser?.DBUser?.address || "",
		region: currentUser?.DBUser?.region || "",
		district: currentUser?.DBUser?.district || "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = () => {
		// TODO: Implement profile update API call
		console.log("Saving profile data:", formData);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setFormData({
			displayName: currentUser?.FirebaseUser?.displayName || "",
			email: currentUser?.FirebaseUser?.email || "",
			phone: currentUser?.DBUser?.phone || "",
			address: currentUser?.DBUser?.address || "",
			region: currentUser?.DBUser?.region || "",
			district: currentUser?.DBUser?.district || "",
		});
		setIsEditing(false);
	};

	return (
		<div className="py-6">
			<div className="flex items-center justify-between mb-6">
				<DashboardTitle title="My Profile" />
				{!isEditing ? (
					<button
						onClick={() => setIsEditing(true)}
						className="btn btn-primary flex items-center"
					>
						<FaEdit className="mr-2 h-4 w-4" />
						Edit Profile
					</button>
				) : (
					<div className="flex space-x-2">
						<button
							onClick={handleSave}
							className="btn btn-primary flex items-center"
						>
							<FaSave className="mr-2 h-4 w-4" />
							Save
						</button>
						<button
							onClick={handleCancel}
							className="btn btn-outline-secondary flex items-center"
						>
							<FaTimes className="mr-2 h-4 w-4" />
							Cancel
						</button>
					</div>
				)}
			</div>

			<div className="bg-white shadow-sm rounded-lg overflow-hidden">
				{/* Profile Header */}
				<div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<img
								className="h-20 w-20 rounded-full border-4 border-white"
								src={
									currentUser?.FirebaseUser?.photoURL ||
									"https://i.ibb.co/MBtjqXQ/no-avatar.gif"
								}
								alt={currentUser?.FirebaseUser?.displayName || "User"}
							/>
						</div>
						<div className="ml-6">
							<h1 className="text-2xl font-bold text-white">
								{currentUser?.FirebaseUser?.displayName || "User"}
							</h1>
							<p className="text-primary-100 capitalize">
								{currentUser?.DBUser?.role || "Consumer"}
							</p>
							<p className="text-primary-100 text-sm">
								Member since{" "}
								{new Date(
									currentUser?.FirebaseUser?.metadata?.creationTime
								).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>

				{/* Profile Details */}
				<div className="px-6 py-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Personal Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Personal Information
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaUser className="inline mr-2" />
										Full Name
									</label>
									{isEditing ? (
										<input
											type="text"
											name="displayName"
											value={formData.displayName}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										/>
									) : (
										<p className="text-gray-900">
											{formData.displayName || "Not provided"}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaEnvelope className="inline mr-2" />
										Email Address
									</label>
									<p className="text-gray-900">{formData.email}</p>
									<p className="text-xs text-gray-500">
										Email cannot be changed
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaPhone className="inline mr-2" />
										Phone Number
									</label>
									{isEditing ? (
										<input
											type="tel"
											name="phone"
											value={formData.phone}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											placeholder="+880 1XXXXXXXXX"
										/>
									) : (
										<p className="text-gray-900">
											{formData.phone || "Not provided"}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Location Information */}
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Location Information
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										<FaMapMarkerAlt className="inline mr-2" />
										Region
									</label>
									{isEditing ? (
										<select
											name="region"
											value={formData.region}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
										>
											<option value="">Select Region</option>
											<option value="Dhaka">Dhaka</option>
											<option value="Chittagong">Chittagong</option>
											<option value="Rajshahi">Rajshahi</option>
											<option value="Khulna">Khulna</option>
											<option value="Barisal">Barisal</option>
											<option value="Sylhet">Sylhet</option>
											<option value="Rangpur">Rangpur</option>
											<option value="Mymensingh">Mymensingh</option>
										</select>
									) : (
										<p className="text-gray-900">
											{formData.region || "Not provided"}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										District
									</label>
									{isEditing ? (
										<input
											type="text"
											name="district"
											value={formData.district}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											placeholder="Enter your district"
										/>
									) : (
										<p className="text-gray-900">
											{formData.district || "Not provided"}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Address
									</label>
									{isEditing ? (
										<textarea
											name="address"
											value={formData.address}
											onChange={handleInputChange}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											placeholder="Enter your full address"
										/>
									) : (
										<p className="text-gray-900">
											{formData.address || "Not provided"}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Account Statistics */}
				<div className="bg-gray-50 px-6 py-4">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Account Statistics
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-2xl font-bold text-primary-600">
								{currentUser?.DBUser?.role === "seller" ? "24" : "12"}
							</p>
							<p className="text-sm text-gray-500">
								{currentUser?.DBUser?.role === "seller"
									? "Products Listed"
									: "Orders Placed"}
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-green-600">
								৳{currentUser?.DBUser?.role === "seller" ? "54,500" : "28,750"}
							</p>
							<p className="text-sm text-gray-500">
								{currentUser?.DBUser?.role === "seller"
									? "Total Earnings"
									: "Total Spent"}
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-secondary-600">
								{currentUser?.DBUser?.role === "seller" ? "4.8" : "5.0"}
							</p>
							<p className="text-sm text-gray-500">
								{currentUser?.DBUser?.role === "seller"
									? "Average Rating"
									: "Customer Rating"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
