export const applyCarConfiguratorColors = (scene, customColor = '#cc0000') => {
    // Fix materials (some Sketchfab exports have broken transparency or missing env maps)
    scene.traverse((child) => {
        if (child.isMesh && child.material) {
            // Disable broken transparency which turns cars white/invisible
            if (child.material.transparent && child.material.opacity > 0.99) {
                child.material.transparent = false;
                child.material.depthWrite = true;
            }
            
            child.material.envMapIntensity = 1.5;
            
            const matName = child.material.name.toLowerCase();

            // CSR2 rips usually lack baked colors. We must tint them manually.
            if (matName.includes('paint') || matName.includes('body')) {
                child.material.color.set(customColor); // Custom Paint Color
                child.material.roughness = 0.1;
                child.material.metalness = 0.5;
                child.material.clearcoat = 1.0;
                child.material.clearcoatRoughness = 0.05;
            } 
            else if (matName.includes('glass') || matName.includes('window')) {
                child.material.color.set('#ffffff');
                child.material.transparent = true;
                child.material.opacity = 0.3;
                child.material.roughness = 0.0;
                child.material.metalness = 1.0;
                child.material.envMapIntensity = 2.0;
            }
            else if (matName.includes('tire') || matName.includes('rubber') || matName.includes('black')) {
                child.material.color.set('#111111');
                child.material.roughness = 0.9;
                child.material.metalness = 0.0;
            }
            else if (matName.includes('rim') || matName.includes('alloy') || matName.includes('metal')) {
                child.material.color.set('#aaaaaa');
                child.material.roughness = 0.2;
                child.material.metalness = 0.8;
            }

            child.material.needsUpdate = true;
        }
    });
};
