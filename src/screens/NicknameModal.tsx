import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { setNicknameUnique, getOrCreateUser } from '@/services/userService';
import { User } from '@/types/models';

interface Props {
  visible: boolean;
  onComplete: (user: User) => void;
  onCancel: () => void;
}

export default function NicknameModal({ visible, onComplete, onCancel }: Props) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) {
      return;
    }

    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('Nickname required', 'Give yourself a vibe name so friends can find you.');
      return;
    }

    try {
      setLoading(true);
      await setNicknameUnique(trimmed);
      const user = await getOrCreateUser(trimmed);
      onComplete(user);
      setNickname('');
    } catch (error: any) {
      Alert.alert('Oops', error?.message ?? 'Could not reserve that nickname.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Pick your Loopy nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="nickname"
            placeholderTextColor="#B9B6B3"
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.secondary]} onPress={onCancel} disabled={loading}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primary, loading && styles.disabled]} onPress={handleSave}>
              <Text style={styles.primaryText}>{loading ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    backgroundColor: '#F9F7F6',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    shadowColor: '#D0CECC',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F'
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1F1F1F'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14
  },
  primary: {
    backgroundColor: '#CA2A3A'
  },
  primaryText: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  secondaryText: {
    color: '#1F1F1F',
    fontWeight: '600'
  },
  buttonText: {
    fontWeight: '600'
  },
  disabled: {
    opacity: 0.6
  }
});
