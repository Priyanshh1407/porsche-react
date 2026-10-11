import { useLayoutEffect, useMemo, useRef } from 'react';
import { CanvasTexture } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import useSignatureSection from './useSignatureSection';
import { prefersReducedMotion } from './motion';

// Cayenne signature ("terrain"): in the Terrain section, warm sandy dust rises from the ground around
// the car and drifts back, as after leaving a gravel track. Its own particles only: the ambient
// sparkles and the car are not touched. Particles fade in/out with the section.
const COUNT = 520;

/** Seeded positions in an ellipse around the car's footprint; deterministic for a given seed. */
export function seedDust(count = COUNT, seed = 7) {
    let s = seed;
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2;
        const radius = 1.0 + rand() * 2.4;
        // Wider along the car and biased behind it (the car faces left in this pose).
        positions[i * 3] = Math.cos(angle) * radius * 1.5 + 0.8;
        positions[i * 3 + 1] = rand() * rand() * 0.9; // most of the haze hugs the ground
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        speeds[i] = 0.15 + rand() * 0.35;
    }
    return { positions, speeds };
}

/** One animation step: rise and drift back; particles above the cloud re-enter at the ground. */
export function stepDust(positions, speeds, dt) {
    for (let i = 0; i < speeds.length; i++) {
        positions[i * 3 + 1] += speeds[i] * dt;
        positions[i * 3] -= speeds[i] * 0.6 * dt;
        if (positions[i * 3 + 1] > 1.0) {
            positions[i * 3 + 1] = 0;
            positions[i * 3] += speeds[i] * 2.4; // re-enter near where it drifted from
        }
    }
}

/** A soft round puff (radial gradient), drawn at runtime: no image download. */
function puffTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
}

export default function CayenneDust({ position = [0, -1.4, 0] }) {
    const texture = useMemo(puffTexture, []);
    const pointsRef = useRef();
    const materialRef = useRef();
    const active = useRef(false);
    const { positions, speeds } = useMemo(() => seedDust(), []);
    const still = useMemo(prefersReducedMotion, []);

    useFrame((_, dt) => {
        if (still) return; // reduced motion: the haze stays where it is
        if (!active.current && (!materialRef.current || materialRef.current.opacity === 0)) return; // idle: no work
        stepDust(positions, speeds, Math.min(dt, 0.05));
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    useLayoutEffect(() => () => { if (materialRef.current) gsap.killTweensOf(materialRef.current); }, []);

    useSignatureSection('#section-terrain', {
        onIn: () => { active.current = true; gsap.to(materialRef.current, { opacity: 0.3, duration: 1.6, ease: 'power2.out', overwrite: 'auto' }); },
        onOut: () => { active.current = false; gsap.to(materialRef.current, { opacity: 0, duration: 1.2, ease: 'power2.in', overwrite: 'auto' }); },
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial ref={materialRef} color="#d9a066" size={0.9} map={texture} alphaTest={0.01} sizeAttenuation transparent opacity={0} depthWrite={false} />
        </points>
    );
}
