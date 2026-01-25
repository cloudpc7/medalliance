import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from '../../config/firebaseConfig';

export const performAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // 1. Create Firebase Credential
    const { identityToken } = credential;
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: identityToken,
    });

    // 2. Sign in to Firebase
    const userCredential = await signInWithCredential(auth, firebaseCredential);
    return { success: true, user: userCredential.user };

  } catch (e) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, cancelled: true };
    }
    throw new Error("Apple Sign-In failed: " + e.message);
  }
};