import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productAPI } from "../../services/productService";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const res = await productAPI.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: { products: [], page: 1, pages: 1, total: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;