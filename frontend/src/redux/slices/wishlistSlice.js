import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistAPI } from "../../services/orderService";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.get();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await wishlistAPI.toggle(productId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { wishlist: { products: [] }, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  },
});

export default wishlistSlice.reducer;