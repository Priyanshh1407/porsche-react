import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGLTF, Environment, Html, useProgress, Center, ContactShadows, Sparkles } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

useGLTF.preload('/2022_porsche_cayenne_turbo_gt.glb');

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{
                color: '#2dd4bf',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.4em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textShadow: '0 0 10px rgba(45, 212, 191, 0.5)'
            }}>
                LOADING {Math.round(progress)}%
            </div>
        </Html>
    );
}

const SceneChoreography = () => {
    const { scene } = useGLTF('/2022_porsche_cayenne_turbo_gt.glb');
    const { camera } = useThree();
    const groupRef = useRef();
    const ambientLightRef = useRef();
    const dirLightMainRef = useRef();
    const dirLightSubRef = useRef();
    const headlightLeftRef = useRef();
    const headlightRightRef = useRef();
    const glowLeftRef = useRef();
    const glowRightRef = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - Pitch black, car lowered so text doesn't overlap
        ambientLightRef.current.intensity = 0;
        dirLightMainRef.current.intensity = 0;
        dirLightSubRef.current.intensity = 0;
        headlightLeftRef.current.intensity = 0;
        headlightRightRef.current.intensity = 0;
        if (glowLeftRef.current) glowLeftRef.current.intensity = 0;
        if (glowRightRef.current) glowRightRef.current.intensity = 0;

        // Fix materials transparency bug only
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.transparent && child.material.opacity > 0.99) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                }
                // Lower reflections so paint color is more visible
                child.material.envMapIntensity = 0.15;
            }
        });

        groupRef.current.rotation.set(0.08, Math.PI * 0.12, 0);
        groupRef.current.position.set(0, -1.5, 0);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#scroll-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
            }
        });

        // Helper function for discrete animations
        const animateTo = (pos, rot, duration = 2.5) => {
            gsap.to(groupRef.current.position, {
                x: pos[0], y: pos[1], z: pos[2],
                duration,
                ease: 'power3.inOut',
                overwrite: 'auto'
            });
            gsap.to(groupRef.current.rotation, {
                x: rot[0], y: rot[1], z: rot[2],
                duration,
                ease: 'power3.inOut',
                overwrite: 'auto'
            });
        };

        const scroller = '#scroll-container';
        const startTrigger = 'top 50%';

        // ==========================================
        // STAGE 0: HERO (Car on the left, facing right)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-hero',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([-3.8, -0.2, 0], [0.08, Math.PI * 0.2, 0]); // Car shifted left
                gsap.to(headlightLeftRef.current, { intensity: 50, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(headlightRightRef.current, { intensity: 50, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                if (glowLeftRef.current) gsap.to(glowLeftRef.current, { intensity: 2, duration: 0.2, overwrite: 'auto' });
                if (glowRightRef.current) gsap.to(glowRightRef.current, { intensity: 2, duration: 0.2, overwrite: 'auto' });
                gsap.to(ambientLightRef.current, { intensity: 1.0, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightMainRef.current, { intensity: 1.5, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightSubRef.current, { intensity: 1.0, duration: 2, delay: 0.2, overwrite: 'auto' });
            },
            onEnterBack: () => {
                animateTo([-3.8, -0.2, 0], [0.08, Math.PI * 0.2, 0]);
            }
        });

        // ==========================================
        // STAGE 1: POWERTRAIN (Straight Front View)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-powertrain',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-1.3, 0.0, 3.5], [0.1, 0, 0]),
            onEnterBack: () => animateTo([-1.3, 0.0, 3.5], [0.1, 0, 0])
        });

        // ==========================================
        // STAGE 2: COCKPIT (Zoom into dashboard)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cockpit',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([-0.25, 0.5, 10.3], [-0.1, Math.PI * 1.03, 0]);
            },
            onEnterBack: () => {
                animateTo([-0.25, 0.5, 10.3], [-0.1, Math.PI * 1.03, 0]);
            }
        });

        // ==========================================
        // STAGE 3: EXHAUST (Rear 3/4 View)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-radiator',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.0, 0.5, 1.5], [0.05, Math.PI * 1.05, 0]), // Show the rear titanium exhaust
            onEnterBack: () => animateTo([-2.0, 0.5, 1.5], [0.05, Math.PI * 1.05, 0])
        });

        // ==========================================
        // STAGE 4: BRAKES (Zoom to front wheels)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-brakes',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([4.0, 1.35, 8], [0.05, Math.PI * 0.35, 0]), // Car on right, showing wheel
            onEnterBack: () => animateTo([4.0, 1.35, 8], [0.05, Math.PI * 0.35, 0])
        });

        // ==========================================
        // STAGE 5: FAMILY & SPORT (Wide Side Profile)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-family',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([2.5, -0.3, -2], [0.05, Math.PI * 0.25, 0]), // Show full side profile, car on right
            onEnterBack: () => animateTo([2.5, -0.3, -2], [0.05, Math.PI * 0.25, 0])
        });

        // ==========================================
        // STAGE 6: STATS (Car lower to avoid huge text)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-stats',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([0, -0.8, 1], [0.08, Math.PI * 0.5, 0]),
            onEnterBack: () => animateTo([0, -0.8, 0], [0.08, Math.PI * 1.75, 0])
        });

        // ==========================================
        // STAGE 7: SPECS (Rotate to show profile for side specs)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-specs',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 0.8, 0]),
            onEnterBack: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 0.8, 0])
        });

        // ==========================================
        // STAGE 8: CTA (Heroic Front Angle - lowered to prevent overlap)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cta',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 0.3, 0]),
            onEnterBack: () => animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 0.3, 0])
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={0} color="#fff8f0" />
            <directionalLight ref={dirLightMainRef} position={[5, 8, 3]} intensity={0} color="#fff0e0" />
            <directionalLight ref={dirLightSubRef} position={[-5, 5, -3]} intensity={0} color="#fff0e0" />

            <Environment preset="sunset" />

            <Sparkles
                count={300}
                scale={20}
                size={3}
                speed={0.2}
                opacity={0.15}
                color="#fbbf24"
                position={[0, 0, 0]}
            />

            <group ref={groupRef} dispose={null}>
                {/* Internal Glow for Headlights */}
                <pointLight ref={glowLeftRef} position={[-0.9, -0.4, 2.2]} intensity={0} color="#e0f2fe" distance={1.5} />
                <pointLight ref={glowRightRef} position={[0.9, -0.4, 2.2]} intensity={0} color="#e0f2fe" distance={1.5} />

                {/* Projected Headlights shining forward */}
                <spotLight ref={headlightLeftRef} position={[-0.9, -0.4, 2.3]} angle={0.6} penumbra={0.5} intensity={0} color="#e0f2fe" distance={40}>
                    <object3D position={[-0.9, -0.6, 10]} attach="target" />
                </spotLight>
                <spotLight ref={headlightRightRef} position={[0.9, -0.4, 2.3]} angle={0.6} penumbra={0.5} intensity={0} color="#e0f2fe" distance={40}>
                    <object3D position={[0.9, -0.6, 10]} attach="target" />
                </spotLight>

                <Center>
                    <primitive object={scene} scale={200} position={[0, -2, 0]} />
                </Center>
            </group>

            <ContactShadows
                position={[0, -2.8, 0]}
                opacity={0.5}
                scale={30}
                blur={2}
                far={6}
                color="#000000"
            />
        </>
    );
};

export default function CayenneViewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 1.5, 12], fov: 38 }} dpr={[1, 2]}>
                <React.Suspense fallback={<Loader />}>
                    <SceneChoreography />
                </React.Suspense>

                <EffectComposer>
                    <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} height={300} intensity={0.8} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
