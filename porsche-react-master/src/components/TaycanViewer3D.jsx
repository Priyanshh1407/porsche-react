import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGLTF, Environment, Center, ContactShadows } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShowroomErrorBoundary from './ShowroomErrorBoundary';
import ShowroomLoader from './ShowroomLoader';
import TaycanEnergyPulse from './signatures/TaycanEnergyPulse';
import fallbackImage from '../assets/taycan/hero.jpeg';

// PERF-01: disabled, not deleted. At module scope this ran on import, and every 3D page was
// imported by the app shell, so every route downloaded all five models (~130 MB). The model now
// loads only when this showroom renders (useGLTF below).
// useGLTF.preload('/2025_porsche_taycan_turbo_gt_weissach_package.glb');

const Loader = () => <ShowroomLoader />;

const SceneChoreography = () => {
    const { scene } = useGLTF('/2025_porsche_taycan_turbo_gt_weissach_package.glb');
    const { camera } = useThree();
    const groupRef = useRef();
    const ambientLightRef = useRef();
    const dirLightMainRef = useRef();
    const dirLightSubRef = useRef();
    const headlightLeftRef = useRef();
    const headlightRightRef = useRef();
    const chargePortLightRef = useRef();
    const ring1Ref = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - Pitch black, car lowered so text doesn't overlap
        ambientLightRef.current.intensity = 0;
        dirLightMainRef.current.intensity = 0;
        dirLightSubRef.current.intensity = 0;
        headlightLeftRef.current.intensity = 0;
        headlightRightRef.current.intensity = 0;

        if (chargePortLightRef.current && ring1Ref.current) {
            chargePortLightRef.current.intensity = 0;
            ring1Ref.current.material.opacity = 0;
            ring2Ref.current.material.opacity = 0;
            ring3Ref.current.material.opacity = 0;

            // Continuous rotation for hologram
            gsap.to(ring1Ref.current.rotation, { z: Math.PI * 2, duration: 4, repeat: -1, ease: "none" });
            gsap.to(ring2Ref.current.rotation, { z: -Math.PI * 2, duration: 5, repeat: -1, ease: "none" });
            gsap.to(ring3Ref.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }

        // Fix materials transparency bug only
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.transparent && child.material.opacity > 0.99) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                }
                child.material.envMapIntensity = 1.5;

                // Turn on actual headlights/taillights since this model has an emission map material
                if (child.material.name === 'emiss') {
                    child.material.emissive = new THREE.Color('#ffffff');
                    child.material.emissiveIntensity = 5.0;
                    child.material.toneMapped = true;
                }
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
        // Developer request (2026-10-11): scrolling up hands over at the same mid-screen point as
        // scrolling down (the default end was 'bottom top', so moves back fired at a different point).
        const endTrigger = 'bottom 50%';

        // ==========================================
        // STAGE 0: HERO (Car on the left, facing right)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-hero',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([-3.8, 0.0, 0], [0.08, Math.PI * 0.2, 0]); // Car shifted left
                gsap.to(headlightLeftRef.current, { intensity: 50, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(headlightRightRef.current, { intensity: 50, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(ambientLightRef.current, { intensity: 0.4, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightMainRef.current, { intensity: 1.2, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightSubRef.current, { intensity: 0.3, duration: 2, delay: 0.2, overwrite: 'auto' });
            },
            onEnterBack: () => {
                animateTo([-3.8, 0.0, 0], [0.08, Math.PI * 0.2, 0]);
            }
        });

        // ==========================================
        // STAGE 1: POWERTRAIN (Side Profile)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-powertrain',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([-2.3, -0.3, 0], [0.05, Math.PI * 0.55, 0]),
            onEnterBack: () => animateTo([-2.3, -0.3, 0], [0.05, Math.PI * 0.55, 0])
        });

        // ==========================================
        // SIGNATURE: ENERGY (car on the right, floor visible; TaycanEnergyPulse runs the rings)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-energy',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([2.8, -0.7, -2.5], [0.1, Math.PI * 1.8, 0]),
            onEnterBack: () => animateTo([2.8, -0.7, -2.5], [0.1, Math.PI * 1.8, 0])
        });

        // ==========================================
        // STAGE 2: WEISSACH PACKAGE (Rear Wing Shot)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-drs',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([1.4, 0.0, 3.3], [-0.18, Math.PI * 1.1, 0]), // Camera elevated above bumper, looking at wing
            onEnterBack: () => animateTo([1.4, 0.0, 3.3], [-0.18, Math.PI * 1.1, 0])
        });

        // ==========================================
        // STAGE 3: STATS (Car lower to avoid huge text)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-stats',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([0, -0.8, 0], [0.08, Math.PI * 1.75, 0]), // Shifted up slightly
            onEnterBack: () => animateTo([0, -0.8, 0], [0.08, Math.PI * 1.75, 0])
        });

        // ==========================================
        // STAGE 4: CHARGING & RANGE (Zoom on front fender / charge port)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-radiator',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                // Zoom in close to front-left fender.
                animateTo([-2.0, 1.5, 8.0], [0.1, Math.PI * 0.45, 0], 2);
                gsap.to(chargePortLightRef.current, { intensity: 100, duration: 1, overwrite: 'auto' });
                gsap.to([ring1Ref.current.material, ring3Ref.current.material], { opacity: 0.8, duration: 1, overwrite: 'auto' });
                gsap.to(ring2Ref.current.material, { opacity: 0.4, duration: 1, overwrite: 'auto' });
            },
            onEnterBack: () => {
                animateTo([-2.0, 1.5, 8.0], [0.1, Math.PI * 0.45, 0], 2);
                gsap.to(chargePortLightRef.current, { intensity: 100, duration: 1, overwrite: 'auto' });
                gsap.to([ring1Ref.current.material, ring3Ref.current.material], { opacity: 0.8, duration: 1, overwrite: 'auto' });
                gsap.to(ring2Ref.current.material, { opacity: 0.4, duration: 1, overwrite: 'auto' });
            },
            onLeave: () => {
                gsap.to(chargePortLightRef.current, { intensity: 0, duration: 1, overwrite: 'auto' });
                gsap.to([ring1Ref.current.material, ring2Ref.current.material, ring3Ref.current.material], { opacity: 0, duration: 1, overwrite: 'auto' });
            },
            onLeaveBack: () => {
                gsap.to(chargePortLightRef.current, { intensity: 0, duration: 1, overwrite: 'auto' });
                gsap.to([ring1Ref.current.material, ring2Ref.current.material, ring3Ref.current.material], { opacity: 0, duration: 1, overwrite: 'auto' });
            }
        });

        // ==========================================
        // STAGE 5: LAUNCH CONTROL (Slide to rear brakes on same side)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-brakes',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([4, 1.2, 7.5], [0.1, Math.PI * 0.42, 0], 2), // Keep left side visible, shift car right to reveal rear wheel
            onEnterBack: () => animateTo([3.5, 1.2, 7.5], [0.1, Math.PI * 0.42, 0], 2)
        });

        // ==========================================
        // STAGE 6: COCKPIT (Inside the cabin, between seats)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cockpit',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([0, 1.0, 11.25], [-0.05, Math.PI * 3.0, 0]);
            },
            onEnterBack: () => {
                animateTo([0, 1, 11.25], [-0.05, Math.PI * 3.0, 0]);
            }
        });

        // ==========================================
        // STAGE 7: SPECS (Rotate to show profile for side specs)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-specs',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 2.8, 0]), // Shifted further left
            onEnterBack: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 2.8, 0])
        });

        // ==========================================
        // STAGE 8: CTA (Heroic Front Angle - lowered to prevent overlap)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cta',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 2.3, 0]), // Restored fine position
            onEnterBack: () => animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 2.3, 0])
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={0} />
            <directionalLight ref={dirLightMainRef} position={[5, 8, 3]} intensity={0} color="#ffffff" />
            <directionalLight ref={dirLightSubRef} position={[-5, 5, -3]} intensity={0} color="#ffffff" />

            {/* Purple Rim Lighting for Electric Theme */}
            <spotLight position={[0, 5, -5]} angle={0.8} penumbra={1} intensity={150} color="#8b5cf6" distance={20} />

            <Environment preset="studio" />

            <group ref={groupRef} dispose={null}>
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

                {/* Holographic Charging Interface (Front Left Fender) */}
                <group position={[0.0, -0.0, 1.1]} rotation={[0, Math.PI / 2, 0]} scale={2}>
                    <pointLight ref={chargePortLightRef} color="#2dd4bf" intensity={0} distance={4} decay={2} />

                    {/* Inner Rotating Ring */}
                    <mesh ref={ring1Ref}>
                        <torusGeometry args={[0.08, 0.003, 16, 32]} />
                        <meshBasicMaterial color="#2dd4bf" transparent={true} opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
                    </mesh>

                    {/* Outer Counter-Rotating Ring */}
                    <mesh ref={ring2Ref} scale={1.4}>
                        <torusGeometry args={[0.08, 0.0015, 16, 32]} />
                        <meshBasicMaterial color="#8b5cf6" transparent={true} opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
                    </mesh>

                    {/* Central Pulsing Core */}
                    <mesh ref={ring3Ref}>
                        <sphereGeometry args={[0.02, 16, 16]} />
                        <meshBasicMaterial color="#e0e7ff" transparent={true} opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
                    </mesh>
                </group>
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

export default function TaycanViewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ShowroomErrorBoundary fallbackImage={fallbackImage} alt="Porsche Taycan">
            <Canvas camera={{ position: [0, 1.5, 12], fov: 38 }} dpr={[1, 2]}>
                <React.Suspense fallback={<Loader />}>
                    <SceneChoreography />
                    <TaycanEnergyPulse position={[2.3, -1.55, -1.9]} />
                </React.Suspense>
            </Canvas>
            </ShowroomErrorBoundary>
        </div>
    );
}
