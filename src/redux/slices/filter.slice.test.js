import filterReducer, {
  setAccountType,
  setDepartment,
  setFormat,
  setCollege,
  setDegree,
  setOnlineStatus,
  setMajorMinor,
  setQuote,
  setOccupation,
  setGoals,
  setGroup,
  clearFilters,
  openModal,
  closeModal,
  toggleFilter,
  selectFilteredProfiles,
} from './filter.slice';

describe('Filter Slice', () => {
  const initialState = {
    accountType: 'all',
    department: 'all',
    format: 'all',
    college: '',
    degree: '',
    onlineStatus: 'all',
    majorMinor: '',
    quote: '',
    occupation: '',
    goals: '',
    group: '',
    openFilter: false,
  };

  // ====================================================
  // 1. REDUCER TESTS
  // ====================================================
  describe('Reducers', () => {
    it('should return the initial state', () => {
      expect(filterReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should handle setAccountType', () => {
      const nextState = filterReducer(initialState, setAccountType('student'));
      expect(nextState.accountType).toBe('student');
    });

    it('should handle defaulting to "all" if payload is empty', () => {
      const nextState = filterReducer(initialState, setAccountType(null));
      expect(nextState.accountType).toBe('all');
    });

    it('should handle setDepartment', () => {
      const nextState = filterReducer(initialState, setDepartment('Cardiology'));
      expect(nextState.department).toBe('Cardiology');
    });

    it('should handle UI toggles (Modal)', () => {
      // Open
      let state = filterReducer(initialState, openModal());
      expect(state.openFilter).toBe(true);

      // Toggle (Close)
      state = filterReducer(state, toggleFilter());
      expect(state.openFilter).toBe(false);

      // Toggle (Open)
      state = filterReducer(state, toggleFilter());
      expect(state.openFilter).toBe(true);

      // Close explicitly
      state = filterReducer(state, closeModal());
      expect(state.openFilter).toBe(false);
    });

    it('should handle clearFilters', () => {
      // 1. Dirty the state
      const dirtyState = {
        ...initialState,
        accountType: 'professor',
        college: 'Harvard',
        openFilter: true,
      };

      // 2. Clear it
      const cleanState = filterReducer(dirtyState, clearFilters());

      // 3. Should return to initial state
      expect(cleanState).toEqual(initialState);
    });
  });

  // ====================================================
  // 2. SELECTOR TESTS (Complex Logic)
  // ====================================================
  describe('selectFilteredProfiles', () => {
    // Mock Data for Testing
    const mockProfiles = [
      {
        id: 1,
        name: 'Alice',
        accountType: 'student',
        department: 'CS',
        College: 'MIT',
        online: true,
        profileVisible: true,
        formats: 'video',
      },
      {
        id: 2,
        name: 'Bob',
        accountType: 'professor',
        department: 'Biology',
        College: 'Stanford',
        online: false,
        profileVisible: true,
        formats: 'text',
      },
      {
        id: 3,
        name: 'Charlie',
        accountType: 'student',
        department: 'CS',
        College: 'MIT',
        online: false,
        profileVisible: false, // HIDDEN USER
        formats: 'video',
      },
      {
        id: 4,
        name: 'Dana',
        accountType: 'student',
        department: 'Art',
        College: 'Yale',
        online: true,
        profileVisible: true,
        formats: 'video, text', // Multiple formats
      },
    ];

    // Helper to construct the root state the selector expects
    const buildState = (filterOverrides = {}) => ({
      profiles: { profiles: mockProfiles },
      filters: { ...initialState, ...filterOverrides },
    });

    it('returns all visible profiles when no filters are set', () => {
      const state = buildState(); 
      const result = selectFilteredProfiles(state);

      // Should return Alice, Bob, Dana (Charlie is hidden)
      expect(result).toHaveLength(3);
      expect(result.find((p) => p.name === 'Charlie')).toBeUndefined();
    });

    it('filters by exact match (accountType)', () => {
      const state = buildState({ accountType: 'professor' });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });

    it('filters by partial string match and case insensitivity (College)', () => {
      // Search "mit" should match "MIT"
      const state = buildState({ college: 'mit' });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(1); // Alice (Charlie is hidden)
      expect(result[0].name).toBe('Alice');
    });

    it('filters by boolean (onlineStatus)', () => {
      const state = buildState({ onlineStatus: 'online' });
      const result = selectFilteredProfiles(state);

      // Should match Alice and Dana
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name).sort()).toEqual(['Alice', 'Dana']);
    });

    it('filters by substring in comma-separated list (format)', () => {
      // Dana has "video, text". Searching "text" should find her and Bob.
      const state = buildState({ format: 'text' });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.name).sort()).toEqual(['Bob', 'Dana']);
    });

    it('combines multiple filters correctly (AND logic)', () => {
      // Student + CS
      const state = buildState({ 
        accountType: 'student', 
        department: 'CS' 
      });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('returns empty array if no matches found', () => {
      const state = buildState({ 
        accountType: 'student', 
        college: 'Mars University' 
      });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(0);
    });

    it('handles null/undefined fields safely without crashing', () => {
      // Add a profile with missing fields
      const brokenProfile = { 
        id: 99, 
        profileVisible: true, 
        // Missing accountType, department, etc.
      };

      const state = {
        profiles: { profiles: [...mockProfiles, brokenProfile] },
        filters: { ...initialState, department: 'CS' } // Filter by something missing
      };

      const result = selectFilteredProfiles(state);
      
      // Should simply not match the broken profile, but NOT crash
      // Matches Alice (CS)
      expect(result).toHaveLength(1); 
      expect(result[0].name).toBe('Alice');
    });
    
    it('always excludes hidden profiles regardless of filters', () => {
      // Exact match for Charlie, but he is hidden
      const state = buildState({ 
        accountType: 'student', 
        department: 'CS',
        onlineStatus: 'offline' 
      });
      const result = selectFilteredProfiles(state);

      expect(result).toHaveLength(0);
    });
  });
});