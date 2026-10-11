import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGLTF, Environment, Center, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShowroomErrorBoundary from './ShowroomErrorBoundary';
import ShowroomLoader from './ShowroomLoader';
import { createModeCycle } from './signatures/hybridModes';
import fallbackImage from '../assets/918 spyder/hero.jpg';

// PERF-01: disabled, not deleted. At module scope this ran on import, and every 3D page was
// imported by the app shell, so every route downloaded all five models (~130 MB). The model now
// loads only when this showroom renders (useGLTF below).
// useGLTF.preload('/porsche-918-spyder-2015/source/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb');

const Loader = () => <ShowroomLoader color="#a3e635" glow="rgba(163, 230, 53, 0.5)" />;

const SceneChoreography = () => {
    const { scene } = useGLTF('/porsche-918-spyder-2015/source/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb');
    const groupRef = useRef();
    const ambientLightRef = useRef();
    const dirLightMainRef = useRef();
    const dirLightSubRef = useRef();
    const spotLightRef = useRef();
    const headlightLeftRef = useRef();
    const headlightRightRef = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        // Adjust materials to remove chrome/liquid metal look
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                // We only adjust materials that are overly metallic
                if (child.material.metalness > 0.8) {
                    child.material.metalness = 0.9;
                }
                if (child.material.roughness < 0.2) {
                    child.material.roughness = 0.5;
                }
                child.material.envMapIntensity = 0.5;
                child.material.needsUpdate = true;

                // Turn on taillights
                if (child.material.name === 'Tail_Light_Base') {
                    child.material.emissive = new THREE.Color('#ff0000');
                    child.material.emissiveIntensity = 2.0;
                    child.material.toneMapped = true;
                }
            }
        });

        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - Match the Hero section so it looks perfect immediately on page load
        ambientLightRef.current.intensity = 0.1;
        dirLightMainRef.current.intensity = 0.5;
        dirLightSubRef.current.intensity = 0.2;
        spotLightRef.current.intensity = 600;
        spotLightRef.current.color.set('#ffffff');
        headlightLeftRef.current.intensity = 300;
        headlightRightRef.current.intensity = 300;

        document.documentElement.style.setProperty('--theme-color', '#ffffff');

        const scroller = '#scroll-container';
        const startTrigger = 'top 50%';
        // Developer request (2026-10-11): scrolling up hands over at the same mid-screen point as
        // scrolling down (the default end was 'bottom top', so moves back fired at a different point).
        const endTrigger = 'bottom 50%';

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

        const animateLightColor = (hex, duration = 2) => {
            const targetColor = new THREE.Color(hex);

            // Sync HTML text colors via CSS variable
            gsap.to(document.documentElement, {
                '--theme-color': hex,
                duration,
                ease: 'power2.inOut',
                overwrite: 'auto'
            });

            gsap.to(spotLightRef.current.color, {
                r: targetColor.r, g: targetColor.g, b: targetColor.b,
                duration, ease: 'power2.inOut', overwrite: 'auto'
            });
            gsap.to(ambientLightRef.current.color, {
                r: targetColor.r, g: targetColor.g, b: targetColor.b,
                duration, ease: 'power2.inOut', overwrite: 'auto'
            });
            gsap.to(dirLightMainRef.current.color, {
                r: targetColor.r, g: targetColor.g, b: targetColor.b,
                duration, ease: 'power2.inOut', overwrite: 'auto'
            });
            gsap.to(dirLightSubRef.current.color, {
                r: targetColor.r, g: targetColor.g, b: targetColor.b,
                duration, ease: 'power2.inOut', overwrite: 'auto'
            });
        };

        const animateSpoiler = (deploy) => {
            if (!scene) return;
            const spoilerParts = [
                'Spoiler_269', 'Spoiler 2_270', 'Spoiler detail_271',
                'Spoiler detail.001_272', 'Spoiler detail.002_273',
                'Spoiler detail.003_274', 'Spoiler detail.004_275'
            ];

            spoilerParts.forEach(name => {
                const obj = scene.getObjectByName(name);
                if (obj) {
                    if (obj.userData.initY === undefined) {
                        obj.userData.initY = obj.position.y;
                    }
                    gsap.to(obj.position, {
                        y: obj.userData.initY + (deploy ? 0.08 : 0), // Raise spoiler
                        duration: 1.5,
                        ease: 'back.out(1.2)',
                        overwrite: 'auto'
                    });
                }
            });
        };

        // 1. HERO (Car entering from right, stopping left)
        ScrollTrigger.create({
            trigger: '#section-hero',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([-3.8, -0.4, 0], [0.08, Math.PI * 0.2, 0]);
                animateLightColor('#ffffff'); // White
                gsap.to(ambientLightRef.current, { intensity: 0.1, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightMainRef.current, { intensity: 0.5, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightSubRef.current, { intensity: 0.2, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(spotLightRef.current, { intensity: 600, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(headlightLeftRef.current, { intensity: 300, duration: 0.5, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(headlightRightRef.current, { intensity: 300, duration: 0.5, ease: 'power2.in', overwrite: 'auto' });
            },
            onEnterBack: () => {
                animateTo([-3.8, -0.4, 0], [0.08, Math.PI * 0.2, 0]);
                animateLightColor('#ffffff');
            }
        });

        // 2. POWERTRAIN (Top-exit exhausts, top rear angle)
        ScrollTrigger.create({
            trigger: '#section-powertrain',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([-1.7, -0.75, 2.5], [0.15, Math.PI * 0.9, 0]);
                animateLightColor('#f79791'); // Red for engine heat
            },
            onEnterBack: () => {
                animateTo([-1.7, -0.75, 2.5], [0.15, Math.PI * 0.9, 0]);
                animateLightColor('#f79791');
            }
        });

        // 3. E-PERFORMANCE (Aggressive front-low angle)
        ScrollTrigger.create({
            trigger: '#section-eperformance',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([1.0, 0.5, 2.0], [0.15, Math.PI * 2.1, 0]);
                animateLightColor('#42f2f5'); // Cyan for electric
            },
            onEnterBack: () => {
                animateTo([1.0, 0.5, 2.0], [0.15, Math.PI * 2.15, 0]);
                animateLightColor('#42f2f5');
            }
        });

        // SIGNATURE: HYBRID MODES (car on the left; lights and page accent cycle E-Power -> Hybrid -> Race)
        const hybridCycle = createModeCycle({
            apply: (mode) => animateLightColor(mode.color, 1.2),
            isAlive: () => Boolean(document.getElementById('section-hybridmodes')),
        });
        ScrollTrigger.create({
            trigger: '#section-hybridmodes',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => { animateTo([-3.3, -0.7, -2.4], [0.02, Math.PI * 0.32, 0]); hybridCycle.start(); },
            onEnterBack: () => { animateTo([-3.3, -0.7, -2.4], [0.02, Math.PI * 0.32, 0]); hybridCycle.start(); },
            onLeave: () => hybridCycle.stop(),
            onLeaveBack: () => hybridCycle.stop()
        });

        // 4. AERODYNAMICS (Rear Wing/Diffuser)
        ScrollTrigger.create({
            trigger: '#section-aero',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([2.5, -0.6, 2.75], [-0.1, Math.PI * 0.85, 0]);
                animateLightColor('#e2e8f0'); // Silver/White
                animateSpoiler(true);
            },
            onEnterBack: () => {
                animateTo([2.5, -0.6, 2.75], [-0.1, Math.PI * 0.85, 0]);
                animateLightColor('#e2e8f0');
                animateSpoiler(true);
            },
            onLeave: () => animateSpoiler(false),
            onLeaveBack: () => animateSpoiler(false)
        });

        // 5. OPEN ROOF (Top-down / high angle highlighting cabin)
        ScrollTrigger.create({
            trigger: '#section-roof',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([-3.0, 0.0, 0.8], [0.3, Math.PI * 0.3, 0]);
                animateLightColor('#fbbf24'); // Warm gold for interior luxury
            },
            onEnterBack: () => {
                animateTo([-3.0, 0.0, 0.8], [0.3, Math.PI * 0.3, 0]);
                animateLightColor('#fbbf24');
            }
        });

        // 6. CARBON FIBER CHASSIS (Sweeping side profile)
        ScrollTrigger.create({
            trigger: '#section-chassis',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([3.0, -0.2, 0], [0.05, Math.PI * 1.8, 0]);
                animateLightColor('#8b5cf6'); // Purple/Dark Blue for carbon tech
            },
            onEnterBack: () => {
                animateTo([3.0, -0.2, 0], [0.05, Math.PI * 1.8, 0]);
                animateLightColor('#8b5cf6');
            }
        });

        // 7. SPECS (Clean side profile)
        ScrollTrigger.create({
            trigger: '#section-specs',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([0, -0.8, 0], [0.08, Math.PI * 1.5, 0]);
                animateLightColor('#a3e635'); // Acid Green for stats
            },
            onEnterBack: () => {
                animateTo([0, -0.8, 0], [0.08, Math.PI * 1.5, 0]);
                animateLightColor('#a3e635');
            }
        });

        // 8. CTA (Heroic Front 3/4)
        ScrollTrigger.create({
            trigger: '#section-cta',
            scroller: scroller,
            start: startTrigger,
            end: endTrigger,
            onEnter: () => {
                animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 2.3, 0]);
                animateLightColor('#ffffff'); // Pure white
            },
            onEnterBack: () => {
                animateTo([-3.8, -0.4, 0], [0.06, Math.PI * 2.3, 0]);
                animateLightColor('#ffffff');
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={0} color="#ffffff" />
            <directionalLight ref={dirLightMainRef} position={[5, 10, 5]} intensity={0} color="#ffffff" castShadow />
            <directionalLight ref={dirLightSubRef} position={[-5, 5, -5]} intensity={0} color="#ffffff" />

            <group ref={groupRef} dispose={null} position={[-3.8, -0.4, 0]} rotation={[0.08, Math.PI * 0.12, 0]}>
                <Center>
                    <primitive object={scene} scale={2} position={[0, -2, 0]} />
                    {/* Faked Headlights */}
                    <spotLight ref={headlightLeftRef} position={[-0.75, 0.5, 2.5]} angle={0.4} penumbra={0.6} intensity={0} color="#e0f2fe" distance={40} />
                    <spotLight ref={headlightRightRef} position={[0.75, 0.5, 2.5]} angle={0.4} penumbra={0.6} intensity={0} color="#e0f2fe" distance={40} />

                    {/* Overhead Studio Light that perfectly tracks the car */}
                    <spotLight ref={spotLightRef} position={[0, 12, 0]} angle={0.8} penumbra={0.5} intensity={0} distance={50} color="#ffffff" castShadow />
                </Center>
            </group>

            <ContactShadows
                position={[0, -2.8, 0]}
                opacity={0.8}
                scale={35}
                blur={2.5}
                far={6}
                color="#15803d"
            />
        </>
    );
};

export default function SpyderViewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ShowroomErrorBoundary fallbackImage={fallbackImage} alt="Porsche 918 Spyder">
            <Canvas camera={{ position: [0, 1.5, 12], fov: 38 }} dpr={[1, 2]}>
                <React.Suspense fallback={<Loader />}>
                    <SceneChoreography />
                </React.Suspense>
            </Canvas>
            </ShowroomErrorBoundary>
        </div>
    );
}
