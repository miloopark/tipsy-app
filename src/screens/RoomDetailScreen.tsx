import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ChatDrawer from '@/components/ChatDrawer';
import GameSurface from '@/components/GameSurface';
import BackButton from '@/components/BackButton';
import { useRoom, endRoom } from '@/services/roomService';
import { purgeRoomMessages } from '@/services/chatService';
import { useGameState } from '@/services/gameService';
import { getUsersByIds } from '@/services/userService';
import { GameState, Room, User } from '@/types/models';
import { RootStackParamList } from '@/types/navigation';

interface Props extends NativeStackScreenProps<RootStackParamList, 'RoomDetail'> {}

export default function RoomDetailScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const { room, loading } = useRoom(roomId);
  const { gameState } = useGameState(roomId);
  const [members, setMembers] = useState<User[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async (targetRoom?: Room | null) => {
      if (!targetRoom) {
        setMembers([]);
        return;
      }
      const users = await getUsersByIds(targetRoom.members || []);
      setMembers(users);
    };

    fetchMembers(room);
  }, [room]);

  const handleEndRoom = async () => {
    Alert.alert('End room', 'Close this room and clear the chat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End room',
        style: 'destructive',
        onPress: async () => {
          await endRoom(roomId);
          await purgeRoomMessages(roomId);
          navigation.navigate('Rooms');
        }
      }
    ]);
  };

  const roster = useMemo(() => {
    const local = room?.localPlayers ?? [];
    return {
      members,
      local
    };
  }, [room?.localPlayers, members]);

  if (loading && !room) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.loading}>Loading room…</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.loading}>Room not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <BackButton />
        <View style={styles.headerText}>
          <Text style={styles.title}>{room.name}</Text>
          <Text style={styles.subtitle}>{roster.members.length} friends · {roster.local.length} locals</Text>
        </View>
        <Pressable style={styles.chatBadge} onPress={() => setChatOpen(true)}>
          <Text style={styles.chatText}>Chat</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.rosterCard}>
          <Text style={styles.rosterTitle}>Members</Text>
          {roster.members.map((member) => (
            <Text key={member.id} style={styles.rosterLine}>{member.nickname}</Text>
          ))}
          {roster.local.map((player: { name: string }, index: number) => (
            <Text key={`local-${index}`} style={styles.rosterLocal}>
              {player.name} (local)
            </Text>
          ))}
        </View>

        <View style={styles.gameCard}>
          <GameSurface roomId={roomId} gameState={gameState ?? null} members={members} />
        </View>

        <Pressable style={styles.endRoomButton} onPress={handleEndRoom}>
          <Text style={styles.endRoomText}>End room</Text>
        </Pressable>
      </ScrollView>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} roomId={roomId} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F3E6'
  },
  loading: {
    marginTop: 80,
    textAlign: 'center',
    color: '#7C7C7C'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16
  },
  headerText: {
    flex: 1,
    marginLeft: 12
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F'
  },
  subtitle: {
    color: '#7C7C7C'
  },
  chatBadge: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  chatText: {
    fontWeight: '600',
    color: '#CA2A3A'
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 160
  },
  rosterCard: {
    borderRadius: 20,
    backgroundColor: '#E5E3E1',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  rosterTitle: {
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8
  },
  rosterLine: {
    color: '#1F1F1F',
    marginBottom: 4
  },
  rosterLocal: {
    color: '#7C7C7C'
  },
  gameCard: {
    borderRadius: 20,
    backgroundColor: '#F9F7F6',
    borderWidth: 1,
    borderColor: '#D0CECC',
    shadowColor: '#D0CECC',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  endRoomButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#CA2A3A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16
  },
  endRoomText: {
    color: '#CA2A3A',
    fontWeight: '700'
  }
});
