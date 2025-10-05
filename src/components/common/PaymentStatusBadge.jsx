/**
 * Reusable payment status badge component
 * Used across different user role dashboards
 */
const PaymentStatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
		paid: { color: "bg-green-100 text-green-800", text: "Paid" },
		failed: { color: "bg-red-100 text-red-800", text: "Failed" },
		refunded: { color: "bg-gray-100 text-gray-800", text: "Refunded" },
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
		>
			{config.text}
		</span>
	);
};

export default PaymentStatusBadge;
