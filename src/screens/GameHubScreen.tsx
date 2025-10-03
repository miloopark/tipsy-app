import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameHub'>;

export default function GameHubScreen({ navigation }: Props) {
  const { user, clearUser } = useAuth();
  const { mode, resetSession } = usePlayers();

  const modeTagline =
    mode === 'newFriends'
      ? 'Break the ice fast with these picks.'
      : mode === 'friends'
        ? 'Queue up the chaos for the crew.'
        : 'Pick tonight’s chaos.';

  const handleSwitchUser = () => {
    clearUser();
    resetSession();
    navigation.replace('Entry');
  };

  const showSpin = mode !== 'friends';
  const showHotSeat = mode !== 'friends';
  const showTrap = mode !== 'newFriends';
  const showCategories = mode === 'friends';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Welcome, {user?.nickname ?? 'guest'}.</Text>
            <Text style={styles.tagline}>{modeTagline}</Text>
          </View>
        </View>

        {showSpin && (
          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate('SpinGame')}>
            <Text style={styles.gameTitle}>Spin</Text>
            <Text style={styles.gameSubtitle}>Truth or sip · customizable wheel</Text>
          </TouchableOpacity>
        )}

        {showHotSeat && (
          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate('HotSeat')}>
            <Text style={styles.gameTitle}>Hot Seat</Text>
            <Text style={styles.gameSubtitle}>30-second grilling — answer or drink</Text>
          </TouchableOpacity>
        )}

        {showTrap && (
          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate('LoopyTrap')}>
            <Text style={styles.gameTitle}>Loopy Trap</Text>
            <Text style={styles.gameSubtitle}>Push your luck — dodge the trap or drink</Text>
          </TouchableOpacity>
        )}

        {showCategories && (
          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.gameTitle}>Categories</Text>
            <Text style={styles.gameSubtitle}>Shout answers that match the letter or drink</Text>
          </TouchableOpacity>
        )}

        {!showSpin && !showTrap && !showHotSeat && !showCategories && (
          <Text style={styles.gamePlaceholder}>Crew-only games are brewing. Check back soon!</Text>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchUser}>
          <Text style={styles.secondaryButtonText}>Switch user</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
