import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { sendMagicCode, signInWithMagicCode } from '@/instant/instant';
import { User } from '@/types/models';

interface EmailSignInModalProps {
  visible: boolean;
  onCancel: () => void;
  onComplete: (user: User) => void;
}

export default function EmailSignInModal({ visible, onCancel, onComplete }: EmailSignInModalProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendMagicCode(trimmedEmail);
      setStep('code');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      Alert.alert('Invalid Code', 'Please enter the code from your email');
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    console.log('[EmailSignInModal] Verifying:', { email: trimmedEmail, code: trimmedCode });
    try {
      const result = await signInWithMagicCode(trimmedEmail, trimmedCode);
      console.log('[EmailSignInModal] Sign in successful:', result);

      // Use the user ID directly from the sign-in result instead of calling getCurrentUserId
      const userId = result.user.id;
      const userEmail = result.user.email;

      // After successful auth, check if user profile exists in our custom users table
      const { getUsersByIds } = await import('@/services/userService');
      const users = await getUsersByIds([userId]);

      console.log('[EmailSignInModal] Checking for existing profile:', { userId, foundUsers: users.length });

      if (users.length > 0 && users[0].nickname) {
        // User has a profile with nickname - sign them in
        console.log('[EmailSignInModal] Existing user found:', users[0].nickname);
        onComplete(users[0]);
      } else {
        // User authenticated but no profile yet - auto-generate username
        console.log('[EmailSignInModal] New user - generating random username');
        const { generateUniqueUsername } = await import('@/utils/usernameGenerator');
        const { setNicknameUnique } = await import('@/services/userService');

        const randomUsername = generateUniqueUsername();

        try {
          // Wait a bit for auth to propagate
          await new Promise(resolve => setTimeout(resolve, 500));

          // Pass userId and userEmail directly to avoid auth issues
          const newUser = await setNicknameUnique(randomUsername, userId, userEmail);
          console.log('[EmailSignInModal] Created user with username:', randomUsername);
          onComplete(newUser);
        } catch (error: any) {
          console.error('[EmailSignInModal] Failed to create user:', {
            error,
            message: error?.message,
            userId,
            userEmail,
            username: randomUsername
          });
          throw error;
        }
      }

      // Reset state
      setEmail('');
      setCode('');
      setStep('email');
    } catch (error: any) {
      console.error('[EmailSignInModal] Verification error:', error);
      const errorMsg = error?.body?.message || error?.message || 'Invalid code';
      Alert.alert('Verification Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setCode('');
    setStep('email');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {step === 'email' ? 'Enter your email' : 'Enter verification code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'We\'ll send you a code to sign in'
              : `We sent a code to ${email}`}
          </Text>

          {step === 'email' ? (
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
              autoFocus
            />
          )}

          <View style={styles.buttons}>
            {loading ? (
              <ActivityIndicator color="#CA2A3A" size="large" />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={step === 'email' ? handleSendCode : handleVerifyCode}
                >
                  <Text style={styles.primaryButtonText}>
                    {step === 'email' ? 'Send Code' : 'Verify'}
                  </Text>
                </TouchableOpacity>

                {step === 'code' && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setStep('email')}
                  >
                    <Text style={styles.secondaryButtonText}>Change Email</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    backgroundColor: '#F9F7F6',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16
  },
  buttons: {
    gap: 12
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#CA2A3A'
  },
  primaryButtonText: {
    color: '#F9F7F6',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    backgroundColor: '#FFF'
  },
  secondaryButtonText: {
    color: '#1F1F1F',
    fontWeight: '600',
    fontSize: 16
  }
});
