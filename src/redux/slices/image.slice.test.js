import { configureStore } from '@reduxjs/toolkit';
// Ensure this matches your file name exactly (images.slice vs image.slice)
import imagesReducer, {
  processAndCacheImage,
  fetchAvatarUrl,
  uploadImage,
  clearImageError,
  resetAvatar,
} from './image.slice'; 

// --- 1. MOCK REACT NATIVE CORRECTLY ---

jest.mock('react-native', () => {
  return {
    Image: {
      getSize: jest.fn((uri, success) => success(1000, 1000)),
    },
    Platform: { 
      OS: 'ios', 
      select: (objs) => objs.ios 
    },
  };
});

// --- 2. MOCK EXPO LIBRARIES ---
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///mock-cache/',
  getInfoAsync: jest.fn(),
  downloadAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

// Mock Firebase
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

jest.mock('../../config/firebaseConfig', () => ({
  functions: {},
}));

// --- 3. IMPORTS ---
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import { Image } from 'react-native'; 
import { httpsCallable } from 'firebase/functions';

describe('Images Slice', () => {
  let store;

  const createTestStore = (preloadedState = {}) =>
    configureStore({
      reducer: {
        images: imagesReducer,
        auth: (state = { user: { uid: 'test-uid' } }) => state,
      },
      preloadedState: {
        images: {
          avatarUrl: null,
          loading: false,
          error: null,
          cachedUris: {},
          imageDimensions: {},
          originalDimensions: {},
          processing: {},
          ...preloadedState,
        },
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    
    // Reset Image.getSize behavior safely
    // Since we defined it as jest.fn() inside the factory, it is now available here.
    Image.getSize.mockImplementation((uri, success) => success(1000, 1000));
  });

  // ====================================================
  // 1. REDUCERS
  // ====================================================
  describe('Reducers', () => {
    it('should return initial state', () => {
      const state = imagesReducer(undefined, { type: undefined });
      expect(state.loading).toBe(false);
      expect(state.cachedUris).toEqual({});
    });

    it('should clear errors', () => {
      const state = imagesReducer({ error: 'Some Error' }, clearImageError());
      expect(state.error).toBeNull();
    });

    it('should reset avatar', () => {
      const state = imagesReducer({ avatarUrl: 'http://old.jpg' }, resetAvatar());
      expect(state.avatarUrl).toBeNull();
    });
  });

  // ====================================================
  // 2. THUNK: processAndCacheImage
  // ====================================================
  describe('processAndCacheImage', () => {
    const remoteUri = 'https://example.com/image.jpg';
    const resizeOptions = { width: 100, height: 100 };

    it('returns null immediately if input is empty', async () => {
      const result = await store.dispatch(processAndCacheImage(null));
      expect(result.payload).toBeNull();
    });

    it('returns existing cached data from Redux state (Cache Hit - RAM)', async () => {
      store = createTestStore({
        cachedUris: { [remoteUri]: 'file:///cached/image.jpg' },
        imageDimensions: { [remoteUri]: { width: 50, height: 50 } },
        originalDimensions: { [remoteUri]: { width: 100, height: 100 } },
      });

      const result = await store.dispatch(processAndCacheImage(remoteUri));

      expect(result.payload).toEqual({
        originalUri: remoteUri,
        cachedUri: 'file:///cached/image.jpg',
        finalDimensions: { width: 50, height: 50 },
        originalDimensions: { width: 100, height: 100 },
      });
      // Ensure we didn't call the native method
      expect(Image.getSize).not.toHaveBeenCalled();
    });

    it('returns existing file from disk if present (Cache Hit - Disk)', async () => {
      // 1. Mock Size
      Image.getSize.mockImplementation((uri, success) => success(800, 600));
      // 2. Mock Crypto Hash
      Crypto.digestStringAsync.mockResolvedValue('hashed_filename');
      // 3. Mock FileSystem: File EXISTS
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true, uri: 'file:///disk/hash.jpg' });

      const result = await store.dispatch(processAndCacheImage({ remoteUri, resizeOptions }));

      // Should return disk info
      expect(result.payload.cachedUri).toBe('file:///disk/hash.jpg');
      expect(result.payload.originalDimensions).toEqual({ width: 800, height: 600 });
      expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
    });

    it('downloads and processes image if not cached (Cache Miss)', async () => {
      Image.getSize.mockImplementation((uri, success) => success(1000, 1000));
      Crypto.digestStringAsync.mockResolvedValue('new_hash');
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      
      FileSystem.downloadAsync.mockResolvedValue({ status: 200, uri: 'file:///temp.jpg' });
      
      ImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'file:///manipulated.jpg',
        width: 100,
        height: 100,
      });

      const result = await store.dispatch(processAndCacheImage({ remoteUri, resizeOptions }));

      expect(FileSystem.downloadAsync).toHaveBeenCalled();
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: 'file:///manipulated.jpg',
        to: expect.stringContaining('new_hash.jpg'),
      });
      expect(FileSystem.deleteAsync).toHaveBeenCalled(); 

      const state = store.getState().images;
      expect(state.cachedUris[remoteUri]).toContain('new_hash.jpg');
    });

    it('handles download failure', async () => {
      Image.getSize.mockImplementation((uri, success) => success(100, 100));
      Crypto.digestStringAsync.mockResolvedValue('hash');
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      
      // Mock 404 Error
      FileSystem.downloadAsync.mockResolvedValue({ status: 404 });

      const result = await store.dispatch(processAndCacheImage(remoteUri));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload.error).toContain('Download failed: 404');
    });
  });

  // ====================================================
  // 3. THUNK: fetchAvatarUrl
  // ====================================================
  describe('fetchAvatarUrl', () => {
    it('fetches url successfully', async () => {
      const mockCallable = jest.fn().mockResolvedValue({ data: { avatarUrl: 'http://avatar.png' } });
      httpsCallable.mockReturnValue(mockCallable);

      await store.dispatch(fetchAvatarUrl());

      const state = store.getState().images;
      expect(state.avatarUrl).toBe('http://avatar.png');
      expect(state.loading).toBe(false);
    });

    it('handles backend error', async () => {
      const mockCallable = jest.fn().mockRejectedValue(new Error('Backend Error'));
      httpsCallable.mockReturnValue(mockCallable);

      await store.dispatch(fetchAvatarUrl());

      const state = store.getState().images;
      expect(state.error).toBe('Backend Error');
      expect(state.loading).toBe(false);
    });
  });

  // ====================================================
  // 4. THUNK: uploadImage
  // ====================================================
  describe('uploadImage', () => {
    // Polyfill FileReader for this test suite only
    beforeAll(() => {
      global.FileReader = class {
        readAsDataURL() {
          this.result = 'data:image/jpeg;base64,MOCK_BASE64_STRING';
          this.onload();
        }
      };
    });

    afterAll(() => {
      delete global.FileReader;
    });

    it('uploads image successfully', async () => {
      const mockCallable = jest.fn().mockResolvedValue({ data: { avatarUrl: 'http://new-avatar.png' } });
      httpsCallable.mockReturnValue(mockCallable);

      const mockBlob = {}; 

      await store.dispatch(uploadImage(mockBlob));

      const state = store.getState().images;
      expect(state.avatarUrl).toBe('http://new-avatar.png');
      expect(state.loading).toBe(false);

      expect(mockCallable).toHaveBeenCalledWith({ imageBase64: 'MOCK_BASE64_STRING' });
    });

    it('handles upload failure', async () => {
      const mockCallable = jest.fn().mockRejectedValue(new Error('Upload Failed'));
      httpsCallable.mockReturnValue(mockCallable);

      await store.dispatch(uploadImage({}));

      const state = store.getState().images;
      expect(state.error).toBe('Upload Failed');
    });
  });
});