import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// Dev proxy to avoid CORS when calling Render API
			"/predict": {
				target: "https://redirector-l57l.onrender.com",
				changeOrigin: true,
				secure: true,
			},
		},
	},
});
