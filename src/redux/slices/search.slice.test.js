import searchReducer, {
  openSearch,
  closeSearch,
  setQuery,
  clearSearch,
  selectFilteredSearchResults
} from './search.slice';

describe('search slice', () => {
  // ----------------------------------------------------------------
  // 1. REDUCER TESTS
  // ----------------------------------------------------------------
  describe('reducers', () => {
    const initialState = { open: false, query: '' };

    it('should return the initial state', () => {
      expect(searchReducer(undefined, {})).toEqual(initialState);
    });

    it('should handle openSearch', () => {
      const next = searchReducer(initialState, openSearch());
      expect(next.open).toBe(true);
    });

    it('should handle closeSearch', () => {
      const startState = { ...initialState, open: true };
      const next = searchReducer(startState, closeSearch());
      expect(next.open).toBe(false);
    });

    it('should handle setQuery', () => {
      const next = searchReducer(initialState, setQuery('John'));
      expect(next.query).toBe('John');
    });

    it('should handle clearSearch', () => {
      const startState = { ...initialState, query: 'John' };
      const next = searchReducer(startState, clearSearch());
      expect(next.query).toBe('');
    });
  });

  // ----------------------------------------------------------------
  // 2. SELECTOR TESTS (Cross-Slice Logic)
  // ----------------------------------------------------------------
  describe('selectFilteredSearchResults', () => {
    // Mock Data
    const mockProfiles = [
      { id: 1, name: 'Alice Smith', profileVisible: true },
      { id: 2, name: 'Alex Johnson', profileVisible: true }, // Starts with A
      { id: 3, name: 'Bob Jones', profileVisible: true },
      { id: 4, name: 'Al Hidden', profileVisible: false },   // Invisible
    ];

    it('should return empty array if query is empty', () => {
      const state = {
        search: { query: '' },
        profiles: { profiles: mockProfiles }
      };
      expect(selectFilteredSearchResults(state)).toEqual([]);
    });

    it('should filter profiles starting with query (case insensitive)', () => {
      const state = {
        search: { query: 'al' }, // Should match Alice and Alex
        profiles: { profiles: mockProfiles }
      };
      
      const result = selectFilteredSearchResults(state);
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toEqual(['Alice Smith', 'Alex Johnson']);
    });

    it('should exclude hidden profiles', () => {
      const state = {
        search: { query: 'al' },
        profiles: { profiles: mockProfiles }
      };
      
      const result = selectFilteredSearchResults(state);
      // "Al Hidden" matches the name "Al", but profileVisible is false
      expect(result.find(p => p.name === 'Al Hidden')).toBeUndefined();
    });

    it('should handle missing profiles gracefully', () => {
      const state = {
        search: { query: 'test' },
        profiles: {} // Missing 'profiles' array inside
      };
      expect(selectFilteredSearchResults(state)).toEqual([]);
    });
  });
});