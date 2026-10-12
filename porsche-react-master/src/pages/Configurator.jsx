import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import { carThemes } from '../data/carThemes';
import { modelPath } from '../data/models';
import { CARS, FINISHES, PAINTS, contactLinkFor, paramsFor, selectionFromParams, specLine } from '../components/configurator/options';

// Phase 12: a working 3D configurator (it used to be a "Coming soon" page). Pick a car, a paint and
// a finish; orbit the car; send the build to the sales team through the contact form. The choice
// lives in the URL (?car=&paint=&finish=), so a build can be shared or bookmarked.
// The three.js view is its own chunk, and only the selected car's model is downloaded.
const ConfiguratorViewer = lazy(() => import('../components/configurator/ConfiguratorViewer'));

const Group = ({ title, children }) => (
    <fieldset className="mb-6">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{title}</legend>
        {children}
    </fieldset>
);

const Configurator = () => {
    const [params, setParams] = useSearchParams();
    const selection = selectionFromParams(params);
    const { car, paint, finish } = selection;
    // Each choice builds on the latest one, not on this render's URL: two clicks before a re-render
    // must not undo each other (React Router's functional update also sees this render's params).
    const latest = useRef(params);
    latest.current = params;
    const choose = (change) => {
        const next = new URLSearchParams({ ...paramsFor(selectionFromParams(latest.current)), ...change });
        latest.current = next;
        setParams(next, { replace: true });
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar theme={carThemes.home} />
            <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 pt-28 lg:grid-cols-[1fr_360px] lg:px-8">
                <section aria-label="3D view" className="relative h-[52vh] min-h-[320px] overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,_#2a2a2e_0%,_#09090b_70%)] lg:h-[72vh]">
                    <Suspense fallback={<div className="flex h-full items-center justify-center text-xs tracking-[0.4em] text-red-300">LOADING</div>}>
                        <ConfiguratorViewer car={car} paint={paint} finish={finish} />
                    </Suspense>
                    <p className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1 text-xs text-white/50">
                        <RotateCcw className="h-3 w-3" aria-hidden="true" /> Drag to orbit · scroll to zoom
                    </p>
                </section>

                <aside className="rounded-2xl bg-neutral-950 p-6 ring-1 ring-white/10">
                    <h1 className="text-3xl font-light">Configurator</h1>
                    <p className="mb-6 mt-1 text-sm text-white/60" aria-live="polite">{specLine(selection)}</p>

                    <Group title="Model">
                        <div className="grid grid-cols-2 gap-2">
                            {CARS.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    aria-pressed={c.id === car.id}
                                    onClick={() => choose({ car: c.id })}
                                    className={`rounded-lg px-3 py-2 text-left text-sm ring-1 transition ${c.id === car.id ? 'bg-white text-black ring-white' : 'ring-white/15 hover:ring-white/40'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </Group>

                    <Group title={`Paint · ${paint.name}`}>
                        <div className="flex flex-wrap gap-3">
                            {PAINTS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    aria-label={p.name}
                                    aria-pressed={p.id === paint.id}
                                    title={p.name}
                                    onClick={() => choose({ paint: p.id })}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-neutral-950 transition ${p.id === paint.id ? 'ring-white' : 'ring-white/15 hover:ring-white/40'}`}
                                    style={{ background: p.hex }}
                                >
                                    {p.id === paint.id && <Check className={`h-4 w-4 ${p.id === 'carrara-white' || p.id === 'gt-silver' ? 'text-black' : 'text-white'}`} aria-hidden="true" />}
                                </button>
                            ))}
                        </div>
                    </Group>

                    <Group title="Finish">
                        <div className="grid grid-cols-3 gap-2">
                            {FINISHES.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    aria-pressed={f.id === finish.id}
                                    onClick={() => choose({ finish: f.id })}
                                    className={`rounded-lg px-3 py-2 text-sm ring-1 transition ${f.id === finish.id ? 'bg-white text-black ring-white' : 'ring-white/15 hover:ring-white/40'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </Group>

                    <Link to={contactLinkFor(selection)} className="block rounded-lg bg-red-700 px-4 py-3 text-center font-medium hover:bg-red-600">
                        Request this spec
                    </Link>
                    <Link to={modelPath(car.modelSlug)} className="mt-3 block text-center text-sm text-white/60 underline-offset-2 hover:text-white hover:underline">
                        Explore the {car.name} showroom
                    </Link>
                    <p className="mt-6 text-xs text-white/40">
                        Colours are approximations for this demo. The GT3 RS is not offered: its paint is a racing livery.
                    </p>
                </aside>
            </main>
        </div>
    );
};

export default Configurator;
