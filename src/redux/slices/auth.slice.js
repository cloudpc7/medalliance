import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signOut as nativeSignOut } from 'react-native-credentials-manager';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { performGoogleSignIn, performGoogleSignUp } from '../../features/auth/GoogleAuthService';

export const markProfileComplete = createAsyncThunk('auth/markProfileComplete', async () => true);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await performGoogleSignIn();
      if (result.success && result.user) {
        return result.user.toJSON(); 
      }
      return rejectWithValue(result.message || 'Authorization failure.');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpWithGoogle = createAsyncThunk(
  'auth/signUpWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await performGoogleSignUp();
      if (result.success && result.user) {
        return result.user.toJSON(); 
      }
      return rejectWithValue(result.message || 'Authorization failure.');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const signOutUser = createAsyncThunk('auth/signOutUser', async (_, { rejectWithValue }) => {
  try { 
    await signOut(auth); 
    await nativeSignOut(); 
    return null; 
  } catch (error) { 
    return rejectWithValue(error.message || 'Unexpected error occured while signing out.'); 
  }
});

const initialState = {
  initialized: false,
  user: null,
  profileSetupComplete: 'pending',
  signIn: true,
  checked: false,
  manualSignOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setSignIn: (state, action) => { state.signIn = action.payload; },
    setProfileSetupComplete: (state, action) => { state.profileSetupComplete = action.payload; },
    setChecked: (state, action) => { state.checked = action.payload; },
    setInitialized: (state, action) => { state.initialized = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state) => {
        state.user = null;
      })
      .addCase(signUpWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(signUpWithGoogle.rejected, (state, action) => {
        state.user = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.manualSignOut = true;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.user = null;
        state.manualSignOut = false;
      });
  },
});

export const { setUser, setSignIn, setProfileSetupComplete, setChecked, setInitialized } = authSlice.actions;
export default authSlice.reducer;