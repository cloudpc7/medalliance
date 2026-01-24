// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../../../../redux/slices/error.slice';

// --- Custom UI Components ---
import LoadingSpinner from '../../../../ui/common/LoadingSpinner';
import ErrorText from '../../../../utils/errors/ErrorText';

/**
 * OccupationPicker
 * * A Formik-integrated dropdown component for selecting professional occupations.
 * * Functionality:
 * - Wraps the `@react-native-picker/picker` within a styled container to maintain visual consistency with standard text inputs.
 * - Connects to Redux to consume a global list of occupations, implementing specialized guards for loading and error states.
 * - Direct-binds to Formik state, updating the field value immediately upon selection and providing real-time validation feedback.
 * - Features platform-specific optimizations, such as the `prompt` prop for Android selection dialogs and `overflow: hidden` to preserve rounded aesthetics.
 * * Purpose:
 * Provides a native selection experience for occupational data, ensuring users select from a validated list of choices while maintaining the app's modern, glassmorphic design language.
 */

const OccupationPicker = ({ form, field }) => {
  // --- Redux Variables and State ---
  const dispatch = useDispatch();
  const { occupations } = useSelector(state => state.profile);
  const { activeRequests } = useSelector(state => state.loading);
  const { message: globalError } = useSelector(state => state.error);

  // --- Derived State ---
  const isLoading = activeRequests > 0;
  const hasError = form.touched[field.name] && form.errors[field.name];

  // --- Handlers ---
  const handleValueChange = (value) => {
    if (globalError) {
      dispatch(clearError());
    }
    form.setFieldValue(field.name, value);
    form.setFieldTouched(field.name, true);
  };

  if (isLoading) {
    return (
      <View style={styles.field}>
        <View style={styles.loadingRow}>
          <LoadingSpinner size={20} />
          <Text style={styles.loadingText}>Loading occupations…</Text>
        </View>
      </View>
    );
  }

  if (globalError || !occupations?.length) {
    return (
      <View style={styles.field}>
        <View style={styles.inputFallback}>
          <Text style={styles.placeholder}>
            {globalError ? 'Failed to load options' : 'No options available'}
          </Text>
        </View>
        {globalError && <ErrorText message={globalError} />}
      </View>
    );
  };

  return (
    <View style={styles.field}>
      <View 
        style={[styles.pickerContainer, hasError && styles.errorBorder]}
        accessibilityRole="combobox"
        accessibilityLabel="Occupation Selection"
      >
        <Picker
          selectedValue={field.value}
          onValueChange={handleValueChange}
          style={styles.picker}
          prompt="Select your occupation" 
          accessibilityLabel={field.value || "Select your occupation"}
        >
          <Picker.Item label="Select your occupation" value="" color="#94A3B8" />
          {occupations.map((occ) => (
            <Picker.Item key={occ} label={occ} value={occ} color="#0F172A" />
          ))}
        </Picker>
      </View>
      {hasError && <Text style={styles.error}>{form.errors[field.name]}</Text>}
    </View>
  );
};

export default memo(OccupationPicker);

const styles = StyleSheet.create({
  // --- Container & Structural Layout ---
  field: { 
    marginBottom: 28,
  },
  // --- Themed Selection Container ---
  pickerContainer: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
  },

  // --- Native Component Sizing ---
  picker: { 
    height: 58, 
    width: '100%',
  },

  // --- Fallback & Loading States ---
  inputFallback: {
    height: 58,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 18 
  },
  loadingText: { 
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center', 
  },

  // --- Typography ---
  placeholder: { 
    color: '#94A3B8', 
    fontSize: 16, 
  },

  // --- Validation Feedback ---
  errorBorder: { 
    borderColor: '#EF4444', 
    borderWidth: 2 
  },
  error: { 
    marginTop: 8, 
    color: '#EF4444', 
    fontSize: 13, 
    fontFamily: 'LibreFranklin-Medium' 
  },
});