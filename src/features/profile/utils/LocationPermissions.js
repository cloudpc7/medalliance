import React, { useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { requestAndSetLocation, clearSchoolError } from '../../../redux/slices/school.slice';
import { clearError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import ErrorText from '../../../utils/errors/ErrorText';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

/**
 * LocationPrompt
 * * A conditional banner component that prompts the user to grant location permissions.
 * * Functionality:
 * - Synchronizes with global loading slice (activeRequests) for network/GPS feedback.
 * - Consumes global error slice to display permission or geolocation failures.
 * - Automatically dismisses ONLY when loading is finished AND userState is resolved.
 * - Prevents multiple concurrent requests via global loading guards.
 */

const LocationPrompt = () => {
  // --- 1. Hooks (MUST stay at the top in this order to prevent React errors) ---
  const dispatch = useDispatch();
  
  const { permission, userState } = useSelector((state) => state.school);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  // Derived State
  const isLoading = activeRequests > 0;
  const buttonText = 'Allow Location for Local Schools';
  const subText = userState 
    ? `Filtering by: ${userState}` 
    : '(Showing all schools nationwide)';

  // --- 2. Handlers ---
  const handleLocationAction = useCallback(() => {
    if (isLoading) return;
    
    dispatch(clearSchoolError());
    if (globalError) {
      dispatch(clearError());
    }
    
    dispatch(requestAndSetLocation());
  }, [dispatch, isLoading, globalError]);

  // --- 3. Conditional Returns (MUST stay below all Hooks) ---
  
  // Logic: Automatically dismisses when permission is 'Allow' and state is resolved
  if (!isLoading && userState && permission === 'Allow') {
    return null;
  }

  // --- 4. Main Render ---
  return (
    <View style={styles.container}>
      <View style={styles.innerCard}>
        
        {globalError && (
          <View style={styles.errorWrapper}>
            <ErrorText message={globalError} />
          </View>
        )}

        <Pressable
          testID="location-permission-button"
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLocationAction}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={buttonText}
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <LoadingSpinner size="20" color="#FFFFFF" />
              <Text style={styles.buttonText}> Locating...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>{buttonText}</Text>
          )}
        </Pressable>

        <Text style={styles.subText}>{subText}</Text>
      </View>
    </View>
  );
};

export default memo(LocationPrompt);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  innerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorWrapper: {
    marginBottom: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#146EA6',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
  },
  buttonDisabled: {
    backgroundColor: '#A5D8E2',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'LibreFranklin-Medium',
    fontSize: 16,
  },
  subText: {
    marginTop: 12,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#146EA6',
    textAlign: 'center',
  },
});