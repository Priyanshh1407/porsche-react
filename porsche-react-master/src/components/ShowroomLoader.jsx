import { Html, useProgress } from '@react-three/drei';

// UPG-02: the "LOADING n%" indicator shown inside each 3D showroom's <Canvas> while its model
// downloads. Shared by all five viewers; only the accent colour differs per car.
// Keep the text exactly "LOADING n%": scripts/capture-stages.cjs waits for it to disappear.
export default function ShowroomLoader({ color = '#2dd4bf', glow = 'rgba(45, 212, 191, 0.5)' }) {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{
                color,
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.4em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textShadow: `0 0 10px ${glow}`
            }}>
                LOADING {Math.round(progress)}%
            </div>
        </Html>
    );
}
