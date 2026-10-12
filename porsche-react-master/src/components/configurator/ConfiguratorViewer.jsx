import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import ShowroomErrorBoundary from '../ShowroomErrorBoundary';
import ShowroomLoader from '../ShowroomLoader';
import { prefersReducedMotion } from '../signatures/motion';
import { applyPaint, preparePaintableClone } from './paint';
import taycanPhoto from '../../assets/taycan/hero.jpeg';
import cayennePhoto from '../../assets/cayenne/hero.jpg';
import turboPhoto from '../../assets/turboS/hero.avif';
import spyderPhoto from '../../assets/918 spyder/hero.jpg';

// Phase 12: the configurator's 3D view. Only the selected car's model is downloaded. It renders a
// clone with its own paint materials (paint.js), so the showrooms' cached scenes are never changed.
const PHOTOS = { taycan: taycanPhoto, cayenne: cayennePhoto, '911-turbo-s': turboPhoto, '918-spyder': spyderPhoto };
const LENGTH = 4.6; // every car is scaled to the same length, standing on the floor at y = 0

function Car({ car, paint, finish }) {
    const { scene } = useGLTF(car.model);
    const { root, paints } = useMemo(() => preparePaintableClone(scene, car.paintMaterials), [scene, car]);
    const fit = useMemo(() => {
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = LENGTH / Math.max(size.x, size.z);
        return { scale, position: [-center.x * scale, -box.min.y * scale, -center.z * scale] };
    }, [root]);

    useLayoutEffect(() => applyPaint(paints, paint, finish), [paints, paint, finish]);
    useEffect(() => () => paints.forEach((m) => m.dispose()), [paints]); // only the copies

    return (
        <group position={fit.position} scale={fit.scale}>
            <primitive object={root} />
        </group>
    );
}

const TARGET = new THREE.Vector3(0, 0.6, 0);
// The whole car must fit the canvas width: a narrow (portrait) canvas needs the camera further back.
export const framingDistance = (aspect) => Math.min(14, Math.max(6.2, 9.6 / aspect));

function Framing() {
    const camera = useThree((state) => state.camera);
    const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
    useEffect(() => {
        const direction = camera.position.clone().sub(TARGET).normalize();
        camera.position.copy(TARGET).addScaledVector(direction, framingDistance(aspect));
    }, [camera, aspect]);
    return null;
}

export default function ConfiguratorViewer({ car, paint, finish }) {
    const still = prefersReducedMotion();
    const [autoRotate, setAutoRotate] = useState(!still);

    return (
        <ShowroomErrorBoundary key={car.id} fallbackImage={PHOTOS[car.id]} alt={`${car.name} photo (3D view unavailable)`}>
            <Canvas camera={{ position: [5.2, 1.9, 5.2], fov: 32 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.35} />
                <directionalLight position={[5, 8, 5]} intensity={1.6} />
                {/* Studio reflections built locally (no HDR download): softboxes the paint can mirror. */}
                <Environment resolution={256} frames={1}>
                    <Lightformer form="rect" intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
                    <Lightformer form="rect" intensity={1.6} position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
                    <Lightformer form="rect" intensity={1.6} position={[6, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
                    <Lightformer form="ring" intensity={1} position={[0, 2, -8]} scale={4} color="#ffd9c7" />
                </Environment>
                <Suspense fallback={<ShowroomLoader color="#f87171" glow="rgba(248, 113, 113, 0.5)" />}>
                    <Car car={car} paint={paint} finish={finish} />
                    <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={12} blur={2.4} far={3} />
                </Suspense>
                <Framing />
                <OrbitControls
                    makeDefault
                    target={TARGET}
                    enablePan={false}
                    enableDamping
                    minDistance={5}
                    maxDistance={15}
                    minPolarAngle={Math.PI / 5}
                    maxPolarAngle={Math.PI / 2.08}
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.8}
                    onStart={() => setAutoRotate(false)}
                />
            </Canvas>
        </ShowroomErrorBoundary>
    );
}
