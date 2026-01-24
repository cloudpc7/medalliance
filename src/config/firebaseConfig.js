import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import * as ExpoSecureStore from 'expo-secure-store';

const firebaseConfig = {
  apiKey: "AIzaSyARyeVOvJqJgcE9h9KY5ZDZhnZhyKlyUWg",
  authDomain: "medalliance-1.firebaseapp.com",
  projectId: "medalliance-1",
  storageBucket: "medalliance-1.firebasestorage.app",
  messagingSenderId: "506970639988",
  appId: "1:506970639988:web:2bbded86a815f3f8fc8b21",
  measurementId: "G-WVZ5E6VCFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ExpoSecureStore) 
});

// Cloud Functions
export const functions = getFunctions(app, 'us-west2');
export { app };