import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    clearError: (state) => {
      state.message = null;
      state.type = null;
    },
    setError: (state, action) => {
      state.message = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          const errorMessage = action.payload || action.error?.message || 'An unexpected error occurred.';
          if (errorMessage === 'User cancelled sign-in.' || errorMessage === 'canceled') {
            return;
          }

          state.message = errorMessage;
          state.type = action.type.split('/')[0];
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.message = null;
          state.type = null;
        }
      );
  },
});

export const { clearError, setError } = errorSlice.actions;
export default errorSlice.reducer;