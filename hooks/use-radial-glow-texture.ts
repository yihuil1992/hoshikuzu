'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

export function useRadialGlowTexture() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  // SSR-safe 占位纹理（1x1 透明像素）
  const placeholder = useMemo(() => {
    const data = new Uint8Array([0, 0, 0, 0]); // RGBA
    const t = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    t.needsUpdate = true;
    return t;
  }, []);

  useEffect(() => {
    // 只在客户端生成真正的径向光晕贴图
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0.0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.18)');
    grd.addColorStop(0.9, 'rgba(255,255,255,0.04)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    const real = new THREE.Texture(canvas);
    real.needsUpdate = true;
    real.minFilter = THREE.LinearFilter;
    real.magFilter = THREE.LinearFilter;
    real.generateMipmaps = false;
    setTex(real);

    return () => {
      real.dispose();
    };
  }, []);

  return tex ?? placeholder;
}
