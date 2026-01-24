import { configureStore } from '@reduxjs/toolkit';
import accountReducer, {
  fetchAccountSettings,
  updateAccountField,
  deleteAccount,
  clearAccountError,
} from './accountSlice';

// --- MOCKS ---

// 1. Mock the API Utility
jest.mock('../../utils/apiUtilities/api', () => ({
  callGetUserProfile: jest.fn(),
}));

// 2. Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

// 3. Mock Firebase Config (to avoid initialization errors)
jest.mock('../../config/firebaseConfig', () => ({
  functions: {},
}));

// Import mocks to control behavior in tests
import { callGetUserProfile } from '../../utils/apiUtilities/api';
import { httpsCallable } from 'firebase/functions';

describe('Account Slice', () => {
  let store;

  // Helper to create a clean store for every test
  const createTestStore = () =>
    configureStore({
      reducer: { account: accountReducer },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  // ====================================================
  // 1. SYNCHRONOUS REDUCER LOGIC
  // ====================================================
  
  describe('Reducers', () => {
    it('should return the initial state', () => {
      // We check undefined state to trigger default arguments
      const state = accountReducer(undefined, { type: undefined });
      expect(state).toEqual({
        settings: {
          profileVisible: true,
          online: true,
          darkMode: false,
        },
        loading: false,
        error: null,
        deleteInProgress: false,
      });
    });

    it('should clear error when clearAccountError is dispatched', () => {
      // Manually set an error state
      const startState = { error: 'Old Error' };
      const nextState = accountReducer(startState, clearAccountError());
      expect(nextState.error).toBeNull();
    });
  });

  // ====================================================
  // 2. ASYNC THUNK: fetchAccountSettings
  // ====================================================

  describe('fetchAccountSettings', () => {
    it('handles successful fetch', async () => {
      // Mock API response containing extra data
      const mockProfile = {
        profileVisible: false,
        darkMode: true,
        online: false,
        someOtherField: 'ignore me', // Should be filtered out by logic
      };
      callGetUserProfile.mockResolvedValue(mockProfile);

      await store.dispatch(fetchAccountSettings());

      const state = store.getState().account;
      expect(state.loading).toBe(false);
      // Verify only specific fields were kept based on slice logic
      expect(state.settings).toEqual({
        profileVisible: false,
        darkMode: true,
        online: false,
      });
      expect(state.error).toBeNull();
    });

    it('handles fetch failure', async () => {
      const errorMessage = 'Network Error';
      callGetUserProfile.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchAccountSettings());

      const state = store.getState().account;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('sets loading state while pending', () => {
      // Use the reducer directly to check the pending state
      const action = { type: fetchAccountSettings.pending.type };
      const state = accountReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  // ====================================================
  // 3. ASYNC THUNK: updateAccountField
  // ====================================================

  describe('updateAccountField', () => {
    const mockCloudFunction = jest.fn();

    beforeEach(() => {
      // Setup the mock for httpsCallable to return our mock function
      httpsCallable.mockReturnValue(mockCloudFunction);
    });

    it('optimistically updates state immediately (on pending)', () => {
      // Your slice updates state in `.pending`, giving instant UI feedback
      // We test this by manually running the pending action against the reducer
      const initialState = { settings: { darkMode: false } };
      const action = { 
        type: updateAccountField.pending.type, 
        meta: { arg: { key: 'darkMode', value: true } } 
      };

      const nextState = accountReducer(initialState, action);
      
      expect(nextState.settings.darkMode).toBe(true);
    });

    it('handles successful cloud function update', async () => {
      mockCloudFunction.mockResolvedValue({ data: { success: true } });

      await store.dispatch(updateAccountField({ key: 'profileVisible', value: false }));

      const state = store.getState().account;
      expect(state.settings.profileVisible).toBe(false);
      
      // Verify Firebase was called with correct args
      expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'updateAccountField');
      expect(mockCloudFunction).toHaveBeenCalledWith({ field: 'profileVisible', value: false });
    });

    it('sets error on failure', async () => {
      mockCloudFunction.mockRejectedValue(new Error('Permission Denied'));

      await store.dispatch(updateAccountField({ key: 'online', value: false }));

      const state = store.getState().account;
      expect(state.error).toBe('Permission Denied');
      
      // Note: In your current slice code, a rejection does NOT revert the 
      // optimistic update made in pending. If that is intended, this test passes.
      // If that is a bug, the test would currently show the value changed.
    });
  });

  // ====================================================
  // 4. ASYNC THUNK: deleteAccount
  // ====================================================

  describe('deleteAccount', () => {
    const mockCloudFunction = jest.fn();

    beforeEach(() => {
      httpsCallable.mockReturnValue(mockCloudFunction);
    });

    it('sets deleteInProgress=true when pending', () => {
      const action = { type: deleteAccount.pending.type };
      const state = accountReducer(undefined, action);
      expect(state.deleteInProgress).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles successful deletion', async () => {
      mockCloudFunction.mockResolvedValue({});

      await store.dispatch(deleteAccount());

      const state = store.getState().account;
      expect(state.deleteInProgress).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCloudFunction).toHaveBeenCalled();
    });

    it('handles deletion failure', async () => {
      mockCloudFunction.mockRejectedValue(new Error('Deletion Failed'));

      await store.dispatch(deleteAccount());

      const state = store.getState().account;
      expect(state.deleteInProgress).toBe(false);
      expect(state.error).toBe('Deletion Failed');
    });
  });
});