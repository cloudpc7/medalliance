// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';

/**
 * SettingsSwitch
 * 
 * A reusable settings row component featuring a label and native Switch toggle.
 * 
 * Functionality:
 * - Displays a text label on the left and a platform-native Switch on the right
 * - Supports controlled (`value` + `onValueChange`) and uncontrolled (`initialValue`) modes
 * - Falls back to false if no value is provided
 * - Optional `disabled` state with visual and interaction feedback
 * - Fully accessible with role, label, and checked/disabled state
 * - Uses brand colors for track (teal) and thumb (blue when on)
 * - Slight iOS scale adjustment for consistent alignment in list rows
 * 
 * Purpose:
 * Standardizes toggle switches across settings screens (notifications, privacy, appearance) for consistent look, feel, and accessibility.
 */

const SettingsSwitch = ({ label, value, onValueChange, initialValue, disabled = false, testID }) => {
  // --- Derived State Variables ---
  const isOn = value ?? initialValue ?? false;

  // --- Main Render ---
  return (
    <View style={styles.row} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        trackColor={{ false: '#E0E0E0', true: '#17A0BF' }}
        thumbColor={isOn ? '#146EA6' : '#FFFFFF'}
        ios_backgroundColor="#E0E0E0"
        onValueChange={onValueChange}
        value={isOn}
        disabled={disabled}
        style={styles.switch}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: isOn, disabled }}
        testID={`${testID}-switch`}
      />
    </View>
  );
};

export default SettingsSwitch;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECEF',
  },
  label: {
    fontSize: 17,
    color: '#000000',
    fontFamily: 'LibreFranklin-Medium',
    flex: 1, // Ensures label takes up remaining space
    marginRight: 10,
  },
  switch: Platform.select({
    ios: {
      // Scale down slightly on iOS to match standard list item heights
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    android: {
      // Android switches usually fit standard touch targets well by default
    },
  }),
});