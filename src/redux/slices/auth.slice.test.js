import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  signInWithGoogle,
  signOutUser,
  refreshToken,
  markProfileComplete,
  setUser,
  setLoading,
  setProfileSetupComplete,
  setError
} from './auth.slice'; 

// --- 1. MOCK EXTERNAL DEPENDENCIES ---

// Mock Secure Store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}));

// Mock Google Auth Service
jest.mock('../../features/auth/GoogleAuthService', () => ({
  performGoogleSignIn: jest.fn(),
}));

// Mock Firebase Config
// FIX: We return a plain object here. Jest will allow us to import and mutate this object.
jest.mock('../../config/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

// --- 2. IMPORTS ---
import * as SecureStore from 'expo-secure-store';
import { signOut } from 'firebase/auth';
import { performGoogleSignIn } from '../../features/auth/GoogleAuthService';
// Import the mocked auth object so we can change 'currentUser' in tests
import { auth } from '../../config/firebaseConfig';

describe('Auth Slice', () => {
  let store;

  const createTestStore = () =>
    configureStore({
      reducer: { auth: authReducer },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    
    // FIX: Reset the auth state before every test
    auth.currentUser = null;

    // Optional: Silence console.error for the signOut failure test
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  // ====================================================
  // 1. SYNCHRONOUS REDUCERS
  // ====================================================
  describe('Synchronous Actions', () => {
    it('should handle initial state', () => {
      const state = authReducer(undefined, { type: undefined });
      expect(state).toEqual({
        user: null,
        loading: true,
        error: null,
        profileSetupComplete: null,
      });
    });

    it('should set user data', () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      const nextState = authReducer(undefined, setUser(mockUser));
      expect(nextState.user).toEqual(mockUser);
      expect(nextState.error).toBeNull();
    });

    it('should set loading state', () => {
      const nextState = authReducer(undefined, setLoading(false));
      expect(nextState.loading).toBe(false);
    });

    it('should set error state', () => {
      const nextState = authReducer(undefined, setError('Login Failed'));
      expect(nextState.error).toBe('Login Failed');
    });

    it('should set profile setup complete', () => {
      const nextState = authReducer(undefined, setProfileSetupComplete(true));
      expect(nextState.profileSetupComplete).toBe(true);
    });
  });

  // ====================================================
  // 2. ASYNC THUNK: signInWithGoogle
  // ====================================================
  describe('signInWithGoogle', () => {
    it('handles successful sign in', async () => {
      const mockUser = { uid: 'google-123', displayName: 'Google User' };
      performGoogleSignIn.mockResolvedValue({
        success: true,
        user: {
          toJSON: () => mockUser,
        },
      });

      await store.dispatch(signInWithGoogle());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('handles service failure', async () => {
      performGoogleSignIn.mockResolvedValue({
        success: false,
        message: 'User cancelled',
      });

      await store.dispatch(signInWithGoogle());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('User cancelled');
    });

    it('handles unexpected exceptions', async () => {
      performGoogleSignIn.mockRejectedValue(new Error('Network Error'));

      await store.dispatch(signInWithGoogle());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toContain('Unexpected error');
    });
  });

  // ====================================================
  // 3. ASYNC THUNK: signOutUser
  // ====================================================
  describe('signOutUser', () => {
    it('successfully signs out and resets state', async () => {
      store.dispatch(setUser({ uid: '123' }));
      signOut.mockResolvedValue();

      await store.dispatch(signOutUser());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.profileSetupComplete).toBe(false);
      expect(signOut).toHaveBeenCalled();
    });

    it('handles sign out failure', async () => {
      signOut.mockRejectedValue(new Error('Logout failed'));

      await store.dispatch(signOutUser());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      // FIX: Your slice catches the error but doesn't pass it to payload,
      // so the reducer uses the default fallback string.
      expect(state.error).toBe('Sign-out failed.');
    });
  });

  // ====================================================
  // 4. ASYNC THUNK: refreshToken
  // ====================================================
  describe('refreshToken', () => {
    it('rejects if no user is currently logged in', async () => {
      // FIX: Explicitly set null on the imported mock object
      auth.currentUser = null;

      const result = await store.dispatch(refreshToken());

      expect(result.type).toBe('auth/refreshToken/rejected');
      expect(result.payload).toBe('No user logged in to refresh token');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('gets token and saves to SecureStore if user exists', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('fake-jwt-token');
      // FIX: Set a mock user on the imported auth object
      auth.currentUser = {
        uid: '123',
        getIdToken: mockGetIdToken,
      };

      const result = await store.dispatch(refreshToken());

      expect(result.type).toBe('auth/refreshToken/fulfilled');
      expect(result.payload).toBe('fake-jwt-token');
      expect(mockGetIdToken).toHaveBeenCalledWith(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'fake-jwt-token');
    });

    it('handles errors during token fetch', async () => {
      auth.currentUser = {
        getIdToken: jest.fn().mockRejectedValue(new Error('Token Expired')),
      };

      const result = await store.dispatch(refreshToken());

      expect(result.type).toBe('auth/refreshToken/rejected');
      expect(result.payload).toBe('Token Expired');
    });
  });

  // ====================================================
  // 5. ASYNC THUNK: markProfileComplete
  // ====================================================
  describe('markProfileComplete', () => {
    it('sets profileSetupComplete to true', async () => {
      await store.dispatch(markProfileComplete());
      
      const state = store.getState().auth;
      expect(state.profileSetupComplete).toBe(true);
    });
  });
});