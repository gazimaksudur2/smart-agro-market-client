import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import cartService from "../../services/cartService";

const initialState = {
	items: [],
	totalItems: 0,
	subtotal: 0,
	deliveryCharge: 0,
	totalAmount: 0,
	loading: false,
	error: null,
	syncStatus: "idle", // 'idle', 'syncing', 'synced', 'error'
};

// Async thunks for database operations only
export const loadCartFromDB = createAsyncThunk(
	"cart/loadFromDB",
	async (email) => {
		const cart = await cartService.getCartFromDB(email);
		return cart;
	}
);

export const addToCartAsync = createAsyncThunk(
	"cart/addToCartAsync",
	async ({ product, email, isAuthenticated }, { rejectWithValue }) => {
		try {
			// Validate product before adding
			cartService.validateCartItem(product);

			if (isAuthenticated && email) {
				// Update database
				await cartService.saveCartToDB(email, {
					items: [product],
					operation: "add",
				});
			} else {
				throw new Error("Authentication required for cart operations");
			}
			return { product, isAuthenticated };
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateCartItemQuantityAsync = createAsyncThunk(
	"cart/updateCartItemQuantityAsync",
	async ({ itemId, quantity, email, isAuthenticated }, { rejectWithValue }) => {
		try {
			if (isAuthenticated && email) {
				await cartService.updateCartItemInDB(email, itemId, quantity);
			} else {
				throw new Error("Authentication required for cart operations");
			}
			return { itemId, quantity };
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const removeFromCartAsync = createAsyncThunk(
	"cart/removeFromCartAsync",
	async ({ itemId, email, isAuthenticated }, { rejectWithValue }) => {
		try {
			if (isAuthenticated && email) {
				await cartService.removeCartItemFromDB(email, itemId);
			} else {
				throw new Error("Authentication required for cart operations");
			}
			return { itemId };
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const clearCartAsync = createAsyncThunk(
	"cart/clearCartAsync",
	async ({ email, isAuthenticated }, { rejectWithValue }) => {
		try {
			if (isAuthenticated && email) {
				await cartService.clearCartInDB(email);
			} else {
				throw new Error("Authentication required for cart operations");
			}
			return true;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const cartSlice = createSlice({
	name: "cart",
	initialState: {
		...initialState,
		lastSync: null,
		syncError: null,
	},
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
			state.deliveryCharge = action.payload;
			state.totalAmount = state.subtotal + state.deliveryCharge;
		},

		resetCartError: (state) => {
			state.error = null;
			state.syncError = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Load cart from DB
			.addCase(loadCartFromDB.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(loadCartFromDB.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();

				const cart = action.payload;
				if (cart && cart.items) {
					state.items = cart.items;
					state.totalItems = cart.totalItems || 0;
					state.subtotal = cart.subtotal || 0;
					state.deliveryCharge = cart.deliveryCharge || 0;
					state.totalAmount = cart.totalAmount || 0;
				}
			})
			.addCase(loadCartFromDB.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.error.message;
			})

			// Add to cart async
			.addCase(addToCartAsync.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(addToCartAsync.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				// Add item to local state
				cartSlice.caseReducers.addToCart(state, action);
			})
			.addCase(addToCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
			})

			// Update cart item quantity async
			.addCase(updateCartItemQuantityAsync.pending, (state) => {
				state.syncStatus = "syncing";
			})
			.addCase(updateCartItemQuantityAsync.fulfilled, (state, action) => {
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				// Update item in local state
				cartSlice.caseReducers.updateCartItemQuantity(state, {
					payload: {
						_id: action.payload.itemId,
						quantity: action.payload.quantity,
					},
				});
			})
			.addCase(updateCartItemQuantityAsync.rejected, (state, action) => {
				state.syncStatus = "error";
				state.syncError = action.payload;
			})

			// Remove from cart async
			.addCase(removeFromCartAsync.pending, (state) => {
				state.syncStatus = "syncing";
			})
			.addCase(removeFromCartAsync.fulfilled, (state, action) => {
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				// Remove item from local state
				cartSlice.caseReducers.removeFromCart(state, {
					payload: { _id: action.payload.itemId },
				});
			})
			.addCase(removeFromCartAsync.rejected, (state, action) => {
				state.syncStatus = "error";
				state.syncError = action.payload;
			})

			// Clear cart async
			.addCase(clearCartAsync.pending, (state) => {
				state.syncStatus = "syncing";
			})
			.addCase(clearCartAsync.fulfilled, (state) => {
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				// Clear local state
				cartSlice.caseReducers.clearCart(state);
			})
			.addCase(clearCartAsync.rejected, (state, action) => {
				state.syncStatus = "error";
				state.syncError = action.payload;
			});
	},
});

export const {
	addToCart,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
	updateDeliveryCharge,
	resetCartError,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartDeliveryCharge = (state) => state.cart.deliveryCharge;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartSyncStatus = (state) => state.cart.syncStatus;
export const selectCartSyncError = (state) => state.cart.syncError;
export const selectCartLastSync = (state) => state.cart.lastSync;

export default cartSlice.reducer;
