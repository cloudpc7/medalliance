// --- Redux Libraries & Modules ---
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- Expo Libraries and Modules ----
import * as Location from 'expo-location';

// --- API Utilities ---
import {
  callFetchColleges,
  callFetchMedicalPrograms,
  callGetStateFromCoords,
  callFetchOccupations,
  callFetchDegrees,
  callFetchSpecialties,
  callFetchMentoringTypes,
  callFetchFormats,
} from '../../utils/apiUtilities/api';

/**
 * createSchoolThunk
 * * Generates a standardized AsyncThunk for fetching simple lists/data.
 */
const createSchoolThunk = (type, apiCall, unwrap = (res) => res) => {
  return createAsyncThunk(`school/${type}`, async (arg, { rejectWithValue }) => {
    try {
      const response = await apiCall(arg);
      const data = unwrap(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error?.message || `Failed to fetch ${type}.`);
    }
  });
};

/**
 * requestAndSetLocation
 * * Requests device location permissions.
 * * If granted, fetches coordinates and reverse-geocodes them to a US State.
 * * Used for filtering colleges by proximity.
 */
export const requestAndSetLocation = createAsyncThunk(
  'school/requestAndSetLocation',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        dispatch(setPermission('Deny'));
        return rejectWithValue('Location permission denied.');
      }
      
      dispatch(setPermission('Allow'));
      
      const location = await Location.getCurrentPositionAsync({ maximumAge: 60_000 });
      const stateName = await callGetStateFromCoords(
        location.coords.latitude,
        location.coords.longitude
      );
      
      return stateName || '';
    } catch (error) {
      dispatch(setPermission('Deny'));
      return rejectWithValue(error?.message || 'Error fetching location.');
    }
  }
);

/**
 * fetchColleges
 * * Retrieves a list of colleges, optionally filtered by state.
 */
export const fetchColleges = createAsyncThunk(
  'school/fetchColleges',
  async ({ state = '' } = {}, { rejectWithValue }) => {
    try {
      const colleges = await callFetchColleges(state);
      return Array.isArray(colleges) ? colleges : [];
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch colleges.');
    }
  }
);

// --- Generated Thunks ---
// Standard Lists
export const fetchMedicalPrograms = createSchoolThunk('fetchMedicalPrograms', callFetchMedicalPrograms);
export const fetchSpecialties     = createSchoolThunk('fetchSpecialties', callFetchSpecialties);
export const fetchMentoringTypes  = createSchoolThunk('fetchMentoringTypes', callFetchMentoringTypes);
export const fetchFormats         = createSchoolThunk('fetchFormats', callFetchFormats);

// Complex Object Wrappers (Unwrap Logic)
export const fetchDegrees     = createSchoolThunk('fetchDegrees', callFetchDegrees, (r) => r?.degrees || r);
export const fetchOccupations = createSchoolThunk('fetchOccupations', callFetchOccupations, (r) => r?.occupations || r);


// ====================================================================
// 3. INITIAL STATE
// ====================================================================

const initialState = {
  // Location Data
  userState: null,
  permission: 'Unknown',
  locationLoading: false,

  // Resource Data
  colleges: [], 
  programs: [], 
  degrees: [], 
  occupations: [], 
  specialties: [], 
  mentoringTypes: [], 
  formats: [],

  // Loading States
  loadingColleges: false,
  loadingPrograms: false,
  loadingDegrees: false,
  loadingOccupations: false,
  loadingSpecialties: false,
  loadingMentoringTypes: false,
  loadingFormats: false,

  // Error States
  error: null,
  errorDegrees: null,
  errorOccupations: null,
  errorSpecialties: null,
  errorMentoringTypes: null,
  errorFormats: null,
};

// ====================================================================
// 4. HELPER: Reducer Generator
// * Maps thunk lifecycle states (pending, fulfilled, rejected) to Redux state.
// ====================================================================
const addAsyncFlow = (builder, thunk, resourceKey, loadingKey, errorKey = 'error') => {
  builder
    .addCase(thunk.pending, (state) => {
      state[loadingKey] = true;
      if (errorKey === 'error') state.error = null;
      else state[errorKey] = null;
    })
    .addCase(thunk.fulfilled, (state, { payload }) => {
      state[loadingKey] = false;
      state[resourceKey] = payload;
    })
    .addCase(thunk.rejected, (state, { payload }) => {
      state[loadingKey] = false;
      if (errorKey === 'error') state.error = payload;
      else state[errorKey] = payload;
      state[resourceKey] = [];
    });
};

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    // Location Setters
    setUserState(state, action) { state.userState = action.payload; },
    setPermission(state, action) { state.permission = action.payload; },

    // --- New Reducers ---
    clearSchoolError(state) {
      state.error = null;
      state.errorDegrees = null;
      state.errorOccupations = null;
      state.errorSpecialties = null;
      state.errorMentoringTypes = null;
      state.errorFormats = null;
    },
    resetSchoolData(state) {
      state.colleges = [];
      state.programs = [];
      state.degrees = [];
      state.occupations = [];
      state.specialties = [];
      state.mentoringTypes = [];
      state.formats = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestAndSetLocation.fulfilled, (state, { payload }) => {
        state.userState = payload ?? '';
      })
      .addCase(requestAndSetLocation.rejected, (state, { payload }) => {
        state.userState = null;
      });

    // 2. Data Fetching Logic (Generated)
    addAsyncFlow(builder, fetchColleges,        'colleges',       'loadingColleges');
    addAsyncFlow(builder, fetchMedicalPrograms, 'programs',       'loadingPrograms');
    addAsyncFlow(builder, fetchDegrees,         'degrees',        'loadingDegrees',        'errorDegrees');
    addAsyncFlow(builder, fetchOccupations,     'occupations',    'loadingOccupations',    'errorOccupations');
    addAsyncFlow(builder, fetchSpecialties,     'specialties',    'loadingSpecialties',    'errorSpecialties');
    addAsyncFlow(builder, fetchMentoringTypes,  'mentoringTypes', 'loadingMentoringTypes', 'errorMentoringTypes');
    addAsyncFlow(builder, fetchFormats,         'formats',        'loadingFormats',        'errorFormats');
  },
});

export const { 
  setUserState, 
  setPermission, 
  clearSchoolError, 
  resetSchoolData 
} = schoolSlice.actions;

export default schoolSlice.reducer;
