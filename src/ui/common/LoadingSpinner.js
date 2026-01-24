import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useSpring, animated } from '@react-spring/native';

const { width } = Dimensions.get('window');
const SPINNER_SIZE = width * 0.15;
const DEFAULT_COLOR = '#17A0BF';
const DEFAULT_DURATION = 500;

export default function LoadingSpinner({
  size = SPINNER_SIZE,
  color = DEFAULT_COLOR,
  duration = DEFAULT_DURATION,
}) {
  const rotation = useSpring({
    from: { rotate: '0deg' },
    to: { rotate: '360deg' },
    loop: true,
    config: { duration },
  });

  return (
    <animated.View
      testID="loading-spinner"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 4,
        borderTopColor: color,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        transform: [{ rotate: rotation.rotate }],
      }}
    />
  );
}
