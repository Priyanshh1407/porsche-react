import React, { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findModel, findModelForDetails, modelDetailsPath, modelPath } from './models';
import { MODEL_PAGES } from './modelPages';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-[#1F1C2C] via-[#928DAB] to-[#2C5364] text-white">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-2xl font-light">Model Not Found</p>
    </div>
);

// /models/:modelSlug. Old URLs (display names like "911 GT3 RS", other casing, old navbar
// slugs) redirect to the canonical slug, so existing links and bookmarks keep working.
const ModelRouter = () => {
    const { modelSlug } = useParams();
    const model = findModel(modelSlug);
    if (!model) return <NotFound />;
    if (modelSlug !== model.slug) return <Navigate to={modelPath(model.slug)} replace />;

    const { Page } = MODEL_PAGES[model.slug];
    // The 3D showrooms are lazy-loaded (PERF-01); a black screen matches their dark background
    // for the moment their code chunk is downloading.
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Page />
        </Suspense>
    );
};

// /models/:modelSlug/details. The 3D showrooms link to old detail URLs such as
// /models/gt3rs/details; those files are protected, so the old URLs redirect here.
export const ModelDetailsRouter = () => {
    const { modelSlug } = useParams();
    const model = findModelForDetails(modelSlug);
    const Details = model && MODEL_PAGES[model.slug].Details;
    if (!Details) return <NotFound />;
    if (modelSlug !== model.slug) return <Navigate to={modelDetailsPath(model.slug)} replace />;

    return <Details />;
};

export default ModelRouter;
