// GT3 RS signature: only the brake-disc materials glow, and everything is restored afterwards.
import { Color } from 'three';
import { findDiscMaterials, createBrakeHeat } from './Gt3BrakeGlow';

const material = (name) => ({ name, emissive: new Color('#000000'), emissiveIntensity: 1 });
const sceneWith = (meshes) => ({ traverse: (fn) => meshes.forEach(fn) });

test('finds only the disc materials (once each), never other parts', () => {
    const disc = material('disc_ma.001');
    const discS = material('disc_s.001');
    const caliper = material('caliper_main.001');
    const scene = sceneWith([
        { isMesh: true, material: disc }, { isMesh: true, material: disc }, // shared by two discs
        { isMesh: true, material: discS }, { isMesh: true, material: caliper }, { isMesh: false, material: material('disc_x') },
    ]);
    expect(findDiscMaterials(scene)).toEqual([disc, discS]);
});

test('heats to the hot colour, cools back, and restore() puts back exactly what was there', () => {
    const disc = material('disc_ma.001');
    disc.emissive.set('#101010');
    const heat = createBrakeHeat([disc]);

    heat.heatUp().progress(1);
    expect(disc.emissive.getHexString()).toBe('ff3a00');
    expect(disc.emissiveIntensity).toBe(3);

    heat.coolDown().progress(1);
    expect(disc.emissive.getHexString()).toBe('101010');
    expect(disc.emissiveIntensity).toBe(1);

    heat.heatUp().progress(0.5);
    heat.restore();
    expect(disc.emissive.getHexString()).toBe('101010');
    expect(disc.emissiveIntensity).toBe(1);
});
