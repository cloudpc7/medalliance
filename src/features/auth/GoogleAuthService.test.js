// GoogleAuthService.test.js
import { performGoogleSignIn, performSignOut } from './GoogleAuthService';

import {
  signIn as mockCredentialSignIn,
  signOut as mockCredentialSignOut,
} from 'react-native-credentials-manager';

import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';

// ---- MOCK DEPENDENCIES ----
jest.mock('react-native-credentials-manager', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
}));

// ---- TEST CONSTANTS ----
const mockAuthInstance = { uid: '123' };

// ---- performGoogleSignIn TESTS ----
describe('performGoogleSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully signs in with Google and Firebase', async () => {
    mockCredentialSignIn.mockResolvedValue({
      type: 'google-signin',
      idToken: 'valid-token',
      email: 'test@test.com',
      displayName: 'Test User',
      photo: 'url',
    });

    GoogleAuthProvider.credential.mockReturnValue('google-cred');

    signInWithCredential.mockResolvedValue({
      user: { uid: 'firebase-user-123' },
    });

    const result = await performGoogleSignIn(mockAuthInstance);

    expect(mockCredentialSignIn).toHaveBeenCalled();
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('valid-token');
    expect(signInWithCredential).toHaveBeenCalledWith(mockAuthInstance, 'google-cred');

    expect(result.success).toBe(true);
    expect(result.idToken).toBe('valid-token');
  });

  test('returns failure when no ID token is provided', async () => {
    mockCredentialSignIn.mockResolvedValue({
      type: 'google-signin',
      idToken: null,
    });

    const result = await performGoogleSignIn(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('no-id-token');
  });

  test('handles unexpected credential type', async () => {
    mockCredentialSignIn.mockResolvedValue({
      type: 'password',
    });

    const result = await performGoogleSignIn(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('unexpected-type');
  });

  test('handles Firebase invalid credential error', async () => {
    mockCredentialSignIn.mockResolvedValue({
      type: 'google-signin',
      idToken: 'fake',
    });

    GoogleAuthProvider.credential.mockReturnValue('google-cred');

    signInWithCredential.mockRejectedValue({
      code: 'auth/invalid-credential',
      message: 'Invalid',
    });

    const result = await performGoogleSignIn(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('invalid-credential');
  });

  test('handles unknown error', async () => {
    mockCredentialSignIn.mockRejectedValue(new Error('Boom'));

    const result = await performGoogleSignIn(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('unknown');
  });
});

// ---- performSignOut TESTS ----
describe('performSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully signs out from Firebase and Credentials Manager', async () => {
    firebaseSignOut.mockResolvedValue();
    mockCredentialSignOut.mockResolvedValue();

    const result = await performSignOut(mockAuthInstance);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Signed out successfully.');
  });

  test('Firebase fails but credentials succeed', async () => {
    firebaseSignOut.mockRejectedValue({ code: 'auth/fail' });
    mockCredentialSignOut.mockResolvedValue();

    const result = await performSignOut(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('auth/fail');
  });

  test('Firebase succeeds but credentials fail', async () => {
    firebaseSignOut.mockResolvedValue();
    mockCredentialSignOut.mockRejectedValue({ code: 'cred/fail' });

    const result = await performSignOut(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('cred/fail');
  });

  test('both Firebase and credential sign-out fail', async () => {
    firebaseSignOut.mockRejectedValue({ code: 'auth/fail' });
    mockCredentialSignOut.mockRejectedValue({ code: 'cred/fail' });

    const result = await performSignOut(mockAuthInstance);

    expect(result.success).toBe(false);
    expect(result.code).toBe('cred/fail');
  });
});
