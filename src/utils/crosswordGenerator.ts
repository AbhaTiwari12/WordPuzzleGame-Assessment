import { CrosswordLayout, Direction, GridCell, PlacedWord } from '@/models/types';

interface RawCell {
  letter: string;
  wordIds: Set<string>;
}

type CellMap = Map<string, RawCell>;

const key = (row: number, col: number) => `${row},${col}`;

/**
 * Checks whether `word` can be placed starting at (row, col) in `dir` without
 * conflicting with existing letters, and without touching an unrelated word
 * (which would visually merge two words together).
 */
function canPlace(word: string, row: number, col: number, dir: Direction, grid: CellMap): boolean {
  for (let k = 0; k < word.length; k++) {
    const r = dir === 'across' ? row : row + k;
    const c = dir === 'across' ? col + k : col;
    const existing = grid.get(key(r, c));

    if (existing) {
      if (existing.letter !== word[k]) return false;
      continue;
    }

    // New cell: make sure we're not creating an accidental adjacency with
    // another word running perpendicular to this one.
    if (dir === 'across') {
      if (grid.has(key(r - 1, c)) || grid.has(key(r + 1, c))) return false;
    } else {
      if (grid.has(key(r, c - 1)) || grid.has(key(r, c + 1))) return false;
    }
  }

  // Cells immediately before/after the word must be empty so it doesn't
  // silently extend an existing word.
  if (dir === 'across') {
    if (grid.has(key(row, col - 1))) return false;
    if (grid.has(key(row, col + word.length))) return false;
  } else {
    if (grid.has(key(row - 1, col))) return false;
    if (grid.has(key(row + word.length, col))) return false;
  }

  return true;
}

function commitPlacement(word: string, row: number, col: number, dir: Direction, grid: CellMap) {
  for (let k = 0; k < word.length; k++) {
    const r = dir === 'across' ? row : row + k;
    const c = dir === 'across' ? col + k : col;
    const cellKey = key(r, c);
    const existing = grid.get(cellKey);
    if (existing) {
      existing.wordIds.add(word);
    } else {
      grid.set(cellKey, { letter: word[k], wordIds: new Set([word]) });
    }
  }
}

/**
 * Attempts to find an intersection between `word` and any already-placed word,
 * returning a valid (row, col, direction) or null if none exists.
 */
function findPlacement(
  word: string,
  placed: PlacedWord[],
  grid: CellMap
): { row: number; col: number; dir: Direction } | null {
  for (const pw of placed) {
    const newDir: Direction = pw.direction === 'across' ? 'down' : 'across';

    for (let idx2 = 0; idx2 < pw.word.length; idx2++) {
      for (let idx1 = 0; idx1 < word.length; idx1++) {
        if (pw.word[idx2] !== word[idx1]) continue;

        const cellRow = pw.direction === 'across' ? pw.row : pw.row + idx2;
        const cellCol = pw.direction === 'across' ? pw.col + idx2 : pw.col;

        const startRow = newDir === 'down' ? cellRow - idx1 : cellRow;
        const startCol = newDir === 'down' ? cellCol : cellCol - idx1;

        if (canPlace(word, startRow, startCol, newDir, grid)) {
          return { row: startRow, col: startCol, dir: newDir };
        }
      }
    }
  }
  return null;
}

/**
 * Builds a crossword layout from a word list using a deterministic greedy
 * intersection algorithm:
 *  1. The longest word is anchored horizontally.
 *  2. Every subsequent word (longest-first) is placed at the first valid
 *     intersection found against already-placed words.
 *  3. Words with no valid intersection become "bonus" words — still
 *     discoverable on the wheel, just not shown as grid slots.
 */
export function generateCrosswordLayout(words: string[]): CrosswordLayout {
  const uniqueWords = Array.from(new Set(words.map((w) => w.toUpperCase())));
  const sorted = [...uniqueWords].sort((a, b) => b.length - a.length);

  const grid: CellMap = new Map();
  const placedWords: PlacedWord[] = [];
  const bonusWords: string[] = [];

  if (sorted.length === 0) {
    return { rows: 0, cols: 0, cells: [], placedWords: [], bonusWords: [] };
  }

  const first = sorted[0];
  commitPlacement(first, 0, 0, 'across', grid);
  placedWords.push({ word: first, row: 0, col: 0, direction: 'across' });

  for (let i = 1; i < sorted.length; i++) {
    const word = sorted[i];
    const placement = findPlacement(word, placedWords, grid);
    if (placement) {
      commitPlacement(word, placement.row, placement.col, placement.dir, grid);
      placedWords.push({ word, row: placement.row, col: placement.col, direction: placement.dir });
    } else {
      bonusWords.push(word);
    }
  }

  // Normalize coordinates so the grid starts at (0, 0).
  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -Infinity;
  let maxCol = -Infinity;
  for (const k of grid.keys()) {
    const [r, c] = k.split(',').map(Number);
    minRow = Math.min(minRow, r);
    minCol = Math.min(minCol, c);
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;

  const cells: GridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ row: r, col: c, letter: '', wordIds: [] as string[] }))
  );

  for (const [k, cell] of grid.entries()) {
    const [r, c] = k.split(',').map(Number);
    const nr = r - minRow;
    const nc = c - minCol;
    cells[nr][nc] = { row: nr, col: nc, letter: cell.letter, wordIds: Array.from(cell.wordIds) };
  }

  const normalizedPlacedWords = placedWords.map((pw) => ({
    ...pw,
    row: pw.row - minRow,
    col: pw.col - minCol,
  }));

  return { rows, cols, cells, placedWords: normalizedPlacedWords, bonusWords };
}
