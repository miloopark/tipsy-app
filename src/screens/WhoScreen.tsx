import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/contexts/PlayersContext';
import { createRoom } from '@/services/roomService';
import {
  acceptFriendRequest,
  declineFriendRequest,
  searchUsersByNickname,
  sendFriendRequest,
  useFriendsList,
  useIncomingFriendRequests
} from '@/services/userService';
import { FriendRequest, User } from '@/types/models';
import { RootStackParamList } from '@/types/navigation';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'friends', label: 'Friends' },
  { key: 'add', label: 'Add Friends' },
  { key: 'manual', label: 'Manual' }
];

type TabKey = 'friends' | 'add' | 'manual';

type ManualPlayer = { id: string; name: string };

const createManualId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

type Props = NativeStackScreenProps<RootStackParamList, 'Who'>;

export default function WhoScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { resetPlayers } = usePlayers();
  const [activeTab, setActiveTab] = useState<TabKey>('friends');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [manualPlayers, setManualPlayers] = useState<ManualPlayer[]>([]);
  const [roomName, setRoomName] = useState('');

  const { friends } = useFriendsList();
  const {
    requests: incomingRequests = [],
    usersById: incomingUsers
  } = useIncomingFriendRequests();

  useEffect(() => {
    if (!user) {
      navigation.replace('Entry');
    }
  }, [user, navigation]);

  const pendingRequests: FriendRequest[] = incomingRequests ?? [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsersByNickname(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('[WhoScreen] Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const addManualPlayer = () => {
    setManualPlayers((prev) => [...prev, { id: createManualId(), name: '' }]);
  };

  const updateManualPlayer = (id: string, name: string) => {
    setManualPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, name } : player)));
  };

  const removeManualPlayer = (id: string) => {
    setManualPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const handleCreateRoom = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Grab a nickname to create a room.');
      return;
    }

    if (!selectedFriends.length && !manualPlayers.some((p) => p.name.trim())) {
      Alert.alert('Add players', 'Select friends or add manual players first.');
      return;
    }

    const localPlayers = manualPlayers
      .map((player) => player.name.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const created = await createRoom(roomName.trim() || 'Loopy Room', {
      memberIds: selectedFriends,
      localPlayers
    });

    resetPlayers(localPlayers.map((p, index) => ({ id: `${index}`, name: p.name })));
    setSelectedFriends([]);
    setManualPlayers([]);
    setRoomName('');

    navigation.navigate('RoomDetail', { roomId: created.id });
  };

  const handleSendRequest = async (target: User) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be signed in to send friend requests.');
      return;
    }
    try {
      await sendFriendRequest(target.id, user.id);
      Alert.alert('Friend request sent', `Waiting for ${target.nickname} to accept.`);
    } catch (error: any) {
      Alert.alert('Oops', error?.message ?? 'Could not send that request.');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not accept request.');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not decline request.');
    }
  };

  const selectedFriendsDetails = useMemo(() => {
    const map = new Map(friends.map((f) => [f.id, f]));
    return selectedFriends.map((id) => map.get(id)).filter(Boolean) as User[];
  }, [friends, selectedFriends]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nicknameText}>{user?.nickname}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Pick who's joining tonight's Loopy room.</Text>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'friends' && (
          <View style={styles.tabContent}>
            <ScrollView contentContainerStyle={styles.friendList}>
              {friends.length === 0 && <Text style={styles.emptyText}>Add some friends to get started.</Text>}
              {friends.map((friend) => {
                const selected = selectedFriends.includes(friend.id);
                return (
                  <Pressable
                    key={friend.id}
                    style={[styles.friendRow, selected && styles.friendRowSelected]}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <Text style={styles.friendName}>{friend.nickname}</Text>
                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                      {selected && <Text style={styles.checkboxLabel}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            {selectedFriendsDetails.length > 0 && (
              <View style={styles.selectionSummary}>
                <Text style={styles.selectionText}>
                  Selected: {selectedFriendsDetails.map((f) => f.nickname).join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'add' && (
          <View style={styles.tabContent}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by nickname"
                placeholderTextColor="#B9B6B3"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </Pressable>
            </View>

            {pendingRequests.length > 0 && (
              <View style={styles.requestsSection}>
                <Text style={styles.sectionHeading}>Incoming requests</Text>
                {pendingRequests.map((request) => (
                  <View key={request.id} style={styles.requestRow}>
                    <Text style={styles.resultName}>{incomingUsers[request.fromUser]?.nickname ?? request.fromUser}</Text>
                    <View style={styles.requestActions}>
                      <Pressable style={styles.declineButton} onPress={() => handleDecline(request.id)}>
                        <Text style={styles.secondaryButtonText}>Deny</Text>
                      </Pressable>
                      <Pressable style={styles.primaryButton} onPress={() => handleAccept(request.id)}>
                        <Text style={styles.primaryButtonText}>Accept</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <ScrollView contentContainerStyle={styles.friendList}>
              {searchResults.length > 0 && (
                <>
                  <Text style={styles.sectionHeading}>Search results</Text>
                  {searchResults.map((item) => (
                    <View key={item.id} style={styles.resultRow}>
                      <Text style={styles.resultName}>{item.nickname}</Text>
                      <Pressable style={styles.primaryButton} onPress={() => handleSendRequest(item)}>
                        <Text style={styles.primaryButtonText}>Add</Text>
                      </Pressable>
                    </View>
                  ))}
                </>
              )}
              {searching && <Text style={styles.emptyText}>Searching…</Text>}
              {!searching && searchResults.length === 0 && searchQuery.trim() && (
                <Text style={styles.emptyText}>No users found.</Text>
              )}
            </ScrollView>
          </View>
        )}

        {activeTab === 'manual' && (
          <View style={styles.tabContent}>
            <ScrollView contentContainerStyle={styles.friendList}>
              {manualPlayers.map((player) => (
                <View key={player.id} style={styles.manualRow}>
                  <TextInput
                    style={styles.manualInput}
                    placeholder="Player name"
                    placeholderTextColor="#B9B6B3"
                    value={player.name}
                    onChangeText={(text) => updateManualPlayer(player.id, text)}
                  />
                  <Pressable style={styles.removeManual} onPress={() => removeManualPlayer(player.id)}>
                    <Text style={styles.removeManualText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.secondaryButton} onPress={addManualPlayer}>
                <Text style={styles.secondaryButtonText}>+ Add manual player</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        <View style={styles.footer}>
          <TextInput
            style={styles.roomInput}
            placeholder="Room name (optional)"
            placeholderTextColor="#B9B6B3"
            value={roomName}
            onChangeText={setRoomName}
          />
          <Pressable style={[styles.primaryButton, styles.createButton]} onPress={handleCreateRoom}>
            <Text style={styles.primaryButtonText}>Create Loopy Room</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, styles.roomsButton]} onPress={() => navigation.navigate('Rooms')}>
            <Text style={styles.secondaryButtonText}>Go to Rooms</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F3E6'
  },
  screen: {
    flex: 1,
    padding: 24,
    gap: 12
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  heroContainer: {
    flex: 1,
    marginLeft: 16
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#7C7C7C'
  },
  nicknameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#CA2A3A'
  },
  subtitle: {
    color: '#7C7C7C',
    fontSize: 14,
    marginBottom: 8
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 227, 225, 0.6)'
  },
  tabButtonActive: {
    backgroundColor: '#CA2A3A',
    borderColor: '#CA2A3A'
  },
  tabText: {
    color: '#7C7C7C',
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#F9F7F6'
  },
  tabContent: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0CECC',
    backgroundColor: '#F9F7F6',
    padding: 16
  },
  friendList: {
    gap: 12
  },
  emptyText: {
    color: '#7C7C7C',
    textAlign: 'center'
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center'
  },
  friendRowSelected: {
    borderColor: '#CA2A3A',
    backgroundColor: 'rgba(202, 42, 58, 0.08)'
  },
  friendName: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: '600'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0CECC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#CA2A3A',
    borderColor: '#CA2A3A'
  },
  checkboxLabel: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  selectionSummary: {
    paddingTop: 8
  },
  selectionText: {
    color: '#7C7C7C'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1F1F1F'
  },
  searchButton: {
    backgroundColor: '#CA2A3A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchButtonText: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  requestsSection: {
    marginBottom: 12
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  resultName: {
    fontWeight: '700',
    color: '#1F1F1F'
  },
  resultMeta: {
    color: '#7C7C7C',
    fontSize: 12
  },
  sectionHeading: {
    fontWeight: '700',
    marginTop: 12,
    color: '#1F1F1F'
  },
  requestRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    padding: 16,
    gap: 12,
    marginTop: 8
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12
  },
  declineButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1F1F1F'
  },
  removeManual: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  removeManualText: {
    color: '#7C7C7C'
  },
  footer: {
    gap: 12
  },
  roomInput: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1F1F1F'
  },
  createButton: {
    shadowColor: '#D0CECC',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  primaryButton: {
    backgroundColor: '#CA2A3A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1F1F1F',
    fontWeight: '600'
  },
  roomsButton: {
    borderWidth: 1,
    borderColor: '#D0CECC'
  }
});
