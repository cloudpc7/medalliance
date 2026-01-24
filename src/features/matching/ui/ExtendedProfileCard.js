// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, BackHandler } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { closeProfile } from '../../../redux/slices/profiles.slice';

// -- UX/UI Custom Components --- 
import ProfileHeader from './ProfileHeader';
import ProfileDetails from './ProfileDetails';

/**
 * ExtendedProfile
 * * A full-screen overlay modal that displays detailed information about a selected user profile.
 */
const ExtendedProfile = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { extendProfile, selectedProfile } = useSelector((state) => state.profiles || {});

  // --- Handlers ---
  const handleClose = () => dispatch(closeProfile());

  // --- UseEffects ---
  useEffect(() => {
    const onBackPress = () => {
      if (extendProfile) {
        handleClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [extendProfile]);

  // --- Render Guard ---
  if (!extendProfile || !selectedProfile) return null;

  // --- Main Render ---
  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Background Overlay */}
      <Animated.View 
        entering={FadeIn.duration(200)} 
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable 
          style={styles.backdrop} 
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close profile overlay"
          pointerEvents="auto"
        />
      </Animated.View>

      {/* Profile Card */}
      <Animated.View 
        entering={ZoomIn.springify().damping(15).stiffness(100)}
        exiting={FadeOut.duration(150)}
        style={styles.cardWrapper}
        accessibilityViewIsModal={true}
        importantForAccessibility="yes"
      >
        <ProfileHeader 
          profile={selectedProfile} 
          onClose={handleClose} 
        />
        <ProfileDetails 
          profile={selectedProfile} 
        />
      </Animated.View>
    </View>
  );
};

export default ExtendedProfile;

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  cardWrapper: {
    width: '92%',
    maxHeight: '88%',
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
});