import React, { useMemo, useState } from "react";
import { uploadImageToCloudinary } from "../../../../services/imageUploadService";
import {
	detectPlantDisease,
	getFarmingRecommendation,
	getIrrigationPlan, // NEW
} from "../../../../services/aiService";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
	setRequesting,
	setGranted,
	setDenied,
	setError as setLocError,
} from "../../../../redux/slices/locationSlice";
import { requestUserLocation } from "../../../../services/weatherService";

/** ----- Minimal inline markdown (bold/italic/code/links) ----- */
function InlineFormatted({ text }) {
	const parts = [];
	let remaining = text ?? "";
	const patterns = [
		{ type: "link", regex: /\[([^\]]+)\]\((https?:[^)]+)\)/ },
		{ type: "code", regex: /`([^`]+)`/ },
		{ type: "bold", regex: /\*\*([^*]+)\*\*/ },
		{ type: "italic", regex: /\*([^*]+)\*/ },
	];
	while (remaining.length) {
		let earliest = null;
		let matchInfo = null;
		for (const p of patterns) {
			const m = p.regex.exec(remaining);
			if (m && (earliest == null || m.index < earliest.index)) {
				earliest = m;
				matchInfo = p;
			}
		}
		if (!earliest) {
			parts.push(remaining);
			break;
		}
		const before = remaining.slice(0, earliest.index);
		if (before) parts.push(before);
		const content = earliest[1];
		if (matchInfo.type === "bold")
			parts.push(<strong key={parts.length}>{content}</strong>);
		else if (matchInfo.type === "italic")
			parts.push(<em key={parts.length}>{content}</em>);
		else if (matchInfo.type === "code")
			parts.push(
				<code
					key={parts.length}
					className="px-1 py-0.5 rounded bg-gray-100 border"
				>
					{content}
				</code>
			);
		else if (matchInfo.type === "link")
			parts.push(
				<a
					key={parts.length}
					href={earliest[2]}
					target="_blank"
					rel="noreferrer"
					className="text-primary-700 underline"
				>
					{content}
				</a>
			);
		remaining = remaining.slice(earliest.index + earliest[0].length);
	}
	return <>{parts}</>;
}

/** ----- Minimal block markdown (h1-3, lists, code fences) ----- */
function MarkdownView({ text }) {
	const elements = useMemo(() => {
		if (!text) return null;
		const lines = text.split(/\r?\n/);
		const out = [];
		let inCode = false;
		let codeBuffer = [];
		let listBuffer = [];
		let paraBuffer = [];

		const flushParagraph = () => {
			if (paraBuffer.length) {
				const paragraph = paraBuffer.join(" ");
				out.push(
					<p key={`p-${out.length}`} className="text-gray-800 leading-relaxed">
						<InlineFormatted text={paragraph} />
					</p>
				);
				paraBuffer = [];
			}
		};
		const flushList = () => {
			if (listBuffer.length) {
				out.push(
					<ul
						key={`ul-${out.length}`}
						className="list-disc pl-5 space-y-1 text-gray-800"
					>
						{listBuffer.map((li, idx) => (
							<li key={idx}>
								<InlineFormatted text={li} />
							</li>
						))}
					</ul>
				);
				listBuffer = [];
			}
		};
		const flushCode = () => {
			if (codeBuffer.length) {
				out.push(
					<pre
						key={`code-${out.length}`}
						className="bg-gray-900 text-gray-100 p-3 rounded-card overflow-auto"
					>
						<code>{codeBuffer.join("\n")}</code>
					</pre>
				);
				codeBuffer = [];
			}
		};

		for (const rawLine of lines) {
			const line = rawLine;
			if (line.trim().startsWith("```") && !inCode) {
				inCode = true;
				flushParagraph();
				flushList();
				continue;
			}
			if (line.trim().startsWith("```") && inCode) {
				inCode = false;
				flushCode();
				continue;
			}
			if (inCode) {
				codeBuffer.push(line);
				continue;
			}

			if (/^\s*$/.test(line)) {
				flushParagraph();
				flushList();
				continue;
			}

			const h = line.match(/^(#{1,3})\s+(.*)$/);
			if (h) {
				flushParagraph();
				flushList();
				const level = h[1].length;
				const content = h[2];
				const cls =
					"mt-4 mb-2 font-semibold text-gray-900 " +
					(level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base");
				out.push(
					<div key={`h-${out.length}`} className={cls}>
						<InlineFormatted text={content} />
					</div>
				);
				continue;
			}

			const li = line.match(/^\s*[-*]\s+(.*)$/);
			if (li) {
				flushParagraph();
				listBuffer.push(li[1]);
				continue;
			}

			paraBuffer.push(line.trim());
		}

		flushParagraph();
		flushList();
		flushCode();
		return out;
	}, [text]);

	return <div className="space-y-2">{elements}</div>;
}

/* ---------- Small helper used by irrigation UI ---------- */
function LitersBar({ liters = 0, maxLiters = 400 }) {
	const pct = Math.max(
		0,
		Math.min(100, Math.round((liters / maxLiters) * 100))
	);
	return (
		<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
			<div
				className={`h-2 ${liters === 0 ? "bg-gray-400" : "bg-blue-500"}`}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

/* ---------- NEW: Irrigation card component ---------- */
function IrrigationPlanCard({ plan, onCopy }) {
	const reply = plan?.result?.Reply;
	const header = reply?.header;
	const cards = Array.isArray(reply?.cards) ? reply.cards : [];
	const warnings = Array.isArray(reply?.warnings) ? reply.warnings : [];
	const summary_md = reply?.summary_markdown || "";

	// sum liters for a quick total
	const totalLiters = cards.reduce(
		(acc, c) => acc + (c?.metrics?.liters ?? 0),
		0
	);

	return (
		<div className="rounded-card border bg-white shadow-card p-6">
			<div className="flex items-center justify-between mb-2">
				<h2 className="text-lg font-semibold text-gray-800">
					Water irrigation
				</h2>
				{reply && (
					<button
						className="daisy-btn daisy-btn-xs daisy-btn-outline"
						onClick={onCopy}
					>
						Copy summary
					</button>
				)}
			</div>

			{!reply ? (
				<p className="text-sm text-gray-600">
					Click “Use my location” and then “Get plan”.
				</p>
			) : (
				<div className="space-y-4">
					{/* Header */}
					<div className="rounded-card border bg-gray-50 p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-base font-semibold text-gray-900">
									{header?.title || "Irrigation Plan"}
								</div>
								<div className="text-sm text-gray-700">
									{header?.subtitle || ""}
								</div>
							</div>
							<div className="text-right text-sm text-gray-600">
								<div>
									Total (L):{" "}
									<span className="font-semibold">
										{Math.round(totalLiters)}
									</span>
								</div>
								{header?.meta?.area_m2 != null && (
									<div>Area: {header.meta.area_m2} m²</div>
								)}
							</div>
						</div>
						{header?.meta?.soil_note && (
							<div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
								{header.meta.soil_note}
							</div>
						)}
					</div>

					{/* Daily cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{cards.map((d, i) => {
							const L = d?.metrics?.liters ?? 0;
							const mm = d?.metrics?.recommend_mm ?? 0;
							const rule = d?.rule;
							const isSkip = rule === "skip" || L === 0;
							return (
								<div
									key={`${d?.date}-${i}`}
									className="rounded-card border p-4 bg-white shadow-sm"
								>
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-600">{d?.date}</div>
										<span
											className={`text-xs px-2 py-0.5 rounded-full border ${
												isSkip
													? "bg-gray-100 text-gray-700"
													: rule === "reduce"
													? "bg-blue-50 text-blue-700 border-blue-200"
													: "bg-green-50 text-green-700 border-green-200"
											}`}
										>
											{rule === "skip"
												? "Skip"
												: rule === "reduce"
												? "Reduced"
												: "Irrigate"}
										</span>
									</div>

									<div className="mt-1 text-base font-semibold text-gray-900">
										{d?.title}
									</div>

									{/* Badges */}
									<div className="mt-2 flex flex-wrap gap-2">
										{(d?.badges ?? []).map((b, bi) => (
											<span
												key={bi}
												className="text-xs px-2 py-1 rounded-full bg-gray-100 border text-gray-700"
											>
												{b}
											</span>
										))}
									</div>

									{/* Metrics */}
									<div className="mt-3 space-y-2">
										<LitersBar liters={L} />
										<div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
											<div>
												<span className="text-gray-500">ETc:</span>{" "}
												{d?.metrics?.etc_mm ?? "—"} mm
											</div>
											<div>
												<span className="text-gray-500">Rain:</span>{" "}
												{d?.metrics?.rain_mm ?? "—"} mm
											</div>
											<div>
												<span className="text-gray-500">Recom:</span> {mm} mm
											</div>
										</div>
									</div>

									{/* Note */}
									{d?.note && (
										<div className="mt-2 text-sm text-gray-700">{d.note}</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Summary markdown & warnings */}
					{summary_md && (
						<div className="rounded-card border bg-primary-50 p-4">
							<MarkdownView text={summary_md} />
						</div>
					)}
					{warnings.length > 0 && (
						<div className="rounded-card border bg-amber-50 p-4">
							<h4 className="font-medium text-amber-800 mb-1">Warnings</h4>
							<ul className="list-disc pl-5 text-amber-900 text-sm space-y-1">
								{warnings.map((w, wi) => (
									<li key={wi}>{w}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function AiLab() {
	const [imageUrl, setImageUrl] = useState("");
	const [uploading, setUploading] = useState(false);
	const [detecting, setDetecting] = useState(false);
	const [result, setResult] = useState(null);
	const [localPreview, setLocalPreview] = useState("");
	const [recLoading, setRecLoading] = useState(false);
	const [recResult, setRecResult] = useState(null);

	// NEW irrigation state
	const [irrLoading, setIrrLoading] = useState(false);
	const [irrResult, setIrrResult] = useState(null);

	const { latitude, longitude, status } = useSelector((s) => s.location);
	const dispatch = useDispatch();

	const requestLocation = async () => {
		try {
			dispatch(setRequesting());
			const coords = await requestUserLocation();
			dispatch(setGranted(coords));
			toast.success("Location granted");
		} catch (e) {
			dispatch(setLocError(e?.message || "Location error"));
			dispatch(setDenied(e?.message || "Location denied"));
			toast.error("Failed to get location");
		}
	};

	const handleFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setResult(null);
		setLocalPreview(URL.createObjectURL(file));
		try {
			setUploading(true);
			toast.loading("Uploading to Cloudinary…", { id: "ai-up" });
			const url = await uploadImageToCloudinary(file, { maxSizeMB: 5 });
			toast.dismiss("ai-up");
			if (!url) return;
			setImageUrl(url);
			toast.success("Image uploaded");
		} catch (err) {
			toast.dismiss("ai-up");
			console.error(err);
			toast.error("Upload failed");
		} finally {
			setUploading(false);
		}
		e.target.value = "";
	};

	const handleDetect = async () => {
		if (!imageUrl) return;
		try {
			setDetecting(true);
			toast.loading("Analyzing image…", { id: "ai-det" });
			const data = await detectPlantDisease(imageUrl);
			toast.dismiss("ai-det");
			setResult(data);
			toast.success("Analysis complete");
		} catch (err) {
			toast.dismiss("ai-det");
			console.error(err);
			toast.error("Analysis failed");
		} finally {
			setDetecting(false);
		}
	};

	const handleRecommend = async () => {
		if (latitude == null || longitude == null) {
			await requestLocation();
			return;
		}
		try {
			setRecLoading(true);
			toast.loading("Fetching recommendations…", { id: "ai-rec" });
			const data = await getFarmingRecommendation(latitude, longitude);
			toast.dismiss("ai-rec");
			setRecResult(data);
			toast.success("Recommendations ready");
		} catch (err) {
			toast.dismiss("ai-rec");
			console.error(err);
			toast.error("Failed to fetch recommendations");
		} finally {
			setRecLoading(false);
		}
	};

	// NEW: irrigation fetch
	const handleIrrigation = async () => {
		if (latitude == null || longitude == null) {
			await requestLocation();
			return;
		}
		try {
			setIrrLoading(true);
			toast.loading("Building irrigation plan…", { id: "ai-irr" });
			const data = await getIrrigationPlan(latitude, longitude);
			toast.dismiss("ai-irr");
			setIrrResult(data);
			toast.success("Irrigation plan ready");
		} catch (err) {
			toast.dismiss("ai-irr");
			console.error(err);
			toast.error("Failed to get irrigation plan");
		} finally {
			setIrrLoading(false);
		}
	};

	const copyReply = async (text) => {
		try {
			await navigator.clipboard.writeText(text || "");
			toast.success("Copied");
		} catch (_) {
			toast.error("Copy failed");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header banner */}
			<div className="rounded-card p-5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-card">
				<h1 className="text-2xl font-semibold">AI Lab</h1>
				<p className="text-sm opacity-90">
					Upload a leaf image and get a professional AI diagnosis. Get local
					crop recommendations and irrigation plans.
				</p>
			</div>

			{/* Two feature cards side by side */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				{/* Disease detection */}
				<div className="rounded-card border bg-white shadow-card p-6">
					{/* <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="daisy-btn daisy-btn-outline cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Choose image
            </label>
            <button
              className="daisy-btn daisy-btn-primary cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition"
              onClick={handleDetect}
              disabled={!imageUrl || uploading || detecting}
            >
              {detecting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full" />{" "}
                  Analyzing…
                </span>
              ) : (
                "Upload"
              )}
            </button>
            {imageUrl && (
              <span className="text-xs text-gray-600 break-all">{imageUrl}</span>
            )}
          </div> */}

					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-gray-800">
							Plant disease detection
						</h2>
					</div>
					<div className="flex flex-col md:flex-row md:items-center gap-3">
						<label className="btn btn-outline cursor-pointer hover:scale-105 active:scale-95 transition-all">
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							Choose image
						</label>
						<button
							className="btn btn-primary cursor-pointer hover:scale-105 active:scale-95 transition-all"
							onClick={handleDetect}
							disabled={!imageUrl || uploading || detecting}
						>
							{detecting ? (
								<span className="inline-flex items-center gap-2">
									<span className="animate-spin h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full" />
									Analyzing…
								</span>
							) : (
								"Upload"
							)}
						</button>
						{imageUrl && (
							<span className="text-xs text-gray-500">{imageUrl}</span>
						)}
					</div>

					<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="rounded-card border bg-gray-50 p-3">
							<p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
							{localPreview ? (
								<img
									src={localPreview}
									alt="Selected"
									className="w-full h-64 object-cover rounded-card border"
								/>
							) : (
								<div className="w-full h-32 grid place-items-center text-gray-400">
									No image selected
								</div>
							)}
						</div>
						<div className="rounded-card border bg-gray-50 p-3">
							<p className="text-sm font-medium text-gray-700 mb-2">Uploaded</p>
							{imageUrl ? (
								<img
									src={imageUrl}
									alt="Uploaded"
									className="w-full h-64 object-cover rounded-card border"
								/>
							) : (
								<div className="w-full h-32 grid place-items-center text-gray-400">
									Waiting upload…
								</div>
							)}
						</div>
					</div>

					<div className="mt-5 rounded-card border bg-white shadow-sm p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-semibold text-gray-800">Result</h3>
							{result?.result?.Reply && (
								<button
									className="daisy-btn daisy-btn-xs daisy-btn-outline"
									onClick={() => copyReply(result.result.Reply)}
								>
									Copy
								</button>
							)}
						</div>
						{result ? (
							<div className="mt-3 space-y-3">
								<details className="rounded-card border bg-gray-50 p-3">
									<summary className="cursor-pointer select-none text-sm text-gray-700">
										Raw response
									</summary>
									<pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded-card overflow-auto">
										{JSON.stringify(result, null, 2)}
									</pre>
								</details>
								{result?.result?.Reply && (
									<div className="p-4 rounded-card border bg-primary-50">
										<MarkdownView text={result.result.Reply} />
									</div>
								)}
							</div>
						) : (
							<p className="text-sm text-gray-600">
								Upload an image and click Upload to get results.
							</p>
						)}
					</div>
				</div>

				{/* Farming recommendation */}
				<div className="rounded-card border bg-white shadow-card p-6">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-lg font-semibold text-gray-800">
							Local crop recommendations
						</h2>
					</div>
					<p className="text-sm text-gray-600 mb-4">
						Use your current location to get personalized crop suggestions for
						your area.
					</p>
					<div className="flex items-center gap-3">
						<button
							className="btn btn-outline cursor-pointer hover:scale-105 active:scale-95 transition-all"
							onClick={requestLocation}
						>
							Use my location
						</button>
						<button
							className="btn btn-primary cursor-pointer hover:scale-105 active:scale-95 transition-all"
							onClick={handleRecommend}
							disabled={recLoading}
						>
							{recLoading ? (
								<span className="inline-flex items-center gap-2">
									<span className="animate-spin h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full" />
									Fetching…
								</span>
							) : (
								"Get recommendations"
							)}
						</button>
						<span className="text-xs text-gray-500">
							{status}
							{latitude != null && longitude != null
								? ` (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
								: ""}
						</span>
					</div>

					<div className="mt-5 rounded-card border bg-white shadow-sm p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-semibold text-gray-800">
								Recommendation
							</h3>
							{recResult?.result?.Reply && (
								<button
									className="daisy-btn daisy-btn-xs daisy-btn-outline"
									onClick={() => copyReply(recResult.result.Reply)}
								>
									Copy
								</button>
							)}
						</div>

						{/* refined renderer for local_prods payload */}
						{recResult ? (
							(() => {
								const lp = recResult?.local_prods;
								const coords = lp?.location
									? `(${Number(lp.location.lat)?.toFixed?.(2)}, ${Number(
											lp.location.lon
									  )?.toFixed?.(2)})`
									: "";

								const recs = (lp?.recommendations ?? [])
									.slice()
									.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
									.slice(0, 5);

								const sourceBadges = Object.entries(lp?.source ?? {})
									.filter(([, v]) => !!v)
									.map(([k]) => k);

								const summaryLines = Array.isArray(lp?.summary)
									? lp.summary
									: [];

								const buildCopyText = () => {
									const lines = [];
									lines.push(`Local crop recommendations ${coords || ""}`);
									if (summaryLines.length) {
										lines.push("");
										lines.push("At a glance:");
										summaryLines.forEach((s) => lines.push(`- ${s}`));
									}
									if (recs.length) {
										lines.push("");
										lines.push("Top crops:");
										recs.forEach((r, i) => {
											const pct = Math.round((r?.score ?? 0) * 100);
											lines.push(
												`${i + 1}. ${r?.crop ?? "—"} — score: ${pct}%`
											);
											(r?.why ?? []).forEach((w) => lines.push(`   • ${w}`));
											if (Array.isArray(r?.tags) && r.tags.length) {
												lines.push(`   tags: ${r.tags.join(", ")}`);
											}
										});
									}
									if (Array.isArray(lp?.alternates) && lp.alternates.length) {
										lines.push("");
										lines.push("Alternates:");
										lp.alternates.forEach((a) =>
											lines.push(`- ${a.crop}: ${a.reason || ""}`.trim())
										);
									}
									if (sourceBadges.length) {
										lines.push("");
										lines.push(`Sources: ${sourceBadges.join(", ")}`);
									}
									return lines.join("\n");
								};

								const Progress = ({ value = 0 }) => {
									const pct = Math.max(
										0,
										Math.min(100, Math.round((value ?? 0) * 100))
									);
									return (
										<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-2 bg-green-500"
												style={{ width: `${pct}%` }}
												aria-valuemin={0}
												aria-valuemax={100}
												aria-valuenow={pct}
												role="progressbar"
											/>
										</div>
									);
								};

								return (
									<div className="mt-3 space-y-3">
										<div className="flex items-center justify-between">
											<div className="text-sm text-gray-600">
												{lp?.ok ? "✅ Data OK" : "⚠️ Data unavailable"}{" "}
												{coords && `• ${coords}`}
											</div>
											<div className="flex items-center gap-2">
												{sourceBadges.map((s) => (
													<span
														key={s}
														className="text-xs px-2 py-1 rounded-full bg-gray-100 border text-gray-700"
														title="Data source"
													>
														{s}
													</span>
												))}
												<button
													className="daisy-btn daisy-btn-xs daisy-btn-outline"
													onClick={() => copyReply(buildCopyText())}
													title="Copy a concise text summary"
												>
													Copy summary
												</button>
											</div>
										</div>

										{summaryLines.length > 0 && (
											<div className="rounded-card border bg-gray-50 p-4">
												<h4 className="font-medium text-gray-800 mb-2">
													At a glance
												</h4>
												<ul className="list-disc pl-5 space-y-1 text-gray-800">
													{summaryLines.map((s, idx) => (
														<li key={idx}>{s}</li>
													))}
												</ul>
											</div>
										)}

										<div>
											<h4 className="font-medium text-gray-800 mb-2">
												Top crops (first 5)
											</h4>
											{recs.length ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													{recs.map((r, idx) => {
														const pct = Math.round((r?.score ?? 0) * 100);
														return (
															<div
																key={`${r?.crop}-${idx}`}
																className="rounded-card border p-4 bg-white shadow-sm"
															>
																<div className="flex items-center justify-between">
																	<div className="text-base font-semibold text-gray-900">
																		{idx + 1}. {r?.crop ?? "—"}
																	</div>
																	<div className="text-sm text-gray-600">
																		{pct}% match
																	</div>
																</div>
																<div className="mt-2">
																	<Progress value={r?.score ?? 0} />
																</div>
																{Array.isArray(r?.why) && r.why.length > 0 && (
																	<ul className="mt-3 text-sm text-gray-700 space-y-1 list-disc pl-5">
																		{r.why.map((w, wi) => (
																			<li key={wi}>{w}</li>
																		))}
																	</ul>
																)}
																{Array.isArray(r?.tags) &&
																	r.tags.length > 0 && (
																		<div className="mt-3 flex flex-wrap gap-2">
																			{r.tags.map((t, ti) => (
																				<span
																					key={ti}
																					className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700"
																				>
																					{t}
																				</span>
																			))}
																		</div>
																	)}
															</div>
														);
													})}
												</div>
											) : (
												<p className="text-sm text-gray-600">
													No recommendations found for this location.
												</p>
											)}
										</div>

										<details className="rounded-card border bg-gray-50 p-3">
											<summary className="cursor-pointer select-none text-sm text-gray-700">
												Raw response
											</summary>
											<pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded-card overflow-auto">
												{JSON.stringify(recResult, null, 2)}
											</pre>
										</details>

										{recResult?.result?.Reply && !lp && (
											<div className="p-4 rounded-card border bg-primary-50">
												<MarkdownView text={recResult.result.Reply} />
											</div>
										)}
									</div>
								);
							})()
						) : (
							<p className="text-sm text-gray-600">
								Click “Use my location” and then “Get recommendations”.
							</p>
						)}
					</div>
				</div>
			</div>

			{/* NEW: Water irrigation card (full width under the grid) */}
			<div className="rounded-card border bg-white shadow-card p-6">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg font-semibold text-gray-800">
						Water irrigation
					</h2>
				</div>
				<p className="text-sm text-gray-600 mb-4">
					Based on your location, crop, and growth stage, get a 5-day irrigation
					plan (liters to pump).
				</p>

				<div className="flex items-center gap-3">
					<button
						className="btn btn-outline cursor-pointer hover:scale-105 active:scale-95 transition-all"
						onClick={requestLocation}
					>
						Use my location
					</button>
					<button
						className="btn btn-primary cursor-pointer hover:scale-105 active:scale-95 transition-all"
						onClick={handleIrrigation}
						disabled={irrLoading}
					>
						{irrLoading ? (
							<span className="inline-flex items-center gap-2">
								<span className="animate-spin h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full" />
								Getting plan…
							</span>
						) : (
							"Get plan"
						)}
					</button>
					<span className="text-xs text-gray-500">
						{status}
						{latitude != null && longitude != null
							? ` (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
							: ""}
					</span>
				</div>

				<div className="mt-5">
					<IrrigationPlanCard
						plan={irrResult}
						onCopy={() => {
							const r = irrResult?.result?.Reply;
							const header = r?.header;
							const cards = Array.isArray(r?.cards) ? r.cards : [];
							const warnings = Array.isArray(r?.warnings) ? r.warnings : [];
							const lines = [];
							if (header?.title) lines.push(header.title);
							if (header?.subtitle) lines.push(header.subtitle);
							if (header?.meta?.area_m2 != null)
								lines.push(`Area: ${header.meta.area_m2} m²`);
							lines.push("");
							cards.forEach((c) => {
								lines.push(`${c?.date}: ${c?.title}`);
								(c?.badges ?? []).forEach((b) => lines.push(`  - ${b}`));
								if (c?.note) lines.push(`  Note: ${c.note}`);
							});
							if (warnings.length) {
								lines.push("");
								lines.push("Warnings:");
								warnings.forEach((w) => lines.push(`- ${w}`));
							}
							copyReply(lines.join("\n"));
						}}
					/>
				</div>

				{/* Keep raw toggle for debugging */}
				{irrResult && (
					<details className="mt-4 rounded-card border bg-gray-50 p-3">
						<summary className="cursor-pointer select-none text-sm text-gray-700">
							Raw response
						</summary>
						<pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded-card overflow-auto">
							{JSON.stringify(irrResult, null, 2)}
						</pre>
					</details>
				)}
			</div>
		</div>
	);
}
