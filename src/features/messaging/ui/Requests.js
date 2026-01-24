// --- React Core Libraries and Modules ---
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { acceptConnectionRequest, declineConnectionRequest} from '../../../redux/slices/messaging.slice';

// --- Custom UI Components ---
import Avatar from '../../profile/ui/Avatar';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

/**
 * Requests
 * 
 * A list component displaying only incoming connection requests from other users.
 * 
 * Functionality:
 * - Fetches incoming requests on mount via Redux
 * - Shows loading spinner while fetching
 * - For each request, renders:
 *   • User's avatar and name
 *   • "Pending" status
 *   • Accept (green check) and Decline (red X) buttons
 * - On accept/decline, dispatches the corresponding Redux action and shows a toast confirmation
 * - Displays an empty state message when no incoming requests exist
 * 
 * Purpose:
 * Allows users to review and respond to pending connection requests in the MessagingScreen's "Connection Requests" section.
 */

const Requests = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { incomingRequests,  requestActionLoading } = useSelector((state) => state.messaging);

  // --- Handler Functions ---
  const handleAccept = async (targetId) => {
    try {
      await dispatch(acceptConnectionRequest(targetId)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Connection accepted!',
        position: 'bottom',
        bottomOffset: 120,
    });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to accept request',
        text2: error?.message || 'Please try again',
        position: 'bottom',
        bottomOffset: 120,
      });
    };
    
    
  };

  const handleDecline = async (targetId) => {
    try {
      await dispatch(declineConnectionRequest(targetId)).unwrap();
      Toast.show({
        type: 'info',
        text1: 'Connection request declined',
        position: 'bottom',
        bottomOffset: 120,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to accept request',
        text2: error?.message || 'Please try again',
        position: 'bottom',
        bottomOffset: 120,
      });
    }
  };


  if (incomingRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No incoming connection requests</Text>
      </View>
    );
  }

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Requests ({incomingRequests.length})</Text>
      {incomingRequests.map((request) => {
        const isProcessing = !!requestActionLoading?.[request.id];
        return (
          <View key={request.id} style={styles.requestItem}>
            <Avatar avatarImage={request.avatarUrl} />
            <View style={styles.info}>
              <Text style={styles.name}>{request.name || 'Unknown User'}</Text>
              <Text style={styles.status}>Pending</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => handleAccept(request.id)} style={styles.acceptBtn} disabled={isProcessing}>
                {
                  isProcessing ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    <FontAwesome6 name="check" size={20} color="#fff" />
                  )
                }
                
              </Pressable>
              <Pressable onPress={() => handleDecline(request.id)} style={styles.declineBtn} disabled={isProcessing}>
                 {
                  isProcessing ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    <FontAwesome6 name="xmark" size={20} color="#fff" />
                  )
                }
              </Pressable>
            </View>
          </View>
        );
        
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: { 
    width: '100%', 
    paddingHorizontal: 24 
  },

  // --- Header / Title ---
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#126DA6', 
    marginBottom: 16, 
    textAlign: 'center' 
  },

  // --- Requests container ---
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: { 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#64748B' 
  },

  // --- Request information ---
  info: { 
    flex: 1, 
    marginLeft: 16 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },
  status: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 4 
  },
  actions: { 
    flexDirection: 'row', 
    gap: 12 
  },

  // --- Buttons & Actions ---
  acceptBtn: { 
    backgroundColor: '#22c55e', 
    padding: 10, 
    borderRadius: 20 
  },
  declineBtn: { 
    backgroundColor: '#ef4444', 
    padding: 10, 
    borderRadius: 20 
  },
  
});

export default Requests;