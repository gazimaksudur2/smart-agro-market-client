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

// Async thunks for database operations
export const loadCartFromDB = createAsyncThunk(
	"cart/loadFromDB",
	async (email) => {
		const cart = await cartService.getCartFromDB(email);
		return cart;
	}
);

export const loadCartFromLocalStorage = createAsyncThunk(
	"cart/loadFromLocalStorage",
	async () => {
		const cart = cartService.getCartFromLocalStorage();
		return cart;
	}
);

export const syncCartToDB = createAsyncThunk(
	"cart/syncToDB",
	async ({ email, cartData }) => {
		await cartService.saveCartToDB(email, cartData);
		return cartData;
	}
);

export const mergeCartOnLogin = createAsyncThunk(
	"cart/mergeOnLogin",
	async (email) => {
		const mergedCart = await cartService.mergeAndTransferCart(email);
		return mergedCart;
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
				// Update localStorage
				const currentCart = cartService.getCartFromLocalStorage();
				const updatedCart = {
					...currentCart,
					items: [...(currentCart.items || []), product],
				};
				cartService.saveCartToLocalStorage(updatedCart);
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
				cartService.clearCartFromLocalStorage();
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

		// Sync cart to localStorage for non-authenticated users
		syncToLocalStorage: (state) => {
			cartService.saveCartToLocalStorage({
				items: state.items,
				totalItems: state.totalItems,
				subtotal: state.subtotal,
				deliveryCharge: state.deliveryCharge,
				totalAmount: state.totalAmount,
			});
		},

		// Set cart from external source (DB or localStorage)
		setCart: (state, action) => {
			const {
				items = [],
				totalItems = 0,
				subtotal = 0,
				deliveryCharge = 0,
				totalAmount = 0,
			} = action.payload;
			state.items = items;
			state.totalItems = totalItems;
			state.subtotal = subtotal;
			state.deliveryCharge = deliveryCharge;
			state.totalAmount = totalAmount;
		},
	},
	extraReducers: (builder) => {
		builder
			// Load cart from database
			.addCase(loadCartFromDB.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(loadCartFromDB.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				const cart = action.payload;
				state.items = cart.items || [];
				state.totalItems = cart.totalItems || 0;
				state.subtotal = cart.subtotal || 0;
				state.deliveryCharge = cart.deliveryCharge || 0;
				state.totalAmount = cart.totalAmount || 0;
			})
			.addCase(loadCartFromDB.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.error = action.error.message;
			})
			// Load cart from localStorage
			.addCase(loadCartFromLocalStorage.fulfilled, (state, action) => {
				const cart = action.payload;
				state.items = cart.items || [];
				state.totalItems = cart.totalItems || 0;
				state.subtotal = cart.subtotal || 0;
				state.deliveryCharge = cart.deliveryCharge || 0;
				state.totalAmount = cart.totalAmount || 0;
			})
			// Sync cart to database
			.addCase(syncCartToDB.pending, (state) => {
				state.syncStatus = "syncing";
			})
			.addCase(syncCartToDB.fulfilled, (state) => {
				state.syncStatus = "synced";
			})
			.addCase(syncCartToDB.rejected, (state, action) => {
				state.syncStatus = "error";
				state.error = action.error.message;
			})
			// Merge cart on login
			.addCase(mergeCartOnLogin.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(mergeCartOnLogin.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				const cart = action.payload;
				state.items = cart.items || [];
				state.totalItems = cart.totalItems || 0;
				state.subtotal = cart.subtotal || 0;
				state.deliveryCharge = cart.deliveryCharge || 0;
				state.totalAmount = cart.totalAmount || 0;
			})
			.addCase(mergeCartOnLogin.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
				toast.error(action.payload || "Failed to merge cart on login");
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
				state.syncError = null;
			})
			.addCase(addToCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
				toast.error(action.payload || "Failed to add item to cart");
			})
			// Update quantity async
			.addCase(updateCartItemQuantityAsync.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(updateCartItemQuantityAsync.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				state.syncError = null;
			})
			.addCase(updateCartItemQuantityAsync.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
				toast.error(action.payload || "Failed to update item quantity");
			})
			// Remove from cart async
			.addCase(removeFromCartAsync.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(removeFromCartAsync.fulfilled, (state, action) => {
				state.loading = false;
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				state.syncError = null;
			})
			.addCase(removeFromCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
				toast.error(action.payload || "Failed to remove item from cart");
			})
			// Clear cart async
			.addCase(clearCartAsync.pending, (state) => {
				state.loading = true;
				state.syncStatus = "syncing";
			})
			.addCase(clearCartAsync.fulfilled, (state) => {
				state.loading = false;
				state.syncStatus = "synced";
				state.lastSync = new Date().toISOString();
				state.syncError = null;
				state.items = [];
				state.totalItems = 0;
				state.subtotal = 0;
				state.deliveryCharge = 0;
				state.totalAmount = 0;
			})
			.addCase(clearCartAsync.rejected, (state, action) => {
				state.loading = false;
				state.syncStatus = "error";
				state.syncError = action.payload;
				toast.error(action.payload || "Failed to clear cart");
			});
	},
});

export const {
	addToCart,
	updateCartItemQuantity,
	removeFromCart,
	clearCart,
	updateDeliveryCharge,
	syncToLocalStorage,
	setCart,
} = cartSlice.actions;

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
