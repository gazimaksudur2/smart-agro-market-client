import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/Router";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthProvider from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import CookieWarning from "./components/CookieWarning";
import ErrorBoundary from "./components/ErrorBoundary";
import { Provider } from "react-redux";
import store from "./redux/store";
import authService from "./services/authService";
import "./utils/axiosConfig";

// Initialize authentication on app start
authService.initializeToken();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ErrorBoundary>
			<Provider store={store}>
				<AuthProvider>
					<Toaster
						position="top-right"
						toastOptions={{
							duration: 4000,
							style: {
								background: "#363636",
								color: "#fff",
							},
							success: {
								duration: 3000,
								theme: {
									primary: "#4aed88",
								},
							},
							error: {
								duration: 5000,
								theme: {
									primary: "#f56565",
								},
							},
						}}
					/>
					<CookieWarning />
					<QueryClientProvider client={queryClient}>
						<RouterProvider router={Router} />
					</QueryClientProvider>
				</AuthProvider>
			</Provider>
		</ErrorBoundary>
	</StrictMode>
);
