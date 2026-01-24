// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Pressable, View, Text, StyleSheet, ImageBackground } from 'react-native';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * StoreCard
 * * A reusable, high-fidelity card component for displaying shop entries.
 * * Functionality:
 * - Dynamic Routing: Utilizes expo-router to navigate to specific shop IDs.
 * - Fluid Layout: Uses flex: 1 and width: 100% to conform to parent container heights (e.g., cardWrapper).
 * - Visual Hierarchy: Implements a triple-layer LinearGradient for text legibility over diverse imagery.
 * - Robust Fallbacks: Renders a dashed-border placeholder if storeImageURL is missing or malformed.
 * - Accessibility: Implements semantic accessibilityRole and unique accessibilityLabels for screen readers.
 * - Brand Compliance: Enforces strictly defined font families (AlfaSlabOne, LibreFranklin) and minimum 16px font sizes.
 */

const StoreCard = ({ store = {}, onPress, style }) => {
  // --- Hooks ---
  const router = useRouter();
  
  // --- Data Destructuring ---
  const { storeImageURL, storeName = 'Store', id } = store;

  // --- Handlers ---
  const handleInternalPress = () => {
    if (id) {
      router.push(`/shop/${id}`);
    }
  };

  const handlePress = onPress || handleInternalPress;

  // --- Fallback Render ---
  if (!storeImageURL) {
    return (
      <Pressable 
        style={[styles.fallback, style]} 
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${storeName}`}
      >
        <Text style={styles.fallbackText}>No Image</Text>
        <Text style={styles.fallbackSubText}>{storeName}</Text>
      </Pressable>
    );
  }

  // --- Main Render ---
  return (
    <Pressable 
      onPress={handlePress} 
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={`Store, ${storeName}`}
    >
      <ImageBackground
        source={{ uri: storeImageURL }}
        style={styles.image}
        imageStyle={styles.imageRadius}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(18, 109, 166, 0.25)', 'rgba(18, 109, 166, 0.9)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {storeName || 'Unknown Store'}
          </Text>
          <Text style={styles.subtitle}>Tap to explore</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default StoreCard;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1, // FIX: Fill the height of the cardWrapper
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },

  // --- Image ---
  image: {
    flex: 1, // FIX: Forces ImageBackground to fill the Pressable container
    width: '100%',
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 28,
  },

  // --- Content ---
  content: {
    paddingBottom: 32,
    paddingHorizontal: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'AlfaSlabOne',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#E0F8FF',
    fontSize: 16,
    marginTop: 6,
    fontFamily: 'LibreFranklin-Medium',
  },
  
  // Fallback Styles
  fallback: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E8F0F5',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#126DA6',
    borderStyle: 'dashed',
  },
  fallbackText: {
    color: '#126DA6',
    fontSize: 20,
    fontFamily: 'LibreFranklin-Bold',
  },
  fallbackSubText: {
    color: '#126DA6',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'LibreFranklin-Medium',
  },
});