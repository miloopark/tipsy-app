import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import styles from '@/theme/styles';
import { RootStackParamList } from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  label?: string;
};

export default function BackButton({ label = 'Back' }: Props) {
  const navigation = useNavigation<Navigation>();
  const handlePress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.backButton} onPress={handlePress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <Text style={styles.backIcon}>{'‹'}</Text>
      <Text style={styles.backButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}
