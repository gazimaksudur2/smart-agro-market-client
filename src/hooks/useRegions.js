import axios from "axios";
import { useQuery } from "react-query";

const apiBaseUrl =
	import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

const useRegions = () => {
	const { data: regions } = useQuery("regions", async () => {
		const { data } = await axios.get(`${apiBaseUrl}/regions`);
		return data.regions;
	});
	return regions || [];
};

export default useRegions;
