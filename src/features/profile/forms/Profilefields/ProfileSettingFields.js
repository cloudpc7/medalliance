// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { forwardRef, useMemo, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Text, Modal, FlatList, Pressable, Keyboard } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { requestAndSetLocation, fetchColleges } from '../../../../redux/slices/school.slice';
import { setShowField, setSearchQuery } from '../../../../redux/slices/profile.slice';
import { clearError } from '../../../../redux/slices/error.slice';

// --- UI Custom Components ---
import LoadingSpinner from '../../../../ui/common/LoadingSpinner';
import ErrorBanner from '../../../../utils/errors/ErrorBanner';

/**
 * ProfileField
 * * A flexible form input component used throughout the profile creation and editing flow.
 */

const ProfileField = forwardRef((props, ref) => {
  // --- component properties ---
  const { field, form, isFocused, multiline, label, keyboardType, onBlur, options, isLocationAware, ...rest } = props;

  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux Variables and State ---
  const { userState, locationLoading } = useSelector((state) => state.school);
  const { showField, searchQuery } = useSelector((state) => state.profile);
  const { message: globalError } = useSelector((state) => state.error);
  
  // --- constant variables
  const isFormik = !!field && !!form;
  const value = isFormik ? field.value : props.value;
  const error = isFormik ? (form.touched[field.name] && form.errors[field.name]) : props.error;
  const hasValue = value !== undefined && value !== null && String(value).trim() !== '';

  // --- Memo State ---
  const filteredOptions = useMemo(() => {
    if (!options) return [];
    return options.filter(opt => String(opt).toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  // --- Handlers ---
  const handleSelect = useCallback((item) => {
    if (isFormik) {
      form.setFieldValue(field.name, item, true);
      form.setFieldTouched(field.name, true);
      dispatch(setShowField(false));
      
      // Corrected: Use Keyboard module directly
      Keyboard.dismiss(); 
      
      dispatch(setSearchQuery(''));
      if (onBlur) setTimeout(onBlur, 150);
    }
  }, [isFormik, field?.name, dispatch, onBlur]);

  const handleUseLocation = async () => {
    const resultAction = await dispatch(requestAndSetLocation());
    // Professional check for thunk success using .match()
    if (requestAndSetLocation.fulfilled.match(resultAction)) {
      dispatch(fetchColleges({ state: resultAction.payload }));
    }
  };

  // --- useEffects ---
  useEffect(() => {
    if (!showField) {
      dispatch(clearError());
      dispatch(setSearchQuery(''));
    }
  }, [showField, dispatch]);

  if (options) {
    // Determine if location services should be shown based on hardcoded names OR the isLocationAware prop
    const showLocationUI = isLocationAware || field.name === 'College' || field.name === 'school';

    return (
      <View style={styles.wrapper}>
        <Pressable 
          onPress={() => dispatch(setShowField(true))} 
          style={[styles.inputContainer, styles.focused]}
          accessibilityRole="combobox"
        >
          <View style={styles.pickerTrigger}>
            <Text style={styles.input} numberOfLines={1}>
              {hasValue ? String(value) : `Select ${label}...`}
            </Text>
            <FontAwesome6 name="arrow-down" size={18} color="#126DA6" style={{ marginRight: 12 }} />
          </View>
        </Pressable>

        <Modal 
          visible={showField} 
          animationType="slide" 
          presentationStyle="pageSheet"
          onRequestClose={() => dispatch(setShowField(false))}
        >
          <View style={styles.modalContent}>
            {globalError && (
              <ErrorBanner 
                message={globalError}
                onDismiss={() => dispatch(clearError())}
              />
            )}
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => dispatch(setShowField(false))}>
                <FontAwesome6 name="xmark" size={28} color="#126DA6" />
              </Pressable>
            </View>
            
            {showLocationUI && (
              <Pressable 
                onPress={handleUseLocation} 
                disabled={locationLoading} 
                style={[styles.locationBtn, userState && styles.locationBtnActive]}
                accessibilityRole="button"
              >
                {locationLoading ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <>
                    <FontAwesome6 name="location-dot" size={16} color={userState ? "#fff" : "#126DA6"} />
                    <Text style={[styles.locationBtnText, userState && { color: '#fff' }]}>
                      {userState ? `Showing schools in ${userState}` : "Use current location"}
                    </Text>
                  </>
                )}
              </Pressable>
            )}

            <View style={styles.searchBarWrapper}>
              <FontAwesome6 name="magnifying-glass" size={18} color="#94A3B8" />
              <TextInput 
                style={styles.modalSearch} 
                placeholder="Search..." 
                value={searchQuery} 
                onChangeText={(text) => dispatch(setSearchQuery(text))} // Correctly dispatching text
                autoFocus 
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <Pressable style={styles.optionItem} onPress={() => handleSelect(item)} accessibilityRole="button">
                  <Text style={styles.optionText}>{item}</Text>
                  {String(value) === String(item) && <FontAwesome6 name="circle-check" size={22} color="#126DA6" />}
                </Pressable>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#94A3B8' }}>No results found.</Text>
                </View>
              )}
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.inputContainer, isFocused && styles.focused, error && styles.errorContainer]}>
        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.multiline]}
          {...rest}
          value={value != null ? String(value) : ''}
          onChangeText={(text) => isFormik && form.setFieldValue(field.name, text)}
          onBlur={() => { 
            if (isFormik) form.setFieldTouched(field.name, true); 
            if (onBlur) onBlur(); 
          }}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          keyboardType={keyboardType || 'default'}
        />
      </Animated.View>
      {error && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  inputContainer: { 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    backgroundColor: '#FFFFFF' 
  },
  focused: { borderColor: '#126DA6' },
  input: { 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontSize: 15, 
    color: '#0D0D0D', 
    flex: 1 
  },
  pickerTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  modalContent: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  searchBarWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    marginHorizontal: 20, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  modalSearch: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    fontSize: 16 
  },
  locationBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F0F9FF', 
    marginHorizontal: 20, 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 12, 
    gap: 8, 
    borderWidth: 1, 
    borderColor: '#BAE6FD' 
  },
  locationBtnActive: { 
    backgroundColor: '#126DA6', 
    borderColor: '#126DA6' 
  },
  locationBtnText: { color: '#126DA6', fontWeight: '600' },
  optionItem: { 
    padding: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  optionText: { fontSize: 16, color: '#334155', flex: 1 },
  errorContainer: { borderColor: '#D32F2F' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 4 },
  multiline: { minHeight: 96, paddingTop: 12 },
});

export default ProfileField;