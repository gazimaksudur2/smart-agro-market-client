import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuery } from "react-query";
import {
	FaWarehouse,
	FaBoxOpen,
	FaClipboardList,
	FaExclamationTriangle,
	FaSearch,
	FaFilter,
	FaPlus,
	FaEdit,
	FaEye,
	FaDownload,
	FaUpload,
	FaBarcode,
	FaCalendarAlt,
	FaThermometerHalf,
	FaTruck,
	FaCheckCircle,
	FaClock,
} from "react-icons/fa";
import DashboardTitle from "../../DashboardTitle";
import useAPI from "../../../../hooks/useAPI";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const StockStatusBadge = ({ status, quantity, minStock }) => {
	let statusConfig;

	if (quantity === 0) {
		statusConfig = {
			color: "red",
			text: "Out of Stock",
			icon: FaExclamationTriangle,
		};
	} else if (quantity <= minStock) {
		statusConfig = {
			color: "yellow",
			text: "Low Stock",
			icon: FaExclamationTriangle,
		};
	} else {
		statusConfig = { color: "green", text: "In Stock", icon: FaCheckCircle };
	}

	const IconComponent = statusConfig.icon;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
		>
			<IconComponent className="mr-1 h-3 w-3" />
			{statusConfig.text}
		</span>
	);
};

const CategoryBadge = ({ category }) => {
	const categoryConfig = {
		vegetables: { color: "green", text: "Vegetables" },
		fruits: { color: "orange", text: "Fruits" },
		grains: { color: "yellow", text: "Grains" },
		dairy: { color: "blue", text: "Dairy" },
		meat: { color: "red", text: "Meat" },
		spices: { color: "purple", text: "Spices" },
		other: { color: "gray", text: "Other" },
	};

	const config = categoryConfig[category] || categoryConfig.other;

	return (
		<span
			className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
		>
			{config.text}
		</span>
	);
};

export default function WarehouseManagement() {
	useScrollToTop();
	const { currentUser } = useAuth();
	const { apiCall, loading: apiLoading } = useAPI();
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedItem, setSelectedItem] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState(""); // "add", "edit", "view"

	// Fetch warehouse inventory
	const {
		data: inventory,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["warehouseInventory", currentUser?.id],
		async () => {
			try {
				return await apiCall(`/agent/warehouse/inventory`);
			} catch (error) {
				console.error("Error fetching inventory:", error);
				return [];
			}
		},
		{
			enabled: !!currentUser?.id,
		}
	);

	const displayInventory = inventory || [];

	// Filter inventory
	const filteredInventory = displayInventory.filter((item) => {
		const matchesSearch =
			item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			categoryFilter === "all" || item.category === categoryFilter;

		let matchesStatus = true;
		if (statusFilter === "in_stock") {
			matchesStatus = item.currentStock > item.minStock;
		} else if (statusFilter === "low_stock") {
			matchesStatus =
				item.currentStock > 0 && item.currentStock <= item.minStock;
		} else if (statusFilter === "out_of_stock") {
			matchesStatus = item.currentStock === 0;
		}

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const handleStockUpdate = async (itemId, newStock, operation) => {
		try {
			await apiCall(`/warehouse/inventory/${itemId}/stock`, "PATCH", {
				stock: newStock,
				operation,
				timestamp: new Date().toISOString(),
			});
			refetch();
			alert(`Stock ${operation} successfully`);
		} catch (error) {
			console.error("Error updating stock:", error);
			alert("Failed to update stock");
		}
	};

	const handleAddItem = async (itemData) => {
		try {
			await apiCall(`/warehouse/inventory`, "POST", itemData);
			refetch();
			alert("Item added successfully");
			setShowModal(false);
		} catch (error) {
			console.error("Error adding item:", error);
			alert("Failed to add item");
		}
	};

	const getStockStats = () => {
		const totalItems = displayInventory.length;
		const inStock = displayInventory.filter(
			(item) => item.currentStock > item.minStock
		).length;
		const lowStock = displayInventory.filter(
			(item) => item.currentStock > 0 && item.currentStock <= item.minStock
		).length;
		const outOfStock = displayInventory.filter(
			(item) => item.currentStock === 0
		).length;
		const totalValue = displayInventory.reduce(
			(sum, item) => sum + item.currentStock * item.pricePerUnit,
			0
		);

		return { totalItems, inStock, lowStock, outOfStock, totalValue };
	};

	const stats = getStockStats();

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
				title="Warehouse Management"
				subtitle="Manage inventory, track stock levels, and coordinate warehouse operations"
			/>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaBoxOpen className="h-8 w-8 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Items</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.totalItems}
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
							<p className="text-sm font-medium text-gray-600">In Stock</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.inStock}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaExclamationTriangle className="h-8 w-8 text-yellow-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Low Stock</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.lowStock}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaClock className="h-8 w-8 text-red-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Out of Stock</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.outOfStock}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<FaWarehouse className="h-8 w-8 text-purple-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Value</p>
							<p className="text-2xl font-semibold text-gray-900">
								৳{stats.totalValue.toLocaleString()}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Actions and Filters */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
					<h3 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">
						Inventory Management
					</h3>
					<div className="flex space-x-3">
						<button
							onClick={() => {
								setModalType("add");
								setSelectedItem(null);
								setShowModal(true);
							}}
							className="btn btn-primary"
						>
							<FaPlus className="mr-2" />
							Add Item
						</button>
						<button className="btn btn-outline-secondary">
							<FaDownload className="mr-2" />
							Export
						</button>
						<button className="btn btn-outline-secondary">
							<FaUpload className="mr-2" />
							Import
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Search
						</label>
						<div className="relative">
							<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Search inventory..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Category
						</label>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Categories</option>
							<option value="vegetables">Vegetables</option>
							<option value="fruits">Fruits</option>
							<option value="grains">Grains</option>
							<option value="dairy">Dairy</option>
							<option value="meat">Meat</option>
							<option value="spices">Spices</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Stock Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">All Status</option>
							<option value="in_stock">In Stock</option>
							<option value="low_stock">Low Stock</option>
							<option value="out_of_stock">Out of Stock</option>
						</select>
					</div>

					<div className="flex items-end">
						<button
							onClick={() => {
								setSearchTerm("");
								setCategoryFilter("all");
								setStatusFilter("all");
							}}
							className="btn btn-outline-secondary w-full"
						>
							<FaFilter className="mr-2" />
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Inventory Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Inventory Items ({filteredInventory.length})
					</h3>
				</div>

				{filteredInventory.length === 0 ? (
					<div className="text-center py-12">
						<FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<p className="text-gray-600">
							No inventory items found matching your criteria.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										SKU
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Stock
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Expiry
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredInventory.map((item) => (
									<tr key={item.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{item.productName}
												</div>
												<div className="text-sm text-gray-500">
													<CategoryBadge category={item.category} />
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{item.sku}</div>
											<div className="text-sm text-gray-500">
												{item.supplierName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{item.currentStock} {item.unit}
											</div>
											<div className="text-sm text-gray-500">
												Min: {item.minStock} | Max: {item.maxStock}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<StockStatusBadge
												status={
													item.currentStock === 0
														? "out_of_stock"
														: item.currentStock <= item.minStock
														? "low_stock"
														: "in_stock"
												}
												quantity={item.currentStock}
												minStock={item.minStock}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{item.location}
											</div>
											<div className="text-sm text-gray-500">
												<FaThermometerHalf className="inline mr-1" />
												{item.temperature}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{new Date(item.expiryDate).toLocaleDateString()}
											</div>
											<div className="text-sm text-gray-500">
												{Math.ceil(
													(new Date(item.expiryDate) - new Date()) /
														(1000 * 60 * 60 * 24)
												)}{" "}
												days
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => {
														setSelectedItem(item);
														setModalType("view");
														setShowModal(true);
													}}
													className="text-blue-600 hover:text-blue-900"
												>
													<FaEye />
												</button>
												<button
													onClick={() => {
														setSelectedItem(item);
														setModalType("edit");
														setShowModal(true);
													}}
													className="text-green-600 hover:text-green-900"
												>
													<FaEdit />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Modal for Add/Edit/View */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								{modalType === "add"
									? "Add New Item"
									: modalType === "edit"
									? "Edit Item"
									: "Item Details"}
							</h3>

							{modalType === "view" && selectedItem ? (
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Product Name
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.productName}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												SKU
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.sku}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Current Stock
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.currentStock} {selectedItem.unit}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Location
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.location}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Batch Number
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.batchNumber}
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Expiry Date
											</label>
											<p className="text-sm text-gray-900">
												{new Date(selectedItem.expiryDate).toLocaleDateString()}
											</p>
										</div>
									</div>
									{selectedItem.notes && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Notes
											</label>
											<p className="text-sm text-gray-900">
												{selectedItem.notes}
											</p>
										</div>
									)}
								</div>
							) : (
								<form
									onSubmit={(e) => {
										e.preventDefault();
										// Handle form submission
										setShowModal(false);
									}}
									className="space-y-4"
								>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Product Name
											</label>
											<input
												type="text"
												required
												defaultValue={selectedItem?.productName || ""}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												SKU
											</label>
											<input
												type="text"
												required
												defaultValue={selectedItem?.sku || ""}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Current Stock
											</label>
											<input
												type="number"
												required
												defaultValue={selectedItem?.currentStock || ""}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Unit
											</label>
											<select
												required
												defaultValue={selectedItem?.unit || ""}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
											>
												<option value="">Select Unit</option>
												<option value="kg">Kilogram (kg)</option>
												<option value="g">Gram (g)</option>
												<option value="l">Liter (l)</option>
												<option value="ml">Milliliter (ml)</option>
												<option value="pcs">Pieces (pcs)</option>
											</select>
										</div>
									</div>

									<div className="flex space-x-3">
										<button type="submit" className="flex-1 btn btn-primary">
											{modalType === "add" ? "Add Item" : "Update Item"}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowModal(false);
												setSelectedItem(null);
											}}
											className="flex-1 btn btn-outline-secondary"
										>
											Cancel
										</button>
									</div>
								</form>
							)}

							{modalType === "view" && (
								<div className="flex space-x-3 mt-6">
									<button
										onClick={() => {
											setShowModal(false);
											setSelectedItem(null);
										}}
										className="flex-1 btn btn-outline-secondary"
									>
										Close
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
