import { useState } from "react";
import {
	FaSort,
	FaSortUp,
	FaSortDown,
	FaEye,
	FaSpinner,
	FaChevronLeft,
	FaChevronRight,
} from "react-icons/fa";

export const DataTable = ({
	columns,
	data,
	loading = false,
	sortable = true,
	selectable = true,
	onRowClick = null,
	onSort = null,
	sortField = "",
	sortDirection = "asc",
	selectedItems = [],
	onSelectionChange = null,
	className = "",
}) => {
	const handleSort = (field) => {
		if (!sortable || !onSort) return;

		const newDirection =
			sortField === field && sortDirection === "asc" ? "desc" : "asc";
		onSort(field, newDirection);
	};

	const handleSelectAll = (checked) => {
		if (!onSelectionChange) return;
		onSelectionChange(checked ? data.map((item) => item._id) : []);
	};

	const handleSelectItem = (itemId, checked) => {
		if (!onSelectionChange) return;

		const newSelection = checked
			? [...selectedItems, itemId]
			: selectedItems.filter((id) => id !== itemId);
		onSelectionChange(newSelection);
	};

	const SortIcon = ({ field }) => {
		if (sortField !== field)
			return <FaSort className="h-3 w-3 text-gray-400" />;
		return sortDirection === "asc" ? (
			<FaSortUp className="h-3 w-3 text-primary-500" />
		) : (
			<FaSortDown className="h-3 w-3 text-primary-500" />
		);
	};

	const isAllSelected = data.length > 0 && selectedItems.length === data.length;
	const isIndeterminate =
		selectedItems.length > 0 && selectedItems.length < data.length;

	if (loading) {
		return (
			<div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<FaSpinner className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
						<p className="text-gray-500">Loading data...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
				<div className="text-center py-20">
					<div className="text-gray-400 mb-4">
						<svg
							className="mx-auto h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V9a2 2 0 012 2v2m0 0h2"
							/>
						</svg>
					</div>
					<p className="text-lg font-medium text-gray-500 mb-2">
						No data found
					</p>
					<p className="text-gray-400">
						Try adjusting your filters or search terms.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden ${className}`}
		>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{selectable && (
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
									<input
										type="checkbox"
										checked={isAllSelected}
										ref={(input) => {
											if (input) input.indeterminate = isIndeterminate;
										}}
										onChange={(e) => handleSelectAll(e.target.checked)}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
									/>
								</th>
							)}
							{columns.map((column) => (
								<th
									key={column.key}
									className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
										column.sortable && sortable
											? "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
											: ""
									}`}
									onClick={() => column.sortable && handleSort(column.key)}
								>
									<div className="flex items-center space-x-2">
										<span>{column.title}</span>
										{column.sortable && sortable && (
											<SortIcon field={column.key} />
										)}
									</div>
								</th>
							))}
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{data.map((item, index) => (
							<tr
								key={item._id}
								className={`hover:bg-gray-50 transition-colors duration-200 ${
									selectedItems.includes(item._id) ? "bg-blue-50" : ""
								} ${onRowClick ? "cursor-pointer" : ""}`}
								onClick={() => onRowClick && onRowClick(item)}
							>
								{selectable && (
									<td className="px-6 py-4 whitespace-nowrap">
										<input
											type="checkbox"
											checked={selectedItems.includes(item._id)}
											onChange={(e) => {
												e.stopPropagation();
												handleSelectItem(item._id, e.target.checked);
											}}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
										/>
									</td>
								)}
								{columns.map((column) => (
									<td key={column.key} className="px-6 py-4 whitespace-nowrap">
										{column.render
											? column.render(item[column.key], item, index)
											: item[column.key]}
									</td>
								))}
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={(e) => {
											e.stopPropagation();
											onRowClick && onRowClick(item);
										}}
										className="text-primary-600 hover:text-primary-900 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-50"
										title="View Details"
									>
										<FaEye className="h-4 w-4" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export const Pagination = ({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
	className = "",
	loading = false,
}) => {
	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else {
			if (totalPages > 1) rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);
	const endItem = Math.min(currentPage * pageSize, totalItems);

	if (totalPages <= 1) return null;

	return (
		<div
			className={`bg-white mt-6 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg ${className}`}
		>
			<div className="flex-1 flex justify-between items-center">
				<div>
					<p className="text-sm text-gray-700">
						{loading ? (
							<span className="flex items-center">
								<FaSpinner className="animate-spin h-4 w-4 mr-2" />
								Loading...
							</span>
						) : (
							<>
								Showing <span className="font-medium">{startItem}</span> to{" "}
								<span className="font-medium">{endItem}</span> of{" "}
								<span className="font-medium">{totalItems}</span> results
							</>
						)}
					</p>
				</div>
				<div>
					<nav
						className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
						aria-label="Pagination"
					>
						<button
							onClick={() => onPageChange(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1 || loading}
							className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
						>
							<FaChevronLeft className="h-4 w-4" />
						</button>

						{getVisiblePages().map((page, index) =>
							page === "..." ? (
								<span
									key={index}
									className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
								>
									...
								</span>
							) : (
								<button
									key={index}
									onClick={() => onPageChange(page)}
									disabled={loading}
									className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed ${
										currentPage === page
											? "z-10 bg-primary-50 border-primary-500 text-primary-600"
											: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
									}`}
								>
									{page}
								</button>
							)
						)}

						<button
							onClick={() =>
								onPageChange(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages || loading}
							className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
						>
							<FaChevronRight className="h-4 w-4" />
						</button>
					</nav>
				</div>
			</div>
		</div>
	);
};
