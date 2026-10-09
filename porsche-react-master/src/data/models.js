// Single source of truth for model URLs (BUG-03).
//
// Before this, three naming schemes disagreed: navbar slugs (/models/911-gt3-rs), display
// names with spaces (/models/911 GT3 RS) and hard-coded routes in App.js, so 9 of 11 navbar
// links rendered "Model Not Found". Every link to a model page is now built from this list.
//
// Plain data only (no page imports): Navbar/Home/AllModels import this file, and several pages
// import Navbar, so importing pages here would create a circular import. The slug -> page
// component mapping lives in modelPages.js and is used only by the router.

export const CATEGORY_ORDER = ['Sports Cars', 'GT Cars', 'Supercars', 'SUVs', 'Electric', 'Sedans'];

export const MODELS = [
    {
        slug: '911-turbo-s', name: '911 Turbo S', category: 'Sports Cars',
        description: 'Everyday supercar',
        legacyNames: ['911 Turbo S'], legacyDetailsSlugs: ['911 turbo s'],
    },
    {
        slug: '718-cayman-gt4-rs', name: '718 Cayman GT4 RS', category: 'Sports Cars',
        description: 'Mid-engine coupe',
        legacyNames: ['718 Cayman GT4', '718-cayman'],
    },
    {
        slug: '718-boxster-s', name: '718 Boxster S', category: 'Sports Cars',
        description: 'Convertible roadster',
        legacyNames: ['718 Boxster S', '718-boxster'],
    },
    {
        slug: '911-gt3-rs', name: '911 GT3 RS', category: 'GT Cars',
        description: 'Ultimate track weapon',
        legacyNames: ['911 GT3 RS'], legacyDetailsSlugs: ['gt3rs'],
    },
    {
        slug: '911-gt2-rs', name: '911 GT2 RS', category: 'GT Cars',
        description: 'Most powerful 911',
        legacyNames: ['911 GT2 RS'],
    },
    {
        slug: 'carrera-gt', name: 'Carrera GT', category: 'Supercars',
        description: 'Analog V10 icon',
        legacyNames: ['Carrera GT'],
    },
    {
        slug: '918-spyder', name: '918 Spyder', category: 'Supercars',
        description: 'Hybrid hypercar',
        legacyNames: ['918 Spyder'], legacyDetailsSlugs: ['918 spyder'],
    },
    {
        slug: 'cayenne', name: 'Cayenne', category: 'SUVs',
        description: 'Full-size luxury SUV',
        legacyNames: ['Cayenne'],
    },
    {
        slug: 'macan-gts', name: 'Macan GTS', category: 'SUVs',
        description: 'Compact luxury SUV',
        legacyNames: ['Macan GTS', 'macan'],
    },
    {
        slug: 'taycan', name: 'Taycan', category: 'Electric',
        description: 'Pure electric performance',
        legacyNames: ['Taycan'],
    },
    {
        slug: 'panamera', name: 'Panamera', category: 'Sedans',
        description: 'Luxury sports sedan',
        legacyNames: ['Panamera'],
    },
];

const normalize = (value) => decodeURIComponent(String(value)).trim().toLowerCase();

/** Canonical URL of a model page. */
export const modelPath = (slug) => `/models/${slug}`;

/** Canonical URL of a model's detail page (only some models have one). */
export const modelDetailsPath = (slug) => `/models/${slug}/details`;

/** Finds a model by its slug or any old name/URL segment (case-insensitive). */
export function findModel(segment) {
    const key = normalize(segment);
    return MODELS.find((m) => m.slug === key || m.legacyNames.some((n) => normalize(n) === key)) || null;
}

/** Finds a model by a details-page URL segment, old or new. */
export function findModelForDetails(segment) {
    const key = normalize(segment);
    return MODELS.find((m) => m.slug === key || (m.legacyDetailsSlugs || []).some((s) => normalize(s) === key)) || null;
}

/** URL for a display name such as "911 GT3 RS"; throws on unknown names so typos fail loudly in tests. */
export function pathForName(name) {
    const model = MODELS.find((m) => m.name === name) || findModel(name);
    if (!model) throw new Error(`Unknown model name: ${name}`);
    return modelPath(model.slug);
}

/** Navbar groups in display order: [{ category, models: [{ name, description, route }] }]. */
export const navbarModelGroups = () =>
    CATEGORY_ORDER.map((category) => ({
        category,
        models: MODELS.filter((m) => m.category === category).map((m) => ({
            name: m.name,
            description: m.description,
            route: modelPath(m.slug),
        })),
    })).filter((group) => group.models.length > 0);
