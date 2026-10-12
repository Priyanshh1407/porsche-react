import * as THREE from 'three';

// Phase 12: repainting a car WITHOUT touching the showrooms.
//
// useGLTF caches one scene per file, and the 3D showrooms render that same cached scene (and its
// materials). So the configurator never edits it: it renders a deep clone of the scene graph, and
// gives the clone's paint meshes their own copies of the paint materials. Geometry and every other
// material stay shared (no extra memory), the original paint materials are never written to.

/**
 * Returns { root, paints }: `root` is a clone of `scene` to render; `paints` are the cloned paint
 * materials (one per original paint material, shared by all meshes that used it).
 */
export function preparePaintableClone(scene, paintMaterialNames) {
    const names = new Set(paintMaterialNames);
    const root = scene.clone(true); // meshes cloned; geometry and materials still shared
    const copies = new Map(); // original material -> its copy
    root.traverse((node) => {
        if (!node.isMesh) return;
        const swap = (material) => {
            if (!material || !names.has(material.name)) return material;
            if (!copies.has(material)) copies.set(material, material.clone());
            return copies.get(material);
        };
        node.material = Array.isArray(node.material) ? node.material.map(swap) : swap(node.material);
    });
    return { root, paints: [...copies.values()] };
}

/** Applies a paint colour and finish (options.js) to the cloned paint materials. */
export function applyPaint(paints, paint, finish) {
    const color = new THREE.Color(paint.hex);
    for (const material of paints) {
        material.color.copy(color);
        material.metalness = paint.metallic ? 0.65 : 0.25;
        material.roughness = finish.roughness;
        if ('clearcoat' in material) {
            material.clearcoat = finish.clearcoat;
            material.clearcoatRoughness = finish.clearcoatRoughness;
        }
        // The GLB's own paint colour may come from a texture; the chosen colour must win.
        material.map = null;
        material.needsUpdate = true;
    }
}
