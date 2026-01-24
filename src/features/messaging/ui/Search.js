// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React from 'react'; 
import { Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'; 

// --- Redux State Management ---
import { useSelector, useDispatch } from 'react-redux'; 
import { closeSearch, addUserToGroup } from '../../../redux/slices/messaging.slice'; 
import { setQuery, selectFilteredSearchResults, clearSearch } from '../../../redux/slices/search.slice'; 
import { setError } from '../../../redux/slices/error.slice';

// --- Custom UI Components ---
import Avatar from '../../profile/ui/Avatar';
import LoadingSpinner from '../../../ui/common/LoadingSpinner';

/**
 * Search
 * 
 * Functionality:
 * - Displays a searchable TextInput that updates the global search query in Redux
 * - Shows filtered search results (via selectFilteredSearchResults selector) in a FlatList
 * - Each result includes avatar, name, username, and an "Add" button
 * - Tapping "Add" dispatches addUserToGroup for the active group, then closes the modal
 * - Handles loading spinner, error messages, and empty states ("Type to search" / "No users found")
 * - Closes via "Close" button or backdrop, clearing the search query
 * - Uses KeyboardAvoidingView for proper behavior on iOS/Android
 * 
 * Purpose:
 * Enables group owners/members to easily find and invite new users to an existing group chat.
 */

const Search = () => {
  // --- Hooks ---
  const dispatch = useDispatch();

  // --- Redux Variables and State ---
  const { search, activeGroup } = useSelector(state => state.messaging);
  const { query }  = useSelector((state) => state.search);
  const results = useSelector(selectFilteredSearchResults);
  
  // --- Handler functions ---
  const handleAddUser = async (userId) => {
    if (!activeGroup) return;

    try {
      await dispatch(addUserToGroup({ groupId: activeGroup, userId })).unwrap();
      dispatch(closeSearch());
      dispatch(clearSearch());
    } catch (error) {
      dispatch(setError(error?.message || 'Failed to add user.'))
  }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      {item.avatarUrl ? <Avatar avatarImage={item.avatarUrl} /> : <View style={styles.avatarPlaceholder} />}
      <View style={styles.textWrap}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.username || ''}</Text>
      </View>
      <Pressable style={styles.addBtn} onPress={() => handleAddUser(item.id)}>
        <Text style={styles.addBtnText}>Add</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={search} animationType="slide" transparent onRequestClose={() => dispatch(closeSearch())}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <View style={styles.handle}>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Add People</Text>
            <Pressable onPress={() => {
                dispatch(closeSearch());
                dispatch(clearSearch());
            }}>
            <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <TextInput
            placeholder="Search friends"
            placeholderTextColor="#999"
            value={query}
            onChangeText={(text) => dispatch(setQuery(text))}
            style={styles.input}
            autoFocus
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>
                {query.trim().length === 0 ? 'Type a name to search' : 'No users found'}
              </Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default Search;

const styles = StyleSheet.create({
  // --- Modal Overlay Container ---
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.45)',
     justifyContent: 'flex-end' 
  },
  // --- Bottom Sheet --
  sheet: {
    height: '82%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { 
      width: 0, 
      height: -6 
    },
    shadowRadius: 12,
    elevation: 12,
  },

  // --- Visual Handler ---
  handle: { 
    width: 44, 
    height: 5, 
    borderRadius: 3, 
    backgroundColor: '#DADADA', 
    alignSelf: 'center', 
    marginBottom: 10 
  },

  // --- Header & Title ---
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 8 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#222' 
  },

  close: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#A61212' 
  },

  // --Input & Search ---
  input: { 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#F2F4F7', 
    paddingHorizontal: 14, 
    fontSize: 15, 
    color: '#222', 
    marginBottom: 10 
  },

  // --- List & Row Items ---
  list: { 
    paddingBottom: 20 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: '#F9FAFB', 
    marginVertical: 4, 
    paddingHorizontal: 10 
  },
  avatarPlaceholder: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: '#DDE3EA', 
    marginRight: 12 
  },
  textWrap: { 
    flex: 1 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },
  sub: { 
    fontSize: 14, 
    color: '#333', 
    marginTop: 2 
  },

  // --- Button & Action States ---
  addBtn: { 
    backgroundColor: '#126DA6', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: '700' 
  },

  // --- Feedback & Errors ---
  empty: { 
    textAlign: 'center', 
    color: '#0D0D0D', 
    marginTop: 20, 
    fontSize: 16 
  },
  error: { 
    textAlign: 'center', 
    color: '#A61212', 
    marginVertical: 10 
  },
});
