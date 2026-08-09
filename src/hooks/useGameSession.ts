import { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { levelLoader } from '@/data/levelLoader';
import { generateCrosswordLayout } from '@/utils/crosswordGenerator';
import { resolveSwipe } from '@/utils/wordValidator';
import { useGameStore } from '@/store/gameStore';
import { WordAttemptResult } from '@/models/types';

export interface FeedbackEvent {
  id: number;
  result: WordAttemptResult;
}

const POINTS_GRID_LETTER = 10;
const POINTS_BONUS_LETTER = 15;

/**
 * ViewModel for a single gameplay session. Combines:
 *  - immutable level definition (data layer)
 *  - deterministic derived crossword layout (pure function, cheap to recompute)
 *  - persisted progress (zustand store) — survives rotation / app backgrounding
 *    because it's re-read from the store on every render rather than kept in
 *    local-only state.
 */
export function useGameSession(levelId: number) {
  const level = useMemo(() => levelLoader.getById(levelId), [levelId]);
  const layout = useMemo(() => generateCrosswordLayout(level?.words ?? []), [level]);

  const storeProgress = useGameStore((s) => s.getProgress(levelId));
  const recordWordFound = useGameStore((s) => s.recordWordFound);
  const completeLevel = useGameStore((s) => s.completeLevel);

  const [feedback, setFeedback] = useState<FeedbackEvent | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const placedWordStrings = useMemo(() => layout.placedWords.map((p) => p.word), [layout]);
  const allValidWords = level?.words ?? [];

  const foundSet = useMemo(
    () => new Set([...storeProgress.foundWords, ...storeProgress.foundBonusWords]),
    [storeProgress]
  );

  const gridWordsFound = storeProgress.foundWords.length;
  const gridWordsTotal = placedWordStrings.length;
  const isLevelComplete = gridWordsTotal > 0 && gridWordsFound >= gridWordsTotal;

  const submitPath = useCallback(
    (pathIndices: number[]) => {
      if (!level || pathIndices.length === 0) return null;

      const result = resolveSwipe(level.letters, pathIndices, allValidWords, placedWordStrings, foundSet);

      setFeedback({ id: Date.now(), result });

      if (result.status === 'grid' || result.status === 'bonus') {
        const points = (result.status === 'grid' ? POINTS_GRID_LETTER : POINTS_BONUS_LETTER) * result.word.length;
        recordWordFound(levelId, result.word, result.status === 'bonus', points);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        const newGridCount = result.status === 'grid' ? gridWordsFound + 1 : gridWordsFound;
        if (gridWordsTotal > 0 && newGridCount >= gridWordsTotal) {
          const stars = storeProgress.foundBonusWords.length >= 2 ? 3 : storeProgress.foundBonusWords.length >= 1 ? 2 : 1;
          completeLevel(levelId, stars);
        }
      } else if (result.status === 'invalid') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      return result;
    },
    [level, allValidWords, placedWordStrings, foundSet, levelId, recordWordFound, gridWordsFound, gridWordsTotal, completeLevel, storeProgress]
  );

  const clearFeedback = useCallback(() => setFeedback(null), []);
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return {
    level,
    layout,
    foundSet,
    bonusFound: storeProgress.foundBonusWords,
    gridWordsFound,
    gridWordsTotal,
    isLevelComplete,
    feedback,
    clearFeedback,
    submitPath,
    isPaused,
    pause,
    resume,
  };
}
