// ====================================================
// 1. UNMOCK THE SLICE (CRITICAL)
// ====================================================
jest.unmock('./profile.slice');

// ====================================================
// 2. DEFINE MOCKS
// ====================================================

// Mock the API
jest.mock('../../utils/apiUtilities/api', () => ({
  callSubmitProfileData: jest.fn(),
}));

// Mock the Auth Slice
// We define the mock function here, but we set its return value in beforeEach
jest.mock('./auth.slice', () => ({
  markProfileComplete: jest.fn(),
}));

// ====================================================
// 3. IMPORTS
// ====================================================
import { configureStore } from '@reduxjs/toolkit';

// Real slice imports
import profileReducer, {
  setProfile,
  setProfileType,
  confirmProfile,
  clearError,
  setLoading,
  submitProfileForm,
} from './profile.slice';

// Mock imports (for controlling behavior)
import { callSubmitProfileData } from '../../utils/apiUtilities/api';
import { markProfileComplete } from './auth.slice';

describe('Profile Slice', () => {
  let store;

  const initialState = {
    data: null,
    profileType: null,
    profileConfirmed: false,
    loading: false,
    error: null,
  };

  const createTestStore = () =>
    configureStore({
      reducer: {
        profile: profileReducer,
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // --- CRITICAL FIX ---
    // We must ensure this mock returns an object. 
    // If it returns undefined, dispatch() will throw the error you were seeing.
    markProfileComplete.mockReturnValue({ type: 'auth/markProfileComplete' });
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // ====================================================
  // 4. SYNCHRONOUS REDUCERS
  // ====================================================
  describe('Reducers', () => {
    it('should return initial state', () => {
      expect(profileReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should handle setProfile', () => {
      const mockData = { name: 'John Doe', bio: 'Hello' };
      const nextState = profileReducer(initialState, setProfile(mockData));
      expect(nextState.data).toEqual(mockData);
    });

    it('should handle setProfileType', () => {
      const nextState = profileReducer(initialState, setProfileType('student'));
      expect(nextState.profileType).toBe('student');
    });

    it('should handle confirmProfile', () => {
      const nextState = profileReducer(initialState, confirmProfile());
      expect(nextState.profileConfirmed).toBe(true);
    });

    it('should handle clearError', () => {
      const startState = { ...initialState, error: 'Something went wrong' };
      const nextState = profileReducer(startState, clearError());
      expect(nextState.error).toBeNull();
    });

    it('should handle setLoading', () => {
      const nextState = profileReducer(initialState, setLoading(true));
      expect(nextState.loading).toBe(true);
    });
  });

  // ====================================================
  // 5. ASYNC THUNK: submitProfileForm
  // ====================================================
  describe('submitProfileForm', () => {
    const mockProfileData = { name: 'Jane Doe', role: 'Doctor' };

    it('sets loading state while pending', () => {
      const action = { type: submitProfileForm.pending.type };
      const state = profileReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles successful submission (Happy Path)', async () => {
      const mockResponse = { ...mockProfileData, id: '123' };

      // 1. Setup API success
      callSubmitProfileData.mockResolvedValue(mockResponse);

      // 2. Dispatch the action
      await store.dispatch(submitProfileForm(mockProfileData));

      // 3. Get State
      const state = store.getState().profile;

      // 4. Assertions
      // If this fails, it prints the error message found in state.error
      if (state.error) { 
        console.error('DEBUG - Thunk Error:', state.error); 
      }

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockResponse);
      expect(state.profileConfirmed).toBe(true);
      
      // Verify that the auth slice action was called
      expect(markProfileComplete).toHaveBeenCalled();
    });

    it('handles API failure', async () => {
      const errorMessage = 'Validation Failed';
      callSubmitProfileData.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(submitProfileForm(mockProfileData));

      const state = store.getState().profile;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.profileConfirmed).toBe(false);
      expect(markProfileComplete).not.toHaveBeenCalled();
    });

    it('handles unexpected errors gracefully', async () => {
      callSubmitProfileData.mockRejectedValue('Unknown string error');

      await store.dispatch(submitProfileForm(mockProfileData));

      const state = store.getState().profile;

      // Update this string if your slice uses a different default error message
      expect(state.error).toBe('Profile submission failed');
    });
  });
});