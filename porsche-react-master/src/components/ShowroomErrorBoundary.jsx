import React from 'react';

// ERR-01: a failed model download (or no WebGL) used to throw out of <Canvas> and unmount the
// whole app, leaving a blank page. This boundary wraps only the canvas: on failure the car's
// photo takes the canvas's place and the rest of the showroom (text, sections, Home link) stays.
// It renders inside the viewer's existing full-size wrapper, so the page layout is unchanged.

export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
        return false;
    }
}

const Fallback = ({ image, alt }) => (
    <div
        role="img"
        aria-label={alt}
        data-testid="showroom-fallback"
        style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.55,
        }}
    />
);

export default class ShowroomErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { failed: false, webgl: isWebGLAvailable() };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error) {
        // Visible in the console for debugging; the visitor sees the photo instead of a blank page.
        console.error('3D showroom failed, showing the photo instead:', error);
    }

    render() {
        const { fallbackImage, alt, children } = this.props;
        if (this.state.failed || !this.state.webgl) return <Fallback image={fallbackImage} alt={alt} />;
        return children;
    }
}
