import { useState, useEffect } from "react";
import { FaTimes, FaExpand, FaCompress } from "react-icons/fa";

export const ModernModal = ({
	isOpen,
	onClose,
	title,
	children,
	size = "large",
	actions = null,
	className = "",
}) => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsAnimating(true);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
			const timer = setTimeout(() => setIsAnimating(false), 300);
			return () => clearTimeout(timer);
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const sizeClasses = {
		small: "w-11/12 md:w-1/3",
		medium: "w-11/12 md:w-2/3",
		large: "w-11/12 md:w-3/4 lg:w-2/3",
		xlarge: "w-11/12 md:w-5/6 lg:w-4/5",
	};

	if (!isOpen && !isAnimating) return null;

	return (
		<div
			className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
				isOpen ? "opacity-100" : "opacity-0"
			}`}
		>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-black transition-opacity duration-300 ${
					isOpen ? "opacity-50" : "opacity-0"
				}`}
				onClick={handleBackdropClick}
			></div>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div
					className={`relative ${
						isFullScreen ? "w-full h-full" : sizeClasses[size]
					} ${
						isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
					} transform transition-all duration-300 ${className}`}
				>
					<div
						className={`bg-white rounded-2xl shadow-2xl border border-gray-200 ${
							isFullScreen ? "h-full" : "max-h-[90vh]"
						} flex flex-col overflow-hidden`}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
							<h3 className="text-xl font-semibold text-gray-900 truncate pr-4">
								{title}
							</h3>
							<div className="flex items-center space-x-2">
								<button
									onClick={() => setIsFullScreen(!isFullScreen)}
									className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
									title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
								>
									{isFullScreen ? (
										<FaCompress className="h-4 w-4" />
									) : (
										<FaExpand className="h-4 w-4" />
									)}
								</button>
								<button
									onClick={onClose}
									className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
									title="Close"
								>
									<FaTimes className="h-5 w-5" />
								</button>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 bg-gray-50">
							<div className="bg-white rounded-xl p-6 shadow-sm">
								{children}
							</div>
						</div>

						{/* Actions */}
						{actions && (
							<div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-white">
								{actions}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export const ActionButton = ({
	onClick,
	variant = "primary",
	icon: Icon,
	children,
	disabled = false,
	loading = false,
	className = "",
}) => {
	const variants = {
		primary:
			"bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
		secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
		success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
		warning:
			"bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500",
		outline:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled || loading}
			className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variants[variant]} ${className}`}
		>
			{loading ? (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4"
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
				Icon && <Icon className="mr-2 h-4 w-4" />
			)}
			{children}
		</button>
	);
};

export const InfoCard = ({
	title,
	children,
	className = "",
	color = "gray",
}) => {
	const colorClasses = {
		gray: "bg-gray-50 border-gray-200",
		blue: "bg-blue-50 border-blue-200",
		green: "bg-green-50 border-green-200",
		yellow: "bg-yellow-50 border-yellow-200",
		red: "bg-red-50 border-red-200",
		purple: "bg-purple-50 border-purple-200",
	};

	return (
		<div
			className={`p-4 rounded-xl border ${colorClasses[color]} ${className}`}
		>
			{title && (
				<h5 className="font-semibold text-gray-900 mb-3 flex items-center">
					{title}
				</h5>
			)}
			{children}
		</div>
	);
};

export const ImageGallery = ({ images = [], title = "Images" }) => {
	const [selectedImage, setSelectedImage] = useState(0);

	if (!images || images.length === 0) return null;

	return (
		<div className="space-y-4">
			{/* Main Image */}
			<div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
				<img
					src={images[selectedImage]}
					alt={`${title} ${selectedImage + 1}`}
					className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
					onError={(e) => {
						e.target.src =
							"https://via.placeholder.com/400x300?text=Image+Not+Found";
					}}
				/>
				{images.length > 1 && (
					<div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
						{selectedImage + 1} / {images.length}
					</div>
				)}
			</div>

			{/* Thumbnail Gallery */}
			{images.length > 1 && (
				<div className="grid grid-cols-4 md:grid-cols-6 gap-2">
					{images.map((image, index) => (
						<button
							key={index}
							onClick={() => setSelectedImage(index)}
							className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
								selectedImage === index
									? "border-primary-500 ring-2 ring-primary-200"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<img
								src={image}
								alt={`${title} thumbnail ${index + 1}`}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src =
										"https://via.placeholder.com/80x80?text=No+Image";
								}}
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export const DetailRow = ({ label, value, className = "" }) => (
	<div className={`flex justify-between items-start py-2 ${className}`}>
		<span className="text-sm font-medium text-gray-500 flex-shrink-0 mr-4">
			{label}:
		</span>
		<span className="text-sm text-gray-900 text-right">{value}</span>
	</div>
);

export const TabPanel = ({ tabs, activeTab, setActiveTab, className = "" }) => {
	return (
		<div className={className}>
			{/* Tab Headers */}
			<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
							activeTab === tab.id
								? "bg-white text-primary-600 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{tab.icon && <tab.icon className="inline mr-2 h-4 w-4" />}
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div>{tabs.find((tab) => tab.id === activeTab)?.content}</div>
		</div>
	);
};
