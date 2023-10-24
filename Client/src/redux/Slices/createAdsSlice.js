import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createAd = createAsyncThunk('ads/createAd', async (adData) => {
  const endpoint = 'https://connectifyback-dp-production.up.railway.app/ads';
  const response = await axios.post(endpoint, adData);
  return response.data;
  //eliminado el tryCatch debido a que el createAsyncThunk ya maneja los errores.
});

const createAdsSlice = createSlice({
  name: 'createAds',
  initialState: { createAds: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAd.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.createAds.push = action.payload;
      })
      .addCase(createAd.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const dataAds = (state) => state.createAds.ads;
export default createAdsSlice.reducer;