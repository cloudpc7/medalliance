// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, Image, StyleSheet, View, Text } from 'react-native';
import Toast from 'react-native-toast-message';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { signInWithGoogle } from '../../../redux/slices/auth.slice';
import { startLoading,stopLoading } from '../../../redux/slices/loading.slice';

// --- Custom UI Components ---
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

// --- Assets --- 
const GOOGLE_LOGO = require('./android_light_rd_SI.png');

const GoogleSignIn = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

   // --- Redux State Variables ---
  const { activeRequests } = useSelector((state) => state.loading);

  // --- Derived State ---
  const isLoading = activeRequests > 0;

  // --- Handler Functions ---
  const handleSignIn = useCallback(async () => { 
    dispatch(startLoading());
    try {
      await dispatch(signInWithGoogle()).unwrap();
    } catch (error) {
      if (error?.includes('canceled')) return;
    } finally {
      dispatch(stopLoading()); 
    }
  }, [dispatch]);

  return (
    <Pressable 
      onPress={handleSignIn} 
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      accessibilityHint="Creates a new account using your Google account"
    >
      <View style={styles.wrapper}>
        {
          isLoading ? (
            <View style={styles.loadingOverlay}>
              <LoadingSpinner size={20} color="#FFF" />
              <Text style={styles.loadingText}>Signing In...</Text>
            </View>
          ): (
            <Image source={GOOGLE_LOGO} style={styles.img} resizeMode="contain" />
          )
        }
        
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: { alignSelf: 'center', marginTop: 20 },
  wrapper: { width: 240, height: 48, borderRadius: 4, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  pressed: { opacity: 0.7 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  loadingText: {
    color: '#fff',
    marginLeft: 16,
  }
});

export default memo(GoogleSignIn);