import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaFacebook, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const { loginWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();

	const navigate = useNavigate();
	const location = useLocation();
	const formRef = useRef(null);

	// Redirect to the page the user was trying to access, or to dashboard
	const from = location.state?.from || "/dashboard/profile";

	// Handle email/password login
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			await loginWithEmail(data.email, data.password);
			toast.success("Login successful!");

			// Check for stored redirect path from application flow
			const redirectPath = localStorage.getItem("redirectAfterLogin");
			if (redirectPath) {
				localStorage.removeItem("redirectAfterLogin");
				navigate(redirectPath, { replace: true });
			} else {
				navigate(from, { replace: true });
			}
		} catch (error) {
			// Clear form if authentication failed
			toast.error(
				error.message || "Login failed. Please check your credentials."
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle Google login
	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			await loginWithGoogle();
			toast.success("Login successful!");

			// Check for stored redirect path from application flow
			const redirectPath = localStorage.getItem("redirectAfterLogin");
			if (redirectPath) {
				localStorage.removeItem("redirectAfterLogin");
				navigate(redirectPath, { replace: true });
			} else {
				navigate(from, { replace: true });
			}
		} catch (error) {
			toast.error(error.message || "Google login failed");
		} finally {
			setLoading(false);
		}
	};

	// Handle Facebook login
	const handleFacebookLogin = async () => {
		setLoading(true);
		try {
			await loginWithFacebook();
			toast.success("Login successful!");

			// Check for stored redirect path from application flow
			const redirectPath = localStorage.getItem("redirectAfterLogin");
			if (redirectPath) {
				localStorage.removeItem("redirectAfterLogin");
				navigate(redirectPath, { replace: true });
			} else {
				navigate(from, { replace: true });
			}
		} catch (error) {
			toast.error(error.message || "Facebook login failed");
		} finally {
			setLoading(false);
		}
	};

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
					<h2 className="mt-2 text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-xs md:text-sm text-gray-600">
						Or{" "}
						<Link
							to="/register"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							create a new account
						</Link>
					</p>
				</div>
			</div>

			<div className="px-4 mt-8 sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg">
				<div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 daisy-card rounded-lg">
					<div className="pb-10 flex justify-center">
						<Link to="/" className="flex items-center text-xl sm:text-3xl">
							<span className="font-display font-bold text-primary-600">
								SmartAgro
							</span>
							<span className="ml-1 font-display font-bold text-gray-700">
								Connect
							</span>
						</Link>
					</div>
					{/* Email/Password login form */}
					<form
						className="space-y-5 md:px-2"
						ref={formRef}
						onSubmit={handleSubmit(onSubmit)}
					>
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
									onKeyDown={handleKeyDown}
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

						{/* Password field */}
						<div>
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Password</legend>
								<div className="mt-1 relative">
									<input
										className="input validator w-full pr-10"
										id="password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										{...register("password", {
											required: "Password is required",
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
										<p className="form-error daisy-text-error">
											{errors.password.message}
										</p>
									)}
								</div>
							</fieldset>
						</div>

						{/* Remember me & Forgot password */}
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="checkbox checkbox-success checkbox-sm sm:checkbox-lg"
									onKeyDown={handleKeyDown}
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-xs sm:text-sm text-gray-900"
								>
									Remember me
								</label>
							</div>

							<div className="text-xs sm:text-sm">
								<a
									href="#"
									className="font-medium text-primary-600 hover:text-primary-500 daisy-link daisy-link-hover"
								>
									Forgot your password?
								</a>
							</div>
						</div>

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
									"Sign in"
								)}
							</button>
						</div>
					</form>

					{/* Social login divider */}
					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Or continue with
								</span>
							</div>
						</div>

						{/* Social login buttons */}
						<div className="mt-6 grid grid-cols-2 gap-3">
							<button
								onClick={handleGoogleLogin}
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								<FcGoogle className="h-5 w-5 text-red-600" />
								<span className="ml-2 hidden sm:inline">Google</span>
							</button>
							<button
								onClick={handleFacebookLogin}
								disabled={loading}
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								<FaFacebook className="h-5 w-5 text-blue-600" />
								<span className="ml-2 hidden sm:inline">Facebook</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
