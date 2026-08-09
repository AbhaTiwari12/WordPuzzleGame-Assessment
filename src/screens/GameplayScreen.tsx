import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { useGameSession } from '@/hooks/useGameSession';
import { CrosswordGrid } from '@/components/grid/CrosswordGrid';
import { LetterWheel } from '@/components/wheel/LetterWheel';
import { Toast } from '@/components/common/Toast';
import { ProgressBar } from '@/components/common/ProgressBar';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/typography';
import { levelLoader } from '@/data/levelLoader';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

export function GameplayScreen({ route, navigation }: Props) {
  const { levelId } = route.params;
  const session = useGameSession(levelId);
  const [celebrate, setCelebrate] = useState(false);
  const celebrateScale = useRef(new Animated.Value(0.7)).current;

  // Hardware back button opens Pause instead of leaving gameplay abruptly,
  // matching the required Home -> LevelSelect -> Gameplay -> Pause flow.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Pause', { levelId });
        return true;
      });
      return () => sub.remove();
    }, [navigation, levelId])
  );

  useEffect(() => {
    if (session.isLevelComplete) {
      setCelebrate(true);
      Animated.spring(celebrateScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 12 }).start();
    }
  }, [session.isLevelComplete, celebrateScale]);

  const goNextLevel = () => {
    const all = levelLoader.getAll();
    const idx = all.findIndex((l) => l.id === levelId);
    const next = all[idx + 1];
    setCelebrate(false);
    celebrateScale.setValue(0.7);
    if (next) {
      navigation.replace('Gameplay', { levelId: next.id });
    } else {
      navigation.popToTop();
    }
  };

  if (!session.level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[typography.body, { color: colors.textPrimary }]}>Level not found.</Text>
      </SafeAreaView>
    );
  }

  const progressRatio = session.gridWordsTotal > 0 ? session.gridWordsFound / session.gridWordsTotal : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Pause', { levelId })} hitSlop={12}>
          <Ionicons name="pause" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progressRatio} />
          <Text style={[typography.caption, styles.progressLabel]}>
            {session.gridWordsFound}/{session.gridWordsTotal} words
          </Text>
        </View>
        <Text style={[typography.caption, styles.levelBadge]}>#{levelId}</Text>
      </View>

      <View style={styles.gridArea}>
        <CrosswordGrid layout={session.layout} foundWords={session.foundSet} />
      </View>

      {session.bonusFound.length > 0 && (
        <Text style={[typography.caption, styles.bonusRow]} numberOfLines={1}>
          Bonus: {session.bonusFound.join(' · ')}
        </Text>
      )}

      <View style={styles.wheelArea}>
        <Toast result={session.feedback?.result ?? null} onDone={session.clearFeedback} />
        <LetterWheel letters={session.level.letters} onWordSubmit={session.submitPath} />
      </View>

      {celebrate && (
        <View style={styles.celebrateOverlay}>
          <Animated.View style={[styles.celebrateCard, { transform: [{ scale: celebrateScale }] }]}>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Level Complete!</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {session.bonusFound.length} bonus word{session.bonusFound.length === 1 ? '' : 's'} found
            </Text>
            <Pressable style={styles.nextButton} onPress={goNextLevel}>
              <Text style={[typography.h2, { color: colors.background }]}>Next Level</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  progressWrap: { flex: 1 },
  progressLabel: { color: colors.textSecondary, marginTop: 4 },
  levelBadge: { color: colors.textMuted },
  gridArea: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  bonusRow: {
    color: colors.bonus,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  wheelArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
  },
  nextButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
  },
});
