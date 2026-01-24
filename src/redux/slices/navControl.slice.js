// --- Redux Libraries and Modules ---
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRoute: '/',
};

const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    setActiveRoute: (state, action) => {
      state.activeRoute = action.payload;
    },
  },
});

export const { setActiveRoute } = navSlice.actions;
export default navSlice.reducer;