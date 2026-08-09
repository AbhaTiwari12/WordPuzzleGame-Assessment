import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface Props {
  letter: string;
  isBlock: boolean;
  isRevealed: boolean;
  size: number;
}

export const GridCell = React.memo(function GridCell({ letter, isBlock, isRevealed, size }: Props) {
  const scale = useRef(new Animated.Value(isRevealed ? 1 : 0.8)).current;
  const wasRevealed = useRef(isRevealed);

  useEffect(() => {
    if (isRevealed && !wasRevealed.current) {
      wasRevealed.current = true;
      scale.setValue(0.4);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [isRevealed, scale]);

  if (isBlock) {
    return <View style={{ width: size, height: size }} />;
  }

  return (
    <View style={[styles.cell, { width: size, height: size }]}>
      {isRevealed ? (
        <Animated.View style={[styles.filled, { transform: [{ scale }] }]}>
          <Text style={[typography.gridLetter, { color: colors.gridCellFilledText }]}>{letter}</Text>
        </Animated.View>
      ) : (
        <View style={styles.empty} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cell: {
    padding: 2,
  },
  empty: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.gridCellEmpty,
    borderWidth: 1,
    borderColor: colors.gridBorder,
  },
  filled: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.gridCellFilled,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
