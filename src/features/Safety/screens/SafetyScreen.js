// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { SafeAreaView } from 'react-native-safe-area-context';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';
import { sendSafetyMessage } from '../../../redux/slices/safety.slice';

// --- Formik & Yup ---
import { Formik } from 'formik';
import * as Yup from 'yup';

// --- Custom UI Components ---
import LoadingSpinner from '../../../ui/common/LoadingSpinner';
import { ValidationSchema } from '../utils/validationSchema';

/**
 * SafetyScreen
 * 
 * An in-app reporting form for users to submit anonymous safety and abuse concerns.
 * 
 * Functionality:
 * - Provides a Picker to select the type of report (e.g., harassment, inappropriate content, child safety)
 * - Allows users to enter a free-form message describing the issue
 * - Validates form fields using Yup and Formik, ensuring a report type is selected and a message is provided
 * - Supports anonymous submissions; no personal information is required
 * - Handles loading state with a spinner during submission
 * - Displays inline validation errors for missing or invalid inputs
 * - Includes accessibility roles and testIDs for screen readers and automated testing
 * 
 * Purpose:
 * Ensures compliance with Google Play safety policies (CSAE) by providing users with
 * a clear, accessible, and anonymous mechanism to report abuse or unsafe content.
 */

const SafetyScreen = () => {

    // --- Hooks ---
    const dispatch = useDispatch();

    // --- Redux State --
    const { reportType, message, loading, error } = useSelector((state) => state.safety);

    // --- Formik Initial Values ---
    const initialValues = {
    reportType: "",
    message: "",
    }

    // --- Handler functions ---
    const handleSubmit = async (values, { setFieldError, setSubmitting, resetForm }) => {
        try {
            dispatch(startLoading());
            await dispatch(sendSafetyMessage({
                reportType: values.reportType,
                message: values.message
            })).unwrap();
            resetForm();
            alert("Report submitted successfully");
        } catch (error) {
            setFieldError("general", error);
        } finally {
            dispatch(stopLoading());
            setSubmitting(false);
        }
    };

    // --- Main Render ---
    return (
    <SafeAreaView
        style={styles.container}
    >
        <View
            style={styles.header}
        >
            <Text
                style={styles.title}
            >
                Safety & Compliance
            </Text>
            <Text
                style={styles.subTitle}
            >
                Report abuse or inappropriate content
            </Text>
            <Text
                style={styles.description}
            >
                Users are able to submit anonymous safety and abuse reports through an in-app 
                reporting form. No personal information is required.
            </Text>
            <Text
                style={styles.caption}
            >
                We take child safety seriously. Reports are reviewed promptly
            </Text>
        </View>
        <KeyboardAvoidingView
            style={{ flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={ValidationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit,  touched, values, errors, setFieldTouched }) =>  (
                    <View
                        style={styles.formContainer}
                    >
                        {
                            errors.general && (
                                <Text>{errors.general}</Text>
                            )
                        }
                        <View
                            style={styles.optionsContainer}
                        >
                            <Picker
                                style={styles.options}
                                selectedValue={values.reportType}
                                onValueChange={(value) => {
                                    handleChange('reportType')(value);
                                    setFieldTouched('reportType', true);
                                }}
                                testID="safety-picker"
                                accessibilityRole='safety-menu'
                                dropdownIconColor="#126DA6"
                            >
                                <Picker.Item label="Select report type" value="" />
                                <Picker.Item label="Inappropriate content" value="inappropriate content" />
                                <Picker.Item label="Harassment" value="harassment" />
                                <Picker.Item label="Safety / Exploitation" value="safety" />
                                <Picker.Item label="Child Safety" value="child_safety" />
                                <Picker.Item label="Other" value="other" />
                            </Picker>
                        </View>
                        {
                            touched.reportType && errors.reportType && (
                                <Text
                                    style={styles.errorText}
                                >
                                    Please select from the menu of options. 
                                </Text>
                            )
                        }
                        <TextInput 
                            style={styles.input}
                            onChangeText={handleChange('message')}
                            onBlur={handleBlur('message')}
                            value={values.message}
                            placeholder='create message'
                            placeholderTextColor="#A0A0A0"
                            testID="safety-message-input"
                            accessibilityRole='text'
                        />
                        {
                            touched.message && errors.message && (
                                <Text
                                    style={styles.errorText}
                                >
                                    Please provide a brief message. 
                                </Text>
                            )
                        }
                        <Pressable
                            style={styles.btn}
                            onPress={handleSubmit}
                            disabled={loading}
                            testID="submit-btn"
                            accessibilityRole='button'
                        >
                            {
                                loading ? (
                                <LoadingSpinner size={20}/>  
                                ): (
                                    <Text
                                        style={styles.btnText}
                                    >
                                        Submit
                                    </Text>
                                )
                            }
                            
                        </Pressable>
                    </View>
                )}
            </Formik>
        </KeyboardAvoidingView>
    </SafeAreaView>
    );
};

export default SafetyScreen;

const styles = StyleSheet.create({
  // --- Main container ---
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 20,
  },

  // --- Header Section ---
  header: {
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 28,
    color: '#126DA6',
    textAlign: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontFamily: 'LibreFranklin-Medium',
    fontSize: 16,
    color: '#146EA6',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    color: '#0D0D0D',
    lineHeight: 20,
    textAlign: 'left',
    padding: 16,
    marginBottom: 4,
  },
  caption: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    color: '#EF4444',
    lineHeight: 20,
    marginBottom: 4,
    textAlign: 'center',
    padding: 12,
  },

  // --- Form Container ---
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // --- Picker Styling ---

    optionsContainer: {
        height: 48,
        borderWidth: 1,
        borderColor: '#0D0D0D',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center', // vertical centering
        paddingHorizontal: 12,     // space for arrow
        marginBottom: 12,
    },
    options: {
    fontFamily: 'Prompt-Regular',
    fontSize: 15,
    color: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 32,
    height: 48,
    justifyContent: 'center',
    },

    // --- Input Field Styling ---
    input: {
    fontFamily: 'Prompt-Regular',
    fontSize: 15,
    color: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    textAlignVertical: 'top', // multiline support
    minHeight: 100,
    backgroundColor: '#F9FAFB',
    },

    // --- Validation Error Styling ---
    errorText: {
    fontFamily: 'Prompt-Medium',
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 8,
    },

    // --- Button Styling ---
    btn: {
    backgroundColor: '#126DA6',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#126DA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    },
    btnText: {
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    },
});
