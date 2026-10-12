// Phase 12: what the configurator offers. Plain data (no three.js), so the contact page and tests
// can use it without loading the 3D code.
//
// Cars: the four showroom models whose body paint is a plain material (found by scanning each GLB:
// node scripts listed in FIX_LOG). The GT3 RS is not offered: its paint carries the Manthey Racing
// livery as a texture, so a colour change would tint the livery, not repaint the car.
export const CARS = [
    {
        id: 'taycan', name: 'Taycan Turbo GT', contactValue: 'Taycan', modelSlug: 'taycan',
        model: '/2025_porsche_taycan_turbo_gt_weissach_package.glb',
        paintMaterials: ['porschePorsche_TaycanTurboGTReward_2025Paint_Material1'],
    },
    {
        id: 'cayenne', name: 'Cayenne Turbo GT', contactValue: 'Cayenne', modelSlug: 'cayenne',
        model: '/2022_porsche_cayenne_turbo_gt.glb',
        paintMaterials: ['Porsche_CayenneTurboGTRewardRecycled_2022Paint_Material'],
    },
    {
        id: '911-turbo-s', name: '911 Turbo S', contactValue: 'TurboS_911', modelSlug: '911-turbo-s',
        model: '/porsche_911_turbo_s.glb',
        paintMaterials: ['body_main'],
    },
    {
        id: '918-spyder', name: '918 Spyder', contactValue: 'Spyder_918', modelSlug: '918-spyder',
        model: '/porsche-918-spyder-2015/source/source/2014_-_porsche_918_spyder_rigged__mid-poly.glb',
        paintMaterials: ['Body_Paint_-_GT_Silver_Metalic'],
    },
];

// Colours named in the style of Porsche's palette (approximations for a demo, not official codes).
export const PAINTS = [
    { id: 'guards-red', name: 'Guards Red', hex: '#b5121b', metallic: false },
    { id: 'carrara-white', name: 'Carrara White', hex: '#e9e8e3', metallic: true },
    { id: 'jet-black', name: 'Jet Black', hex: '#0d0e10', metallic: true },
    { id: 'gt-silver', name: 'GT Silver', hex: '#a7abae', metallic: true },
    { id: 'gentian-blue', name: 'Gentian Blue', hex: '#1d2f5e', metallic: true },
    { id: 'shark-blue', name: 'Shark Blue', hex: '#1659b5', metallic: false },
    { id: 'python-green', name: 'Python Green', hex: '#3f9c35', metallic: false },
    { id: 'lava-orange', name: 'Lava Orange', hex: '#e4572e', metallic: false },
];

// Finish = how the clear coat reads: roughness of the paint and strength of the clear coat.
export const FINISHES = [
    { id: 'gloss', name: 'Gloss', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03 },
    { id: 'satin', name: 'Satin', roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 },
    { id: 'matte', name: 'Matte', roughness: 0.78, clearcoat: 0, clearcoatRoughness: 1 },
];

const find = (list, id, fallback) => list.find((x) => x.id === id) || fallback;

/** The selection a URL describes (?car=&paint=&finish=); unknown values fall back to defaults. */
export function selectionFromParams(params) {
    return {
        car: find(CARS, params.get('car'), CARS[0]),
        paint: find(PAINTS, params.get('paint'), PAINTS[0]),
        finish: find(FINISHES, params.get('finish'), FINISHES[0]),
    };
}

export const paramsFor = ({ car, paint, finish }) => ({ car: car.id, paint: paint.id, finish: finish.id });

/** One line describing the build, as sent to the contact form ("Request this spec"). */
export const specLine = ({ car, paint, finish }) => `${car.name} in ${paint.name}, ${finish.name.toLowerCase()} finish`;

/** /contact link that pre-fills the model and the message. */
export function contactLinkFor(selection) {
    const q = new URLSearchParams({ model: selection.car.contactValue, spec: specLine(selection) });
    return `/contact?${q}`;
}
