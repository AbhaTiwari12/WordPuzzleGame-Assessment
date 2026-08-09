import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/navigation/types';
import { levelLoader } from '@/data/levelLoader';
import { useGameStore } from '@/store/gameStore';
import { colors } from '@/theme/colors';
import { radius, spacing, typography } from '@/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export function LevelSelectScreen({ navigation }: Props) {
  const levels = levelLoader.getAll();
  const unlockedIndex = useGameStore((s) => s.unlockedIndex);
  const progress = useGameStore((s) => s.progress);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h1, styles.headerTitle]}>Levels</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={levels}
        keyExtractor={(l) => String(l.id)}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const unlocked = index <= unlockedIndex;
          const stars = progress[item.id]?.stars ?? 0;
          const completed = progress[item.id]?.completed ?? false;

          return (
            <Pressable
              disabled={!unlocked}
              onPress={() => navigation.navigate('Gameplay', { levelId: item.id })}
              style={[
                styles.tile,
                { backgroundColor: unlocked ? colors.surface : colors.surfaceLight, opacity: unlocked ? 1 : 0.4 },
              ]}
            >
              {unlocked ? (
                <>
                  <Text style={[typography.h2, styles.tileText]}>{item.id}</Text>
                  {completed && (
                    <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
                  )}
                </>
              ) : (
                <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const TILE_SIZE = 96;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { color: colors.textPrimary },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.md,
    margin: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { color: colors.textPrimary },
  stars: { color: colors.bonus, marginTop: 4, fontSize: 12 },
});
