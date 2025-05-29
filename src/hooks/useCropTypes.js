
import { useQuery } from "react-query";
import axios from "axios";

const useCropTypes = () => {
    const { data: cropTypes, refetch, error, isLoading } = useQuery("cropTypes", async () => {
        const { data } = await axios.get(`${import.meta.env.VITE_SERVER_API_URL}/products/crop-types`);
        return data.data;
    });
    return { cropTypes, refetch, error, isLoading };
};

export default useCropTypes;

