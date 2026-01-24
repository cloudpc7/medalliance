// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { sendConnectionRequest } from '../../../redux/slices/messaging.slice';
import { clearError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import LoadingSpinner from '../../../ui/common/LoadingSpinner';
import ErrorBanner from '../../../utils/errors/ErrorBanner';

/**
 * ProfileHeader
 * 
 * The top section of the ExtendedProfile overlay, displaying the user's photo, name, role, college, and online status.
 * 
 * Functionality:
 * - Shows a full-width background avatar image (with dark fallback if none exists)
 * - Displays role badge, online/offline indicator, name, institution, and subtitle (degree or profession)
 * - Provides primary actions:
 *   • "Connect" button → sends a connection request (changes to "Pending" once sent)
 *   • "Chat" button → appears only when already connected, navigates to direct chat
 * - Includes a close (X) button to dismiss the overlay
 * - Uses Redux messaging state to accurately reflect current relationship status
 * 
 * Purpose:
 * Serves as the visually prominent header that identifies the user and enables immediate connection or messaging actions.
 */

const ProfileHeader = ({ profile, onClose }) => {
  // --- Redux Variables and State ---
  const dispatch = useDispatch();
  const router = useRouter();

  const { 
    connectionsData = [], 
    outgoingRequests = [], 
    incomingRequests = [] 
  } = useSelector((state) => state.messaging);

  // Global Slices
  const activeRequests = useSelector((state) => state.loading.activeRequests);
  const globalError = useSelector((state) => state.error.message);
  const errorType = useSelector((state) => state.error.type);

  // Local Constants
  const { avatarUrl, name, accountType, College, degree, major_minor, profession, occupation, online } = profile;
  const targetId = profile.uid || profile.id;
  const hasImage = avatarUrl && avatarUrl.trim().length > 0;
  const isLoading = activeRequests > 0;

  // --- Relationship Logic (Memoized for Performance) ---
  const { isConnected, isPending } = useMemo(() => {
    const connected = connectionsData.some((conn) => conn.id === targetId);
    const outgoing = outgoingRequests.includes(targetId);
    const incoming = incomingRequests.some((req) => req.id === targetId);
    return { isConnected: connected, isPending: outgoing || incoming };
  }, [connectionsData, outgoingRequests, incomingRequests, targetId]);

  const subtitle = accountType?.toLowerCase() === 'professor'
    ? profession || occupation || 'Professor'
    : `${degree || ''}${degree && major_minor ? ' • ' : ''}${major_minor || ''}`;
  
  const statusColor = online ? '#22c55e' : '#9ca3af';

  // --- Effect: Handle Async Errors ---
  useEffect(() => {
    // We only clear/handle errors specifically related to the messaging flow here
    if (globalError && errorType === 'messaging') {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: globalError,
        position: 'bottom',
      });
    }
  }, [globalError, errorType]);

  /**
   * handleConnectionPress
   * Dispatches the thunk and uses .unwrap() to handle local success feedback.
   */
  const handleConnectionPress = async () => {
    if (isConnected || isPending || isLoading) return;

    try {
      await dispatch(sendConnectionRequest(targetId)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Connection request sent!',
        position: 'bottom',
        bottomOffset: 120,
      });
    } catch (error) {
      // Error is caught by the global errorSlice and handled via the useEffect above
    }
  };

  const getConnectIcon = () => {
    if (isConnected) return "user-check";
    if (isPending) return "user-clock";
    return "user-plus";
  };

  return (
    <View style={[styles.headerImage, !hasImage && styles.headerFallback]}>
      {/* 1. Background Image */}
      {hasImage && (
        <Image 
          source={{ uri: avatarUrl }} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover" 
          accessible={true}
          accessibilityLabel={`Background image for ${name}`}
        />
      )}

      {/* 2. Global Error Banner (Optional specific UI) */}
      {globalError && errorType === 'messaging' && (
        <View style={styles.errorContainer}>
           <ErrorBanner 
            message={globalError} 
            onDismiss={() => dispatch(clearError())} 
          />
        </View>
      )}

      {/* 3. Close Button */}
      <Pressable 
        onPress={onClose} 
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Close profile"
      >
        <FontAwesome6 name="xmark" size={20} color="#fff" />
      </Pressable>

      {/* 4. Bottom Content Overlay */}
      <View style={styles.headerContent}>
        
        {/* Role and Online Status Pills */}
        <View style={styles.pillsRow}>
          {accountType && (
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{accountType.toUpperCase()}</Text>
            </View>
          )}
          <View 
            style={[styles.onlinePill, { borderColor: statusColor }]}
            accessible={true}
            accessibilityLabel={`Status: ${online ? 'Online' : 'Offline'}`}
          >
            <View style={[styles.onlineDot, { backgroundColor: statusColor }]} />
            <Text style={styles.onlineText}>{online ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        {/* User Info */}
        <Text style={styles.nameText}>{name || 'Unknown User'}</Text>
        <Text style={styles.collegeText}>{College || 'Institution not set'}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          
          {/* Connection Request Button */}
          <Pressable 
            style={[
                styles.actionButton, 
                (isConnected || isPending) && styles.disabledButton,
                isLoading && { opacity: 0.8 }
            ]}
            onPress={handleConnectionPress}
            disabled={isConnected || isPending || isLoading}
            accessibilityRole="button"
            accessibilityState={{ disabled: isConnected || isPending || isLoading }}
            accessibilityLabel={isConnected ? "Connected" : isPending ? "Connection pending" : "Send connection request"}
          >
            {isLoading ? (
              <LoadingSpinner size={22} color="#fff" />
            ) : (
              <>
                <FontAwesome6 name={getConnectIcon()} size={24} color="#fff" />
                {(isConnected || isPending) && (
                    <Text style={styles.actionLabel}>
                        {isConnected ? 'Connected' : 'Pending'}
                    </Text>
                )}
              </>
            )}
          </Pressable>

          {/* Chat Button */}
          {isConnected && (
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push({
                  pathname: '/chat',
                  params: { otherUserId: targetId, otherUserName: name }
              })}
              accessibilityRole="button"
              accessibilityLabel={`Start chat with ${name}`}
            >
              <FontAwesome6 name="comment" size={22} color="#fff" />
            </Pressable>
          )}
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerImage: { 
    width: '100%', 
    height: 340, 
    justifyContent: 'flex-end' 
  },
  headerFallback: { 
    backgroundColor: '#0F0F0F' 
  },
  errorContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    zIndex: 50,
  },
  headerContent: { 
    backgroundColor: 'rgba(0,0,0,0.55)', 
    paddingBottom: 26, 
    paddingHorizontal: 24, 
    paddingTop: 20 
  },
  pillsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  rolePill: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    marginRight: 10 
  },
  rolePillText: { 
    fontFamily: 'Prompt-Medium',
    fontSize: 12, 
    letterSpacing: 1, 
    color: '#fff',  
  },
  onlinePill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20, 
    borderWidth: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  onlineDot: { 
    width: 7, 
    height: 7, 
    borderRadius: 4, 
    marginRight: 6 
  },
  onlineText: {
    fontFamily: 'Prompt-Medium', 
    fontSize: 12, 
    color: '#fff', 
  },
  nameText: { 
    fontFamily: 'LibreFranklin-Bold',
    fontSize: 32, 
    color: '#fff' 
  },
  collegeText: { 
    fontFamily:'Prompt-Regular',
    color: '#fff', 
    fontSize: 16, 
    marginTop: 4, 
  },
  subtitleText: { 
    color: '#17A0BF', 
    fontSize: 18, 
    marginTop: 4, 
    fontWeight: '700' 
  },
  actionRow: { 
    flexDirection: 'row', 
    marginTop: 22, 
    alignItems: 'center' 
  },
  actionButton: { 
    backgroundColor: '#126DA6', 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 30, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  disabledButton: {
    backgroundColor: '#334155',
    opacity: 0.9,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10
  }
});

export default ProfileHeader;