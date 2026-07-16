import React, { useRef, useLayoutEffect } from 'react';
import { useGLTF, Environment, Html, useProgress, Center, ContactShadows } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

useGLTF.preload('/porsche_911_turbo_s.glb');

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
    const { scene } = useGLTF('/porsche_911_turbo_s.glb');
    const { camera } = useThree();
    const groupRef = useRef();
    const ambientLightRef = useRef();
    const dirLight1Ref = useRef();
    const dirLight2Ref = useRef();
    const dirLight3Ref = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - Pitch black, car lowered so text doesn't overlap
        ambientLightRef.current.intensity = 0;

        // Fix materials transparency bug only
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.transparent && child.material.opacity > 0.99) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                }
                // Lower reflections so paint color is more visible
                child.material.envMapIntensity = 0.15;

                // Turn on DRLs (Daytime Running Lights) - Pure White
                if (['lights', 'headlights_pattern', 'hedlights_grid'].includes(child.material.name)) {
                    child.material.emissive = new THREE.Color('#ffffff');
                    child.material.emissiveIntensity = 1.5;
                    child.material.toneMapped = true;
                }
                // Turn on taillights
                if (child.material.name === 'red_light_main') {
                    child.material.emissive = new THREE.Color('#ff0000');
                    child.material.emissiveIntensity = 2.0;
                    child.material.toneMapped = true;
                }
            }
        });

        groupRef.current.rotation.set(0.08, Math.PI * 1.3, 0);
        groupRef.current.position.set(-2.5, -0.4, 0.5);

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

        const animateLights = (amb, d1, d2, d3, duration = 1.5) => {
            if (ambientLightRef.current) gsap.to(ambientLightRef.current, { intensity: amb, duration, overwrite: 'auto' });
            if (dirLight1Ref.current) gsap.to(dirLight1Ref.current, { intensity: d1, duration, overwrite: 'auto' });
            if (dirLight2Ref.current) gsap.to(dirLight2Ref.current, { intensity: d2, duration, overwrite: 'auto' });
            if (dirLight3Ref.current) gsap.to(dirLight3Ref.current, { intensity: d3, duration, overwrite: 'auto' });
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
                animateTo([-2.5, -0.4, 0.5], [0.08, Math.PI * 1.3, 0]); // Car shifted left
                animateLights(1.0, 1.5, 1.0, 1.0, 2);
            },
            onEnterBack: () => {
                animateTo([-2.5, -0.4, 0.5], [0.08, Math.PI * 1.3, 0]);
            }
        });

        // ==========================================
        // STAGE 1: POWERTRAIN (Side Profile)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-powertrain',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-3.0, 0.0, 1.5], [0.15, Math.PI * 0.55, 0]), // Text right, car left
            onEnterBack: () => animateTo([-3.0, 0.0, 1.5], [0.15, Math.PI * 0.55, 0])
        });

        // ==========================================
        // STAGE 2: ACTIVE AERO (Rear Wing Shot)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-drs',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([2.5, -0.8, 1], [0.05, Math.PI * 0.3, 0]), // Text left, car right showing rear wing
            onEnterBack: () => animateTo([2.5, -0.8, 1], [0.05, Math.PI * 0.3, 0])
        });

        // ==========================================
        // STAGE 3: STATS (Car lower to avoid huge text)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-stats',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([0, -0.8, 2], [0.0, Math.PI * -0.045, 0]), // Center, facing forward
            onEnterBack: () => animateTo([0, -0.8, 2], [0.0, Math.PI * -0.45, 0])
        });

        // ==========================================
        // STAGE 4: TRANSMISSION (Zoom onto rear)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-radiator', // Transmission section id
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-3.0, -0.2, 2.0], [0.1, Math.PI * -0.2, 0]), // Text right, car left zooming rear
            onEnterBack: () => animateTo([-3.0, -0.2, 2.0], [0.1, Math.PI * -0.2, 0])
        });

        // ==========================================
        // STAGE 5: BRAKES (Zoom to front wheels)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-brakes',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([4.0, 0.6, 6], [0.0, Math.PI * -0.065, 0]);
                animateLights(1.0, 1.5, 1.0, 1.0);
            },
            onEnterBack: () => {
                animateTo([4.0, 0.6, 6], [0.0, Math.PI * -0.065, 0]);
                animateLights(1.0, 1.5, 1.0, 1.0);
            }
        });

        // ==========================================
        // STAGE 6: INTERIOR (Zoom into dashboard)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cockpit',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([0, 0.85, 10.5], [-0.05, Math.PI * 0.5, 0]); // Inside car
                animateLights(0, 0, 0, 0); // Turn off lights
            },
            onEnterBack: () => {
                animateTo([0, 0.85, 10.5], [-0.05, Math.PI * 0.5, 0]);
                animateLights(0, 0, 0, 0);
            }
        });

        // ==========================================
        // STAGE 7: SPECS (Rotate to show profile for side specs)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-specs',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 1.3, 0]);
                animateLights(1.0, 1.5, 1.0, 1.0);
            },
            onEnterBack: () => {
                animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 1.3, 0]);
                animateLights(1.0, 1.5, 1.0, 1.0);
            }
        });

        // ==========================================
        // STAGE 8: CTA (Heroic Angle)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cta',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.5, -0.8, 0], [0.06, Math.PI * 1.3, 0]), // Text right, car left
            onEnterBack: () => animateTo([-2.5, -0.8, 0], [0.06, Math.PI * 1.3, 0])
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={1.0} color="#fef3c7" />
            <directionalLight ref={dirLight1Ref} position={[0, 10, 5]} intensity={1.5} color="#ffedd5" />
            <directionalLight ref={dirLight2Ref} position={[-5, 5, -5]} intensity={1.0} color="#ffedd5" />
            <directionalLight ref={dirLight3Ref} position={[5, 5, -5]} intensity={1.0} color="#ffedd5" />
            <Environment preset="studio" />

            <group ref={groupRef} dispose={null}>
                <Center>
                    <primitive object={scene} scale={0.95} position={[0, -2.5, 0]} />
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

export default function TurboViewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 1.5, 12], fov: 38 }} dpr={[1, 2]}>
                <React.Suspense fallback={<Loader />}>
                    <SceneChoreography />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
