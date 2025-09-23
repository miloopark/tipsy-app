import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameHub'>;

export default function GameHubScreen({ navigation }: Props) {
  const { email, signOut } = useAuth();

  const handleSwitchUser = () => {
    signOut();
    navigation.replace('Landing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Welcome, {email ?? 'guest'}.</Text>
            <Text style={styles.tagline}>Pick tonight’s chaos.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate('SpinGame')}>
          <Text style={styles.gameTitle}>Spin</Text>
          <Text style={styles.gameSubtitle}>Truth or sip · customizable wheel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchUser}>
          <Text style={styles.secondaryButtonText}>Switch user</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
