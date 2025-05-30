import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import ProductCard from "../components/Products/ProductCard";
import {
	FaFilter,
	FaSearch,
	FaSortAmountDown,
	FaSortAmountUpAlt,
	FaSyncAlt,
} from "react-icons/fa";
import Select from "react-select";
import { ConfigProvider, InputNumber, Slider, Pagination } from "antd";
import useRegions from "../hooks/useRegions";
import useProducts from "../hooks/useProducts";
import useCropTypes from "../hooks/useCropTypes";

export default function Products() {
	const [sortBy, setSortBy] = useState("latest");
	const [showFilters, setShowFilters] = useState(false);
	const [districts, setDistricts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(9);
	const [filters, setFilters] = useState({
		cropType: "",
		region: "",
		district: "",
		minPrice: 1,
		maxPrice: 1000000,
	});
	const [appliedFilters, setAppliedFilters] = useState({
		cropType: "",
		region: "",
		district: "",
		minPrice: 1,
		maxPrice: 1000000,
	});
	const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
	const regions = useRegions();

	// Use the useProducts hook with applied filters and pagination
	const { products, total, maxPrice, isLoading, error, refetch } = useProducts({
		page: currentPage,
		limit: pageSize,
		cropType: appliedFilters.cropType,
		region: appliedFilters.region,
		district: appliedFilters.district,
		minPrice: appliedFilters.minPrice,
		maxPrice: appliedFilters.maxPrice,
		search: appliedSearchTerm,
		sortBy: sortBy,
	});

	// Fetch all available crop types
	const { cropTypes } = useCropTypes();

	// Filter options for select components
	const regionOptions =
		regions?.map((region) => ({
			value: region.name,
			label: region.name,
		})) || [];

	const districtOptions =
		districts?.map((district) => ({
			value: district.name,
			label: district.name,
		})) || [];

	const cropTypeOptions =
		cropTypes?.map((type) => ({
			value: type,
			label: type,
		})) || [];

	// Update available districts when region changes
	useEffect(() => {
		if (regions && filters.region) {
			const selectedRegion = regions.find((r) => r.name === filters.region);
			if (selectedRegion) {
				setDistricts(selectedRegion.districts);
			} else {
				setDistricts([]);
			}
		}
	}, [filters.region, regions]);

	useEffect(() => {
		setFilters({ ...filters, maxPrice: maxPrice });
	}, [maxPrice]);

	// Ensure initial data loads by applying filters on mount
	useEffect(() => {
		// Apply initial empty filters to load all products
		handleFilterApply();
	}, []); // Run once on mount

	// Apply filters
	const handleFilterApply = () => {
		// Apply current filter selections
		setAppliedFilters({ ...filters });
		setAppliedSearchTerm(searchTerm);
		setCurrentPage(1); // Reset to first page when applying filters

		// Hide filters on mobile after applying
		if (window.innerWidth < 768) {
			setShowFilters(false);
		}
	};

	// Reset filters
	const handleFilterReset = () => {
		const resetFilters = {
			cropType: "",
			region: "",
			district: "",
			minPrice: 1,
			maxPrice: maxPrice,
		};

		setFilters(resetFilters);
		setAppliedFilters(resetFilters);
		setSearchTerm("");
		setAppliedSearchTerm("");
		setCurrentPage(1); // Reset to first page when resetting filters
	};

	// Handle sort change
	const handleSortChange = (value) => {
		setSortBy(value);
		setCurrentPage(1); // Reset to first page when changing sort
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row justify-between items-center mb-6">
					<h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
						Browse Products
					</h1>

					{/* Search bar */}
					<div className="w-full md:w-auto flex items-center gap-4">
						<div className="relative flex-grow mr-2">
							<input
								type="text"
								className="form-input py-2 pr-10 pl-4 rounded-lg shadow-sm w-full md:w-64"
								placeholder="Search products..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
								<FaSearch className="h-5 w-5 text-gray-400" />
							</div>
						</div>
						<button
							className="md:hidden btn flex items-center p-[6px] rounded-lg text-gray-700 hover:bg-gray-100"
							onClick={() => setShowFilters(!showFilters)}
						>
							<FaFilter className="h-5 w-5 mr-1" />
							<span>Filters</span>
						</button>
					</div>
				</div>

				<div className="flex flex-col md:flex-row">
					{/* Filters sidebar */}
					<div
						className={`md:block md:w-64 md:mr-8 ${
							showFilters ? "block" : "hidden"
						}`}
					>
						<div className="bg-white p-4 rounded-lg shadow-sm mb-4">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg font-medium text-gray-900">Filters</h2>
								<button
									className="text-sm text-primary-600 hover:text-primary-800"
									onClick={handleFilterReset}
								>
									Reset All
								</button>
							</div>

							{/* Crop Type Filter */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Crop Type
								</label>
								<Select
									options={cropTypeOptions}
									isClearable
									placeholder="All Crop Types"
									className="text-sm capitalize"
									value={
										filters.cropType
											? { value: filters.cropType, label: filters.cropType }
											: null
									}
									onChange={(option) =>
										setFilters({ ...filters, cropType: option?.value || "" })
									}
								/>
							</div>

							{/* Region Filter */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Region/Division
								</label>
								<Select
									options={regionOptions}
									isClearable
									placeholder="All Regions"
									className="text-sm"
									value={
										filters.region
											? { value: filters.region, label: filters.region }
											: null
									}
									onChange={(option) =>
										setFilters({
											...filters,
											region: option?.value || "",
											district: "", // Reset district when region changes
										})
									}
								/>
							</div>

							{/* District Filter - only enabled if region is selected */}
							<div className="mb-4">
								<label
									className={`block text-sm font-medium ${
										filters.region ? "text-gray-700" : "text-gray-400"
									} mb-1`}
								>
									District
								</label>
								<Select
									options={districtOptions}
									isDisabled={!filters.region}
									isClearable
									placeholder={
										filters.region ? "All Districts" : "Select Region First"
									}
									className="text-sm"
									value={
										filters.district
											? { value: filters.district, label: filters.district }
											: null
									}
									onChange={(option) =>
										setFilters({ ...filters, district: option?.value || "" })
									}
								/>
							</div>

							{/* Price Range */}
							<ConfigProvider
								theme={{
									components: {
										InputNumber: {
											activeBorderColor: "#16a34a",
											hoverBorderColor: "#16a34a",
											controlWidth: 50,
											handleWidth: 12,
										},
										Slider: {
											handleSize: 8,
											handleSizeHover: 7,
											handleColor: "#22c55e",
											handleActiveBorderColor: "#22c55e",
											handleActiveColor: "#22c55e",
											trackBg: "#22c55e",
											trackHoverBg: "#22c55e",
											dotActiveBorderColor: "#22c55e",
											colorPrimary: "#22c55e",
											colorPrimaryHover: "#22c55e",
											colorPrimaryActive: "#22c55e",
										},
									},
								}}
							>
								<div className="mb-4 space-y-4">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Price ( per unit ) Range (৳)
									</label>
									<div className="flex justify-between items-center">
										<InputNumber
											size="small"
											min={1}
											max={filters.maxPrice - 1}
											value={filters.minPrice}
											onChange={(value) =>
												setFilters({ ...filters, minPrice: value })
											}
										/>
										<InputNumber
											size="small"
											min={filters.minPrice + 1}
											max={maxPrice}
											value={filters.maxPrice}
											onChange={(value) =>
												setFilters({ ...filters, maxPrice: value })
											}
										/>
									</div>
									<div className="w-full">
										<Slider
											range={{ draggableTrack: true }}
											value={[filters.minPrice, filters.maxPrice]}
											tooltip={{ open: false }}
											min={1}
											max={maxPrice}
											onChange={(value) => {
												setFilters({
													...filters,
													minPrice: value[0],
													maxPrice: value[1],
												});
											}}
										/>
									</div>
								</div>
							</ConfigProvider>

							{/* Apply button */}
							<button
								className="btn btn-primary w-full"
								onClick={handleFilterApply}
							>
								Apply Filters
							</button>
						</div>

						{/* Sort options on mobile */}
						<div className="bg-white p-4 rounded-lg shadow-sm md:hidden">
							<h2 className="text-lg font-medium text-gray-900 mb-2">
								Sort By
							</h2>
							<div className="flex flex-col space-y-2">
								<button
									className={`flex items-center py-2 px-3 text-sm rounded-md ${
										sortBy === "latest"
											? "bg-primary-100 text-primary-800"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => handleSortChange("latest")}
								>
									<FaSortAmountDown className="mr-2" />
									Latest
								</button>
								<button
									className={`flex items-center py-2 px-3 text-sm rounded-md ${
										sortBy === "oldest"
											? "bg-primary-100 text-primary-800"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => handleSortChange("oldest")}
								>
									<FaSortAmountUpAlt className="mr-2" />
									Oldest
								</button>
								<button
									className={`flex items-center py-2 px-3 text-sm rounded-md ${
										sortBy === "price_low"
											? "bg-primary-100 text-primary-800"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => handleSortChange("price_low")}
								>
									<FaSortAmountUpAlt className="mr-2" />
									Price: Low to High
								</button>
								<button
									className={`flex items-center py-2 px-3 text-sm rounded-md ${
										sortBy === "price_high"
											? "bg-primary-100 text-primary-800"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => handleSortChange("price_high")}
								>
									<FaSortAmountDown className="mr-2" />
									Price: High to Low
								</button>
							</div>
						</div>
					</div>

					{/* Main content */}
					<div className="flex-1">
						{/* Sort bar - desktop */}
						<div className="hidden md:flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
							<div className="text-sm text-gray-500">
								{isLoading ? (
									"Loading products..."
								) : (
									<div className="flex items-center gap-4">
										<span>Showing {products?.length || 0} products</span>
										<FaSyncAlt
											className="ml-2 hover:cursor-pointer"
											onClick={() => refetch()}
										/>
									</div>
								)}
							</div>
							<div className="flex items-center">
								<span className="text-sm font-medium text-gray-700 mr-2">
									Sort by:
								</span>
								<select
									className="form-input py-1 pl-2 pr-8 text-sm rounded"
									value={sortBy}
									onChange={(e) => handleSortChange(e.target.value)}
								>
									<option value="latest">Latest</option>
									<option value="oldest">Oldest</option>
									<option value="price_low">Price: Low to High</option>
									<option value="price_high">Price: High to Low</option>
								</select>
							</div>
						</div>

						{/* Products grid */}
						{isLoading ? (
							<div className="flex justify-center items-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
							</div>
						) : products?.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{products &&
									products?.map((product) => (
										<ProductCard key={product._id} product={product} />
									))}
							</div>
						) : (
							<div className="bg-white p-8 rounded-lg shadow-sm text-center">
								<div className="text-6xl mb-4">🌾</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									No Products Found
								</h3>
								<p className="text-gray-600 mb-4">
									We couldn't find any products matching your criteria.
								</p>
								<button className="btn btn-primary" onClick={handleFilterReset}>
									Reset Filters
								</button>
							</div>
						)}

						{/* Pagination */}
						{total > 0 && (
							<div className="mt-8 flex justify-center">
								<ConfigProvider
									theme={{
										components: {
											Pagination: {
												colorPrimary: "#16a34a",
												colorPrimaryHover: "#16a34a",
												colorPrimaryBorder: "#16a34a",
												colorPrimaryBorderHover: "#16a34a",
											},
										},
									}}
								>
									<Pagination
										current={currentPage}
										total={total}
										pageSize={pageSize}
										showSizeChanger
										pageSizeOptions={[9, 18, 36, 72]}
										showTotal={(total, range) =>
											total > 0
												? `${range[0]}-${range[1]} of ${total} items`
												: "No items"
										}
										onChange={(page, size) => {
											if (size !== pageSize) {
												// Page size changed, reset to page 1
												setCurrentPage(1);
												setPageSize(size);
											} else {
												// Page changed, keep same page size
												setCurrentPage(page);
											}
											window.scrollTo({ top: 0, behavior: "smooth" });
										}}
									/>
								</ConfigProvider>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
