// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// --- Assets ---
const privacyPolicyFile = require('../../assets/privacy_policy.html');

/**
 * PrivacyPolicyScreen
 * 
 * A simple full-screen view that displays the app's static Privacy Policy document.
 * 
 * Functionality:
 * - Loads a local HTML file (privacy_policy.html) bundled in assets using react-native-webview
 * - Renders the policy content natively within a WebView for proper formatting and links
 * - Allows scaling and ensures full-screen coverage
 * - Shows loading state until HTML is rendered
 * 
 * Purpose:
 * Provides users easy access to the app's privacy policy (required for app store compliance and transparency) without needing an internet connection or external hosting.
 */

const PrivacyPolicyScreen = () => {
  return (
    <WebView 
      originWhitelist={['*']}
      source={privacyPolicyFile}
      style={styles.container}
      startInLoadingState={true}
      scalesPageToFit={true}
    />
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
   // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});