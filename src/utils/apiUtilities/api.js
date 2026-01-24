import { getCallable } from './firebaseClient';
import { apiHandler } from './apiHandler';

// --- Profile Data API Functions ---
export const callGetUserProfile = apiHandler({
  apiName: 'getUserProfile',
  call: () => getCallable('getUserProfile')(),
  validate: (result) => {
    if(!result.data?.success)  {
      throw new Error(result.data?.message || 'Failed to load profile');
    };
  },
  normalize: (result) => result.data?.data ?? {},
  fallbackMessage: "Couldn't load profile. Please try again.",
});

export const callUpdateAccountField = apiHandler({
  apiName: 'updateAccountField',

  call: async (field, value) => {
    if (!field) throw new Error('Field name is required.');
    const result = await getCallable('updateAccountField')({ field, value });
    return result;
  },

  validate: (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || 'Failed to update account field.');
    }
  },

  normalize: (result) => result.data,
  fallbackMessage: 'Unable to update profile. Please try again.',
});


export const updateAccount = apiHandler({
  apiName: 'updateAccountType',

  call: async (profileType) => {
    if (!profileType) throw new Error('Profile type is required.');
    const result = await getCallable('updateAccountType')(profileType);
    return result; 
  },

  validate: (result) => {
    if (result.data?.status !== 'success') {
      throw new Error(result.data?.message || 'Failed to update account type.');
    }
  },
  normalize: (result) => result.data, 
  
  fallbackMessage: 'Unable to update profile. Please try again.',
});

export const callGetProfileConfig = apiHandler({
  apiName: 'getProfileConfig',

  call: async (profileType) => {
    if (!profileType) {
      throw new Error('Profile type is required.');
    }
    const result = await getCallable('getProfileFormData')({ profileType });
    return result;
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || 'Failed to retrieve configuration.');
    }
  },
  normalize: (result) => result.data,
  fallbackMessage: 'Unable to load profile setup. Please try again.',
});

export const addUser = apiHandler({
  apiName: 'addUserToGroup',
  call: async (groupId, userId) => {
    if (!groupId || !userId) {
      throw new Error("Group ID and User ID are required.");
    }
    return await getCallable('addUserToGroup')({ groupId, userId });
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Failed to add user to group.");
    }
  },

  normalize: (result) => result.data,
  
  fallbackMessage: "Unable to add user to group. Please try again.",
});


export const callSubmitProfileData = apiHandler({
  apiName: 'submitProfileData',
  call: async (profileData) => {
    if (!profileData || typeof profileData !== "object") {
      throw new Error("Invalid profile data.");
    }
    // FIX: Use getCallable instead of the undefined 'submitProfile' variable
    return await getCallable('submitProfileData')({ profileData });
  },
  validate: (result) => {
    if (result.data?.status !== "success") {
      throw new Error(result.data?.message || "Failed to save profile.");
    }
  },
  normalize: (result) => {
    return result.data?.updatedProfile ?? {};
  },
  fallbackMessage: "Unable to save profile. Please try again.",
});

// --- Medical Data & Program APIs ---
export const callFetchMedicalPrograms = apiHandler({
  apiName: 'fetchMedicalPrograms',

  call: async () => await getCallable('fetchMedicalProgramsSecure')(),
  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Medical programs are currently unavailable.");
    }
  },

  normalize: (result) => result.data || [],

  fallbackMessage: "Unable to load medical programs. Please try again.",
});

export const callFetchOccupations = apiHandler({
  apiName: 'fetchOccupations',
  call: async () => await getCallable('fetchOccupations')(),
  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Occupation list is currently unavailable.");
    }
  },

  normalize: (result) => result.data || [],

  fallbackMessage: "Unable to load occupations. Please try again.",
});

export const callFetchDegrees = apiHandler({
  apiName: 'fetchDegrees',

  call: async () => await getCallable('fetchDegrees')(),

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Degree list is currently unavailable.");
    }
  },

  normalize: (result) => result.data || [],

  fallbackMessage: "Unable to load degrees. Please try again.",
});

export const callFetchSpecialties = () => [
  "Cardiology", "Neurology", "Surgery", "Pediatrics", "Radiology",
  "Oncology", "Emergency Medicine", "Psychiatry", "OB/GYN", "Anesthesiology"
];

export const callFetchMentoringTypes = () => [
  "Career Guidance", "USMLE Prep", "Research Mentorship", "Clinical Shadowing", "Personal Development"
];

export const callFetchFormats = () => [
  "Zoom", "In-Person", "Phone Call", "Email/Chat", "Group Session"
];

// --- College List APIs ---
export const callFetchColleges = apiHandler({
  apiName: 'getColleges',
  call: async (stateName) => {
    const functionName = stateName
      ? "fetchCollegesByStateSecure"
      : "fetchCollegeListSecure";

    const payload = stateName ? { stateName } : {};
    return await getCallable(functionName)(payload);
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Failed to fetch colleges.");
    }
  },
  normalize: (result) => {
    if (!Array.isArray(result.data)) {
      throw new Error("Unexpected college data format:", result.data);
      return [];
    }
    return result.data;
  },

  fallbackMessage: "Unable to load college list. Please try again.",
});


// --- Location Data APIs ---
export const callGetStateFromCoords = apiHandler({
  apiName: 'getStateFromCoords',

  // The UI calls this with (lat, lng). 
  // We MUST wrap them into one object {} for the Firebase Callable.
  call: async (latitude, longitude) => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null; 
    }

    const callable = getCallable('getStateFromCoordsSecure');
    
    // FIX: Wrap the arguments in an object
    return await callable({ latitude, longitude });
  },

  validate: (result) => {
    // result.data contains the string returned by the backend
    if (!result || result.data === null) {
      throw new Error("Could not determine state.");
    }
  },

  normalize: (result) => result?.data || "",
  fallbackMessage: "Unable to determine location.", 
});

// --- Stream Connection APIs ---

export const callFetchConnectionsProfiles = apiHandler({
  apiName: 'fetchConnectionsProfiles',

  call: async () => await getCallable('fetchConnectionsProfilesSecure')({}),

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Unable to load connections.");
    }
  },
  normalize: (result) => {
    return result.data?.connections || [];
  },
  fallbackMessage: "Unable to load connections. Please try again.",
});

export const callGetStreamToken = apiHandler({
  apiName: 'getStreamToken',

  call: async () => {
    // FIX: Replaced getToken() with the callable from the cache
    return await getCallable('getStreamUserToken')();
  },

  validate: (result) => {
    if (!result.data?.token) {
      throw new Error(result.data?.message || "Could not authorize chat.");
    }
  },

  normalize: (result) => result.data.token,

  fallbackMessage: "Could not authorize chat. Please try again.",
});

// --- Messaging Creation APIs ---
export const callGetGroupProfiles = apiHandler({
  apiName: 'getGroupProfiles',

  call: async () => {
    return await getCallable('fetchUserGroupsSecure')({});
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Unable to load groups.");
    }
  },

  normalize: (result) => {
    return result.data?.groups || [];
  },

  fallbackMessage: "Unable to load groups. Please try again.",
});

export const callCreateGroupChat = apiHandler({
  apiName: 'createGroupChat',

  call: async (groupName, initialMembers) => {
  return await getCallable('createGroupChat')({ groupName, initialMembers: initialMembers || [] });
  },

  validate: (result) => {
    if (!result.data || !result.data.success) {
      throw new Error(result.data?.message || "Server failed to create the group.");
    }
  },

  normalize: (result) => {
    const data = result.data;
    return {
      id: data.id,
      name: data.name || data.groupName, 
      members: data.members || []
    };
  },

  fallbackMessage: "Unable to create group. Please try again.",
});

export const callDeleteGroupChat = apiHandler({
  apiName: 'deleteGroupChat',

  call: async (groupId) => {
    if (!groupId) throw new Error("Group ID is required.");
    
    const payload = { groupId };
    return await getCallable('deleteGroupChatSecure')(payload);
  },

  validate: (result) => {
    if (!result.data || !result.data.success) {
      throw new Error(result.data?.message || "Server failed to delete the group.");
    }
  },

  normalize: (result) => {
    return result.data;
  },

  fallbackMessage: "Unable to delete group. Please try again.",
});

// --- Connection Creation APIs ---
export const callSendConnectionRequest = apiHandler({
  apiName: 'sendConnectionRequest',

  call: async (targetUserId) => {
    if (!targetUserId) throw new Error("User ID is required.");
    return await getCallable('sendConnectionRequestSecure')({ targetUserId });
  },

  validate: (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || "Failed to send connection request.");
    }
  },

  normalize: (result) => result.data,

  fallbackMessage: "Unable to send connection request. Please try again.",
});

export const callAcceptConnectionRequest = apiHandler({
  apiName: 'acceptConnectionRequest',

  call: async (targetUserId) => {
    if (!targetUserId) throw new Error("User ID is required.");
    return await getCallable('acceptConnectionRequestSecure')({ targetUserId });
  },

  validate: (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || "Failed to accept connection request.");
    }
  },

  normalize: (result) => result.data,

  fallbackMessage: "Unable to accept connection request. Please try again.",
});

export const callDeclineConnectionRequest = apiHandler({
  apiName: 'declineConnectionRequest',

  call: async (targetUserId) => {
    if (!targetUserId) throw new Error("User ID is required.");
    return await getCallable('declineConnectionRequestSecure')({ targetUserId });
  },

  validate: (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || "Failed to decline connection request.");
    }
  },

  normalize: (result) => result.data,

  fallbackMessage: "Unable to decline connection request. Please try again.",
});

export const callCancelConnectionRequest = apiHandler({
  apiName: 'cancelConnectionRequest',

  call: async (targetUserId) => {
    if (!targetUserId) throw new Error("User ID is required.");
    return await getCallable('cancelConnectionRequestSecure')({ targetUserId });
  },

  validate: (result) => {
    if (!result.data?.success) {
      throw new Error(result.data?.message || "Failed to cancel connection request.");
    }
  },

  normalize: (result) => result.data,

  fallbackMessage: "Unable to cancel connection request. Please try again.",
});

// --- Request APIs ---
export const callFetchOutgoingRequests = apiHandler({
  apiName: 'fetchOutgoingRequests',

  call: async () => {
    // FIX: Use getCallable with the string "fetchOutgoingRequestsSecure"
    return await getCallable('fetchOutgoingRequestsSecure')();
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Failed to load sent requests.");
    }
  },

  normalize: (result) => {
    return result.data?.requests || [];
  },

  fallbackMessage: "Unable to load sent requests. Please try again.",
});

export const callFetchIncomingRequests = apiHandler({
  apiName: 'fetchIncomingRequests',

  call: async () => {
    return await getCallable('fetchIncomingRequestsSecure')();
  },

  validate: (result) => {
    if (result.data?.success === false) {
      throw new Error(result.data?.message || "Failed to load incoming requests.");
    }
  },

  normalize: (result) => {
    return result.data?.requests || [];
  },

  fallbackMessage: "Unable to load incoming requests. Please try again.",
});