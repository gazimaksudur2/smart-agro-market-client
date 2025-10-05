import axios from "axios";

/* =========================
   PLANT DISEASE DETECTION
   ========================= */

async function plantDiseaseDetect(image_url) {
	const base = import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";
	const predictUrl = `${base.replace(/\/$/, "")}/api/ai/predict`;
	const payload = { image_url };
	const { data } = await axios.post(predictUrl, payload, {
		headers: { "Content-Type": "application/json" },
	});
	return data?.data[0] ? data.data[0] : data; // returns raw model output (e.g., an array)
}

/**
 * Posts an image URL to the plant disease detection endpoint.
 * Then sends the detected disease to your Smythos LLM endpoint.
 *
 * @param {string} image_url
 * @returns {Promise<{id:string,name:string,result:{Reply:string}}>}
 */
export async function detectPlantDisease(image_url) {
	if (!image_url) throw new Error("Missing image_url for detection");

	// If backend base isn't configured and we're not in dev, return mock
	if (!import.meta.env.VITE_SERVER_API_URL && !import.meta.env.DEV) {
		return {
			id: "M1PLANT003",
			name: "GenAILLM",
			result: {
				Reply:
					"Here’s a comprehensive analysis based on your image. It appears to show early leaf blight indicators. Suggested actions: 1) Remove severely affected leaves, 2) Apply a copper-based fungicide per label, 3) Improve airflow and avoid overhead watering, 4) Monitor in 3–5 days.",
			},
		};
	}

	// BUGFIX: plantDiseaseDetect already returns the response body,
	// so DO NOT destructure { data } here.
	const modelOut = await plantDiseaseDetect(image_url);

	// Try to read the top label robustly
	const topLabel =
		Array.isArray(modelOut) && modelOut.length > 0
			? String(modelOut[0])
			: typeof modelOut === "string"
			? modelOut
			: modelOut?.label || modelOut?.prediction || "Unknown";

	const smythosUrl = (
		import.meta.env.VITE_AI_PLANTDISEASE_SMYTHOS || ""
	).replace(/\/$/, "");

	// If the Smythos endpoint isn't set, return a graceful fallback
	if (!smythosUrl) {
		return {
			id: "M1PLANT-FALLBACK",
			name: "GenAILLM",
			result: {
				Reply:
					`Detected: **${topLabel}**.\n\n` +
					"Suggested actions:\n" +
					"1) Remove severely affected leaves\n" +
					"2) Consider a copper-based fungicide per label\n" +
					"3) Improve airflow & avoid overhead watering\n" +
					"4) Re-check in 3–5 days",
			},
			raw: { model_out: modelOut },
		};
	}

	const payload = { disease_name: topLabel };
	const { data: data2 } = await axios.post(smythosUrl, payload, {
		headers: { "Content-Type": "application/json" },
	});
	// Expecting { id, name, result: { Reply } }
	return { ...data2, raw: { model_out: modelOut } };
}

/* ==========================================
   FARMING RECOMMENDATIONS (two-step orchestration)
   ========================================== */

/**
 * Orchestrates two calls:
 *  1) Base crop suggestion from VITE_AI_FARMING_RECOMMANDATION_API_render (returns local_prods)
 *  2) LLM analysis from VITE_AI_FARMING_RECOMMANDATION_API
 * Returns a tidy, UI-ready object AND passes through local_prods so your UI can render it.
 */
export async function getFarmingRecommendation(lat, lon) {
	const renderEndpoint = (
		import.meta?.env?.VITE_AI_FARMING_RECOMMANDATION_API_render || ""
	).trim();
	const llmEndpoint = (
		import.meta?.env?.VITE_AI_FARMING_RECOMMANDATION_API || ""
	).trim();

	const pretty = `(${Number(lat)?.toFixed?.(2) ?? lat}, ${
		Number(lon)?.toFixed?.(2) ?? lon
	})`;

	// ---------- 1) Get base recommendation ----------
	let baseData;
	if (!renderEndpoint) {
		// DEV fallback with a synthetic local_prods shape so UI works
		baseData = {
			local_prods: {
				ok: true,
				location: { lat, lon },
				source: { openMeteo: true },
				recommendations: [
					{
						crop: "Rice",
						score: 1,
						why: [
							"GDD: ~550 (target 350–600)",
							"Rain: ~270 mm (target 120–300)",
						],
						tags: [],
					},
					{
						crop: "Pumpkin",
						score: 0.6,
						why: ["GDD fits", "Rain on the higher side"],
						tags: ["High rainfall"],
					},
					{
						crop: "Maize",
						score: 0.6,
						why: ["GDD fits", "Rain higher than ideal"],
						tags: ["High rainfall"],
					},
				],
				alternates: [
					{ crop: "Corn", reason: "Reasonable fit as an alternative." },
					{ crop: "Cucumber", reason: "Reasonable fit as an alternative." },
				],
				summary: [
					"30-day total rain: ~270–290 mm",
					"Top picks consider temperature (GDD) and rainfall.",
				],
			},
			// Keep a simple Reply for backwards Markdown render (optional)
			result: {
				Reply: `Suggested crops for ${pretty}:\n- Rice (monsoon)\n- Vegetables (okra, eggplant)\n- Maize (dry season)`,
			},
		};
	} else {
		const url1 = renderEndpoint.replace(/\/$/, "");
		const { data } = await axios.post(
			url1,
			{ lat, lon },
			{ headers: { "Content-Type": "application/json" } }
		);
		baseData = data;
	}

	// Normalize base text (for forwarding to LLM and for copy)
	const baseReply =
		baseData?.result?.Reply ?? baseData?.Reply ?? baseData?.result ?? baseData;
	const baseText =
		typeof baseReply === "string" ? baseReply : JSON.stringify(baseReply);

	// ---------- 2) LLM analysis ----------
	let llmData;
	if (!llmEndpoint) {
		llmData = {
			id: "CROP_ANALYZER-DEV",
			name: "GenAILLM",
			result: {
				Reply: {
					best: {
						crop: "Rice",
						score: 1,
						reasons: [
							"GDD is within target range.",
							"Rainfall aligns with requirements.",
							"Recent 30-day rain supports transplanting.",
						],
						watchouts: [],
						confidence: "high",
					},
					explanation_markdown:
						`**Rice** suits the current conditions around ${pretty}. ` +
						`Temperature and rainfall appear favorable; risks are minimal.`,
				},
			},
		};
	} else {
		const url2 = llmEndpoint.replace(/\/$/, "");
		const payload2 = {
			lat,
			lon,
			base_suggestion: baseText,
			// Optionally forward local_prods for richer reasoning if server supports it
			local_prods: baseData?.local_prods ?? null,
		};
		const { data } = await axios.post(url2, payload2, {
			headers: { "Content-Type": "application/json" },
		});
		llmData = data;
	}

	// ---------- 3) Shape a tidy, UI-ready object and PASS THROUGH local_prods ----------
	const best = llmData?.result?.Reply?.best ?? {};
	const explanation = llmData?.result?.Reply?.explanation_markdown ?? "";

	// IMPORTANT: include local_prods so the UI renderer can use it
	const local_prods =
		baseData?.local_prods && typeof baseData.local_prods === "object"
			? baseData.local_prods
			: null;

	return {
		id: llmData?.id || "FARMING_RECOMMENDATION",
		coords: { lat, lon, pretty },
		base_suggestion_text: baseText,
		best: {
			crop: best.crop ?? null,
			score: best.score ?? null,
			reasons: Array.isArray(best.reasons) ? best.reasons : [],
			watchouts: Array.isArray(best.watchouts) ? best.watchouts : [],
			confidence: best.confidence ?? "unknown",
		},
		explanation_markdown: explanation,

		// <-- This is what your UI expects:
		local_prods, // { ok, location, source, recommendations[...], alternates[...], summary[...] }

		// Keep a markdown Reply for legacy UIs:
		result:
			baseData?.result && typeof baseData.result.Reply === "string"
				? { Reply: baseData.result.Reply }
				: undefined,

		// raw for debugging:
		raw: {
			base_api: baseData,
			llm_api: llmData,
		},
	};
}

/* ==========================================
   WATER IRRIGATION (two-step orchestration)
   ========================================== */

/**
 * Build a 5-day irrigation plan.
 * Step 1: Calls weatherapi-ajpu with lat/lon (+ hardcoded crop/stage/area_m2)
 * Step 2: Sends the full upstream JSON to the Smythos irrigation analyzer
 *
 * @param {number} lat
 * @param {number} lon
 * @param {{crop?: string, stage?: string, area_m2?: number}} [opts]
 * @returns {Promise<{id:string,name:string,result:{Reply:{header:any,cards:any[],summary_markdown?:string,warnings?:string[]}}, raw?:{upstream:any}}>}
 */
export async function getIrrigationPlan(lat, lon, opts = {}) {
	if (lat == null || lon == null) {
		throw new Error("Missing lat/lon");
	}

	// Hardcoded defaults (can be overridden via opts if needed)
	const crop = opts.crop || "pumpkin";
	const stage = opts.stage || "flowering";
	const area_m2 = opts.area_m2 ?? 150;

	// 1) Upstream inputs service (ETc/rain/soil etc.)
	const upstreamUrl =
		"https://weatherapi-ajpu.onrender.com/api/irrigation/crop";
	const payload1 = { lat, lon, crop, stage, area_m2 };

	const { data: upstream } = await axios.post(upstreamUrl, payload1, {
		headers: { "Content-Type": "application/json" },
	});

	// 2) LLM analyzer (env override if provided; otherwise use provided URL)
	const analyzerUrl =
		(import.meta.env.VITE_AI_IRRIGATION_SMYTHOS || "").trim() ||
		"https://cmfxtslw54b5djxgt2kvyaljw.agent.a.smyth.ai/api/irrigation";

	const { data: analyzed } = await axios.post(analyzerUrl, upstream, {
		headers: { "Content-Type": "application/json" },
	});

	// Return analyzer result + keep the upstream for debugging/inspection
	return { ...analyzed, raw: { upstream } };
}
