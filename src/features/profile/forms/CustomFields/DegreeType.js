// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';

// --- Form & State Management ---
import { useField } from 'formik';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';

// --- Custom UI Components ---
import LoadingSpinner from '../../../../ui/common/LoadingSpinner';
import ErrorText from '../../../../utils/errors/ErrorText';
import ErrorBanner from '../../../../utils/errors/ErrorBanner';
import { clearError } from '../../../../redux/slices/error.slice';

/**
 * DegreeTypeField
 * * A Formik-integrated selection component used specifically for designating academic majors and minors.
 * * Functionality:
 * - Employs the `useField` hook to bind directly to Formik state, managing value updates and validation metadata (touched/error) internally.
 * - Integrates with Redux to fetch global degree type datasets, featuring built-in render guards for "Loading," "Error," and "Empty" states.
 * - Triggers a semi-transparent modal overlay containing a performant `FlatList` for browsing academic options.
 * - Utilizes `useCallback` for optimized selection handling, ensuring the modal dismisses and the form state updates without redundant cycles.
 * - Features a modern UI with consistent shadows, radius, and specialized typography (LibreFranklin) to match the application's design system.
 * * Purpose:
 * Streamlines the selection of complex academic credentials by providing a robust, error-guarded interface that ensures users choose from verified institutional datasets.
 */

const DegreeTypeField = ({ name, label }) => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Local State ---
  const [field, meta, helpers] = useField(name);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Redux Variables and State ---
  const { degreeTypes } = useSelector((state) => state.profile);
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);
  
  // --- Handlers ---
  const handleSelect = useCallback((item) => {
    helpers.setValue(item.name);
    setModalVisible(false);
  }, [helpers]);

  // --- Derived State ---
  const hasError = meta.touched && meta.error;
  const displayValue = field.value || "Select Major/Minor";
  const isLoading = activeRequests > 0;

  // --- Loading State ---
  if (isLoading && !degreeTypes?.length) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.loadingRow}>
          <LoadingSpinner size={20}  />
          <Text style={styles.loadingText}>Loading options…</Text>
        </View>
      </View>
    );
  }

  // --- Render Guard: Error / Empty State ---
  if (globalError || !isLoading && !degreeTypes?.length) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.input}>
          <Text style={styles.placeholder}>No options available</Text>
        </View>
        <ErrorBanner 
          message={globalError} 
          onDismiss={() => dispatch(clearError())}
        />
      </View>
    );
  }

  // --- Main Render ---
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      {/* Trigger Button */}
      <Pressable 
        style={[styles.input, hasError && styles.errorBorder]} 
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}. Current selection: ${displayValue}`}
      >
        <Text style={field.value ? styles.value : styles.placeholder}>
          {displayValue}
        </Text>
      </Pressable>

      {/* Validation Message */}
      {hasError && <Text style={styles.error}>{meta.error}</Text>}

      {/* Selection Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Major/Minor</Text>
            
            <FlatList
              data={degreeTypes}
              keyExtractor={(item) => item.id?.toString() || item.name}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.item} 
                  onPress={() => handleSelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />

            <Pressable 
              style={styles.closeBtn} 
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DegreeTypeField;

const styles = StyleSheet.create({
   // --- Layout and structure ---
  field: { 
    marginBottom: 28 
  },
  label: { 
    fontSize: 16, 
    color: '#0D0D0D',
    marginBottom: 10, 
    fontFamily: 'Prompt-Regular', 
  },

  // --- Interactive Input Display ---
  input: {
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 3 
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
// --- Loading & Async States ---
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 18 
  },
  loadingText: { 
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center', 
  },
  
  // --- Content Typography ---
  placeholder: { 
    color: '#A5D8E2', 
    fontSize: 16, 
    fontFamily: 'Roboto',
    backgroundColor: 'blue',
  },
  value: { 
    color: '#0F172A', 
    fontSize: 16, 
    fontFamily: 'LibreFranklin-Medium' 
  },
  
  // Validation
  errorBorder: { 
    borderColor: '#EF4444', 
    borderWidth: 2 
  },
  error: { 
    marginTop: 8, 
    color: '#EF4444', 
    fontSize: 13, 
    fontFamily: 'LibreFranklin-Medium' 
  },
  
  // --- Modal & Overlay Components ---
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#0F172A', 
    fontFamily: 'LibreFranklin-Bold' 
  },

  // --- Selection List Items ---
  item: { 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  itemText: { 
    fontSize: 17, 
    color: '#1E293B', 
    fontFamily: 'LibreFranklin-Medium' 
  },
  closeBtn: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  closeText: { 
    color: '#EF4444', 
    fontSize: 17, 
    fontWeight: '600', 
    fontFamily: 'LibreFranklin-SemiBold' 
  },
});