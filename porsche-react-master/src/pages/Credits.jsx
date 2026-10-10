import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';
import { MODEL_CREDITS, DISCLAIMER, PHOTO_NOTICE } from '../data/credits';

// Phase 7: model attribution (required by each model's Creative Commons licence) and disclaimers.
const linkClass = 'text-red-400 hover:text-red-300 underline underline-offset-2';

const Credits = () => {
    const theme = carThemes.home;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar theme={theme} />
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-light mb-4">Credits</h1>
                <p className="text-gray-400 mb-12">{DISCLAIMER}</p>

                <h2 className="text-2xl font-light mb-6">3D models</h2>
                <ul className="space-y-6 mb-12">
                    {MODEL_CREDITS.map((model, i) => (
                        <li key={model.source} aria-labelledby={`model-credit-${i}`} className="border border-slate-800 rounded-lg p-5">
                            <h3 id={`model-credit-${i}`} className="text-lg font-medium">{model.title}</h3>
                            <p className="text-gray-300 mt-1">
                                by <a href={model.authorUrl} className={linkClass} target="_blank" rel="noopener noreferrer">{model.author}</a>
                                {' · '}licensed under{' '}
                                <a href={model.license.url} className={linkClass} target="_blank" rel="noopener noreferrer">{model.license.name}</a>
                                {' · '}
                                <a href={model.source} className={linkClass} target="_blank" rel="noopener noreferrer">View on Sketchfab</a>
                            </p>
                            {model.license.note && <p className="text-amber-300 text-sm mt-2">{model.license.note}</p>}
                        </li>
                    ))}
                </ul>

                <h2 className="text-2xl font-light mb-4">Photographs</h2>
                <p className="text-gray-400">{PHOTO_NOTICE}</p>
            </main>
            <Footer theme={theme} />
        </div>
    );
};

export default Credits;
