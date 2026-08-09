import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LevelProgress } from '@/models/types';
import { levelLoader } from '@/data/levelLoader';

interface GameState {
  /** Highest level index (0-based) the player has unlocked. */
  unlockedIndex: number;
  /** levelId -> progress */
  progress: Record<number, LevelProgress>;
  totalScore: number;

  getProgress: (levelId: number) => LevelProgress;
  recordWordFound: (levelId: number, word: string, isBonus: boolean, points: number) => void;
  completeLevel: (levelId: number, stars: number) => void;
  isLevelUnlocked: (levelIndex: number) => boolean;
  resetProgress: () => void;
}

function emptyProgress(levelId: number): LevelProgress {
  return { levelId, foundWords: [], foundBonusWords: [], completed: false, stars: 0 };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      unlockedIndex: 0,
      progress: {},
      totalScore: 0,

      getProgress: (levelId) => get().progress[levelId] ?? emptyProgress(levelId),

      recordWordFound: (levelId, word, isBonus, points) => {
        set((state) => {
          const current = state.progress[levelId] ?? emptyProgress(levelId);
          if (current.foundWords.includes(word) || current.foundBonusWords.includes(word)) {
            return state;
          }
          const updated: LevelProgress = isBonus
            ? { ...current, foundBonusWords: [...current.foundBonusWords, word] }
            : { ...current, foundWords: [...current.foundWords, word] };

          return {
            progress: { ...state.progress, [levelId]: updated },
            totalScore: state.totalScore + points,
          };
        });
      },

      completeLevel: (levelId, stars) => {
        set((state) => {
          const current = state.progress[levelId] ?? emptyProgress(levelId);
          const levels = levelLoader.getAll();
          const idx = levels.findIndex((l) => l.id === levelId);
          const nextUnlocked = Math.max(state.unlockedIndex, idx + 1);
          return {
            progress: {
              ...state.progress,
              [levelId]: { ...current, completed: true, stars: Math.max(current.stars, stars) },
            },
            unlockedIndex: Math.min(nextUnlocked, levels.length - 1),
          };
        });
      },

      isLevelUnlocked: (levelIndex) => levelIndex <= get().unlockedIndex,

      resetProgress: () => set({ unlockedIndex: 0, progress: {}, totalScore: 0 }),
    }),
    {
      name: 'word-wheel-progress',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the fields that represent durable player progress.
      partialize: (state) => ({
        unlockedIndex: state.unlockedIndex,
        progress: state.progress,
        totalScore: state.totalScore,
      }),
    }
  )
);
