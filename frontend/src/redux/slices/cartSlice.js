import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartAPI } from "../../services/orderService";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await cartAPI.get();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, qty, variant }, { rejectWithValue }) => {
    try {
      const res = await cartAPI.add({ productId, qty, variant });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ productId, qty }, { rejectWithValue }) => {
    try {
      const res = await cartAPI.update({ productId, qty });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await cartAPI.remove(productId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, { rejectWithValue }) => {
    try {
      const res = await cartAPI.applyCoupon(code);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid coupon");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: { cart: { items: [], coupon: null }, loading: false, error: null },
  reducers: {
    clearCartLocal: (state) => {
      state.cart = { items: [], coupon: null };
    },
  },
  extraReducers: (builder) => {
    const fulfill = (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.error = null;
    };
    const reject = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, fulfill)
      .addCase(fetchCart.rejected, reject)
      .addCase(addToCart.fulfilled, fulfill)
      .addCase(addToCart.rejected, reject)
      .addCase(updateCartItem.fulfilled, fulfill)
      .addCase(removeCartItem.fulfilled, fulfill)
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart.coupon = action.payload.coupon;
      })
      .addCase(applyCoupon.rejected, reject);
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;