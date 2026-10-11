// Turbo S signature: lamp glows land at both ends of a full-width lamp mesh, and night mode restores
// the renderer and every light exactly.
import { Box3, Vector3 } from 'three';
import { lampPoints, createNightMode, findTurboLights } from './TurboNightMode';

test('places one glow at each end of a lamp mesh that spans the car width', () => {
    // 160 wide (z), lamps 17 across (y): the two headlights sit 71.5 either side of the centre.
    const box = new Box3(new Vector3(-6, -8, -80), new Vector3(7, 9, 80));
    const { points, lamp } = lampPoints(box, 2);
    expect(lamp).toBe(17);
    expect(points.map((p) => p.z)).toEqual([-71.5, 71.5]);
    expect(points.every((p) => p.x === 0.5 && p.y === 0.5)).toBe(true);
});

test('finds the headlight and tail-light materials by name, once each', () => {
    const head = { name: 'lights' };
    const tail = { name: 'red_light_main' };
    const scene = { traverse: (fn) => [{ isMesh: true, material: head }, { isMesh: true, material: head }, { isMesh: true, material: tail }, { isMesh: true, material: { name: 'paint' } }].forEach(fn) };
    expect(findTurboLights(scene)).toEqual({ head: [head], tail: [tail] });
});

test('night then restore() puts the renderer and every light back exactly', () => {
    const gl = { toneMappingExposure: 1 };
    const head = [{ emissiveIntensity: 1.5 }];
    const tail = [{ emissiveIntensity: 2 }];
    const moon = { intensity: 0 };
    const beam = { intensity: 0 };
    const glows = [{ opacity: 0 }];
    const mode = createNightMode({ gl, head, tail, moon, beam, glows });

    mode.nightIn();
    gl.toneMappingExposure = 0.22; head[0].emissiveIntensity = 40; moon.intensity = 2.4; glows[0].opacity = 0.95;
    mode.restore();
    expect(gl.toneMappingExposure).toBe(1);
    expect(head[0].emissiveIntensity).toBe(1.5);
    expect(tail[0].emissiveIntensity).toBe(2);
    expect(moon.intensity).toBe(0);
    expect(beam.intensity).toBe(0);
    expect(glows[0].opacity).toBe(0);
});
