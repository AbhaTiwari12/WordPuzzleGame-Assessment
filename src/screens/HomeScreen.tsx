import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@/navigation/types';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/typography';
import { useGameStore } from '@/store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const totalScore = useGameStore((s) => s.totalScore);
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();
  }, [fade, translateY]);

  return (
    <LinearGradient colors={[colors.background, colors.backgroundGradientEnd]} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY }] }]}>
        <View style={styles.wheelIcon}>
          <Text style={styles.wheelIconLetter}>W</Text>
        </View>
        <Text style={[typography.display, styles.title]}>Word Wheel</Text>
        <Text style={[typography.body, styles.subtitle]}>Swipe letters. Fill the grid. Find every bonus word.</Text>

        <View style={styles.scoreBadge}>
          <Text style={[typography.caption, styles.scoreLabel]}>TOTAL SCORE</Text>
          <Text style={[typography.h1, styles.scoreValue]}>{totalScore}</Text>
        </View>

        <View style={styles.actions}>
          <AnimatedButton label="Play" onPress={() => navigation.navigate('LevelSelect')} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  wheelIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  wheelIconLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  title: { color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    marginBottom: spacing.xxl,
  },
  scoreLabel: { color: colors.textMuted, letterSpacing: 1 },
  scoreValue: { color: colors.bonus },
  actions: { width: '100%', alignItems: 'center' },
});
