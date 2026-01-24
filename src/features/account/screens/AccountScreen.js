// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router'; 


// Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountSettings, updateAccountField } from '../../../redux/slices/accountSlice';
import { updateField, fetchProfilesAndPrecache } from '../../../redux/slices/profiles.slice';
import { clearError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import SettingsLink from '../../../ui/common/SettingsLink';
import SettingsSwitch from '../../../ui/common/SettingsSwitch';
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import SignOut from '../../../ui/common/SignOutButton';

// Assets
const splashScreen = require('../../../../assets/splashscreen2.png');

/**
 * AccountScreen
 * * The central management hub for user-specific configurations, privacy controls, and app preferences.
 * * Functionality:
 * - Orchestrates the retrieval and synchronization of user settings via `fetchAccountSettings` on mount.
 * - Employs a dual-dispatch pattern for privacy toggles (Profile Visibility, Online Status) to ensure consistency between local account settings and public-facing search profiles.
 * - Implements logic-driven precaching; specifically triggering a profile re-fetch and cache update when 'Profile Visibility' is toggled to ensure immediate search result accuracy.
 * - Supports optimistic UI updates for setting switches, providing instant tactile feedback while backend Cloud Functions process the changes.
 * - Acts as a navigational router to sensitive sub-screens, including Profile Editing and the "Danger Zone" account deletion flow.
 * - Displays a non-intrusive error handling system via a global ErrorBanner that responds to failed settings updates or network timeouts.
 * - Houses the application's primary Sign-Out mechanism and current version metadata for support diagnostics.
 * * Purpose:
 * Provides a highly organized, secure environment for users to customize their Med Alliance experience, manage their digital footprint, and govern their accessibility within the community.
 */

const AccountScreen = () => {
  // Expo Variables
  const router = useRouter(); 

  // Redux Variables and State ----
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); 
  const { settings } = useSelector((state) => state.account);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  // --- Derived State Variables ---
  const isLoading = activeRequests > 0 || !settings;
  
  // --- useEffects ---
  useEffect(() => {
    dispatch(fetchAccountSettings());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // --- Handlers ---
  const handleToggle = (key, value) => {
      dispatch(updateAccountField({ key, value }));

      if (user?.uid) {
        if (key === 'profileVisible' || key === 'online') {
          dispatch(updateField({ uid: user.uid, key, value }));

          if (key === 'profileVisible') {
            const timer = setTimeout(() => {
              dispatch(fetchProfilesAndPrecache());
            }, 1000);
            return () => clearTimeout(timer);
          }
        }
      }
  };

  // --- Loading State --- 
  if (isLoading) {
    return (
      <ImageBackground
        style={styles.spinnerContainer}
        source={splashScreen}
        resizeMode='contain'
        accessible={true}
        accessibilityLabel="Loading account settings"
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </ImageBackground>
    );
  };

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      {
        globalError && (
          <ErrorBanner 
            message={globalError}
            onDismiss={() => dispatch(clearError())}
            testID='error-banner'
          />
        )
      }
      <LinearGradient
        colors={['#126DA6', '#1EC6D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
      {/* Account Title View*/}
        <Text style={styles.headerTitle}>Account Preferences</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Section: Account Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <SettingsLink
              label="Edit Profile"
              icon="user-pen"
              testID="edit-profile-link"
              onPress={() => router.push('/profile-settings')} 
            />
            <SettingsLink
              label="Delete Account"
              icon="trash-can"
              danger
              testID="delete-account-link"
              onPress={() => router.push('/delete-account')}
            />
          </View>

          {/* Section: Privacy Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <SettingsSwitch
              label="Profile Visibility"
              value={!!settings?.profileVisible}
              testID="visibility-switch"
              onValueChange={(v) => handleToggle('profileVisible', v)} 
            />
            <SettingsSwitch
              label="Show Online Status"
              value={!!settings?.online}
              testID="online-status-switch"
              onValueChange={(v) => handleToggle('online', v)} 
            />
            { /* Navigates to Privacy Policy  */}
            <SettingsLink label="Data & Privacy" icon="shield-halved" />
          </View>

          {/* Section: UI Preferences */}
          {/* Dark Mode is set to be configured in future updates and is not available at the moment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <SettingsSwitch
              label="Dark Mode"
              value={!!settings?.darkMode}
              testID="dark-mode-switch"
              onValueChange={(v) => handleToggle('darkMode', v)}
            />
            <SettingsLink label="Language" icon="globe" />
            <SettingsLink label="Accessibility" icon="universal-access" />
          </View>

          {/* Section: Support */}
          <View style={styles.section}>
          {/* Support Section is set to be configured in future updates and is not available at the moment */}
            <Text style={styles.sectionTitle}>Support & Growth</Text>
            <SettingsSwitch 
              label="Push Notifications" 
              value={!!settings?.pushNotifications}
              testID="notifications-switch"
              onValueChange={(v) => handleToggle('pushNotifications', v)} 
            />
            <SettingsLink label="Send Feedback" icon="comment-dots" />
            <SettingsLink label="Help Center" icon="circle-question" />
            <SettingsLink label="Rate Med Alliance" icon="star" />
          </View>
          <View
            style={styles.signOutSection}
          >
            <SignOut testID="sign-out-button" />
          </View>
          {/* Application Version display */}
          <Text style={styles.version}>Version 1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({

  // --- Layout and structure ---
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F2' 
  },

  // --- Header / Title ---
  header: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTitle: {
    fontSize: 34,
    color: '#FFFFFF',
    fontFamily: 'LibreFranklin-Bold',
    letterSpacing: 0.5,
  },

  // --- Scrolling container ---
  scroll: { flex: 1, marginTop: -24 },
  content: { paddingHorizontal: 20 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },

  // --- Account Sections ---
  sectionTitle: {
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 18,
    color: '#146EA6',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 10,
    
  },

  // --- Loading State ---
  spinnerContainer: {
    flex: 1, 
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },

  // --- Sign Out Section ---
  signOutSection: {
    marginTop: 10,
    marginBottom: 20,
  },

  // --- Version View ---
  version: {
    textAlign: 'center',
    color: '#0D0D0D',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 50,
    fontFamily: 'Roboto',
  },
});