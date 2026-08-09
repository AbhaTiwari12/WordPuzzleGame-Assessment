import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { LetterNode } from './LetterNode';
import { SwipeTrail } from './SwipeTrail';
import { computeWheelPositions, hitTest, WheelPoint } from '@/utils/wheelGeometry';
import { colors } from '@/theme/colors';

interface Props {
  letters: string[];
  size?: number;
  onWordSubmit: (pathIndices: number[]) => void;
}

const NODE_SIZE = 56;
const HIT_RADIUS = 40;

export function LetterWheel({ letters, size = 260, onWordSubmit }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [livePoint, setLivePoint] = useState<WheelPoint | null>(null);

  const center = useMemo<WheelPoint>(() => ({ x: size / 2, y: size / 2 }), [size]);
  const radius = size / 2 - NODE_SIZE / 2 - 6;
  const positions = useMemo(() => computeWheelPositions(letters.length, radius, center), [letters.length, radius, center]);

  const addPoint = useCallback((point: WheelPoint) => {
    setLivePoint(point);
    const idx = hitTest(point, positions, HIT_RADIUS);
    if (idx === -1) return;
    setSelected((prev) => {
      if (prev[prev.length - 1] === idx) return prev;
      if (prev.includes(idx)) return prev; // no revisiting a letter in one swipe
      return [...prev, idx];
    });
  }, [positions]);

  const finish = useCallback(() => {
    setSelected((prev) => {
      if (prev.length > 0) onWordSubmit(prev);
      return [];
    });
    setLivePoint(null);
  }, [onWordSubmit]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          runOnJS(addPoint)({ x: e.x, y: e.y });
        })
        .onUpdate((e) => {
          runOnJS(addPoint)({ x: e.x, y: e.y });
        })
        .onEnd(() => {
          runOnJS(finish)();
        })
        .onFinalize(() => {
          runOnJS(finish)();
        }),
    [addPoint, finish]
  );

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.wheel, { width: size, height: size, borderRadius: size / 2 }]}>
        <SwipeTrail size={size} points={selected.map((i) => positions[i])} livePoint={livePoint} />
        {letters.map((letter, i) => (
          <LetterNode
            key={i}
            letter={letter}
            x={positions[i].x}
            y={positions[i].y}
            size={NODE_SIZE}
            active={selected.includes(i)}
          />
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wheel: {
    backgroundColor: colors.wheelBackground,
    alignSelf: 'center',
  },
});
