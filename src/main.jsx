import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/Router";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthProvider from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import CookieWarning from "./components/CookieWarning";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import authService from "./services/authService";
import "./utils/axiosConfig";

// Initialize token from localStorage if cookie not available
authService.initializeToken();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<AuthProvider>
					<Toaster position="top-right" />
					<CookieWarning />
					<QueryClientProvider client={queryClient}>
						<RouterProvider router={Router} />
					</QueryClientProvider>
				</AuthProvider>
			</PersistGate>
		</Provider>
	</StrictMode>
);
