import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import styles from '@/theme/styles';

const defaultBorderColor = 'rgba(255, 255, 255, 0.25)';

const swatches = [
  { background: '#FF9D00', text: '#12002F' },
  { background: '#240051', text: '#F5EEFF' },
  { background: '#F5EEFF', text: '#240051' },
  { background: '#12002F', text: '#FF9D00' }
];

type Props = {
  name: string;
  index: number;
  size?: number;
  isActive?: boolean;
};

function PlayerAvatar({ name, index, size = 48, isActive = false }: Props) {
  const initials = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return '?';
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [name]);

  const palette = swatches[index % swatches.length];
  const borderColor = isActive ? '#FF9D00' : defaultBorderColor;
  const fontSize = size > 48 ? 20 : Math.max(14, Math.round(size * 0.45));

  return (
    <View
      style={[
        styles.playerAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.background,
          borderColor
        }
      ]}
    >
      <Text style={[styles.playerInitial, { color: palette.text, fontSize }]}>{initials}</Text>
    </View>
  );
}

export default memo(PlayerAvatar);
