// --- Core Dependencies ---
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// --- Third Party Libraries ---
import { FontAwesome6 } from '@expo/vector-icons';

/**
 * ErrorBanner
 * * A transient UI component for displaying error feedback.
 * * Features:
 * * 1. Auto-dismiss functionality (default: 8 seconds).
 * * 2. Manual dismiss button.
 * * 3. High z-index to ensure visibility over other content.
 * * @param {object} props
 * * @param {string} props.message - The error text to display.
 * * @param {function} [props.onDismiss] - Callback when the banner closes (auto or manual).
 * * @param {number} [props.duration] - Time in ms before auto-close (default: 8000).
 */
const ErrorBanner = ({ message, onDismiss, duration = 8000, testID }) => {
  // --- Local State ---
  const [isVisible, setIsVisible] = useState(false);

  // --- Effect: Visibility Timer ---
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss(); 
      }, duration);

      // Cleanup timer on unmount or if message changes
      return () => clearTimeout(timer); 
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onDismiss]);

  // --- Handler: Manual Close ---
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  // --- Render Guard ---
  if (!isVisible) {
    return null;
  }

  // --- Main Render ---
  return (
    <View style={styles.container} testID={testID}>
      {/* Leading Icon */}
      <View style={styles.iconWrapper}>
        <FontAwesome6 name="circle-exclamation" size={20} color="#FFFFFF" />
      </View>

      {/* Error Text */}
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>
      
      {/* Close Button */}
      <Pressable 
        onPress={handleDismiss}
        style={styles.closeButton}
        hitSlop={10} 
        accessibilityRole="button"
        accessibilityLabel="Close error notification"
      >
        <FontAwesome6 name="xmark" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

export default ErrorBanner;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9534F', // Standard Error Red
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    // Layering
    zIndex: 100, 
    elevation: 4, 
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconWrapper: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LibreFranklin-Medium',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
    opacity: 0.8,
  },
});