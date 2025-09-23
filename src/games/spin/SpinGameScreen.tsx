import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import styles from '@/theme/styles';

const prompts = [
  'Sip if you have a group chat muted.',
  'Truth: most embarrassing screenshot on your phone?',
  'Wildcard: everybody drinks!',
  'Dare: swap seats with the loudest player.'
];

export default function SpinGameScreen() {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  const spin = () => {
    const next = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(next);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Spin</Text>
            <Text style={styles.tagline}>Quick rounds, instant laughs.</Text>
          </View>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>
            {currentPrompt ?? 'Hit spin to get the party started.'}
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={spin}>
          <Text style={styles.primaryButtonText}>Spin the Wheel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
