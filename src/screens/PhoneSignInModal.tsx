import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import { sendVerificationCode, verifyCode } from '@/services/firebaseService';
import { setNicknameUnique } from '@/services/userService';
import { User } from '@/types/models';
import { generateUniqueUsername } from '@/utils/usernameGenerator';

type Props = {
  visible: boolean;
  onComplete: (user: User) => void;
  onCancel: () => void;
};

export default function PhoneSignInModal({ visible, onComplete, onCancel }: Props) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Add + if not present
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    setLoading(true);
    try {
      console.log('[PhoneSignInModal] Sending code to:', formattedPhone);
      const id = await sendVerificationCode(formattedPhone);
      setVerificationId(id);
      setStep('code');
    } catch (error: any) {
      console.error('[PhoneSignInModal] Send code error:', error);
      Alert.alert('Error', error.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      console.log('[PhoneSignInModal] Verifying code');
      const { uid, phoneNumber: userPhone } = await verifyCode(verificationId, code);

      // Check if user exists in InstantDB
      const { db } = await import('@/instant/instant');
      const { users } = await db.queryOnce({
        users: {
          $: { where: { firebaseUid: uid }, limit: 1 }
        }
      });

      let user: User;

      if (users && users.length > 0) {
        // Existing user
        user = users[0] as User;
        console.log('[PhoneSignInModal] Existing user found:', user.nickname);
      } else {
        // New user - create with random username
        console.log('[PhoneSignInModal] New user - generating random username');
        const randomUsername = generateUniqueUsername();

        // Wait for auth to propagate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create user in InstantDB
        user = await setNicknameUnique(randomUsername, uid, userPhone || undefined);

        // Add Firebase UID to user
        await db.transact([
          db.tx.users[uid].update({
            firebaseUid: uid,
            phone: userPhone || undefined,
            gamesPlayed: 0,
            gamesWon: 0,
            totalPoints: 0
          })
        ]);

        console.log('[PhoneSignInModal] Created user with username:', randomUsername);
      }

      onComplete(user);

      // Reset state
      setPhoneNumber('');
      setCode('');
      setStep('phone');
    } catch (error: any) {
      console.error('[PhoneSignInModal] Verification error:', error);
      Alert.alert('Error', error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPhoneNumber('');
    setCode('');
    setStep('phone');
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {step === 'phone' ? 'Enter Phone Number' : 'Enter Verification Code'}
          </Text>

          {step === 'phone' ? (
            <>
              <Text style={styles.subtitle}>
                We'll send you a 6-digit code to verify your number
              </Text>
              <TextInput
                style={styles.input}
                placeholder="+1234567890"
                placeholderTextColor="#B9B6B3"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <View style={styles.buttons}>
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#F9F7F6" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Code</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter the code sent to {phoneNumber}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor="#B9B6B3"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <View style={styles.buttons}>
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setStep('phone')}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#F9F7F6" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
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
    padding: 24
  },
  modal: {
    backgroundColor: '#F9F7F6',
    borderRadius: 20,
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
    color: '#7C7C7C',
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F1F1F',
    marginBottom: 24
  },
  buttons: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50
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
    backgroundColor: 'transparent'
  },
  secondaryButtonText: {
    color: '#1F1F1F',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.5
  }
});
