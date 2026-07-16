import React from 'react';
import { useParams } from 'react-router-dom';
import { modelRouteMap } from '.';

const ModelRouter = () => {
    const { modelName } = useParams();
    const decodedName = decodeURIComponent(modelName);

    const PageComponent = modelRouteMap[decodedName];

    if (!PageComponent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-[#1F1C2C] via-[#928DAB] to-[#2C5364] text-white">
                <h1 className="text-6xl font-extrabold mb-4">404</h1>
                <p className="text-2xl font-light">Model Not Found</p>
            </div>
        );
    }

    return PageComponent;
}

export default ModelRouter