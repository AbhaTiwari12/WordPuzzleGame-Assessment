/**
 * Core domain models for the word puzzle game.
 * Kept framework-agnostic on purpose so they can be unit tested
 * and reused by both the ViewModel (hooks/store) and View (components) layers.
 */

/** Raw authored level data — the "structured source" the level loader reads from. */
export interface LevelDefinition {
  id: number;
  /** Letters available on the wheel, in display order (already shuffled). 3-5 letters. */
  letters: string[];
  /** Every valid word obtainable from `letters` (grid words + bonus words), uppercase. */
  words: string[];
}

export type Direction = 'across' | 'down';

/** A word placed into the crossword grid by the layout generator. */
export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  direction: Direction;
}

/** A single cell of the crossword grid. */
export interface GridCell {
  row: number;
  col: number;
  letter: string;
  /** Words that occupy this cell — a cell can belong to both an across and a down word. */
  wordIds: string[];
}

/** Fully computed layout for a level: dimensions + cell map + which words got placed. */
export interface CrosswordLayout {
  rows: number;
  cols: number;
  cells: GridCell[][];
  placedWords: PlacedWord[];
  /** Words from LevelDefinition.words that could not be geometrically placed. */
  bonusWords: string[];
}

/** Per-level progress, persisted across app restarts. */
export interface LevelProgress {
  levelId: number;
  foundWords: string[];
  foundBonusWords: string[];
  completed: boolean;
  stars: number;
}

export interface WordAttemptResult {
  word: string;
  status: 'grid' | 'bonus' | 'already-found' | 'invalid';
}
