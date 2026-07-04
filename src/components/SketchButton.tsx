import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  disabled?: boolean;
};

export function SketchButton({ label, onPress, compact = false, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.border}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    marginTop: 24,
  },
  buttonCompact: {
    alignSelf: 'auto',
    marginTop: 0,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.45,
  },
  border: {
    borderWidth: 2,
    borderColor: theme.ink,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderStyle: 'solid',
  },
  label: {
    fontFamily: fonts.hand,
    fontSize: 28,
    color: theme.ink,
  },
});
