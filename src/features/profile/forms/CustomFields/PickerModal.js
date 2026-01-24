// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, View, Text, Pressable, FlatList, TextInput, StyleSheet } from 'react-native';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchColleges, fetchMedicalPrograms, fetchDegrees, fetchOccupations,
  fetchSpecialties, fetchMentoringTypes, fetchFormats
} from '../../../../redux/slices/school.slice';
import { clearError } from '../../../../redux/slices/error.slice';

// --- Custom UI Components ---
import ErrorText from '../../../../utils/errors/ErrorText';
import LoadingSpinner from '../../../../ui/common/LoadingSpinner';
import LocationPrompt from '../../utils/LocationPermissions';

/**
 * PickerModal
 * * A reusable modal-based selection component for choosing school- and career-related data.
 * * Functionality:
 * - Displays a full-screen modal with a selectable list of options
 * - Dynamically fetches data from Redux based on the provided `type` prop (college, program, degree, etc.)
 * - Supports real-time search filtering when selecting colleges
 * - Handles loading, error, and empty states gracefully
 * - Optionally prompts for location permissions to improve college results
 * - Returns the selected item via `onSelect` and closes the modal automatically
 * * Purpose:
 * Provides a consistent, scalable picker experience across the app for selecting educational,
 * professional, and mentoring-related options while keeping data-fetching logic centralized in Redux.
 */

const PickerModal = ({ visible, onClose, onSelect, title, type = 'college', showLocationPrompt = true }) => {
  // --- Hooks ---
  const dispatch = useDispatch();
  
  // --- Redux State Variables ---
  const { colleges, programs, degrees, occupations, specialties, mentoringTypes, formats, userState} = useSelector((state) => state.school);
  const { activeRequests } = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error.message);

  // --- Derived State ---
  const isLoading = activeRequests > 0;
  // --- Local State ---
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // --- Helpers ---
  const isCollege = type === 'college';

  const getLabel = useCallback((item) => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.name || '';
  }, []);

  // --- Effect: Reset State on Close ---

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setFilteredData([]);
    }
  }, [visible]);

  // --- Effect: Local Search Filtering ---
  useEffect(() => {
    if (!visible || !isCollege) return;
    
    const normalizedQuery = query.toLowerCase();
    const sourceData = colleges || [];
    
    const results = normalizedQuery 
      ? sourceData.filter(item => getLabel(item).toLowerCase().includes(normalizedQuery)) 
      : sourceData;
      
    setFilteredData(results);
  }, [colleges, query, visible, isCollege, getLabel]);

  useEffect(() => {
    if (isCollege && userState) {
      dispatch(fetchColleges({state: userState}));
    };
  },[isCollege, userState, dispatch]);

  // --- Derived State: Data Source Selector ---
  const data = useMemo(() => {
    if (isCollege) return filteredData;
    switch (type) {
      case 'program': return programs;
      case 'degree': return degrees;
      case 'occupation': return occupations;
      case 'specialty': return specialties;
      case 'mentoring_type': return mentoringTypes;
      case 'format': return formats;
      default: return [];
    }
  }, [type, isCollege, filteredData, programs, degrees, occupations, specialties, mentoringTypes, formats]);

  const renderItem = useCallback(({ item }) => {
    const label = getLabel(item);
    return (
      <Pressable 
        style={styles.item} 
        onPress={() => { onSelect(item); onClose(); }}
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
      >
        <Text style={styles.itemText}>{label}</Text>
      </Pressable>
    );
  }, [getLabel, onSelect, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>Close</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 50 }} />
        </View>

        {isCollege && showLocationPrompt && <LocationPrompt />}

        {isLoading ? (
          <View style={styles.loading}>
            <LoadingSpinner size={42} color="#17A0BF" />
            <Text style={styles.loadingText}>
              {isCollege ? 'Loading colleges…' : 'Loading options…'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ErrorText message={error} />
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No items found</Text>
            {query.length > 0 && (
              <Pressable style={styles.clearButton} onPress={() => setQuery('')}>
                <Text style={styles.clearButtonText}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => `${type}-${getLabel(item)}-${index}`}
            renderItem={renderItem}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

export default PickerModal;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { 
    padding: 8 
  },
  backText: { 
    color: '#17A0BF', 
    fontSize: 16, 
    fontFamily: 'Roboto' 
  },
  title: { 
    fontSize: 20, 
    color: '#0D0D0D', 
    fontFamily: 'LibreFranklin-Medium' 
  },
  search: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0D0D0D',
  },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center', 
  },
  item: { 
    paddingVertical: 18, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  itemText: { 
    fontSize: 16, 
    color: '#0D0D0D', 
    fontFamily: 'Roboto' 
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
  },
  empty: { 
    textAlign: 'center',
    color: '#0D0D0D', 
    fontSize: 16, 
    fontFamily: 'Roboto' 
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#17A0BF',
    fontSize: 14,
    fontFamily: 'LibreFranklin-Medium',
  },
  center: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
});