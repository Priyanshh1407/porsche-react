#!/usr/bin/env node
/*
 * UPG-01: texture-only compression for the 3D models. Re-encodes the images embedded in a GLB as
 * WebP (EXT_texture_webp) and changes NOTHING else.
 *
 * Why not gltf-transform: it rewrites the whole document. In particular it converts every node
 * `matrix` into translation/rotation/scale (271 of the GT3 RS's 549 nodes use a matrix), which
 * check-model-structure rightly rejects. This script edits the GLB directly instead: the JSON keeps
 * every node, matrix, accessor and material exactly as parsed; only image bytes, the image
 * bufferViews' offsets/lengths, the images' mimeType and the textures' source references change.
 *
 * Colour/other maps -> lossy WebP (quality 85, alpha kept at full quality).
 * Normal maps       -> LOSSLESS WebP (lossy compression shows up as shading artifacts).
 * No resizing. An image is kept as-is if WebP would not be smaller, or if it is a 16-bit PNG.
 *
 *   node scripts/optimize-models.mjs              (writes public/<name>.webp.glb next to the original)
 *   node scripts/optimize-models.mjs --dry-run    (report only)
 * Then: node scripts/check-model-structure.mjs <original> <optimized>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { readGlb } from './check-model-structure.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Developer decision (Phase 5): only the GT3 RS. Its textures are 52% of the file; the other four
// cars are 80-92% geometry, which the trajectory rule forbids compressing.
const MODELS = ['public/2024_manthey_racing_porsche_911_gt3_rs.glb'];
const LOSSY = { quality: 85, alphaQuality: 100, effort: 6 };
const LOSSLESS = { lossless: true, effort: 6 };
const WEBP = 'EXT_texture_webp';

const dryRun = process.argv.includes('--dry-run');
const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const align4 = (n) => (n + 3) & ~3;

// Images referenced (via a texture) from any material property whose name mentions "normal"
// (normalTexture, clearcoatNormalTexture, ...).
function normalMapImages(json) {
    const images = new Set();
    const walk = (value, key) => {
        if (!value || typeof value !== 'object') return;
        if (/normal/i.test(key || '') && Number.isInteger(value.index)) {
            const texture = json.textures[value.index];
            if (texture && Number.isInteger(texture.source)) images.add(texture.source);
        }
        for (const [k, v] of Object.entries(value)) walk(v, k);
    };
    (json.materials || []).forEach((m) => walk(m, ''));
    return images;
}

function writeGlb(json, bin) {
    const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
    const jsonChunk = Buffer.concat([jsonBytes, Buffer.alloc(align4(jsonBytes.length) - jsonBytes.length, 0x20)]);
    const binChunk = Buffer.concat([bin, Buffer.alloc(align4(bin.length) - bin.length, 0)]);
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546c67, 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
    const chunkHeader = (length, type) => { const h = Buffer.alloc(8); h.writeUInt32LE(length, 0); h.writeUInt32LE(type, 4); return h; };
    return Buffer.concat([header, chunkHeader(jsonChunk.length, 0x4e4f534a), jsonChunk, chunkHeader(binChunk.length, 0x004e4942), binChunk]);
}

async function optimize(relPath) {
    const input = path.join(ROOT, relPath);
    const output = input.replace(/\.glb$/, '.webp.glb');
    const { json, bin } = readGlb(fs.readFileSync(input));
    const normals = normalMapImages(json);

    const imageViews = new Map(); // bufferView index -> image index
    (json.images || []).forEach((image, i) => { if (Number.isInteger(image.bufferView)) imageViews.set(image.bufferView, i); });
    // An image's bufferView must not also feed geometry, or re-encoding it would corrupt that data.
    for (const accessor of json.accessors || []) {
        if (imageViews.has(accessor.bufferView)) throw new Error(`bufferView ${accessor.bufferView} is shared by an image and an accessor`);
    }

    const replaced = new Map(); // image index -> webp bytes
    let before = 0;
    let after = 0;
    for (const [view, i] of imageViews) {
        const v = json.bufferViews[view];
        const original = bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
        const meta = await sharp(original).metadata();
        const normal = normals.has(i);
        const mode = normal ? 'lossless' : 'lossy q85';
        before += original.length;
        if (meta.depth && meta.depth !== 'uchar') {
            after += original.length;
            console.log(`  keep  image ${i} ${meta.width}x${meta.height} ${meta.format} (${meta.depth}: WebP is 8-bit only)`);
            continue;
        }
        const webp = await sharp(original).webp(normal ? LOSSLESS : LOSSY).toBuffer();
        if (webp.length >= original.length) {
            after += original.length;
            console.log(`  keep  image ${i} ${meta.width}x${meta.height} ${meta.format} ${kb(original.length)} (WebP ${mode} would be ${kb(webp.length)})`);
            continue;
        }
        replaced.set(i, webp);
        after += webp.length;
        console.log(`  webp  image ${i} ${meta.width}x${meta.height} ${normal ? 'normal map' : 'colour/other'}: ${kb(original.length)} -> ${kb(webp.length)} (${mode})`);
    }

    // Rebuild the binary chunk in bufferView order: unchanged views are copied byte-for-byte.
    const parts = [];
    let offset = 0;
    json.bufferViews.forEach((v, index) => {
        const image = imageViews.get(index);
        const data = image !== undefined && replaced.has(image)
            ? replaced.get(image)
            : bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
        const padded = align4(offset) - offset;
        if (padded) { parts.push(Buffer.alloc(padded)); offset += padded; }
        v.byteOffset = offset;
        v.byteLength = data.length;
        parts.push(data);
        offset += data.length;
    });
    const newBin = Buffer.concat(parts);
    json.buffers[0].byteLength = newBin.length;

    for (const i of replaced.keys()) json.images[i].mimeType = 'image/webp';
    for (const texture of json.textures || []) {
        if (!replaced.has(texture.source)) continue;
        texture.extensions = { ...(texture.extensions || {}), [WEBP]: { source: texture.source } };
        delete texture.source; // core glTF only allows PNG/JPEG in `source`
    }
    if (replaced.size) {
        json.extensionsUsed = [...new Set([...(json.extensionsUsed || []), WEBP])];
        json.extensionsRequired = [...new Set([...(json.extensionsRequired || []), WEBP])];
    }

    const glb = writeGlb(json, newBin);
    const inputSize = fs.statSync(input).size;
    console.log(`  textures ${mb(before)} -> ${mb(after)}; file ${mb(inputSize)} -> ${mb(glb.length)} (${(100 * (1 - glb.length / inputSize)).toFixed(0)}% smaller)`);
    if (!dryRun) {
        fs.writeFileSync(output, glb);
        console.log(`  wrote ${path.relative(ROOT, output)}`);
    }
}

for (const model of MODELS) {
    console.log(path.basename(model));
    await optimize(model);
}
