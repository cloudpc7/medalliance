// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { Text, StyleSheet, View, Pressable, } from 'react-native';

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux';
import { fetchConnections } from '../../../redux/slices/messaging.slice';

// --- Expo Libraries and Modules ----
import { useRouter } from 'expo-router';

// --- Custom UI Components ---
import Avatar from '../../profile/ui/Avatar';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

/**
 * ConnectionsList
 * 
 * A compact, horizontal/grid list displaying the user's active direct connections.
 * 
 * Functionality:
 * - Fetches connections from Redux on mount
 * - Renders each connection as a tappable Avatar with cleaned first name below
 * - On tap, generates a unique, consistent channel ID (sorted UID combo) and navigates to ChatScreen with required params (channelId, otherUserName, otherUserAvatar)
 * 
 * Purpose:
 * Provides quick access to start or resume 1-on-1 chats from the MessagingScreen's "Direct Connections" section.
 */

const ConnectionsList = () => {
  // --- Redux Variables and State ---
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { connectionsData } = useSelector((state) => state.messaging);

  /**
   * handleMessage
   * Generates a unique channel ID and pushes to the ChatScreen with params.
   */
  const handleMessage = (targetUserId, targetUserName, targetAvatar) => {
    if (!user?.uid || !targetUserId) return;
    const sortedIds = [currentUser.uid, targetUserId].sort();
    const channelId = `${sortedIds[0].substring(0, 30)}_${sortedIds[1].substring(0, 30)}`;

    router.push({
      pathname: '/(app)/chat',
      params: { 
        channelId: channelId,
        otherUser: targetUserId,
        otherUserName: targetUserName,   
        otherUserAvatar: targetAvatar
      }
    });
  };

  return (
    <View style={styles.wrapper}>
      {connectionsData.length === 0 ? (
        <Text style={styles.emptyText}>No connections yet.</Text>
      ) : (
        <View style={styles.gridContainer}>
          {connectionsData.map((connection) => {
            const { id, name, avatarUrl } = connection;
            const cleanedName = (name || 'User')
              .replace(/^Dr\.?\s+|^Prof\.?\s+/i, '')
              .split(' ')[0];

            return (
              <View key={id} style={styles.avatarItem}>
                <Pressable onPress={() => handleMessage(id, cleanedName, avatarUrl)}>
                  <Avatar avatarImage={avatarUrl} />
                </Pressable>
                
                <Text style={styles.memberName} numberOfLines={1}>
                  {cleanedName}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ConnectionsList;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  wrapper: {
    width: '100%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 20,
    paddingHorizontal: 8,
  },

  // --- Avatar ---
  avatarItem: {
    width: 60,
    alignItems: 'center',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0D0D0D',
    textAlign: 'center',
    marginTop: 6,
    width: '100%',
  },

  // --- Typography ---
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    textAlign: 'center',
  },
  
  // Buttons & Actions ---
  retryButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 6,
  },
  retryText: {
    color: '#126DA6',
    fontSize: 12,
    fontWeight: '600',
  }
});