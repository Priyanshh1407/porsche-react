import React, { useRef, useLayoutEffect } from 'react';
import { useGLTF, Environment, Html, useProgress, Center, ContactShadows } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

useGLTF.preload('/2024_manthey_racing_porsche_911_gt3_rs.glb');

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
    const { scene } = useGLTF('/2024_manthey_racing_porsche_911_gt3_rs.glb');
    const { camera } = useThree();
    const groupRef = useRef();
    const ambientLightRef = useRef();
    const dirLightMainRef = useRef();
    const dirLightSubRef = useRef();
    const headlightLeftRef = useRef();
    const headlightRightRef = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - Pitch black, car lowered so text doesn't overlap
        ambientLightRef.current.intensity = 0;
        dirLightMainRef.current.intensity = 0;
        dirLightSubRef.current.intensity = 0;
        headlightLeftRef.current.intensity = 0;
        headlightRightRef.current.intensity = 0;

        // Fix materials transparency bug and hide interior grill
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.transparent && child.material.opacity > 0.99) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                }
                child.material.envMapIntensity = 1.5;
                
                // Hide the dashboard grill/trim that obstructs the screen
                const matName = child.material.name.toLowerCase();
                let isInterior = false;
                let current = child;
                while (current) {
                    const nodeName = current.name.toLowerCase();
                    if (nodeName.includes('dash') || nodeName.includes('trim') || nodeName.includes('grille')) {
                        isInterior = true;
                        break;
                    }
                    current = current.parent;
                }
                
                // Hide if it's a carbon interior piece or an interior grille
                if (isInterior && (matName.includes('carbon') || child.name.toLowerCase().includes('grille') || matName.includes('grill'))) {
                    child.visible = false;
                }
            }
        });

        groupRef.current.rotation.set(0.08, Math.PI * 0.12, 0);
        groupRef.current.position.set(0, -1.5, 0);

        // Update door references for Manthey Racing model
        const leftDoor = scene.getObjectByName('door_L_36_159') || scene.getObjectByName('DOOR_L_1');
        const rightDoor = scene.getObjectByName('door_R_36_159') || scene.getObjectByName('DOOR_R_1');

        const animateDoors = (isOpen) => {
            const rotY = isOpen ? Math.PI * 0.25 : 0;
            if (leftDoor) gsap.to(leftDoor.rotation, { y: rotY, duration: 1.5, ease: 'power2.inOut', overwrite: 'auto' });
            if (rightDoor) gsap.to(rightDoor.rotation, { y: -rotY, duration: 1.5, ease: 'power2.inOut', overwrite: 'auto' });
        };

        const scroller = '#scroll-container';
        const startTrigger = 'top 50%';

        // Helper function for discrete animations - GT3 RS is fast, snappy, aggressive
        const animateTo = (pos, rot, duration = 1.2) => {
            gsap.to(groupRef.current.position, {
                x: pos[0], y: pos[1], z: pos[2],
                duration, ease: 'power4.out', overwrite: 'auto'
            });
            gsap.to(groupRef.current.rotation, {
                x: rot[0], y: rot[1], z: rot[2],
                duration, ease: 'power4.out', overwrite: 'auto'
            });
            // Ensure camera resets to default position for most sections
            gsap.to(camera.position, {
                x: 0, y: 1.5, z: 12,
                duration, ease: 'power4.out', overwrite: 'auto'
            });
        };

        // ==========================================
        // STAGE 0: HERO (Car on the left, facing right)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-hero',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                animateTo([-3.8, -0.2, 0], [0.08, Math.PI * 0.2, 0]); // Car shifted left
                gsap.to(headlightLeftRef.current, { intensity: 100, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(headlightRightRef.current, { intensity: 100, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
                gsap.to(ambientLightRef.current, { intensity: 0.4, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightMainRef.current, { intensity: 1.2, duration: 2, delay: 0.2, overwrite: 'auto' });
                gsap.to(dirLightSubRef.current, { intensity: 0.3, duration: 2, delay: 0.2, overwrite: 'auto' });
            },
            onEnterBack: () => {
                animateTo([-3.8, -0.2, 0], [0.08, Math.PI * 0.2, 0]);
            }
        });

        // ==========================================
        // STAGE 1: POWERTRAIN (Side Profile)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-powertrain',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.3, -0.3, -0.5], [0.05, Math.PI * 0.55, 0]),
            onEnterBack: () => animateTo([-2.3, -0.3, 0], [0.05, Math.PI * 0.55, 0])
        });

        // ==========================================
        // STAGE 2: DRS (Rear Wing Shot)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-drs',
            scroller: scroller,
            start: startTrigger,
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
            onEnter: () => animateTo([0, -0.8, 0], [0.08, Math.PI * 1.75, 0]), // Shifted up slightly
            onEnterBack: () => animateTo([0, -0.8, 0], [0.08, Math.PI * 1.75, 0])
        });

        // ==========================================
        // STAGE 4: RADIATOR (Zoom onto FRONT hood)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-radiator',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.8, 0.9, 1.5], [0.2, Math.PI * 2.13, 0]), // Pure front view, shifted left
            onEnterBack: () => animateTo([-2.8, 0.9, 1.5], [0.2, Math.PI * 2.13, 0])
        });

        // ==========================================
        // STAGE 5: BRAKES (Zoom to front wheels)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-brakes',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([3.5, 0.8, 7], [0.05, Math.PI * 0.35, 0]),
            onEnterBack: () => animateTo([3.5, 0.8, 7], [0.05, Math.PI * 0.35, 0])
        });

        // ==========================================
        // STAGE 6: COCKPIT (Zoom into dashboard)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cockpit',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => {
                // Shift the car to align the door, and open it
                animateTo([-1.0, 0.08, 9.1], [-0.1, Math.PI * 1.0, 0]);
                animateDoors(true);

                // Fly the camera straight into the open door and into the cabin!
                gsap.to(camera.position, {
                    x: -0.95, y: 0.75, z: 10.4,
                    duration: 2.5, ease: 'power3.out', overwrite: 'auto'
                });
            },
            onEnterBack: () => {
                animateTo([-1.0, 0.08, 9.1], [-0.1, Math.PI * 1.0, 0]);
                animateDoors(true);

                gsap.to(camera.position, {
                    x: -0.95, y: 0.75, z: 10.4,
                    duration: 2.5, ease: 'power3.out', overwrite: 'auto'
                });
            },
            onLeave: () => animateDoors(false),
            onLeaveBack: () => animateDoors(false)
        });

        // ==========================================
        // STAGE 7: SPECS (Rotate to show profile for side specs)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-specs',
            scroller: scroller,
            start: startTrigger,
            onEnter: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 0.8, 0]), // Shifted further left
            onEnterBack: () => animateTo([-2.0, -0.5, 0], [0.05, Math.PI * 0.8, 0])
        });

        // ==========================================
        // STAGE 8: CTA (Heroic Front Angle - lowered to prevent overlap)
        // ==========================================
        ScrollTrigger.create({
            trigger: '#section-cta',
            scroller: scroller,
            start: startTrigger,
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
            <directionalLight ref={dirLightMainRef} position={[5, 8, 3]} intensity={0} color="#fff4eb" />
            <directionalLight ref={dirLightSubRef} position={[-5, 5, -3]} intensity={0} color="#ffedd5" />

            <spotLight ref={headlightLeftRef} position={[-0.8, 0.5, 4]} angle={0.3} penumbra={0.5} intensity={0} color="#e0f2fe" distance={20} />
            <spotLight ref={headlightRightRef} position={[0.8, 0.5, 4]} angle={0.3} penumbra={0.5} intensity={0} color="#e0f2fe" distance={20} />
            
            {/* Red Underglow */}
            <pointLight position={[0, -2, 0]} intensity={2.5} color="#ff1100" distance={6} decay={2} />

            <Environment preset="night" />

            <group ref={groupRef} dispose={null}>
                <Center>
                    <primitive object={scene} scale={2} position={[0, -2, 0]} />
                </Center>
            </group>

            <ContactShadows
                position={[0, -2.8, 0]}
                opacity={0.6}
                scale={30}
                blur={2.5}
                far={6}
                color="#000000"
            />
        </>
    );
};

export default function ModelViewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 1.5, 12], fov: 38 }} dpr={[1, 2]}>
                <React.Suspense fallback={<Loader />}>
                    <SceneChoreography />
                </React.Suspense>
                
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={[0.002, 0.002]}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
