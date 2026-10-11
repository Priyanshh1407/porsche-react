// Taycan signature: the pulse starts/stops cleanly and restores everything it touched.
import { createEnergyPulse, findLightMaterials } from './TaycanEnergyPulse';

const ring = () => ({ scale: { x: 0.3, y: 0.3, z: 0.3 }, material: { opacity: 0 } });

test('finds only the light-strip material (emiss), once', () => {
    const emiss = { name: 'emiss', emissiveIntensity: 5 };
    const body = { name: 'paint', emissiveIntensity: 0 };
    const scene = { traverse: (fn) => [{ isMesh: true, material: emiss }, { isMesh: true, material: emiss }, { isMesh: true, material: body }].forEach(fn) };
    expect(findLightMaterials(scene)).toEqual([emiss]);
});

test('start/stop toggle the pulse, and restore() puts back exactly what was there', () => {
    const rings = [ring(), ring(), ring()];
    const light = { intensity: 0 };
    const strip = { emissiveIntensity: 5 };
    const pulse = createEnergyPulse({ rings, light, lightMaterials: [strip] });

    pulse.start();
    expect(pulse.isRunning()).toBe(true);
    pulse.start(); // idempotent
    expect(pulse.isRunning()).toBe(true);
    pulse.stop();
    expect(pulse.isRunning()).toBe(false);

    pulse.start();
    light.intensity = 9; strip.emissiveIntensity = 9; rings[0].material.opacity = 0.6;
    pulse.restore();
    expect(pulse.isRunning()).toBe(false);
    expect(light.intensity).toBe(0);
    expect(strip.emissiveIntensity).toBe(5);
    expect(rings.every((r) => r.material.opacity === 0)).toBe(true);
});
