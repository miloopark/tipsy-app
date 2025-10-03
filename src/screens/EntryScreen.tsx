import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmailSignInModal from '@/screens/EmailSignInModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/contexts/PlayersContext';
import { getCurrentAuth } from '@/instant/instant';
import { getUsersByIds } from '@/services/userService';
import { User } from '@/types/models';
import { RootStackParamList } from '@/types/navigation';

const BG = require('../../assets/loopy.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Entry'>;

export default function EntryScreen({ navigation }: Props) {
  const { user, setUser, clearUser } = useAuth();
  const { resetSession } = usePlayers();
  const [initializing, setInitializing] = useState(true);
  const [showEmailSignIn, setShowEmailSignIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const auth = await getCurrentAuth();
        if (auth?.id && mounted) {
          const id = auth.id;
          const existing = await getUsersByIds([id]);
          if (mounted && existing[0]) {
            setUser(existing[0]);
          }
        }
      } catch (error: any) {
        console.warn('[EntryScreen:init]', error);
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setUser]);

  const handleGuest = () => {
    clearUser();
    resetSession();
    navigation.navigate('ManualWho');
  };

  const handleSignedIn = () => {
    if (user) {
      navigation.navigate('Who');
    } else {
      setShowEmailSignIn(true);
    }
  };

  const handleEmailSignInComplete = (authenticatedUser: User) => {
    setShowEmailSignIn(false);
    setUser(authenticatedUser);
    navigation.navigate('Who');
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color="#CA2A3A" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BG} style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleSignedIn}>
              <Text style={styles.primaryText}>{user ? 'Continue as ' + user.nickname : 'Sign in with Email'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleGuest}>
              <Text style={styles.secondaryText}>Play without signing in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      <EmailSignInModal
        visible={showEmailSignIn}
        onCancel={() => setShowEmailSignIn(false)}
        onComplete={handleEmailSignInComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F3E6'
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 32,
    gap: 24
  },
  buttons: {
    gap: 16
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: '#CA2A3A',
    shadowColor: '#D0CECC',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  primaryText: {
    color: '#F9F7F6',
    fontWeight: '700',
    fontSize: 16
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    backgroundColor: 'rgba(249, 247, 246, 0.92)'
  },
  secondaryText: {
    color: '#1F1F1F',
    fontWeight: '600',
    fontSize: 16
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
