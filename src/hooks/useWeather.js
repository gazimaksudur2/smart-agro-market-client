import { useCallback, useEffect, useState } from "react";
import { requestUserLocation, fetchWeather } from "../services/weatherService";
import { useDispatch, useSelector } from "react-redux";
import {
	setRequesting,
	setGranted,
	setDenied,
	setError as setLocError,
} from "../redux/slices/locationSlice";

export default function useWeather() {
	const dispatch = useDispatch();
	const { latitude, longitude, status } = useSelector((s) => s.location);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const ensureLocation = useCallback(async () => {
		if (latitude != null && longitude != null) return { latitude, longitude };
		try {
			dispatch(setRequesting());
			const coords = await requestUserLocation();
			dispatch(setGranted(coords));
			return coords;
		} catch (e) {
			dispatch(setLocError(e?.message || "Location error"));
			dispatch(setDenied(e?.message || "Location denied"));
			throw e;
		}
	}, [latitude, longitude, dispatch]);

	const refresh = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { latitude: lat, longitude: lon } = await ensureLocation();
			const w = await fetchWeather(lat, lon);
			setData(w);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}, [ensureLocation]);

	useEffect(() => {
		// If we already have location, we can auto-fetch once
		if (latitude != null && longitude != null && !data && !loading) {
			refresh();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latitude, longitude]);

	return { loading, error, data, refresh };
}
