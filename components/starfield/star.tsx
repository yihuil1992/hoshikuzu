'use client';

/* eslint-disable react/no-unknown-property */

import { Html, Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import type { MutableRefObject } from 'react';

export type StarProps = {
  position: THREE.Vector3;
  index: number;
  onClick: (index: number, worldPosition: THREE.Vector3) => void;
  color: string;
  emissive: string; // 保留兼容
  name: string;
  isActive: boolean;
  distanceScale: number;
  themeMode?: 'archive' | 'night';
  suppressHoverLabel?: boolean;
  prominence?: number;
  densityScale?: number;
  worldPositionRef?: MutableRefObject<THREE.Vector3>;
};

function seededUnit(seed: number, salt: number) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Star({
  position,
  index,
  onClick,
  color,
  emissive, // eslint-disable-line @typescript-eslint/no-unused-vars
  name,
  isActive,
  distanceScale,
  themeMode = 'night',
  suppressHoverLabel = false,
  prominence = 1,
  densityScale = 1,
  worldPositionRef,
}: StarProps) {
  const [coreTexture, glintTexture] = useTexture([
    '/star-assets/active/core-circle-05.png',
    '/star-assets/active/glint-star-04.png',
  ]);
  const groupRef = useRef<THREE.Group>(null);
  const hitRef = useRef<THREE.Mesh>(null); // 透明点击热区
  const innerRef = useRef<THREE.Mesh>(null); // 亮内核
  const coreRef = useRef<THREE.Mesh>(null); // 星点核心
  const glintRef = useRef<THREE.Mesh>(null); // 锐光星芒
  const hoverMix = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    [coreTexture, glintTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
    });
  }, [coreTexture, glintTexture]);

  // 每颗星的随机参数
  const phase = useMemo(() => seededUnit(index, 1) * Math.PI * 2, [index]);
  const twinkleSpeed = useMemo(() => 0.6 + seededUnit(index, 2) * 0.7, [index]);
  const baseScale = useMemo(
    () => (0.46 + seededUnit(index, 3) * 0.16) * prominence,
    [index, prominence],
  );
  const hueJitter = useMemo(() => (seededUnit(index, 4) - 0.5) * 0.1, [index]);
  const isArchive = themeMode === 'archive';
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  // 颜色：夜间发光，纸张版则像印在星图纸上的墨色信号。
  const brightColor = useMemo(
    () => {
      if (isArchive) {
        return baseColor
          .clone()
          .offsetHSL(hueJitter * 0.7, -0.18, -0.08)
          .lerp(new THREE.Color('#477c86'), 0.4)
          .lerp(new THREE.Color('#172033'), 0.18);
      }
      return baseColor
        .clone()
        .offsetHSL(hueJitter * 1.2, 0, 0.18)
        .lerp(new THREE.Color('#fff'), 0.22);
    },
    [baseColor, hueJitter, isArchive],
  );

  const innerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: coreTexture,
        color: isArchive
          ? brightColor.clone().lerp(new THREE.Color('#172033'), 0.34)
          : brightColor.clone().lerp(new THREE.Color('#fff'), 0.48),
        transparent: true,
        opacity: isArchive ? 0.24 : 0.34,
        blending: isArchive ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [brightColor, coreTexture, isArchive],
  );
  const glintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glintTexture,
        color: isArchive
          ? brightColor.clone().lerp(new THREE.Color('#172033'), 0.22)
          : new THREE.Color('#f7fbff'),
        transparent: true,
        opacity: isArchive ? 0.16 : 0.34,
        blending: isArchive ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [brightColor, glintTexture, isArchive],
  );
  const coreMat = useMemo(
    () => {
      const uniforms = {
        uTexture: { value: coreTexture },
        uColor: { value: brightColor.clone().lerp(new THREE.Color('#fff'), 0.28) },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uSeed: { value: index * 17.17 },
        uArchive: { value: isArchive ? 1 : 0 },
      };

      return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec3 uColor;
          uniform float uTime;
          uniform float uHover;
          uniform float uSeed;
          uniform float uArchive;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453123);
          }

          void main() {
            vec2 centered = vUv - 0.5;
            float radius = length(centered);
            float angle = atan(centered.y, centered.x);
            float shimmer = sin(angle * 7.0 + uTime * 1.35 + uSeed) * 0.014;
            shimmer += sin(angle * 13.0 - uTime * 0.85 + uSeed * 0.37) * 0.009;
            vec2 warpedUv = 0.5 + centered * (1.0 + shimmer + uHover * 0.035);

            vec4 tex = texture2D(uTexture, warpedUv);
            float grain = hash(floor(vUv * 42.0) + floor(uTime * 3.0));
            float core = smoothstep(0.34, 0.0, radius);
            float corona = smoothstep(0.62, 0.0, radius) * tex.a;
            float alpha = tex.a * (0.42 + core * 0.34) + corona * 0.22;
            alpha *= 0.86 + 0.14 * sin(uTime * 2.2 + uSeed);
            alpha += grain * 0.026 * smoothstep(0.48, 0.04, radius);
            alpha *= smoothstep(0.86, 0.46, radius);

            vec3 hot = mix(uColor, vec3(1.0), 0.52 + core * 0.34);
            vec3 fringe = mix(hot, vec3(0.72, 0.9, 1.0), smoothstep(0.1, 0.42, radius) * 0.18);

            if (uArchive > 0.5) {
              float printedDisk = 1.0 - smoothstep(0.36, 0.43, radius);
              float rim = smoothstep(0.29, 0.35, radius) * (1.0 - smoothstep(0.39, 0.46, radius));
              float centerInk = 1.0 - smoothstep(0.1, 0.22, radius);
              float paperTooth = 0.94 + (grain - 0.5) * 0.08;
              vec3 paperNormal = normalize(vec3(centered.x * 2.0, centered.y * 2.0, sqrt(max(0.0, 1.0 - radius * radius * 5.8))));
              float volumeLight = dot(paperNormal, normalize(vec3(-0.42, 0.58, 0.7)));
              float highlight = smoothstep(0.62, 0.98, volumeLight) * printedDisk;
              float formShadow = smoothstep(-0.62, -0.08, -volumeLight) * printedDisk;
              float castShadow = smoothstep(0.12, 0.44, radius) * smoothstep(0.18, -0.18, centered.x + centered.y * 0.36);

              hot = mix(uColor, vec3(0.09, 0.13, 0.2), centerInk * 0.16 + rim * 0.1);
              fringe = hot * (1.0 + highlight * 0.16 - formShadow * 0.18 - castShadow * 0.08);
              fringe = mix(fringe, hot * 0.78, rim * 0.24 + centerInk * 0.06);
              alpha = (printedDisk * 0.68 + rim * 0.18 + centerInk * 0.08) * paperTooth;
            }
            gl_FragColor = vec4(fringe, alpha);
          }
        `,
        transparent: true,
        blending: isArchive ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
    },
    [brightColor, coreTexture, index, isArchive],
  );
  const hitMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    hoverMix.current = THREE.MathUtils.damp(
      hoverMix.current,
      hovered || isActive ? 1 : 0,
      5.5,
      dt,
    );
    const enlarged = 1 + hoverMix.current * 0.42;
    const pulse = 0.6 + 0.4 * Math.sin(t * twinkleSpeed + phase);
    const modeScale = isArchive ? 1.08 : 1;
    const scale =
      baseScale * densityScale * distanceScale * modeScale * (0.85 + 0.15 * pulse) * enlarged;

    // 尺寸阻尼：内核更小更亮，外圈更大更淡
    if (innerRef.current) {
      const s = innerRef.current.scale.x || 1;
      const target = scale * (isArchive ? 0.14 : 1.12);
      const next = THREE.MathUtils.damp(s, target, 6, dt);
      innerRef.current.scale.set(next, next, next);
      const innerMaterial = innerRef.current.material as THREE.MeshBasicMaterial;
      innerMaterial.opacity = (isArchive ? 0.1 : 0.32) * distanceScale * (0.9 + 0.1 * pulse);
    }
    if (coreRef.current) {
      const target = scale * (isArchive ? 0.5 : 1.08) * (0.94 + 0.06 * pulse);
      coreRef.current.scale.set(target, target, target);
      const coreMaterial = coreRef.current.material as THREE.ShaderMaterial;
      coreMaterial.uniforms.uTime.value = t;
      coreMaterial.uniforms.uHover.value = hoverMix.current;
    }
    if (glintRef.current) {
      const target = scale * (isArchive ? 0.16 : 0.72) * (0.96 + hoverMix.current * 0.18);
      glintRef.current.scale.set(target, target, target);
      glintRef.current.rotation.z = -t * 0.055 + phase * 0.6;
      const glintMaterial = glintRef.current.material as THREE.MeshBasicMaterial;
      glintMaterial.opacity = isArchive
        ? 0.025 + hoverMix.current * 0.045
        : 0.18 + hoverMix.current * 0.2;
    }
    if (hitRef.current) {
      const target = scale * 0.48;
      hitRef.current.scale.set(target, target, target);
    }

    // 轻微漂移
    if (groupRef.current) {
      groupRef.current.position.x += Math.sin(t * 0.7 + index) * 0.0005;
      groupRef.current.position.y += Math.cos(t * 0.9 + index) * 0.0005;
      if (worldPositionRef) {
        groupRef.current.getWorldPosition(worldPositionRef.current);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <mesh
          ref={hitRef}
          onClick={() => {
            const focusPosition = new THREE.Vector3();
            if (groupRef.current) {
              groupRef.current.getWorldPosition(focusPosition);
            } else {
              focusPosition.copy(position);
            }
            onClick(index, focusPosition);
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1, 1]} />
          <primitive object={hitMat} attach="material" />
        </mesh>
      </Billboard>

      <Billboard>
        <mesh ref={innerRef}>
          <planeGeometry args={[1, 1]} />
          <primitive object={innerMat} attach="material" />
        </mesh>
      </Billboard>

      <Billboard>
        <mesh ref={coreRef}>
          <planeGeometry args={[1, 1, 8, 8]} />
          <primitive object={coreMat} attach="material" />
        </mesh>
      </Billboard>

      <Billboard>
        <mesh ref={glintRef}>
          <planeGeometry args={[0.72, 0.72]} />
          <primitive object={glintMat} attach="material" />
        </mesh>
      </Billboard>

      {hovered && !isActive && !suppressHoverLabel && (
        <Html
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
          position={[0, 0.8, 0]}
          zIndexRange={[1, 0]} // ★ 低
        >
          <div
            className={
              isArchive
                ? 'border border-[rgba(36,48,64,0.18)] bg-[rgba(255,255,252,0.72)] px-3 py-1.5 text-center text-[11px] font-medium uppercase text-[#172033]/85 shadow-[0_8px_24px_rgba(36,48,64,0.08)] backdrop-blur-sm'
                : 'border border-white/15 bg-[#05070d]/55 px-3 py-1.5 text-center text-[11px] font-medium uppercase text-white/85 shadow-[0_0_18px_rgba(180,220,255,0.16)] backdrop-blur-sm'
            }
            style={{
              letterSpacing: '0.16em',
              textShadow: isArchive ? 'none' : '0 0 10px rgba(210,235,255,0.5)',
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
