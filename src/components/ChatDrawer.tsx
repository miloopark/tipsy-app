import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import ChatList from '@/components/ChatList';
import MessageInput from '@/components/MessageInput';

interface Props {
  open: boolean;
  onClose: () => void;
  roomId: string;
}

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.85, 340);

export default function ChatDrawer({ open, onClose, roomId }: Props) {
  const translate = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translate, {
      toValue: open ? 0 : PANEL_WIDTH,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [open, translate]);

  return (
    <View pointerEvents={open ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      {open && <Pressable style={styles.backdrop} onPress={onClose} />}
      <Animated.View style={[styles.panel, { transform: [{ translateX: translate }] }]}> 
        <ChatList roomId={roomId} />
        <MessageInput roomId={roomId} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#F9F7F6',
    borderLeftWidth: 1,
    borderColor: '#D0CECC'
  }
});
