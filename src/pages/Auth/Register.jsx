import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaFacebook, FaUpload, FaCamera } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

export default function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const { registerWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();
	const [selectedRole, setSelectedRole] = useState("consumer");
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const fileInputRef = useRef(null);

	const navigate = useNavigate();
	const password = watch("password");

	// Handle image selection
	const handleImageChange = (e) => {
		const file = e.target.files[0];

		if (!file) return;

		// Size validation (2MB)
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Image size must be less than 2MB");
			fileInputRef.current.value = "";
			return;
		}

		setSelectedImage(file);

		// Create preview URL
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};

	// Upload image to Cloudinary
	const uploadImageToCloudinary = async (image) => {
		if (!image) return null;

		const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
		const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

		if (!cloudName || !uploadPreset) {
			toast.error("Cloudinary configuration is missing");
			return null;
		}

		const formData = new FormData();
		formData.append("file", image);
		formData.append("upload_preset", uploadPreset);

		try {
			const response = await axios.post(
				`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
				formData,
				{
					withCredentials: false, // explicitly disable credentials
					headers: { "Content-Type": "multipart/form-data" },
				}
			);

			return response.data.secure_url;
		} catch (error) {
			console.error("Error uploading image:", error);
			return null;
		}
	};

	// Handle registration with email/password
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			// Upload image if selected, otherwise use default
			let profileImageUrl = "https://i.ibb.co/MBtjqXQ/no-avatar.gif";
			if (selectedImage) {
				const uploadedImageUrl = await uploadImageToCloudinary(selectedImage);
				if (uploadedImageUrl) {
					profileImageUrl = uploadedImageUrl;
				}
			}

			// Format address
			const address = {
				street: data.street,
				city: data.city,
				state: data.state,
				zip: data.zip,
				country: data.country || "Bangladesh",
			};

			await registerWithEmail(
				data.email,
				data.password,
				{
					first_name: data.first_name,
					last_name: data.last_name,
				},
				profileImageUrl,
				address
			);
			toast.success("Registration successful! Please complete your profile.");
			navigate("/dashboard", {
				state: { newUser: true, role: selectedRole },
			});
		} catch (error) {
			toast.error(error.message || "Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Handle Google login/registration
	const handleGoogleRegister = async () => {
		setLoading(true);
		try {
			await loginWithGoogle();
			toast.success("Registration successful! Please complete your profile.");
			navigate("/dashboard", {
				state: { newUser: true, role: selectedRole },
			});
		} catch (error) {
			toast.error(
				error.message || "Google registration failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle Facebook login/registration
	const handleFacebookRegister = async () => {
		setLoading(true);
		try {
			await loginWithFacebook();
			toast.success("Registration successful! Please complete your profile.");
			navigate("/dashboard", {
				state: { newUser: true, role: selectedRole },
			});
		} catch (error) {
			toast.error(
				error.message || "Facebook registration failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md relative">
				<div className="text-center">
					<h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Or{" "}
						<Link
							to="/login"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							sign in to your existing account
						</Link>
					</p>
				</div>
			</div>

			<div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-lg lg:max-w-2xl">
				<div className="bg-white py-8 px-4 shadow-lg sm:px-10 border border-gray-200 daisy-card rounded-lg">
					<div className="pb-10 flex justify-center">
						<Link to="/" className="flex items-center">
							<span className="text-3xl font-display font-bold text-primary-600">
								SmartAgro
							</span>
							<span className="ml-1 text-3xl font-display font-bold text-gray-700">
								Connect
							</span>
						</Link>
					</div>
					{/* Profile picture upload */}
					<div className="mb-6 flex flex-col items-center">
						<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500 mb-2 flex items-center justify-center bg-gray-100 relative daisy-avatar daisy-online">
							{previewUrl ? (
								<img
									src={previewUrl}
									alt="Profile preview"
									className="w-full h-full object-cover"
								/>
							) : (
								<FaCamera className="text-gray-400 text-4xl" />
							)}
						</div>
						<label
							htmlFor="profilePicture"
							className="cursor-pointer flex items-center text-sm text-primary-600 hover:text-primary-500 daisy-btn daisy-btn-sm daisy-btn-ghost"
						>
							<FaUpload className="mr-1" /> Upload profile picture
							<input
								type="file"
								id="profilePicture"
								ref={fileInputRef}
								accept="image/*"
								className="hidden"
								onChange={handleImageChange}
							/>
						</label>
						<p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
					</div>

					{/* Registration form */}
					<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
						{/* Name field */}
						<div className="grid grid-cols-2 gap-4">
							<fieldset className="fieldset">
								<legend className="fieldset-legend">First Name</legend>
								<input
									id="first_name"
									type="text"
									autoComplete="first_name"
									{...register("first_name", {
										required: "Name is required",
										minLength: {
											value: 2,
											message: "First name must be at least 2 characters",
										},
									})}
									className="input"
									placeholder="Muhammad"
								/>
								{errors.name && (
									<p className="form-error text-xs text-red-400">
										{errors.name.message}
									</p>
								)}
							</fieldset>
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Last Name</legend>
								<input
									id="last_name"
									type="text"
									autoComplete="last_name"
									{...register("last_name", {
										required: "Name is required",
										minLength: {
											value: 2,
											message: "Last name must be at least 2 characters",
										},
									})}
									className="input"
									placeholder="Abdullah"
								/>
								{errors.name && (
									<p className="form-error text-xs text-red-400">
										{errors.name.message}
									</p>
								)}
							</fieldset>
						</div>

						{/* Email field */}
						<div className="">
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Enter your email</legend>
								<input
									id="email"
									type="email"
									className="input validator w-full"
									autoComplete="email"
									required
									placeholder="mail@site.com"
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: "Invalid email address",
										},
									})}
								/>
							</fieldset>
						</div>

						{/* Address fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Street */}
							<div className="md:col-span-2">
								<fieldset className="fieldset">
									<legend className="fieldset-legend">Street Address</legend>
									<input
										type="text"
										id="street"
										className="input validator w-full"
										autoComplete="street"
										placeholder="123 Main St"
										{...register("street", {
											required: "Street address is required",
										})}
									/>
									{errors.street && (
										<p className="form-error text-xs text-red-400">
											{errors.street.message}
										</p>
									)}
								</fieldset>
							</div>

							{/* City */}
							<div>
								<fieldset className="fieldset">
									<legend className="fieldset-legend">City</legend>
									<input
										type="text"
										id="city"
										className="input validator w-full"
										autoComplete="city"
										placeholder="Dhaka"
										{...register("city", {
											required: "City is required",
										})}
									/>
									{errors.city && (
										<p className="form-error text-xs text-red-400">
											{errors.city.message}
										</p>
									)}
								</fieldset>
							</div>

							{/* State */}
							<div>
								<fieldset className="fieldset">
									<legend className="fieldset-legend">State/Division</legend>
									<input
										type="text"
										id="state"
										className="input validator w-full"
										autoComplete="state"
										placeholder="Dhaka"
										{...register("state", {
											required: "State is required",
										})}
									/>
									{errors.state && (
										<p className="form-error text-xs text-red-400">
											{errors.state.message}
										</p>
									)}
								</fieldset>
							</div>

							{/* Zip */}
							<div>
								<fieldset className="fieldset">
									<legend className="fieldset-legend">Zip/Postal Code</legend>
									<input
										type="text"
										id="zip"
										className="input validator w-full"
										autoComplete="zip"
										placeholder="12345"
										{...register("zip", {
											required: "Zip code is required",
										})}
									/>
									{errors.zip && (
										<p className="form-error text-xs text-red-400">
											{errors.zip.message}
										</p>
									)}
								</fieldset>
							</div>

							{/* Country */}
							<div>
								<fieldset className="fieldset">
									<legend className="fieldset-legend">Country</legend>
									<input
										type="text"
										id="country"
										className="input validator w-full"
										autoComplete="country"
										placeholder="Bangladesh"
										// defaultValue="Bangladesh"
										{...register("country")}
									/>
									{errors.country && (
										<p className="form-error text-xs text-red-400">
											{errors.country.message}
										</p>
									)}
								</fieldset>
							</div>
						</div>

						{/* Password field */}
						<div>
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Password</legend>
								<div className="mt-1">
									<input
										id="password"
										type="password"
										autoComplete="new-password"
										className="input validator w-full"
										{...register("password", {
											required: "Password is required",
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
									/>
									{errors.password && (
										<p className="form-error text-xs text-red-400">
											{errors.password.message}
										</p>
									)}
								</div>
							</fieldset>
						</div>

						{/* Confirm Password field */}
						<div>
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Confirm Password</legend>
								<div className="mt-1">
									<input
										id="confirmPassword"
										type="password"
										className="input validator w-full"
										{...register("confirmPassword", {
											required: "Please confirm your password",
											validate: (value) =>
												value === password || "Passwords do not match",
										})}
									/>
									{errors.confirmPassword && (
										<p className="form-error text-xs text-red-400">
											{errors.confirmPassword.message}
										</p>
									)}
								</div>
							</fieldset>
						</div>

						{/* Agreement checkbox */}
						<div className="flex items-center">
							<input
								id="terms"
								name="terms"
								type="checkbox"
								className="checkbox checkbox-success"
								{...register("terms", {
									required: "You must agree to the terms and conditions",
								})}
							/>
							<label
								htmlFor="terms"
								className="ml-2 block text-sm text-gray-900"
							>
								I agree to the{" "}
								<a
									href="#"
									className="font-medium text-primary-600 hover:text-primary-500 daisy-link daisy-link-hover"
								>
									terms and conditions
								</a>
							</label>
						</div>
						{errors.terms && (
							<p className="form-error text-xs text-red-400 daisy-text-error">
								{errors.terms.message}
							</p>
						)}

						{/* Submit button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out flex justify-center items-center daisy-btn daisy-btn-primary"
							>
								{loading ? (
									<svg
										className="animate-spin h-5 w-5 text-white daisy-loading daisy-loading-spinner"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									"Create Account"
								)}
							</button>
						</div>
					</form>

					{/* Social registration divider */}
					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Or register with
								</span>
							</div>
						</div>

						{/* Social registration buttons */}
						<div className="mt-6 grid grid-cols-2 gap-3">
							<button
								onClick={handleGoogleRegister}
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								<FcGoogle className="h-5 w-5 text-red-600" />
								<span className="ml-2">Google</span>
							</button>
							<button
								onClick={handleFacebookRegister}
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								<FaFacebook className="h-5 w-5 text-blue-600" />
								<span className="ml-2">Facebook</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
