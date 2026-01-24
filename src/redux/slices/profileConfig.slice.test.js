// ====================================================
// 1. UNMOCK THE SLICE (CRITICAL)
// ====================================================
// Forces Jest to use the real code for this file
jest.unmock('./profileConfig.slice');

// ====================================================
// 2. MOCK DEPENDENCIES
// ====================================================
jest.mock('../../utils/apiUtilities/api', () => ({
  callGetProfileConfig: jest.fn(),
}));

// ====================================================
// 3. IMPORTS
// ====================================================
import { configureStore } from '@reduxjs/toolkit';

// Real slice imports
import profileConfigReducer, {
  clearConfig,
  fetchProfileConfig,
} from './profileConfig.slice';

// Mock imports
import { callGetProfileConfig } from '../../utils/apiUtilities/api';

describe('Profile Config Slice', () => {
  let store;

  const initialState = {
    questions: [],
    profileType: null,
    loading: false,
    error: null,
  };

  const createTestStore = () =>
    configureStore({
      reducer: {
        profileConfig: profileConfigReducer,
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // ====================================================
  // 4. SYNCHRONOUS REDUCERS
  // ====================================================
  describe('Reducers', () => {
    it('should return initial state', () => {
      expect(profileConfigReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should handle clearConfig', () => {
      // 1. Set up a dirty state
      const startState = {
        questions: [{ id: 1, text: 'Q1' }],
        profileType: 'student',
        loading: true,
        error: 'Old Error',
      };

      // 2. Dispatch clear action
      const nextState = profileConfigReducer(startState, clearConfig());

      // 3. Verify it reset to initial
      expect(nextState).toEqual(initialState);
    });
  });

  // ====================================================
  // 5. ASYNC THUNK: fetchProfileConfig
  // ====================================================
  describe('fetchProfileConfig', () => {
    const mockProfileType = 'student';
    const mockApiResponse = {
      questions: [
        { id: 1, label: 'University?' },
        { id: 2, label: 'Major?' },
      ],
    };

    it('sets loading state while pending', () => {
      const action = { type: fetchProfileConfig.pending.type };
      const state = profileConfigReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles missing profileType (Validation Error)', async () => {
      // Dispatch without arguments (undefined profileType)
      await store.dispatch(fetchProfileConfig(undefined));

      const state = store.getState().profileConfig;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Profile type is undefined.');
      expect(state.questions).toEqual([]);
      
      // Ensure API was NOT called
      expect(callGetProfileConfig).not.toHaveBeenCalled();
    });

    it('handles successful fetch (Happy Path)', async () => {
      // Mock API success
      callGetProfileConfig.mockResolvedValue(mockApiResponse);

      // Dispatch
      await store.dispatch(fetchProfileConfig(mockProfileType));

      const state = store.getState().profileConfig;

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.profileType).toBe(mockProfileType);
      expect(state.questions).toEqual(mockApiResponse.questions);
    });

    it('handles successful fetch with empty questions', async () => {
      // Mock API returning object without questions array
      callGetProfileConfig.mockResolvedValue({}); 

      await store.dispatch(fetchProfileConfig(mockProfileType));

      const state = store.getState().profileConfig;

      expect(state.loading).toBe(false);
      // Logic says: Array.isArray(data.questions) ? ... : []
      expect(state.questions).toEqual([]); 
    });

    it('handles API failure', async () => {
      const errorMessage = 'Network Error';
      callGetProfileConfig.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchProfileConfig(mockProfileType));

      const state = store.getState().profileConfig;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.questions).toEqual([]);
    });

    it('handles unknown API errors gracefully', async () => {
      // Mock API failing with something that isn't an Error object
      callGetProfileConfig.mockRejectedValue('Unknown String Error');

      await store.dispatch(fetchProfileConfig(mockProfileType));

      const state = store.getState().profileConfig;

      // The thunk logic: return rejectWithValue(err.message || 'Failed...')
      // Since 'Unknown String Error' is a string, it has no .message property.
      expect(state.error).toBe('Failed to fetch profile configuration.');
    });
  });
});