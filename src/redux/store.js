import { configureStore } from "@reduxjs/toolkit";

// Simple store configuration without cart persistence
const store = configureStore({
	reducer: {
		// Add other reducers here as needed
		// Note: Cart is now managed by useCart hook with backend as single source of truth
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [],
			},
		}),
});

export default store;
