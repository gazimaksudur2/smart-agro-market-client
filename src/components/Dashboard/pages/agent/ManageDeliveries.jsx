import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaTruck,
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaPhone,
	FaUser,
	FaBoxOpen,
	FaCheckCircle,
	FaClock,
	FaExclamationTriangle,
	FaSearch,
	FaFilter,
	FaEye,
	FaEdit,
	FaRoute,
	FaClipboardList,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { color: "yellow", text: "Pending Pickup", icon: FaClock },
		picked_up: { color: "blue", text: "Picked Up", icon: FaTruck },
		in_transit: { color: "purple", text: "In Transit", icon: FaRoute },
		out_for_delivery: {
			color: "indigo",
			text: "Out for Delivery",
			icon: FaTruck,
		},
		delivered: { color: "green", text: "Delivered", icon: FaCheckCircle },
		failed: {
			color: "red",
			text: "Delivery Failed",
			icon: FaExclamationTriangle,
		},
		returned: { color: "gray", text: "Returned", icon: FaBoxOpen },
	};

	const config = statusConfig[status] || statusConfig.pending;
	const IconComponent = config.icon;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			<IconComponent className="mr-1 h-3 w-3" />
			{config.text}
		</span>
	);
};

const PriorityBadge = ({ priority }) => {
	const priorityConfig = {
		low: { color: "gray", text: "Low" },
		normal: { color: "blue", text: "Normal" },
		high: { color: "orange", text: "High" },
		urgent: { color: "red", text: "Urgent" },
	};

	const config = priorityConfig[priority] || priorityConfig.normal;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

export default function ManageDeliveries() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [selectedDelivery, setSelectedDelivery] = useState(null);
	const [showModal, setShowModal] = useState(false);

	// Fetch deliveries
	const {
		data: deliveries,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["agentDeliveries", currentUser?.id],
		async () => {
			try {
				return await apiCall(`/agent/deliveries`);
			} catch (error) {
				console.error("Error fetching deliveries:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.id,
		}
	);

	// Mock data for demo
	const mockDeliveries = [
		{
			id: "DEL-001",
			orderId: "ORD-2024-001",
			customerName: "Ahmed Rahman",
			customerPhone: "+8801712345678",
			customerAddress: "House 45, Road 12, Dhanmondi, Dhaka",
			sellerName: "Green Valley Farms",
			products: [
				{ name: "Organic Basmati Rice", quantity: "10 kg" },
				{ name: "Fresh Tomatoes", quantity: "2 kg" },
			],
			status: "in_transit",
			priority: "normal",
			scheduledDate: "2024-01-25",
			estimatedTime: "10:00 AM - 12:00 PM",
			driverName: "Karim Ahmed",
			driverPhone: "+8801812345678",
			vehicleNumber: "DHK-1234",
			totalValue: 1478,
			deliveryCharge: 50,
			notes: "Please call before delivery",
			createdAt: "2024-01-22T10:30:00Z",
		},
		{
			id: "DEL-002",
			orderId: "ORD-2024-002",
			customerName: "Fatima Begum",
			customerPhone: "+8801612345678",
			customerAddress: "Plot 15, Gulshan-2, Dhaka",
			sellerName: "Organic Harvest",
			products: [{ name: "Fresh Vegetables Mix", quantity: "5 kg" }],
			status: "pending",
			priority: "high",
			scheduledDate: "2024-01-24",
			estimatedTime: "2:00 PM - 4:00 PM",
			driverName: null,
			driverPhone: null,
			vehicleNumber: null,
			totalValue: 850,
			deliveryCharge: 40,
			notes: "Fragile items - handle with care",
			createdAt: "2024-01-23T08:15:00Z",
		},
		{
			id: "DEL-003",
			orderId: "ORD-2024-003",
			customerName: "Mohammad Ali",
			customerPhone: "+8801512345678",
			customerAddress: "House 78, Uttara Sector 7, Dhaka",
			sellerName: "Fresh Farm Co.",
			products: [
				{ name: "Premium Dates", quantity: "3 kg" },
				{ name: "Honey", quantity: "1 kg" },
			],
			status: "delivered",
			priority: "normal",
			scheduledDate: "2024-01-23",
			estimatedTime: "9:00 AM - 11:00 AM",
			driverName: "Rahim Uddin",
			driverPhone: "+8801912345678",
			vehicleNumber: "DHK-5678",
			totalValue: 1200,
			deliveryCharge: 45,
			notes: "",
			deliveredAt: "2024-01-23T10:30:00Z",
			createdAt: "2024-01-21T14:20:00Z",
		},
	];

	const displayDeliveries = deliveries || mockDeliveries;

	// Filter deliveries
	const filteredDeliveries = displayDeliveries.filter((delivery) => {
		const matchesSearch =
			delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
			delivery.customerAddress.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || delivery.status === statusFilter;
		const matchesPriority =
			priorityFilter === "all" || delivery.priority === priorityFilter;

		return matchesSearch && matchesStatus && matchesPriority;
	});

	const handleStatusUpdate = async (deliveryId, newStatus) => {
		try {
			await apiCall(`/deliveries/${deliveryId}/status`, "PATCH", {
				status: newStatus,
			});
			refetch();
			alert(`Delivery status updated to ${newStatus}`);
		} catch (error) {
			console.error("Error updating delivery status:", error);
			alert("Failed to update delivery status");
		}
	};

	const handleAssignDriver = async (deliveryId, driverData) => {
		try {
			await apiCall(
				`/deliveries/${deliveryId}/assign-driver`,
				"PATCH",
				driverData
			);
			refetch();
			alert("Driver assigned successfully");
		} catch (error) {
			console.error("Error assigning driver:", error);
			alert("Failed to assign driver");
		}
	};

	const getStatusActions = (delivery) => {
		const actions = [];

		switch (delivery.status) {
			case "pending":
				actions.push(
					<button
						key="assign"
						onClick={() => {
							setSelectedDelivery(delivery);
							setShowModal(true);
						}}
						className="btn btn-sm btn-primary"
					>
						Assign Driver
					</button>
				);
				break;
			case "picked_up":
				actions.push(
					<button
						key="transit"
						onClick={() => handleStatusUpdate(delivery.id, "in_transit")}
						className="btn btn-sm btn-primary"
					>
						Mark In Transit
					</button>
				);
				break;
			case "in_transit":
				actions.push(
					<button
						key="out_for_delivery"
						onClick={() => handleStatusUpdate(delivery.id, "out_for_delivery")}
						className="btn btn-sm btn-primary"
					>
						Out for Delivery
					</button>
				);
				break;
			case "out_for_delivery":
				actions.push(
					<button
						key="delivered"
						onClick={() => handleStatusUpdate(delivery.id, "delivered")}
						className="btn btn-sm btn-success"
					>
						Mark Delivered
					</button>,
					<button
						key="failed"
						onClick={() => handleStatusUpdate(delivery.id, "failed")}
						className="btn btn-sm btn-outline-red"
					>
						Mark Failed
					</button>
				);
				break;
		}

		return actions;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<DashboardTitle
				title="Manage Deliveries"
				subtitle="Track and manage delivery operations in your region"
			/>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaClock className="h-8 w-8 text-yellow-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Pending</p>
							<p className="text-2xl font-semibold text-gray-900">
								{displayDeliveries.filter((d) => d.status === "pending").length}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaTruck className="h-8 w-8 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">In Transit</p>
							<p className="text-2xl font-semibold text-gray-900">
								{
									displayDeliveries.filter((d) =>
										["picked_up", "in_transit", "out_for_delivery"].includes(
											d.status
										)
									).length
								}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaCheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Delivered</p>
							<p className="text-2xl font-semibold text-gray-900">
								{
									displayDeliveries.filter((d) => d.status === "delivered")
										.length
								}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaExclamationTriangle className="h-8 w-8 text-red-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Failed</p>
							<p className="text-2xl font-semibold text-gray-900">
								{displayDeliveries.filter((d) => d.status === "failed").length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Search
						</label>
						<div className="relative">
							<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Search deliveries..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="picked_up">Picked Up</option>
							<option value="in_transit">In Transit</option>
							<option value="out_for_delivery">Out for Delivery</option>
							<option value="delivered">Delivered</option>
							<option value="failed">Failed</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Priority
						</label>
						<select
							value={priorityFilter}
							onChange={(e) => setPriorityFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Priority</option>
							<option value="low">Low</option>
							<option value="normal">Normal</option>
							<option value="high">High</option>
							<option value="urgent">Urgent</option>
						</select>
					</div>

					<div className="flex items-end">
						<button
							onClick={() => {
								setSearchTerm("");
								setStatusFilter("all");
								setPriorityFilter("all");
							}}
							className="btn btn-outline-secondary w-full"
						>
							<FaFilter className="mr-2" />
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Deliveries List */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Delivery Orders ({filteredDeliveries.length})
					</h3>
				</div>

				{filteredDeliveries.length === 0 ? (
					<div className="text-center py-12">
						<FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p className="text-gray-600">
							No deliveries found matching your criteria.
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredDeliveries.map((delivery) => (
							<div key={delivery.id} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-4">
										<div>
											<h4 className="text-lg font-medium text-gray-900">
												{delivery.orderId}
											</h4>
											<p className="text-sm text-gray-600">
												{delivery.customerName} • {delivery.customerPhone}
											</p>
										</div>
										<StatusBadge status={delivery.status} />
										<PriorityBadge priority={delivery.priority} />
									</div>
									<div className="flex space-x-2">
										{getStatusActions(delivery)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
									<div>
										<p className="text-sm font-medium text-gray-700 mb-1">
											<FaMapMarkerAlt className="inline mr-1" />
											Delivery Address
										</p>
										<p className="text-sm text-gray-600">
											{delivery.customerAddress}
										</p>
									</div>

									<div>
										<p className="text-sm font-medium text-gray-700 mb-1">
											<FaCalendarAlt className="inline mr-1" />
											Scheduled
										</p>
										<p className="text-sm text-gray-600">
											{new Date(delivery.scheduledDate).toLocaleDateString()} •{" "}
											{delivery.estimatedTime}
										</p>
									</div>

									<div>
										<p className="text-sm font-medium text-gray-700 mb-1">
											<FaBoxOpen className="inline mr-1" />
											Products
										</p>
										<p className="text-sm text-gray-600">
											{delivery.products
												.map((p) => `${p.name} (${p.quantity})`)
												.join(", ")}
										</p>
									</div>
								</div>

								{delivery.driverName && (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
										<div>
											<p className="text-sm font-medium text-blue-700 mb-1">
												<FaUser className="inline mr-1" />
												Driver
											</p>
											<p className="text-sm text-blue-600">
												{delivery.driverName}
											</p>
										</div>

										<div>
											<p className="text-sm font-medium text-blue-700 mb-1">
												<FaPhone className="inline mr-1" />
												Contact
											</p>
											<p className="text-sm text-blue-600">
												{delivery.driverPhone}
											</p>
										</div>

										<div>
											<p className="text-sm font-medium text-blue-700 mb-1">
												<FaTruck className="inline mr-1" />
												Vehicle
											</p>
											<p className="text-sm text-blue-600">
												{delivery.vehicleNumber}
											</p>
										</div>
									</div>
								)}

								{delivery.notes && (
									<div className="p-3 bg-yellow-50 rounded-lg">
										<p className="text-sm font-medium text-yellow-700 mb-1">
											Special Notes
										</p>
										<p className="text-sm text-yellow-600">{delivery.notes}</p>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Driver Assignment Modal */}
			{showModal && selectedDelivery && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Assign Driver - {selectedDelivery.orderId}
							</h3>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.target);
									const driverData = {
										driverName: formData.get("driverName"),
										driverPhone: formData.get("driverPhone"),
										vehicleNumber: formData.get("vehicleNumber"),
									};
									handleAssignDriver(selectedDelivery.id, driverData);
									setShowModal(false);
									setSelectedDelivery(null);
								}}
								className="space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Driver Name
									</label>
									<input
										type="text"
										name="driverName"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Driver Phone
									</label>
									<input
										type="tel"
										name="driverPhone"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Vehicle Number
									</label>
									<input
										type="text"
										name="vehicleNumber"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									/>
								</div>

								<div className="flex space-x-3">
									<button type="submit" className="flex-1 btn btn-primary">
										Assign Driver
									</button>
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setSelectedDelivery(null);
										}}
										className="flex-1 btn btn-outline-secondary"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
