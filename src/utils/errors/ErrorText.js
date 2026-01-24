// --- Core Dependencies ---
import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * ErrorText
 * * A reusable typography component for displaying inline validation errors.
 * * Typically placed immediately below form input fields.
 * * conditionally renders: returns null if no message is provided to prevent layout shifts.
 * * @param {object} props
 * * @param {string} props.message - The error string to display.
 * * @param {object} [props.style] - Optional style overrides.
 */
const ErrorText = ({ message, style }) => {
  // --- Render Guard ---
  if (!message) {
    return null;
  }
  
  // --- Main Render ---
  return (
    <Text style={[styles.errorText, style]}>
      {message}
    </Text>
  );
};

export default ErrorText;

// --- Styles ---
const styles = StyleSheet.create({
  errorText: {
    color: '#FF3B30', // Standard iOS System Red
    fontSize: 12,
    marginTop: 5,     // Visual separation from input field
    marginLeft: 5,    // Aligns with input padding
    fontWeight: '400',
  },
});