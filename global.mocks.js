// Mock Redux Store
jest.mock('./src/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
  persistor: {
    subscribe: jest.fn(),
    getState: jest.fn(),
    purge: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock Error Boundary
jest.mock('./src/ui/common/ErrorBoundary', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }) => (
      <View testID="mock-error-boundary">{children}</View>
    ),
  };
});

// Mock Hooks
jest.mock('./src/features/auth/utils/router', () => ({
  useAuthRouter: jest.fn(),
}));

jest.mock('./src/utils/fontsandicons/Fonts', () => ({
  useAppFonts: jest.fn(),
}));

jest.mock('./src/features/auth/utils/guards', () => ({
  isUserAllowed: jest.fn(() => true),
}));

// Mock Redux Slices
jest.mock('./src/redux/slices/profile.slice', () => ({
  setProfileData: jest.fn((payload) => ({ type: 'SET_PROFILE_DATA', payload })),
  updateProfileField: jest.fn((payload) => ({ type: 'UPDATE_PROFILE_FIELD', payload })),
  submitProfileForm: jest.fn((payload) => ({ type: 'SUBMIT_PROFILE_FORM', payload })),
}));

// API Utilities
jest.mock('./src/utils/apiUtilities/api', () => ({
  callGetUserProfile: jest.fn(),
  callUpdateAccountField: jest.fn(),
  updateAccount: jest.fn(() => Promise.resolve()),
  callGetProfileConfig: jest.fn(),
  callSubmitProfileData: jest.fn(),
}));

// Firebase
jest.mock('./src/config/firebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
  initializeAuth: jest.fn(() => ({})),
}));
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/functions', () => ({ getFunctions: jest.fn(() => ({})) }));

// Expo Router (CRITICAL FIX APPLIED HERE for params)
jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');

  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();
  const mockUseRouter = jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }));
  const mockUseSegments = jest.fn().mockReturnValue([]);
  
  // FIX: This must be a jest.fn() to work with .mockReturnValue in tests
  const mockUseLocalSearchParams = jest.fn().mockReturnValue({});

  const MockedScreen = ({ children }) => <>{children}</>;
  const Stack = ({ children, guard }) => {
    if (guard && typeof guard === 'function') {
      return <View testID="mock-protected-stack">{children}</View>;
    }
    return <View testID="mock-stack-group">{children}</View>;
  };
  Stack.Screen = MockedScreen;
  Stack.Protected = MockedScreen;

  return {
    __esModule: true,
    Stack,
    Link: (props) => <View {...props}>{props.children}</View>,
    useRouter: mockUseRouter,
    useSegments: mockUseSegments,
    useLocalSearchParams: mockUseLocalSearchParams,
    __mockRouter: {
      mockUseRouter,
      mockPush,
      mockReplace,
      mockBack,
      mockUseLocalSearchParams,
    },
  };
});

// Safe Area
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => <View testID="mock-safe-area-provider">{children}</View>,
    SafeAreaView: (props) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 320, height: 640 }),
  };
});

// Redux Integration
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => <>{children}</>,
}));
jest.mock('react-redux', () => ({
  Provider: ({ children }) => <>{children}</>,
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(),
}));

// Native Mocks
jest.mock('react-native/Libraries/Image/ImageBackground', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Expo Modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true, type: 'wifi' })),
  addEventListener: jest.fn(() => jest.fn()),
}));
jest.mock('react-native-toast-message', () => {
  const { View } = require('react-native');
  return { show: jest.fn(), default: () => <View testID="mock-toast-message" /> };
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const IconMock = (props) => <Text {...props}>{props.name}</Text>;
  return { Ionicons: IconMock, MaterialIcons: IconMock, FontAwesome6: IconMock };
});
jest.mock('react-native-credentials-manager', () => ({
  signIn: jest.fn(() => Promise.resolve({ success: true })),
  signOut: jest.fn(() => Promise.resolve()),
}));

// Custom Components
jest.mock('./src/features/auth/ui/GoogleSignInButton', () => {
  const { View, Text } = require('react-native');
  return (props) => <View testID="mock-google-sign-in-button" {...props}><Text>Google Sign In</Text></View>;
});
jest.mock('./src/ui/common/LinkingComponent', () => {
  const { View } = require('react-native');
  return (props) => <View testID="mock-linking-component" {...props} />;
});
jest.mock('./src/ui/common/LoadingSpinner', () => {
  const { View } = require('react-native');
  return (props) => <View testID="loading-spinner" {...props} />;
});

// Assets & Utils
jest.mock('./src/config/assets', () => ({ LoginBackground_URL: 'mock-login-background-uri.jpg' }));
jest.mock('lodash', () => ({ debounce: (fn) => fn }));

// React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  const MockRadioButton = ({ value, status, onPress, ...rest }) => (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: status === 'checked' }} {...rest}>
      <Text>{value}</Text>
    </Pressable>
  );
  const Group = ({ value, onValueChange, children, ...rest }) => (
    <View testID="mock-radio-group" {...rest}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          status: child.props.value === value ? 'checked' : 'unchecked',
          onPress: () => onValueChange && onValueChange(child.props.value),
        });
      })}
    </View>
  );
  MockRadioButton.Group = Group;
  return { RadioButton: MockRadioButton };
});

// UI Gradients/Blur
jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: (props) => <View {...props} /> };
});
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props) => <View {...props} /> };
});

// React Native Reanimated (Manual Fallback)
// This is kept as a backup if the official setup at the top doesn't work for your version
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Animated = {
    View: React.forwardRef((props, ref) => <View ref={ref} {...props} />),
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    FadeIn: { duration: () => ({}), delay: () => ({}), springify: () => ({}) },
    FadeOut: { duration: () => ({}), delay: () => ({}) },
    FadeInUp: { duration: () => ({}), delay: () => ({}) },
    FadeInDown: { duration: () => ({}), delay: () => ({}) },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => fn(),
    withTiming: (v) => v,
    withSpring: (v) => v,
    __reanimatedWorkletInit: () => {},
  };
});