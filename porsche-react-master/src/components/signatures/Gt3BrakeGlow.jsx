import { useLayoutEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Color } from 'three';
import gsap from 'gsap';
import useSignatureSection from './useSignatureSection';

// GT3 RS signature ("track"): in the Track Heat section the brake discs glow hot, then cool down
// when you scroll on. Only the discs' own materials (disc_*, used by nothing else in the model) are
// touched; the car itself never moves for this effect.
const MODEL = '/2024_manthey_racing_porsche_911_gt3_rs.glb';
const HOT = '#ff3a00';
const MAX_INTENSITY = 3;

/** The disc materials of the GT3 RS model (each used only by the brake discs). */
export function findDiscMaterials(scene) {
    const materials = new Set();
    scene.traverse((child) => {
        if (child.isMesh && child.material && /^disc_/i.test(child.material.name || '')) materials.add(child.material);
    });
    return [...materials];
}

/** Heat up / cool down a set of materials, and restore exactly what they were. */
export function createBrakeHeat(materials) {
    const original = materials.map((m) => ({ m, emissive: m.emissive.clone(), intensity: m.emissiveIntensity }));
    const hot = new Color(HOT);
    const state = { heat: 0 };
    const render = () => original.forEach(({ m, emissive, intensity }) => {
        m.emissive.copy(emissive).lerp(hot, state.heat);
        m.emissiveIntensity = intensity + (MAX_INTENSITY - intensity) * state.heat;
    });
    return {
        state,
        heatUp: () => gsap.to(state, { heat: 1, duration: 1.8, ease: 'power2.in', overwrite: 'auto', onUpdate: render }),
        coolDown: () => gsap.to(state, { heat: 0, duration: 1.4, ease: 'power2.out', overwrite: 'auto', onUpdate: render }),
        restore: () => {
            gsap.killTweensOf(state);
            original.forEach(({ m, emissive, intensity }) => { m.emissive.copy(emissive); m.emissiveIntensity = intensity; });
        },
    };
}

export default function Gt3BrakeGlow() {
    const { scene } = useGLTF(MODEL);
    const heat = useMemo(() => createBrakeHeat(findDiscMaterials(scene)), [scene]);
    useLayoutEffect(() => () => heat.restore(), [heat]);
    useSignatureSection('#section-trackheat', { onIn: heat.heatUp, onOut: heat.coolDown });
    return null;
}
