// --- Redux Libraries & Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- API Utilities ---
import { callGetProfileConfig } from '../../utils/apiUtilities/api';

/**
 * fetchProfileConfig
 * * Retrieves the dynamic form configuration for a specific profile type.
 * * Used during the onboarding process to determine which questions to ask
 * * (e.g., Mentors get different questions than Mentees).
 */
export const fetchProfileConfig = createAsyncThunk(
  'profileConfig/fetchData',
  async (profileType, { rejectWithValue }) => {
    if (!profileType) return rejectWithValue('Profile type is undefined.');

    try {
      const data = await callGetProfileConfig(profileType);
      const questions = Array.isArray(data.questions) ? data.questions : [];
      return { questions, profileType };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile configuration.');
    }
  }
);

const initialState = {
  questions: [],
  profileType: null,
};

const profileConfigSlice = createSlice({
  name: 'profileConfig',
  initialState,
  reducers: {
    clearConfig: (state) => {
      state.questions = [];
      state.profileType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileConfig.fulfilled, (state, action) => {
        state.questions = action.payload.questions;
        state.profileType = action.payload.profileType;
      })
      .addCase(fetchProfileConfig.rejected, (state, action) => {
        state.questions = [];
      });
  },
});

export const { clearConfig } = profileConfigSlice.actions;
export default profileConfigSlice.reducer;