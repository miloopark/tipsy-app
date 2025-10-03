import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRooms, createRoom, joinRoom } from '@/services/roomService';
import { usePlayers } from '@/contexts/PlayersContext';
import { truncateOldMessages } from '@/services/chatService';
import { RootStackParamList } from '@/types/navigation';

const DEFAULT_ROOM_NAME = ['Loopy Lounge', 'Party Mix', 'Sip Squad'];

type Props = NativeStackScreenProps<RootStackParamList, 'Rooms'>;

export default function RoomsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { resetPlayers } = usePlayers();
  const { rooms, loading } = useMyRooms();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = async () => {
    if (!user) {
      Alert.alert('Sign in', 'Sign in with a nickname to create a room.');
      return;
    }
    const name = roomName.trim() || DEFAULT_ROOM_NAME[Math.floor(Math.random() * DEFAULT_ROOM_NAME.length)];
    const room = await createRoom(name);
    resetPlayers();
    setRoomName('');
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  const handleJoinRoom = async () => {
    const code = roomCode.trim();
    if (!code) {
      return;
    }
    try {
      await joinRoom(code);
      await truncateOldMessages(code, 50);
      navigation.navigate('RoomDetail', { roomId: code });
      setRoomCode('');
    } catch (error: any) {
      Alert.alert('Join failed', error?.message ?? 'Unable to join that room.');
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <BackButton />
        <Text style={styles.title}>Loopy Rooms</Text>
      </View>

      <Text style={styles.subtitle}>Create a fresh room or jump into one with a code.</Text>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Room name"
          placeholderTextColor="#B9B6B3"
          value={roomName}
          onChangeText={setRoomName}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
          <Text style={styles.primaryText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Room code"
          placeholderTextColor="#B9B6B3"
          value={roomCode}
          onChangeText={setRoomCode}
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinRoom}>
          <Text style={styles.secondaryText}>Join</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeading}>My rooms</Text>
      {loading && <Text style={styles.empty}>Loading rooms…</Text>}
      {!loading && rooms.length === 0 && <Text style={styles.empty}>No rooms yet. Create one!</Text>}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomCard} onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomMeta}>{item.members.length} members · {new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F3E6',
    padding: 24,
    gap: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F'
  },
  subtitle: {
    color: '#7C7C7C'
  },
  formRow: {
    flexDirection: 'row',
    gap: 12
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1F1F1F'
  },
  primaryButton: {
    backgroundColor: '#CA2A3A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center'
  },
  primaryText: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center'
  },
  secondaryText: {
    color: '#1F1F1F',
    fontWeight: '600'
  },
  sectionHeading: {
    fontWeight: '700',
    color: '#1F1F1F'
  },
  empty: {
    color: '#7C7C7C'
  },
  roomCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#E5E3E1',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  roomName: {
    fontWeight: '700',
    color: '#1F1F1F',
    fontSize: 18
  },
  roomMeta: {
    color: '#7C7C7C',
    marginTop: 4
  },
  list: {
    paddingBottom: 120
  }
});
