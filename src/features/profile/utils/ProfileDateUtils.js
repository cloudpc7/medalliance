// Libraries and Module imports
import moment from 'moment';

/**
 * handleDateChange
 * 
 * A utility callback function for React Native DateTimePicker onChange events.
 * 
 * Functionality:
 * - Receives the picker event and selectedDate
 * - Formats the selected date to MM/DD/YYYY using moment.js
 * - Updates the corresponding Formik form field with the formatted value
 * - Marks the field as touched to trigger validation
 * - Ignores the call if no date is selected
 * 
 * Purpose:
 * Standardizes date handling across forms, ensuring consistent formatting and proper Formik integration when users select a date.
 */

export const handleDateChange = (event, selectedDate, form, fieldName) => {
    if (selectedDate) {
        const formattedDate = moment(selectedDate).format('MM/DD/YYYY');
        form.setFieldValue(fieldName, formattedDate);
        form.setFieldTouched(fieldName, true);
    };
};