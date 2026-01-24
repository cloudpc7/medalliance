/**
 * student_config
 * * A schema-driven configuration array used for rendering dynamic student profiles and academic forms.
 * * Functionality:
 * - Maps the data structure for Student users, focusing on academic enrollment and career aspirations.
 * - Manages field-level permissions, locking verified institutional data (e.g., School, Enrollment Status) while allowing user expression in others.
 * - Defines UI rendering hints, such as distinguishing between single-line inputs and large-format text areas (multiline).
 * - Provides metadata for form validation and input mapping based on data types (text vs. number).
 * * Purpose:
 * Serves as the central definition for student data entry, ensuring that critical academic records remain consistent while giving students a platform to highlight their personal goals.
 */
export const student_config = [
  // --- Core Identity and Institution (Non-Editable) ---
  { key: 'name', label: 'Full Name', type: 'text', required: true, isEditable: false },
  { key: 'school', label: 'School/University', type: 'text', required: true, isEditable: false },
  { key: 'medicalProgram', label: 'Medical Program', type: 'text', required: true, isEditable: false },

  // --- Academic Progress and Timeline ---
  { key: 'course', label: 'Current Course', type: 'text', required: true, isEditable: false },
  { key: 'currYear', label: 'Current Year', type: 'number', required: true, isEditable: false },
  { key: 'enrollmentStatus', label: 'Enrollment Status', type: 'text', required: true, isEditable: false },
  { key: 'startDate', label: 'Start Date', type: 'text', required: true, isEditable: false },
  { key: 'gradDate', label: 'Graduation Date', type: 'text', required: false, isEditable: false },

  // --- Career Aspirations and Personalization (Editable) ---
  { key: 'medProfession', label: 'Medical Profession', type: 'text', required: true, isEditable: true },
  {
    key: 'teachingPref',
    label: 'Preferred Teaching Methods',
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
    required: true,
    isEditable: true,
    multiline: true,
  },
];
