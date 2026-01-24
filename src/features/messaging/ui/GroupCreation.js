// --- React Core Libraries and Modules ---
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

// --- Redux State Management ---
import { useDispatch, useSelector } from 'react-redux';
import { createGroupChat } from '../../../redux/slices/messaging.slice';
import { setError, clearError } from '../../../redux/slices/error.slice';
import { startLoading, stopLoading } from '../../../redux/slices/loading.slice';

// --- Yup Validation 
import * as Yup from 'yup';

// --- Custom UX/UI Components
import LoadingSpinner from '../../../ui/common/LoadingSpinner';


export const groupCreationSchema = Yup.object().shape({
  groupName: Yup.string().trim().min(2, 'Too short').max(50, 'Too long').required('Required'),
});

/**
 * GroupCreation
 * 
 * A collapsible form component for creating a new group chat.
 * 
 * Functionality:
 * - Displays a "Create Group" button that toggles an inline dropdown form
 * - Allows the user to enter a group name with Yup validation (2–50 characters, required)
 * - Dispatches `createGroupChat` Redux thunk on submit to create an empty group via backend
 * - Shows loading state on the Create button and any server/validation errors
 * - Provides Cancel button to close the form and clear input
 * - Resets form and closes dropdown on successful creation
 * - Includes a hint text explaining the feature
 * 
 * Purpose:
 * Enables users to quickly create new group chats from the MessagingScreen's dedicated section.
 */

const GroupCreation = () => {
  // Local React State
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');

  // --- Hooks  ---
  const dispatch = useDispatch();

  // --- Redux State Variables ---
  const { activeRequests } = useSelector((state) => state.loading);
  const { message: globalError } = useSelector((state) => state.error);

  const isLoading = activeRequests > 0;

  // -- Handle functions ---
  const handleCreate = async () => {
    const value = groupName.trim();
    try {
      await groupCreationSchema.validate({ groupName: value });
      await dispatch(createGroupChat({ groupName: value })).unwrap();
      setGroupName('');
      setOpen(false);
      dispatch(clearError());
      onGroupCreated?.();
    } catch (error) {
      dispatch(setError(error?.message || `Failed to create group ${value}`));
    }
  };

  const handleCancel = () => {
    setGroupName('');
    setOpen(false);
    dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.compactBtn}
        onPress={() => setOpen((prev) => !prev)}
        disabled={isLoading}
      >
        {
          isLoading ? (
            <LoadingSpinner size={20} color="#146EA6" />
          ) : (
            <>
            <FontAwesome6 name="users-viewfinder" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.compactBtnText}>Create Group</Text>
            </>
          )
        } 
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          <TextInput
            placeholder="Enter group name"
            placeholderTextColor="#9AA0A6"
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
          />

          {globalError && (
            <Text style={styles.errorText}>{globalError}</Text>
          )}

          <View style={styles.buttonRow}>
            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.hintText}>Create a group and invite people to chat together.</Text>
    </View>
  );
};

export default GroupCreation;

const styles = StyleSheet.create({
  // --- Layout and structure ---
  container: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginVertical: 20,
  },
  // Buttons & Actions ---
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1EC6D9',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  compactBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },

  // --- DropDown Form ---
  dropdown: {
    marginTop: 16,
  },

  // --- Input ---
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E6EEF2',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  errorText: {
    color: '#A61212',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  // --- Buttons & Actions ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.8,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },

  // --- Group Creation Button ---
  createButton: {
    backgroundColor: '#126DA6',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  hintText: {
    fontSize: 13.5,
    color: '#777',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 19,
  },
});