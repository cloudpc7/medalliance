// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo, useCallback } from 'react';
import { Pressable, Image, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { setChecked, signUpWithGoogle } from '../../../redux/slices/auth.slice';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';

// --- Custom UI Components ---
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

// Google sign up Logo
const GOOGLE_SIGNUP_BUTTON = require('./android_light_rd_SU.png');

// Google Sign Up button provides google Oauth sign up and account verification
const GoogleSignUp = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { checked, status } = useSelector((state) => state.auth);
  const { activeRequests } = useSelector((state) => state.loading);

  // --- Derived State ---
  const isLoading = activeRequests > 0;
 
  // --- Handlers ---
  const handleSignUp = useCallback(async () => {
    dispatch(startLoading());
    try {
      await dispatch(signUpWithGoogle()).unwrap();
      
    } catch (error) {
      if (error?.includes('canceled')) return;
      Toast.show({ type: 'error', text1: 'Sign-In Failed', text2: error });
    } finally {
      dispatch(stopLoading());
      dispatch(setChecked(false));
    }
  }, [dispatch]);

  // --- Main Render ---
  return (
    <Pressable
      onPress={handleSignUp}
      disabled={!checked || isLoading}
      accessibilityRole="button"
      accessibilityLabel="Sign up with Google"
      accessibilityHint="Creates a new account using your Google account"
      style={({ pressed }) => [
        styles.buttonBase,
        pressed && styles.buttonPressed,
        isLoading && styles.buttonDisabled,
      ]}
    >
      <Image
        source={GOOGLE_SIGNUP_BUTTON}
        style={styles.buttonImage}
        resizeMode="contain"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner size={20} color="#FFF" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // --- Button Layout ---
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  // --- Button Content ---
  buttonImage: {
    width: 240,
    height: 48,
  },

  // --- Interaction States ---
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

export default memo(GoogleSignUp);