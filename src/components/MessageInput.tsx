import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { sendMessage } from '@/services/chatService';

interface Props {
  roomId: string;
}

export default function MessageInput({ roomId }: Props) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = value.trim();
    if (!text || sending) {
      return;
    }
    try {
      setSending(true);
      await sendMessage(roomId, text);
      setValue('');
    } finally {
      setSending(false);
    }
  };

  const disabled = sending || !value.trim();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Say something fun…"
        placeholderTextColor="#B9B6B3"
        value={value}
        onChangeText={setValue}
      />
      <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} disabled={disabled} onPress={handleSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#E5E3E1',
    borderWidth: 1,
    borderColor: '#D0CECC',
    color: '#1F1F1F'
  },
  button: {
    backgroundColor: '#CA2A3A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#F9F7F6',
    fontWeight: '700'
  }
});
