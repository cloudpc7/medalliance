// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

// --- Utility Components --- 
import { useFilterLogic } from '../util/useFilterLogic';
/**
 * FilterOptions
 * 
 * Renders a list of selectable options for the currently expanded filter category 
 * (e.g., a list of occupations or degrees).
 * 
 * Functionality:
 * - Pulls the available options and current selection from the custom hook `useFilterLogic`
 * - Displays each option as a tappable button
 * - Highlights the currently selected option
 * - Calls the hook's `selectOption` function when an option is tapped to update the filter state
 * 
 * Purpose:
 * Provides a simple, single-select interface inside an expanded filter section.
 */

const FilterOptions = () => {

  // --- Derived State variables and functions ---
  const { options, currentValue, selectOption } = useFilterLogic();

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const displayValue = typeof option === 'string' 
          ? option 
          : (option?.name || option?.label || 'Unknown');
        
        const isSelected = currentValue?.toLowerCase() === displayValue.toLowerCase();

        return (
          <Pressable
            key={`${displayValue}-${index}`}
            style={[
              styles.optionBtn,
              isSelected ? styles.optionBtnSelected : null,
            ]}
            onPress={() => selectOption(displayValue)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.optionText,
                isSelected ? styles.optionTextSelected : null,
              ]}
            >
              {displayValue}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default FilterOptions;

const styles = StyleSheet.create({
   // --- Layout and structure ---
  container: {
    marginHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // --- Buttons & Actions ---
  optionBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnSelected: {
    backgroundColor: '#126DA6',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});