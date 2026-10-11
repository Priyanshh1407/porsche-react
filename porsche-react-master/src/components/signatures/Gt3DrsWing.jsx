import { useLayoutEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Matrix4, Quaternion, Vector3 } from 'three';
import gsap from 'gsap';
import useSignatureSection from './useSignatureSection';
import { prefersReducedMotion } from './motion';

// GT3 RS DRS: in the Active Aerodynamics section the rear wing blade flattens (DRS open), as the
// section's copy describes, and returns to full attack when you scroll on, like the 918's spoiler.
// The blade is its own node in the model (Object_48, between the endplates); it turns about its own
// centre and around the car's width, so it stays between the endplates and on the swan necks. The
// endplates, necks and the car's choreography are not touched.
const MODEL = '/2024_manthey_racing_porsche_911_gt3_rs.glb';
const FLAP = 'Object_48';
export const DRS_OPEN_DEG = -14; // flatter blade: less drag (checked against renders of the model)

export function findDrsFlap(scene) {
    return scene.getObjectByName(FLAP) || null;
}

/**
 * Tilt `flap` about its own centre, around the X axis (the car's width) of `root` (the model's scene),
 * whatever transforms sit in between. Works in the flap's parent space, so it is unaffected by where
 * the choreography has moved the car. restore() puts back the exact original pose.
 */
export function createDrsTilt(flap, root, { reduced = false } = {}) {
    const p0 = flap.position.clone();
    const q0 = flap.quaternion.clone();

    root.updateMatrixWorld(true);
    // Parent space relative to the model root (independent of the car group's world pose).
    const parentInRoot = new Matrix4().copy(root.matrixWorld).invert().multiply(flap.parent.matrixWorld);
    const toParent = new Quaternion().setFromRotationMatrix(parentInRoot).invert();
    const axis = new Vector3(1, 0, 0).applyQuaternion(toParent).normalize();
    if (!flap.geometry.boundingBox) flap.geometry.computeBoundingBox();
    const pivot = flap.geometry.boundingBox.getCenter(new Vector3()).applyMatrix4(flap.matrix); // in parent space

    const state = { angle: 0 };
    const turn = new Quaternion();
    const render = () => {
        turn.setFromAxisAngle(axis, (state.angle * Math.PI) / 180);
        flap.position.copy(p0).sub(pivot).applyQuaternion(turn).add(pivot);
        flap.quaternion.copy(turn).multiply(q0);
    };
    const to = (angle, vars) => gsap.to(state, { angle, overwrite: 'auto', onUpdate: render, ...(reduced ? { duration: 0, delay: 0 } : vars) });
    return {
        state,
        // Opens once the car has settled in the section's pose; snaps back like the 918's spoiler.
        open: () => to(DRS_OPEN_DEG, { duration: 0.6, delay: 0.9, ease: 'power3.out' }),
        close: () => to(0, { duration: 0.7, delay: 0, ease: 'back.out(1.6)' }),
        restore: () => {
            gsap.killTweensOf(state);
            state.angle = 0;
            flap.position.copy(p0);
            flap.quaternion.copy(q0);
        },
    };
}

export default function Gt3DrsWing() {
    const { scene } = useGLTF(MODEL);
    const tilt = useMemo(() => {
        const flap = findDrsFlap(scene);
        return flap ? createDrsTilt(flap, scene, { reduced: prefersReducedMotion() }) : null;
    }, [scene]);
    useLayoutEffect(() => () => tilt && tilt.restore(), [tilt]);
    useSignatureSection('#section-drs', {
        onIn: () => tilt && tilt.open(),
        onOut: () => tilt && tilt.close(),
    });
    return null;
}
