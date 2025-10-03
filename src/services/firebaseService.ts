import auth from '@react-native-firebase/auth';

export type PhoneAuthState =
  | { type: 'idle' }
  | { type: 'sending' }
  | { type: 'code-sent'; verificationId: string }
  | { type: 'verifying' }
  | { type: 'success'; user: { uid: string; phoneNumber: string | null } }
  | { type: 'error'; message: string };

/**
 * Send verification code to phone number
 * @param phoneNumber - Full phone number with country code (e.g., "+1234567890")
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<string> => {
  try {
    console.log('[Firebase] Sending verification code to:', phoneNumber);
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    console.log('[Firebase] Verification code sent, ID:', confirmation.verificationId);
    return confirmation.verificationId;
  } catch (error: any) {
    console.error('[Firebase] Error sending code:', error);
    throw new Error(error.message || 'Failed to send verification code');
  }
};

/**
 * Verify the code sent to the user's phone
 * @param verificationId - ID returned from sendVerificationCode
 * @param code - 6-digit code from SMS
 */
export const verifyCode = async (
  verificationId: string,
  code: string
): Promise<{ uid: string; phoneNumber: string | null }> => {
  try {
    console.log('[Firebase] Verifying code:', code);
    const credential = auth.PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await auth().signInWithCredential(credential);

    const user = userCredential.user;
    console.log('[Firebase] Sign in successful, UID:', user.uid);

    return {
      uid: user.uid,
      phoneNumber: user.phoneNumber
    };
  } catch (error: any) {
    console.error('[Firebase] Error verifying code:', error);
    throw new Error(error.message || 'Invalid verification code');
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth().signOut();
    console.log('[Firebase] Signed out successfully');
  } catch (error: any) {
    console.error('[Firebase] Error signing out:', error);
    throw error;
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = () => {
  return auth().currentUser;
};
