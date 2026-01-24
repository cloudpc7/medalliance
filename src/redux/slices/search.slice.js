// --- Redux Libraries & Modules ---
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  query: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    openSearch(state) {
      state.open = true;
    },
    closeSearch(state) {
      state.open = false;
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
    clearSearch(state) {
      state.query = '';
    },
  },
});

export const { openSearch, closeSearch, setQuery, clearSearch } = searchSlice.actions;

export default searchSlice.reducer;

const selectSearchState = (state) => state.search;

const selectProfiles = (state) => state.profiles?.profiles || [];

export const selectSearchOpen = (state) => selectSearchState(state).open;
export const selectSearchQuery = (state) => selectSearchState(state).query;

/**
 * selectFilteredSearchResults
 * * MEMOIZED SELECTOR (via createSelector)
 * * Efficiently filters the global profile list based on the search query.
 * * * * Logic:
 * * 1. Returns empty array if query is empty (prevents showing all users by default).
 * * 2. Filters out users who have explicitly set `profileVisible` to false.
 * * 3. Matches names using a case-insensitive `startsWith` check.
 */
export const selectFilteredSearchResults = createSelector(
  [selectProfiles, selectSearchQuery],
  (profiles, query) => {
    // Normalization
    const q = (query || '').trim().toLowerCase();
    
    // 1. Guard Clause: No Query
    if (!q) return [];

    // 2. Filter Logic
    return profiles.filter(p => 
      // Visibility Check
      p.profileVisible !== false && 
      // Name Match Check
      (p.name || '').toLowerCase().startsWith(q)
    );
  }
);