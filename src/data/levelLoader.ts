import rawLevels from './levels.json';
import { LevelDefinition } from '@/models/types';

/**
 * Single source of truth for level content. In this assessment the data lives in a
 * local JSON asset, but this loader is the seam where a remote/Room/SQLite source
 * could be swapped in without touching any ViewModel or View code.
 */
class LevelLoader {
  private levels: LevelDefinition[];

  constructor(source: LevelDefinition[]) {
    this.levels = source.map((lvl) => this.normalize(lvl));
  }

  private normalize(level: LevelDefinition): LevelDefinition {
    return {
      id: level.id,
      letters: level.letters.map((l) => l.toUpperCase()),
      words: Array.from(new Set(level.words.map((w) => w.toUpperCase()))).sort(
        (a, b) => b.length - a.length
      ),
    };
  }

  getAll(): LevelDefinition[] {
    return this.levels;
  }

  getById(id: number): LevelDefinition | undefined {
    return this.levels.find((l) => l.id === id);
  }

  count(): number {
    return this.levels.length;
  }
}

export const levelLoader = new LevelLoader(rawLevels as LevelDefinition[]);
