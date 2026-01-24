// --- Core Dependencies ---
import React, { useCallback } from 'react';
import { Linking, Pressable, Text, StyleSheet } from 'react-native';

/**
 * Link
 * * A wrapper component that safely handles opening external URLs using the `Linking` API.
 * * Uses Pressable for consistent touch feedback and includes full accessibility support.
 * * @param {object} props
 * * @param {string} props.url - The URL to open (required).
 * * @param {React.ReactNode} props.children - The content to display (usually a Text component).
 * * @param {object} [props.style] - Optional style overrides for the inner Text component.
 * * @param {string} [props.accessibilityLabel] - Custom label for screen readers.
 * * @param {object} [props.rest] - Additional props passed to the Pressable component.
 */
export const Link = ({ url, children, style, accessibilityLabel, ...rest }) => {
  // --- Accessibility Label Fallback ---
  const label =
    accessibilityLabel ||
    (typeof children === 'string' ? children : 'Opens external link');

  // --- Handler: Open URL ---
  const handleLink = useCallback(async () => {
    if (!url) return;

    try {
      // 1. Check if the device can handle the URL scheme
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        // 2. Open the URL
        await Linking.openURL(url);
      } else {
        // 3. Log Error if unsupported scheme/URL
        throw new Error(`Unable to navigate to ${url}`);
      }
    } catch (error) {
      // 4. Log general execution error
      throw new Error(error?.message || 'Unkown error');
    }
  }, [url]);

  // --- Main Render ---
  return (
    <Pressable
      onPress={handleLink}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint="Opens in your device's browser"
      accessible={true}
      {...rest}
    >
      <Text style={[styles.linkText, style]}>{children}</Text>
    </Pressable>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  linkText: {
    color: '#0000FF', // Standard blue for visual cue
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});