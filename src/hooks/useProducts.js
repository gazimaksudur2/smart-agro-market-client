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
			const params = {
				page,
				limit,
				...(cropType && { cropType }),
				...(region && { region }),
				...(district && { district }),
				...(search && { search }),
				...(sortBy && { sortBy }),
				minPrice,
				maxPrice,
			};

			const res = await axios.get(
				`${import.meta.env.VITE_SERVER_API_URL}/products`,
				{ params }
			);
			return res.data;
		},
		refetchOnWindowFocus: false,
		keepPreviousData: true,
	});

	return {
		products: data?.products || [],
		total: data?.totalProducts || 0,
		maxPrice: data?.maxPrice || 1000000,
		isLoading,
		error,
		refetch,
	};
};

export default useProducts;
