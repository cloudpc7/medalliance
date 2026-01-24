// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { setError } from '../../../redux/slices/error.slice';

// --- Stream Chat Core Libraries and Modules
import { StreamChat } from 'stream-chat';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';

// --- Expo Libraries and Modules ----
import { useLocalSearchParams } from 'expo-router';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';


// Stream Variables
const STREAM_API_KEY = process.env.STREAM_API_KEY;
const client = StreamChat.getInstance(STREAM_API_KEY);

/**
 * ChatScreen
 * 
 * A full-featured direct messaging screen for one-on-one conversations using Stream Chat (via stream-chat-expo).
 * 
 * Functionality:
 * - Receives channelId, otherUser ID, and otherUserName via route params
 * - Connects to an existing Stream messaging channel and watches for updates
 * - Renders the chat interface with MessageList (conversation history) and MessageInput (text composer)
 
 * Purpose:
 * Provides a clean, native-feeling private chat experience when a user taps "Chat" from a connected profile.
 */

const ChatScreen = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { message: globalError } = useSelector((state) => state.error);
  // Stream Chat variables 
  const { channelId, otherUserName } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const initChannel = async () => {
      if (!client.userID || !channelId) return;
      try {
        const newChannel = client.channel('messaging', channelId);
        await newChannel.watch();
        setChannel(newChannel);
      } catch (error) {
        dispatch(setError(error?.message));
      }
    };
    initChannel();
  }, [channelId]);

  return (
    <OverlayProvider topInset={insets.top}>
      <StatusBar barStyle="light-content" backgroundColor="#126DA6" />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>
              Chatting with {otherUserName || 'Member'}
            </Text>
          </View>
        </View>

        <Chat client={client}>
          {!channel ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color="#126DA6" />
            </View>
          ) : (
            /* IMPORTANT: Channel must be inside a flex: 1 View 
               so it knows how to calculate the space for MessageInput 
            */
            <View style={styles.chatWrapper}>
              <Channel 
                channel={channel} 
                keyboardVerticalOffset={0}
              >
                <MessageList />
                <MessageInput />
                {/* Safe area spacer for the bottom of the screen */}
                <View style={{ height: insets.bottom, backgroundColor: '#fff' }} />
              </Channel>
            </View>
          )}
        </Chat>
      </View>
    </OverlayProvider>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- Loading State ---
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   // --- Header / Title ---
  header: {
    backgroundColor: '#126DA6',
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  headerContent: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Messaging container ---
  chatWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorWrapper: {
    padding: 16,
    backgroundColor: '#F8D7DA',
    alignItems: 'center',
  },
  errorText: {
    color: '#721C24',
    fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: 'center',
  },
});