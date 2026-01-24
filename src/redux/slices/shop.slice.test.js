import { configureStore } from '@reduxjs/toolkit';
import shopReducer, {
  fetchStores,
  clearStores
} from './shop.slice';

// ----------------------------------------------------------------
// 1. MOCK FIREBASE DIRECTLY
// ----------------------------------------------------------------
// Instead of mocking the slice (which breaks the reducer),
// we mock the library that the slice calls.
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(), // We will control this in the tests
}));

// We import the mock so we can change its return value in tests
import { httpsCallable } from 'firebase/functions';

// Mock the config just to satisfy imports
jest.mock('../../config/firebaseConfig', () => ({
  functions: {},
}));

describe('shop slice', () => {
  let store;

  const createTestStore = () => {
    return configureStore({
      reducer: { shop: shopReducer },
    });
  };

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // REDUCER TESTS
  // ----------------------------------------------------------------
  it('should handle initial state', () => {
    const state = store.getState().shop;
    expect(state.data).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should clear stores', () => {
    // Setup state with existing data
    const startStore = configureStore({
      reducer: { shop: shopReducer },
      preloadedState: {
        shop: { data: [{ id: 1 }], loading: false, error: 'Old Error' }
      }
    });

    startStore.dispatch(clearStores());

    const state = startStore.getState().shop;
    expect(state.data).toEqual([]);
    expect(state.error).toBeNull();
  });

  // ----------------------------------------------------------------
  // THUNK TESTS
  // ----------------------------------------------------------------
  describe('fetchStores', () => {
    it('should handle pending and fulfilled states', async () => {
      const mockData = [{ id: 'store_1', name: 'MedBook Store' }];
      
      // 1. Setup the Mock
      // httpsCallable returns a FUNCTION that returns a PROMISE
      const mockFunction = jest.fn(() => Promise.resolve({ data: mockData }));
      httpsCallable.mockReturnValue(mockFunction);

      // 2. Dispatch
      const promise = store.dispatch(fetchStores());

      // 3. Check Pending State
      let state = store.getState().shop;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      await promise;

      // 4. Check Fulfilled State
      state = store.getState().shop;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockData);
    });

    it('should handle rejected state', async () => {
      // 1. Setup the Mock to Fail
      const mockFunction = jest.fn(() => Promise.reject(new Error('Firebase Permission Denied')));
      httpsCallable.mockReturnValue(mockFunction);

      // 2. Dispatch
      await store.dispatch(fetchStores());

      // 3. Check Rejected State
      const state = store.getState().shop;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([]);
      expect(state.error).toBe('Firebase Permission Denied');
    });
  });
});