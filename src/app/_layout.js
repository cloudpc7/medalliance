// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// --- Expo Libraries and Modules ----
import { Stack, useRouter, useSegments } from 'expo-router';

// --- Stream Libraries and Modules ---
import { StreamChat } from 'stream-chat';

// --- Firebase Libraries and Modules ---
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebaseConfig';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// --- Redux State Management ---
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { setInitialized, setUser, setProfileSetupComplete } from '../redux/slices/auth.slice';
import { confirmProfile, setProfile } from '../redux/slices/profile.slice';
import { startLoading, stopLoading } from '../redux/slices/loading.slice';
import { setError } from '../redux/slices/error.slice';

// --- Custom UI Components ---
import ErrorBoundary from '../ui/common/ErrorBoundary';

// --- Utility Components ---
import { useAppFonts } from '../utils/fontsandicons/Fonts';
import { callGetUserProfile } from '../utils/apiUtilities/api';

/**
 * RootNavigator
 * * Manages the top-level navigation stack and coordinates authentication state with Redux.
 * * This component is responsible for initiating the Firebase session listener.
 * * It relies on Expo Router's Stack.Protected feature for route guarding.
 */


// --- Stream Api connection and key ---
// --- proivdes a stream connection, creates a connection for existing users after sign in
const STREAM_API_KEY = 'y94exy6zqfet';
const client = StreamChat.getInstance(STREAM_API_KEY);

const RootNavigator = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  // --- Redux State ---
  const { user, initialized, profileSetupComplete } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);
  const isLoading = activeRequests > 0;
  
  useEffect(() => {

    if (!initialized) {
        dispatch(setUser(null));
        dispatch(setProfile(null));
        dispatch(setProfileSetupComplete('pending'));
        dispatch(stopLoading());
    };

    const subscriber = onAuthStateChanged(auth, async (authorizedUser) => {
      dispatch(setInitialized(true));
      if (authorizedUser) {
        dispatch(startLoading());
        dispatch(setUser(authorizedUser.toJSON()));

        try {
          const profile = await callGetUserProfile();
          dispatch((setProfile(profile)));
          dispatch(setProfileSetupComplete(profile?.status));

          if (profile && profile.status === 'complete') {
            dispatch(confirmProfile())
          }

        } catch (error) {
          dispatch(setError(error?.message || 'Unable to retrieve user credentials.'));
        } finally {
          dispatch(stopLoading());
        }
      } 
    });

    return () => subscriber;
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;
    const currentSegment = segments[0];
    if(!user) {
      if(currentSegment !== 'sign-in') {
        router.replace('/sign-in');
      }
      return;
    }

    if (user && profileSetupComplete === 'pending') {
      if (currentSegment !== 'profile-setup') {
        router.replace('/profile-setup');
      }
      return;
    };

    if (user && profileSetupComplete === 'complete') {
      if (currentSegment !== '(app)') {
        router.replace('/(app)');
      };
    }
    return;
  },[user, profileSetupComplete, isLoading, segments]);

  const authorizationGuard = (state) => {
    if (!user || profileSetupComplete === 'pending' || isLoading || globalError) return false;
    return true;
  };

  const routingGuard = (state) => {
    if(!user || isLoading || globalError) return false;
    if(user && profileSetupComplete === 'pending' && !isLoading && !globalError) return true;
  }

  // --- UseEffects ---
  /**
   * Effect: Authentication Listener Setup
   * * Subscribes to Firebase Auth state changes (`onAuthStateChanged`).
   * * This listener fetches the user's profile and updates the global Redux state (auth, profile)
   * * to determine the user's ultimate access level (unauthenticated, pending setup, complete).
   */

  useEffect(() => {
    // Provides a connection to stream chat after user has successfully sign in to application with a profile and account
    const connectStreamUser = async () => {
      if (user?.uid && !client.userID) {
        try { 
          const getStreamToken = httpsCallable(functions, 'getStreamUserToken');
          const result = await getStreamToken();  
          if (result.data?.token) {
            await client.connectUser(
              { id: user.uid }, 
              result.data.token
            );
          }
        } catch (error) {
          throw new Error( error?.message || 'Stream sync pending auth completion...');
        }
      }
    };

    connectStreamUser();
    return () => {
      if (!user && client.userID) {
        client.disconnectUser();
      }
    };
  }, [user?.uid]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      {/* PUBLIC ROUTES — Available regardless of authentication status */}
      <Stack.Screen name="sign-in" />

      <Stack.Protected guard={routingGuard}>
        <Stack.Screen name="profile-setup" />
      </Stack.Protected>
      

      {/* PROTECTED ROUTES — (app) group — GUARDED */}
      <Stack.Protected guard={authorizationGuard}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
};

/**
 * RootLayout
 * * The main entry point for the entire application wrapper.
 * * It sets up global context providers essential for the app's functionality.
 */
const RootLayout = () => {
  const fontsLoaded = useAppFonts();
  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <ErrorBoundary>
                <RootNavigator />
                <Toast />
            </ErrorBoundary>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default RootLayout;