import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
	FaFacebook,
	FaUpload,
	FaCamera,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../services/imageUploadService";
import useScrollToTop from "../../hooks/useScrollToTop";

export default function Register() {
	useScrollToTop();
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { registerWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const fileInputRef = useRef(null);
	const formRef = useRef(null);

	const navigate = useNavigate();
	const password = watch("password");

	// Handle image selection
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
			// 2MB limit, consistent with service default
			toast.error("Image size must be less than 2MB.");
			fileInputRef.current.value = "";
			setSelectedImage(null);
			setPreviewUrl("");
			return;
		}

		setSelectedImage(file); // Store the File object

		// Create preview URL
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};

	// Handle registration with email/password
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			let profileImageUrl = "https://i.ibb.co/MBtjqXQ/no-avatar.gif";
			if (selectedImage) {
				const uploadedUrl = await uploadImageToCloudinary(selectedImage, {
					maxSizeMB: 2,
				});
				if (uploadedUrl) {
					profileImageUrl = uploadedUrl;
				} else {
					// uploadImageToCloudinary service already shows a toast on failure
					setLoading(false);
					return; // Stop registration if image upload fails
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
			const fullAddress = `${data.street}, ${data.city}, ${data.state}, ${data.zip}, ${data.country}`

			await registerWithEmail(
				data.email,
				data.password,
				{
					first_name: data.first_name,
					last_name: data.last_name,
				},
				profileImageUrl,
				address,
				fullAddress
			);
			toast.success("Registration successful! Please complete your profile.");
			navigate("/dashboard/profile", {
				state: { newUser: true, role: "consumer" }, // Assuming role is consumer by default
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
			navigate("/dashboard/profile", {
				state: { newUser: true, role: "consumer" },
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
			navigate("/dashboard/profile", {
				state: { newUser: true, role: "consumer" },
			});
		} catch (error) {
			toast.error(
				error.message || "Facebook registration failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	// Use useEffect to apply keyboard navigation enhancement
	useEffect(() => {
		const handleFormKeyPress = (e) => {
			if (
				e.key === "Enter" &&
				e.target.tagName !== "TEXTAREA" &&
				e.target.type !== "submit"
			) {
				e.preventDefault();

				const form = formRef.current;
				if (!form) return;

				const focusableElements = Array.from(
					form.querySelectorAll("input, select, button, textarea")
				).filter((el) => !el.disabled && el.type !== "hidden");

				const index = focusableElements.indexOf(e.target);
				if (index > -1 && index < focusableElements.length - 1) {
					focusableElements[index + 1].focus();
				}
			}
		};

		// Add event listener to the form
		const form = formRef.current;
		if (form) {
			form.addEventListener("keydown", handleFormKeyPress);
		}

		// Clean up
		return () => {
			if (form) {
				form.removeEventListener("keydown", handleFormKeyPress);
			}
		};
	}, []); // Empty dependency array ensures this runs once when component mounts

	// Simplified handleKeyDown for individual fields
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Let the form event listener handle the navigation
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md relative">
				<div className="text-center">
					<h2 className="mt-2 text-center text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-center text-xs sm:text-sm lg:text-md text-gray-600">
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
				<div className="bg-white py-4 md:py-8 px-4 shadow-lg sm:px-10 border border-gray-200 daisy-card rounded-lg">
					<div className="pb-4 md:pb-10 flex justify-center">
						<Link
							to="/"
							className="flex items-center text-lg sm:text-2xl lg:text-3xl"
						>
							<span className="font-display font-bold text-primary-600">
								SmartAgro
							</span>
							<span className="ml-1 font-display font-bold text-gray-700">
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
					<form
						ref={formRef}
						className="space-y-5"
						onSubmit={handleSubmit(onSubmit)}
					>
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
									onKeyDown={handleKeyDown}
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
									onKeyDown={handleKeyDown}
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
									onKeyDown={handleKeyDown}
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
										onKeyDown={handleKeyDown}
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
										onKeyDown={handleKeyDown}
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
										onKeyDown={handleKeyDown}
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
										onKeyDown={handleKeyDown}
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
										onKeyDown={handleKeyDown}
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
								<div className="mt-1 relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										className="input validator w-full pr-10"
										{...register("password", {
											required: "Password is required",
											minLength: {
												value: 6,
												message: "Password must be at least 6 characters",
											},
										})}
										onKeyDown={handleKeyDown}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<FaEyeSlash className="h-5 w-5" />
										) : (
											<FaEye className="h-5 w-5" />
										)}
									</button>
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
								<div className="mt-1 relative">
									<input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										className="input validator w-full pr-10"
										{...register("confirmPassword", {
											required: "Please confirm your password",
											validate: (value) =>
												value === password || "Passwords do not match",
										})}
										onKeyDown={handleKeyDown}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<FaEyeSlash className="h-5 w-5" />
										) : (
											<FaEye className="h-5 w-5" />
										)}
									</button>
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
								onKeyDown={handleKeyDown}
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
