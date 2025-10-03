import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import BackButton from '@/components/BackButton';

const BACKGROUND = '#F8F3E6';
const SURFACE = '#E5E3E1';
const ACCENT = '#CA2A3A';
const SECONDARY = '#7C7C7C';

type CategoryItem = {
  title: string;
  emoji: string;
};

const CATEGORIES: CategoryItem[] = [
  { title: 'Animals', emoji: '🐾' },
  { title: 'TV Shows / Movies', emoji: '🎬' },
  { title: 'Ugly Names', emoji: '😬' },
  { title: 'Pickup Lines', emoji: '😉' },
  { title: 'Excuses for being late', emoji: '⏰' },
  { title: 'Things you’d never say to your boss', emoji: '🤐' },
  { title: 'Biggest red flags', emoji: '🚩' },
  { title: 'Random noises', emoji: '🤪' },
  { title: 'Things you shouldn’t do at a wedding', emoji: '💒' },
  { title: 'Stuff you’d never want in your Tinder bio', emoji: '📱' },
  { title: 'Things you shouldn’t whisper in church', emoji: '🙏' },
  { title: 'Worst things to find in your fridge', emoji: '🥒' },
  { title: 'Things you’d say to a dog but not a human', emoji: '🐶' },
  { title: 'Things you yell in public', emoji: '📢' },
  { title: 'Awkward things to say on a first date', emoji: '🍝' },
  { title: 'What you’ll name your cult', emoji: '🕯️' },
  { title: 'Reasons you’ll get canceled', emoji: '📱' },
  { title: 'Things you shouldn’t say at a funeral', emoji: '⚰️' },
  { title: 'Jobs you’d be terrible at', emoji: '👷' },
  { title: 'Lame excuses for breaking up', emoji: '💔' },
  { title: 'Excuses for why you’re still single', emoji: '🥂' },
  { title: 'Things you’d say right before jail', emoji: '🚔' },
  { title: 'Worst possible text to your parents', emoji: '📲' },
  { title: 'Terrible stripper names', emoji: '💃' }
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const TIMER_SECONDS = 30;
const ROLL_DURATION_MS = 1600;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CategoriesScreen() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [currentLetter, setCurrentLetter] = useState<string>('?');
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'countdown' | 'paused' | 'finished'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TIMER_SECONDS);

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const circleSize = 220;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const resetAll = useCallback(() => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    progressAnimationRef.current?.stop();
    progressAnim.setValue(0);
    setSecondsRemaining(TIMER_SECONDS);
    setSelectedCategory(null);
    setCurrentLetter('?');
    setPhase('idle');
  }, [progressAnim]);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  const startLetterRoll = useCallback((category: CategoryItem) => {
    if (phase === 'rolling' || phase === 'countdown') {
      return;
    }

    setSelectedCategory(category);
    setPhase('rolling');
    progressAnimationRef.current?.stop();
    progressAnim.setValue(0);
    setSecondsRemaining(TIMER_SECONDS);

    let ticks = 0;
    const totalTicks = Math.max(18, Math.floor(ROLL_DURATION_MS / 70));
    rollIntervalRef.current = setInterval(() => {
      ticks += 1;
      setCurrentLetter(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]);
      if (ticks >= totalTicks) {
        if (rollIntervalRef.current) {
          clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }
        const finalLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        setCurrentLetter(finalLetter);
        startTimer(TIMER_SECONDS);
      }
    }, 70);
  }, [phase, progressAnim]);

  const startTimer = useCallback((initialSeconds: number) => {
    const clampedSeconds = Math.max(0, Math.min(TIMER_SECONDS, initialSeconds));
    setPhase('countdown');
    progressAnimationRef.current?.stop();

    const startValue = (TIMER_SECONDS - clampedSeconds) / TIMER_SECONDS;
    progressAnim.setValue(startValue);
    setSecondsRemaining(clampedSeconds);

    const endTimestamp = Date.now() + clampedSeconds * 1000;

    timerIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        clearInterval(timerIntervalRef.current!);
        timerIntervalRef.current = null;
        progressAnim.setValue(1);
        setPhase('finished');
      }
    }, 250);

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: clampedSeconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false
    });
    progressAnimationRef.current = animation;
    animation.start();
  }, [progressAnim]);

  const pauseTimer = useCallback(() => {
    if (phase !== 'countdown') {
      return;
    }
    setPhase('paused');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    progressAnimationRef.current?.stop();
  }, [phase]);

  const resumeTimer = useCallback(() => {
    if (phase !== 'paused') {
      return;
    }
    startTimer(secondsRemaining);
  }, [phase, secondsRemaining, startTimer]);

  const handleInstructionDismiss = () => {
    setShowInstructions(false);
  };

  const handleCategoryPress = (category: CategoryItem) => {
    startLetterRoll(category);
  };

  const handleNextRound = () => {
    resetAll();
  };

  const infoText = useMemo(() => {
    switch (phase) {
      case 'rolling':
        return 'Rolling a random letter…';
      case 'countdown':
        return `${secondsRemaining}s left — answers must start with “${currentLetter}”.`;
      case 'paused':
        return `Paused at ${secondsRemaining}s. Resume when ready.`;
      case 'finished':
        return 'Times up! Anyone who lagged behind drinks.';
      default:
        return '';
    }
  }, [phase, secondsRemaining, currentLetter]);

  const showingRound = selectedCategory !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <BackButton />
          <Pressable style={styles.helpButton} hitSlop={12} onPress={() => setShowInstructions(true)}>
            <Text style={styles.helpText}>?</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Pick a topic, roll a letter, keep the answers flowing.</Text>
        </View>

        {showingRound ? (
          <View style={styles.letterSection}>
            <Text style={styles.activeCategoryText}>
              {selectedCategory?.emoji} {selectedCategory?.title}
            </Text>
            <Pressable
              style={styles.timerCircleContainer}
              onPress={() => {
                if (phase === 'countdown') {
                  pauseTimer();
                } else if (phase === 'paused') {
                  resumeTimer();
                }
              }}
            >
              <Svg width={circleSize} height={circleSize}>
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgba(31,31,31,0.08)"
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
                <Text style={styles.letterText}>{currentLetter}</Text>
              </View>
            </Pressable>
            {infoText.length > 0 && <Text style={styles.infoText}>{infoText}</Text>}
            {(phase === 'countdown' || phase === 'paused') && (
              <Text style={styles.pauseHint}>
                {phase === 'countdown'
                  ? 'Tap the ring to pause'
                  : 'Tap the ring to resume'}
              </Text>
            )}
            {phase === 'finished' && (
              <View style={styles.controlRow}>
                <Pressable style={styles.primaryButton} onPress={handleNextRound}>
                  <Text style={styles.primaryButtonText}>Pick another category</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.title}
            numColumns={2}
            columnWrapperStyle={styles.categoryRow}
            renderItem={({ item }) => (
              <Pressable style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                <Text style={styles.categoryText}>{item.title}</Text>
              </Pressable>
            )}
            contentContainerStyle={styles.categoriesGrid}
            showsVerticalScrollIndicator={false}
          />
        )}

        {showInstructions && (
          <Pressable style={styles.instructionsOverlay} onPress={handleInstructionDismiss}>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How to play</Text>
              <Text style={styles.instructionsBody}>
                Pick a category and we’ll roll a random letter. Everyone quickly shouts an answer that starts with that letter. Repeats are out — once a starting word is used, it’s off the table. Anyone who stalls or can’t answer within 30 seconds drinks!
              </Text>
              <Text style={styles.instructionsTap}>Tap anywhere to begin</Text>
            </View>
          </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24
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
    borderColor: '#D0CECC',
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
    color: '#1F1F1F',
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    color: SECONDARY,
    fontSize: 16
  },
  letterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 16
  },
  timerCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(249, 247, 246, 0.94)',
    borderWidth: 2,
    borderColor: '#D0CECC'
  },
  activeCategoryText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  letterText: {
    color: '#CA2A3A',
    fontSize: 64,
    fontWeight: '800'
  },
  infoText: {
    color: SECONDARY,
    textAlign: 'center'
  },
  pauseHint: {
    color: SECONDARY,
    textAlign: 'center',
    fontSize: 13
  },
  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: BACKGROUND,
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0CECC',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1F1F1F',
    fontWeight: '600'
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8
  },
  categoriesGrid: {
    paddingBottom: 80,
    gap: 18
  },
  categoryRow: {
    width: '100%',
    justifyContent: 'space-between'
  },
  categoryCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#D0CECC',
    alignItems: 'center',
    gap: 10
  },
  categoryEmoji: {
    fontSize: 24
  },
  categoryText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 247, 246, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  instructionsCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#D0CECC',
    shadowColor: '#D0CECC',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  instructionsTitle: {
    color: '#1F1F1F',
    fontSize: 24,
    fontWeight: '700'
  },
  instructionsBody: {
    color: SECONDARY,
    fontSize: 16,
    lineHeight: 24
  },
  instructionsTap: {
    color: ACCENT,
    fontWeight: '600',
    textAlign: 'center'
  }
});
