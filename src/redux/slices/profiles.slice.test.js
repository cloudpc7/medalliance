// ====================================================
// 1. UNMOCK THE SLICE
// ====================================================
jest.unmock('./profiles.slice');

// ====================================================
// 2. MOCK DEPENDENCIES
// ====================================================

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

jest.mock('../../config/firebaseConfig', () => ({
  functions: {},
}));

// Mock the Image Slice (Action Creator)
jest.mock('./image.slice', () => ({
  processAndCacheImage: jest.fn((payload) => ({
    type: 'image/processAndCacheImage',
    payload,
  })),
}));

// ====================================================
// 3. IMPORTS
// ====================================================
import { configureStore } from '@reduxjs/toolkit';
import { httpsCallable } from 'firebase/functions';

// Real Slice
import profilesReducer, {
  fetchProfilesAndPrecache,
  precacheProfileImages,
  swipeProfile,
  resetIndex,
  loopProfiles,
  clearProfiles,
  openProfile,
  closeProfile,
  setProfileIndex,
  updateCurrentUserProfileField,
  selectCurrentUserProfile,
} from './profiles.slice';

// Mocked Action
import { processAndCacheImage } from './image.slice';

describe('Profiles Slice', () => {
  let store;
  let mockFetchProfilesSecure;

  const initialState = {
    profiles: [],
    extendProfile: false,
    selectedProfile: null,
    currentIndex: 0,
    loading: false,
    error: null,
  };

  // Helper to create store with a dummy "images" slice 
  // because precacheProfileImages accesses state.images.cachedUris
  const createTestStore = (preloadedState = {}) =>
    configureStore({
      reducer: {
        profiles: profilesReducer,
        // Dummy reducer to satisfy getState().images check
        images: (state = { cachedUris: {} }, action) => state,
        // Dummy reducer for auth (needed for selector tests)
        auth: (state = { user: null }, action) => state,
      },
      preloadedState,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup Firebase Mock
    mockFetchProfilesSecure = jest.fn();
    httpsCallable.mockReturnValue(mockFetchProfilesSecure);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // ====================================================
  // 4. SYNCHRONOUS REDUCERS
  // ====================================================
  describe('Reducers', () => {
    it('should return initial state', () => {
      expect(profilesReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should handle swipeProfile', () => {
      const startState = { ...initialState, profiles: [1, 2, 3], currentIndex: 0 };
      const nextState = profilesReducer(startState, swipeProfile());
      expect(nextState.currentIndex).toBe(1);
    });

    it('should loop swipeProfile', () => {
      const startState = { ...initialState, profiles: [1, 2], currentIndex: 1 };
      const nextState = profilesReducer(startState, swipeProfile());
      expect(nextState.currentIndex).toBe(0); // 1 + 1 % 2 = 0
    });

    it('should handle resetIndex', () => {
      const startState = { ...initialState, currentIndex: 5 };
      const nextState = profilesReducer(startState, resetIndex());
      expect(nextState.currentIndex).toBe(0);
    });

    it('should handle clearProfiles', () => {
      const startState = { 
        ...initialState, 
        profiles: [{ id: 1 }], 
        currentIndex: 2, 
        extendProfile: true, 
        selectedProfile: { id: 1 } 
      };
      const nextState = profilesReducer(startState, clearProfiles());
      expect(nextState.profiles).toEqual([]);
      expect(nextState.currentIndex).toBe(0);
      expect(nextState.extendProfile).toBe(false);
      expect(nextState.selectedProfile).toBeNull();
    });

    it('should handle openProfile', () => {
      const mockProfile = { id: 1, name: 'Test' };
      const nextState = profilesReducer(initialState, openProfile(mockProfile));
      expect(nextState.extendProfile).toBe(true);
      expect(nextState.selectedProfile).toEqual(mockProfile);
    });

    it('should handle setProfileIndex', () => {
      const nextState = profilesReducer(initialState, setProfileIndex(5));
      expect(nextState.currentIndex).toBe(5);
    });

    // --- Complex Reducer: updateCurrentUserProfileField ---
    describe('updateCurrentUserProfileField', () => {
      const uid = 'user-123';
      const userProfile = { id: uid, name: 'Old Name', profileVisible: true };
      const otherProfile = { id: 'other-456', name: 'Other' };
      
      it('updates a field for the matching user', () => {
        const startState = { ...initialState, profiles: [userProfile, otherProfile] };
        
        const action = updateCurrentUserProfileField({ uid, key: 'name', value: 'New Name' });
        const nextState = profilesReducer(startState, action);

        expect(nextState.profiles[0].name).toBe('New Name');
        expect(nextState.profiles[1].name).toBe('Other'); // Unchanged
      });

      it('removes the user from profiles if profileVisible is set to false', () => {
        const startState = { ...initialState, profiles: [userProfile, otherProfile] };
        
        const action = updateCurrentUserProfileField({ uid, key: 'profileVisible', value: false });
        const nextState = profilesReducer(startState, action);

        expect(nextState.profiles).toHaveLength(1);
        expect(nextState.profiles[0].id).toBe('other-456');
      });

      it('resets selectedProfile if the hidden user was selected', () => {
        const startState = { 
          ...initialState, 
          profiles: [userProfile], 
          selectedProfile: userProfile,
          extendProfile: true 
        };
        
        const action = updateCurrentUserProfileField({ uid, key: 'profileVisible', value: false });
        const nextState = profilesReducer(startState, action);

        expect(nextState.selectedProfile).toBeNull();
        expect(nextState.extendProfile).toBe(false);
      });
    });
  });

  // ====================================================
  // 5. ASYNC THUNKS
  // ====================================================
  describe('fetchProfilesAndPrecache', () => {
    it('handles successful fetch and filters hidden profiles', async () => {
      const mockData = {
        data: [
          { id: '1', profileVisible: true, avatarUrl: 'http://img1.com' },
          { id: '2', profileVisible: false, avatarUrl: 'http://img2.com' }, // Hidden
          { id: '3', profileVisible: true, avatarUrl: 'http://img3.com' },
        ]
      };

      mockFetchProfilesSecure.mockResolvedValue(mockData);

      await store.dispatch(fetchProfilesAndPrecache());

      const state = store.getState().profiles;
      
      expect(state.loading).toBe(false);
      expect(state.profiles).toHaveLength(2); // ID 1 and 3
      expect(state.profiles.find(p => p.id === '2')).toBeUndefined();
      
      // Verify image processing was triggered for visible profiles
      expect(processAndCacheImage).toHaveBeenCalledWith(
        expect.objectContaining({ remoteUri: 'http://img1.com' })
      );
    });

    it('handles API failure', async () => {
      const errorMessage = 'Firebase Error';
      mockFetchProfilesSecure.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchProfilesAndPrecache());

      const state = store.getState().profiles;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('precacheProfileImages', () => {
    it('dispatches processAndCacheImage for new valid URLs', async () => {
      const profiles = [
        { avatarUrl: 'https://valid.com/image.jpg' },
        { avatarUrl: 'invalid-url' }, // Should be skipped
        { avatarUrl: null } // Should be skipped
      ];

      // Dispatch thunk manually
      await store.dispatch(precacheProfileImages(profiles));

      // Should only be called once for the valid URL
      expect(processAndCacheImage).toHaveBeenCalledTimes(1);
      expect(processAndCacheImage).toHaveBeenCalledWith(
        expect.objectContaining({ remoteUri: 'https://valid.com/image.jpg' })
      );
    });

    it('skips images that are already cached', async () => {
      // Setup store with existing cache
      store = createTestStore({
        images: {
          cachedUris: { 'https://cached.com/img.jpg': 'local-file-path' }
        }
      });

      const profiles = [{ avatarUrl: 'https://cached.com/img.jpg' }];

      await store.dispatch(precacheProfileImages(profiles));

      expect(processAndCacheImage).not.toHaveBeenCalled();
    });
  });

  // ====================================================
  // 6. SELECTORS
  // ====================================================
  describe('selectCurrentUserProfile', () => {
    it('returns the profile matching the auth user uid', () => {
      const uid = 'user-123';
      const state = {
        auth: { user: { uid } },
        profiles: {
          profiles: [
            { id: 'other', name: 'Other' },
            { id: uid, name: 'My Profile' }
          ]
        }
      };

      const result = selectCurrentUserProfile(state);
      expect(result).toEqual({ id: uid, name: 'My Profile' });
    });

    it('returns null if no auth user exists', () => {
      const state = {
        auth: { user: null },
        profiles: { profiles: [] }
      };
      expect(selectCurrentUserProfile(state)).toBeNull();
    });

    it('returns null if user profile is not found', () => {
      const state = {
        auth: { user: { uid: 'user-123' } },
        profiles: { profiles: [{ id: 'other' }] }
      };
      expect(selectCurrentUserProfile(state)).toBeNull();
    });
  });
});