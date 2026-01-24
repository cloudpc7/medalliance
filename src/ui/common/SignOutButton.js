// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// --- Custom Utilities ---
import { useSignOut } from '../../utils/Auth/SignOutService'; 

// --- Custom UI Components ---
import LoadingSpinner from './LoadingSpinner';

/**
 * SignOut
 * 
 * A dedicated, prominent sign-out button component for securely ending the user session.
 * 
 * Functionality:
 * - Uses custom useSignOut hook to handle authentication logout logic
 * - Displays "Sign Out" text normally, switching to a loading spinner during sign-out process
 * - Button is fully disabled while loading to prevent multiple taps
 * - Provides visual press feedback (opacity + scale) and red destructive styling
 * - Fully accessible with role, label, and busy/disabled state
 * - Centered full-width layout suitable for settings footers or dedicated logout screens
 * 
 * Purpose:
 * Offers a clear, safe, and visually distinct way for users to log out of their account, typically placed at the bottom of settings or profile screens.
 */

const SignOut = ({ testID }) => {
  // --- Handlers ---
  const { handleSignOut, loading } = useSignOut();

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleSignOut}
        disabled={loading}
        style={({ pressed }) => [
          styles.btn, 
          pressed && styles.btnPressed
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sign out of account"
        accessibilityState={{ busy: loading, disabled: loading }}
        testID={testID}
      >
        {loading ? (
          <LoadingSpinner size="small" color="#142ba1ff" />
        ) : (
          <Text style={styles.btnText}>Sign Out</Text>
        )}
      </Pressable>
    </View>
  );
};

export default SignOut;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  // --- Buttons & Actions ---
  btn: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LibreFranklin-Bold',
  },
});