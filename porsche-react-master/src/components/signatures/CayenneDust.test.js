// Cayenne signature: the dust cloud is deterministic, hugs the ground, rises, drifts back and recycles.
import { seedDust, stepDust } from './CayenneDust';

test('seeding is deterministic and starts low (most haze near the ground)', () => {
    const a = seedDust(200, 7);
    const b = seedDust(200, 7);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    const heights = Array.from({ length: 200 }, (_, i) => a.positions[i * 3 + 1]);
    expect(Math.max(...heights)).toBeLessThanOrEqual(0.9);
    expect(heights.filter((h) => h < 0.3).length).toBeGreaterThan(100); // biased low
});

test('a step makes dust rise and drift back; dust above the cloud re-enters at the ground', () => {
    const positions = new Float32Array([0, 0.5, 0, 0, 0.99, 0]);
    const speeds = new Float32Array([0.5, 0.5]);
    stepDust(positions, speeds, 0.05);
    expect(positions[1]).toBeCloseTo(0.525);   // rose
    expect(positions[0]).toBeLessThan(0);      // drifted back
    expect(positions[4]).toBe(0);              // passed the top (1.0): back at the ground
});
