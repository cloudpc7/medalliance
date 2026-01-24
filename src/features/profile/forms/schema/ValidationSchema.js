import * as Yup from 'yup';

/**
 * validationSchema
 * 
 * Defines Yup validation rules for role-specific onboarding and mentoring forms.
 * 
 * Purpose:
 * Enforces required input, type safety, and valid ranges for both student and
 * professional (professor/mentor) fields, ensuring complete and accurate data
 * collection during structured onboarding flows.
 */

export const validationSchema = {

  "Full Name": Yup.string()
    .min(2, 'Too short')
    .required('Required'),

  "Degree Program": Yup.string()
    .required('Required'),

  "Start Date": Yup.string()
    .required('Required'),

  "Current Year Of Study": Yup.number()
    .typeError('Must be a number')
    .min(1, 'At least 1')
    .max(7, 'Max 7')
    .required('Required'),

  "Expected Graduation Date": Yup.string()
    .required('Required'),

  "College": Yup.string()
    .required('Required'),

  "What type of mentoring do you prefer?": Yup.string()
    .required('Required'),

  // ──────────────────────────────────────────────────────────────
  // PROFESSOR FIELDS
  // ──────────────────────────────────────────────────────────────
  "Occupation": Yup.string()
    .required('Required'),

  "Medical Degree": Yup.string()
    .required('Required'),

  "Major/Minor": Yup.string()
    .required('Required'),

  "Years of Experience": Yup.number()
    .typeError('Must be a number')
    .min(0)
    .max(60)
    .required('Required'),

  "Specialty": Yup.string()
    .required('Required'),

  "What type of mentoring do you provide?": Yup.string()
    .required('Required'),

  "What type of mentoring formats do you offer?": Yup.string()
    .required('Required'),
};