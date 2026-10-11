// GT3 RS DRS: the wing blade turns about its own centre (pivot fixed), then returns exactly.
import { BoxGeometry, Box3, Group, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three';
import { findDrsFlap, createDrsTilt, DRS_OPEN_DEG } from './Gt3DrsWing';

// A model shaped like the GLB: root rotated (Sketchfab's Z-up fix), a translated/rotated parent,
// and a blade whose geometry sits off its node origin, as exported.
function model() {
    const scene = new Group();
    const root = new Group();
    root.rotation.x = -Math.PI / 2;
    const parent = new Group();
    parent.position.set(0.2, -0.4, 0.9);
    parent.rotation.z = 0.3;
    const blade = new Mesh(new BoxGeometry(1.7, 0.07, 0.15).translate(0.1, 1.3, -2.2), new MeshBasicMaterial());
    blade.name = 'Object_48';
    const other = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
    other.name = 'Object_38';
    scene.add(root);
    root.add(parent);
    parent.add(blade, other);
    scene.updateMatrixWorld(true);
    return { scene, blade };
}

const centre = (obj) => { obj.updateWorldMatrix(true, false); return new Box3().setFromObject(obj).getCenter(new Vector3()); };
const sceneQuat = (obj) => { obj.updateWorldMatrix(true, false); return new Quaternion().setFromRotationMatrix(obj.matrixWorld); };

test('finds the wing blade by its node name, or nothing if the model has none', () => {
    const { scene, blade } = model();
    expect(findDrsFlap(scene)).toBe(blade);
    expect(findDrsFlap(new Group())).toBeNull();
});

test('open turns the blade about its own centre and around the car\'s width; close returns it exactly', () => {
    const { scene, blade } = model();
    const p0 = blade.position.clone();
    const q0 = blade.quaternion.clone();
    const c0 = centre(blade);
    const w0 = sceneQuat(blade);
    const tilt = createDrsTilt(blade, scene);

    tilt.open().progress(1);
    expect(centre(blade).distanceTo(c0)).toBeLessThan(1e-6); // pivot stays put: no drift off the swan necks
    const expected = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), (DRS_OPEN_DEG * Math.PI) / 180).multiply(w0);
    expect(sceneQuat(blade).angleTo(expected)).toBeLessThan(1e-6); // a pure tilt about the car's X (width)
    expect(blade.position.equals(p0)).toBe(false);

    tilt.close().progress(1);
    expect(blade.position.distanceTo(p0)).toBeLessThan(1e-9);
    expect(blade.quaternion.angleTo(q0)).toBeLessThan(1e-9);
});

test('restore() mid-move puts back the exact original pose (the GLB scene is cached and shared)', () => {
    const { scene, blade } = model();
    const p0 = blade.position.clone();
    const q0 = blade.quaternion.clone();
    const tilt = createDrsTilt(blade, scene);
    tilt.open().progress(0.4);
    tilt.restore();
    expect(blade.position.equals(p0)).toBe(true);
    expect(blade.quaternion.equals(q0)).toBe(true);
});

test('reduced motion: the wing still opens and closes, but without animating', () => {
    const { scene, blade } = model();
    const tilt = createDrsTilt(blade, scene, { reduced: true });
    expect(tilt.open().duration()).toBe(0);
    expect(tilt.close().duration()).toBe(0);
    expect(tilt.open().delay()).toBe(0);
});
