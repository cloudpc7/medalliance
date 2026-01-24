// 🔥 Production Ready 
// --- React Core Libraries and Modules ---
import React, { memo, useEffect, useState } from 'react';
import { View, Image, Pressable, StyleSheet, Platform } from 'react-native';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUserProfile } from '../../../redux/slices/profiles.slice';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';
import { setError, clearError } from '../../../redux/slices/error.slice';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Avatar
 * * A reusable avatar component with multiple fallback states and performance optimizations.
 * * Functionality:
 * - Managed State: Uses global Redux slices (loading/error) for all network lifecycles.
 * - Performance: "Lite" mode for lists; Platform-specific blur/shadow degradation.
 * - Defensive: Strict URL string validation to prevent native crashes.
 * - Accessibility: Contextual labeling (Name + Role + Hint) for screen readers.
 * - Cleanup: Auto-clears global errors on unmount to prevent state pollution.
 * - Prefetch & caching for network images.
 * - Local error tracking to persist fallback state.
 */
const Avatar = ({ onPress, size = 64, avatarImage, userName = "User", lite = false }) => {
  const dispatch = useDispatch();
  
  // --- Redux State ---
  const currentProfile = useSelector(selectCurrentUserProfile);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  // --- Local state ---
  const [hasError, setHasError] = useState(false);

  // --- Derived Values & Defensive Checks ---
  const rawUrl = avatarImage || currentProfile?.avatarUrl;
  const isValidUrl = typeof rawUrl === 'string' && rawUrl.trim().startsWith('http');
  const showFallback = hasError || !!globalError || !isValidUrl;
  const isLoading = activeRequests > 0;
  const borderRadius = size / 2;
  const Wrapper = onPress ? Pressable : View;
  const isAndroid = Platform.OS === 'android';

  // --- Effects ---
  // Cleanup stale errors when this component unmounts
  useEffect(() => {
    return () => {
      if (globalError) dispatch(clearError());
    };
  }, [globalError, dispatch]);

  // Prefetch network images for smoother loading
  useEffect(() => {
    if (isValidUrl) {
      Image.prefetch(rawUrl.trim());
      setHasError(false); // reset local error when URL changes
    }
  }, [rawUrl, isValidUrl]);

  // --- Handlers ---
  const handleImageError = () => {
    setHasError(true);
    dispatch(setError(`Failed to load ${userName}'s image`));
  };

  return (
    <Wrapper 
      onPress={onPress} 
      style={{ width: size, height: size, borderRadius }}
      accessibilityRole={onPress ? "button" : "image"}
      accessibilityLabel={`${userName}'s profile picture`}
      accessibilityHint={onPress ? `Double tap to change ${userName}'s profile photo` : ""}
    >
      {/* Shadow only if not lite */}
      <View style={[!lite && styles.shadowBox, { borderRadius }]}>
        
        {/* Platform-specific Blur with lite mode adjustment */}
        <BlurView 
          intensity={lite ? 0 : (isAndroid ? 20 : 40)} 
          tint="dark" 
          style={[styles.blurCircle, { borderRadius, backgroundColor: lite ? 'rgba(15,23,42,1)' : 'rgba(0,0,0,0.2)' }]}
        >
          <LinearGradient
            colors={['rgba(18,109,166,0.85)', 'rgba(30,198,217,0.85)']}
            style={[styles.gradientCircle, { borderRadius }]}
          >
            {/* Render avatar image or fallback */}
            {!showFallback ? (
              <Image
                source={{ uri: rawUrl.trim() }}
                style={[styles.image, { borderRadius }]}
                resizeMode="cover"
                onLoadStart={() => dispatch(startLoading())}
                onLoadEnd={() => dispatch(stopLoading())}
                onError={handleImageError}
              />
            ) : (
              <View style={[styles.fallback, { borderRadius }]}>
                <FontAwesome6 name="camera" size={size * 0.4} color="#F9FAFB" />
              </View>
            )}
          </LinearGradient>
        </BlurView>
      </View>
    </Wrapper>
  );
};

export default memo(Avatar);

const styles = StyleSheet.create({
  // --- Elevation & Shadow ---
  shadowBox: { 
    width: '100%', 
    height: '100%', 
    shadowColor: '#1EC6D9', 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 6, 
    backgroundColor: 'transparent'
  },

  // --- Blur Overlay ---
  blurCircle: { 
    width: '100%', 
    height: '100%', 
    overflow: 'hidden', 
  },

  // --- Gradient Border ---
  gradientCircle: { 
    flex: 1, 
    padding: 2.5 
  },

  // --- Image Display ---
  image: { 
    flex: 1 
  },

  // --- Fallback State ---
  fallback: { 
    flex: 1, 
    backgroundColor: 'rgba(15,23,42,0.8)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  center: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});
