import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface Props {
  letter: string;
  x: number;
  y: number;
  size: number;
  active: boolean;
}

export const LetterNode = React.memo(function LetterNode({ letter, x, y, size, active }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.18 : 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.node,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x - size / 2,
          top: y - size / 2,
          backgroundColor: active ? colors.letterActive : colors.letterIdle,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={[typography.wheelLetter, { color: active ? colors.letterActiveText : colors.letterIdleText }]}>
        {letter}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
