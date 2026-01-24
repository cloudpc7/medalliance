// --- Redux Libraries & Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- Firebase Dependencies ---
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebaseConfig';

/**
 * callFetchStores
 * * Direct interface with the Firebase Cloud Function.
 * * Defined and exported here to allow for easy mocking/spying during unit tests.
 */
export const callFetchStores = async () => {
  const fetchStoresSecure = httpsCallable(functions, 'fetchStoresSecure');
  const result = await fetchStoresSecure();
  return result.data;
};

/**
 * fetchStores
 * * Async action to retrieve the catalog of available shops.
 * * Handles API communication and error serialization for Redux.
 */
export const fetchStores = createAsyncThunk(
  'shop/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      return await callFetchStores();
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load stores');
    }
  }
);

const initialState = {
  data: [],
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearStores(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.fulfilled, (state, { payload }) => {
        state.data = payload;
      });
  },
});

export const { clearStores } = shopSlice.actions;
export default shopSlice.reducer;