import { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, Pressable, Text, View } from 'react-native';
const bottleImage = require('../../../assets/spin_bottle.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import PlayerAvatar from '@/components/PlayerAvatar';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from '@/theme/styles';

const prompts = [
  'Sip if you have a group chat muted.',
  'Truth: most embarrassing screenshot on your phone?',
  'Wildcard: everybody drinks!',
  'Dare: swap seats with the loudest player.',
  'Truth: who was your last text to?',
  'Dare: speak in song lyrics until your next turn.',
  'Sip if you have more than 50 unread emails.',
  'Wildcard: choose someone to finish your drink.'
];

export default function SpinGameScreen() {
  const { players } = usePlayers();
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const rotation = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const bottleRotation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  const canSpin = players.length >= 2;

  const circleLayout = useMemo(() => {
    if (!players.length) {
      return [];
    }

    const circleRadius = 130;
    const avatarSize = 56;
    const center = circleRadius; // spinCircle is 2 * radius
    const offset = avatarSize / 2 - 6;

    return players.map((player, index) => {
      const angle = (2 * Math.PI * index) / players.length - Math.PI / 2;
      const left = center + Math.cos(angle) * (circleRadius + offset) - avatarSize / 2;
      const top = center + Math.sin(angle) * (circleRadius + offset) - avatarSize / 2;

      return {
        player,
        index,
        style: {
          position: 'absolute' as const,
          left,
          top
        }
      };
    });
  }, [players]);

  const activePlayer = useMemo(
    () => players.find((player) => player.id === activePlayerId) ?? null,
    [players, activePlayerId]
  );

  const runSpin = () => {
    if (!players.length) {
      return;
    }

    const randomAngle = Math.random() * 360;
    const extraTurns = (Math.floor(Math.random() * 3) + 4) * 360;
    const toValue = currentRotation.current + randomAngle + extraTurns;

    setSpinning(true);
    Animated.timing(rotation, {
      toValue,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      const normalized = ((toValue % 360) + 360) % 360;
      currentRotation.current = normalized;
      rotation.setValue(normalized);

      const anglePer = 360 / players.length;
      const pointerAngle = (normalized + 90) % 360;
      const selectedIndex = Math.floor((pointerAngle + anglePer / 2) / anglePer) % players.length;
      const chosenPlayer = players[selectedIndex];

      if (chosenPlayer) {
        setActivePlayerId(chosenPlayer.id);
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];
        setCurrentPrompt(prompt);
        setShowPrompt(true);
      }

      setSpinning(false);
    });
  };

  const handleSpin = () => {
    if (!players.length) {
      Alert.alert('Almost ready', 'Add players before spinning the bottle.');
      return;
    }

    if (!canSpin) {
      Alert.alert('Need more players', 'Grab at least two players to make the spin count.');
      return;
    }

    if (spinning || showPrompt) {
      return;
    }

    setActivePlayerId(null);
    setCurrentPrompt(null);
    setShowPrompt(false);
    runSpin();
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    setCurrentPrompt(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BackButton />
          <View style={styles.heroContainer}>
            <Text style={styles.sectionTitle}>Spin</Text>
            <Text style={styles.tagline}>
              {canSpin
                ? 'Spin! Spin! Spin!'
                : 'Add at least two players on the previous screen to start playing.'}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.spinStage, pressed && canSpin && !spinning && !showPrompt ? { opacity: 0.92 } : null]}
          onPress={handleSpin}
        >
          <View style={styles.spinCircle}>
            {circleLayout.map(({ player, index, style }) => (
              <View key={player.id} style={style}>
                <PlayerAvatar
                  name={player.name || `P${index + 1}`}
                  index={index}
                  size={56}
                  isActive={player.id === activePlayerId}
                />
              </View>
            ))}

            <Animated.View style={[styles.bottleContainer, { transform: [{ rotate: bottleRotation }] }]}> 
              <Image source={bottleImage} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
            </Animated.View>
          </View>

          {players.length <= 3 && (
            <Text style={styles.spinHint}>
              {spinning ? 'Bottle is spinning…' : 'Tap anywhere to spin the bottle.'}
            </Text>
          )}
        </Pressable>

        {showPrompt && activePlayer && currentPrompt && (
          <Pressable style={styles.promptOverlay} onPress={handleDismissPrompt}>
            <View style={styles.promptCard}>
              <Text style={styles.promptHeading}>{activePlayer.name}</Text>
              <Text style={styles.promptText}>{currentPrompt}</Text>
              <Text style={[styles.spinHint, { marginTop: 16 }]}>Tap to hide and spin again.</Text>
            </View>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
