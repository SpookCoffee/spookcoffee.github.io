/** Small math helpers that do not need Three.js (easy to unit test). */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const smooth = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
export const distance2D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function segmentDistance(point, a, b) {
  const dx = b.x - a.x; const dz = b.z - a.z;
  const length2 = dx * dx + dz * dz;
  const t = length2 ? clamp(((point.x - a.x) * dx + (point.z - a.z) * dz) / length2, 0, 1) : 0;
  return Math.hypot(point.x - (a.x + dx * t), point.z - (a.z + dz * t));
}
export function distanceToPath(point, points) {
  let distance = Infinity;
  for (let i = 1; i < points.length; i++) distance = Math.min(distance, segmentDistance(point, points[i-1], points[i]));
  return distance;
}
