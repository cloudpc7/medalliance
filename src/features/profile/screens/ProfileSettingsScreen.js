// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Expo Libraries and Modules
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// --- Redux State Management ---
import { useSelector } from 'react-redux';


// --- Custom UI Components ---
import Avatar from '../ui/Avatar';
import ProfileSettingsForm from '../forms/ProfileSettingsForm';

/**
 * ProfileSettingsScreen
 * 
 * The dedicated screen for managing and editing a user's profile within the Med Alliance app.
 * 
 * Functionality:
 * - Displays a visually appealing gradient header with the screen title, a descriptive subtitle, and a centrally placed editable Avatar component
 * - The Avatar is pressable, navigating the user to a dedicated '/profile-upload' screen for uploading or changing their profile picture
 * - Pulls the current user's avatar URL from Redux state (state.profile.data.avatarUrl) to display in the Avatar
 * - Embeds the comprehensive ProfileSettingsForm component inside a scrollable, elevated white card that overlaps the header for a modern floating effect
 * - Ensures full-screen safe area handling, custom status bar styling, and smooth scrolling without visible indicators
 * 
 * Purpose:
 * Provides an intuitive, user-friendly interface for users to view and update their personal profile information and avatar, controlling how they appear to others across the Med Alliance platform.
 */

const ProfileSettingsScreen = () => {
  // --- Hooks ---
  const router = useRouter();

  // --- Redux State Variables ---
  const { data: myProfile } = useSelector((state) => state.profile);

  // --- Handlers ---
  const handleAvatarUpload = () => {
    router.push('/profile-upload');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#126DA6" />

      <View style={styles.container}>
        {/* Header Section */}
        <LinearGradient
          colors={['#126DA6', '#1EC6D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>Profile Settings</Text>
            <Text style={styles.subtitle}>Update how others see you in Med Alliance</Text>
            
            <Pressable style={styles.avatarWrapper}>
              <Avatar onPress={handleAvatarUpload} avatarImage={myProfile?.avatarUrl} /> 
            </Pressable>
          </View>
        </LinearGradient>

        {/* Scrollable Form Container */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <ProfileSettingsForm />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileSettingsScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // --- Header Section ---
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    gap: 10,
  },

  // --- Header Typography ---
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0F8FF',
  },

  // --- Avatar Decoration ---
  avatarWrapper: {
    marginTop: 14,
    borderRadius: 999,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // --- Scrollable Content Area ---
  scroll: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // --- Card Container ---
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
});