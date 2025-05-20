import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = {
	items: [],
	totalItems: 0,
	subtotal: 0,
	deliveryCharge: 0,
	totalAmount: 0,
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action) => {
			const { _id, quantity = 1, minimumOrderQuantity } = action.payload;
			const existingItem = state.items.find((item) => item._id === _id);

			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				// Ensure quantity meets minimum order requirement
				const finalQuantity = Math.max(quantity, minimumOrderQuantity);
				state.items.push({
					...action.payload,
					quantity: finalQuantity,
				});
			}

			// Recalculate cart totals
			state.totalItems = state.items.reduce(
				(total, item) => total + item.quantity,
				0
			);
			state.subtotal = state.items.reduce(
				(total, item) => total + item.price * item.quantity,
				0
			);
			// Delivery charge calculation - assume base delivery charge per item
			state.deliveryCharge = state.items.length * 100; // Base delivery charge
			state.totalAmount = state.subtotal + state.deliveryCharge;
		},

		updateCartItemQuantity: (state, action) => {
			const { _id, quantity } = action.payload;
			const existingItem = state.items.find((item) => item._id === _id);

			if (existingItem) {
				// Check if quantity meets minimum order requirement
				if (quantity < existingItem.minimumOrderQuantity) {
					toast.error(
						`Minimum order quantity is ${existingItem.minimumOrderQuantity} ${existingItem.unit}`
					);
					existingItem.quantity = existingItem.minimumOrderQuantity;
				} else if (quantity <= 0) {
					// Remove item if quantity is zero or negative
					state.items = state.items.filter((item) => item._id !== _id);
				} else {
					existingItem.quantity = quantity;
				}

				// Recalculate cart totals
				state.totalItems = state.items.reduce(
					(total, item) => total + item.quantity,
					0
				);
				state.subtotal = state.items.reduce(
					(total, item) => total + item.price * item.quantity,
					0
				);
				state.deliveryCharge = state.items.length * 100; // Base delivery charge
				state.totalAmount = state.subtotal + state.deliveryCharge;
			}
		},

		removeFromCart: (state, action) => {
			const { _id } = action.payload;
			state.items = state.items.filter((item) => item._id !== _id);

			// Recalculate cart totals
			state.totalItems = state.items.reduce(
				(total, item) => total + item.quantity,
				0
			);
			state.subtotal = state.items.reduce(
				(total, item) => total + item.price * item.quantity,
				0
			);
			state.deliveryCharge = state.items.length * 100; // Base delivery charge
			state.totalAmount = state.subtotal + state.deliveryCharge;
		},

		clearCart: (state) => {
			state.items = [];
			state.totalItems = 0;
			state.subtotal = 0;
			state.deliveryCharge = 0;
			state.totalAmount = 0;
		},

		updateDeliveryCharge: (state, action) => {
			const { region, district } = action.payload;
			// Calculate delivery charge based on region and district
			// This is a placeholder - actual logic would depend on your delivery charge calculation
			let baseCharge = state.items.length * 100; // Base charge

			// Apply regional pricing adjustments (example)
			if (region === "Chittagong") {
				baseCharge += 200;
			} else if (region === "Rajshahi") {
				baseCharge += 100;
			}

			state.deliveryCharge = baseCharge;
			state.totalAmount = state.subtotal + state.deliveryCharge;
		},
	},
});

export const {
	addToCart,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
	updateDeliveryCharge,
} = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartDeliveryCharge = (state) => state.cart.deliveryCharge;
export const selectCartTotal = (state) => state.cart.totalAmount;

export default cartSlice.reducer;
