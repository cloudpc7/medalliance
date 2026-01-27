// --- Redux Libraries & Modules ---
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// --- Firebase Dependencies ---
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebaseConfig';

// --- Local Actions ---
import { processAndCacheImage } from './image.slice';

export const fetchProfilesAndPrecache = createAsyncThunk(
  'profiles/fetchProfilesAndPrecache',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      // 1. Guard: Check if we even have a user in state before calling the API
      const { user } = getState().auth;
      if (!user) return rejectWithValue('No active session');

      const fetch = httpsCallable(functions, 'fetchProfilesSecure');
      const res = await fetch();

      const profilesData = Array.isArray(res.data)
        ? res.data
        : res.data?.profiles || [];

      const visibleProfiles = profilesData.filter(
        (p) => p.profileVisible !== false
      );

      dispatch(precacheProfileImages(visibleProfiles));

      return visibleProfiles;
    } catch (error) {
      const isAuthError = 
        error.message?.includes('Authentication') || 
        error.code === 'unauthenticated' ||
        error.message?.includes('expired');

      if (isAuthError) {
        return rejectWithValue('canceled'); 
      }

      return rejectWithValue(error.message || 'Failed to fetch profiles');
    }
  }
);

export const precacheProfileImages = createAsyncThunk(
  'profiles/precacheProfileImages',
  async (profiles, { getState, dispatch }) => {
    const { cachedUris } = getState().images;
    if (!Array.isArray(profiles)) return;

    profiles.forEach((p) => {
      const uri = p?.avatarUrl?.trim();
      if (!uri || !/^https?:\/\//i.test(uri) || cachedUris[uri]) return;
      dispatch(
        processAndCacheImage({
          remoteUri: uri,
          resizeOptions: {},
          background: true, 
        })
      );
    });
  }
);

export const updateField = createAsyncThunk(
  'profiles/updateField',
  async ({ uid, key, value }, { rejectWithValue }) => {
    try {
      return { uid, key, value };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- Selectors & Filter Logic ---
export const profileFilter = createSelector(
  (state) => state.profiles.profiles || [],
  (state) => state.filters,
  (state) => state.auth.user?.uid,
  (profiles, filterState, currentUid) => {
    if (!profiles.length) return [];

    const keyMap = {
      profileType: 'accountType',
      program: 'major_minor',
      format: 'formats',
      college: 'College',
      degree: 'degree',
      occupation: 'occupation',
    };

    return profiles.filter((profile) => {
      // 1. Mandatory Guards
      if (profile.profileVisible === false) return false;
      if (profile.id === currentUid) return false;

      const filterKeys = Object.keys(filterState);

      for (const key of filterKeys) {
        const userValue = filterState[key];

        // 2. Skip empty filters or UI-only state keys
        if (!userValue || userValue === 'any' || ['openFilter', 'selectedFilter', 'showOption', 'hideFilter', 'clear'].includes(key)) {
          continue;
        }

        // 3. Special Case: Quote
        if (key === 'quote') {
          if (userValue === 'has quote') {
            const hasQuote = typeof profile.quote === 'string' && profile.quote.trim().length > 0;
            if (!hasQuote) return false;
          }
          continue;
        }

        // 4. Special Case: Online Status
        if (key === 'onlineStatus') {
          const shouldBeOnline = userValue === 'online';
          if (profile.online !== shouldBeOnline) return false;
          continue;
        }

        // 5. CRITICAL FIX: Only filter if the key is in our mapping
        // This ensures 'avatarUrl' or other extra fields don't accidentally hide the user
        const profileFieldName = keyMap[key];
        if (!profileFieldName) {
          continue; // Ignore any filter key that isn't explicitly mapped
        }

        const profileValue = profile[profileFieldName];

        // 6. If the profile is missing a value but the user is SEARCHING for one
        if (profileValue === undefined || profileValue === null || profileValue === '') {
            // Only hide if the user selected a specific value to search for
            if (userValue && userValue !== 'any') return false;
            continue;
        }

        const pValClean = profileValue.toString().toLowerCase();
        const uValClean = userValue.toLowerCase();

        // 7. Comparison Logic
        if (['program', 'degree', 'format'].includes(key)) {
          if (!pValClean.includes(uValClean)) return false;
        } else {
          if (pValClean !== uValClean) return false;
        }
      }
      return true;
    });
  }
);
export const selectCurrentUserProfile = (state) => {
  const uid = state.auth.user?.uid;
  if (!uid) return null;

  return (
    state.profiles.profiles.find(
      (p) => p.uid === uid || p.userId === uid || p.id === uid
    ) || null
  );
};

export const selectedProfiles = profileFilter;

export const selectedProfileIds = createSelector(
  [selectedProfiles],
  (profiles) => profiles.map((profile) => profile.id)
);

export const selectCurrentProfileId = (state) => state.profiles.currentId;

const initialState = {
  profiles: [],
  index: 0,
  currentId: null,
  extendProfile: false,
  selectedProfile: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    swipeProfile: (state) => {
      if (state.profiles.length === 0) return;
      state.index = state.index + 1; // no modulo needed
      state.currentId = state.profiles[state.index]?.id || state.currentId;
    },
    previousProfile: (state) => {
      if (state.profiles.length === 0) return;
      state.index = state.index - 1; // can go negative, Swiper handles looping
      state.currentId = state.profiles[state.index]?.id || state.currentId;
    },
    resetIndex: (state) => {
      state.index = 0;
    },
    loopProfiles: (state) => {
      state.index = 0;
    },
    setProfileIndex: (state, action) => {
      state.index = action.payload % state.profiles.length;
      state.currentId = state.profiles[state.index]?.id || null;
    },
    clearProfiles: (state) => {
      state.profiles = [];
      state.index = 0;
      state.extendProfile = false;
      state.selectedProfile = null;
    },
    openProfile: (state, action) => {
      state.extendProfile = true;
      state.selectedProfile = action.payload;
    },
    closeProfile: (state) => {
      state.extendProfile = false;
      state.selectedProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfilesAndPrecache.fulfilled, (state, action) => {
        state.profiles = action.payload || [];
        state.currentId = state.profiles[0]?.id || null;
        state.index = 0;
      })
      .addCase(updateField.fulfilled, (state, action) => {
        const { uid, key, value } = action.payload;
        const matchesUser = (p) => p.id === uid || p.uid === uid || p.userId === uid;
        if (key === 'profileVisible' && value === false) {
          state.profiles = state.profiles.filter((p) => !matchesUser(p));
          if (state.profiles.length === 0 || state.index >= state.profiles.length) {
            state.index = 0;
          }
          if (state.selectedProfile && matchesUser(state.selectedProfile)) {
            state.extendProfile = false;
            state.selectedProfile = null;
          }
          return;
        }
        state.profiles = state.profiles.map((p) =>
          matchesUser(p) ? { ...p, [key]: value } : p
        );

        if (state.selectedProfile && matchesUser(state.selectedProfile)) {
          state.selectedProfile = { ...state.selectedProfile, [key]: value };
        }
      });
  },
});

export const {
  swipeProfile,
  previousProfile,
  resetIndex,
  loopProfiles,
  clearProfiles,
  openProfile,
  closeProfile,
  setProfileIndex,
} = profilesSlice.actions;

export default profilesSlice.reducer;