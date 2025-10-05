import { FaClock, FaCheckCircle, FaTruck, FaTimesCircle } from "react-icons/fa";

/**
 * Reusable order status badge component
 * Used across different user role dashboards
 */
const OrderStatusBadge = ({ status }) => {
	const statusConfig = {
		pending: {
			color: "bg-yellow-100 text-yellow-800",
			icon: <FaClock className="h-3 w-3" />,
			label: "Pending",
		},
		confirmed: {
			color: "bg-blue-100 text-blue-800",
			icon: <FaCheckCircle className="h-3 w-3" />,
			label: "Confirmed",
		},
		processing: {
			color: "bg-orange-100 text-orange-800",
			icon: <FaClock className="h-3 w-3" />,
			label: "Processing",
		},
		shipped: {
			color: "bg-purple-100 text-purple-800",
			icon: <FaTruck className="h-3 w-3" />,
			label: "Shipped",
		},
		delivered: {
			color: "bg-green-100 text-green-800",
			icon: <FaCheckCircle className="h-3 w-3" />,
			label: "Delivered",
		},
		cancelled: {
			color: "bg-red-100 text-red-800",
			icon: <FaTimesCircle className="h-3 w-3" />,
			label: "Cancelled",
		},
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
		>
			{config.icon}
			<span className="ml-1">{config.label}</span>
		</span>
	);
};

export default OrderStatusBadge;
