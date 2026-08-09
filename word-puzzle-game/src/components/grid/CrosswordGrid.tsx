import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { CrosswordLayout } from '@/models/types';
import { GridCell } from './GridCell';
import { spacing } from '@/theme/typography';

interface Props {
  layout: CrosswordLayout;
  foundWords: Set<string>;
}

export function CrosswordGrid({ layout, foundWords }: Props) {
  const { width } = useWindowDimensions();
  const maxGridWidth = width - spacing.lg * 2;
  const cellSize = layout.cols > 0 ? Math.min(48, Math.floor(maxGridWidth / layout.cols)) : 0;

  if (layout.rows === 0) return null;

  return (
    <View style={styles.wrapper}>
      {layout.cells.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((cell, cIdx) => {
            const isBlock = cell.wordIds.length === 0;
            // A cell is revealed once every word crossing it has been found.
            const isRevealed = !isBlock && cell.wordIds.every((w) => foundWords.has(w));
            return (
              <GridCell
                key={cIdx}
                letter={cell.letter}
                isBlock={isBlock}
                isRevealed={isRevealed}
                size={cellSize}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
