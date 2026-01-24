// 🔥 Production Ready 
// --- React Core Libraries and Modules ---
import React, { useCallback, memo } from 'react';
import { View, StyleSheet, Pressable, Text, ImageBackground, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- Expo Libraries and Modules ---
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { uploadImage } from '../../../redux/slices/image.slice';
import { clearError, setError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import Avatar from '../ui/Avatar';
import ErrorBanner from '../../../utils/errors/ErrorBanner';

// --- Utilities ---
import { useImagePicker } from '../utils/ImagePickerUtil';

// --- Assets ---
const splashScreen = require('../../../../assets/splashscreen2.png');

/**
 * ProfileUploadScreen
 * * A focused onboarding screen dedicated to selecting and uploading a user profile avatar (photo).
 * * Functionality:
 * - Displays the user's current avatar (if exists) via the reusable Avatar component.
 * - Provides glassmorphic interaction targets (Blur + Gradient) consistent with global branding.
 * - Launches device image picker and dispatches to global image upload thunk.
 * - Shows a full-screen loading splash during upload utilizing global activeRequests.
 * - Displays an error banner if upload fails, consuming from the global error slice.
 * - Clears global errors when screen regains focus.
 * - Includes platform-specific shadow/blur optimizations and full accessibility support.
 * * Purpose:
 * Ensures new users complete the essential step of adding a profile photo during onboarding, 
 * enhancing personalization and trust within the MED Alliance community.
 */

const ProfileUploadScreen = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
  const router = useRouter();
  const { pickImage } = useImagePicker();

  // --- Redux Variables & State ---  
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);
  const userId = useSelector((state) => state.auth.user?.uid);
  const { data: myProfile } = useSelector((state) => state.profile);
  
  // --- Derived State & Constants ---
  const isLoading = activeRequests > 0;
  const isAndroid = Platform.OS === 'android';

  // --- UseEffects --- 
  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
    }, [dispatch])
  );

  // --- Handlers ---
  const handlePickImage = useCallback(async () => {
    if (!userId) {
      dispatch(setError('Authentication required to select an image.'));
      return;
    }

    try {
      const imageBlob = await pickImage();
      
      if (!imageBlob) {
        dispatch(clearError());
        return;
      }

      if (imageBlob.size > 10 * 1024 * 1024) {
        dispatch(setError('Image too large. Please select a photo under 10MB.'));
        return;
      }

      Alert.alert(
        "Upload Photo",
        "Set this as your profile picture?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Upload", 
            onPress: async () => {
              try {
                await dispatch(uploadImage(imageBlob)).unwrap();
                router.replace('/(app)');
              } catch (thunkError) {
              }
            } 
          }
        ]
      );

    } catch (error) {
      dispatch(setError(error.message || 'Failed to process image selection.'));
    }
  }, [pickImage, dispatch, userId, router]);

  // --- Loading State  ---
  if (isLoading) {
    return (
      <ImageBackground
        source={splashScreen}
        style={StyleSheet.absoluteFillObject}
        resizeMode="contain"
      >
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Uploading Image...</Text>
        </View>
      </ImageBackground>
    );
  }

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {globalError && (
        <ErrorBanner
          message={globalError}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <View style={styles.imageContainer}>
        {/* Profile Avatar Display */}
        <View 
            style={styles.avatarWrapper}
            accessibilityRole="image"
            accessibilityLabel="Current profile picture"
        >
          <Avatar onPress={handlePickImage} avatarImage={myProfile?.avatarUrl} />
        </View>

        {/* Glassmorphic Camera Button */}
        <View style={styles.glassWrapper}>
          <BlurView
            intensity={isAndroid ? 25 : 45}
            tint="dark"
            style={styles.blurContainer}
          >
            <LinearGradient
              colors={['rgba(18,109,166,0.75)', 'rgba(30,198,217,0.75)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handlePickImage}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Choose profile photo"
                accessibilityHint="Opens your camera roll or camera to select a picture"
              >
                <FontAwesome6 name="camera" size={54} color="#FFFFFF" />
                <Text style={styles.btnText}>Add a profile image</Text>
              </Pressable>
            </LinearGradient>
          </BlurView>
        </View>
      </View>
    </View>
  );
};

export default memo(ProfileUploadScreen);

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatarWrapper: {
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 100,
    shadowColor: '#1EC6D9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },

  // --- Glassmorphic Styling ---
  glassWrapper: {
    width: '100%',
    alignItems: 'center',
    shadowColor: '#126DA6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  blurContainer: {
    width: '100%',
    maxWidth: 320,
    height: 180,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.05)',
  },
  gradient: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  // --- Buttons & Actions ---
  btn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  btnText: {
    fontFamily: 'LibreFranklin-Medium',
    marginTop: 16,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // --- Loading State ---
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    paddingTop: '18%',
  },
  loadingText: {
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },
});