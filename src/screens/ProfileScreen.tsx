import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/instant/instant';
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
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>

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

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user.id}</Text>
          <Text style={styles.hint}>Your unique identifier</Text>
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
    backgroundColor: '#F8F3E6'
  },
  content: {
    flex: 1,
    padding: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 32
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
