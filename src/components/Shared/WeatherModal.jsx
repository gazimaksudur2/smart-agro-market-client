import React from "react";
import { cToF } from "../../services/weatherService";

export default function WeatherModal({ open, onClose, data, unit = "C" }) {
	if (!open) return null;
	const c = data?.current;
	const d = data?.daily || [];
	const useF = unit === "F";
	const fmt = (celsius) =>
		celsius == null
			? "--"
			: useF
			? Math.round(cToF(celsius))
			: Math.round(celsius);

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-end md:items-center md:justify-center">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="relative w-full max-w-xl mx-4 md:mx-0 mb-4 md:mb-0 rounded-card shadow-card bg-white overflow-hidden">
				<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
					<div>
						<p className="font-semibold leading-tight">Local Weather</p>
						<p className="text-xs opacity-90">
							{data?.location?.timezone || "Your timezone"}
						</p>
					</div>
					<button
						onClick={onClose}
						className="daisy-btn daisy-btn-xs daisy-btn-ghost text-white"
					>
						Close
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* Current summary */}
					<div className="grid grid-cols-2 gap-4">
						<div className="p-4 rounded-card bg-primary-50 border border-primary-100">
							<p className="text-sm text-gray-600">Temperature</p>
							<p className="text-3xl font-semibold text-primary-700">
								{fmt(c?.tempC)}°{unit}
							</p>
							<p className="text-xs text-gray-600">
								Feels like {fmt(c?.feelsLikeC)}°{unit}
							</p>
						</div>
						<div className="p-4 rounded-card bg-white border shadow-sm">
							<p className="text-sm text-gray-600">Conditions</p>
							<p className="text-lg font-medium">
								{c?.condition?.label || "--"}
							</p>
							<div className="mt-2 grid grid-cols-3 gap-3 text-sm text-gray-700">
								<div>
									<p className="text-xs text-gray-500">Humidity</p>
									<p className="font-medium">{c?.humidity ?? "--"}%</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">Wind</p>
									<p className="font-medium">{c?.windKph ?? "--"} km/h</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">Precip</p>
									<p className="font-medium">{c?.precipMm ?? "--"} mm</p>
								</div>
							</div>
						</div>
					</div>

					{/* Next days */}
					<div>
						<p className="text-sm font-semibold text-gray-700 mb-2">
							Next days
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{d.slice(0, 6).map((day) => (
								<div
									key={day.date}
									className="p-3 rounded-card border bg-white shadow-sm flex items-center justify-between"
								>
									<div>
										<p className="text-sm text-gray-600">
											{new Date(day.date).toLocaleDateString()}
										</p>
										<p className="text-sm font-medium">
											{day.condition?.label}
										</p>
									</div>
									<div className="text-right">
										<p className="text-sm">
											Max {fmt(day.maxC)}°{unit}
										</p>
										<p className="text-xs text-gray-600">
											Min {fmt(day.minC)}°{unit}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
