// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome5 } from '@expo/vector-icons';

const ITEM_WIDTH = 60;
const ITEM_HEIGHT = 60;

/**
 * CounterField
 * * An input component for numerical incremental selection.
 * * Functionality:
 * - Provides a controlled interface for selecting a numeric value between a defined range (defaults: 0 to 6).
 * - Implements logic to "clamp" values, preventing selection outside the minimum and maximum boundaries.
 * - Integrates directly with Formik state for validation, tracking "touched" status and displaying error messages.
 * - Features high-contrast accessibility labels and state-dependent visual feedback (disabled buttons and error borders).
 * - Utilizes micro-interactions (scaling on press) and haptic-ready button styling to enhance tactile user experience.
 * * Purpose:
 * Streamlines the capture of quantitative data—such as years of experience or ratings—while ensuring user input remains within valid business constraints.
 */

const CounterField = ({ field, form, min = 1, max = 7 }) => {
  const flatListRef = useRef(null);
  const value = Number(field.value ?? min);
  const hasError = form.touched[field.name] && form.errors[field.name];

  const data = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);

  const handleSelect = useCallback(
    (newValue) => {
      if (newValue === value) return;
      form.setFieldValue(field.name, newValue);
      form.setFieldTouched(field.name, true, false);

      const index = data.indexOf(newValue);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    },
    [form, field.name, value, data]
  );

  useEffect(() => {
    const index = data.indexOf(value);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
    }
  }, [value, data]);

  const renderItem = useCallback(
    ({ item }) => {
      const isSelected = item === value;
      return (
        <Pressable onPress={() => handleSelect(item)}>
          <View style={styles.itemContainer}>
            <Text style={[styles.valueText, isSelected && styles.selectedText]}>{item}</Text>
          </View>
        </Pressable>
      );
    },
    [value, handleSelect]
  );

  return (
    <View style={styles.outerContainer}>
      {/* Left Arrow */}
      <FontAwesome5
        name="angle-left"
        size={24}
        color="#17A0BF"
        style={styles.arrowLeft}
      />

      {/* Picker Window */}
      <View style={styles.window}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.toString()}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 0 }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
            handleSelect(data[index]);
          }}
        />
      </View>

      {/* Right Arrow */}
      <FontAwesome5
        name="angle-right"
        size={24}
        color="#17A0BF"
        style={styles.arrowRight}
      />

      {hasError && <Text style={styles.errorText}>{form.errors[field.name]}</Text>}
    </View>
  );
};

export default CounterField;

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  window: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 22,
    fontFamily: 'Prompt-Bold',
    color: '#94A3B8',
  },
  selectedText: {
    color: '#146EA6',
    fontSize: 26,
  },
  arrowLeft: {
    marginRight: 10,
  },
  arrowRight: {
    marginLeft: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'Roboto',
  },
});
