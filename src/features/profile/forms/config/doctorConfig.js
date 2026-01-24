/**
 * professor_config
 * * A schema-driven configuration array used for rendering dynamic profile forms and detail views.
 * * Functionality:
 * - Defines the data structure for Professor/Mentor profiles, categorized by identity, expertise, and focus areas.
 * - Controls UI behavior through flags like `isEditable` (to toggle read-only vs. input states) and `multiline` (for text area rendering).
 * - Enforces validation rules (e.g., `required: true`) and specifies input keyboard types (e.g., `type: 'number'`).
 * - Distinguishes between immutable professional credentials (e.g., Medical Degree) and customizable mentoring philosophies.
 * * Purpose:
 * Acts as a single source of truth for the profile system, allowing the UI to remain generic and data-driven while ensuring consistent data entry for medical professionals.
 */
export const professor_config = [
  // --- Professional Identity (Non-Editable) ---
  { key: 'name', label: 'Full Name', type: 'text', required: true, isEditable: false },
  { key: 'occupation', label: 'Occupation', type: 'text', required: true, isEditable: false },
  { key: 'medicalDegree', label: 'Medical Degree', type: 'text', required: true, isEditable: false },
  // --- Expertise & Experience ---
  { key: 'department', label: 'Department / Specialty', type: 'text', required: true, isEditable: false },
  { key: 'yearsExperience', label: 'Years of Experience', type: 'number', required: true, isEditable: false },
  // --- Mentoring Philosophy (User Editable) ---
  {
    key: 'mentor',
    label: 'Mentoring Focus',
    type: 'text',
    required: true,
    isEditable: true,
    multiline: true,
  },
  {
    key: 'formats',
    label: 'Mentoring Formats',
    type: 'text',
    required: true,
    isEditable: true,
    multiline: true,
  },
  {
    key: 'goals',
    label: 'Educational Goals',
    type: 'text',
    required: true,
    isEditable: true,
    multiline: true,
  },
  // --- Academic & Personal Insights ---
  {
    key: 'academic',
    label: 'Academic Interests',
    type: 'text',
    required: true,
    isEditable: true,
    multiline: true,
  },
  {
    key: 'quote',
    label: 'Favorite Quote',
    type: 'text',
    required: false,
    isEditable: true,
    multiline: true,
  },
];
