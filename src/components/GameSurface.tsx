import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameState, User } from '@/types/models';
import { startGame, endGame, setTurn, setCategory } from '@/services/gameService';

interface Props {
  roomId: string;
  gameState: GameState | null;
  members: User[];
}

export default function GameSurface({ roomId, gameState, members }: Props) {
  const turnNickname = useMemo(() => {
    if (!gameState?.turnUser) {
      return undefined;
    }
    return members.find((m) => m.id === gameState.turnUser)?.nickname ?? 'Unknown';
  }, [gameState?.turnUser, members]);

  const handleStart = () => startGame(roomId);
  const handleEnd = () => endGame(roomId);
  const handleNext = () => {
    if (!members.length) {
      return;
    }
    const currentIndex = members.findIndex((member) => member.id === gameState?.turnUser);
    const nextMember = members[(currentIndex + 1) % members.length];
    setTurn(roomId, nextMember.id);
  };

  const handleCategory = () => {
    const categories = ['Animals', 'TV Shows', 'Embarrassing story', 'Rapid fire'];
    const random = categories[Math.floor(Math.random() * categories.length)];
    setCategory(roomId, random);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Game Phase: {gameState?.phase ?? 'idle'}</Text>
      {turnNickname && <Text style={styles.subHeading}>Current turn: {turnNickname}</Text>}
      {gameState?.category && <Text style={styles.subHeading}>Category: {gameState.category}</Text>}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleNext}>
          <Text style={styles.secondaryText}>Next turn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCategory}>
          <Text style={styles.secondaryText}>Set category</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleEnd}>
          <Text style={styles.secondaryText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F'
  },
  subHeading: {
    fontSize: 16,
    color: '#7C7C7C'
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: '#CA2A3A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14
  },
  primaryText: {
    color: '#F9F7F6',
    fontWeight: '700'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14
  },
  secondaryText: {
    color: '#1F1F1F',
    fontWeight: '600'
  }
});
