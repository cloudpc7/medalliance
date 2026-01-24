import * as Yup from 'yup';

/**
 * ValidationSchema
 * 
 * Defines the Yup-based validation rules for profile and account-related form data.
 * 
 * Purpose:
 * Ensures required fields are present and properly formatted while allowing flexibility
 * for optional profile information, providing consistent and centralized form validation
 * across onboarding and profile flows.
 */

export const ValidationSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Too Short!')
        .max(100, 'Too Long!')
        .required('Full Name is required'),
    currYear: Yup.number() 
        .typeError('Current Year must be a number.')
        .integer('Must be a whole number')
        .min(1, 'Year must be 1 or higher')
        .max(6, 'Year cannot exceed 6')
        .required('Current Year is required'),
        
    accountType: Yup.string().required('Account Type is required'),
    major_minor: Yup.string().nullable(),
    department: Yup.string().nullable(),
    College: Yup.string().nullable(),
    profession: Yup.string().nullable(),
    mentor: Yup.string().nullable(),
    medicalProgram: Yup.string().nullable(),
    course: Yup.string().nullable(),
    enrollmentStatus: Yup.string().nullable(),
    startDate: Yup.string().nullable(),
    gradDate: Yup.string().nullable(),
    medProfession: Yup.string().nullable(),
    formats: Yup.string().nullable(),
    yearsExperience: Yup.string().nullable(),
    curr_year: Yup.number().nullable(),
    goals: Yup.string().nullable(),
    academic: Yup.string().nullable(),
    quote: Yup.string().nullable(),
    title: Yup.string().nullable(),
    institute: Yup.string().nullable(),
    expertise: Yup.string().nullable(),
    courseOffer: Yup.string().nullable(),
    occupation: Yup.string().nullable(),
    degree: Yup.string().nullable(),
    method: Yup.string().nullable(),
    status: Yup.string().nullable(),
});