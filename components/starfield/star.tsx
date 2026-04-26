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
  onClick: (index: number) => void;
  color: string;
  emissive: string; // 保留兼容
  name: string;
  isActive: boolean;
  distanceScale: number;
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
  prominence = 1,
  densityScale = 1,
  worldPositionRef,
}: StarProps) {
  const [auraTexture, coreTexture, glintTexture] = useTexture([
    '/star-assets/active/aura-kenney-circle-05.png',
    '/star-assets/active/core-circle-05.png',
    '/star-assets/active/glint-star-04.png',
  ]);
  const groupRef = useRef<THREE.Group>(null);
  const hitRef = useRef<THREE.Mesh>(null); // 透明点击热区
  const innerRef = useRef<THREE.Mesh>(null); // 亮内核
  const coreRef = useRef<THREE.Mesh>(null); // 星点核心
  const glintRef = useRef<THREE.Mesh>(null); // 锐光星芒
  const outerRef = useRef<THREE.Mesh>(null); // 外光晕
  const hoverMix = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    [auraTexture, coreTexture, glintTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
    });
  }, [auraTexture, coreTexture, glintTexture]);

  // 每颗星的随机参数
  const phase = useMemo(() => seededUnit(index, 1) * Math.PI * 2, [index]);
  const twinkleSpeed = useMemo(() => 0.6 + seededUnit(index, 2) * 0.7, [index]);
  const baseScale = useMemo(
    () => (0.46 + seededUnit(index, 3) * 0.16) * prominence,
    [index, prominence],
  );
  const hueJitter = useMemo(() => (seededUnit(index, 4) - 0.5) * 0.1, [index]);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  // 颜色：轻微偏白提亮，避免“灰”
  const brightColor = useMemo(
    () =>
      baseColor
        .clone()
        .offsetHSL(hueJitter * 1.2, 0, 0.18)
        .lerp(new THREE.Color('#fff'), 0.22),
    [baseColor, hueJitter],
  );

  const outerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: auraTexture,
        color: brightColor.clone().lerp(new THREE.Color('#dff8ff'), 0.42),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [auraTexture, brightColor],
  );
  const innerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: coreTexture,
        color: brightColor.clone().lerp(new THREE.Color('#fff'), 0.48),
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [brightColor, coreTexture],
  );
  const glintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glintTexture,
        color: new THREE.Color('#f7fbff'),
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [glintTexture],
  );
  const coreMat = useMemo(
    () => {
      const uniforms = {
        uTexture: { value: coreTexture },
        uColor: { value: brightColor.clone().lerp(new THREE.Color('#fff'), 0.28) },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uSeed: { value: index * 17.17 },
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
            gl_FragColor = vec4(fringe, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
    },
    [brightColor, coreTexture, index],
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
    const scale = baseScale * densityScale * distanceScale * (0.85 + 0.15 * pulse) * enlarged;

    // 尺寸阻尼：内核更小更亮，外圈更大更淡
    if (innerRef.current) {
      const s = innerRef.current.scale.x || 1;
      const target = scale * 1.12;
      const next = THREE.MathUtils.damp(s, target, 6, dt);
      innerRef.current.scale.set(next, next, next);
      const innerMaterial = innerRef.current.material as THREE.MeshBasicMaterial;
      innerMaterial.opacity = 0.32 * distanceScale * (0.9 + 0.1 * pulse);
    }
    if (coreRef.current) {
      const target = scale * 1.08 * (0.94 + 0.06 * pulse);
      coreRef.current.scale.set(target, target, target);
      const coreMaterial = coreRef.current.material as THREE.ShaderMaterial;
      coreMaterial.uniforms.uTime.value = t;
      coreMaterial.uniforms.uHover.value = hoverMix.current;
    }
    if (outerRef.current) {
      const s = outerRef.current.scale.x || 1;
      const target = scale * 1.68 * (0.98 + 0.02 * Math.sin(t * 0.23 + phase));
      const next = THREE.MathUtils.damp(s, target, 5, dt);
      outerRef.current.scale.set(next * 1.08, next, next);
      outerRef.current.rotation.z = t * 0.035 + phase;
      const outerMaterial = outerRef.current.material as THREE.MeshBasicMaterial;
      outerMaterial.opacity = 0.07 * distanceScale * (0.88 + 0.12 * pulse);
    }
    if (glintRef.current) {
      const target = scale * 0.72 * (0.96 + hoverMix.current * 0.18);
      glintRef.current.scale.set(target, target, target);
      glintRef.current.rotation.z = -t * 0.055 + phase * 0.6;
      const glintMaterial = glintRef.current.material as THREE.MeshBasicMaterial;
      glintMaterial.opacity = 0.18 + hoverMix.current * 0.2;
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
          onClick={() => onClick(index)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1, 1]} />
          <primitive object={hitMat} attach="material" />
        </mesh>
      </Billboard>

      {/* 贴图光球：素材负责柔边，交互由透明热区单独负责。 */}
      <Billboard>
        <mesh ref={outerRef}>
          <planeGeometry args={[1, 1]} />
          <primitive object={outerMat} attach="material" />
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

      {hovered && !isActive && (
        <Html
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
          position={[0, 0.8, 0]}
          zIndexRange={[1, 0]} // ★ 低
        >
          <div
            className="border border-white/15 bg-[#05070d]/55 px-3 py-1.5 text-center text-[11px] font-medium uppercase text-white/85 shadow-[0_0_18px_rgba(180,220,255,0.16)] backdrop-blur-sm"
            style={{
              letterSpacing: '0.16em',
              textShadow: '0 0 10px rgba(210,235,255,0.5)',
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
