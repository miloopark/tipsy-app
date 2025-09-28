import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type PadState = 'untouched' | 'safe' | 'trap';

type Props = {
  index: number;
  size: number;
  state: PadState;
  disabled?: boolean;
  onPress: (index: number) => void;
};

function CircularPad({ index, size, state, disabled = false, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'safe') {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 90,
          useNativeDriver: true
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 16,
          bounciness: 12,
          useNativeDriver: true
        })
      ]).start();
    }

    if (state === 'trap') {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 120,
          useNativeDriver: true
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 18,
          bounciness: 14,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [scale, state]);

  const accessibilityLabel = useMemo(() => `Pad ${index + 1}`, [index]);

  const handlePress = () => {
    if (disabled) {
      return;
    }
    onPress(index);
  };

  const gradientColors = useMemo(() => {
    switch (state) {
      case 'safe':
        return ['#B51C2C', '#7F0F1D'] as const;
      case 'trap':
        return ['#FF7788', '#D51F33'] as const;
      default:
        return ['#F54D58', '#C41E2D'] as const;
    }
  }, [state]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to test your luck"
      accessibilityState={{ disabled: disabled || state !== 'untouched' }}
      style={({ pressed }) => [
        styles.touch,
        {
          width: size,
          height: size,
          opacity: pressed ? 0.92 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          state === 'safe' && styles.safe,
          state === 'trap' && styles.trap,
          {
            transform: [{ scale }]
          }
        ]}
      >
        <LinearGradient colors={gradientColors} style={styles.inner}>
          <Text style={styles.label}>{index + 1}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default memo(CircularPad);

const styles = StyleSheet.create({
  touch: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  base: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#7A0E1B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#1D1D23'
  },
  safe: {
    borderColor: '#5E0C18'
  },
  trap: {
    borderColor: '#FF9DAF'
  },
  inner: {
    width: '92%',
    height: '92%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  label: {
    color: '#FFF5F5',
    fontSize: 16,
    fontWeight: '700'
  }
});
