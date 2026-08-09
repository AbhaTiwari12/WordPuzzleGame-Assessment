import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, typography } from '@/theme/typography';
import { WordAttemptResult } from '@/models/types';

interface Props {
  result: WordAttemptResult | null;
  onDone: () => void;
}

const messages: Record<WordAttemptResult['status'], (word: string) => string> = {
  grid: (w) => w,
  bonus: (w) => `${w}  •  BONUS`,
  'already-found': (w) => `${w} — already found`,
  invalid: () => 'Not a word',
};

const tintFor: Record<WordAttemptResult['status'], string> = {
  grid: colors.success,
  bonus: colors.bonus,
  'already-found': colors.textMuted,
  invalid: colors.danger,
};

export function Toast({ result, onDone }: Props) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!result) return;
    translateY.setValue(16);
    opacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      Animated.delay(650),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [result, translateY, opacity, onDone]);

  if (!result) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: tintFor[result.status], opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={[typography.h2, styles.text]}>{messages[result.status](result.word)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    zIndex: 10,
  },
  text: {
    color: '#1B0F30',
  },
});
