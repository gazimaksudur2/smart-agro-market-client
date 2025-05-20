import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import cartReducer from "./slices/cartSlice";

// Configure Redux Persist
const persistConfig = {
	key: "smartAgro",
	storage,
	whitelist: ["cart"], // only cart will be persisted
};

const rootReducer = combineReducers({
	cart: cartReducer,
	// Add other reducers here as needed
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					"persist/PERSIST",
					"persist/REHYDRATE",
					"persist/REGISTER",
				],
			},
		}),
});

export const persistor = persistStore(store);
export default store;
