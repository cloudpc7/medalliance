// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

const SettingsLink = ({ label, icon, danger = false, onPress, testID }) => {
  // --- Derived Values ---
  const contentColor = danger ? '#EF4444' : '#126DA6';

  /**
 * SettingsLink
 * 
 * A reusable, accessible row component for settings/navigation lists.
 * 
 * Functionality:
 * - Displays an optional left icon, label text, and right chevron arrow
 * - Supports "danger" mode (red text/icon) for destructive actions (e.g., logout, delete)
 * - Provides press feedback via ripple (Android) and opacity change
 * - Fully accessible with role, label, and hint
 * - Configurable via props: label, icon name, danger flag, onPress handler, testID
 * 
 * Purpose:
 * Standardizes the appearance and behavior of tappable settings rows across profile, account, and app settings screens for consistent UX.
 */

  // --- Main Render ---
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      android_ripple={{ color: '#1EC6D9', borderless: false }}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed 
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Navigates to detail screen or performs action"
    >
      <View style={styles.left}>
        {icon && (
          <FontAwesome6
            testID={`icon-${icon}`}
            name={icon}
            size={19}
            color={contentColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, danger && styles.dangerText]}>
          {label}
        </Text>
      </View>
      <FontAwesome6
        testID="icon-chevron-right"
        name="chevron-right"
        size={17}
        color="#126DA6"
      />
    </Pressable>
  );
};

export default SettingsLink;

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
  rowPressed: {
    opacity: 0.7, 
    backgroundColor: '#F9FAFB',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Icon Styling ---
  icon: {
    width: 26, 
    marginRight: 16,
    textAlign: 'center',
  },

  // --- Typography ---
  label: {
    fontSize: 16,
    color: '#0D0D0D',
    fontFamily: 'Prompt-Regular',
  },
  dangerText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});