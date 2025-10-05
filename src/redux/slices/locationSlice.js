import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	latitude: null,
	longitude: null,
	status: "idle", // idle | requesting | granted | denied | error
	error: null,
	updatedAt: null,
};

const locationSlice = createSlice({
	name: "location",
	initialState,
	reducers: {
		setRequesting(state) {
			state.status = "requesting";
			state.error = null;
		},
		setGranted(state, action) {
			state.status = "granted";
			state.latitude = action.payload.latitude;
			state.longitude = action.payload.longitude;
			state.updatedAt = Date.now();
			state.error = null;
		},
		setDenied(state, action) {
			state.status = "denied";
			state.error = action.payload || null;
		},
		setError(state, action) {
			state.status = "error";
			state.error = action.payload || "Unknown error";
		},
		clearLocation(state) {
			state.latitude = null;
			state.longitude = null;
			state.status = "idle";
			state.error = null;
			state.updatedAt = null;
		},
	},
});

export const { setRequesting, setGranted, setDenied, setError, clearLocation } =
	locationSlice.actions;
export default locationSlice.reducer;
