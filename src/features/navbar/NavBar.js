// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Utility Functions ---
import { useNavController } from './useNavController';

/**
 * NavBar
 * * A floating, glassmorphic navigation dock positioned at the bottom of the screen.
 * * Functionality:
 * - Renders a persistent navigation bar using a glassmorphism aesthetic (blur + semi-transparent gradient).
 * - Dynamically positions itself above system UI using safe-area insets.
 * - Gracefully degrades blur intensity on Android for performance.
 * - Utilizes a custom hook (`useNavController`) to abstract navigation icon logic.
 * - Employs a layered UI stack:
 * BlurView → LinearGradient → Icon layout container.
 * * Purpose:
 * Provides a high-visibility, modern navigation interface that remains legible
 * across varied backgrounds without blocking swipe or gesture interactions.
 */
const NavBar = () => {
  const { navIcons } = useNavController();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + 16 }]}
    >
      <BlurView
        intensity={isAndroid ? 20 : 40}
        tint="dark"
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={['rgba(18,109,166,0.75)', 'rgba(30,198,217,0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.inner}>
            {navIcons}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

export default memo(NavBar);

const styles = StyleSheet.create({
  // --- Layout and Positioning ---
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },

  // --- Glassmorphic Containers ---
  blurContainer: {
    width: '90%',
    maxWidth: 360,
    height: 76,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)', 
  },
  gradient: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  // --- Content Alignment ---
  inner: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});