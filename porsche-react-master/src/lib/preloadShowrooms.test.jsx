// Background model preloading on Home and All Models (developer decision, 2026-10-11).
import fs from 'fs';
import path from 'path';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as preload from './preloadShowrooms';

// The module remembers that it already started; each test starts fresh.
const load = () => { preload.resetShowroomPreloadForTests(); return preload; };
const dreiPreload = () => require('@react-three/drei').useGLTF.preload;

afterEach(() => {
    jest.restoreAllMocks();
    delete navigator.connection;
});

test('preloads exactly the models the five showrooms load (paths read from the viewers, never edited)', () => {
    const viewers = ['ModelViewer3D', 'TurboViewer3D', 'TaycanViewer3D', 'CayenneViewer3D', 'SpyderViewer3D'];
    const used = viewers.map((v) => {
        const src = fs.readFileSync(path.join(__dirname, '..', 'components', `${v}.jsx`), 'utf8');
        return src.match(/useGLTF\('([^']+\.glb)'\)/)[1];
    });
    expect(load().SHOWROOM_MODELS).toEqual(used);
});

test.each(['/', '/models'])('on %s it preloads all five models', async (route) => {
    const spy = jest.spyOn(require('@react-three/drei').useGLTF, 'preload').mockResolvedValue(undefined);
    const { ShowroomPreloader, SHOWROOM_MODELS } = load();
    render(<MemoryRouter initialEntries={[route]}><ShowroomPreloader /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(5), { timeout: 4000 });
    expect(spy.mock.calls.map((c) => c[0])).toEqual(SHOWROOM_MODELS);
});

test('other pages stay light: nothing is preloaded on /contact', async () => {
    const spy = jest.spyOn(require('@react-three/drei').useGLTF, 'preload');
    const { ShowroomPreloader } = load();
    render(<MemoryRouter initialEntries={['/contact']}><ShowroomPreloader /></MemoryRouter>);
    await new Promise((r) => setTimeout(r, 2000));
    expect(spy).not.toHaveBeenCalled();
});

test.each([
    ['Save-Data is on', { saveData: true, effectiveType: '4g' }],
    ['the connection is slow', { saveData: false, effectiveType: '3g' }],
])('skips preloading when %s', async (_, connection) => {
    navigator.connection = connection;
    const spy = jest.spyOn(require('@react-three/drei').useGLTF, 'preload');
    const { ShowroomPreloader } = load();
    render(<MemoryRouter initialEntries={['/']}><ShowroomPreloader /></MemoryRouter>);
    await new Promise((r) => setTimeout(r, 2000));
    expect(spy).not.toHaveBeenCalled();
});

test('runs once per visit, even when both pages are opened', async () => {
    const spy = jest.spyOn(require('@react-three/drei').useGLTF, 'preload').mockResolvedValue(undefined);
    const { ShowroomPreloader } = load();
    const { unmount } = render(<MemoryRouter initialEntries={['/']}><ShowroomPreloader /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(5), { timeout: 4000 });
    unmount();
    render(<MemoryRouter initialEntries={['/models']}><ShowroomPreloader /></MemoryRouter>);
    await new Promise((r) => setTimeout(r, 2000));
    expect(spy).toHaveBeenCalledTimes(5);
    expect(dreiPreload()).toBe(spy);
});
