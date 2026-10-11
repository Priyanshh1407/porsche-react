import { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import useSignatureSection from './useSignatureSection';
import { prefersReducedMotion } from './motion';

// Taycan signature ("electric"): in the Energy section, electric-blue shockwave rings run out across
// the floor from under the car, a blue under-glow beats with them and the car's own light strips
// (its 'emiss' material) brighten in time. Distinct from the spinning charge-port hologram in the
// Charging section. Additive only: rings and a light of its own, plus a reversible emissive pulse.
const MODEL = '/2025_porsche_taycan_turbo_gt_weissach_package.glb';
const BEAT = 1.6; // seconds per pulse

/** Builds the pulse from the scene objects it animates; returns start/stop/restore. */
export function createEnergyPulse({ rings, light, lightMaterials, reduced = false }) {
    const original = lightMaterials.map((m) => ({ m, intensity: m.emissiveIntensity }));
    let loop = null;
    const stop = (instant = false) => {
        frozen = false;
        if (loop) { loop.kill(); loop = null; }
        const d = instant ? 0 : 0.8;
        gsap.to(rings.map((r) => r.material), { opacity: 0, duration: d, overwrite: 'auto' });
        gsap.to(light, { intensity: 0, duration: d, overwrite: 'auto' });
        original.forEach(({ m, intensity }) => gsap.to(m, { emissiveIntensity: intensity, duration: d, overwrite: 'auto' }));
    };
    let frozen = false;
    const start = () => {
        if (reduced) {
            // Reduced motion: one still frame of the pulse, three rings spreading out.
            frozen = true;
            rings.forEach((ring, i) => {
                gsap.set(ring.scale, { x: 1.2 + i, y: 1.2 + i, z: 1.2 + i });
                gsap.set(ring.material, { opacity: 0.7 - i * 0.22 });
            });
            gsap.set(light, { intensity: 8 });
            original.forEach(({ m, intensity }) => gsap.set(m, { emissiveIntensity: intensity * 1.4 }));
            return;
        }
        if (loop) return;
        loop = gsap.timeline({ repeat: -1 });
        rings.forEach((ring, i) => {
            const at = (i * BEAT) / rings.length;
            loop.fromTo(ring.scale, { x: 0.3, y: 0.3, z: 0.3 }, { x: 4, y: 4, z: 4, duration: BEAT, ease: 'power1.out' }, at);
            loop.fromTo(ring.material, { opacity: 0.85 }, { opacity: 0, duration: BEAT, ease: 'power1.in' }, at);
        });
        loop.fromTo(light, { intensity: 2 }, { intensity: 14, duration: BEAT / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
        original.forEach(({ m, intensity }) => loop.fromTo(m, { emissiveIntensity: intensity },
            { emissiveIntensity: intensity * 1.8, duration: BEAT / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0));
    };
    const restore = () => {
        stop(true);
        gsap.killTweensOf([light, ...rings.map((r) => r.material), ...lightMaterials]);
        rings.forEach((r) => { r.material.opacity = 0; });
        light.intensity = 0;
        original.forEach(({ m, intensity }) => { m.emissiveIntensity = intensity; });
    };
    return { start, stop: () => stop(false), restore, isRunning: () => loop !== null || frozen };
}

/** The Taycan's light-strip materials (named 'emiss' in the model). */
export function findLightMaterials(scene) {
    const found = new Set();
    scene.traverse((child) => { if (child.isMesh && child.material && child.material.name === 'emiss') found.add(child.material); });
    return [...found];
}

export default function TaycanEnergyPulse({ position = [0, -1.5, 0] }) {
    const { scene } = useGLTF(MODEL);
    const ringRefs = [useRef(), useRef(), useRef()];
    const lightRef = useRef();
    const pulse = useRef(null);

    useLayoutEffect(() => {
        pulse.current = createEnergyPulse({
            rings: ringRefs.map((r) => r.current),
            light: lightRef.current,
            lightMaterials: findLightMaterials(scene),
            reduced: prefersReducedMotion(),
        });
        return () => pulse.current.restore();
    }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable

    useSignatureSection('#section-energy', {
        onIn: () => pulse.current && pulse.current.start(),
        onOut: () => pulse.current && pulse.current.stop(),
    });

    return (
        <group position={position}>
            {ringRefs.map((ref, i) => (
                <mesh key={i} ref={ref} rotation-x={-Math.PI / 2} scale={0.3}>
                    <ringGeometry args={[0.92, 1, 96]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0} depthWrite={false} toneMapped={false} />
                </mesh>
            ))}
            <pointLight ref={lightRef} position={[0, 0.3, 0]} color="#38bdf8" intensity={0} distance={8} />
        </group>
    );
}
