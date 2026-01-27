// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { memo, useMemo } from 'react';
import { ImageBackground, StyleSheet, useWindowDimensions, Text, View } from 'react-native';

// --- Assets ---
const defaultAvatar = require('../../../../assets/medAllianceIcon3.png');

/**
 * ProfileCard
 * * The main visual card displayed in the swipe deck on the MatchingScreen.
 * * Functionality:
 * - Renders a full-width background image (or dark fallback if no image)
 * - Shows key profile info: name, role badge (student/professor), degree/occupation, college, and relevant subtitles
 * - Adapts content display based on account type (student vs professor)
 * - Includes a "View Full Profile" tap hint to indicate expandability
 * - Optimized with memoization and useMemo to prevent unnecessary re-renders in the swipe deck
 * - Provides a screen-reader-friendly accessibility summary
 * * Purpose:
 * Serves as the compact, visually rich representation of a user during browsing and swiping.
 */
const ProfileCard = ({ profile, imageUri }) => {

  // --- Derived State Variables --- 
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { id, name, accountType, major_minor, profession, College, degree, department, occupation } = profile;
  const safeName = name || 'Unknown';
  const isProfessor = accountType === 'professor';
  
  const fallback = useMemo(() => {
    return !(typeof imageUri === 'string' && imageUri.trim().length > 0);
  }, [imageUri]);

  const imageSource = useMemo(() => {
    if (typeof imageUri === 'string' && imageUri.trim().length > 0) {
      return { uri: imageUri };
    }
    return defaultAvatar;
  }, [imageUri]);

  const hasImage = true;

  const a11ySummary = useMemo(() => {
    return isProfessor
      ? `${safeName}, professor in ${department || 'medical faculty'} at ${College || 'unknown school'}.`
      : `${safeName}, ${degree || 'medical student'} at ${College || 'unknown school'}${major_minor ? `, focus on ${major_minor}` : ''}.`;
  }, [isProfessor, safeName, department, College, degree, major_minor]);

  // --- Conditional Wrapper Logic ---
  const ContainerComponent = ImageBackground;
  
  // Refactored container props for single style object handling
  const containerProps = hasImage 
    ? { 
        source: imageSource, 
        resizeMode: fallback ? "contain" : "cover",
        testID: `profile-card-image-${id || 'unknown'}`
      } 
    : { 
        style: [styles.image, styles.fallbackImage, { width: SCREEN_WIDTH }],
        testID: `profile-card-view-${id || 'unknown'}`
      };

  return (
    <ContainerComponent
      key={hasImage ? `${id || 'unknown'}-${imageUri}` : `${id || 'unknown'}-no-image`}
      {...containerProps}
      style={hasImage ? [styles.image, { width: SCREEN_WIDTH }] : containerProps.style}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={a11ySummary}
      accessibilityHint="Double tap to view full profile details"
    >
      <View style={styles.contentWrapper}>
        
        <View
          style={styles.overlay}
          testID={`profile-card-overlay-${id || 'unknown'}`}
        >
          {accountType && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{accountType}</Text>
            </View>
          )}
          <Text
            style={styles.name}
            accessibilityRole="header"
          >
            {safeName}
          </Text>

          {/* Contextual Subtitles (Role-dependent) */}
          {isProfessor ? (
            <>
              <Text style={styles.subText}>
                {profession || occupation}
                {department ? ` · ${department}` : ''}
              </Text>
              {College && <Text style={styles.college}>{College}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.subText}>
                {degree}
                {degree && major_minor ? ' · ' : ''}
                {major_minor}
              </Text>
              {College && <Text style={styles.college}>{College}</Text>}
            </>
          )}
        </View>
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapHintText}>
            View Full Profile
          </Text>
        </View>
        
      </View>
    </ContainerComponent>
  );
};

export default memo(ProfileCard);

const styles = StyleSheet.create({
  image: {
    height: '100%',
    overflow: 'hidden',
  },
  fallbackImage: {
    backgroundColor: '#020617',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 60, 
  },
  
  // Information Card
  overlay: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    marginBottom: 24,
  },
  
  // Typography & Badges
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: 6,
  },
  badgeText: {
    fontFamily: 'Prompt-Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#f5f5f5',

  },
  name: {
    fontFamily: 'Prompt-Medium',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 2,
  },
  subText: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    color: '#e8e8e8',
    marginBottom: 2,
  },
  college: {
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
    color: '#d3d3d3',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Action Hint (Pill)
  tapHintContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  tapHintText: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    color: '#F9FAFB',
    fontFamily: 'Prompt-Regular',
    fontSize: 16,
  },
});