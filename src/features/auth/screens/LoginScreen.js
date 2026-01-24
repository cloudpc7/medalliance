// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground, View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import { setSignIn } from '../../../redux/slices/auth.slice';
import { clearError } from '../../../redux/slices/error.slice';
// --- Custom UI Components ---
import GoogleSignIn from '../ui/GoogleSignInButton';
import GoogleSignUp from '../ui/GoogleSignUpButton';
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import LinkComponent from '../../../ui/common/LinkingComponent';
import Eula from '../ui/Eula';

// --- Assets & Images ---
const LoginBackground = require('../../../../assets/medjourneyscreen.jpg');

/**
 * LoginScreen
 * 
 * The primary entry screen for user authentication in the app.
 * 
 * Functionality:
 * - Conditionally renders either Google Sign-In (for returning users) or Google Sign-Up + EULA acceptance (for new users)
 * - Uses Redux state (`signIn` and `user`) to determine which flow to show
 * - Provides a toggle link to switch between "Sign In" and "Sign Up" modes
 * - Shows a loading splash screen while authentication state is being determined
 * - Includes footer links (via LinkComponent) for privacy policy and terms
 * - Handles post-logout behavior by forcing "Sign In" mode when needed
 * 
 * Purpose:
 * Serves as the welcoming authentication gateway, guiding new and returning users through secure Google-based login or registration.
 */
const LoginScreen = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { user, signIn, manualSignOut } = useSelector((state) => state.auth);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  // --- Derived State ---
  const isReturning = !!user || signIn;
  const isLoading = activeRequests > 0;

  // --- UseEffects ---
  useEffect(() => {
    if (manualSignOut) {
      dispatch(setSignIn(true));
    }
  }, [manualSignOut, dispatch]);

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      {
        <ErrorBanner 
          message={globalError}
          onDismiss={() => dispatch(clearError())}
        />
      }
      <ImageBackground
        source={LoginBackground}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} pointerEvents="none">
        </View>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Med Alliance</Text>
          </View>
          <View style={styles.buttonContainer}>
            { isReturning && (
              <GoogleSignIn />
            )}
            {
              !isReturning && (
                <>
                  <GoogleSignUp />
                  <Eula />
                </>
              )
            }
            <Pressable 
              onPress={() => dispatch(setSignIn(!signIn))}
              style={styles.toggleContainer}
            >
              <Text style={styles.toggleText}>
                {isReturning 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.footer}>
            <LinkComponent />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: { 
    flex: 1 
  },
  backgroundImage: { 
    flex: 1 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.45)' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'space-between', 
    paddingTop: 90, 
    paddingBottom: 50, 
    paddingHorizontal: 30 
  },

  // --- Header / Title ---
  titleContainer: { 
    alignSelf: 'center' 
  },
  title: { 
    fontFamily: 'AlfaSlabOne-Regular', 
    fontSize: 54, 
    color: '#FFFFFF', 
    textAlign: 'center' 
  },

  // --- Buttons & Actions ---
  buttonContainer: { 
    alignItems: 'center', 
    width: '100%' 
  },
  toggleContainer: {  
    padding: 10,
    justifyContent: 'center',
  },
  toggleText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    textDecorationLine: 'underline' 
  },

  // --- Footer ---
  footer: { 
    alignItems: 'center', 
    justifyContent: 'space-around' 
  },
});