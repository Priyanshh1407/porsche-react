#!/usr/bin/env node
/*
 * UPG-01 safety check: proves an optimized GLB is structurally identical to its original, so the
 * 3D choreography (which finds nodes and materials by name, and frames the car by its bounding
 * box) cannot notice the swap. Only texture pixels may differ.
 *
 * Compared, original vs candidate:
 *   - node count, and for every node: name, parent, exact translation/rotation/scale/matrix
 *   - which mesh each node draws, primitive count, draw mode, material NAME per primitive
 *   - the decoded data of every geometry accessor (positions, normals, UVs, indices, ...):
 *     SHA-256 of the values, so geometry must be byte-identical, not just similar
 *   - material names, scene roots, and the scene's world-space bounding box
 *
 *   node scripts/check-model-structure.mjs <original.glb> <candidate.glb>
 *   node scripts/check-model-structure.mjs --self-test <some.glb>   (must catch planted changes)
 *
 * Exit 0 = identical structure; 1 = differences (each one listed); 2 = usage/IO error.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const TYPED = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };

export function readGlb(buffer) {
    if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB file');
    let offset = 12;
    let json = null;
    let bin = null;
    while (offset < buffer.length) {
        const length = buffer.readUInt32LE(offset);
        const type = buffer.readUInt32LE(offset + 4);
        const data = buffer.subarray(offset + 8, offset + 8 + length);
        if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'));
        if (type === 0x004e4942) bin = data;
        offset += 8 + length;
    }
    return { json, bin };
}

// Decoded accessor values (handles interleaved bufferViews and sparse-free accessors).
function accessorValues({ json, bin }, index) {
    const acc = json.accessors[index];
    const Typed = TYPED[acc.componentType];
    const n = COMPONENTS[acc.type];
    const out = new Typed(acc.count * n);
    if (acc.bufferView === undefined) return out; // all zeros by spec
    const view = json.bufferViews[acc.bufferView];
    if (view.buffer !== 0) throw new Error('external buffers are not supported');
    const elementSize = Typed.BYTES_PER_ELEMENT * n;
    const stride = view.byteStride || elementSize;
    const base = (view.byteOffset || 0) + (acc.byteOffset || 0);
    const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const read = {
        5120: (o) => dv.getInt8(o), 5121: (o) => dv.getUint8(o), 5122: (o) => dv.getInt16(o, true),
        5123: (o) => dv.getUint16(o, true), 5125: (o) => dv.getUint32(o, true), 5126: (o) => dv.getFloat32(o, true),
    }[acc.componentType];
    for (let i = 0; i < acc.count; i++) {
        for (let c = 0; c < n; c++) out[i * n + c] = read(base + i * stride + c * Typed.BYTES_PER_ELEMENT);
    }
    if (acc.sparse) throw new Error('sparse accessors are not supported');
    return out;
}

const hashOf = (typed) => crypto.createHash('sha256').update(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength)).digest('hex').slice(0, 16);

// Column-major 4x4 helpers for the bounding box.
function localMatrix(node) {
    if (node.matrix) return node.matrix.slice();
    const [x, y, z, w] = node.rotation || [0, 0, 0, 1];
    const [sx, sy, sz] = node.scale || [1, 1, 1];
    const [tx, ty, tz] = node.translation || [0, 0, 0];
    return [
        (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
        2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
        2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
        tx, ty, tz, 1,
    ];
}
function multiply(a, b) {
    const o = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return o;
}

/** A plain, comparable description of everything the choreography could depend on. */
export function describe(glb) {
    const { json } = glb;
    const nodes = json.nodes || [];
    const parent = new Array(nodes.length).fill(-1);
    nodes.forEach((n, i) => (n.children || []).forEach((c) => { parent[c] = i; }));
    const materialName = (i) => (i === undefined ? '(default)' : (json.materials[i].name ?? `#${i}`));
    const accessorHash = new Map();
    const hashAccessor = (i) => {
        if (!accessorHash.has(i)) accessorHash.set(i, hashOf(accessorValues(glb, i)));
        return accessorHash.get(i);
    };

    const nodeInfo = nodes.map((n, i) => ({
        name: n.name ?? null,
        parent: parent[i],
        children: n.children || [],
        translation: n.translation || null,
        rotation: n.rotation || null,
        scale: n.scale || null,
        matrix: n.matrix || null,
        mesh: n.mesh === undefined ? null : {
            name: json.meshes[n.mesh].name ?? null,
            primitives: json.meshes[n.mesh].primitives.map((p) => ({
                mode: p.mode ?? 4,
                material: materialName(p.material),
                indices: p.indices === undefined ? null : hashAccessor(p.indices),
                attributes: Object.fromEntries(Object.keys(p.attributes).sort().map((k) => [k, hashAccessor(p.attributes[k])])),
                targets: (p.targets || []).map((t) => Object.fromEntries(Object.keys(t).sort().map((k) => [k, hashAccessor(t[k])]))),
            })),
        },
        skin: n.skin ?? null,
        camera: n.camera ?? null,
    }));

    // World-space bounding box from each primitive's POSITION min/max corners.
    const world = new Array(nodes.length);
    const worldOf = (i) => {
        if (!world[i]) world[i] = parent[i] === -1 ? localMatrix(nodes[i]) : multiply(worldOf(parent[i]), localMatrix(nodes[i]));
        return world[i];
    };
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    nodes.forEach((n, i) => {
        if (n.mesh === undefined) return;
        const m = worldOf(i);
        for (const p of json.meshes[n.mesh].primitives) {
            const acc = json.accessors[p.attributes.POSITION];
            if (!acc || !acc.min || !acc.max) continue;
            for (const cx of [acc.min[0], acc.max[0]]) for (const cy of [acc.min[1], acc.max[1]]) for (const cz of [acc.min[2], acc.max[2]]) {
                const v = [0, 1, 2].map((r) => m[r] * cx + m[4 + r] * cy + m[8 + r] * cz + m[12 + r]);
                v.forEach((value, k) => { min[k] = Math.min(min[k], value); max[k] = Math.max(max[k], value); });
            }
        }
    });

    return {
        scene: json.scene ?? 0,
        sceneRoots: (json.scenes || []).map((s) => s.nodes),
        nodes: nodeInfo,
        materials: (json.materials || []).map((m) => m.name ?? null),
        animations: (json.animations || []).map((a) => a.name ?? null),
        boundingBox: { min, max },
    };
}

/** Every difference between two descriptions, as readable lines (empty = identical). */
export function compare(a, b) {
    const problems = [];
    const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    if (a.nodes.length !== b.nodes.length) problems.push(`node count ${a.nodes.length} -> ${b.nodes.length}`);
    if (!same(a.sceneRoots, b.sceneRoots) || a.scene !== b.scene) problems.push('scene roots differ');
    if (!same(a.materials, b.materials)) problems.push('material names differ');
    if (!same(a.animations, b.animations)) problems.push('animations differ');
    const n = Math.min(a.nodes.length, b.nodes.length);
    for (let i = 0; i < n && problems.length < 50; i++) {
        const x = a.nodes[i];
        const y = b.nodes[i];
        const label = `node ${i} "${x.name}"`;
        for (const key of ['name', 'parent', 'children', 'skin', 'camera']) if (!same(x[key], y[key])) problems.push(`${label}: ${key} ${JSON.stringify(x[key])} -> ${JSON.stringify(y[key])}`);
        for (const key of ['translation', 'rotation', 'scale', 'matrix']) if (!same(x[key], y[key])) problems.push(`${label}: ${key} ${JSON.stringify(x[key])} -> ${JSON.stringify(y[key])}`);
        if (!same(x.mesh, y.mesh)) {
            if (!x.mesh || !y.mesh) problems.push(`${label}: mesh added/removed`);
            else if (x.mesh.name !== y.mesh.name) problems.push(`${label}: mesh name "${x.mesh.name}" -> "${y.mesh.name}"`);
            else if (x.mesh.primitives.length !== y.mesh.primitives.length) problems.push(`${label}: primitive count ${x.mesh.primitives.length} -> ${y.mesh.primitives.length}`);
            else x.mesh.primitives.forEach((p, k) => {
                const q = y.mesh.primitives[k];
                if (p.material !== q.material) problems.push(`${label} primitive ${k}: material "${p.material}" -> "${q.material}"`);
                if (p.mode !== q.mode) problems.push(`${label} primitive ${k}: draw mode ${p.mode} -> ${q.mode}`);
                if (p.indices !== q.indices) problems.push(`${label} primitive ${k}: index data changed`);
                if (!same(p.attributes, q.attributes)) problems.push(`${label} primitive ${k}: vertex data changed (${Object.keys(p.attributes).filter((key) => p.attributes[key] !== q.attributes[key]).join(', ') || 'attribute set'})`);
                if (!same(p.targets, q.targets)) problems.push(`${label} primitive ${k}: morph targets changed`);
            });
        }
    }
    if (!same(a.boundingBox, b.boundingBox)) problems.push(`scene bounding box ${JSON.stringify(a.boundingBox)} -> ${JSON.stringify(b.boundingBox)}`);
    return problems;
}

const load = (file) => readGlb(fs.readFileSync(file));
const fmt = (v) => v.map((x) => x.toFixed(4)).join(', ');

function check(originalFile, candidateFile) {
    const a = describe(load(originalFile));
    const b = describe(load(candidateFile));
    const problems = compare(a, b);
    const meshes = a.nodes.filter((n) => n.mesh).length;
    console.log(`${path.basename(originalFile)} -> ${path.basename(candidateFile)}`);
    console.log(`  ${a.nodes.length} nodes, ${meshes} with meshes, ${a.materials.length} materials; bbox min [${fmt(a.boundingBox.min)}] max [${fmt(a.boundingBox.max)}]`);
    if (problems.length) {
        for (const p of problems) console.log(`  DIFF ${p}`);
        console.log(`  FAIL: ${problems.length}${problems.length >= 50 ? '+' : ''} structural difference(s)`);
    } else {
        console.log('  OK: identical node names, hierarchy, transforms, materials, geometry bytes and bounding box');
    }
    return problems.length === 0;
}

// Plants one change at a time in an in-memory copy and requires compare() to catch each.
function selfTest(file) {
    const original = load(file);
    const base = describe(original);
    const clone = () => ({ json: structuredClone(original.json), bin: Buffer.from(original.bin) });
    const meshNode = original.json.nodes.findIndex((n) => n.mesh !== undefined);
    const anyNode = original.json.nodes.findIndex((n) => n.name);
    const cases = {
        'identical copy passes': [(g) => g, false],
        'a node moved 0.001': [(g) => { const n = g.json.nodes[meshNode]; if (n.matrix) n.matrix[12] += 0.001; else n.translation = (n.translation || [0, 0, 0]).map((v, k) => (k === 0 ? v + 0.001 : v)); return g; }, true],
        'a node renamed': [(g) => { g.json.nodes[anyNode].name += '_x'; return g; }, true],
        'a node re-parented': [(g) => { const root = g.json.scenes[0].nodes[0]; const p = g.json.nodes.findIndex((n) => (n.children || []).length > 1); if (p === -1) return null; const child = g.json.nodes[p].children.pop(); (g.json.nodes[root].children ||= []).push(child); return g; }, true],
        'one vertex nudged in the binary': [(g) => { const prim = g.json.meshes[g.json.nodes[meshNode].mesh].primitives[0]; const acc = g.json.accessors[prim.attributes.POSITION]; const view = g.json.bufferViews[acc.bufferView]; const o = (view.byteOffset || 0) + (acc.byteOffset || 0); g.bin.writeFloatLE(g.bin.readFloatLE(o) + 0.0001, o); return g; }, true],
        'a material renamed': [(g) => { g.json.materials[0].name = `${g.json.materials[0].name}_x`; return g; }, true],
        'only an image changed (allowed)': [(g) => { g.json.images = g.json.images || []; if (g.json.images[0]) g.json.images[0].mimeType = 'image/webp'; return g; }, false],
    };
    let ok = true;
    for (const [name, [mutate, shouldFail]] of Object.entries(cases)) {
        const g = mutate(clone());
        if (!g) { console.log(`  skip  ${name} (model has no suitable node)`); continue; }
        const problems = compare(base, describe(g));
        const failed = problems.length > 0;
        const pass = failed === shouldFail;
        ok &&= pass;
        console.log(`  ${pass ? 'ok   ' : 'WRONG'} ${name}: ${failed ? `caught (${problems[0]})` : 'no differences'}`);
    }
    console.log(ok ? 'Self-test OK: every planted change was caught; the untouched copies passed.' : 'Self-test FAILED');
    return ok;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (isMain) {
    const args = process.argv.slice(2);
    try {
        if (args[0] === '--self-test' && args[1]) process.exit(selfTest(args[1]) ? 0 : 1);
        if (args.length !== 2) {
            console.error('usage: check-model-structure.mjs <original.glb> <candidate.glb> | --self-test <file.glb>');
            process.exit(2);
        }
        process.exit(check(args[0], args[1]) ? 0 : 1);
    } catch (err) {
        console.error(`error: ${err.message}`);
        process.exit(2);
    }
}
