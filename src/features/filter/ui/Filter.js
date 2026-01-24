// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';


// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { open } from '../../../redux/slices/filter.slice';

const Filter = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
   // --- Redux Variables and State --- 
  const { openFilter } = useSelector((state) => state.filters);

  // --- Main Render ---
  return (
    <Pressable
      testID="filter-button"
      onPress={() => dispatch(open())}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.wrapperPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Open filters"
      accessibilityHint="Opens the filter options for matching profiles"
    >
      <View style={styles.shadowBox}>
        <BlurView intensity={40} tint="dark" style={styles.blurChip}>
          <LinearGradient
            colors={['rgba(18,109,166,0.85)', 'rgba(30,198,217,0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientChip}
          >
            <FontAwesome6 name="filter" size={18} color="#F9FAFB" />
          </LinearGradient>
        </BlurView>
      </View>
    </Pressable>
  );
};

export default Filter;
const CHIP_HEIGHT = 40;

const styles = StyleSheet.create({
  // --- Layout & Structure --- 
  wrapper: {
    borderRadius: 20,
  },
  wrapperPressed: {
    transform: [{ scale: 0.96 }],
  },
  shadowBox: {
    borderRadius: CHIP_HEIGHT / 2,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },

  //  Glass Effect
  blurChip: {
    borderRadius: CHIP_HEIGHT / 2,
    overflow: 'hidden', 
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  // Color Overlay
  gradientChip: {
    paddingHorizontal: 14,
    height: CHIP_HEIGHT,
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});