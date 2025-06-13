import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import {
	FaUser,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaEdit,
	FaSave,
	FaTimes,
	FaLock,
	FaKey,
	FaEye,
	FaEyeSlash,
	FaCamera,
	FaShieldAlt,
	FaUserTie,
	FaCalendarAlt,
	FaMapPin,
	FaIdCard,
	FaCrown,
	FaStar,
	FaChartLine,
	FaCheckCircle,
	FaSignOutAlt,
	FaUpload,
	FaSpinner,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { uploadImageToCloudinary } from "../../../services/imageUploadService";
import useRegions from "../../../hooks/useRegions";
import useScrollToTop from "../../../hooks/useScrollToTop";

export default function Profile() {
	useScrollToTop();
	const {
		currentUser,
		changePassword,
		logout,
		updateUserProfile,
		getDBUser,
		currentRole,
	} = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [districts, setDistricts] = useState([]);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [imageUploading, setImageUploading] = useState(false);
	const fileInputRef = useRef(null);

	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Fetch regions for dynamic district selection
	const regions = useRegions();

	// Helper function to format address object to string
	const formatAddress = (addressObj) => {
		if (!addressObj) return "";
		if (typeof addressObj === "string") return addressObj;

		const parts = [];
		if (addressObj.street) parts.push(addressObj.street);
		if (addressObj.city) parts.push(addressObj.city);
		if (addressObj.state) parts.push(addressObj.state);
		if (addressObj.zip) parts.push(addressObj.zip);
		if (addressObj.country) parts.push(addressObj.country);

		return parts.join(", ");
	};

	const [formData, setFormData] = useState({
		displayName: currentUser?.FirebaseUser?.displayName || "",
		email: currentUser?.FirebaseUser?.email || "",
		phoneNumber: currentUser?.DBUser?.phoneNumber || "",
		address:
			currentUser?.DBUser?.fullAddress ||
			formatAddress(currentUser?.DBUser?.address) ||
			"",
		region: currentUser?.DBUser?.operationalArea?.region || "",
		district: currentUser?.DBUser?.operationalArea?.district || "",
	});

	// Update available districts when region changes
	useEffect(() => {
		if (regions && formData.region) {
			const selectedRegion = regions.find((r) => r.name === formData.region);
			if (selectedRegion) {
				setDistricts(selectedRegion.districts);
			} else {
				setDistricts([]);
			}
		} else {
			setDistricts([]);
		}
	}, [formData.region, regions]);

	// Initialize districts on component mount if region is already selected
	useEffect(() => {
		if (regions && currentUser?.DBUser?.region) {
			const selectedRegion = regions.find(
				(r) => r.name === currentUser.DBUser.region
			);
			if (selectedRegion) {
				setDistricts(selectedRegion.districts);
			}
		}
	}, [regions, currentUser]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			// If region changes, clear the district selection
			if (name === "region") {
				return {
					...prev,
					[name]: value,
					district: "", // Clear district when region changes
				};
			}
			return {
				...prev,
				[name]: value,
			};
		});
	};

	const handleLogout = () => {
		logout();
		// navigate("/login"); // Consider if navigate is available or needed here
	};

	const handleSave = async () => {
		// TODO: Implement profile update API call for text fields
		try {
			const user = currentUser?.FirebaseUser;
			if (!user) throw new Error("User not authenticated");

			// Prepare data for update (only send changed fields, or all editable fields)
			const updateData = {
				displayName: formData.displayName,
				phoneNumber: formData.phoneNumber,
				fullAddress: formData.address, // Assuming address string is fine, or re-parse if needed by backend
				operationalArea: {
					region: formData.region,
					district: formData.district,
				},
			};

			// API call to update user data in your backend
			const response = await axios.patch(
				`${apiBaseUrl}/users/${user.email}`,
				updateData,
				{
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${
							localStorage.getItem("JWT_TOKEN_KEY") ||
							sessionStorage.getItem("JWT_TOKEN_KEY")
						}`,
					},
				}
			);

			if (response.data.success) {
				currentUser?.FirebaseUser?.displayName !== formData.displayName &&
					(await updateUserProfile(formData.displayName, null));
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				// Optionally refresh DBUser data if not handled by AuthContext
				await getDBUser(user.email);
			} else {
				throw new Error(response.data.message || "Failed to update profile");
			}
		} catch (error) {
			console.error("Error saving profile data:", error);
			toast.error(error.message || "Failed to save profile. Please try again.");
		}
	};

	const handleCancel = () => {
		setFormData({
			displayName: currentUser?.FirebaseUser?.displayName || "",
			email: currentUser?.FirebaseUser?.email || "",
			phoneNumber: currentUser?.DBUser?.phoneNumber || "",
			address: formatAddress(currentUser?.DBUser?.address) || "",
			region: currentUser?.DBUser?.region || "",
			district: currentUser?.DBUser?.district || "",
		});
		setIsEditing(false);
	};

	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();

		// Validation
		if (!passwordData.currentPassword) {
			toast.error("Please enter your current password");
			return;
		}

		if (!passwordData.newPassword) {
			toast.error("Please enter a new password");
			return;
		}

		if (passwordData.newPassword.length < 6) {
			toast.error("New password must be at least 6 characters long");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}

		if (passwordData.currentPassword === passwordData.newPassword) {
			toast.error("New password must be different from current password");
			return;
		}

		setPasswordLoading(true);
		try {
			await changePassword(
				passwordData.currentPassword,
				passwordData.newPassword
			);

			// Reset form
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setShowPasswordForm(false);
		} catch (error) {
			// Error handling is done in the changePassword function
		} finally {
			setPasswordLoading(false);
		}
	};

	const handlePasswordCancel = () => {
		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setShowPasswordForm(false);
	};

	// Handle image selection (relies on service for robust validation)
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) {
			setSelectedImage(null);
			setPreviewUrl("");
			return;
		}

		// Basic client-side preview validation (service does more robust checks)
		const allowedPreviewTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/jpg",
		];
		if (!allowedPreviewTypes.includes(file.type)) {
			toast.error("Please select a valid image file (JPEG, PNG, GIF).");
			fileInputRef.current.value = ""; // Clear the input
			setSelectedImage(null);
			setPreviewUrl("");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			// 2MB limit
			toast.error("Image size must be less than 2MB.");
			fileInputRef.current.value = "";
			setSelectedImage(null);
			setPreviewUrl("");
			return;
		}

		setSelectedImage(file); // Store File object

		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};

	// Handle profile picture update
	const handleProfilePictureUpdate = async () => {
		if (!selectedImage) {
			toast.error("Please select an image first");
			return;
		}

		// Prevent multiple rapid updates
		if (imageUploading) {
			toast.warning("Upload already in progress, please wait...");
			return;
		}

		setImageUploading(true);
		try {
			const uploadedImageUrl = await uploadImageToCloudinary(selectedImage, {
				maxSizeMB: 2,
			});

			if (!uploadedImageUrl) {
				// Service shows toast, but we might want to prevent further execution explicitly
				setImageUploading(false);
				return;
			}

			const user = currentUser?.FirebaseUser;
			if (!user) {
				throw new Error("User not authenticated for profile update.");
			}

			// Update profile picture in your backend database first
			const response = await axios.patch(
				`${apiBaseUrl}/users/${user.email}`, // Ensure this endpoint exists in your backend
				{ profilePicture: uploadedImageUrl },
				{
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${
							localStorage.getItem("JWT_TOKEN_KEY") ||
							sessionStorage.getItem("JWT_TOKEN_KEY")
						}`,
					},
				}
			);

			if (response.data.success) {
				// Update Firebase profile (via AuthContext method) with debouncing
				try {
					await updateUserProfile(null, uploadedImageUrl);

					// Reset image selection only after successful update
					setSelectedImage(null);
					setPreviewUrl("");
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}

					toast.success("Profile picture updated successfully!");
				} catch (firebaseError) {
					console.error("Firebase update error:", firebaseError);
					// Even if Firebase update fails, the backend was successful
					toast.warning(
						"Profile updated in database, but there was an issue with Firebase sync. Please refresh the page."
					);
				}
			} else {
				throw new Error(
					response.data.message ||
						"Failed to update profile picture in database"
				);
			}
		} catch (error) {
			console.error("Error updating profile picture:", error);
			toast.error(
				error.message || "Failed to update profile picture. Please try again."
			);
		} finally {
			// Always reset loading state
			setImageUploading(false);
		}
	};

	// Cancel profile picture update
	const handleCancelImageUpdate = () => {
		setSelectedImage(null);
		setPreviewUrl("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Helper function to get role icon and color
	const getRoleConfig = (role) => {
		switch (role) {
			case "admin":
				return {
					icon: <FaCrown className="h-5 w-5" />,
					color: "text-yellow-600",
					bgColor: "bg-yellow-100",
					badge: "bg-gradient-to-r from-yellow-400 to-yellow-600",
				};
			case "agent":
				return {
					icon: <FaUserTie className="h-5 w-5" />,
					color: "text-blue-600",
					bgColor: "bg-blue-100",
					badge: "bg-gradient-to-r from-blue-400 to-blue-600",
				};
			case "seller":
				return {
					icon: <FaUser className="h-5 w-5" />,
					color: "text-green-600",
					bgColor: "bg-green-100",
					badge: "bg-gradient-to-r from-green-400 to-green-600",
				};
			default:
				return {
					icon: <FaUser className="h-5 w-5" />,
					color: "text-primary-600",
					bgColor: "bg-primary-100",
					badge: "bg-gradient-to-r from-primary-400 to-primary-600",
				};
		}
	};

	const roleConfig = getRoleConfig(currentRole);

	return (
		<div className="">
			{/* Enhanced Header */}
			<div className="mb-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							My Profile
						</h1>
						<p className="text-gray-600">
							Manage your personal information and account settings
						</p>
					</div>
					{!isEditing ? (
						<div className="flex space-x-3">
							<button
								className="btn btn-outline flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
								onClick={handleLogout}
							>
								<FaSignOutAlt className="mr-2 h-4 w-4" />
								Sign Out
							</button>
							<button
								onClick={() => setIsEditing(true)}
								className="btn btn-primary flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
							>
								<FaEdit className="mr-2 h-4 w-4" />
								Edit Profile
							</button>
						</div>
					) : (
						<div className="flex space-x-3">
							<button
								onClick={handleSave}
								className="btn btn-primary flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
							>
								<FaSave className="mr-2 h-4 w-4" />
								Save Changes
							</button>
							<button
								onClick={handleCancel}
								className="btn btn-outline flex items-center hover:bg-gray-50 transition-all duration-200"
							>
								<FaTimes className="mr-2 h-4 w-4" />
								Cancel
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Profile Header Card */}
			<div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 border border-gray-100">
				<div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-8 py-12">
					{/* Background Pattern */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute inset-0 bg-white bg-opacity-5"></div>
					</div>

					<div className="relative flex flex-col md:flex-row items-center md:items-start">
						{/* Profile Image Section */}
						<div className="relative flex-shrink-0 mb-6 md:mb-0">
							<div className="relative">
								<img
									className="h-32 w-32 rounded-2xl border-4 border-white shadow-2xl object-cover"
									src={
										previewUrl ||
										currentUser?.FirebaseUser?.photoURL ||
										"https://i.ibb.co/MBtjqXQ/no-avatar.gif"
									}
									alt={currentUser?.FirebaseUser?.displayName || "User"}
								/>
								{/* Camera overlay for photo upload */}
								<label
									htmlFor="profilePictureInput"
									className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer group"
									title={
										imageUploading
											? "Uploading..."
											: "Click to change profile picture"
									}
								>
									{imageUploading ? (
										<FaSpinner className="text-white h-6 w-6 animate-spin" />
									) : (
										<FaCamera className="text-white opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity duration-200" />
									)}
								</label>
								{/* Hidden file input */}
								<input
									type="file"
									id="profilePictureInput"
									ref={fileInputRef}
									accept="image/*"
									className="hidden"
									onChange={handleImageChange}
									disabled={imageUploading}
								/>
								{/* Online status indicator */}
								<div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
									<FaCheckCircle className="h-4 w-4 text-white" />
								</div>
							</div>

							{/* Image upload controls */}
							{selectedImage && (
								<div className="mt-4 flex flex-col items-center space-y-2">
									<div className="flex space-x-2">
										<button
											onClick={handleProfilePictureUpdate}
											disabled={imageUploading}
											className="btn btn-primary btn-sm flex items-center"
										>
											{imageUploading ? (
												<>
													<FaSpinner className="mr-2 h-3 w-3 animate-spin" />
													Uploading...
												</>
											) : (
												<>
													<FaUpload className="mr-2 h-3 w-3" />
													Update Photo
												</>
											)}
										</button>
										<button
											onClick={handleCancelImageUpdate}
											disabled={imageUploading}
											className="btn btn-outline btn-sm flex items-center"
										>
											<FaTimes className="mr-2 h-3 w-3" />
											Cancel
										</button>
									</div>
									<p className="text-xs text-primary-100">
										Max size: 2MB • JPEG, PNG, GIF
									</p>
								</div>
							)}
						</div>

						{/* Profile Info Section */}
						<div className="md:ml-8 text-center md:text-left flex-1">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
								<div>
									<h1 className="text-3xl font-bold text-white mb-2">
										{typeof currentUser?.FirebaseUser?.displayName === "string"
											? currentUser.FirebaseUser.displayName
											: "User"}
									</h1>

									{/* Role Badge */}
									<div
										className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium mb-3"
										style={{ background: roleConfig.badge }}
									>
										{roleConfig.icon}
										<span className="capitalize">
											{typeof currentRole === "string"
												? currentRole
												: "loading..."}
										</span>
									</div>
								</div>

								{/* Account Status */}
								<div className="text-center md:text-right">
									<div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-2 text-white text-sm">
										<FaShieldAlt className="h-4 w-4" />
										<span>Verified Account</span>
									</div>
								</div>
							</div>

							{/* Account Meta Info */}
							<div className="flex flex-col md:flex-row gap-4 text-primary-100">
								<div className="flex items-center justify-center md:justify-start gap-2">
									<FaCalendarAlt className="h-4 w-4" />
									<span className="text-sm">
										Member since{" "}
										{new Date(
											currentUser?.FirebaseUser?.metadata?.creationTime
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
								<div className="flex items-center justify-center md:justify-start gap-2">
									<FaIdCard className="h-4 w-4" />
									<span className="text-sm">
										ID: {currentUser?.FirebaseUser?.uid?.slice(0, 8)}...
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Stats Bar */}
				<div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<p className="text-2xl font-bold text-gray-900">
								{currentUser?.DBUser?.role === "seller" ? "24" : "12"}
							</p>
							<p className="text-sm text-gray-500">
								{currentUser?.DBUser?.role === "seller" ? "Products" : "Orders"}
							</p>
						</div>
						<div>
							<p className="text-2xl font-bold text-green-600">
								৳{currentUser?.DBUser?.role === "seller" ? "54,500" : "28,750"}
							</p>
							<p className="text-sm text-gray-500">
								{currentUser?.DBUser?.role === "seller" ? "Earnings" : "Spent"}
							</p>
						</div>
						<div className="flex items-center justify-center gap-1">
							<p className="text-2xl font-bold text-yellow-600">
								{currentUser?.DBUser?.role === "seller" ? "4.8" : "5.0"}
							</p>
							<FaStar className="h-5 w-5 text-yellow-500" />
							<p className="text-sm text-gray-500 ml-2">Rating</p>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Information Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
				{/* Personal Information Card */}
				<div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
					<div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white bg-opacity-20 rounded-lg">
								<FaUser className="h-5 w-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-white">
								Personal Information
							</h3>
						</div>
					</div>
					<div className="p-6 space-y-5">
						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaIdCard className="mr-2 h-4 w-4 text-gray-500" />
								Full Name
							</label>
							{isEditing ? (
								<input
									type="text"
									name="displayName"
									value={formData.displayName || ""}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
									placeholder="Enter your full name"
								/>
							) : (
								<div className="bg-gray-50 px-4 py-3 rounded-lg">
									<p className="text-gray-900 font-medium">
										{formData.displayName || "Not provided"}
									</p>
								</div>
							)}
						</div>

						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaEnvelope className="mr-2 h-4 w-4 text-gray-500" />
								Email Address
							</label>
							<div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
								<p className="text-gray-900 font-medium">
									{formData.email || "Not provided"}
								</p>
								<p className="text-xs text-gray-500 mt-1">
									<FaShieldAlt className="inline mr-1" />
									Email cannot be changed for security
								</p>
							</div>
						</div>

						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaPhone className="mr-2 h-4 w-4 text-gray-500" />
								Phone Number
							</label>
							{isEditing ? (
								<input
									type="tel"
									name="phoneNumber"
									value={formData.phoneNumber || ""}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
									placeholder="+880 1XXXXXXXXX"
								/>
							) : (
								<div className="bg-gray-50 px-4 py-3 rounded-lg">
									<p className="text-gray-900 font-medium">
										{formData.phoneNumber || "Not provided"}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Location Information Card */}
				<div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
					<div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white bg-opacity-20 rounded-lg">
								<FaMapPin className="h-5 w-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-white">
								Location Information
							</h3>
						</div>
					</div>
					<div className="p-6 space-y-5">
						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaMapMarkerAlt className="mr-2 h-4 w-4 text-gray-500" />
								Region
							</label>
							{isEditing ? (
								<select
									name="region"
									value={formData.region || ""}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
								>
									<option value="">Select Region</option>
									{regions?.map((region) => (
										<option key={region.name} value={region.name}>
											{region.name}
										</option>
									))}
								</select>
							) : (
								<div className="bg-gray-50 px-4 py-3 rounded-lg">
									<p className="text-gray-900 font-medium">
										{formData.region || "Not provided"}
									</p>
								</div>
							)}
						</div>

						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaMapPin className="mr-2 h-4 w-4 text-gray-500" />
								District
							</label>
							{isEditing ? (
								<select
									name="district"
									value={formData.district || ""}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
									disabled={!formData.region}
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
							) : (
								<div className="bg-gray-50 px-4 py-3 rounded-lg">
									<p className="text-gray-900 font-medium">
										{formData?.district || "Not provided"}
									</p>
								</div>
							)}
						</div>

						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaMapMarkerAlt className="mr-2 h-4 w-4 text-gray-500" />
								Full Address
							</label>
							{isEditing ? (
								<textarea
									name="address"
									value={formData.address || ""}
									onChange={handleInputChange}
									rows={3}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
									placeholder="Enter your complete address..."
								/>
							) : (
								<div className="bg-gray-50 px-4 py-3 rounded-lg min-h-[80px]">
									<p className="text-gray-900 font-medium">
										{formData.address || "Not provided"}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Security Settings Card */}
				<div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
					<div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white bg-opacity-20 rounded-lg">
								<FaShieldAlt className="h-5 w-5 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-white">
								Security Settings
							</h3>
						</div>
					</div>
					<div className="p-6 space-y-5">
						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<FaLock className="mr-2 h-4 w-4 text-gray-500" />
								Password
							</label>
							{!showPasswordForm ? (
								<div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<p className="text-gray-900 font-medium">••••••••••••</p>
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
												<FaCheckCircle className="h-3 w-3 mr-1" />
												Secure
											</span>
										</div>
										<button
											onClick={() => setShowPasswordForm(true)}
											className="btn btn-primary text-sm px-4 py-2 hover:shadow-lg transition-all duration-200"
										>
											<FaKey className="mr-2 h-4 w-4" />
											Change Password
										</button>
									</div>
								</div>
							) : (
								<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
									<form onSubmit={handlePasswordSubmit} className="space-y-4">
										{/* Current Password */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Current Password
											</label>
											<div className="relative">
												<input
													type={showPasswords.current ? "text" : "password"}
													name="currentPassword"
													value={passwordData.currentPassword}
													onChange={handlePasswordChange}
													className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
													placeholder="Enter current password"
													required
												/>
												<button
													type="button"
													onClick={() => togglePasswordVisibility("current")}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
												>
													{showPasswords.current ? (
														<FaEyeSlash className="h-4 w-4" />
													) : (
														<FaEye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										{/* New Password */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												New Password
											</label>
											<div className="relative">
												<input
													type={showPasswords.new ? "text" : "password"}
													name="newPassword"
													value={passwordData.newPassword}
													onChange={handlePasswordChange}
													className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
													placeholder="Enter new password"
													required
													minLength={6}
												/>
												<button
													type="button"
													onClick={() => togglePasswordVisibility("new")}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
												>
													{showPasswords.new ? (
														<FaEyeSlash className="h-4 w-4" />
													) : (
														<FaEye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										{/* Confirm New Password */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Confirm New Password
											</label>
											<div className="relative">
												<input
													type={showPasswords.confirm ? "text" : "password"}
													name="confirmPassword"
													value={passwordData.confirmPassword}
													onChange={handlePasswordChange}
													className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
													placeholder="Confirm new password"
													required
												/>
												<button
													type="button"
													onClick={() => togglePasswordVisibility("confirm")}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
												>
													{showPasswords.confirm ? (
														<FaEyeSlash className="h-4 w-4" />
													) : (
														<FaEye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										{/* Password Requirements */}
										<div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
											<p className="font-medium mb-1">Password requirements:</p>
											<ul className="list-disc list-inside ml-2 space-y-1">
												<li>At least 6 characters long</li>
												<li>Different from current password</li>
											</ul>
										</div>

										{/* Action Buttons */}
										<div className="flex space-x-3 pt-2">
											<button
												type="submit"
												disabled={passwordLoading}
												className="btn btn-primary flex items-center"
											>
												{passwordLoading ? (
													<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
												) : (
													<FaKey className="mr-2 h-4 w-4" />
												)}
												{passwordLoading ? "Updating..." : "Update Password"}
											</button>
											<button
												type="button"
												onClick={handlePasswordCancel}
												disabled={passwordLoading}
												className="btn btn-outline flex items-center"
											>
												<FaTimes className="mr-2 h-4 w-4" />
												Cancel
											</button>
										</div>
									</form>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Account Activity & Achievements */}
			<div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-8">
				<div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-white bg-opacity-20 rounded-xl">
							<FaChartLine className="h-6 w-6 text-white" />
						</div>
						<div>
							<h3 className="text-xl font-bold text-white">
								Account Activity & Performance
							</h3>
							<p className="text-purple-100 text-sm">
								Your activity summary and achievements
							</p>
						</div>
					</div>
				</div>
				<div className="p-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						<div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
							<div className="flex items-center justify-center mb-3">
								<div className="p-3 bg-primary-600 rounded-full">
									<FaUser className="h-6 w-6 text-white" />
								</div>
							</div>
							<p className="text-2xl font-bold text-primary-600 mb-1">
								{currentUser?.DBUser?.role === "seller" ? "24" : "12"}
							</p>
							<p className="text-sm text-gray-600 font-medium">
								{currentUser?.DBUser?.role === "seller"
									? "Products Listed"
									: "Orders Placed"}
							</p>
						</div>

						<div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
							<div className="flex items-center justify-center mb-3">
								<div className="p-3 bg-green-600 rounded-full">
									<FaChartLine className="h-6 w-6 text-white" />
								</div>
							</div>
							<p className="text-2xl font-bold text-green-600 mb-1">
								৳{currentUser?.DBUser?.role === "seller" ? "54,500" : "28,750"}
							</p>
							<p className="text-sm text-gray-600 font-medium">
								{currentUser?.DBUser?.role === "seller"
									? "Total Earnings"
									: "Total Spent"}
							</p>
						</div>

						<div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
							<div className="flex items-center justify-center mb-3">
								<div className="p-3 bg-yellow-600 rounded-full">
									<FaStar className="h-6 w-6 text-white" />
								</div>
							</div>
							<p className="text-2xl font-bold text-yellow-600 mb-1">
								{currentUser?.DBUser?.role === "seller" ? "4.8" : "5.0"}
							</p>
							<p className="text-sm text-gray-600 font-medium">
								{currentUser?.DBUser?.role === "seller"
									? "Average Rating"
									: "Customer Rating"}
							</p>
						</div>

						<div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
							<div className="flex items-center justify-center mb-3">
								<div className="p-3 bg-blue-600 rounded-full">
									<FaCheckCircle className="h-6 w-6 text-white" />
								</div>
							</div>
							<p className="text-2xl font-bold text-blue-600 mb-1">98%</p>
							<p className="text-sm text-gray-600 font-medium">Success Rate</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
