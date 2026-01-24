// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfilesAndPrecache } from '../../../redux/slices/profiles.slice';
import { clearError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import ProfileSwipe from '../ui/ProfileSwipe';
import TopBar from '../ui/TopBar';
import NavBar from '../../navbar/NavBar';
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import ExtendedProfile from '../ui/ExtendedProfileCard';
import FilterModal from '../../filter/screens/FilterModal';
import SearchModal from '../../search/ui/SearchModal';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

/**
 * MatchingScreen
 * 
 * The main screen for discovering and connecting with profiles in the app.
 * 
 * Functionality:
 * - Fetches and precaches profiles on mount via Redux
 * - Conditionally renders:
 *   • Loading state with splash background
 *   • Error banner if profile fetch fails
 *   • ExtendedProfile when a profile is expanded for more details
 *   • ProfileSwipe for normal card-swiping interaction when profiles are available
 *   • Empty state message when no profiles match current filters
 * - Includes TopBar (camera/filter access), FilterModal, SearchModal, and persistent NavBar
 * 
 * Purpose:
 * Serves as the core "matching" hub where users browse, swipe, and interact with potential connections.
 */
const MatchingScreen = () => {

  // --- Hooks ---
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  // --- Redux State ---
  const { user } = useSelector((state) => state.auth);
  const { profiles = [], status } = useSelector((state) => state.profiles);
  const { message: globalError } = useSelector((state) => state.error);
  const { activeRequests } = useSelector((state) => state.loading);

  // Derived loading state
  const isLoading = activeRequests > 0 || status === 'loading';
  
  // --- UseEffects ---
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    if (isMounted) {
      dispatch(clearError());
      dispatch(fetchProfilesAndPrecache());
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, user]);

  // --- Main Render ---
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {globalError && (
        <ErrorBanner 
          message={globalError}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <TopBar />

      <View style={styles.swipeContainer}>
        {isLoading && profiles.length === 0 ? (
          <View style={styles.centerInner}>
            <LoadingSpinner size={32} color="#146EA6" />
            <Text style={styles.loadingText} >Loading Profiles...</Text>
          </View>
        ) : profiles.length > 0 ? (
          <ProfileSwipe />
        ) : (
          !isLoading && status !== 'error' && (
            <View style={styles.centerInner}>
              <Text style={styles.noMatchTitle}>No profiles available yet</Text>
              <Text style={styles.noMatchSubtitle}>
                Try adjusting your filters to see more people!
              </Text>
            </View>
          )
        )}
      </View>
      {profiles.length > 0 && (
        <>
          <ExtendedProfile />
          <FilterModal />
          <SearchModal />
        </>
      )}

      <NavBar />
      <View style={{ height: insets.bottom, backgroundColor: '#FFF' }} />
    </View>
  );
};

export default MatchingScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
  },

  // --- Swiping Container ---
  swipeContainer: {
    flex: 1,
    zIndex: 1,
  },
  centerInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noMatchTitle: {
    fontSize: 18,
    fontFamily: 'LibreFranklin-Medium',
    color: '#0D0D0D',
    textAlign: 'center',
    marginBottom: 6,
  },
  noMatchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'LibreFranklin-Regular'
  },

  // --- Loading State --- 
  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  
  loadingText: {
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  }
});