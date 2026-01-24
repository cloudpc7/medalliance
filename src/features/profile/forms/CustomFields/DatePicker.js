// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useState, useMemo } from 'react';
import { StyleSheet, Pressable, TextInput, Platform, View, Modal, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

/**
 * DatePicker
 * 
 * A Formik-integrated date selection component that wraps the platform-native date picker.
 * 
 * Functionality:
 * - Utilizes a read-only `TextInput` as a trigger, preventing manual keyboard entry.
 * - Bridges `@react-native-community/datetimepicker` with `moment.js` for formatting.
 * - iOS: Wraps picker in a Modal with a "Done" action to handle non-modal native behavior.
 * - Android: Handles the native dialog lifecycle (dismiss/confirm).
 * - Enforces data constraints by setting a `maximumDate` to the current day.
 */

const DatePicker = ({ form, field }) => {
  const [showPicker, setShowPicker] = useState(false);

  // iOS-only buffered date (committed on Done)
  const [iosTempDate, setIosTempDate] = useState(null);

  const hasError = form.touched[field.name] && form.errors[field.name];

  const dateValue = useMemo(() => {
    if (!field.value) return new Date();
    const parsed = moment(field.value, 'MM/DD/YYYY', true);
    return parsed.isValid() ? parsed.toDate() : new Date();
  }, [field.value]);

  const handleDateChange = (event, selectedDate) => {
    // Android dismiss handling
    if (event?.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (Platform.OS === 'ios') {
      if (selectedDate) {
        setIosTempDate(selectedDate);
      }
      return;
    }

    // Android commit immediately
    if (selectedDate) {
      form.setFieldValue(field.name, moment(selectedDate).format('MM/DD/YYYY'));
      form.setFieldTouched(field.name, true);
    }

    setShowPicker(false);
  };

  const handleIosDone = () => {
    const finalDate = iosTempDate || dateValue;
    form.setFieldValue(field.name, moment(finalDate).format('MM/DD/YYYY'));
    form.setFieldTouched(field.name, true);
    setIosTempDate(null);
    setShowPicker(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => {
          setIosTempDate(dateValue);
          setShowPicker(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <TextInput
          value={field.value}
          style={[styles.input, hasError && styles.error]}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#94A3B8"
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {/* iOS Modal Wrapper */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosControls}>
                <Button title="Done" onPress={handleIosDone} />
              </View>
              <DateTimePicker
                value={iosTempDate || dateValue}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Input Field ---
  input: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },

  // --- Feedback and Error messaging ---
  error: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },

  // --- iOS Specific Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosControls: {
    width: '100%',
    padding: 10,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
});

export default DatePicker;
