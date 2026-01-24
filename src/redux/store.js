// --- Core Dependencies ---
import { configureStore, combineReducers } from '@reduxjs/toolkit';

// --- Third Party Libraries ---
import * as SecureStore from 'expo-secure-store';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// --- Slices (Reducers) ---
import authReducer from './slices/auth.slice';
import profilesReducer from './slices/profiles.slice';
import profileReducer from './slices/profile.slice';
import profileConfigReducer from './slices/profileConfig.slice';
import imageSliceReducer from './slices/image.slice';
import accountReducer from './slices/accountSlice';
import shopReducer from './slices/shop.slice';
import schoolReducer from './slices/school.slice';
import filtersReducer from './slices/filter.slice';
import searchReducer from './slices/search.slice';
import messagingReducer from './slices/messaging.slice';
import navReducer from './slices/navControl.slice';
import loadingReducer from './slices/loading.slice';
import errorReducer from './slices/error.slice';

// -----------------------------------------------------------------------------
// Storage Adapter
// -----------------------------------------------------------------------------

export const secureStorage = {
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// -----------------------------------------------------------------------------
// Nested Persistence Configurations
// -----------------------------------------------------------------------------

/**
 * authPersistConfig
 * * Specifically manages the 'auth' slice to prevent rehydration of 
 * * ephemeral state like profileSetupComplete and manualSignOut.
 */
const authPersistConfig = {
  key: 'auth',
  storage: secureStorage,
  keyPrefix: '',
  blacklist: [ 'user','profileSetupComplete', 'manualSignOut', 'checked'], 
};

/**
 * rootPersistConfig
 * * Manages the global state persistence.
 */
const rootPersistConfig = {
  key: 'root',
  keyPrefix: '',
  storage: secureStorage,
  whitelist: ['school'],
};

// -----------------------------------------------------------------------------
// Root Reducer
// -----------------------------------------------------------------------------

const combinedReducer = combineReducers({
  // User Session & Data
  // We wrap the authReducer here with its specific blacklist config
  auth: persistReducer(authPersistConfig, authReducer), 
  account: accountReducer,
  profile: profileReducer,
  loading: loadingReducer,
  error: errorReducer,
  
  // App Content & Features
  profiles: profilesReducer,
  profileConfig: profileConfigReducer,
  shop: shopReducer,
  school: schoolReducer,
  messaging: messagingReducer,
  
  // Media
  images: imageSliceReducer,
  
  // UI State
  nav: navReducer,
  filters: filtersReducer,
  search: searchReducer,
});

// Final persisted reducer using the root config
const persistedReducer = persistReducer(rootPersistConfig, combinedReducer);

// -----------------------------------------------------------------------------
// Store Configuration
// -----------------------------------------------------------------------------

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);