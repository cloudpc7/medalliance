// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import { signUpWithGoogle, signUpWithApple } from "react-native-credentials-manager";
import { Platform } from "react-native";

// --- Firebase Libraries and Modules ---
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from '../../config/firebaseConfig';

/**
 * Performs social sign-up/sign-in for Google (Android) or Apple (iOS).
 * Includes heavy logging for debugging "Rejected" status.
 */
export const performGoogleSignUp = async () => {
  const GOOGLE_WEB_CLIENT_ID = "506970639988-drq8m2ch9m2ob0bhttj3bfa8me24r463.apps.googleusercontent.com";
  try {
    let idToken;
    let providerId;

    if (Platform.OS === "android") {
      
      const credential = await signUpWithGoogle({
        serverClientId: GOOGLE_WEB_CLIENT_ID,
        autoSelectEnabled: false, 
        filterByAuthorizedAccounts: false,
      });
      idToken = credential.idToken;

      providerId = "google.com";
    } else {
      
      const credential = await signUpWithApple({
        requestedScopes: ["fullName", "email"],
      });

      idToken = credential.idToken;
      providerId = "apple.com";
    }

    // 2. Token Validation
    if (!idToken) {
      throw new Error("Unable to retrieve credentials.");
    }

    // 3. Firebase Credential Generation
    const firebaseCredential = providerId === "google.com" 
      ? GoogleAuthProvider.credential(idToken)
      : new OAuthProvider('apple.com').credential({ idToken });

    // 4. Firebase Sign-In
    const userCredential = await signInWithCredential(auth, firebaseCredential);
    return { success: true, user: userCredential.user };

  } catch (error) {

    throw new Error(error.message || 'Authentication failed')
  };
};

export const performGoogleSignIn = async () => {
  const GOOGLE_WEB_CLIENT_ID = "506970639988-drq8m2ch9m2ob0bhttj3bfa8me24r463.apps.googleusercontent.com";
    try {
    let idToken;
    let providerId;

    if (Platform.OS === "android") {
      
      const credential = await signUpWithGoogle({
        serverClientId: GOOGLE_WEB_CLIENT_ID,
        autoSelectEnabled: false, 
        filterByAuthorizedAccounts: true,
      });
      idToken = credential.idToken;

      providerId = "google.com";
    } else {
      
      const credential = await signUpWithApple({
        requestedScopes: ["fullName", "email"],
      });

      idToken = credential.idToken;
      providerId = "apple.com";
    }

    // 2. Token Validation
    if (!idToken) {
      throw new Error("Unable to retrieve credentials.");
    }

    // 3. Firebase Credential Generation
    const firebaseCredential = providerId === "google.com" 
      ? GoogleAuthProvider.credential(idToken)
      : new OAuthProvider('apple.com').credential({ idToken });

    // 4. Firebase Sign-In
    const userCredential = await signInWithCredential(auth, firebaseCredential);
    return { success: true, user: userCredential.user };

  } catch (error) {

    throw new Error(error.message || 'Authentication failed')
  };
}