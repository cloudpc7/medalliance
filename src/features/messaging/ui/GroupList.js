// --- React Core Libraries and Modules ---
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { openSearch, setGroupId, deleteGroupChat } from '../../../redux/slices/messaging.slice';

// --- Custom UI Components ---
import Avatar from '../../profile/ui/Avatar';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';
import ErrorBanner from '../../../utils/errors/ErrorBanner';

/**
 * GroupList
 * 
 * A list component displaying all the user's current group chats.
 * 
 * Functionality:
 * - Fetches group data from Redux and shows loading spinner or error banner as needed
 * - For each group, renders:
 *   • Group name with a delete (trash) button (confirms via Alert before dispatching deleteGroupChat)
 *   • Overlapping avatars of group members with cleaned first names below
 *   • A "+" button to open the member search/add interface (dispatches openSearch + setGroupId)
 *   • A "Send Message" button that navigates to the group chat screen (with channelId and isGroup flag)
 * - Displays an empty state message when no groups exist
 * 
 * Purpose:
 * Provides a compact, interactive overview of the user's groups within the MessagingScreen's "Groups" section.
 */

const GroupList = () => {

  // Expo Router Variables
  const router = useRouter(); 
  // --- Redux Variables and State ---
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { groupData } = useSelector((state) => state.messaging);

  // --- Handler functions ---
  const handleOpenSearch = (groupId) => {
    dispatch(setGroupId(groupId));
    dispatch(openSearch());
  };

  const handleMessage = (groupId, groupName) => {
    if (!user?.uid || !groupId) return;

    router.push({
      pathname: '/(app)/chat',
      params: { 
        channelId: groupId,       
        otherUserName: groupName,  
        isGroup: 'true'
      }
    });
  };

  const handleDeleteGroup = (groupId, groupName) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteGroupChat(groupId));
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.wrapper}>
      {groupData.length === 0 ? (
        <Text style={styles.emptyText}>No groups yet. Create one to get started!</Text>
      ) : (
        groupData.map((group) => {
          const { groupId, members, groupName } = group;
          return (
            <View key={groupId} style={styles.container}>
              <View style={styles.headerRow}>
                <Text style={styles.header}>{groupName}</Text>
                <Pressable
                  onPress={() => handleDeleteGroup(groupId, groupName)}
                  style={styles.trashBtn}
                >
                  <FontAwesome6 name="trash-can" size={20} color="#A61212" />
                </Pressable>
              </View>

              <View style={styles.avatarRow}>
                {members.map((member, index) => (
                  <View
                    key={member.id || index}
                    style={[
                      styles.avatarWrap,
                      { marginLeft: index === 0 ? 0 : styles._overlapStyle.margin, zIndex: 1000 - index },
                    ]}
                  >
                    <Avatar avatarImage={member.avatarUrl} />
                    <Text style={styles.memberName} numberOfLines={1}>
                      {(member.name || 'User').replace(/^Dr\.?\s+/i, '').split(' ')[0]}
                    </Text>
                  </View>
                ))}

                <Pressable
                  onPress={() => handleOpenSearch(groupId)}
                  style={[styles.addBtn, { marginLeft: members.length ? styles._addOverlapStyle.margin : 0 }]}
                >
                  <FontAwesome6 name="plus" size={16} color="#fff" />
                </Pressable>
              </View>
              <Pressable 
                onPress={() => handleMessage(groupId, groupName)} 
                style={styles.sendBtn}
              >
                <FontAwesome6 name="paper-plane" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.sendText}>Send Message</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
};

export default GroupList;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  _size: { 
    avatar: 50 
  },
  _overlapStyle: {
    margin: -18 
  },
  _addOverlapStyle: { 
    margin: -(18 * 0.8) 
  },
  wrapper: { 
    width: '100%', 
    alignItems: 'center', 
    paddingTop: 10 
  },

  // --- Layout and structure ---
  container: {
    width: '92%',
    maxWidth: 342,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },

  // --- Header & Title ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },

  // --- Button & Actions ---
  trashBtn: {
    padding: 8,
    borderRadius: 20,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1EC6D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sendBtn: {
    marginTop: 16,
    backgroundColor: '#126DA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignSelf: 'center',
  },

  // --- Avatars --- 
  avatarRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  avatarWrap: { 
    alignItems: 'center'
  },
  memberName: { 
    fontSize: 12, 
    color: '#0D0D0D', 
    marginTop: 4, 
    width: 58, 
    textAlign: 'center' 
  },
  
  // -- Alerts & Messages ---
  sendText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#0D0D0D', 
    textAlign: 'center', 
    marginTop: 40 
  },
});