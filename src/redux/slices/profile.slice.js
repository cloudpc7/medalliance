// --- Redux Libraries and Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- API Utilities ---
import { callUpdateAccountField, callSubmitProfileData } from '../../utils/apiUtilities/api';

// --- Slice Actions ---
import { markProfileComplete } from './auth.slice';

/**
 * updateProfileFieldRemote
 * The master action for the Settings screen.
 * 1. Calls your API utility: updateAccountField
 * 2. Syncs this Private Slice
 * 3. Syncs the Public Profiles Slice
 */
export const updateProfileFieldRemote = createAsyncThunk(
  'profile/updateFieldRemote',
  async ({ key, value }, { dispatch, getState, rejectWithValue }) => {
    try {
      const authUser = getState().auth.user;
      if (!authUser?.uid) throw new Error("Unauthenticated");
      await callUpdateAccountField(key, value);
      dispatch(updateProfileField({ key, value }));
      return { key, value };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * submitProfileForm
 * Handles onboarding submission.
 */
export const submitProfileForm = createAsyncThunk(
  'profile/submitForm',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const updatedProfile = await callSubmitProfileData(profileData);
      dispatch(markProfileComplete());
      dispatch(confirmProfile());
      return updatedProfile;
    } catch (error) {
      return rejectWithValue(error.message || 'Profile submission failed');
    }
  }
);

const initialState = {
  data: null,            
  profileType: null,
  profileConfirmed: false,
  showField: false,
  searchQuery: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Original Name: setProfile
    setProfile: (state, action) => { 
      state.data = action.payload;
    },
    // Alias for useProfileData hook compatibility
    setProfileData: (state, action) => { 
      state.data = action.payload;
    },
    setProfileType: (state, action) => {
      state.profileType = action.payload;
    },
    confirmProfile: (state) => {
      state.profileConfirmed = true;
    },
    setShowField: (state, action) => {
      state.showField = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    updateProfileField: (state, action) => {
      const { key, value } = action.payload;
      if (!state.data) state.data = {};
      state.data[key] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProfileForm.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const { 
  setProfile, 
  setProfileData,
  setProfileType, 
  confirmProfile,
  updateProfileField,
  setShowField,
  setSearchQuery, 
} = profileSlice.actions; 

export default profileSlice.reducer;