import {
	FaExclamationTriangle,
	FaHome,
	FaArrowLeft,
	FaMapMarkerAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useScrollToTop from "../../../hooks/useScrollToTop";

export default function DashboardNothing() {
	useScrollToTop();
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate("/dashboard");
	};

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<div className="lg:min-h-[calc(100vh-130px)] bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-6 relative">
			{/* Background Elements */}
			<div className="absolute top-20 left-20 opacity-10">
				<div className="text-6xl">🌱</div>
			</div>
			<div className="absolute bottom-20 right-20 opacity-10">
				<div className="text-5xl">🚜</div>
			</div>
			<div className="absolute top-1/4 right-32 opacity-10">
				<div className="text-4xl">🌾</div>
			</div>
			<div className="absolute bottom-1/3 left-32 opacity-10">
				<div className="text-4xl">🌽</div>
			</div>
			<div className="absolute top-1/2 left-16 opacity-10">
				<div className="text-3xl">🍎</div>
			</div>
			<div className="absolute bottom-1/4 right-16 opacity-10">
				<div className="text-3xl">🥕</div>
			</div>

			{/* Centered Modal */}
			<div className="max-w-xl w-full text-center z-10">
				{/* Main Card */}
				<div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200">
					{/* Illustration */}
					<div className="mb-6">
						<div className="relative mx-auto w-32 h-32 md:w-40 md:h-40">
							{/* Farm/Agriculture themed illustration */}
							<div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-20"></div>
							<div className="absolute inset-3 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-30"></div>
							<div className="absolute inset-6 bg-gradient-to-br from-green-300 to-green-400 rounded-full opacity-40"></div>

							{/* Central icon */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative">
									<FaMapMarkerAlt className="h-10 w-10 md:h-12 md:w-12 text-green-600 mb-2" />
									<div className="absolute -top-1 -right-1">
										<FaExclamationTriangle className="h-5 w-5 md:h-6 md:w-6 text-orange-500 animate-bounce" />
									</div>
								</div>
							</div>

							{/* Floating elements */}
							<div className="absolute top-2 left-6 animate-float">
								<div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
							</div>
							<div
								className="absolute bottom-6 right-2 animate-float"
								style={{ animationDelay: "1s" }}
							>
								<div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
							</div>
							<div
								className="absolute top-8 right-8 animate-float"
								style={{ animationDelay: "2s" }}
							>
								<div className="w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-60"></div>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="space-y-4">
						{/* Warning Badge */}
						<div className="inline-flex items-center px-3 py-1.5 bg-orange-100 border border-orange-200 rounded-full">
							<FaExclamationTriangle className="h-3 w-3 text-orange-600 mr-2" />
							<span className="text-xs font-medium text-orange-800">
								Lost in the Fields
							</span>
						</div>

						{/* Main Message */}
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
								Oops! Wrong Field
							</h1>
							<div className="text-lg md:text-xl text-gray-600 mb-1">
								You came to this page...
							</div>
							<div className="text-base md:text-lg font-semibold text-orange-600 mb-4">
								Why are you here? 🤔
							</div>
						</div>

						{/* Description */}
						<div className="max-w-sm mx-auto">
							<p className="text-sm text-gray-500 leading-relaxed">
								Looks like you've wandered into an empty field in our Smart Agro
								Connect platform. This area hasn't been cultivated yet!
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
							<Link
								to="/dashboard/profile"
								onClick={handleGoHome}
								className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
							>
								<FaHome className="mr-2 h-4 w-4" />
								Return to Dashboard Profile
							</Link>

							<Link
								to={""}
								onClick={handleGoBack}
								className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
							>
								<FaArrowLeft className="mr-2 h-4 w-4" />
								Go Back
							</Link>
						</div>

						{/* Fun Agricultural Facts */}
						<div className="pt-4 border-t border-gray-100">
							<p className="text-xs text-gray-400 italic">
								💡 Did you know smart agriculture can increase crop yields by up
								to 30%?
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Custom CSS for animations */}
			<style jsx>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-8px);
					}
				}
				.animate-float {
					animation: float 3s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
