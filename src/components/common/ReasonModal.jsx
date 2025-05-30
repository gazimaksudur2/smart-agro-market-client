import { useState } from "react";
import { FaTimes, FaExclamationTriangle, FaCheck } from "react-icons/fa";

export const ReasonModal = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Provide Reason",
	description = "Please provide a reason for this action:",
	placeholder = "Enter your reason here...",
	confirmText = "Confirm",
	cancelText = "Cancel",
	type = "warning", // warning, danger, info
	isLoading = false,
}) => {
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!reason.trim()) {
			setError("Reason is required");
			return;
		}

		if (reason.trim().length < 3) {
			setError("Reason must be at least 3 characters long");
			return;
		}

		onConfirm(reason.trim());
		handleClose();
	};

	const handleClose = () => {
		setReason("");
		setError("");
		onClose();
	};

	const getTypeColors = () => {
		switch (type) {
			case "danger":
				return {
					icon: "bg-red-100 text-red-600",
					button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
					border: "border-red-200",
				};
			case "info":
				return {
					icon: "bg-blue-100 text-blue-600",
					button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
					border: "border-blue-200",
				};
			default:
				return {
					icon: "bg-orange-100 text-orange-600",
					button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
					border: "border-orange-200",
				};
		}
	};

	const colors = getTypeColors();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
			<div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
				<form onSubmit={handleSubmit}>
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<div className="flex items-center space-x-3">
							<div className={`p-2 rounded-full ${colors.icon}`}>
								<FaExclamationTriangle className="h-5 w-5" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
						</div>
						<button
							type="button"
							onClick={handleClose}
							className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
						>
							<FaTimes className="h-5 w-5" />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 space-y-4">
						<p className="text-gray-600 text-sm leading-relaxed">
							{description}
						</p>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Reason *
							</label>
							<textarea
								value={reason}
								onChange={(e) => {
									setReason(e.target.value);
									if (error) setError("");
								}}
								placeholder={placeholder}
								rows={4}
								className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none ${
									error
										? "border-red-300 focus:ring-red-500"
										: "border-gray-300 focus:ring-primary-500"
								}`}
								autoFocus
							/>
							{error && (
								<p className="text-red-600 text-sm flex items-center">
									<FaExclamationTriangle className="h-4 w-4 mr-1" />
									{error}
								</p>
							)}
						</div>

						<div
							className={`p-3 rounded-lg border ${colors.border} bg-gray-50`}
						>
							<p className="text-xs text-gray-600">
								💡 <strong>Tip:</strong> Provide a clear and professional reason
								that helps the applicant understand your decision.
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
						<button
							type="button"
							onClick={handleClose}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
						>
							{cancelText}
						</button>
						<button
							type="submit"
							disabled={isLoading || !reason.trim()}
							className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
						>
							{isLoading ? (
								<>
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
									Processing...
								</>
							) : (
								<>
									<FaCheck className="h-4 w-4 mr-2" />
									{confirmText}
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
