import { WordAttemptResult } from '@/models/types';

/**
 * Resolves a completed swipe gesture into a word and classifies it.
 *
 * @param letters      The wheel's letters, in wheel position order.
 * @param pathIndices  Indices into `letters` in the order the player traced them.
 * @param validWords   All valid words for the current level (grid + bonus).
 * @param placedWords  Words that are actually shown as slots in the grid.
 * @param foundWords   Words already found this level (grid + bonus combined).
 */
export function resolveSwipe(
  letters: string[],
  pathIndices: number[],
  validWords: string[],
  placedWords: string[],
  foundWords: Set<string>
): WordAttemptResult {
  const word = pathIndices.map((i) => letters[i]).join('').toUpperCase();

  if (word.length < 3) {
    return { word, status: 'invalid' };
  }
  if (!validWords.includes(word)) {
    return { word, status: 'invalid' };
  }
  if (foundWords.has(word)) {
    return { word, status: 'already-found' };
  }
  return { word, status: placedWords.includes(word) ? 'grid' : 'bonus' };
}

/**
 * Confirms a word is actually achievable from the wheel's letter multiset
 * (guards against words that share letters with the pool but need more
 * copies of a letter than are available).
 */
export function isAchievableFromPool(word: string, letters: string[]): boolean {
  const pool = [...letters.map((l) => l.toUpperCase())];
  for (const ch of word.toUpperCase()) {
    const idx = pool.indexOf(ch);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}
