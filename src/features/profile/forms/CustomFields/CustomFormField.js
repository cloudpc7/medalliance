// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';

// Formik Libraries and Modules
import { Field } from 'formik';

// --- Redux State Management ---
import { useSelector } from 'react-redux';

// --- Custom UI Components ---
import CounterField from './CounterField';
import DatePicker from './DatePicker';
import PickerModal from './PickerModal';
import LoadingSpinner from '../../../../ui/common/LoadingSpinner';
/**
 * CustomFormField
 * * A polymorphic form component that dynamically switches input UI based on question content.
 * * Functionality:
 * - Employs keyword-based "Input Type Detection" to automatically serve four distinct UI variants:
 * 1. Picker/Modal: Triggered by keywords like "college," "occupation," or "specialty."
 * 2. Date Selection: Activated for "start date," "graduation," or "expected graduation."
 * 3. Numeric Counters: Serves "current year" or "years of experience" with custom min/max bounds.
 * 4. Standard Text Input: The default fallback for all other text-based data points.
 * - Deeply integrated with Formik via the <Field> component to handle validation, error states, and state updates.
 * - Manages asynchronous dependencies, such as displaying a loading state while college data is fetched from Redux.
 * - Optimized with `React.memo` and `useMemo` to prevent expensive re-renders during complex form interactions.
 * * Purpose:
 * Provides a highly flexible, "intelligent" form entry system that automatically maps plain-text questions to the most effective user interaction pattern, ensuring data integrity while reducing user friction.
 */

const CustomFormField = ({ question }) => {
  // --- Redux Variables and State ---
  const { loading: collegesLoading } = useSelector((s) => s.school);
  
  // --- Local State ---
  const [pickerVisible, setPickerVisible] = useState(false);
 
  // --- Constant Variables ---
  const normalizedQuestion = useMemo(() => (question || '').toLowerCase(), [question]);

  // --- Strategy: Input Type Detection ---
  // Heuristically determines which picker configuration to use based on keywords.
  const pickerConfig = useMemo(() => {
    if (normalizedQuestion.includes('college')) return { type: 'college', showLocation: true };
    if (normalizedQuestion.includes('degree program') || normalizedQuestion.includes('medical degree')) return { type: 'program' };
    if (normalizedQuestion.includes('major') || normalizedQuestion.includes('minor')) return { type: 'degree' };
    if (normalizedQuestion.includes('occupation')) return { type: 'occupation' };
    if (normalizedQuestion.includes('specialty')) return { type: 'specialty' };
    if (normalizedQuestion.includes('mentoring') && normalizedQuestion.includes('provide')) return { type: 'mentoring_type' };
    if (normalizedQuestion.includes('mentoring') && (normalizedQuestion.includes('prefer') || normalizedQuestion.includes('formats'))) return { type: 'format' };
    return null;
  }, [normalizedQuestion]);

  return (
    <Field name={question}>
      {({ field, form }) => {
        const hasError = form.touched[field.name] && form.errors[field.name];
        // --- Handler Functions ---
        const openPicker = useCallback(() => {
          Keyboard.dismiss();
          setPickerVisible(true);
        }, []);

        const selectValue = useCallback((val) => {
          form.setFieldValue(field.name, val);
          setPickerVisible(false);
        }, [field.name, form]);

        // =====================================================================
        // RENDER VARIANT 1: PICKER / SELECT MODAL
        // Used for Colleges, Degrees, Occupations, etc.
        // =====================================================================
        if (pickerConfig) {
          const isCollegePicker = pickerConfig.type === 'college';
          const isLoading = isCollegePicker && collegesLoading;

          return (
            <View style={styles.field}>
              <Text style={styles.label}>{question}</Text>

              <Pressable
                style={[styles.input, hasError && styles.errorBorder]}
                onPress={() => !isLoading && openPicker()}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={`Select ${question}`}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <LoadingSpinner size={20} color="#146EA6" />
                    <Text style={styles.loadingText}>Loading colleges…</Text>
                  </View>
                ) : (
                  <Text style={field.value ? styles.value : styles.placeholder}>
                    {field.value || `Select ${question}`}
                  </Text>
                )}
              </Pressable>

              {hasError && <Text style={styles.error}>{form.errors[field.name]}</Text>}

              <PickerModal
                visible={pickerVisible && !isLoading}
                onClose={() => setPickerVisible(false)}
                onSelect={selectValue}
                title={`Select ${question}`}
                type={pickerConfig.type}
                showLocationPrompt={pickerConfig.showLocation}
              />
            </View>
          );
        }

        // =====================================================================
        // RENDER VARIANT 2: DATE PICKER
        // Used for graduation dates or start dates.
        // =====================================================================
        if (normalizedQuestion.includes('start date') || normalizedQuestion.includes('expected graduation') || normalizedQuestion.includes('graduation')) {
          return (
            <View style={styles.field}>
              <Text style={styles.label}>{question}</Text>
              <DatePicker field={field} form={form} />
              {hasError && <Text style={styles.error}>{form.errors[field.name]}</Text>}
            </View>
          );
        }

        // =====================================================================
        // RENDER VARIANT 3: COUNTER / STEPPER
        // Used for years of experience or current year of study.
        // =====================================================================
        if (normalizedQuestion.includes('current year') || normalizedQuestion.includes('year of study') || normalizedQuestion.includes('years of experience')) {
          const isStudyYear = normalizedQuestion.includes('current year') || normalizedQuestion.includes('year of study');
          const min = isStudyYear ? 1 : 0;
          const max = isStudyYear ? 7 : 60;

          return (
            <View style={styles.field}>
              <Text style={styles.label}>{question}</Text>
              <CounterField field={field} form={form} min={min} max={max} />
              {hasError && <Text style={styles.error}>{form.errors[field.name]}</Text>}
            </View>
          );
        }

        // =====================================================================
        // RENDER VARIANT 4: STANDARD TEXT INPUT (DEFAULT)
        // Fallback for any other text-based questions.
        // =====================================================================
        return (
          <View style={styles.field}>
            <Text style={styles.label}>{question}</Text>
            <TextInput
              value={field.value}
              onChangeText={(t) => form.setFieldValue(field.name, t)}
              onBlur={() => form.setFieldTouched(field.name, true)}
              placeholder={`Enter ${question}`}
              placeholderTextColor="#94A3B8"
              style={[styles.textInput, hasError && styles.errorBorder]}
              autoCapitalize="sentences"
              selectionColor="#146EA6"
            />
            {hasError && <Text style={styles.error}>{form.errors[field.name]}</Text>}
          </View>
        );
      }}
    </Field>
  );
};

export default memo(CustomFormField);

const styles = StyleSheet.create({
  // --- Field Container ---
  field: { 
    marginBottom: 28 
  },
  label: { 
    fontSize: 16, 
    color: '#0D0D0D', 
    marginBottom: 10, 
    fontFamily: 'Prompt-Regular',
  },
  
  // --- Input ---
  input: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // --- Text Input Typography ---
  textInput: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // --- Loading State ---
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  loadingText: { 
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center', 
  },

  // --- Text States ---
  placeholder: { 
    color: '#94A3B8', 
    fontSize: 16, 
    fontFamily: 'Roboto' 
  },
  value: { 
    color: '#0F172A', 
    fontSize: 16, 
    fontFamily: 'Roboto' 
  },
  
  // --- Feedback & Validation States ---
  errorBorder: { 
    borderColor: '#EF4444', 
    borderWidth: 2 
  },
  error: { 
    marginTop: 8, 
    color: '#EF4444', 
    fontSize: 13, 
    fontFamily: 'Roboto' 
  },
});