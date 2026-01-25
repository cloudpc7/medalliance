// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';

// --- Apple Libraries and Modules ---
import * as AppleAuthentication from 'expo-apple-authentication';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { setSignIn } from '../../../redux/slices/auth.slice';
import { setError } from '../../../redux/slices/error.slice'; 
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';

// --- Utility Components ---
import { performAppleSignIn } from '../AppleAuthService'; 

/**
 * AppleSignInButton
 * * A specialized authentication component for iOS devices that provides native Apple Sign-In.
 * * Functionality:
 * - Performs a hardware/OS availability check via `isAvailableAsync` before rendering.
 * - Restricts rendering exclusively to the iOS platform to maintain cross-platform stability.
 * - Delegates complex Firebase OAuth logic to the external `performAppleSignIn` service.
 * - Dispatches the `setSignIn` action to the Redux store upon successful token validation.
 * - Bridges authentication failures to the UI by dispatching to the global Error Slice.
 * - Implements native Apple Human Interface Guidelines (HIG) using the `AppleAuthenticationButton` UI.
 * * Purpose:
 * Provides a secure, one-tap authentication entry point for iOS users, satisfying Apple's 
 * App Store requirements for third-party social login parity.
 */

const AppleSignInButton = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Local State Variables ---
  const [isAvailable, setIsAvailable] = useState(false);

  // --- Redux State Variables ---
  const { activeRequests } = useSelector((state) => state.loading);
  const isLoading = activeRequests > 0;

  useEffect(() => {
    async function checkAvailability() {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAvailable(available);
      } catch (e) {
        setIsAvailable(false);
      }
    }
    checkAvailability();
  }, []);

  const handleAppleAuth = async () => {
    if (isLoading) return;

    try {
      dispatch(startLoading());
      
      const result = await performAppleSignIn();

      if (result.success) {
        dispatch(setSignIn(true));
      }
    } catch (e) {
      const errorMessage = e.message || "An unexpected error occurred during Apple Sign-In.";
      dispatch(setError(errorMessage)); 
    } finally {
      dispatch(stopLoading());
    }
  };

  if (Platform.OS !== 'ios' || !isAvailable) return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={styles.button}
      onPress={handleAppleAuth}
    />
  );
};

export default AppleSignInButton;

const styles = StyleSheet.create({
  button: {
    width: '80%',
    height: 44,
    marginTop: 10,
  },
});