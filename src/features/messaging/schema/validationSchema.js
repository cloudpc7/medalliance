// --- Yup Library
import * as Yup from 'yup';

// Validates group schema for adding a group for messaging component
const groupCreationSchema = Yup.object().shape({
  groupName: Yup.string()
    .trim()
    .min(3, 'Group name must be at least 3 characters')
    .max(60, 'Group name must be 60 characters or less')
    .required('Group name is required'),
});

export default groupCreationSchema;
