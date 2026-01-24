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

export const ValidationSchema = Yup.object({
    reportType: Yup.string().required('Required'),
    message: Yup.string().min(10).required('Required'),
});