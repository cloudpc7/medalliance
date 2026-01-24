// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Formik, Field } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

// --- Utilities ---
import { useProfileFormLogic } from '../utils/useProfileFormLogic';
import { useProfileSettings } from '../utils/useProfileSettings';

// --- UI Custonm Components ---
import ProfileField from './Profilefields/ProfileSettingFields';

/**
 * ProfileSettingsForm
 * 
 * A dynamic, inline-edit profile settings form for viewing and updating user profile data.
 * 
 * Functionality:
 * - Renders profile fields in a read-only display mode with tap-to-edit behavior
 * - Uses Formik for controlled form state and validation handling
 * - Dynamically builds form fields based on a centralized display configuration
 * - Supports inline editing of individual fields while preserving scroll position
 * - Displays success feedback after successful updates
 * - Provides cancel and save actions when edits are active
 * 
 * Purpose:
 * Serves as the primary profile management interface, allowing users to review and update
 * their information in a structured, guided, and non-disruptive editing experience.
 */

const ProfileSettingsForm = () => {

  // --- Reference State Variables ---
  const scrollViewRef = useRef(null);
  const { 
    activeFieldKey, successMessage, handleFieldPress, handleFieldBlur, 
    handleSubmit, handleCancel, isEditMode 
  } = useProfileFormLogic(scrollViewRef);

  // --- Derived State Variables ---
  const { profileData, DISPLAY_ORDER, getLookupData } = useProfileSettings();

  const formInitialValues = useMemo(() => {
    const source = profileData || {};
    const values = {};
    DISPLAY_ORDER.forEach(({ key }) => {
      values[key] = source[key] || '';
    });
    return values;
  }, [profileData,DISPLAY_ORDER]);

  // --- Main Render ---
  return (
    <KeyboardAwareScrollView 
      ref={scrollViewRef} 
      contentContainerStyle={styles.container} 
      keyboardShouldPersistTaps="handled"
    >
      {successMessage && (
        <View style={styles.successBanner}>
          <FontAwesome6 name="circle-check" size={18} color="#168C40" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Formik initialValues={formInitialValues} enableReinitialize={true}>
        {({ values, errors, setErrors, resetForm }) => (
          <>
            {DISPLAY_ORDER.map((item, index) => {
              const isEditing = activeFieldKey === item.key;
              const currentVal = values[item.key] || (profileData && profileData[item.key]);
              const displayVal = (currentVal && String(currentVal).trim() !== '')
                ? String(currentVal)
                : 'Tap to add';

              return (
                <View key={item.key} style={styles.fieldRow}>
                  <Text style={styles.label}>{item.label}</Text>

                  {isEditing ? (
                    <View style={styles.inputWrapper}>
                      <Field name={item.key}>
                        {(fieldProps) => (
                          <ProfileField
                            {...fieldProps}
                            label={item.label}
                            isFocused={isEditing}
                            onBlur={() => handleFieldBlur(values, setErrors)}
                            options={getLookupData(item.key)}
                          />
                        )}
                      </Field>
                      {errors[item.key] && <Text style={styles.fieldError}>{errors[item.key]}</Text>}
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        if (item.editable === false) return;
                        handleFieldPress(item.key, values, setErrors)
                      }}
                      style={styles.valueWrapper}
                    >
                      <Text style={[styles.valueText, displayVal === 'Tap to add' && styles.placeholder]}>
                        {displayVal}
                      </Text>
                      <FontAwesome6 name="chevron-right" size={14} color="#126DA6" />
                    </Pressable>
                  )}
                  {index < DISPLAY_ORDER.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}

            {isEditMode && (
              <View style={styles.buttonRow}>
                <Pressable onPress={() => handleCancel(resetForm)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => handleSubmit(values, { setErrors })} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Save changes</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default ProfileSettingsForm;

const styles = StyleSheet.create({
   // --- Layout & Container ---
  container: { 
    paddingVertical: 8, 
    paddingHorizontal: 16 
  },
  // --- Success Feedback ---
  successBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ECFEF5', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 18, 
    columnGap: 10 
  },
  successText: { 
    fontSize: 14, 
    color: '#168C40', 
    fontWeight: '500' 
  },
  // --- Field Rows ---
  fieldRow: { 
    marginBottom: 18,
  },
  // --- Field Labels ---
  label: { 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 8 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F1F5F9', 
    marginTop: 16 
  },

  // --- Read-Only Value Display ---
  valueWrapper: { 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderRadius: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  valueText: { 
    fontSize: 16, 
    color: '#1E293B', 
    flex: 1, 
    marginRight: 8, 
    fontWeight: '500' 
  },
  placeholder: { 
    color: '#94A3B8' 
  },

  // --- Editable Field State ---
  inputWrapper: { 
    marginTop: 2 
  },
  fieldError: { 
    color: '#DC2626', 
    fontSize: 12, 
    marginTop: 6 
  },

  // --- Buttons & Actions ---
  buttonRow: { 
    flexDirection: 'row', 
    columnGap: 12, 
    marginTop: 32, 
    paddingBottom: 60 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  cancelText: { 
    color: '#475569', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  saveBtn: { 
    flex: 1, 
    backgroundColor: '#126DA6', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  saveText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});

