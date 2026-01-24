// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// --- Expo Libraries and Modules ----
import { useLocalSearchParams } from 'expo-router';

// --- Redux State Management ---
import { useSelector } from 'react-redux';

// --- Custom UI Components ---
import ShopCard from '../ui/ShopCard';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';
import NavBar from '../../navbar/NavBar';
import ErrorBanner from '../../../utils/errors/ErrorBanner';

/**
 * ShopScreen
 * 
 * A detail screen displaying a specific store's items within the in-app shop.
 * 
 * Functionality:
 * - Receives store ID via route params (`id`)
 * - Looks up the matching store from Redux shop data
 * - Renders the store name as a prominent header
 * - Shows a scrollable list of individual shop items using ShopCard components
 * - Handles loading (spinner), error (banner), not-found, and empty item list states
 * - Includes persistent NavBar at the bottom
 * 
 * Purpose:
 * Provides a focused view of a single store's catalog, allowing users to browse available items and bundles (currently in "coming soon" preview mode).
 */

const ShopScreen = () => {
  // --- Hooks ---
  const { id } = useLocalSearchParams(); 

  // --- Redux Variables & State ---  
  const { data: stores, loading, error } = useSelector((state) => state.shop);

  // --- Derived State Variables ---
  const currentStore = stores.find((s) => s.id === id);
  const shopItems = currentStore?.items || [];

  if (loading) {
    return <LoadingSpinner />;
  };

  if (error) {
    return <ErrorBanner message={error} />;
  };

  if (!currentStore) {
    return <Text style={styles.notFound}>Store not found</Text>;
  };

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{currentStore.storeName}</Text>

      {/* Item List */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {shopItems.length === 0 ? (
          <Text style={styles.empty}>No items yet</Text>
        ) : (
          shopItems.map((item) => (
            <ShopCard key={item.id} itemDetails={item} />
          ))
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <NavBar />
    </View>
  );
};

export default ShopScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  // --- Header & Title ---
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    padding: 20,
    color: '#126DA6',
  },

  // --- Scrollable Container ---
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100, 
  },

  // --- Feedback and Messaging ---
  notFound: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 100,
    fontSize: 18,
    color: '#D3D3D3',
  },
  empty: {
    textAlign: 'center',
    paddingTop: 60,
    fontSize: 18,
    color: '#D3D3D3',
  },
});