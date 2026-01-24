// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react'; 
import { View, Text, StyleSheet, Pressable } from 'react-native';

// --- Expo Libraries and Modules ---
import { useRouter } from 'expo-router';

// --- Redux Libraries and Modules ---
import { useDispatch, useSelector } from 'react-redux';
import { deleteAccount } from '../../../redux/slices/accountSlice';
import { clearError } from '../../../redux/slices/error.slice';
import { persistor } from '../../../redux/store';

// --- Firebase Libraries and Modules ---
import { auth } from '../../../config/firebaseConfig';
import { signOut } from 'firebase/auth';

// --- Custom UI Components ---
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';
import { setUser } from '../../../redux/slices/auth.slice';

/**
 * DeleteAccountScreen
 * * The final security checkpoint for permanent account termination within the application.
 * * Functionality:
 * - Provides a clear "Danger Zone" interface that outlines exactly what data will be lost upon deletion.
 * - Utilizes a server-side deletion pattern via a Redux-dispatched Cloud Function to bypass client-side "stale session" restrictions.
 * - Triggers a full-screen loading overlay to prevent user interaction while the multi-step purge process is in flight.
 * - Performs a comprehensive cleanup including Firebase local sign-out and Redux-Persist cache purging to ensure no stale data remains on the device.
 * - Handles navigation by forcefully replacing the current route with the Sign-In screen upon successful account removal.
 * - Integrates global error state management to display contextual feedback if the deletion request fails.
 * * Purpose:
 * Serves as a secure and definitive management screen that allows users to exercise their right to be forgotten, ensuring all personal data and authentication records are erased in a single, irreversible flow.
 */

const DeleteAccountScreen = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
  const router = useRouter();

  // --- Redux State Variables ---
  const { user } = useSelector((state) => state.auth);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);
  const isDeleting = activeRequests > 0;

  // --- UseEffects ---
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  // --- Handler functions ---
  const handleDelete = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
      await signOut(auth);
      await persistor.purge();
      dispatch(setUser(null));
      router.replace('/sign-in');
    } catch (error) {
    }
  };

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {globalError && (
        <ErrorBanner 
          message={globalError}
          onDismiss={() => dispatch(clearError())}
        />
      )}
      
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner size={20} color="#146EA6" />
          <Text style={styles.loadingText}>Permanently removing account...</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Account Settings</Text>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText}>Danger zone</Text>
            </View>
          </View>

          <Text style={styles.title}>Delete account</Text>
          <Text style={styles.description}>
            This will permanently remove your Med Alliance account. Once deleted, 
            your account cannot be restored.
          </Text>

          <View style={styles.separator} />

          <View style={styles.buttonGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                isDeleting && styles.disabledButton,
                pressed && !isDeleting && styles.deleteButtonPressed,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete account'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              disabled={isDeleting}
            >
              <Text style={styles.secondaryText}>Keep my account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeleteAccountScreen;

 // --- Layout and structure ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  screenTitle: {
    fontFamily: 'LibreFranklin-Medium',
    fontSize: 20,
    color: '#146EA6',
    marginTop: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 109, 166, 0.08)',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#17A0BF',
    marginRight: 6,
  },
  chipText: {
    fontFamily: 'Prompt-Medium',
    fontSize: 16,
    color: '#146EA6',
  },
  title: {
    fontSize: 24,
    fontFamily: 'LibreFranklin-Bold',
    color: '#0D0D0D',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#0D0D0D',
    lineHeight: 16,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  list: {
    marginBottom: 16,
  },
  listTitle: {
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 18,
    color: '#0D0D0D',
    marginBottom: 4,
  },
  listItem: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#0D0D0D',
    marginBottom: 2,
  },
  buttonGroup: {
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#146EA6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonPressed: {
    backgroundColor: '#0D0D0D',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'LibreFranklin-Medium',
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  secondaryText: {
    fontSize: 16,
    color: '#146EA6',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#0D0D0D',
    fontFamily: 'Roboto',
  },
});