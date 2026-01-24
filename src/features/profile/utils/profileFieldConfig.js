/**
 * PROFILE_SETTINGS_FIELD_CONFIG
 * 
 * A centralized configuration object defining the display and editability rules for user profile fields.
 * 
 * Functionality:
 * - Maps internal field keys (e.g., 'College', 'degree') to user-friendly labels
 * - Specifies whether each field is editable (true/false)
 * - Flags multiline fields (e.g., goals, quote) for proper text input rendering
 * - Used by profile editing screens to dynamically generate form fields with consistent behavior
 * 
 * Purpose:
 * Keeps profile field metadata in one place for easy maintenance, consistency across edit/view screens, and future extensibility.
 */

export const PROFILE_SETTINGS_FIELD_CONFIG = {
  name: { label: 'Full Name', editable: false },
  College: { label: 'College / University', editable: true },
  degree: { label: 'College Major', editable: true },
  occupation: { label: 'Occupation', editable: true },
  department: { label: 'Specialty / Department', editable: true },
  mentor: { label: 'Mentoring Type', editable: true, multiline: true },
  curr_year: { label: 'Current Year', editable: true},
  formats: { label: 'Mentoring Format', editable: true, multiline: true },
  goals: { label: 'Educational Goals', editable: true, multiline: true },
  quote: { label: 'Favorite Quote', editable: true, multiline: true },
  yearsExperience: { label: 'Years of Experience', editable: true },
  profession: { label: 'Profession', editable: true },
};
