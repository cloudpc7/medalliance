import React from 'react';

export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockBack = jest.fn();
export const mockUseLocalSearchParams = jest.fn(() => ({}));

export const __mockRouter = {
  mockPush: mockPush,
  mockReplace: mockReplace,
  mockBack: mockBack,
};

jest.mock('./src/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
  persistor: {
    subscribe: jest.fn(),
    getState: jest.fn(),
    purge: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('./src/ui/common/ErrorBoundary', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }) => <View testID="mock-error-boundary">{children}</View>,
  };
});

jest.mock('./src/utils/fontsandicons/Fonts', () => ({
  useAppFonts: jest.fn(),
}));

jest.mock('./src/redux/slices/profile.slice', () => ({
  setProfileData: jest.fn((payload) => ({ type: 'SET_PROFILE_DATA', payload })),
  updateProfileField: jest.fn((payload) => ({ type: 'UPDATE_PROFILE_FIELD', payload })),
  submitProfileForm: jest.fn((payload) => ({ type: 'SUBMIT_PROFILE_FORM', payload })),
}));

jest.mock('./src/utils/apiUtilities/api', () => ({
  callGetUserProfile: jest.fn(),
  callUpdateAccountField: jest.fn(),
  updateAccount: jest.fn(() => Promise.resolve()),
  callGetProfileConfig: jest.fn(),
  callSubmitProfileData: jest.fn(),
}));

jest.mock('./src/config/firebaseConfig', () => ({ auth: {} }));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
  initializeAuth: jest.fn(() => ({})),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/functions', () => ({ getFunctions: jest.fn(() => ({})) }));

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    }),
    useSegments: jest.fn(() => []),
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    Stack: Object.assign(
      ({ children }) => <View testID="mock-stack">{children}</View>,
      {
        Screen: ({ children }) => <>{children}</>,
        Protected: ({ children }) => <View testID="mock-protected-stack">{children}</View>,
      }
    ),
    Link: ({ children, onPress, ...props }) => (
      <View onPress={onPress} {...props}>{children}</View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => <View testID="mock-safe-area-provider">{children}</View>,
    SafeAreaView: (props) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 320, height: 640 }),
  };
});

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => <>{children}</>,
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }) => <>{children}</>,
  useDispatch: jest.fn(() => jest.fn()),
  useSelector: jest.fn(),
}));

jest.mock('react-native/Libraries/Image/ImageBackground', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

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

jest.mock('@expo/vector-icons', () => ({
  FontAwesome6: (props) => {
    const { Text } = require('react-native');
    return <Text testID={props.testID}>{props.name}</Text>;
  },
}));

jest.mock('react-native-credentials-manager', () => ({
  signIn: jest.fn(() => Promise.resolve({ success: true })),
  signOut: jest.fn(() => Promise.resolve()),
}));

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

jest.mock('./src/config/assets', () => ({
  __esModule: true,
  LoginBackground_URL: 'mock-login-background-uri.jpg',
  default: { LoginBackground_URL: 'mock-login-background-uri.jpg' }
}), { virtual: true });

jest.mock('lodash', () => ({ debounce: (fn) => fn }));

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

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: (props) => <View {...props} /> };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props) => <View {...props} /> };
});

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

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const React = require('react');
  const { View, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: (props) => (
      <Pressable 
        {...props} 
        onPress={() => props.onValueChange(!props.value)} 
        testID={props.testID} 
      />
    ),
  };
});