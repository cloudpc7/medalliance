// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// --- Custom Utilities ---
import { Link } from '../../utils/Linking/LinkHelpers';

// --- Configuration / Constants ---
const PRIVACY_POLICY_URL = 'https://github.com/cloudpc7/MedAlliancePrivacyPolicy';
const TERMS_AND_CONDITIONS_URL = 'https://github.com/cloudpc7/medallianceterms';

/**
 * LinkComponent
 * 
 * A footer component that displays links to the app's Privacy Policy and Terms & Conditions.
 * 
 * Functionality:
 * - Renders two underlined text links centered in a column
 * - Wraps each link in a custom <Link> utility component for safe external URL opening
 * - Accepts an optional linkStyle prop to override default text styling
 * - Uses hardcoded GitHub Pages URLs for static legal documents
 * 
 * Purpose:
 * Provides quick, consistent access to required legal documents from screens like login, onboarding, or settings, ensuring compliance and transparency.
 */

const LinkComponent = ({ linkStyle }) => {
  return (
    <View style={styles.container}>
      {/* Privacy Policy */}
      <Link url={PRIVACY_POLICY_URL}>
        <Text style={[styles.linkText, linkStyle]}>
          Privacy Policy
        </Text>
      </Link>

      {/* Terms & Conditions */}
      <Link url={TERMS_AND_CONDITIONS_URL}>
        <Text style={[styles.linkText, linkStyle]}>
          Terms & Conditions
        </Text>
      </Link>
    </View>
  );
};

export default LinkComponent;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    width: '100%',
    rowGap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Link Styles ---
  linkText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});