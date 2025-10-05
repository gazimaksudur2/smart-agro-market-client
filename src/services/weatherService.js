const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

export function requestUserLocation(
	options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
) {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation is not supported by this browser."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				resolve({ latitude, longitude });
			},
			(err) => reject(err),
			options
		);
	});
}

export async function fetchWeather(lat, lon) {
	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lon),
		current: [
			"temperature_2m",
			"relative_humidity_2m",
			"apparent_temperature",
			"is_day",
			"precipitation",
			"weather_code",
			"wind_speed_10m",
		].join(","),
		hourly: [
			"temperature_2m",
			"relative_humidity_2m",
			"precipitation",
			"precipitation_probability",
			"weather_code",
			"wind_speed_10m",
		].join(","),
		daily: [
			"temperature_2m_max",
			"temperature_2m_min",
			"precipitation_sum",
			"sunrise",
			"sunset",
			"weather_code",
		].join(","),
		timezone: "auto",
	});
	const url = `${OPEN_METEO_BASE}?${params.toString()}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch weather");
	const data = await res.json();
	return normalizeWeather(data);
}

function normalizeWeather(data) {
	const c = data.current || {};
	const daily = data.daily || {};
	const hourly = data.hourly || {};
	return {
		location: {
			timezone: data.timezone,
			latitude: data.latitude,
			longitude: data.longitude,
		},
		current: {
			tempC: c.temperature_2m,
			feelsLikeC: c.apparent_temperature,
			humidity: c.relative_humidity_2m,
			precipMm: c.precipitation,
			windKph: c.wind_speed_10m,
			isDay: c.is_day === 1,
			code: c.weather_code,
			condition: mapCodeToCondition(c.weather_code),
		},
		hourly: {
			time: hourly.time,
			tempC: hourly.temperature_2m,
			humidity: hourly.relative_humidity_2m,
			precipMm: hourly.precipitation,
			precipProb: hourly.precipitation_probability,
			code: hourly.weather_code,
			windKph: hourly.wind_speed_10m,
		},
		daily: mapDaily(daily),
	};
}

function mapDaily(d) {
	if (!d || !d.time) return [];
	return d.time.map((t, i) => ({
		date: t,
		maxC: d.temperature_2m_max?.[i],
		minC: d.temperature_2m_min?.[i],
		precipSum: d.precipitation_sum?.[i],
		sunrise: d.sunrise?.[i],
		sunset: d.sunset?.[i],
		code: d.weather_code?.[i],
		condition: mapCodeToCondition(d.weather_code?.[i]),
	}));
}

export function mapCodeToCondition(code) {
	switch (code) {
		case 0:
			return { key: "sunny", label: "Clear sky" };
		case 1:
		case 2:
		case 3:
			return { key: "cloudy", label: "Mainly clear to overcast" };
		case 45:
		case 48:
			return { key: "fog", label: "Foggy" };
		case 51:
		case 53:
		case 55:
		case 61:
		case 63:
		case 65:
		case 80:
		case 81:
		case 82:
			return { key: "rainy", label: "Rain" };
		case 56:
		case 57:
		case 66:
		case 67:
			return { key: "sleet", label: "Freezing rain" };
		case 71:
		case 73:
		case 75:
		case 77:
		case 85:
		case 86:
			return { key: "snow", label: "Snow" };
		case 95:
		case 96:
		case 99:
			return { key: "storm", label: "Thunderstorm" };
		default:
			return { key: "unknown", label: "Unknown" };
	}
}

export function cToF(c) {
	return (c * 9) / 5 + 32;
}
