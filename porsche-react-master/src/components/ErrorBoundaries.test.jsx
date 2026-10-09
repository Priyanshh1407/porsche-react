// ERR-01: a 3D failure shows the car's photo; any page crash shows a recovery screen.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShowroomErrorBoundary from './ShowroomErrorBoundary';
import RouteErrorBoundary from './RouteErrorBoundary';

const Boom = () => { throw new Error('Could not load /model.glb'); };
const Ok = () => <div>3D canvas</div>;


const withWebGL = (available) => {
    window.WebGLRenderingContext = available ? function WebGLRenderingContext() {} : undefined;
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(available ? {} : null);
};

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // React logs caught errors
});
afterEach(() => {
    jest.restoreAllMocks();
    delete window.WebGLRenderingContext;
});

describe('ShowroomErrorBoundary', () => {
    test('renders the canvas when WebGL works and nothing fails', () => {
        withWebGL(true);
        render(<ShowroomErrorBoundary fallbackImage="/car.jpg" alt="Car"><Ok /></ShowroomErrorBoundary>);
        expect(screen.getByText('3D canvas')).toBeInTheDocument();
        expect(screen.queryByTestId('showroom-fallback')).not.toBeInTheDocument();
    });

    test('shows the car photo instead of crashing when the 3D scene throws (e.g. model 404)', () => {
        withWebGL(true);
        render(
            <div>
                <p>Section text stays</p>
                <ShowroomErrorBoundary fallbackImage="/car.jpg" alt="Porsche Taycan"><Boom /></ShowroomErrorBoundary>
            </div>
        );
        const fallback = screen.getByRole('img', { name: 'Porsche Taycan' });
        expect(fallback.style.backgroundImage).toContain('/car.jpg');
        expect(screen.getByText('Section text stays')).toBeInTheDocument();
    });

    test('shows the photo without mounting the canvas when WebGL is unavailable', () => {
        withWebGL(false);
        render(<ShowroomErrorBoundary fallbackImage="/car.jpg" alt="Car"><Ok /></ShowroomErrorBoundary>);
        expect(screen.getByTestId('showroom-fallback')).toBeInTheDocument();
        expect(screen.queryByText('3D canvas')).not.toBeInTheDocument();
    });
});

describe('RouteErrorBoundary', () => {
    test('a crashing page shows a recovery screen instead of a blank app', () => {
        render(<MemoryRouter><RouteErrorBoundary><Boom /></RouteErrorBoundary></MemoryRouter>);
        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
        expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    });
});
