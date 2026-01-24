// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

// --- Expo Libraries and Modules ----
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch } from 'react-redux';
import { setActiveRoute } from '../../redux/slices/navControl.slice';
import { openSearch } from '../../redux/slices/search.slice';

// --- Configuration ---
const NAV_ITEMS = [
  { id: 'search',   route: '/search',    icon: 'search',   label: 'Search' },
  { id: 'calendar', route: '/calendar',  icon: 'calendar', label: 'Calendar' },
  { id: 'messages', route: '/messaging', icon: 'messages', label: 'Messages' },
  { id: 'store',    route: '/store',     icon: 'store',    label: 'Store' },
  { id: 'account',  route: '/account',   icon: 'account',  label: 'Account' },
];

const ICON_MAP = {
  search: 'magnifying-glass',
  calendar: 'calendar',
  messages: 'comment',
  store: 'shop',
  account: 'user',
};

const NavIcon = ({ icon, label, isActive, route, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, friction: 4 }),
      Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable
      style={styles.navIconWrapper}
      onPress={() => onPress(route)}
      onPressIn={animateIn}
      onPressOut={animateOut}
      // --- Production HitSlop (Crucial for small tap targets) ---
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} tab`}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
        {isActive && (
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
        )}
        <FontAwesome6
          name={ICON_MAP[icon]}
          size={isActive ? 28 : 24} // Slightly reduced to prevent layout shifting
          color="#FFFFFF"
        />
        {isActive && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
};

export const useNavController = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // --- Sync Redux with Pathname (The "Single Source of Truth" Pattern) ---
  useEffect(() => {
    dispatch(setActiveRoute(pathname));
  }, [pathname, dispatch]);

  const handlePress = useCallback((route) => {
    // Avoid re-navigating to the same route
    if (pathname === route && route !== '/search') return;

    if (route === '/search') {
      dispatch(openSearch());
      if (pathname !== '/search') router.push('/search');
    } else {
      router.push(route);
    }
  }, [router, pathname, dispatch]);

  const navIcons = useMemo(() => {
    return NAV_ITEMS.map((item) => (
      <NavIcon
        key={item.id}
        icon={item.icon}
        label={item.label}
        route={item.route}
        isActive={pathname === item.route}
        onPress={handlePress}
      />
    ));
  }, [pathname, handlePress]);

  return { navIcons };
};

const styles = StyleSheet.create({
  // --- Layout & Touch Targets ---
  navIconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44, // Minimum touch target height
    width: 44,  // Minimum touch target width
  },

  // --- Animation & Feedback Elements ---
  glowRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1EC6D9',
    opacity: 0.3,
    // Elevation for Android
    elevation: 8,
    // Shadows for iOS
    shadowColor: '#1EC6D9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },

  // --- Active State Indicators ---
  activeDot: {
    position: 'absolute',
    bottom: -10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1EC6D9',
  },
});