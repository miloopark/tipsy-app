import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const [emailInput, setEmailInput] = useState('');
  const { signIn } = useAuth();
  const { resetSession } = usePlayers();

  const handleContinue = () => {
    if (!emailInput.includes('@')) {
      Alert.alert('Almost there', 'Drop a valid email so we can remember you.');
      return;
    }

    signIn(emailInput);
    resetSession();
    navigation.navigate('PlayerSetup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.safeArea}
      >
        <View style={[styles.container, styles.landingContainer]}>
          <View style={styles.landingHero}>
            <Text style={styles.logo}>TIPSY</Text>
            <Text style={[styles.tagline, styles.taglineCentered]}>
              Party games that break the ice fast.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="email@tipsy.fun"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={emailInput}
              onChangeText={setEmailInput}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.primaryButtonText}>Enter the Lounge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
