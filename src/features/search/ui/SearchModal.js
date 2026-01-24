// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform,} from 'react-native';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { closeSearch, setQuery, clearSearch, selectSearchOpen, selectSearchQuery, selectFilteredSearchResults } from '../../../redux/slices/search.slice';
import { openProfile } from '../../../redux/slices/profiles.slice';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
/**
 * SearchModal
 * 
 * A full-screen slide-up modal for global profile search within the app.
 * 
 * Functionality:
 * - Triggered via Redux search slice (open/close from anywhere)
 * - Features a prominent search input with clear button and auto-focus
 * - Displays real-time filtered search results from Redux (selectFilteredSearchResults)
 * - Renders each result with name, role/occupation/department subtitle, and chevron
 * - Tapping a result opens the selected profile (dispatches openProfile) and closes the modal
 * - Handles three states: initial empty ("Search profiles"), no results, and result list
 * - Closes via close button or system back, clearing query and navigating to home
 * - Uses KeyboardAvoidingView for proper keyboard handling on iOS/Android
 * 
 * Purpose:
 * Provides fast, app-wide access to search and navigate to any user profile from a single, consistent interface.
 */

const SearchModal = () => {
  // --- Hooks ---
  const dispatch = useDispatch();
  const router = useRouter();

  // --- Redux Variables & State --- 
  const open = useSelector(selectSearchOpen);
  const query = useSelector(selectSearchQuery);
  const results = useSelector(selectFilteredSearchResults);

  // --- Handlers ---
  const handleClose = () => {
    dispatch(closeSearch());
    dispatch(clearSearch());
    router.push('/'); 
  };

  const handleSelectProfile = (profile) => {
    dispatch(openProfile(profile));
    dispatch(closeSearch());
    dispatch(clearSearch());
    router.push('/');
  };

  const renderItem = ({ item }) => {
    const subtitle = [
      item.accountType,
      item.profession || item.occupation,
      item.department
    ].filter(Boolean).join(' · ');

    const key = item.id || item.uid || item.name;

    return (
      <Pressable
        testID={`search-result-${key}`}
        onPress={() => handleSelectProfile(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open profile for ${item.name}`}
        style={({ pressed }) => [
          styles.resultRow,
          pressed && styles.resultRowPressed,
        ]}
      >
        <View style={styles.resultTextWrap}>
          <Text style={styles.resultName}>{item.name}</Text>
          {subtitle.length > 0 && (
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Pressable>
    );
  };

  // --- Main Render ---
  return (
    <Modal
      testID="search-modal"
      visible={open}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* Close Button */}
          <Pressable
            testID="search-close-button"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close search"
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <Ionicons name="close" size={24} color="#0D0D0D" />
          </Pressable>

          {/* Search Input Field */}
          <View style={styles.searchInputWrap}>
          <FontAwesome6 name="magnifying-glass" size={24} color="#146EA6" />
            <TextInput
              testID="search-input"
              style={styles.searchInput}
              placeholder="Search by name"
              placeholderTextColor="#0D0D0D"
              value={query}
              onChangeText={(text) => dispatch(setQuery(text))}
              autoFocus
              returnKeyType="search"
              accessibilityRole="search"
              accessibilityLabel="Search profiles by name"
            />
            {query?.length > 0 && (
              <Pressable
                testID="search-clear-button"
                onPress={() => dispatch(clearSearch())}
                accessibilityRole="button"
                accessibilityLabel="Clear search query"
              >
                <Ionicons name="close-circle" size={24} color="#146EA6" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {query.trim().length === 0 ? (
            // State: Initial / Empty Query
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Search profiles</Text>
            </View>
          ) : results.length === 0 ? (
            // State: No Results
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different spelling or search by full name.
              </Text>
            </View>
          ) : (
            // State: Results List
            <FlatList
              data={results}
              keyExtractor={(item) => item.id || item.uid || item.name}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  // --- Layout & Modal Structure ---
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // --- Header & Navigation ---
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  closeButtonPressed: {
    backgroundColor: '#DBEAFE',
  },
  // --- Search Input ---
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#0D0D0D',
  },

  // --- Content Area ---
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // --- Result Items ---
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  resultRowPressed: {
    backgroundColor: '#E5F2FF',
  },
  resultTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  resultName: {
    fontFamily: 'Prompt-Medium',
    fontSize: 18,
    color: '#0D0D0D',
  },
  resultSubtitle: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    color: '#0D0D0D',
    marginTop: 2,
  },
  separator: {
    height: 8,
  },

  // --- Empty States ---
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Prompt-Medium',
    fontSize: 18,
    color: '#0D0D0D',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    padding: 24,
    color: '#0D0D0D',
    textAlign: 'center',
  },
});