const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
// V2 Imports: HTTPS and Firestore Triggers
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore'); 
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const Parse = require('parse/node');
const { StreamChat } = require('stream-chat');

const parseAppId = 'SBmF66qHqNPPOxcC9JcILtUrvpdKoV78sI4g5jrt';
const parseJsKey = 'kdlDuVgDMF20PKWlxdFRTzdQJMrcuh2MrsyDhokE';
// ✅ Initialize Firebase Admin
initializeApp();
const db = getFirestore();
// ✅ Constants
const PRIMARY_REGION = 'us-west2';
const fetch = global.fetch;
const streamApiKey = 'y94exy6zqfet';
const streamApiSecret = 'gxymauwxm3w8uf56yw47wf5jwhhyx6khyech4qn4exv6r38k6ddgwskf7n755cf6'


const initParse = () => {
    Parse.initialize("SBmF66qHqNPPOxcC9JcILtUrvpdKoV78sI4g5jrt",
     "kdlDuVgDMF20PKWlxdFRTzdQJMrcuh2MrsyDhokE");
    Parse.serverURL = 'https://parseapi.back4app.com/';
};
// ----------------------------------------------------------------------
// 1. SECURE USER PROFILE FETCH OR CREATE
// ----------------------------------------------------------------------
exports.getUserProfile = onCall({ region: PRIMARY_REGION }, async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new HttpsError('unauthenticated', 'Authentication is required to fetch the user profile.');
    }

    const uid = auth.uid;
    
    try {
        const userDocRef = db.collection('users').doc(uid);
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists) {
            return { success: true, data: userDocSnap.data() };
        } else {
            const user = await admin.auth().getUser(uid);
            const displayName = user.displayName || " ";
            const initialProfile = {
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                id: uid,
                accountType: ' ',
                avatarUrl: ' ',
                name: displayName,
                status: 'pending',
                online: true,
                goals: ' ',
                quote: ' ',
                profileVisible: true,
                darkMode: false,
                College: ' ',
                curr_year: ' ',
                degree: '',
                major_minor: '',
                profession: ' ',
                formats: ' ',
                mentor: ' ',
                department: ' ',
                occupation: ' ',
            };

            await userDocRef.set(initialProfile);
            return { success: true, data: initialProfile }; 
        }
    } catch (error) {
        logger.error('getUserProfile failed', { uid, error });
        throw new HttpsError('internal', 'Failed to retrieve or create user profile.');
    }
});

// ----------------------------------------------------------------------
// FETCH STORES (SECURE)
// ----------------------------------------------------------------------
exports.fetchStoresSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');
    try {
        const snapshot = await db.collection('stores').get();
        const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return stores;
    } catch (error) {
        logger.error('fet  chStoresSecure failed', error);
        throw new HttpsError('internal', 'Failed to fetch stores.');
    }
});

// ----------------------------------------------------------------------
// FETCH AVATAR URL (SECURE)
// ----------------------------------------------------------------------
exports.fetchAvatarUrlSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');
  const uid = request.auth.uid;
    try {
    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) return { avatarUrl: null };

    const userData = snap.data();
    return { 
        avatarUrl: userData.avatarUrl || null 
    };
    } catch (error) {
    logger.error('fetchAvatarUrlSecure failed', error);
    throw new HttpsError('internal', 'Failed to fetch avatar.');
    }
});

// ----------------------------------------------------------------------
// UPLOAD AVATAR (SECURE)
// ----------------------------------------------------------------------
exports.uploadAvatarSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { imageBase64 } = request.data;
  if (!imageBase64) throw new HttpsError('invalid-argument', 'Image required.');

  const uid = request.auth.uid;
  const buffer = Buffer.from(imageBase64, 'base64');
  const fileName = `avatars/${uid}_${Date.now()}.jpg`;
  const file = admin.storage().bucket().file(fileName);

  try {
    await file.save(buffer, { metadata: { contentType: 'image/jpeg' } });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });

    await db.collection('users').doc(uid).set({
      avatarUrl: url,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { avatarUrl: url };
  } catch (error) {
    logger.error('uploadAvatarSecure failed', error);
    throw new HttpsError('internal', 'Failed to upload avatar.');
  }
});

// ----------------------------------------------------------------------
// FETCH PROFILES (SECURE)
// ----------------------------------------------------------------------
exports.fetchProfilesSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const snapshot = await db.collection('users').get();
    const profiles = snapshot.docs
      .map(doc => {
        const d = doc.data();
        if (!d.avatarUrl || !d.name) return null;
        return {
          id: doc.id,
          createdAt: new Date().toISOString(),
          accountType: d.accountType,
          avatarUrl: d.avatarUrl,
          name: d.name,
          status: d.status,
          online: d.online,
          goals: d.goals,
          quote: d.quote,
          profileVisible: d.profileVisible,
          darkMode: d.darkMode,
          College: d.College,
          degree: d.degree,
          major_minor: d.major_minor,
          profession: d.profession,
          formats: d.formats,
          mentor: d.mentor,
          department: d.department,
          occupation: d.occupation,
          group: d.group,
        };
      })
      .filter(Boolean);

    return profiles;
  } catch (error) {
    logger.error('fetchProfilesSecure failed', error);
    throw new HttpsError('internal', 'Failed to fetch profiles.');
  }
});

// ----------------------------------------------------------------------
// 2. UPDATE ACCOUNT TYPE
// ----------------------------------------------------------------------
exports.updateAccountType = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = request.auth.uid;
  const newAccountType = request.data;

  try {
    await db.collection('users').doc(uid).update({ accountType: newAccountType }, { merge: true });
    logger.info('Profile type updated successfully', { uid, newAccountType });
    return { status: 'success', message: `Profile type set to ${newAccountType}` };
  } catch (error) {
    logger.error('Failed to update profile in Firestore', { uid, error });
    throw new HttpsError('internal', 'Failed to update profile.');
  }
});

// ----------------------------------------------------------------------
// 3. FETCH PROFILE FORM DATA
// ----------------------------------------------------------------------
exports.getProfileFormData = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authorization unsuccessful.');
  }

  const { profileType } = request.data || {};
  if (!profileType || !['students', 'professors'].includes(profileType)) {
    throw new HttpsError('invalid-argument', 'Invalid or missing profile type.');
  }

  try {
    const collectionName = profileType === 'students' ? 'students_forms' : 'professors_forms';
    const snapshot = await db.collection(collectionName).limit(1).get();

    if (snapshot.empty) {
      throw new HttpsError('not-found', `No form data in ${collectionName}`);
    }

    const formDoc = snapshot.docs[0].data();
    const profileArray = Array.isArray(formDoc.profile) ? formDoc.profile : [];

    const raw = profileArray.reduce((acc, map) => {
      Object.entries(map).forEach(([key, value]) => {
        if (key && typeof key === 'string') {
          acc[key] = value;
        }
      });
      return acc;
    }, {});

    const studentOrder = [
      'Full Name',
      'Degree Program',
      'Start Date',
      'Current Year Of Study',
      'Expected Graduation Date',
      'College',
      'What type of mentoring do you prefer?'
    ];

    const professorOrder = [
      'Full Name',
      'Occupation',
      'Medical Degree',
      'Major/Minor',
      'Years of Experience',
      'Specialty',
      'What type of mentoring do you provide?',
      'What type of mentoring formats do you offer?'
    ];

    const order = profileType === 'students' ? studentOrder : professorOrder;

    const orderedQuestions = order.map(key => ({
      [key]: raw[key] ?? ''
    }));

    return {
      status: 'success',
      profileType,
      questions: orderedQuestions
    };
  } catch (error) {
    logger.error(`Error fetching form data for ${profileType}`, error);
    throw new HttpsError('internal', 'Server error while fetching form data.');
  }
});

// ----------------------------------------------------------------------
// 4. SUBMIT PROFILE DATA
// ----------------------------------------------------------------------
exports.submitProfileData = onCall({ region: PRIMARY_REGION }, async (request) => {
  const auth = request.auth;
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'User must be signed in.');
  }

  const uid = auth.uid;
  const { profileData } = request.data || {};

  if (!profileData || typeof profileData !== 'object') {
    throw new HttpsError('invalid-argument', 'Profile data must be a valid object.');
  }

  const formFullName = profileData['Full Name'];
  if (typeof formFullName !== 'string' || formFullName.trim() === '') {
    throw new HttpsError('invalid-argument', 'Full Name is required.');
  }
  const setIfPresent = (src, key) => {
    const v = src[key];
    if (typeof v === 'string' && v.trim() !== '') {
      return v.trim();
    }
    return undefined;
  };

  // 🔑 1. BUILD THE ROBUST UPDATE OBJECT
  const update = {
    // Mandatory Fields for Completion
    
    // 🌟 FIX: Map the form data to the distinct 'Full Name' field
    'Full Name': formFullName.trim(), 
    status: 'complete',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),

    // 🔹 STUDENT / COMMON FIELD MAPPINGS
    College: setIfPresent(profileData, 'College') || null,
    degree: setIfPresent(profileData, 'Degree Program') || setIfPresent(profileData, 'Medical Degree') || null,
    major_minor: setIfPresent(profileData, 'Current Year Of Study') || setIfPresent(profileData, 'Major/Minor') || null,
    profession: setIfPresent(profileData, 'Profession') || null,

    // 🔹 MENTORING / OCCUPATION FIELD MAPPINGS
    occupation: setIfPresent(profileData, 'Occupation') || null,
    department: setIfPresent(profileData, 'Specialty') || null,
    mentor: setIfPresent(profileData, 'What type of mentoring do you provide?') || null,
    formats: setIfPresent(profileData, 'What type of mentoring formats do you offer?') || setIfPresent(profileData, 'What type of mentoring do you prefer?') || null,
  };

  // 🔹 INFER ACCOUNT TYPE (Used to keep consistency)
  if (update.occupation || update.department || update.mentor) {
    update.accountType = 'professor';
  } else if (update.degree && update.College) {
    update.accountType = 'student';
  }
  
  // Clean up null values to ensure fields are only updated if they exist
  Object.keys(update).forEach(key => (update[key] === null) && delete update[key]);


  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      update,
      { merge: true } 
    );

    const updatedDoc = await userRef.get();
    return { status: 'success', updatedProfile: updatedDoc.data() };
  } catch (error) {
    logger.error('submitProfileData failed', error);
    throw new HttpsError(
      'internal',
      'An unexpected server error occurred while updating the profile.'
    );
  }
});


// ----------------------------------------------------------------------
// 5. FETCH MEDICAL PROGRAMS
// ----------------------------------------------------------------------
exports.fetchMedicalProgramsSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const programs = [];
    const snapshot = await db.collection('medical_programs').get();

    // 🌟 ESSENTIAL FIX: Re-insert the data processing loop 🌟
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.programs)) {
        data.programs.forEach((p) => p.name && programs.push(p.name));
      }
    });
    // 🌟 ---------------------------------------------------- 🌟

    if (!programs.length) throw new HttpsError('not-found', 'No medical programs found.');
    return programs;
  } catch (error) {
    logger.error('Firestore Program Fetch Failed', error);
    throw new HttpsError('internal', 'Failed to retrieve medical program list.');
  }
});

// ----------------------------------------------------------------------
// 6. FETCH OCCUPATIONS
// ----------------------------------------------------------------------
exports.fetchOccupations = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const doc = await db.collection('occupation_list').doc('healthcare').get();
    if (!doc.exists) throw new HttpsError('not-found', 'Healthcare occupations not found.');

    const data = doc.data();
    const occupations = Array.isArray(data.healthcare_occupations) ? data.healthcare_occupations : [];

    return { status: 'success', occupations };
  } catch (error) {
    logger.error('Firestore Occupations Fetch Failed', error);
    throw new HttpsError('internal', 'Failed to retrieve occupations.');
  }
});

// ----------------------------------------------------------------------
// 7. FETCH DEGREES
// ----------------------------------------------------------------------
exports.fetchDegrees = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  try {
    const doc = await db.collection('degree_types').doc('major_minor_degree').get();
    if (!doc.exists) throw new HttpsError('not-found', 'Degree document not found.');

    const data = doc.data();
    const degrees = (data.items || []).filter((i) => i?.name).map((i) => i.name);

    return { status: 'success', degrees };
  } catch (error) {
    logger.error('Firestore Degrees Fetch Failed', error);
    throw new HttpsError('internal', 'Failed to retrieve degree list.');
  }
});

// ----------------------------------------------------------------------
// 8. FETCH COLLEGES BY STATE (Parse)
// ----------------------------------------------------------------------
exports.fetchCollegesByStateSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');
    initParse();
    const { stateName } = request.data || {};
    if (!stateName) throw new HttpsError('invalid-argument', 'State name is required.');

  try {
    const State = Parse.Object.extend('State');
    const stateQuery = new Parse.Query(State);
    stateQuery.equalTo('name', stateName);
    const state = await stateQuery.first();

    if (!state) return [];

    const University = Parse.Object.extend('University');
    const query = new Parse.Query(University);
    query.equalTo('state', { __type: 'Pointer', className: 'State', objectId: state.id });

    const results = await query.find();
    return results.map((u) => u.get('name'));
  } catch (error) {
    logger.error('Error fetching colleges by state', error);
    throw new HttpsError('internal', 'Failed to retrieve colleges for the given state.');
  }
});

// ----------------------------------------------------------------------
// 9. FETCH ALL COLLEGES (Parse)
// ----------------------------------------------------------------------
exports.fetchCollegeListSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');
    initParse();
  try {
    const University = Parse.Object.extend('University');
    const results = await new Parse.Query(University).find();
    return results.map((u) => u.get('name'));
  } catch (error) {
    logger.error('Error fetching full college list', error);
    throw new HttpsError('internal', 'Failed to retrieve college list.');
  }
});

// ----------------------------------------------------------------------
// 10. GEOLOCATION → STATE NAME
// ----------------------------------------------------------------------
exports.getStateFromCoordsSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { latitude, longitude } = request.data;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new HttpsError('invalid-argument', 'Latitude and longitude must be numbers.');
  }

  const GOOGLE_API_KEY = "AIzaSyDZsrXhgHTE-PACfZpJ6rHg8MtR-LlRBxc";
  if (!GOOGLE_API_KEY) throw new HttpsError('internal', 'Server misconfiguration: missing API key.');

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') throw new Error(data.error_message || data.status);

    const state = data.results[0]?.address_components?.find((c) =>
      c.types.includes('administrative_area_level_1')
    );
    return state?.long_name || '';
  } catch (error) {
    logger.error('getStateFromCoordsSecure failed', error);
    throw new HttpsError('internal', 'Failed to determine state from coordinates.');
  }
});

exports.updateAccountField = onCall({ region: 'us-west2' }, async (request) => {
  // 1. Validate Auth
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const { field, value } = request.data || {};

  // 2. Validate Data
  if (!field) {
    throw new HttpsError('invalid-argument', 'Field name required.');
  }

  try {
    const userRef = db.collection('users').doc(request.auth.uid);

    // 3. Perform the update using the exact key provided by the frontend
    // This handles "College" vs "college" based on what the frontend sends
    await userRef.update({
      [field]: value,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('updateAccountField error:', error);
    throw new HttpsError('internal', 'Failed to update field in database.');
  }
});

exports.deleteUserAccount = onCall({ region: 'us-west2' }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const uid = request.auth.uid;

  try {
    // 1. Delete user document from Firestore
    await db.collection('users').doc(uid).delete();

    const matches = await db.collection('matches').where('userId', '==', uid).get();
    matches.docs.forEach(doc => doc.ref.delete());

    // 3. Delete the Firebase Auth user
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    logger.error('deleteUserAccount failed', { uid, error: error.message });
    throw new HttpsError('internal', 'Failed to delete account. Please try again.');
  }
});

// ----------------------------------------------------------------------
// 12. SAVE FCM TOKEN (MESSAGING SETUP)
// ----------------------------------------------------------------------
/**
 * Saves the device's FCM Token to the user's Firestore profile.
 */
exports.saveFCMToken = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required to save token.');
  }

  const { fcmToken } = request.data;
  if (!fcmToken || typeof fcmToken !== 'string') {
    throw new HttpsError('invalid-argument', 'A valid fcmToken string is required.');
  }

  const uid = request.auth.uid;

  try {
    await db.collection('users').doc(uid).set({
      fcmToken: fcmToken,
      lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info('FCM Token updated successfully', { uid });
    return { success: true };
  } catch (error) {
    logger.error('saveFCMToken failed', { uid, error });
    throw new HttpsError('internal', 'Failed to save device token.');
  }
});

// ----------------------------------------------------------------------
// 13. SEND SECURE NOTIFICATION (MESSAGING V1)
// ----------------------------------------------------------------------
/**
 * Sends a push notification to a specific User ID. (Now redundant, but preserved for API)
 */
exports.sendSecureNotification = onCall({ region: PRIMARY_REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required to send notifications.');
  }
  try {
    const responseId = await admin.messaging().send(message);
    
    logger.info('Notification sent successfully', { senderId, targetUserId, responseId });
    return { success: true, messageId: responseId };

  } catch (error) {
    logger.error('sendSecureNotification failed', { senderId, targetUserId, error });

    // Handle invalid token cleanup
    if (error.code === 'messaging/registration-token-not-registered') {
       await db.collection('users').doc(targetUserId).update({
         fcmToken: admin.firestore.FieldValue.delete()
       });
       return { success: false, reason: 'invalid_token_removed' };
    }

    throw new HttpsError('internal', 'Failed to send notification.');
  }
});

/**
 * 1. INITIALIZE 1:1 CHAT (Updates collection name and adds logic)
 * Creates or retrieves the canonical chat document for two users.
 */
exports.initializeChat = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const currentUid = request.auth.uid;
    const { targetUid } = request.data;

    if (!targetUid || typeof targetUid !== 'string') {
        throw new HttpsError('invalid-argument', 'A valid targetUid is required.');
    }
    
    // 🔑 Canonical ID: Sorted UIDs for predictable 1:1 naming
    const participants = [currentUid, targetUid].sort();
    const chatId = participants.join('_'); 

    const chatRef = db.collection('messaging').doc(chatId); // ⚠️ UPDATED COLLECTION NAME

    try {
        await chatRef.set({
            participants: participants,
            type: 'one_on_one', // Explicitly define type
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: { text: null, senderId: null, timestamp: null }
        }, { merge: true }); // Use merge:true to avoid overwriting existing chats

        return { 
            success: true, 
            chatId: chatId,
            message: 'Chat initialized or retrieved successfully.'
        };
    } catch (error) {
        logger.error('initializeChat failed', { currentUid, targetUid, error });
        throw new HttpsError('internal', 'Failed to initialize chat room.');
    }
});


exports.onNewChatMessage = onDocumentCreated(
    { document: 'messaging/{chatId}/messages/{messageId}', region: PRIMARY_REGION },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return null;
        
        const newMessage = snapshot.data();
        const { chatId } = event.params;
        const { senderId, text } = newMessage;
        
        const chatRef = db.collection('messaging').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            logger.log(`Chat ${chatId} does not exist. Notification skipped.`);
            return null;
        }

        const chatData = chatDoc.data();
        let recipients = [];
        if (chatData.type === 'one_on_one') {
            const recipientId = chatData.participants.find(uid => uid !== senderId);
            if (recipientId) recipients.push(recipientId);
        } else if (chatData.type === 'group') {
            recipients = chatData.participants.filter(uid => uid !== senderId);
        }
        
        if (recipients.length === 0) {
            logger.log(`No recipients found for chat ${chatId}.`);
            return null;
        }
        await chatRef.update({
            lastMessage: {
                text: text,
                senderId: senderId,
                timestamp: newMessage.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            },
            lastActivity: newMessage.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        });
        const senderDoc = await db.collection('users').doc(senderId).get();
        const senderName = senderDoc.data()?.displayName || 'A Friend';
        const notificationPromises = [];

        for (const recipientId of recipients) {
            const recipientDoc = await db.collection('users').doc(recipientId).get();
            const recipientToken = recipientDoc.data()?.fcmToken;

            if (recipientToken) {
                const title = (chatData.type === 'group') ? `[Group] ${chatData.name || 'Group Chat'}` : senderName;
                
                const payload = {
                    token: recipientToken,
                    notification: {
                        title: title,
                        body: text.length > 50 ? `${text.substring(0, 47)}...` : text,
                    },
                    data: { type: 'CHAT', chatId: chatId, senderId: senderId },
                };
                notificationPromises.push(admin.messaging().send(payload));
            } else {
                logger.log(`Recipient ${recipientId} has no FCM token.`);
            }
        }
        
        await Promise.all(notificationPromises);
        logger.info(`Notifications sent to ${recipients.length} recipients for chat: ${chatId}`);
        return null;
    }
);

/**
 * 3. FETCH USER CONVERSATIONS (Messaging Hub Inbox)
 * Securely fetches a list of all chat rooms the authenticated user belongs to.
 */
exports.fetchUserConversations = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required to view conversations.');
    }

    const uid = request.auth.uid;

    try {
        // Query the 'messaging' collection where the 'participants' array contains the user's UID.
        const snapshot = await db.collection('messaging')
            .where('participants', 'array-contains', uid)
            .orderBy('lastActivity', 'desc') 
            .get();

        const conversations = snapshot.docs.map(doc => {
            const data = doc.data();
            const isGroup = data.type === 'group';

            // Find the other participant's ID for 1:1 chat naming/lookups
            const otherParticipantId = isGroup 
                ? null 
                : data.participants.find(pId => pId !== uid);

            return {
                chatId: doc.id,
                type: data.type,
                name: isGroup ? data.name : null,
                otherUserId: otherParticipantId,
                lastMessage: data.lastMessage?.text || 'Start a conversation!',
                lastTimestamp: data.lastActivity?.toDate().toISOString() || data.createdAt.toDate().toISOString(),
            };
        });

        logger.info(`Found ${conversations.length} conversations.`, { uid });
        return { success: true, conversations };

    } catch (error) {
        logger.error('fetchUserConversations failed', { uid, error });
        throw new HttpsError('internal', 'Failed to retrieve conversation list.');
    }
});

/**
 * 4. CREATE GROUP CHAT
 * Creates a new group chat room with initial participants.
 */
exports.createGroupChat = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const currentUid = request.auth.uid;
    const { groupName, initialMembers } = request.data;

    if (!groupName || !Array.isArray(initialMembers)) {
        throw new HttpsError('invalid-argument', 'Group name is required.');
    }

    // 1. GENERATE A UNIQUE ID FOR THE GROUP (Not the user's UID)
    const newGroupRef = db.collection('groups').doc(); 
    const generatedGroupId = newGroupRef.id;

    // 2. CONSOLIDATE MEMBERS
    const allMembers = [...new Set([...initialMembers, currentUid])];

    const groupData = {
        id: generatedGroupId, 
        name: groupName,
        ownerId: currentUid,
        adminIds: [currentUid],
        members: allMembers, // The list of who belongs to this group
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        // 3. ONLY SET THE GROUP DOCUMENT
        // We do NOT update the 'users' collection here.
        await newGroupRef.set(groupData);

        return { 
            success: true, 
            id: generatedGroupId, 
            name: groupName,
            members: allMembers 
        };
    } catch (error) {
        throw new HttpsError('internal', 'Failed to create group.');
    }
});

/**
 * 5. MANAGE GROUP PARTICIPANTS (Add/Remove)
 * Adds or removes a participant from a group chat. Requires admin privileges.
 */
exports.manageGroupParticipants = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const currentUid = request.auth.uid;
    const { chatId, participantId, action } = request.data; // action: 'add' or 'remove'
    
    if (!chatId || !participantId || !['add', 'remove'].includes(action)) {
        throw new HttpsError('invalid-argument', 'Invalid chat ID, participant, or action.');
    }

    const chatRef = db.collection('messaging').doc(chatId);

    try {
        const chatDoc = await chatRef.get();
        const chatData = chatDoc.data();

        if (chatData.type !== 'group' || !chatData.groupMetadata.adminIds.includes(currentUid)) {
            throw new HttpsError('permission-denied', 'Only group admins can manage participants.');
        }

        const arrayMethod = (action === 'add') ? 
            admin.firestore.FieldValue.arrayUnion : 
            admin.firestore.FieldValue.arrayRemove;
        
        const adminUpdate = (action === 'remove') ? {
            'groupMetadata.adminIds': admin.firestore.FieldValue.arrayRemove(participantId)
        } : {};

        await chatRef.update({
            participants: arrayMethod(participantId),
            ...adminUpdate,
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info(`${action}ed participant to group`, { chatId, participantId, action });
        return { 
            success: true, 
            message: `${participantId} was ${action}ed successfully.` 
        };
    } catch (error) {
        // Preserve existing HttpsError or log and re-throw generic internal error
        if (error instanceof HttpsError) throw error;
        logger.error('manageGroupParticipants failed', { currentUid, chatId, error });
        throw new HttpsError('internal', 'Failed to update group membership.');
    }
});

exports.fetchUserGroupsSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const currentUid = request.auth.uid;

    try {
        // 1. Find all groups where the current user is a member
        const groupsSnapshot = await db.collection('groups')
            .where('members', 'array-contains', currentUid)
            .get();

        if (groupsSnapshot.empty) return { groups: [] };

        const groupsData = [];

        // 2. Loop through each group to build the detailed object
        for (const groupDoc of groupsSnapshot.docs) {
            const data = groupDoc.data();
            const memberUids = data.members || [];

            // 3. Fetch the Profile Info (Name/Avatar) for everyone in this specific group
            // We use the 'in' operator to get up to 10 profiles at once
            const profilesSnapshot = await db.collection('users')
                .where(admin.firestore.FieldPath.documentId(), 'in', memberUids)
                .select('name', 'avatarUrl')
                .get();

            const detailedMembers = [];
            profilesSnapshot.forEach(doc => {
                const pData = doc.data();
                detailedMembers.push({
                    id: doc.id,
                    name: pData.name || 'User',
                    avatarUrl: pData.avatarUrl || null
                });
            });

            // 4. Push the final "Group" object to the array
            groupsData.push({
                id: groupDoc.id,
                name: data.name || 'Unnamed Group',
                members: detailedMembers, // Now an array of OBJECTS, not UIDs
                ownerId: data.ownerId,
                adminIds: data.adminIds || [],
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            });
        }

        return { success: true, groups: groupsData };

    } catch (error) {
        console.error('fetchUserGroupsSecure Error:', error);
        throw new HttpsError('internal', 'Failed to load groups.');
    }
});

exports.fetchIncomingRequestsSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const currentUid = request.auth.uid;

    try {
        const friendsDoc = await db.collection('friends').doc(currentUid).get();
        
        // 1. If document doesn't exist or pending array is empty, return early
        if (!friendsDoc.exists || !friendsDoc.data().pending || friendsDoc.data().pending.length === 0) {
            return { requests: [] };
        }

        const pendingUids = friendsDoc.data().pending;

        // 2. Safety: Firestore 'in' query limit is 30 IDs. 
        // We use getAll for unlimited IDs and better stability.
        const userRefs = pendingUids.map(uid => db.collection('users').doc(uid));
        const profilesSnapshots = await db.getAll(...userRefs);

        const requests = [];
        profilesSnapshots.forEach(docSnap => {
            if (docSnap.exists) {
                const data = docSnap.data();
                requests.push({
                    id: docSnap.id,
                    name: data.name || 'User',
                    avatarUrl: data.avatarUrl || null
                });
            }
        });

        return { success: true, requests };

    } catch (error) {
        // Detailed logging to help you see the EXACT cause in Firebase Console
        logger.error('fetchIncomingRequestsSecure detailed error:', { 
            currentUid, 
            message: error.message,
            stack: error.stack 
        });
        throw new HttpsError('internal', 'Failed to fetch incoming requests.');
    }
});

/**
 * Fetches names, avatars, and IDs for all users listed in the authenticated
 * user's 'friends' field within their profile.
 *
 * @returns {Object} { connections: Array<Object> } Array of simplified connection profiles.
 */
// ----------------------------------------------------------------------
// 1. FETCH CONNECTION PROFILES (SECURE - TWO-STEP LOOKUP)
// ----------------------------------------------------------------------
exports.fetchConnectionsProfilesSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

    const currentUid = request.auth.uid;

    try {
        // 1. Go STRAIGHT to the friends collection using the UID as the Doc ID
        const friendsDoc = await db.collection('friends').doc(currentUid).get();

        if (!friendsDoc.exists) {
            return { connections: [] };
        }

        const memberUids = friendsDoc.data().friends || [];
        
        if (memberUids.length === 0) return { connections: [] };

        // 2. Fetch profiles for these UIDs (Safe for up to 1000 using getAll)
        const userRefs = memberUids.map(uid => db.collection('users').doc(uid));
        const profilesSnapshots = await db.getAll(...userRefs);

        const connectionProfiles = [];
        profilesSnapshots.forEach(docSnap => {
            if (docSnap.exists) {
                const data = docSnap.data();
                connectionProfiles.push({
                    id: docSnap.id,
                    name: data.name || 'Unnamed Connection',
                    avatarUrl: data.avatarUrl || null,
                });
            }
        });

        return { connections: connectionProfiles };
    } catch (error) {
        logger.error('fetchConnectionsProfilesSecure failed', { currentUid, error });
        throw new HttpsError('internal', 'Failed to retrieve connection profiles.');
    }
});

exports.getStreamUserToken = onCall(
    { region: 'us-west2' }, 
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be logged in.');
        }

        const uid = request.auth.uid;

        try {
            // 1. Get real data from Firestore
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            const userData = userDoc.data();

            const serverClient = StreamChat.getInstance(
                streamApiKey, 
                streamApiSecret
            );

            // 2. Generate the token
            const token = serverClient.createToken(uid);

            // 3. THE UPSERT: This creates the user in Stream if they don't exist
            // and updates their name/image if they changed it in your app.
            await serverClient.upsertUser({
                id: uid,
                name: userData?.name || userData?.displayName || 'User',
                image: userData?.avatarUrl || userData?.photoURL || null,
            });

            logger.info(`Stream user sync successful for UID: ${uid}`);

            return { token };

        } catch (error) {
            logger.error("Stream Token Error:", error);
            throw new HttpsError('internal', 'Unable to connect to chat services.');
        }
    }
);

exports.deleteGroupChatSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to delete a group.');
    }

    const currentUid = request.auth.uid;
    const { groupId } = request.data;

    if (!groupId || typeof groupId !== 'string') {
        throw new HttpsError('invalid-argument', 'Group ID is required and must be a string.');
    }

    const groupRef = db.collection('groups').doc(groupId);

    try {
        // 1. Fetch the group document
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            throw new HttpsError('not-found', 'Group not found.');
        }

        const groupData = groupSnap.data();

        // 2. Authorization: Only the owner can delete the group
        if (groupData.ownerId !== currentUid) {
            throw new HttpsError('permission-denied', 'Only the group owner can delete the group.');
        }

        const memberIds = groupData.members || [];

        // 3. Start a batch to perform atomic cleanup
        const batch = db.batch();

        // Delete the group document
        batch.delete(groupRef);

        // 4. Remove the group ID from all members' user profiles
        // Process in chunks to avoid exceeding Firestore batch limits (500 operations)
        const chunkSize = 400; // Safe limit
        for (let i = 0; i < memberIds.length; i += chunkSize) {
            const chunk = memberIds.slice(i, i + chunkSize);
            chunk.forEach((memberId) => {
                const userRef = db.collection('users').doc(memberId);
                batch.update(userRef, {
                    group: admin.firestore.FieldValue.arrayRemove(groupId)
                });
            });
        }

        // 5. Commit the batch
        await batch.commit();

        logger.info('Group deleted successfully and cleaned up from members.', {
            groupId,
            deletedBy: currentUid,
            memberCount: memberIds.length
        });

        // 6. Return success
        return {
            success: true,
            groupId,
            message: 'Group deleted successfully.'
        };

    } catch (error) {
        if (error instanceof HttpsError) {
            throw error; // Re-throw known Firebase errors
        }

        logger.error('deleteGroupChatSecure failed:', {
            currentUid,
            groupId,
            error: error.message,
            stack: error.stack
        });

        throw new HttpsError('internal', 'Failed to delete the group. Please try again.');
    }
});

exports.addUserToGroup = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in.');
    }

    const { groupId, userId } = request.data;
    const currentUid = request.auth.uid;

    if (!groupId || !userId) {
        throw new HttpsError('invalid-argument', 'Group ID and User ID are required.');
    }

    try {
        const groupRef = db.collection('groups').doc(groupId);

        // 1️⃣ Add user to group's members array
        await groupRef.update({
            members: admin.firestore.FieldValue.arrayUnion(userId)
        });

        // 2️⃣ Optionally add group to user's profile
        await db.collection('users').doc(userId).update({
            group: admin.firestore.FieldValue.arrayUnion(groupId)
        }, { merge: true });

        // 3️⃣ Fetch updated group
        const updatedGroupSnap = await groupRef.get();
        const updatedGroupData = updatedGroupSnap.data() || {};

        // 4️⃣ Map member IDs to full user objects
        const memberIds = updatedGroupData.members || [];
        const fullMembers = [];
        const batchSize = 10;

        for (let i = 0; i < memberIds.length; i += batchSize) {
            const batch = memberIds.slice(i, i + batchSize);
            const usersSnap = await db.collection('users')
                .where(admin.firestore.FieldPath.documentId(), 'in', batch)
                .select('name', 'avatarUrl')
                .get();

            usersSnap.forEach(doc => {
                const data = doc.data();
                fullMembers.push({
                    id: doc.id,
                    name: data.name || 'User',
                    avatarUrl: data.avatarUrl || null
                });
            });
        }

        return {
            success: true,
            groupId: updatedGroupSnap.id,
            message: `User ${userId} successfully added.`,
            groupData: {
                ...updatedGroupData,
                members: fullMembers
            }
        };
    } catch (error) {
        logger.error('addUserToGroup failed:', { currentUid, groupId, userId, error });
        throw new HttpsError('internal', 'Failed to add user to the group.');
    }
});

exports.sendConnectionRequestSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign-in required.');

    const currentUid = request.auth.uid;
    const { targetUserId } = request.data;

    if (!targetUserId || currentUid === targetUserId) {
        throw new HttpsError('invalid-argument', 'Invalid target user.');
    }

    try {
        const senderRef = db.collection('friends').doc(currentUid);
        const receiverRef = db.collection('friends').doc(targetUserId);

        const [senderSnap, receiverSnap] = await Promise.all([senderRef.get(), receiverRef.get()]);

        // Check if already friends
        if (senderSnap.exists && senderSnap.data().friends?.includes(targetUserId)) {
            throw new HttpsError('already-exists', 'Already connected.');
        }

        const batch = db.batch();

        // 1. Update Sender: Add target to 'outgoing'
        batch.set(senderRef, {
            outgoing: admin.firestore.FieldValue.arrayUnion(targetUserId)
        }, { merge: true });

        // 2. Update Receiver: Add sender to 'pending'
        batch.set(receiverRef, {
            pending: admin.firestore.FieldValue.arrayUnion(currentUid)
        }, { merge: true });

        await batch.commit();
        return { success: true };
    } catch (error) {
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', 'Failed to send request.');
    }
});

exports.acceptConnectionRequestSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    // 1. Auth Guard
    if (!request.auth) {
        logger.warn("AcceptConnection: Unauthorized attempt");
        throw new HttpsError('unauthenticated', 'Sign-in required.');
    }

    const currentUid = request.auth.uid; 
    const { targetUserId } = request.data; 

    // 2. Data Validation
    if (!targetUserId) {
        logger.warn("AcceptConnection: Missing targetUserId", { currentUid });
        throw new HttpsError('invalid-argument', 'Target User ID is required.');
    }

    logger.info("AcceptConnection: Start", { currentUid, targetUserId });

    try {
        const acceptorRef = db.collection('friends').doc(currentUid);
        const requesterRef = db.collection('friends').doc(targetUserId);

        const batch = db.batch();

        // 3. Batch Operations
        // Note: Using .set with { merge: true } prevents 500 errors if docs don't exist
        logger.info("AcceptConnection: Preparing batch updates");
        
        batch.set(acceptorRef, {
            pending: admin.firestore.FieldValue.arrayRemove(targetUserId),
            friends: admin.firestore.FieldValue.arrayUnion(targetUserId)
        }, { merge: true });

        batch.set(requesterRef, {
            outgoing: admin.firestore.FieldValue.arrayRemove(currentUid),
            friends: admin.firestore.FieldValue.arrayUnion(currentUid)
        }, { merge: true });

        // 4. Commit
        await batch.commit();
        
        logger.info("AcceptConnection: Success", { currentUid, targetUserId });
        return { success: true };

    } catch (error) {
        // THIS IS THE LOG THAT WILL SHOW IN YOUR CONSOLE
        logger.error('AcceptConnection: Critical Failure', {
            context: { currentUid, targetUserId },
            message: error.message,
            stack: error.stack, // This gives you the line number
            code: error.code    // Firestore specific error codes
        });

        // Re-throw as HttpsError for the frontend
        throw new HttpsError('internal', `Failed to accept connection: ${error.message}`);
    }
});

exports.fetchOutgoingRequestsSecure = onCall({ region: PRIMARY_REGION }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign-in required.');

    const currentUid = request.auth.uid;

    try {
        const friendsSnap = await db.collection('friends').doc(currentUid).get();
        if (!friendsSnap.exists) return { requests: [] };

        const outgoingUids = friendsSnap.data().outgoing || [];
        if (outgoingUids.length === 0) return { requests: [] };

        // Batch fetch profiles
        const userRefs = outgoingUids.map(uid => db.collection('users').doc(uid));
        const profilesSnapshots = await db.getAll(...userRefs);

        const requests = [];
        profilesSnapshots.forEach(doc => {
            if (doc.exists) {
                const data = doc.data();
                requests.push({
                    id: doc.id,
                    name: data.name || 'User',
                    avatarUrl: data.avatarUrl || null
                });
            }
        });

        return { requests };
    } catch (error) {
        throw new HttpsError('internal', 'Failed to fetch outgoing requests.');
    }
});

exports.sendSafetyReport = onCall({ region: PRIMARY_REGION }, async (request) => {
    const uid = request.auth?.uid;
    const { reportType, message } = request.data || {};

    if (!uid) {
        logger.warn("sendSafetyReport: Unauthorized attempt");
        throw new HttpsError('unauthenticated', 'Sign-in required.');
    }

    if (!reportType || !message) {
        throw new HttpsError('invalid-argument', 'Report type and message are required');
    }

    try {
        const reportDoc = {
            reportType,
            message,
            date: admin.firestore.FieldValue.serverTimestamp(),
            status: 'new',
            resolvedBy: " ",
            resolvedDate: " ",
        };
        
        await admin.firestore().collection('safety_reports').add(reportDoc);

        return { success: true, message: 'Report submitted' };
    } catch (error) {
        logger.error('sendSafetyReport failed', { uid, reportType, error });
        throw new HttpsError('internal', 'Failed to submit report');
    }
});


// ----------------------------------------------------------------------
// 15. DEBUG HANDLERS
// ----------------------------------------------------------------------
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => logger.error('Uncaught Exception:', err));