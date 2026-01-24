// --- Redux Libraries and Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- Firebase Libraries & Modules ---
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebaseConfig';

// --- API Utilities ---
import { callGetUserProfile } from '../../utils/apiUtilities/api';

// -----------------------------------------------------------------------------
// Thunks
// -----------------------------------------------------------------------------

/**
 * fetchAccountSettings
 * * Retrieves the user's profile and extracts specific settings flags.
 * * Defaults missing values to standard application defaults.
 */
export const fetchAccountSettings = createAsyncThunk(
  'account/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await callGetUserProfile();
      // Destructure with defaults to ensure UI always has valid booleans
      const { 
        profileVisible = true, 
        darkMode = false, 
        online = true 
      } = profile;
      
      return { profileVisible, darkMode, online };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load settings');
    }
  }
);

/**
 * updateAccountField
 * * Updates a specific setting (key/value pair) via Cloud Function.
 * * Uses optimistic updates in the slice to ensure instant UI feedback.
 */
export const updateAccountField = createAsyncThunk(
  'account/updateField',
  async ({ key, value }, { rejectWithValue }) => {
    try {
      const func = httpsCallable(functions, 'updateAccountField');
      await func({ field: key, value });
      return { key, value };
    } catch (error) {
      return rejectWithValue(error.message || 'Update failed');
    }
  }
);

/**
 * deleteAccount
 * * critical action: permanently deletes the user's account and data.
 */
export const deleteAccount = createAsyncThunk(
  'account/delete',
  async (_, { rejectWithValue }) => {
    try {
      const func = httpsCallable(functions, 'deleteUserAccount');
      await func();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState = {
  settings: {
    profileVisible: true,
    online: true,
    darkMode: false,
  },
  deleteInProgress: false,
  disableAccount: false,
};

// -----------------------------------------------------------------------------
// Slice
// -----------------------------------------------------------------------------

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setDisabled: (state, action) => { state.disableAccount = action.payload},
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Settings ---
      .addCase(fetchAccountSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // --- Update Field (Optimistic) ---
      .addCase(updateAccountField.pending, (state, action) => {
        const { key, value } = action.meta.arg;
        if (!state.settings) state.settings = {};
        state.settings[key] = value;
      })
      .addCase(updateAccountField.fulfilled, (state, action) => {
        const { key, value } = action.payload;
        state.settings[key] = value;
      })
      // --- Delete Account ---
      .addCase(deleteAccount.pending, (state) => {
        state.deleteInProgress = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleteInProgress = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteInProgress = false;
      });
  },
});

export default accountSlice.reducer;