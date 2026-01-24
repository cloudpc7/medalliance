import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Firebase Libraries and Modules
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebaseConfig';

// Utility Components
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// React-Native Libraries and Modules
import { Image } from 'react-native';

// --- Cross-Slice Actions ---
import { updateProfileField } from './profile.slice';

/**
 * processAndCacheImage
 * Handles local caching and resizing of remote images to improve performance.
 */
export const processAndCacheImage = createAsyncThunk(
  'images/processAndCacheImage',
  async (input, { getState, rejectWithValue }) => {
    let remoteUri = typeof input === 'string' ? input : input?.remoteUri;
    let resizeOptions = input?.resizeOptions || {};

    if (!remoteUri) return null;

    const { width, height } = resizeOptions;
    const state = getState().images;
    
    if (state.cachedUris[remoteUri]) {
      return {
        originalUri: remoteUri,
        cachedUri: state.cachedUris[remoteUri],
        finalDimensions: state.imageDimensions?.[remoteUri],
        originalDimensions: state.originalDimensions?.[remoteUri],
      };
    }

    try {
      const originalSize = await new Promise((resolve) => {
        Image.getSize(
          remoteUri,
          (w, h) => resolve({ width: w, height: h }),
          (error) => {
            reject(new Error(`[processAndCacheImage] Size check failed for ${remoteUri}: ${error.message}`))
            resolve(null);
          }
        );
      });

      const uniqueId = `${remoteUri}_${width || 'auto'}x${height || 'auto'}`;
      const fileName = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, uniqueId);
      const localPath = `${FileSystem.cacheDirectory}${fileName}.jpg`;

      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        return {
          originalUri: remoteUri,
          cachedUri: fileInfo.uri,
          finalDimensions: state.imageDimensions?.[remoteUri] || { width, height },
          originalDimensions: state.originalDimensions?.[remoteUri] || originalSize,
        };
      }

      const tempPath = `${FileSystem.cacheDirectory}temp_${Date.now()}.jpg`;
      const download = await FileSystem.downloadAsync(remoteUri, tempPath);

      if (download.status !== 200) throw new Error(`Download failed: ${download.status}`);

      const actions = [];
      if (width || height) actions.push({ resize: { width, height } });

      const manipulated = await ImageManipulator.manipulateAsync(
        download.uri,
        actions,
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      await FileSystem.copyAsync({ from: manipulated.uri, to: localPath });
      await FileSystem.deleteAsync(download.uri, { idempotent: true });

      return {
        originalUri: remoteUri,
        cachedUri: localPath,
        finalDimensions: { width: manipulated.width, height: manipulated.height },
        originalDimensions: originalSize,
      };
    } catch (error) {
      return rejectWithValue({ originalUri: remoteUri, error: error.message });
    }
  }
);

/**
 * fetchAvatarUrl
 * Retrieves the avatar URL from the backend. 
 */
export const fetchAvatarUrl = createAsyncThunk(
  'images/fetchAvatarUrl',
  async (_, { getState, rejectWithValue }) => {
    // 1. Guard Clause: Don't even start if there's no UID in state
    const uid = getState().auth.user?.uid;
    if (!uid) return null; 

    try {
      // 2. Production Wait: Wait for Firebase Auth to initialize properly
      const currentUser = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        }, reject);
      });

      // 3. Silent Fail: If no user is actually logged in, just exit quietly
      if (!currentUser) return null;

      // 4. Force Token Refresh: Ensures no 401 errors
      await getIdToken(currentUser, true);

      // 5. Execute Secure Function
      const fetchFunc = httpsCallable(functions, 'fetchAvatarUrlSecure');
      const res = await fetchFunc();
      
      return res.data?.avatarUrl || null;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
/**
 * uploadImage
 * Uploads a binary blob to Firebase Storage and updates the Profile Slice directly.
 */
export const uploadImage = createAsyncThunk(
  'images/uploadImage',
  async (imageBlob, { dispatch, rejectWithValue }) => {
    try {
      const base64String = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(imageBlob);
      });

      const upload = httpsCallable(functions, 'uploadAvatarSecure');
      const res = await upload({ imageBase64: base64String });
      
      const newUrl = res.data?.avatarUrl;

      if (newUrl) {
        // Sync the Profile slice immediately so the Avatar component sees it
        dispatch(updateProfileField({ key: 'avatarUrl', value: newUrl }));
      }

      return { avatarUrl: newUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- SLICE ---

const initialState = {
  avatarUrl: null,
  status: 'idle', 
  cachedUris: {},
  imageDimensions: {},
  originalDimensions: {},
  processing: {},
};

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    resetAvatar: (state) => { 
      state.avatarUrl = null; 
      state.status = 'idle'; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvatarUrl.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAvatarUrl.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.avatarUrl = action.payload;
      })
      .addCase(fetchAvatarUrl.rejected, (state, action) => {
        state.status = 'failed';
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.avatarUrl = action.payload.avatarUrl;
      })
      .addCase(processAndCacheImage.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { originalUri, cachedUri, finalDimensions, originalDimensions } = action.payload;
        state.cachedUris[originalUri] = cachedUri;
        state.imageDimensions[originalUri] = finalDimensions;
        state.originalDimensions[originalUri] = originalDimensions;
      });
  },
});

export const {  resetAvatar } = imagesSlice.actions;
export default imagesSlice.reducer;