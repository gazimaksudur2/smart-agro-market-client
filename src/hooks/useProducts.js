import { useQuery } from "react-query";
import axios from "axios";

const useProducts = ({
	page = 1,
	limit = 9,
	cropType = "",
	region = "",
	district = "",
	minPrice = 1,
	maxPrice = 1000000,
	search = "",
	sortBy = "latest",
} = {}) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [
			"products",
			page,
			limit,
			cropType,
			region,
			district,
			minPrice,
			maxPrice,
			search,
			sortBy,
		],
		queryFn: async () => {
			// Map UI params to API docs: q, priceMin, priceMax, sortBy supports -createdAt etc
			const apiSortBy = sortBy === "latest" ? "-createdAt" : sortBy;
			const params = {
				page,
				limit,
				...(cropType && { cropType }),
				...(region && { region }),
				...(district && { district }),
				...(search && { q: search }),
				...(apiSortBy && { sortBy: apiSortBy }),
				priceMin: minPrice,
				priceMax: maxPrice,
			};

			const res = await axios.get(
				`${import.meta.env.VITE_SERVER_API_URL}/api/products`,
				{ params }
			);

			// Check if response has success field and return data accordingly
			if (res.data?.success) {
				const pagination = res.data.pagination || {};
				return {
					products: res.data.products || [],
					totalProducts: pagination.total || 0,
					totalPages: pagination.totalPages || 1,
					currentPage: pagination.page || 1,
					maxPrice: res.data.maxPrice || 1000000,
				};
			}
			// Fallback for backward compatibility
			return res.data;
		},
		refetchOnWindowFocus: false,
		keepPreviousData: true,
	});

	return {
		products: data?.products || [],
		total: data?.totalProducts || 0,
		totalPages: data?.totalPages || 1,
		currentPage: data?.currentPage || 1,
		maxPrice: data?.maxPrice || 1000000,
		isLoading,
		error,
		refetch,
	};
};

export default useProducts;
