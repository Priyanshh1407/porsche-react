// Phase 7: attribution for the 3D models, as their Creative Commons licences require. The values
// come from each GLB's embedded metadata (asset.extras: title, author, license, source).
const CC_BY = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
const CC_BY_NC_SA = {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    note: 'Non-commercial use only; adaptations must be shared under the same licence.',
};

export const MODEL_CREDITS = [
    {
        title: '2024 Manthey Racing Porsche 911 GT3 RS', author: 'HYPR:IMPS 3D', authorUrl: 'https://sketchfab.com/HYPRIMPS3D',
        source: 'https://sketchfab.com/3d-models/2024-manthey-racing-porsche-911-gt3-rs-09ccead93fb34944bde812d4b4684eff', license: CC_BY,
    },
    {
        title: '2025 Porsche Taycan Turbo GT Weissach Package', author: 'Ddiaz Design', authorUrl: 'https://sketchfab.com/ddiaz-design',
        source: 'https://sketchfab.com/3d-models/2025-porsche-taycan-turbo-gt-weissach-package-4e1abafe7cf5413587a421377624ba08', license: CC_BY_NC_SA,
    },
    {
        title: '2022 Porsche Cayenne Turbo GT', author: 'Ddiaz Design', authorUrl: 'https://sketchfab.com/ddiaz-design',
        source: 'https://sketchfab.com/3d-models/2022-porsche-cayenne-turbo-gt-74fbea5a4dfc4197839fdd2bf654369a', license: CC_BY,
    },
    {
        title: 'Porsche 911 Turbo S', author: '3D Cars Studio', authorUrl: 'https://sketchfab.com/3DC_STUDIO',
        source: 'https://sketchfab.com/3d-models/porsche-911-turbo-s-081cf9a708bb4b8b8f14d55b56ffdfe9', license: CC_BY_NC_SA,
    },
    {
        title: '2014 - Porsche 918 Spyder (Rigged) | Mid-Poly', author: 'UniBlend', authorUrl: 'https://sketchfab.com/UniBlend',
        source: 'https://sketchfab.com/3d-models/2014-porsche-918-spyder-rigged-mid-poly-1d34d42ce58c48f49146346ff67e492d', license: CC_BY,
    },
];

export const DISCLAIMER = 'This is an independent, non-commercial portfolio project. It is not affiliated with, endorsed by or sponsored by Porsche AG. Porsche, the Porsche crest and the model names are trademarks of Dr. Ing. h.c. F. Porsche AG.';

export const PHOTO_NOTICE = 'Photographs on this site were collected from various sources and are used for demonstration purposes only. All rights remain with their respective owners; none are used commercially.';
