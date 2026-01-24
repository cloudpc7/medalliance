import { configureStore } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import schoolReducer, {
  requestAndSetLocation,
  fetchColleges,
  fetchDegrees,
  setPermission,
  clearSchoolError,
  setUserState
} from './school.slice';

// ----------------------------------------------------------------
// 1. MOCK THE API UTILITIES LOCALLY
// ----------------------------------------------------------------
// We must mock this HERE so that the imports below become Jest functions.
// If we don't do this, 'callFetchColleges' is the REAL function, which
// doesn't have .mockResolvedValue().
jest.mock('../../utils/apiUtilities/api', () => ({
  callFetchColleges: jest.fn(),
  callFetchDegrees: jest.fn(),
  callGetStateFromCoords: jest.fn(),
  callFetchMedicalPrograms: jest.fn(),
  callFetchOccupations: jest.fn(),
  callFetchSpecialties: jest.fn(),
  callFetchMentoringTypes: jest.fn(),
  callFetchFormats: jest.fn(),
}));

import {
  callFetchColleges,
  callFetchDegrees,
  callGetStateFromCoords
} from '../../utils/apiUtilities/api';

// ----------------------------------------------------------------
// 2. MOCK EXPO LOCATION (If not already in global.mocks.js)
// ----------------------------------------------------------------
// It is safe to keep this here to ensure specific return values for these tests
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe('school slice', () => {
  let store;

  // Helper to create a fresh store before every test
  const createTestStore = () => {
    return configureStore({
      reducer: {
        school: schoolReducer,
      },
    });
  };

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks(); // Clear call history and return values
  });

  // ----------------------------------------------------------------
  // TEST: Initial State
  // ----------------------------------------------------------------
  it('should handle initial state', () => {
    const state = store.getState().school;
    expect(state.colleges).toEqual([]);
    expect(state.loadingColleges).toBe(false);
    expect(state.error).toBeNull();
    expect(state.userState).toBeNull();
  });

  // ----------------------------------------------------------------
  // TEST: Standard Thunk (fetchColleges)
  // ----------------------------------------------------------------
  describe('fetchColleges', () => {
    it('should handle pending and fulfilled states', async () => {
      // Setup Mock
      const mockColleges = ['Harvard', 'Stanford'];
      callFetchColleges.mockResolvedValue(mockColleges);

      // Dispatch
      const promise = store.dispatch(fetchColleges({ state: 'CA' }));
      
      // Check Pending State
      let state = store.getState().school;
      expect(state.loadingColleges).toBe(true);
      expect(state.error).toBeNull(); // Colleges use the generic 'error' key

      // Await completion
      await promise;

      // Check Fulfilled State
      state = store.getState().school;
      expect(state.loadingColleges).toBe(false);
      expect(state.colleges).toEqual(mockColleges);
      expect(callFetchColleges).toHaveBeenCalledWith('CA');
    });

    it('should handle rejected state', async () => {
      // Setup Mock Error
      callFetchColleges.mockRejectedValue(new Error('Network Error'));

      // Dispatch
      await store.dispatch(fetchColleges());

      const state = store.getState().school;
      expect(state.loadingColleges).toBe(false);
      expect(state.colleges).toEqual([]); 
      // Note: In your slice, fetchColleges writes to state.error, not state.errorColleges
      expect(state.error).toContain('Network Error');
    });
  });

  // ----------------------------------------------------------------
  // TEST: Thunk with "Unwrap" Logic (fetchDegrees)
  // ----------------------------------------------------------------
  describe('fetchDegrees (Unwrap Logic)', () => {
    it('should unwrap object response { degrees: [...] } to array', async () => {
      // Simulate API returning an object
      const mockResponse = { degrees: ['MD', 'DO'] };
      callFetchDegrees.mockResolvedValue(mockResponse);

      await store.dispatch(fetchDegrees());

      const state = store.getState().school;
      expect(state.degrees).toEqual(['MD', 'DO']); 
      expect(state.loadingDegrees).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // TEST: Custom Location Thunk (requestAndSetLocation)
  // ----------------------------------------------------------------
  describe('requestAndSetLocation', () => {
    it('should update permission to Deny if location access is refused', async () => {
      // Mock Permission Denied
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      await store.dispatch(requestAndSetLocation());

      const state = store.getState().school;
      expect(state.permission).toBe('Deny');
      expect(state.error).toContain('Location permission denied');
    });

    it('should set userState if location is granted and coords are valid', async () => {
      // Mock Permission Granted
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      // Mock Coordinates
      Location.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 34.05, longitude: -118.25 }
      });
      // Mock Geocoding API
      callGetStateFromCoords.mockResolvedValue('California');

      await store.dispatch(requestAndSetLocation());

      const state = store.getState().school;
      expect(state.permission).toBe('Allow');
      expect(state.userState).toBe('California');
      expect(state.error).toBeNull();
    });

    it('should handle API errors during geocoding', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.getCurrentPositionAsync.mockResolvedValue({ coords: { lat: 0, long: 0 } });
      
      // Fail the geocode call
      callGetStateFromCoords.mockRejectedValue(new Error('Geocode failed'));

      await store.dispatch(requestAndSetLocation());

      const state = store.getState().school;
      expect(state.permission).toBe('Deny'); 
      expect(state.error).toBe('Geocode failed');
    });
  });

  // ----------------------------------------------------------------
  // TEST: Synchronous Reducers
  // ----------------------------------------------------------------
  describe('Reducers', () => {
    it('should clear all errors with clearSchoolError', () => {
      // 1. Manually set some error states to simulate a failed app state
      
      // College Error (writes to generic state.error)
      store.dispatch({ 
        type: fetchColleges.rejected.type, 
        payload: 'College Generic Error' 
      });
      
      // Degree Error (writes to state.errorDegrees)
      store.dispatch({ 
        type: fetchDegrees.rejected.type, 
        payload: 'Degree Specific Error' 
      });

      // Verify errors exist
      let state = store.getState().school;
      
      // FIX: Your slice puts college errors in state.error, NOT state.errorColleges
      expect(state.error).toBeTruthy(); 
      expect(state.errorDegrees).toBeTruthy();
      
      // 2. Clear Errors
      store.dispatch(clearSchoolError());
      
      state = store.getState().school;
      expect(state.errorDegrees).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should manually set user state', () => {
      store.dispatch(setUserState('New York'));
      expect(store.getState().school.userState).toBe('New York');
    });
  });
});