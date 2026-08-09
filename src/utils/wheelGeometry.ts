export interface WheelPoint {
  x: number;
  y: number;
}

/**
 * Returns the center point of each letter node arranged evenly around a circle,
 * starting at the top (12 o'clock) and going clockwise.
 */
export function computeWheelPositions(count: number, radius: number, center: WheelPoint): WheelPoint[] {
  const positions: WheelPoint[] = [];
  const angleStep = (2 * Math.PI) / count;
  const startAngle = -Math.PI / 2; // top

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep;
    positions.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return positions;
}

export function distance(a: WheelPoint, b: WheelPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Returns the index of the letter node under `point`, or -1 if none is within `hitRadius`. */
export function hitTest(point: WheelPoint, nodes: WheelPoint[], hitRadius: number): number {
  let closestIndex = -1;
  let closestDistance = hitRadius;

  for (let i = 0; i < nodes.length; i++) {
    const d = distance(point, nodes[i]);
    if (d <= closestDistance) {
      closestDistance = d;
      closestIndex = i;
    }
  }
  return closestIndex;
}
