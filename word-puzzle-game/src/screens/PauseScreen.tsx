import React, { useCallback } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { colors } from '@/theme/colors';
import { spacing, typography } from '@/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Pause'>;

/**
 * Presented as a transparent modal on top of Gameplay (see RootNavigator).
 * Gameplay stays mounted underneath, so resuming is instant with zero state
 * loss — the session hook never re-runs its setup.
 */
export function PauseScreen({ navigation }: Props) {
  // Hardware back button while paused simply resumes play.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.goBack();
        return true;
      });
      return () => sub.remove();
    }, [navigation])
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={[typography.h1, styles.title]}>Paused</Text>

        <AnimatedButton label="Resume" onPress={() => navigation.goBack()} style={styles.button} />
        <AnimatedButton
          label="Level Select"
          variant="secondary"
          onPress={() => navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'LevelSelect' }] })}
          style={styles.button}
        />
        <AnimatedButton
          label="Quit to Home"
          variant="ghost"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '82%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: { color: colors.textPrimary, marginBottom: spacing.lg },
  button: { width: '100%', marginTop: spacing.sm },
});
