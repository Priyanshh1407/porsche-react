// Phase 12: the configurator repaints a CLONE of a car; the cached scene the 3D showrooms render
// must stay exactly as it was. Plus the URL <-> selection and the contact link.
import * as THREE from 'three';
import { preparePaintableClone, applyPaint } from './paint';
import { CARS, PAINTS, FINISHES, selectionFromParams, paramsFor, contactLinkFor, specLine } from './options';

function fakeCar() {
    const paint = new THREE.MeshPhysicalMaterial({ name: 'body_main', color: '#001133', roughness: 0.3 });
    const glass = new THREE.MeshPhysicalMaterial({ name: 'glass', color: '#ffffff' });
    const scene = new THREE.Group();
    const geometry = new THREE.BoxGeometry();
    const door = new THREE.Mesh(geometry, paint);
    const bonnet = new THREE.Mesh(geometry, paint);
    const window = new THREE.Mesh(geometry, glass);
    const multi = new THREE.Mesh(geometry, [paint, glass]);
    scene.add(door, bonnet, window, multi);
    return { scene, paint, glass, geometry };
}

test('the clone gets its own paint material; the original scene and materials are untouched', () => {
    const { scene, paint, glass, geometry } = fakeCar();
    const { root, paints } = preparePaintableClone(scene, ['body_main']);
    expect(paints).toHaveLength(1); // one copy, shared by every painted mesh
    applyPaint(paints, PAINTS.find((p) => p.id === 'lava-orange'), FINISHES.find((f) => f.id === 'matte'));

    // Original: same materials, same colour, same roughness.
    expect(scene.children.map((m) => m.material)).toEqual([paint, paint, glass, [paint, glass]]);
    expect(`#${paint.color.getHexString()}`).toBe('#001133');
    expect(paint.roughness).toBe(0.3);

    // Clone: painted, other materials and geometry shared (no extra memory).
    const [door, bonnet, window, multi] = root.children;
    expect(door.material).toBe(paints[0]);
    expect(bonnet.material).toBe(paints[0]);
    expect(door.material).not.toBe(paint);
    expect(`#${paints[0].color.getHexString()}`).toBe('#e4572e');
    expect(paints[0].roughness).toBe(0.78);
    expect(paints[0].clearcoat).toBe(0);
    expect(window.material).toBe(glass);
    expect(multi.material).toEqual([paints[0], glass]);
    expect(door.geometry).toBe(geometry);
});

test('gloss gives a strong clear coat, matte none', () => {
    const { scene } = fakeCar();
    const { paints } = preparePaintableClone(scene, ['body_main']);
    applyPaint(paints, PAINTS[0], FINISHES.find((f) => f.id === 'gloss'));
    expect(paints[0].clearcoat).toBe(1);
    expect(paints[0].roughness).toBeLessThan(0.25);
});

test('every car names at least one paint material and uses a contact-form value', () => {
    const contactValues = ['Taycan', 'Cayenne', 'TurboS_911', 'Spyder_918'];
    for (const car of CARS) {
        expect(car.paintMaterials.length).toBeGreaterThan(0);
        expect(contactValues).toContain(car.contactValue);
    }
    expect(CARS.map((c) => c.id)).not.toContain('911-gt3-rs'); // livery is a texture
});

test('the URL describes the selection, and unknown values fall back to the defaults', () => {
    const sel = selectionFromParams(new URLSearchParams('car=918-spyder&paint=shark-blue&finish=satin'));
    expect(paramsFor(sel)).toEqual({ car: '918-spyder', paint: 'shark-blue', finish: 'satin' });
    const fallback = selectionFromParams(new URLSearchParams('car=959&paint=<script>&finish=chrome'));
    expect(paramsFor(fallback)).toEqual({ car: CARS[0].id, paint: PAINTS[0].id, finish: FINISHES[0].id });
});

test('"Request this spec" links to the contact form with the model and a one-line spec', () => {
    const sel = selectionFromParams(new URLSearchParams('car=911-turbo-s&paint=gt-silver&finish=matte'));
    expect(specLine(sel)).toBe('911 Turbo S in GT Silver, matte finish');
    const url = new URL(contactLinkFor(sel), 'http://x');
    expect(url.pathname).toBe('/contact');
    expect(url.searchParams.get('model')).toBe('TurboS_911');
    expect(url.searchParams.get('spec')).toBe('911 Turbo S in GT Silver, matte finish');
});

test('the camera backs off on a narrow canvas so the whole car fits', () => {
    const { framingDistance } = require('./ConfiguratorViewer');
    expect(framingDistance(1.3)).toBeLessThan(framingDistance(0.8)); // phone portrait is further away
    expect(framingDistance(3)).toBe(6.2); // never closer than this
    expect(framingDistance(0.2)).toBe(14); // nor further
});
