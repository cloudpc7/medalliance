// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * ProfileDetails
 * 
 * Scrollable detailed view of a user's profile information, displayed in the lower half of the ExtendedProfile overlay.
 * 
 * Functionality:
 * - Adapts layout and content based on account type (student vs professor)
 * - Renders a personal quote at the top if one exists
 * - Organizes data into clean, card-style sections using the reusable InfoSection component
 * - Only shows fields that have values to keep the layout tidy
 * - Provides key academic/professional details, goals, mentorship preferences, and availability
 * 
 * Purpose:
 * Gives users a comprehensive, easy-to-read summary of another person's background and intentions within the app.
 */

const InfoSection = ({ title, fields }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {fields.map(([label, value], i) =>
      value ? (
        <Text key={i} style={styles.infoText}>
          <Text style={styles.bold}>{label}: </Text>
          {value}
        </Text>
      ) : null,
    )}
  </View>
);

const ProfileDetails = ({ profile }) => {
  // --- Component Properties ---
  const { accountType, degree, major_minor, profession, department, occupation,  mentor, formats, goals, quote, online, College} = profile;
  const isProfessor = accountType?.toLowerCase() === 'professor';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Section: Personal Quote */}
      {quote ? (
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteLabel}>Favorite Quote: </Text>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
      ) : null}

      {/* Section: Biographical Data */}
      {isProfessor ? (
        // --- Layout A: Professor Persona ---
        <>
          <InfoSection
            title="Professional Overview"
            fields={[
              ['Profession', profession || occupation],
              ['Degree', degree],
              ['Specialty / Focus', major_minor],
              ['Department', department],
            ]}
          />
          <InfoSection
            title="Teaching & Mentorship"
            fields={[
              ['Mentorship', mentor],
              ['Teaching Formats', formats],
              ['Goals', goals],
            ]}
          />
        </>
      ) : (
        // --- Layout B: Student Persona ---
        <>
          <InfoSection
            title="Academic Journey"
            fields={[
              ['Medical School', College || 'Unknown Medical School'],
              ['Program', degree],
              ['Current Focus', major_minor],
              ['Goals', goals],
            ]}
          />
          <InfoSection
            title="Engagement"
            fields={[
              ['Mentorship', mentor],
              ['Preferred Format', formats],
            ]}
          />
        </>
      )}
    </ScrollView>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
   // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140, 
  },

  // --- Cards & Sections --- 
  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    padding: 18, 
    marginBottom: 18, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    elevation: 3, 
  },
  
  // --- Typography ---
  sectionTitle: { 
    fontFamily: 'LibreFranklin-Medium',
    fontSize: 18, 
    fontWeight: '700', 
    color: '#17A0BF', 
    marginBottom: 12, 
  },
  infoText: { 
    fontFamily: 'Prompt-Regular',
    fontSize: 14, 
    color: '#0D0D0D', 
    lineHeight: 24, 
    marginBottom: 8, 
  },
  bold: { 
    fontFamily: 'Prompt-Medium', 
    fontSize: '16',
    color: '#0D0D0D', 
  },

  // --- Quote Component Styles ---
  quoteContainer: { 
    backgroundColor: '#fff', 
    marginVertical: 16, 
    borderRadius: 12, 
    padding: 16, 
    flexDirection: 'column', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    elevation: 2, 
  },
  quoteLabel: {
    fontFamily: 'Prompt-Medium',
    fontSize: 20,
    color: '#17A0BF',
    alignSelf: 'flex-start',
  },
  quoteText: { 
    fontFamily: 'Roboto', 
    color: '#0D0D0D', 
    fontSize: 16, 
    lineHeight: 24,
    flex: 1,
    alignSelf: 'flex-start', 
  },
});