import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/firebaseService';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen({ navigation }: any) {
  const { user, clearUser } = useAuth();

  const handleCopyNickname = async () => {
    if (user?.nickname) {
      await Clipboard.setStringAsync(user.nickname);
      Alert.alert('Copied!', 'Your nickname has been copied. Share it with friends so they can add you!');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            clearUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Entry' }],
            });
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Not signed in</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.nickname?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.nickname}>{user.nickname}</Text>
          {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.gamesWon || 0}</Text>
            <Text style={styles.statLabel}>Games Won</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nickname</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{user.nickname}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyNickname}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Share this with friends so they can add you</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F6'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E3',
  },
  content: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F'
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#CA2A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#F9F7F6',
  },
  nickname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#6B6966',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E3',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#CA2A3A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B6966',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0CECC'
  },
  valueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0CECC',
    fontFamily: 'monospace'
  },
  valueRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  copyButton: {
    backgroundColor: '#CA2A3A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  copyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  signOutButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CA2A3A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32
  },
  signOutButtonText: {
    color: '#CA2A3A',
    fontWeight: '600',
    fontSize: 16
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32
  }
});
