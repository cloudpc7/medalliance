// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Modal, StyleSheet, Text, Pressable, View, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Expo Libraries and Modules ----
import * as Haptics from 'expo-haptics';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { setProfileType, confirmProfile } from '../../../redux/slices/profile.slice';
import { fetchProfileConfig } from '../../../redux/slices/profileConfig.slice';
import { signOutUser } from '../../../redux/slices/auth.slice';
import { setError, clearError } from '../../../redux/slices/error.slice';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';
import {
  fetchColleges, fetchMedicalPrograms, fetchDegrees, fetchOccupations,
  fetchSpecialties, fetchMentoringTypes, fetchFormats
} from '../../../redux/slices/school.slice';

// --- API Utilities ---
import { updateAccount } from '../../../utils/apiUtilities/api';

// --- Custom UI Components ---
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

const ProfileSelectionModal = ({ showModalVisible }) => {
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { profileType } = useSelector((state) => state.profile);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);
  const { userState } = useSelector((state) => state.school);
  const isLoading = activeRequests > 0;

  // --- Handlers ---
  const handleConfirmSelection = async () => {
    dispatch(startLoading());
    try {
      // Haptics feedback (ignore failures)
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      // Persist user profile type to backend
      await updateAccount(profileType);

      // Fetch dynamic config for the selected profile
      await dispatch(fetchProfileConfig(profileType)).unwrap();

      // Unlock the rest of the app
      dispatch(confirmProfile());
      await Promise.all([
        dispatch(fetchMedicalPrograms()).unwrap(),
        dispatch(fetchDegrees()).unwrap(),
        dispatch(fetchColleges()).unwrap(),
        dispatch(fetchMentoringTypes()).unwrap(),
        dispatch(fetchSpecialties()).unwrap(),
        dispatch(fetchOccupations()).unwrap(),
        dispatch(fetchFormats()).unwrap(),
      ])
            

    } catch (error) {
      const msg = error?.message || 'Failed to update profile. Please try again.';
      dispatch(setError(msg));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to go back? You will be signed out.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Sign Out',
          style: 'destructive',
          onPress: () => dispatch(signOutUser()),
        },
      ]
    );
  };

  const isConfirmDisabled = !profileType || isLoading;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={showModalVisible}
      onRequestClose={handleCancel}
      accessible
      accessibilityViewIsModal
    >
      <View style={styles.modalContainer} accessible accessibilityLabel="Profile selection dialog">
        <View style={styles.modalContent} accessible accessibilityViewIsModal>
          {globalError && (
            <ErrorBanner message={globalError} onDismiss={() => dispatch(clearError())} />
          )}

          {/* Titles */}
          <Text style={styles.titleText}>Welcome To</Text>
          <Text style={styles.titleText}>MEDAlliance</Text>
          <Text style={styles.subTitleText}>Are you a Student or a Professor?</Text>

          {/* Profile Selection */}
          <View accessibilityRole="radiogroup" accessibilityLabel="Select your profile type">
            <RadioButton.Group
              onValueChange={(type) => dispatch(setProfileType(type))}
              value={profileType}
            >
              <View style={styles.radioOption}>
                <RadioButton value="students" color="#146EA6" />
                <Text style={styles.radioText}>Student</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="professors" color="#2196F3" />
                <Text style={styles.radioText}>Professor</Text>
              </View>
            </RadioButton.Group>
          </View>

          {/* Confirm Button */}
          <Pressable
            testID="profile-selection-confirm"
            style={[styles.confirmButton, isConfirmDisabled && styles.confirmButtonDisabled]}
            onPress={handleConfirmSelection}
            disabled={isConfirmDisabled}
            accessibilityRole="button"
            accessibilityLabel="Confirm profile selection"
            accessibilityState={{ disabled: isConfirmDisabled, busy: isLoading }}
          >
            <View style={styles.buttonContent}>
              {isLoading ? (
                <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
                  <LoadingSpinner size={24} color="#fff" />
                </Animated.View>
              ) : (
                <Animated.Text
                  style={styles.confirmButtonText}
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(150)}
                >
                  Continue
                </Animated.Text>
              )}
            </View>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            testID="profile-selection-cancel"
            style={styles.closeButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel selection"
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileSelectionModal;

// --- Stylesheet ---
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  titleText: {
    fontFamily: 'AlfaSlabOne',
    fontSize: 24,
    textAlign: 'center',
    color: '#146EA6',
  },
  subTitleText: {
    fontFamily: 'Prompt-Medium',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0D0D0D',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  radioText: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  confirmButton: {
    backgroundColor: '#17A0BF',
    height: 56,
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#A5D8E2',
  },
  confirmButtonText: {
    fontFamily: 'LibreFranklin-Medium',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontFamily: 'Prompt-Regular',
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '600',
  },
});
