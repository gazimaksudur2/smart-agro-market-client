import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cartService";

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
	"cart/fetchCart",
	async (email, { rejectWithValue }) => {
		try {
			const cart = await cartService.getCartFromDB(email);
			return cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const addItemToCart = createAsyncThunk(
	"cart/addItemToCart",
	async ({ email, item }, { rejectWithValue }) => {
		try {
			const result = await cartService.addItemToDB(email, item);
			return result.cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const addMultipleItemsToCart = createAsyncThunk(
	"cart/addMultipleItemsToCart",
	async ({ email, items }, { rejectWithValue }) => {
		try {
			const result = await cartService.addMultipleItemsToCart(email, items);
			return result.cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateCartItem = createAsyncThunk(
	"cart/updateCartItem",
	async ({ email, itemId, quantity }, { rejectWithValue }) => {
		try {
			const result = await cartService.updateCartItemInDB(
				email,
				itemId,
				quantity
			);
			return result.cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const removeCartItem = createAsyncThunk(
	"cart/removeCartItem",
	async ({ email, itemId }, { rejectWithValue }) => {
		try {
			const result = await cartService.removeCartItemFromDB(email, itemId);
			return result.cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const clearCart = createAsyncThunk(
	"cart/clearCart",
	async (email, { rejectWithValue }) => {
		try {
			await cartService.clearCartInDB(email);
			return {
				items: [],
				totalItems: 0,
				subtotal: 0,
				deliveryCharge: 0,
				totalAmount: 0,
			};
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const batchUpdateCartItems = createAsyncThunk(
	"cart/batchUpdateCartItems",
	async ({ email, operations }, { rejectWithValue }) => {
		try {
			const result = await cartService.batchUpdateCart(email, operations);
			return result.cart;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

const initialState = {
	items: [],
	totalItems: 0,
	subtotal: 0,
	deliveryCharge: 0,
	totalAmount: 0,
	loading: false,
	error: null,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		clearCartError: (state) => {
			state.error = null;
		},
		resetCart: (state) => {
			return initialState;
		},
		// Client-side helper to merge items (for preview purposes)
		previewMergeItems: (state, action) => {
			const { newItems } = action.payload;
			const mergedItems = cartService.mergeCartItems(state.items, newItems);
			const totals = cartService.calculateCartTotals(mergedItems);

			return {
				...state,
				items: mergedItems,
				...totals,
			};
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch cart
			.addCase(fetchCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCart.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(fetchCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Add single item to cart
			.addCase(addItemToCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addItemToCart.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(addItemToCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Add multiple items to cart
			.addCase(addMultipleItemsToCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addMultipleItemsToCart.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(addMultipleItemsToCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Update cart item
			.addCase(updateCartItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCartItem.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(updateCartItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Remove cart item
			.addCase(removeCartItem.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(removeCartItem.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(removeCartItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Clear cart
			.addCase(clearCart.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(clearCart.fulfilled, (state, action) => {
				state.loading = false;
				state.items = [];
				state.totalItems = 0;
				state.subtotal = 0;
				state.deliveryCharge = 0;
				state.totalAmount = 0;
			})
			.addCase(clearCart.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Batch update cart items
			.addCase(batchUpdateCartItems.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(batchUpdateCartItems.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.items || [];
				state.totalItems = action.payload.totalItems || 0;
				state.subtotal = action.payload.subtotal || 0;
				state.deliveryCharge = action.payload.deliveryCharge || 0;
				state.totalAmount = action.payload.totalAmount || 0;
			})
			.addCase(batchUpdateCartItems.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearCartError, resetCart, previewMergeItems } =
	cartSlice.actions;
export default cartSlice.reducer;
