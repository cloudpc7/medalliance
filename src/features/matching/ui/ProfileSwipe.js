// 🔥 Production Ready
import React, { useCallback, memo, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { openProfile, setProfileIndex, swipeProfile, previousProfile,selectedProfiles, selectedProfileIds, selectCurrentProfileId  } from '../../../redux/slices/profiles.slice';
import ProfileCard from './ProfileCard';

const ProfileSwipe = () => {
  const dispatch = useDispatch();
  const swiperRef = useRef(null);

  const profiles = useSelector(selectedProfiles); 
  const visibleIds = useSelector(selectedProfileIds); 
  const currentProfileId = useSelector(selectCurrentProfileId);
  const currentIndex = useMemo(
  () => visibleIds.indexOf(currentProfileId),
  [visibleIds, currentProfileId]
);

  // --- Swipe Handlers ---
  const handleSwipedLeft = useCallback(() => {
    dispatch(previousProfile());
  }, [dispatch]);

  const handleSwipedRight = useCallback(() => {
    dispatch(swipeProfile());
  }, [dispatch]);

  const handleTapCard = useCallback((idx) => {
    const profile = profiles[idx];
    if (!profile) return;
    dispatch(setProfileIndex(idx));
    dispatch(openProfile(profile));
  }, [profiles, dispatch]);



  // --- Render Profile Card ---
  const renderProfileCard = useCallback((profile, index) => {
  if (!profile) return null;
  const imageUri = typeof profile.avatarUrl === 'string' && profile.avatarUrl.trim() ? profile.avatarUrl : null;
  return <ProfileCard key={`${profile.id || profile.uid}-${index}`} profile={profile} imageUri={imageUri} />;
}, []);

  if (!profiles || profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="filter-variant-remove" size={60} color="#4B5563" />
        <Text style={styles.emptyTitle}>No Matching Profiles</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any results matching your current criteria. Adjust filters or check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        key={profiles.length}
        cards={profiles}
        cardIndex={currentIndex}
        renderCard={renderProfileCard}
        onSwipedLeft={handleSwipedLeft}
        onSwipedRight={handleSwipedRight}
        onTapCard={handleTapCard}
        stackSize={3}
        infinite={true}
        verticalSwipe={false}
        animateCardOpacity={true}
        showSecondCard={false}
        goBackToPreviousCardOnSwipeLeft={true}
        cardHorizontalMargin={0}
        cardVerticalMargin={0}
        backgroundColor="transparent"
        containerStyle={styles.swiperContainer}
        cardStyle={styles.cardStyle}
      />
    </View>
  );
};

export default memo(ProfileSwipe);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  swiperContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    height: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
