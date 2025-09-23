import { FaCheck, FaExclamationTriangle, FaCertificate } from "react-icons/fa";

// Status Badge for Products and Users
export const StatusBadge = ({ status, isActive = null, type = "product" }) => {
	// For users, use isActive prop, for products use status prop
	const actualStatus =
		type === "user" ? (isActive ? "active" : "inactive") : status;

	const statusConfig = {
		approved: {
			text: "Approved",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			dotColor: "bg-green-400",
		},
		pending: {
			text: "Pending",
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-800",
			dotColor: "bg-yellow-400",
		},
		rejected: {
			text: "Rejected",
			bgColor: "bg-red-100",
			textColor: "text-red-800",
			dotColor: "bg-red-400",
		},
		suspended: {
			text: "Suspended",
			bgColor: "bg-orange-100",
			textColor: "text-orange-800",
			dotColor: "bg-orange-400",
		},
		outofstock: {
			text: "Out of Stock",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			dotColor: "bg-gray-400",
		},
		active: {
			text: "Active",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			dotColor: "bg-green-400",
		},
		inactive: {
			text: "Inactive",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			dotColor: "bg-gray-400",
		},
	};

	const config = statusConfig[actualStatus] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} transition-all duration-200 hover:shadow-sm`}
		>
			<span
				className={`w-2 h-2 rounded-full ${config.dotColor} mr-2 animate-pulse`}
			></span>
			{config.text}
		</span>
	);
};

// Quality Badge for Products
export const QualityBadge = ({ quality }) => {
	const qualityConfig = {
		A: {
			text: "Grade A",
			bgColor: "bg-emerald-100",
			textColor: "text-emerald-800",
			borderColor: "border-emerald-200",
		},
		B: {
			text: "Grade B",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			borderColor: "border-blue-200",
		},
		C: {
			text: "Grade C",
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-800",
			borderColor: "border-yellow-200",
		},
		D: {
			text: "Grade D",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			borderColor: "border-gray-200",
		},
	};

	const config = qualityConfig[quality] || qualityConfig.D;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} transition-all duration-200 hover:shadow-sm hover:scale-105`}
		>
			<FaCertificate className="mr-1.5 h-3 w-3" />
			{config.text}
		</span>
	);
};

// Category Badge for Products
export const CategoryBadge = ({ category }) => {
	const categoryConfig = {
		rice: {
			text: "Rice",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			icon: "🌾",
		},
		vegetable: {
			text: "Vegetables",
			bgColor: "bg-emerald-100",
			textColor: "text-emerald-800",
			icon: "🥬",
		},
		fruit: {
			text: "Fruits",
			bgColor: "bg-orange-100",
			textColor: "text-orange-800",
			icon: "🍎",
		},
		wheat: {
			text: "Wheat",
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-800",
			icon: "🌾",
		},
		spices: {
			text: "Spices",
			bgColor: "bg-red-100",
			textColor: "text-red-800",
			icon: "🌶️",
		},
		dairy: {
			text: "Dairy",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			icon: "🥛",
		},
		fish: {
			text: "Fish",
			bgColor: "bg-cyan-100",
			textColor: "text-cyan-800",
			icon: "🐟",
		},
		meat: {
			text: "Meat",
			bgColor: "bg-purple-100",
			textColor: "text-purple-800",
			icon: "🥩",
		},
		other: {
			text: "Other",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			icon: "📦",
		},
	};

	const config =
		categoryConfig[category?.toLowerCase()] || categoryConfig.other;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} transition-all duration-200 hover:shadow-sm hover:scale-105`}
		>
			<span className="mr-1.5">{config.icon}</span>
			{config.text}
		</span>
	);
};

// Role Badge for Users
export const RoleBadge = ({ role }) => {
	const roleConfig = {
		admin: {
			text: "Admin",
			bgColor: "bg-purple-100",
			textColor: "text-purple-800",
			icon: "👑",
		},
		agent: {
			text: "Agent",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
			icon: "🤝",
		},
		seller: {
			text: "Seller",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			icon: "🌱",
		},
		consumer: {
			text: "Consumer",
			bgColor: "bg-gray-100",
			textColor: "text-gray-800",
			icon: "🛒",
		},
	};

	const config = roleConfig[role] || roleConfig.consumer;

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} transition-all duration-200 hover:shadow-sm hover:scale-105`}
		>
			<span className="mr-1.5">{config.icon}</span>
			{config.text}
		</span>
	);
};

// Verification Badge for Users
export const VerificationBadge = ({ verified }) => {
	return verified ? (
		<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 transition-all duration-200 hover:shadow-sm hover:scale-105">
			<FaCheck className="mr-1.5 h-3 w-3" />
			Verified
		</span>
	) : (
		<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 transition-all duration-200 hover:shadow-sm hover:scale-105">
			<FaExclamationTriangle className="mr-1.5 h-3 w-3" />
			Unverified
		</span>
	);
};
