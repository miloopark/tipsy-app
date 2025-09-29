import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import BackButton from '@/components/BackButton';
import { usePlayers } from '@/contexts/PlayersContext';

const BACKGROUND = '#12002F';
const SURFACE = '#240051';
const ACCENT = '#FF9D00';
const SECONDARY = 'rgba(245, 238, 255, 0.7)';

const ROUND_DURATION_SECONDS = 30;

type Phase = 'deciding' | 'ready' | 'running' | 'review';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PlayerInfo = {
  id: string;
  label: string;
};

export default function HotSeatScreen() {
  const { players } = usePlayers();
  const roster: PlayerInfo[] = useMemo(() => {
    if (!players.length) {
      return [{ id: 'solo', label: 'Player 1' }];
    }
    return players.map((player, index) => ({
      id: player.id,
      label: player.name.trim() || `Player ${index + 1}`
    }));
  }, [players]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('deciding');
  const [secondsRemaining, setSecondsRemaining] = useState(ROUND_DURATION_SECONDS);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentPlayer = roster[currentPlayerIndex];

  const circleSize = 220;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  const preparePlayer = useCallback((index: number) => {
    stopTimer();
    setCurrentPlayerIndex(index);
    setSecondsRemaining(ROUND_DURATION_SECONDS);
    progressAnim.setValue(0);
    setPhase('ready');
  }, [progressAnim, stopTimer]);

  const resetTimer = useCallback(() => {
    preparePlayer(currentPlayerIndex);
  }, [currentPlayerIndex, preparePlayer]);

  const startTimer = useCallback(() => {
    if (phase !== 'ready') {
      return;
    }
    stopTimer();
    animationRef.current?.stop();
    setPhase('running');
    const startTime = Date.now();
    progressAnim.setValue(0);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(ROUND_DURATION_SECONDS - elapsed, 0);
      setSecondsRemaining(remaining);

      if (remaining === 0) {
        stopTimer();
        progressAnim.setValue(1);
        setSecondsRemaining(0);
        setPhase('review');
      }
    }, 200);

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: ROUND_DURATION_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false
    });
    animationRef.current = animation;
    animation.start();
  }, [phase, progressAnim, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
    };
  }, [stopTimer]);

  const rollForStarter = useCallback(() => {
    if (!roster.length) {
      setPhase('ready');
      progressAnim.setValue(0);
      return;
    }

    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }

    setPhase('deciding');
    let ticks = 0;
    const maxTicks = 12;
    rollIntervalRef.current = setInterval(() => {
      ticks += 1;
      setCurrentPlayerIndex(Math.floor(Math.random() * roster.length));
      if (ticks >= maxTicks) {
        clearInterval(rollIntervalRef.current!);
        rollIntervalRef.current = null;
        const chosen = Math.floor(Math.random() * roster.length);
        preparePlayer(chosen);
      }
    }, 120);
  }, [preparePlayer, progressAnim, roster.length]);

  useEffect(() => {
    rollForStarter();
  }, [rollForStarter]);

  const nextPlayer = useCallback(() => {
    if (!roster.length) {
      return;
    }
    const nextIndex = (currentPlayerIndex + 1) % roster.length;
    preparePlayer(nextIndex);
  }, [currentPlayerIndex, roster.length, preparePlayer]);

  const handleMarkSatisfactory = () => {
    nextPlayer();
  };

  const handleMarkDrink = () => {
    Alert.alert('Take a sip 🍻', `${currentPlayer.label} owes the group a drink!`, [
      { text: 'OK', onPress: nextPlayer }
    ]);
  };

  const handleHelp = () => {
    Alert.alert(
      'How to play Hot Seat',
      'We roll the dice to pick who starts. Tap anywhere on the screen to launch the 30-second timer, grill the player with questions, then decide if the answers pass or they drink.'
    );
  };

  const timerText = phase === 'running'
    ? `${secondsRemaining}s left`
    : phase === 'review'
      ? 'Time’s up!'
      : phase === 'deciding'
        ? 'Rolling to pick a starter…'
        : 'Timer ready';

  const handleTapToStart = () => {
    if (phase === 'ready') {
      startTimer();
    }
  };

  const tapHint = (() => {
    switch (phase) {
      case 'deciding':
        return 'Rolling the dice for the first player…';
      case 'ready':
        return 'Tap anywhere to start the 30-second timer.';
      case 'running':
        return 'Timer running — keep the questions coming!';
      case 'review':
        return 'Time’s up — decide if the answers passed.';
      default:
        return '';
    }
  })();

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
          <Text style={styles.title}>Hot Seat</Text>
          <Text style={styles.subtitle}>Give the player 30 seconds to spill.</Text>
        </View>

        <Pressable style={styles.tapArea} onPress={handleTapToStart} disabled={phase !== 'ready'}>
          <View style={styles.timerCircleContainer}>
            <Svg width={circleSize} height={circleSize}>
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={ACCENT}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                rotation={-90}
                originX={circleSize / 2}
                originY={circleSize / 2}
              />
            </Svg>
            <View style={styles.playerBadge} pointerEvents="none">
              <Text style={styles.playerLabel}>{currentPlayer?.label ?? 'Player 1'}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.infoSection}>
          <Text style={styles.timerText}>{timerText}</Text>
          <Text style={styles.tapHint}>{tapHint}</Text>
          <Pressable style={styles.resetLink} onPress={resetTimer}>
            <Text style={styles.resetLinkText}>Reset timer</Text>
          </Pressable>
        </View>

        {phase === 'review' && (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>How were the answers?</Text>
              <Pressable style={[styles.overlayButton, styles.passButton]} onPress={handleMarkSatisfactory}>
                <Text style={styles.overlayButtonText}>Answers pass</Text>
              </Pressable>
              <Pressable style={[styles.overlayButton, styles.drinkButton]} onPress={handleMarkDrink}>
                <Text style={styles.overlayButtonText}>Drink up</Text>
              </Pressable>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND
  },
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 24,
    gap: 32
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  helpText: {
    color: SECONDARY,
    fontWeight: '700',
    fontSize: 16
  },
  hero: {
    gap: 8
  },
  title: {
    color: '#F5EEFF',
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    color: SECONDARY,
    fontSize: 16
  },
  tapArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerLabel: {
    color: '#F5EEFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center'
  },
  timerText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '600'
  },
  timerCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(18, 0, 47, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  infoSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  tapHint: {
    color: SECONDARY,
    textAlign: 'center',
    marginTop: 4
  },
  resetLink: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  resetLinkText: {
    color: SECONDARY,
    fontWeight: '600'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 0, 47, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  overlayCard: {
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 24,
    gap: 16
  },
  overlayTitle: {
    color: '#F5EEFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  overlayButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center'
  },
  passButton: {
    backgroundColor: '#1F9341'
  },
  drinkButton: {
    backgroundColor: '#C41E2D'
  },
  overlayButtonText: {
    color: '#F5EEFF',
    fontWeight: '700',
    fontSize: 16
  }
});
