// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Formik & Yup ---
import { Formik } from 'formik';
import * as Yup from 'yup';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { submitProfileForm } from '../../../redux/slices/profile.slice';
import { fetchProfileConfig } from '../../../redux/slices/profileConfig.slice';
import { clearError } from '../../../redux/slices/error.slice';
import { setProfileSetupComplete } from '../../../redux/slices/auth.slice';

// --- Custom UI Components ---
import CustomField from './CustomFields/CustomFormField';
import ErrorBanner from '../../../utils/errors/ErrorBanner';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

// --- Utility Components ---
import { validationSchema } from './schema/ValidationSchema';

const splashScreen = require('../../../../assets/splashscreen2.png');

/**
 * ProfileSetupForm
 * 
 * A dynamic, configuration-driven onboarding form for completing a user’s profile.
 * 
 * Functionality:
 * - Fetches profile-specific questions based on the selected profile type
 * - Dynamically generates form fields using a centralized configuration
 * - Builds validation rules at runtime using Yup and predefined schemas
 * - Handles loading, error, and empty states gracefully
 * - Submits completed profile data to Redux and navigates the user into the app
 * 
 * Purpose:
 * Serves as the primary profile completion flow during onboarding, ensuring users
 * provide all required information in a structured, validated, and adaptive form
 * experience tailored to their selected profile type.
 */

const ProfileSetupForm = () => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);

  // --- Redux State Variables ---
  const { profileType } = useSelector((state) => state.profile);
  const { questions } = useSelector((state) => state.profileConfig);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  // Determine specific loading states
  const isFetchingConfig = activeRequests > 0 && questions.length === 0;
  const isSubmitting = activeRequests > 0 && questions.length > 0;
  
  // --- Formik Initial Values ---
  const initialValues = useMemo(() => 
    questions.reduce((acc, q) => { acc[Object.keys(q)[0]] = ''; return acc; }, {}),
    [questions]
  );

  // --- Yup Validation Schema ---
  const validationShape = useMemo(() =>
    questions.reduce((acc, q) => {
      const key = Object.keys(q)[0];
      acc[key] = validationSchema[key] || Yup.string().required('Required');
      return acc;
    }, {}),
    [questions]
  );

  const formSchema = Yup.object().shape(validationShape);

  // --- Handlers ---
  const handleSubmit = async (values) => {
    try {
      if (!profileType) throw new Error('Profile type missing.')
      dispatch(clearError());
      await dispatch(submitProfileForm({ ...values, profileType })).unwrap();
      dispatch(setProfileSetupComplete('complete')); 

    } catch (error) {
    }
  };

  // --- useEffects ---
  useEffect(() => {
    if (globalError && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [globalError]);

  useEffect(() => {
    if (profileType && questions.length === 0) {
      dispatch(fetchProfileConfig(profileType));
    }
  }, [profileType, dispatch, questions.length]);

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {globalError && (
          <ErrorBanner 
            message={globalError} 
            onDismiss={() => dispatch(clearError())} 
          />
        )}

        {isFetchingConfig ? (
          <ImageBackground
            style={styles.spinnerContainer}
            source={splashScreen}
            resizeMode='contain'  
          >
            <Text style={styles.loadingText}>Loading Questions...</Text>
          </ImageBackground>
        ) : questions.length > 0 ? (
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={formSchema}
          >
            {({ handleSubmit: formikSubmit, isValid, dirty }) => (
              <>
                {questions.map((q) => {
                  const question = Object.keys(q)[0];
                  return <CustomField key={question} question={question} />;
                })}

                <Pressable
                  testID="complete-profile-button"
                  accessibilityRole="button"
                  style={[
                    styles.submitButton,
                    (isSubmitting || !isValid || !dirty) && styles.submitDisabled,
                  ]}
                  onPress={formikSubmit}
                  disabled={isSubmitting || !isValid || !dirty}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size={28} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>Complete Profile</Text>
                  )}
                </Pressable>
              </>
            )}
          </Formik>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No questions found for this profile type.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Layout and Structure ---
  container: { 
    flex: 1, 
    backgroundColor: '#FAFBFD' 
  },

  // --- Scroll Layout ---
  scrollContent: { 
    padding: 24, 
    paddingBottom: 100
  },

  // --- Loading & Empty States ---
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 300 
  },
  empty: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 300 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#64748B', 
    textAlign: 'center', 
    fontFamily: 'LibreFranklin-Medium' 
  },

  // --- Button & Actions ---
  submitButton: {
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
  submitDisabled: {
    backgroundColor: '#A5D8E2',
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'LibreFranklin-Bold',
  },

  // --- Initial Loading States ---
  spinnerContainer: {
    flex: 1, 
    height: 400,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

export default ProfileSetupForm;