import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/Router";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthProvider from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import CookieWarning from "./components/CookieWarning";
// Import axios config to ensure all requests include credentials
import "./utils/axiosConfig";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<Toaster position="top-right" />
			<CookieWarning />
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={Router} />
			</QueryClientProvider>
		</AuthProvider>
	</StrictMode>
);
