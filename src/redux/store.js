import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./slices/locationSlice";

// Simple store configuration without cart persistence
const store = configureStore({
	reducer: {
		// Add other reducers here as needed
		// Note: Cart is now managed by useCart hook with backend as single source of truth
		location: locationReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [],
			},
		}),
});

export default store;
