/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#f0fdf4",
					100: "#dcfce7",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
				},
				secondary: {
					50: "#f0f9ff",
					500: "#0ea5e9",
					600: "#0284c7",
				},
			},
			borderRadius: {
				button: "0.5rem",
				card: "1rem",
			},
			boxShadow: {
				card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["light", "dark"],
		prefix: "daisy-", // This will prefix all daisyUI classes with "daisy-"
		logs: false,
	},
};
