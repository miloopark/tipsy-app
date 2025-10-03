import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMessages } from '@/services/chatService';
import { getCurrentUserId } from '@/services/userService';

interface Props {
  roomId: string;
}

export default function ChatList({ roomId }: Props) {
  const { messages } = useMessages(roomId, 50);
  const listRef = useRef<FlatList>(null);
  const meRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    getCurrentUserId().then((id) => {
      meRef.current = id;
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const mine = item.senderId === meRef.current;
        return (
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={[styles.text, mine ? styles.textMine : styles.textTheirs]}>{item.text}</Text>
          </View>
        );
      }}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 8
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#CA2A3A'
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E3E1',
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  text: {
    fontSize: 15
  },
  textMine: {
    color: '#F9F7F6'
  },
  textTheirs: {
    color: '#1F1F1F'
  }
});
