import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView, SafeAreaView } from 'react-native';

/**
 * ErrorBoundary
 * * A React Class Component that acts as a catch-all for JavaScript errors 
 * * anywhere in the child component tree.
 * * * * Logic:
 * * 1. Catches errors during rendering, lifecycle methods, and constructors.
 * * 2. Displays a detailed stack trace in Development mode.
 * * 3. Displays a user-friendly generic message in Production mode.
 * * 4. Provides a "Reload" mechanism to attempt to reset the app state.
 */
class ErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    error: null 
  };

  /**
   * getDerivedStateFromError
   * * Lifecycle method called after an error is thrown.
   * * Updates state so the next render will show the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch
   * * Lifecycle method used for logging error information.
   * * Useful for sending reports to services like Sentry, Bugsnag, or Firebase Crashlytics.
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    throw new Error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // --- Development UI: Detailed Stack Trace ---
      if (__DEV__) {
        return (
          <SafeAreaView style={styles.devContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.devTitle}>APP CRASHED</Text>
              <Text style={styles.devSubtitle}>
                A critical error occurred while rendering the app.
              </Text>

              <View style={styles.detailsBox}>
                <Text style={styles.label}>Error:</Text>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>

                <Text style={styles.label}>Stack Trace:</Text>
                <Text style={styles.stackText}>{this.state.error?.stack}</Text>
              </View>

              <View style={styles.buttonWrapper}>
                <Button title="Attempt App Reload" onPress={this.handleReload} color="#126DA6" />
              </View>
            </ScrollView>
          </SafeAreaView>
        );
      }

      // --- Production UI: User Friendly Fallback ---
      return (
        <View style={styles.prodContainer}>
          <Text style={styles.prodTitle}>Oops!</Text>
          <Text style={styles.prodMessage}>Something went wrong.</Text>
          <Button title="Try Again" onPress={this.handleReload} />
        </View>
      );
    }

    // --- Normal Render ---
    return this.props.children;
  }
}

export default ErrorBoundary;

// --- Styles ---
const styles = StyleSheet.create({
  // Development Styles
  devContainer: {
    flex: 1,
    backgroundColor: '#330000', // Dark Red
  },
  scrollContent: {
    padding: 20,
  },
  devTitle: {
    color: '#FF4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  devSubtitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  detailsBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    color: '#FFD700', // Gold
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  errorText: {
    color: 'white',
    fontFamily: 'Courier',
    marginBottom: 10,
  },
  stackText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 40,
  },

  // Production Styles
  prodContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  prodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  prodMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});