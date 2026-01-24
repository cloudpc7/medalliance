import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openFilter: false,
  selectedFilter: null,
  showOption: false,
  hideFilter: true,
  profileType: 'any',
  onlineStatus: 'any',
  degree: 'any',
  college: 'any',
  occupation: 'any',
  format: 'any',
  program: 'any',
  quote: 'any',
  clear: false,
};

const filterSlice = createSlice({
  name: 'filters', 
  initialState,
  reducers: {
    open: (state) => {
      state.openFilter = true;
    },
    close(state) {
      state.openFilter = false;
    },
    toggleOption: (state, action) => {
      state.showOption = state.selectedFilter === action.payload ? !state.showOption : true;
      state.selectedFilter = action.payload;
    },
    toggleFilter: (state) => {
      state.hideFilter = !state.hideFilter;
    },
    setProfileType: (state,action) => {
      state.profileType = action.payload;
    },
    setOnlineStatus: (state,action) => {
      state.onlineStatus = action.payload;
    },
    setDegree: ( state, action) => {
      state.degree = action.payload;
    },
    setCollege: (state, action) => {
      state.college = action.payload;
    }, 
    setProgram: (state, action) => {
      state.program = action.payload;
    },
    setFormat: (state, action) => {
      state.format = action.payload;
    },
    setOccupation: ( state, action) => {
      state.occupation = action.payload;
    },
    setQuote: ( state, action ) => {
      state.quote = action.payload;
    },

    clearFilters: () => initialState
  },
});

export const { 
  open, close, toggleOption, setProfileType, 
  setOnlineStatus, setDegree, clearFilters,
  setCollege, setProgram, setFormat, setOccupation, setQuote,
} = filterSlice.actions;
export default filterSlice.reducer; 