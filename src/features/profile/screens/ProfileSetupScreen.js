// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Redux State Management ---
import { useSelector } from 'react-redux';

// --- Custom UI Components ---
import ProfileSetupForm from '../forms/ProfileSetupForm';
import ProfileSelectionModal from '../../auth/ui/ProfileSelectionModal';

// --- Assets ---
const splashIcon = require('../../../../assets/splashscreen2.png');

/**
 * ProfileSetupScreen
 * 
 * The onboarding screen displayed after a new user signs in for the first time.
 * 
 * Functionality:
 * - Shows a welcoming header with app logo, "Welcome To MED Alliance" branding, and subtitle
 * - Uses Redux `profileConfirmed` state to conditionally render:
 *   • ProfileSelectionModal – if the user has not yet chosen Student/Professor role
 *   • ProfileSetupForm – once role is selected, for completing detailed profile information
 * - Provides a clean, curved white card layout for the form/modal content
 * 
 * Purpose:
 * Guides new users through the mandatory initial setup (role selection + profile completion) before accessing the main app.
 */

const ProfileSetupScreen = () => {
  // --- Redux Variables and State ---
  const { profileConfirmed } = useSelector((state) => state.profile);
  const showModalVisible = !profileConfirmed;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={splashIcon}
          style={styles.icon}
          resizeMode="contain"
        />
        
        <View style={styles.titleWrapper}>
          <Text style={styles.welcomeText}>Welcome To</Text>
          <Text style={styles.brandText}>MED Alliance</Text>
        </View>
        <Text style={styles.subtitle}>Let's get to know you!</Text>
      </View>
      <View style={styles.content}>
        {showModalVisible ? (
          <ProfileSelectionModal />
        ) : (
          <ProfileSetupForm />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },

  // --- Header Section ---
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // --- Header Typography ---
  welcomeText: {
    fontSize: 30,
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    width: '100%',
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#126DA6',
    fontFamily: 'AlfaSlabOne',
    letterSpacing: 1,
    marginTop: -6,
  },
  subtitle: {
    fontSize: 20,
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Medium',
    textAlign: 'center',
  },

  // --- Content Area ---
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    marginTop: -20,
  },
});