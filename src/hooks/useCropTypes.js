import axios from "axios";
import { useQuery } from "react-query";

const useCropTypes = () => {
	const fetchCropTypes = async () => {
		const { data } = await axios.get(
			`${import.meta.env.VITE_SERVER_API_URL}/products/crop-types`
		);

		// Check if response has success field and return data accordingly
		if (data?.success) {
			return data.data || [];
		}
		// Fallback for backward compatibility
		return data || [];
	};

	const {
		data: cropTypes,
		isLoading,
		error,
		refetch,
	} = useQuery("cropTypes", fetchCropTypes, {
		staleTime: 300000, // 5 minutes
		refetchOnWindowFocus: false,
	});

	return { cropTypes: cropTypes || [], isLoading, error, refetch };
};

export default useCropTypes;
