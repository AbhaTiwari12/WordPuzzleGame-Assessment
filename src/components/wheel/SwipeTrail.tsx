import React from 'react';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { WheelPoint } from '@/utils/wheelGeometry';
import { colors } from '@/theme/colors';

interface Props {
  size: number;
  points: WheelPoint[];
  /** Live finger position, drawn as the leading edge of the trail. */
  livePoint: WheelPoint | null;
}

export function SwipeTrail({ size, points, livePoint }: Props) {
  if (points.length === 0) return null;

  const allPoints = livePoint ? [...points, livePoint] : points;
  const polylinePoints = allPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, top: 0 }}
      width={size}
      height={size}
    >
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={colors.trailLine}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={5} fill={colors.trailLine} opacity={0.9} />
      ))}
    </Svg>
  );
}
