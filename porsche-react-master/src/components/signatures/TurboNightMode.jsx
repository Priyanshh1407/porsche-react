import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { AdditiveBlending, CanvasTexture, Sprite, SpriteMaterial, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import useSignatureSection from './useSignatureSection';

// 911 Turbo S signature ("dual personality"): in the Night Mode section evening falls (the scene's
// exposure drops), the car's own headlight and tail-light materials come up to full brightness and a
// cool moonlight rakes across the body. The lamp meshes span the full car width (both headlights in
// one mesh), so a soft additive glow is attached at each lamp position; glows move with the car and
// are depth-tested. Self-contained: everything is restored on leaving, in both
// directions, so the sections around it keep their lighting.
const MODEL = '/porsche_911_turbo_s.glb';
const HEADLIGHTS = ['lights', 'headlights_pattern', 'hedlights_grid'];
const TAILLIGHTS = ['red_light_main'];
const NIGHT_EXPOSURE = 0.22;

export function findTurboLights(scene) {
    const head = new Set();
    const tail = new Set();
    scene.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        if (HEADLIGHTS.includes(child.material.name)) head.add(child.material);
        if (TAILLIGHTS.includes(child.material.name)) tail.add(child.material);
    });
    return { head: [...head], tail: [...tail] };
}

/**
 * Where to put glows on a lamp mesh spanning the car's width: `count` points spread along its longest
 * axis, inset by the lamp size (the second-longest axis). Pure: takes the geometry's bounding box.
 */
export function lampPoints(box, count) {
    const size = new Vector3().subVectors(box.max, box.min);
    const center = new Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);
    const axes = ['x', 'y', 'z'].sort((a, b) => size[b] - size[a]);
    const [long, mid] = axes;
    const lamp = size[mid];
    const half = Math.max(0, (size[long] - lamp) / 2);
    const points = [];
    for (let i = 0; i < count; i++) {
        const p = center.clone();
        p[long] += count === 1 ? 0 : -half + (2 * half * i) / (count - 1);
        points.push(p);
    }
    return { points, lamp };
}

function glowTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
}

/** Attaches glow sprites to the two headlights (the section faces the front, so no tail glow); returns their materials and a detach(). */
export function attachLampGlows(scene) {
    const map = glowTexture();
    const sprites = [];
    const add = (mesh, count, color, sizeFactor) => {
        mesh.geometry.computeBoundingBox();
        const { points, lamp } = lampPoints(mesh.geometry.boundingBox, count);
        points.forEach((p) => {
            // No depth test: the glow sits inside the lamp housing, behind its lens. Only visible during the
            // night, in a pose where the headlights face the camera.
            const sprite = new Sprite(new SpriteMaterial({ map, color, blending: AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, opacity: 0 }));
            sprite.renderOrder = 10;
            sprite.position.copy(p);
            sprite.scale.setScalar(lamp * sizeFactor);
            mesh.add(sprite);
            sprites.push(sprite);
        });
    };
    scene.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        if (child.material.name === 'headlights_plastic_ring') {
            add(child, 2, '#ffffff', 1.6); // hot core
            add(child, 2, '#cfe0ff', 4.5); // soft halo
        }
    });
    return {
        materials: sprites.map((sp) => sp.material),
        detach: () => sprites.forEach((sp) => { sp.removeFromParent(); sp.material.dispose(); }),
    };
}

/** Night in / day out for a renderer, light materials and a moonlight; restore() is exact. */
export function createNightMode({ gl, head, tail, moon, beam = null, glows = [] }) {
    const day = {
        exposure: gl.toneMappingExposure,
        head: head.map((m) => m.emissiveIntensity),
        tail: tail.map((m) => m.emissiveIntensity),
    };
    const targets = [gl, ...head, ...tail, moon, ...glows, ...(beam ? [beam] : [])];
    const to = (night, duration) => {
        gsap.to(gl, { toneMappingExposure: night ? NIGHT_EXPOSURE : day.exposure, duration, ease: 'power2.inOut', overwrite: 'auto' });
        head.forEach((m, i) => gsap.to(m, { emissiveIntensity: night ? 40 : day.head[i], duration, ease: 'power2.inOut', overwrite: 'auto' }));
        tail.forEach((m, i) => gsap.to(m, { emissiveIntensity: night ? 25 : day.tail[i], duration, ease: 'power2.inOut', overwrite: 'auto' }));
        gsap.to(moon, { intensity: night ? 2.4 : 0, duration, ease: 'power2.inOut', overwrite: 'auto' });
        if (beam) gsap.to(beam, { intensity: night ? 60 : 0, duration, ease: 'power2.inOut', overwrite: 'auto' });
        if (glows.length) gsap.to(glows, { opacity: night ? 0.95 : 0, duration, ease: 'power2.inOut', overwrite: 'auto' });
    };
    return {
        nightIn: () => to(true, 1.8),
        dayOut: () => to(false, 1.4),
        restore: () => {
            gsap.killTweensOf(targets);
            gl.toneMappingExposure = day.exposure;
            head.forEach((m, i) => { m.emissiveIntensity = day.head[i]; });
            tail.forEach((m, i) => { m.emissiveIntensity = day.tail[i]; });
            moon.intensity = 0;
            if (beam) beam.intensity = 0;
            glows.forEach((m) => { m.opacity = 0; });
        },
    };
}

export default function TurboNightMode() {
    const { scene } = useGLTF(MODEL);
    const gl = useThree((s) => s.gl);
    const moonRef = useRef();
    const beamRef = useRef();
    const lights = useMemo(() => findTurboLights(scene), [scene]);
    const mode = useRef(null);

    useLayoutEffect(() => {
        const glows = attachLampGlows(scene);
        mode.current = createNightMode({ gl, head: lights.head, tail: lights.tail, moon: moonRef.current, beam: beamRef.current, glows: glows.materials });
        return () => { mode.current.restore(); glows.detach(); };
    }, [gl, lights, scene]);

    useSignatureSection('#section-nightmode', {
        onIn: () => mode.current && mode.current.nightIn(),
        onOut: () => mode.current && mode.current.dayOut(),
    });

    return (
        <>
            <directionalLight ref={moonRef} position={[-6, 5, -4]} color="#9db7ff" intensity={0} />
            {/* Headlight pool on the ground in front of the car, in this section's pose. */}
            <pointLight ref={beamRef} position={[0.6, -1.2, 0.8]} color="#eaf2ff" intensity={0} distance={7} decay={2} />
        </>
    );
}
