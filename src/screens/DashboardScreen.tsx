import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { db } from '@/instant/instant';
import { Room, User } from '@/types/models';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { joinRoom } from '@/services/roomService';

type RoomWithCreator = Room & {
  creator?: User;
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<'all' | 'friends'>('all');
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  // Query all public rooms with their creators
  const { data, isLoading } = db.useQuery({
    rooms: {
      $: {
        where: { isPublic: true },
      },
    },
    users: {},
  });

  const rooms = (data?.rooms || []) as RoomWithCreator[];
  const users = (data?.users || []) as User[];

  // Add creator info to rooms
  const roomsWithCreators = rooms.map((room) => ({
    ...room,
    creator: users.find((u) => u.id === room.createdBy),
  }));

  // TODO: Filter by friends when we have friends functionality
  const filteredRooms = roomsWithCreators;

  const handleJoinRoom = async (room: RoomWithCreator) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to join rooms');
      return;
    }

    if (room.status !== 'open') {
      Alert.alert('Room not available', 'This room is no longer accepting players');
      return;
    }

    if (room.members && room.maxPlayers && room.members.length >= room.maxPlayers) {
      Alert.alert('Room full', 'This room has reached maximum capacity');
      return;
    }

    setJoiningRoomId(room.id);
    try {
      await joinRoom(room.id);
      navigation.navigate('RoomDetail', { roomId: room.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join room');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const renderRoom = ({ item }: { item: RoomWithCreator }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.creator?.nickname?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.creatorName}>{item.creator?.nickname || 'Unknown'}</Text>
          <Text style={styles.roomName}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.roomStats}>
        <Text style={styles.statText}>
          {item.members?.length || 0}/{item.maxPlayers || 8} players
        </Text>
        <Text style={styles.statText}>
          {item.status === 'open' ? '🟢 Open' : item.status === 'in-progress' ? '🟡 Playing' : '⚪️ Finished'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.joinButton, joiningRoomId === item.id && styles.joinButtonDisabled]}
        onPress={() => handleJoinRoom(item)}
        disabled={joiningRoomId === item.id}
      >
        <Text style={styles.joinButtonText}>
          {joiningRoomId === item.id ? 'Joining...' : 'Join Room'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Loopy</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All Rooms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'friends' && styles.filterButtonActive]}
            onPress={() => setFilter('friends')}
          >
            <Text style={[styles.filterText, filter === 'friends' && styles.filterTextActive]}>
              Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Loading rooms...</Text>
        </View>
      ) : filteredRooms.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No public rooms yet</Text>
          <Text style={styles.emptySubtext}>Be the first to create one!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E3',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9F7F6',
    borderWidth: 1,
    borderColor: '#D0CECC',
  },
  filterButtonActive: {
    backgroundColor: '#CA2A3A',
    borderColor: '#CA2A3A',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  filterTextActive: {
    color: '#F9F7F6',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E3',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CA2A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9F7F6',
  },
  roomInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 2,
  },
  roomName: {
    fontSize: 14,
    color: '#6B6966',
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    fontSize: 13,
    color: '#6B6966',
  },
  joinButton: {
    backgroundColor: '#CA2A3A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9F7F6',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B6966',
  },
});
