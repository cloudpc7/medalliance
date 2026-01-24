import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRequests: 0,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    resetLoading: (state) => {
      state.activeRequests = 0;
    },
    startLoading: (state) => {
      state.activeRequests += 1;
    },
    stopLoading: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => 
          action.type.endsWith('/pending') && 
          !action.meta?.arg?.background,
        (state) => {
          state.activeRequests += 1;
        }
      )
      .addMatcher(
        (action) => 
          (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && 
          !action.meta?.arg?.background,
        (state) => {
          state.activeRequests = Math.max(0, state.activeRequests - 1);
        }
      );
  },
});

export const { resetLoading, startLoading, stopLoading } = loadingSlice.actions;
export default loadingSlice.reducer;