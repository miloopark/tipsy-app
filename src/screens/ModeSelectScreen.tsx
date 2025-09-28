import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeSelect'>;

type ModeOption = {
  id: 'friends' | 'newFriends';
  title: string;
  description: string;
};

const options: ModeOption[] = [
  {
    id: 'newFriends',
    title: 'Meeting new friends',
    description: 'Warm up the room with softer prompts that help everyone learn names, stories, and fun facts fast.'
  },
  {
    id: 'friends',
    title: 'Playing with friends',
    description: 'Keep the energy high with dares, call-outs, and quickfire chaos for the crew you already know.'
  }
];

export default function ModeSelectScreen({ navigation }: Props) {
  const { mode, setMode } = usePlayers();
  const [localSelection, setLocalSelection] = useState(mode);

  const handleContinue = () => {
    if (!localSelection) {
      Alert.alert('Choose a vibe', 'Pick whether this group knows each other yet.');
      return;
    }

    setMode(localSelection);
    navigation.navigate('GameHub');
  };

  const handleSelect = (nextMode: ModeOption['id']) => {
    setLocalSelection(nextMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.modeTop}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Set the vibe</Text>
            <Text style={styles.tagline}>Are you playing with friends or breaking the ice?</Text>
          </View>
        </View>

        <View style={styles.modeOptions}>
          {options.map((option) => {
            const selected = localSelection === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.modeCard, selected && styles.modeCardSelected]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.modeTitle}>{option.title}</Text>
                <Text style={styles.modeDescription}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
