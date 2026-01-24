// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { fetchOccupations, fetchDegrees } from '../../../redux/slices/school.slice';
import { toggleOption, clearFilters } from '../../../redux/slices/filter.slice';

// --- Custom UI Components ---
import FilterOptions from '../ui/FilterOptions';

// --- Utility Components --- 
import { filterOptions } from '../util/filterConfig';

/**
 * FilterComponent
 * 
 * A scrollable filter panel that displays categorized filter sections (e.g., Occupation, Degree, etc.).
 * 
 * Functionality:
 * - Dynamically loads occupation and degree lists from Redux on mount (if not already present)
 * - Renders filter buttons from a shared config (`filterOptions`)
 * - Tapping a filter button toggles it open, replacing the button with <FilterOptions /> for multi-select choices
 * - Only one filter section can be expanded at a time (managed via Redux `showOption` & `selectedFilter`)
 * - Includes a "Reset All Filters" button at the bottom to clear all active filters
 * 
 * Purpose:
 * Provides an intuitive, collapsible interface for users to refine search or list results by multiple criteria.
 */


const FilterComponent = () => {

  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { showOption, selectedFilter } = useSelector((state) => state.filters);
  const { occupations, degrees } = useSelector((state) => state.school);
  
  // --- UseEffects ---
  useEffect(() => {
    if (occupations.length === 0) {
        dispatch(fetchOccupations());
    };

    if (degrees.length === 0) {
        dispatch(fetchDegrees());
    }
  },[dispatch, occupations.length, degrees.length]);

  const handleResetAll = () => {
    dispatch(clearFilters());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {filterOptions.map((section) => (
        <View key={section.id} style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>{section.label}</Text>
            {section.filters.map((filter) => {
              const isSelected = showOption && selectedFilter === filter;
              const isValidFilter = typeof filter === 'string' && filter.length > 0;

              return (
                <View key={filter} style={{ marginBottom: 12 }}>
                  {!isSelected ? (
                    <Pressable
                      style={styles.filterBtn}
                      onPress={() => dispatch(toggleOption(filter))}
                    >
                      <Text style={styles.filterLabel}>
                        {isValidFilter ? filter.charAt(0).toUpperCase() + filter.slice(1) : ''}
                      </Text>
                      <View style={styles.iconWrapper}>
                        <FontAwesome6 name="angles-right" size={16} color="#FFFFFF" />
                      </View>
                    </Pressable>
                  ) : (
                    <FilterOptions />
                  )}
                </View>
              );
            })}
        </View>
      ))}

      {/* --- RESET BUTTON AT BOTTOM OF MODAL --- */}
      <Pressable style={styles.resetAllBtn} onPress={handleResetAll}>
        <MaterialIcons name="refresh" size={20} color="#EF4444" />
        <Text style={styles.resetAllText}>Reset All Filters</Text>
      </Pressable>
    </ScrollView>
  );
};

export default FilterComponent;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    paddingHorizontal: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },

  // --- Buttons & Actions ---
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#126DA6',
  },
  resetAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  resetAllText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});