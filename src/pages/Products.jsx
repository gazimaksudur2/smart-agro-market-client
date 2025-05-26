import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import ProductCard from "../components/Products/ProductCard";
import {
	FaFilter,
	FaSearch,
	FaSortAmountDown,
	FaSortAmountUpAlt,
} from "react-icons/fa";
import Select from "react-select";
import { ConfigProvider, InputNumber, Slider } from "antd";

export default function Products() {
	const [sortBy, setSortBy] = useState("latest");
	const [showFilters, setShowFilters] = useState(false);
	const [districts, setDistricts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [curMax, setCurMax] = useState(1000);
	const [products, setProducts] = useState([]);
	const [filters, setFilters] = useState({
		cropType: "",
		region: "",
		district: "",
		minPrice: 1,
		maxPrice: 1000,
	});

	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Fetch regions for filter
	const { data: regions } = useQuery("regions", async () => {
		const { data } = await axios.get(`${apiBaseUrl}/regions`);
		return data.regions;
	});

	// Fetch all available crop types
	const { data: cropTypes } = useQuery("cropTypes", async () => {
		const { data } = await axios.get(`${apiBaseUrl}/products/crop-types`);
		return data.data;
	});

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
		setFilters({...filters, maxPrice: curMax });
	}, [])

	// Fetch products with filters
	const {
		data: productsData,
		isLoading,
		refetch,
	} = useQuery(
		["products", filters, sortBy, searchTerm],
		async () => {
			const params = { ...filters };

			if (searchTerm) {
				params.search = searchTerm;
			}

			if (sortBy) {
				params.sortBy = sortBy;
			}

			const { data } = await axios.get(`${apiBaseUrl}/products`, { params });
			return data;
		},
		{
			// Don't refetch on window focus
			refetchOnWindowFocus: false,
		}
	);


	// Apply filters
	const handleFilterApply = () => {
		refetch();
		// Hide filters on mobile after applying
		if (window.innerWidth < 768) {
			setShowFilters(false);
		}
	};

	// Reset filters
	const handleFilterReset = () => {
		setFilters({
			cropType: "",
			region: "",
			district: "",
			minPrice: 1,
			maxPrice: curMax,
		});
		setSearchTerm("");

		// After resetting, apply the filters
		setTimeout(() => {
			refetch();
		}, 0);
	};

	// Handle sort change
	const handleSortChange = (value) => {
		setSortBy(value);
	};

	useEffect(() => {
		setProducts(productsData?.products);
		productsData?.products && setCurMax(productsData?.maxPrice);
	}, [productsData]);

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
									className="text-sm"
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
										Price ( per kg ) Range (৳)
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
											max={curMax}
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
											max={curMax}
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
									<span>Showing {products?.length || 0} products</span>
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
								{products && products?.map((product) => (
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

						{/* Pagination - would be implemented with real backend pagination */}
						{products?.length > 0 && (
							<div className="mt-8 flex justify-center">
								<nav
									className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
									aria-label="Pagination"
								>
									<button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
										<span className="sr-only">Previous</span>
										<svg
											className="h-5 w-5"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fillRule="evenodd"
												d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
									<button className="relative inline-flex items-center px-4 py-2 border border-primary-500 bg-primary-50 text-sm font-medium text-primary-600">
										1
									</button>
									<button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
										2
									</button>
									<button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
										3
									</button>
									<button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
										<span className="sr-only">Next</span>
										<svg
											className="h-5 w-5"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fillRule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</nav>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
