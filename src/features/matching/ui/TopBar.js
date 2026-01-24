// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router';

// Redux State Management ---
import {  useSelector } from 'react-redux';

// --- Custom UI Components ---
import Avatar from '../../profile/ui/Avatar';
import Filter from '../../filter/ui/Filter';

/**
 * TopBar
 * 
 * A floating header overlay at the top of the MatchingScreen for quick access to user profile and filters.
 * 
 * Functionality:
 * - Positions itself absolutely at the top with safe area insets to avoid overlapping the status bar
 * - Uses `pointerEvents="box-none"` so swipes on the card deck pass through the empty space
 * - Displays the user's Avatar (clickable to upload/edit profile)
 * - Includes the Filter button to open the filter modal
 * 
 * Purpose:
 * Provides non-intrusive, always-accessible navigation to profile management and filtering without obstructing the main swipe interface.
 */
const TopBar = () => {
  // --- Hooks ---
  const router = useRouter();
  const {data: myProfile} = useSelector((state) => state.profile);

  // Constant variables 
  const insets = useSafeAreaInsets();

  // --- Handle Functions ---
  const handleAvatarUpload = () => router.push('/profile-upload');

  return (
    <View
      pointerEvents="box-none" 
      style={[styles.container, { paddingTop: insets.top }]} 
    >
      <Avatar onPress={handleAvatarUpload} avatarImage={myProfile?.avatarUrl} /> 
      <Filter />
    </View>
  );
};

export default memo(TopBar);

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 12, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9,
  },
});