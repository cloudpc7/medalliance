import navReducer, {
  setActiveRoute,
  setLoading,
  setError,
} from './navControl.slice';

describe('Nav Slice', () => {
  const initialState = {
    activeRoute: '/',
    loading: false,
    error: null,
  };

  // ====================================================
  // 1. INITIAL STATE
  // ====================================================
  it('should return the initial state', () => {
    // When called with undefined state
    expect(navReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  // ====================================================
  // 2. SET ACTIVE ROUTE
  // ====================================================
  describe('setActiveRoute', () => {
    it('should update the active route', () => {
      const nextState = navReducer(initialState, setActiveRoute('/profile'));
      expect(nextState.activeRoute).toBe('/profile');
    });

    it('should reset loading and error states when route changes', () => {
      // Setup dirty state (loading=true, error=exists)
      const dirtyState = {
        activeRoute: '/login',
        loading: true,
        error: 'Network Error',
      };

      const nextState = navReducer(dirtyState, setActiveRoute('/home'));

      expect(nextState.activeRoute).toBe('/home');
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeNull();
    });
  });

  // ====================================================
  // 3. SET LOADING
  // ====================================================
  describe('setLoading', () => {
    it('should set loading to true', () => {
      const nextState = navReducer(initialState, setLoading(true));
      expect(nextState.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const startState = { ...initialState, loading: true };
      const nextState = navReducer(startState, setLoading(false));
      expect(nextState.loading).toBe(false);
    });
  });

  // ====================================================
  // 4. SET ERROR
  // ====================================================
  describe('setError', () => {
    it('should set the error message', () => {
      const nextState = navReducer(initialState, setError('Navigation failed'));
      expect(nextState.error).toBe('Navigation failed');
    });

    it('should turn off loading when an error is set', () => {
      // If we were loading and then hit an error, loading should stop
      const startState = { ...initialState, loading: true };
      
      const nextState = navReducer(startState, setError('Not Found'));
      
      expect(nextState.error).toBe('Not Found');
      expect(nextState.loading).toBe(false);
    });
  });
});