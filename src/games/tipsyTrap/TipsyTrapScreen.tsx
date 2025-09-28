import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import CircularPad, { PadState } from '@/games/tipsyTrap/components/CircularPad';
import { usePlayers } from '@/contexts/PlayersContext';

const BACKDROP = '#0f0f11';
const ACCENT = '#FF9D00';
const SAFE_BORDER = '#2C2C33';

const PAD_COUNT = 9;

type GameStatus = 'idle' | 'playing' | 'trapHit';

type PlayerInfo = {
  id: string;
  label: string;
};

export default function TipsyTrapScreen() {
  const { players } = usePlayers();
  const names: PlayerInfo[] = useMemo(() => {
    if (!players.length) {
      return [{ id: 'solo', label: 'Player 1' }];
    }
    return players.map((player, index) => ({
      id: player.id,
      label: player.name.trim() || `Player ${index + 1}`
    }));
  }, [players]);

  const { width } = useWindowDimensions();
  const columns = 3;
  const horizontalPadding = 32;
  const gutter = 16;
  const maxPadSize = 104;
  const computedSize = (width - horizontalPadding * 2 - gutter * (columns - 1)) / columns;
  const padSize = Math.min(maxPadSize, Math.max(72, computedSize));

  const [padStates, setPadStates] = useState<PadState[]>(() => Array(PAD_COUNT).fill('untouched'));
  const [status, setStatus] = useState<GameStatus>('idle');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [losingPlayer, setLosingPlayer] = useState<PlayerInfo | null>(null);
  const trapRef = useRef<number>(Math.floor(Math.random() * PAD_COUNT));
  const [activeTrapIndex, setActiveTrapIndex] = useState<number>(trapRef.current);

  const bannerAnim = useRef(new Animated.Value(0)).current;

  const triggerHaptic = useCallback(async (type: 'safe' | 'trap') => {
    try {
      if (type === 'safe') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      // Haptics optional; ignore errors (e.g., simulator environments)
    }
  }, []);

  const resetRound = useCallback(() => {
    setPadStates(Array(PAD_COUNT).fill('untouched'));
    setStatus('idle');
    setLosingPlayer(null);
    setCurrentPlayerIndex(0);
    const nextTrap = Math.floor(Math.random() * PAD_COUNT);
    trapRef.current = nextTrap;
    setActiveTrapIndex(nextTrap);
    bannerAnim.setValue(0);
  }, [bannerAnim]);

  const totalPlayers = names.length;
  const currentPlayer = names[currentPlayerIndex];

  const advanceTurn = useCallback(() => {
    if (!totalPlayers) {
      return;
    }
    setCurrentPlayerIndex((prev) => (prev + 1) % totalPlayers);
  }, [totalPlayers]);

  const showBanner = useCallback(() => {
    Animated.spring(bannerAnim, {
      toValue: 1,
      speed: 18,
      bounciness: 12,
      useNativeDriver: true
    }).start();
  }, [bannerAnim]);

  const handlePadPress = (index: number) => {
    if (status === 'trapHit') {
      return;
    }

    setPadStates((prev) => {
      if (prev[index] !== 'untouched') {
        triggerHaptic('safe');
        return prev;
      }

      const nextStates = [...prev];

      if (index === activeTrapIndex) {
        nextStates[index] = 'trap';
        setStatus('trapHit');
        const loser = names[currentPlayerIndex];
        setLosingPlayer(loser);
        showBanner();
        triggerHaptic('trap');
        AccessibilityInfo.announceForAccessibility?.(`${loser.label} hit the trap`);
        return nextStates;
      }

      nextStates[index] = 'safe';
      triggerHaptic('safe');
      setStatus('playing');
      advanceTurn();
      AccessibilityInfo.announceForAccessibility?.('Safe pad');
      return nextStates;
    });
  };

  const safePadsLeft = padStates.filter((state) => state === 'untouched').length;

  const footerText = useMemo(() => {
    if (status === 'trapHit' && losingPlayer) {
      return `${losingPlayer.label} loses — take a sip 🍻`;
    }
    if (!totalPlayers) {
      return 'Add players to keep score.';
    }
    return `${currentPlayer.label}’s turn${status === 'idle' ? '' : ''}`;
  }, [status, losingPlayer, currentPlayer, totalPlayers]);

  const handleHelp = () => {
    Alert.alert('How to play', 'Take turns picking pads. Stay safe and avoid the hidden trap. If you find it, you drink!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <BackButton />
          <Pressable onPress={handleHelp} style={styles.helpButton} hitSlop={12}>
            <Text style={styles.helpText}>?</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Tipsy Trap</Text>
          <Text style={styles.subtitle}>Don’t hit the trap!</Text>
        </View>

        <View style={[styles.grid, { paddingHorizontal: horizontalPadding, columnGap: gutter, rowGap: gutter }]}>
          {Array.from({ length: PAD_COUNT }).map((_, index) => (
            <CircularPad
              key={index}
              index={index}
              size={padSize}
              state={padStates[index] === 'trap' && status !== 'trapHit' ? 'untouched' : padStates[index]}
              disabled={status === 'trapHit'}
              onPress={handlePadPress}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerText}</Text>
          {status === 'trapHit' && (
            <Pressable style={styles.resetButton} onPress={resetRound}>
              <Text style={styles.resetButtonText}>Reset Round</Text>
            </Pressable>
          )}
          <Text style={styles.counterText}>Safe pads left: {safePadsLeft}</Text>
        </View>

        {status === 'trapHit' && losingPlayer && (
          <Animated.View
            style={[
              styles.banner,
              {
                transform: [
                  {
                    translateY: bannerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.bannerTitle}>Trap triggered!</Text>
            <Text style={styles.bannerText}>{losingPlayer.label} takes the sip.</Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKDROP
  },
  screen: {
    flex: 1,
    backgroundColor: BACKDROP,
    paddingVertical: 32,
    gap: 24
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SAFE_BORDER,
    alignItems: 'center',
    justifyContent: 'center'
  },
  helpText: {
    color: '#F5F5F7',
    fontWeight: '700',
    fontSize: 16
  },
  hero: {
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#F5F5F7',
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    color: '#AAAAB3',
    fontSize: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24
  },
  footerText: {
    color: '#F5F5F7',
    fontSize: 18,
    fontWeight: '600'
  },
  counterText: {
    color: '#6C6C75',
    fontSize: 14
  },
  resetButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20
  },
  resetButtonText: {
    color: BACKDROP,
    fontWeight: '700',
    fontSize: 16
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1D1D23',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderColor: SAFE_BORDER
  },
  bannerTitle: {
    color: '#FF6F91',
    fontSize: 18,
    fontWeight: '700'
  },
  bannerText: {
    color: '#F5F5F7',
    fontSize: 16
  }
});
