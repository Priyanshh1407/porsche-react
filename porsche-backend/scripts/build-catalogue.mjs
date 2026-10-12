#!/usr/bin/env node
/*
 * Builds data/catalogue.json, the only model knowledge the AI concierge has (Phase 11), from the
 * frontend's own data: the model list (src/data/models.js), each model's `fullName` and `specs`
 * (src/data/modelsData/*.js) and the list prices of the /models page (src/pages/AllModels.jsx).
 * So the assistant can only quote what the site itself shows.
 *
 * The data files are parsed, never executed (they import images and contain JSX): string literals
 * are read from the syntax tree with the frontend's @babel/parser.
 *
 *   node scripts/build-catalogue.mjs           write data/catalogue.json
 *   node scripts/build-catalogue.mjs --check   exit 1 if it is out of date (also a Jest test)
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const BACKEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND_DATA = path.join(BACKEND, '..', 'porsche-react-master', 'src', 'data');
const ALL_MODELS_PAGE = path.join(FRONTEND_DATA, '..', 'pages', 'AllModels.jsx');
export const CATALOGUE_FILE = path.join(BACKEND, 'data', 'catalogue.json');

// slug (models.js) -> data file + the value the contact form stores (config/contactOptions.js).
const SOURCES = {
    '911-turbo-s': { file: 'turbos_911', contactValue: 'TurboS_911' },
    '718-cayman-gt4-rs': { file: 'cayman_gt4rs', contactValue: 'Cayman_GT4RS' },
    '718-boxster-s': { file: 'cayman_boxster', contactValue: '718_Boxster' },
    '911-gt3-rs': { file: 'gt3rs', contactValue: 'GT3RS' },
    '911-gt2-rs': { file: 'gt2rs_911', contactValue: 'GT2RS_911' },
    'carrera-gt': { file: 'carreraGT', contactValue: 'CarreraGT' },
    '918-spyder': { file: 'spyder_918', contactValue: 'Spyder_918' },
    cayenne: { file: 'cayenne', contactValue: 'Cayenne' },
    'macan-gts': { file: 'macan', contactValue: 'Macan' },
    taycan: { file: 'taycan', contactValue: 'Taycan' },
    panamera: { file: 'panamera', contactValue: 'Panamera' },
};
const SPEC_KEYS = ['engine', 'power', 'torque', 'transmission', 'topSpeed', 'acceleration'];

const parser = createRequire(path.join(FRONTEND_DATA, '..', '..', 'package.json'))('@babel/parser');
const parse = (file) => parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });

const keyOf = (prop) => prop.key?.name ?? prop.key?.value;
const stringProps = (objectNode) => Object.fromEntries((objectNode?.properties || [])
    .filter((p) => p.type === 'ObjectProperty' && p.value.type === 'StringLiteral')
    .map((p) => [keyOf(p), p.value.value]));
const prop = (objectNode, name) => objectNode?.properties.find((p) => p.type === 'ObjectProperty' && keyOf(p) === name)?.value;

/** The object literal of `export const <name> = { ... }`. */
function exportedObject(ast, name) {
    for (const node of ast.program.body) {
        const decl = node.type === 'ExportNamedDeclaration' ? node.declaration : null;
        const d = decl?.declarations?.find((x) => x.id.name === name);
        if (d) return d.init;
    }
    throw new Error(`export ${name} not found`);
}

/** The first `const <name> = [ ... ]` anywhere in the file (e.g. inside a component). */
function arrayNamed(node, name) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'VariableDeclarator' && node.id?.name === name && node.init?.type === 'ArrayExpression') return node.init;
    for (const value of Object.values(node)) {
        const found = Array.isArray(value) ? value.map((v) => arrayNamed(v, name)).find(Boolean) : arrayNamed(value, name);
        if (found) return found;
    }
    return null;
}

export function buildCatalogue() {
    // The /models page's cards: list price, and a second source of headline figures.
    const listed = new Map(arrayNamed(parse(ALL_MODELS_PAGE).program, 'models').elements
        .map((el) => stringProps(el)).map((card) => [card.name, card]));
    const modelsAst = parse(path.join(FRONTEND_DATA, 'models.js'));
    const models = exportedObject(modelsAst, 'MODELS').elements.map((el) => stringProps(el));
    return models.map((m) => {
        const source = SOURCES[m.slug];
        if (!source) throw new Error(`no catalogue source for model ${m.slug}: add it to SOURCES`);
        const data = exportedObject(parse(path.join(FRONTEND_DATA, 'modelsData', `${source.file}.js`)), source.file);
        const fullName = stringProps(data).fullName;
        const specs = stringProps(prop(data, 'specs'));
        // A data file copied from another model (its fullName names a different car) must not lend
        // that car's numbers: better "not listed" than a wrong answer.
        const trustworthy = Boolean(fullName) && fullName.toLowerCase().includes(m.name.toLowerCase());
        // Only an exact name match: the /models card "718 Cayman GT4" is a different car from the GT4 RS.
        const card = listed.get(m.name);
        const cardSpecs = card ? Object.fromEntries(['power', 'torque', 'acceleration', 'topSpeed']
            .filter((k) => card[k]).map((k) => [k, k === 'acceleration' ? `${card[k]} (0-100 km/h)` : card[k]])) : null;
        return {
            slug: m.slug,
            name: m.name,
            fullName: trustworthy ? fullName : `Porsche ${m.name}`,
            category: m.category,
            description: m.description,
            url: `/models/${m.slug}`,
            contactValue: source.contactValue,
            specs: trustworthy ? Object.fromEntries(SPEC_KEYS.filter((k) => specs[k]).map((k) => [k, specs[k]])) : cardSpecs,
            listPrice: card?.price || null,
        };
    });
}

export const serialise = (catalogue) => `${JSON.stringify(catalogue, null, 2)}\n`;

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
    const text = serialise(buildCatalogue());
    if (process.argv.includes('--check')) {
        const current = fs.existsSync(CATALOGUE_FILE) ? fs.readFileSync(CATALOGUE_FILE, 'utf8') : '';
        if (current.replace(/\r\n/g, '\n') !== text) {
            console.error('data/catalogue.json is out of date: run node scripts/build-catalogue.mjs');
            process.exit(1);
        }
        console.log('data/catalogue.json is up to date');
    } else {
        fs.mkdirSync(path.dirname(CATALOGUE_FILE), { recursive: true });
        fs.writeFileSync(CATALOGUE_FILE, text);
        console.log(`wrote ${path.relative(BACKEND, CATALOGUE_FILE)}`);
    }
}
