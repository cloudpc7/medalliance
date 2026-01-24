import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  callGetGroupProfiles, 
  callFetchConnectionsProfiles, 
  callCreateGroupChat, 
  callDeleteGroupChat,
  callSendConnectionRequest,
  callAcceptConnectionRequest,
  callDeclineConnectionRequest,
  callCancelConnectionRequest,
  callFetchIncomingRequests,
  callFetchOutgoingRequests,
  addUser
} from '../../utils/apiUtilities/api';

// ----------------------------------------------------------------------
// THUNKS
// ----------------------------------------------------------------------

export const fetchUserGroups = createAsyncThunk(
  'messaging/fetchUserGroups',
  async (_, { rejectWithValue }) => {
    try {
      const groups = await callGetGroupProfiles();
      return groups.map(group => ({
        groupId: group.id,
        groupName: group.name || 'Unnamed Group',
        members: (group.members || []).map(m => ({
          ...m,
          name: m.name || 'User' // Safety fallback
        })),
        ownerId: group.ownerId
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addUserToGroup = createAsyncThunk(
  'messaging/addUserToGroup',
  async ({ groupId, userId }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentUserId = state.auth.user?.uid;

      const res = await addUser(groupId, userId);
      const groupData = res?.groupData;

      if (!groupData || !Array.isArray(groupData.members)) {
        return rejectWithValue('Invalid group data returned from server');
      }

      const members = groupData.members.filter(member => member.id !== currentUserId);

      return {
        groupId: res.groupId,
        groupName: groupData.groupName || groupData.name,
        members,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add user to group');
    }
  }
);

export const fetchConnections = createAsyncThunk(
  'messaging/fetchConnections',
  async (_, { rejectWithValue }) => {
    try {
      return await callFetchConnectionsProfiles();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIncomingRequests = createAsyncThunk(
  'messaging/fetchIncomingRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await callFetchIncomingRequests();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOutgoingRequests = createAsyncThunk(
  'messaging/fetchOutgoingRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await callFetchOutgoingRequests();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'messaging/sendConnectionRequest',
  async (targetUserId, { rejectWithValue }) => {
    try {
      await callSendConnectionRequest(targetUserId);
      return targetUserId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'messaging/acceptConnectionRequest',
  async (targetUserId, { rejectWithValue }) => {
    try {
      await callAcceptConnectionRequest(targetUserId);
      return targetUserId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const declineConnectionRequest = createAsyncThunk(
  'messaging/declineConnectionRequest',
  async (targetUserId, { rejectWithValue }) => {
    try {
      await callDeclineConnectionRequest(targetUserId);
      return targetUserId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'messaging/createGroupChat',
  async ({ groupName, initialMembers = [] }, { rejectWithValue }) => {
    try {
      return await callCreateGroupChat(groupName.trim(), initialMembers);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGroupChat = createAsyncThunk(
  'messaging/deleteGroupChat',
  async (groupId, { rejectWithValue }) => {
    try {
      await callDeleteGroupChat(groupId);
      return { groupId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ----------------------------------------------------------------------
// SLICE
// ----------------------------------------------------------------------

const messagingSlice = createSlice({
  name: 'messaging',
  initialState: {
    groupData: [],
    connectionsData: [],
    incomingRequests: [],
    outgoingRequests: [],
    search: false,
    activeGroup: null,
    requestActionLoading: {},
    error: null,
    loading: false,
  },
  reducers: {
    openSearch: (state) => { state.search = true; },
    closeSearch: (state) => { state.search = false; },
    setGroupId: (state, action) => { state.activeGroup = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload;},
    setError: (state, action) => { state.error = action.payload;},
  },
  extraReducers: (builder) => {
    builder
      // Groups
      .addCase(fetchUserGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groupData = action.payload;
      })
      .addCase(fetchUserGroups.rejected, (state,action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch groups';
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.groupData.push({
          groupId: action.payload.id,
          groupName: action.payload.name,
          members: action.payload.members || [],
        });
      })
      .addCase(deleteGroupChat.fulfilled, (state, action) => {
        state.groupData = state.groupData.filter(g => g.groupId !== action.payload.groupId);
      })
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connectionsData = action.payload;
      })
      .addCase(fetchConnections.rejected, (state,action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to retreive connections.';
      })

      // Incoming Requests
      .addCase(fetchIncomingRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.incomingRequests = action.payload;
      })
      .addCase(fetchIncomingRequests.rejected, (state,action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to retrieve incoming requests';
      })
      .addCase(acceptConnectionRequest.pending, (state,action) => {
        state.requestActionLoading[action.meta.arg] = true;
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        delete state.requestActionLoading[action.payload];
        const acceptedUser = state.incomingRequests.find(req => req.id === action.payload);
        state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload);
        if (acceptedUser) state.connectionsData.push(acceptedUser);
      })
      .addCase(acceptConnectionRequest.rejected, (state,action) => {
        delete state.requestActionLoading[action.meta.arg];
      })
      .addCase(declineConnectionRequest.pending, (state, action) => {
        state.requestActionLoading[action.meta.arg] = true;
      })
      .addCase(declineConnectionRequest.fulfilled, (state, action) => {
        delete state.requestActionLoading[action.payload];
        state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload);
      })
      .addCase(declineConnectionRequest.rejected, (state, action) => {
        delete state.requestActionLoading[action.payload];
      })
      .addCase(addUserToGroup.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.groupData.findIndex(g => g.groupId === action.payload.groupId);
        if (existingIndex >= 0) {
          state.groupData[existingIndex] = {
            ...state.groupData[existingIndex],
            members: action.payload.members,
            groupName: action.payload.groupName,
          };
        } else {
          state.groupData.push(action.payload);
        }
      })
      .addCase(addUserToGroup.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOutgoingRequests.fulfilled, (state, action) => {
        state.outgoingRequests = action.payload;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        const targetId = action.payload;
        if(!state.outgoingRequests.includes(targetId)) {
          state.outgoingRequests.push(targetId);
        }
      });
  },
});

export const { openSearch, closeSearch, setGroupId, setLoading, setError } = messagingSlice.actions;
export default messagingSlice.reducer;