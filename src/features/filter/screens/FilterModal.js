// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { close } from '../../../redux/slices/filter.slice';

// --- Expo Libraries and Modules ----
import FilterComponent from '../ui/FilterComponent';

// ---- Filter Modal provides users with options filter 

const FilterModal = () => {

  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { openFilter } = useSelector((state) => state.filters);

  return (
    <Modal 
      visible={openFilter} 
      animationType="slide" 
      transparent={false}
      statusBarTranslucent={true}  
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => dispatch(close())}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          
          <Text style={styles.title}>Filters</Text>

          <Pressable onPress={() => dispatch(close())} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {/* Filter Component Provides different sections based on criteria */}
          <FilterComponent />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // --- Header / Title ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 24,
  },
  title: {
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 24,
  },
  // --- Buttons & Actions ---
  cancel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#146EA6',
  },
  
  doneText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#146EA6',
  },
  // --- Scrollable Container List --- 
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});