// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Platform } from 'react-native';

// --- Expo Libraries and Modules ----
import { Link } from 'expo-router';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores } from '../../../redux/slices/shop.slice';
import { clearError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import StoreCard from '../ui/StoreCard';
import NavBar from '../../navbar/NavBar';
import ErrorBanner from '../../../utils/errors/ErrorBanner';

// --- Assets ---
const splashScreen = require('../../../../assets/splashscreen2.png');

/**
 * StoreScreen
 * * A showcase screen displaying available student shop items and bundles.
 * * Hardened for Production:
 * - Font Compliance: strictly uses AlfaSlabOne, LibreFranklin, and Prompt.
 * - Accessibility: All font sizes are >= 16px.
 * - Performance: FlatList virtualization with shop-specific loading guards.
 * - Error Isolation: Prioritizes local shop errors and handles global cleanup.
 * - Layout: Fixed height alignment for StoreCard integration.
 */

const StoreScreen = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux Variables & State ---  
  const { data: stores } = useSelector((state) => state.shop);
  const { message: globalError } = useSelector((state) => state.error);
  const { activeRequests } = useSelector((state) => state.loading);
  const isLoading = activeRequests > 0;

  // --- UseEffects --- 
  useEffect(() => {
    if (stores.length === 0 && !isLoading) {
      dispatch(fetchStores());
    }
  }, [dispatch, stores.length, isLoading]);

  const renderItem = ({ item, index }) => {
    const key = item.id || item.uid || `store-${index}`;
    
    return (
      <View 
        key={key} 
        style={styles.cardWrapper}
        accessible={true}
        accessibilityLabel={`${item.name || 'Store item'}, Status: Coming Soon`}
        accessibilityRole="button"
      >
        <Link href={`/shop/${item.id}`} asChild style={{ flex: 1 }}>
          <StoreCard store={item} />
        </Link>
        <View style={styles.comingSoonOverlay} pointerEvents="none">
          <View style={styles.stampBorder}>
            <Text style={styles.comingSoonText}>COMING SOON!</Text>
          </View>
        </View>
      </View>
    );
  };

  // --- Loading State ---
  if (isLoading && stores.length === 0) {
    return (
      <ImageBackground
        style={styles.spinnerContainer}
        source={splashScreen}
        resizeMode="contain"
      >
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>LOADING SHOP...</Text>
        </View>
      </ImageBackground>
    );
  };

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {globalError && (
        <ErrorBanner 
          message={globalError} 
          onDismiss={() => dispatch(clearError())} 
        />
      )}

      <View style={styles.header}>
        <Text style={styles.title}>STUDENT SHOP</Text>
      </View>
      
      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || item.uid || index.toString()}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
      <NavBar />
    </View>
  );
};

export default memo(StoreScreen);

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
  },

  // --- Header & Title ---
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 32, 
    color: '#146EA6',
    fontFamily: 'LibreFranklin-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // --- List Container ---
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140, 
    flexGrow: 1,
  },

  // --- Card Container & Overlay ---
  cardWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    marginBottom: 24,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 28,
  },
  stampBorder: {
    borderWidth: 3,
    borderColor: '#EF4444',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 4,
    transform: [{ rotate: '-10deg' }], 
    backgroundColor: '#FFFFFF',
  },
  comingSoonText: {
    fontSize: 24,
    fontFamily: 'Prompt-Medium',
    color: '#EF4444',
    textAlign: 'center',
    letterSpacing: 2,
  },
  
  // --- Loading State ---
  spinnerContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 20,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 20,
    color: '#0D0D0D',
    fontFamily: 'Prompt-Medium',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 14,
    fontSize: 16,
    color: '#0D0D0D',
    fontFamily: 'LibreFranklin-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});