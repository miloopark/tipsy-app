import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import PlayerAvatar from '@/components/PlayerAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { createPlayer, usePlayers } from '@/contexts/PlayersContext';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ManualWho'>;

export default function PlayerSetupScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { players, addPlayer, updatePlayer, removePlayer, resetPlayers, setMode } = usePlayers();

  const defaultName = useMemo(() => user?.nickname ?? 'You', [user]);

  useEffect(() => {
    if (!players.length) {
      resetPlayers([createPlayer(defaultName)]);
    }
  }, [players.length, defaultName, resetPlayers]);

  const handleAddPlayer = () => {
    addPlayer('');
  };

  const handleContinue = () => {
    const trimmedPlayers = players.map((player) => ({ ...player, name: player.name.trim() }));

    if (trimmedPlayers.some((player) => player.name.length === 0)) {
      Alert.alert('Need names', 'Make sure everyone playing has a name.');
      return;
    }

    resetPlayers(trimmedPlayers);
    setMode(null);
    navigation.navigate('ModeSelect');
  };

  const handleUpdate = (id: string, name: string) => {
    updatePlayer(id, name);
  };

  const handleRemove = (id: string) => {
    if (players.length === 1) {
      Alert.alert('Hang on', 'Need at least one player to keep the games rolling.');
      return;
    }
    removePlayer(id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Who’s in?</Text>
            <Text style={styles.tagline}>Add everyone playing tonight.</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.form, styles.playersList]} keyboardShouldPersistTaps="handled">
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <PlayerAvatar name={player.name || `P${index + 1}`} index={index} />
              <TextInput
                placeholder="Player name"
                placeholderTextColor="#B9B6B3"
                style={styles.playerInput}
                value={player.name}
                onChangeText={(text) => handleUpdate(player.id, text)}
              />
              <TouchableOpacity
                accessibilityLabel={`Remove ${player.name || 'player'}`}
                style={styles.removePlayerButton}
                onPress={() => handleRemove(player.id)}
              >
                <Text style={styles.removePlayerText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addPlayerButton} onPress={handleAddPlayer}>
            <Text style={styles.addPlayerText}>+ Add another player</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Let’s Play</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
