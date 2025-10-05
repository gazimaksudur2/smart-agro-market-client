import React from "react";
import { mapCodeToCondition, cToF } from "../../services/weatherService";

function iconForCondition(conditionKey, isDay) {
	switch (conditionKey) {
		case "sunny":
			return isDay ? "☀️" : "🌙";
		case "cloudy":
			return "⛅";
		case "rainy":
			return "🌧️";
		case "storm":
			return "⛈️";
		case "snow":
			return "❄️";
		case "fog":
			return "🌫️";
		default:
			return "🌡️";
	}
}

export default function WeatherButton({
	loading,
	error,
	current,
	onClick,
	unit = "C",
}) {
	const temp = current?.tempC ?? null;
	const isDay = current?.isDay ?? true;
	const cond = current?.condition?.key ?? "unknown";
	const displayTemp =
		temp == null
			? "--"
			: unit === "F"
			? Math.round(cToF(temp))
			: Math.round(temp);
	const unitLabel = unit === "F" ? "°F" : "°C";

	return (
		<button
			className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 shadow-sm transition-colors"
			onClick={onClick}
			aria-label="Open weather details"
		>
			<span className="text-xl leading-none">
				{loading ? "⌛" : error ? "⚠️" : iconForCondition(cond, isDay)}
			</span>
			<span className="font-medium">
				{loading
					? "Locating..."
					: error
					? "Location blocked"
					: `${displayTemp}${unitLabel}`}
			</span>
		</button>
	);
}
