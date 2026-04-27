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
    const image = ctx.createImageData(size, size);
    const data = image.data;
    const center = size / 2;
    const smoothstep = (edge0: number, edge1: number, value: number) => {
      const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };
    const hash = (x: number, y: number) => {
      const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
      return v - Math.floor(v);
    };
    const valueNoise = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy);
      const b = hash(ix + 1, iy);
      const c = hash(ix, iy + 1);
      const d = hash(ix + 1, iy + 1);
      const x1 = a + (b - a) * ux;
      const x2 = c + (d - c) * ux;
      return x1 + (x2 - x1) * uy;
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = (x - center) / center;
        const dy = (y - center) / center;
        const angle = Math.atan2(dy, dx);
        const radius = Math.sqrt(dx * dx + dy * dy);
        const lowNoise = valueNoise(x / 68, y / 68);
        const fineNoise = valueNoise(x / 28 + 19, y / 28 - 11);
        const ripple =
          Math.sin(angle * 5.0 + lowNoise * 2.8) * 0.012 +
          Math.sin(angle * 9.0 - lowNoise * 2.4) * 0.008;
        const warpedRadius = Math.max(0, radius + ripple * smoothstep(0.34, 0.84, radius));
        const core = Math.exp(-Math.pow(warpedRadius * 2.35, 2.05)) * 1.18;
        const softTail = Math.exp(-Math.pow(warpedRadius * 1.62, 2.15)) * 0.18;
        const edge = 0.72 + (lowNoise - 0.5) * 0.045;
        const edgeFade = 1 - smoothstep(edge, 0.98, radius);
        const textureNoise = 0.96 + (fineNoise - 0.5) * 0.045;
        const alpha = Math.min(1, Math.max(0, Math.max(core, softTail) * edgeFade * textureNoise));
        const offset = (y * size + x) * 4;

        data[offset] = 255;
        data[offset + 1] = 255;
        data[offset + 2] = 255;
        data[offset + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(image, 0, 0);

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
