'use client';

import { Html, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export type StarProps = {
  position: THREE.Vector3;
  index: number;
  onClick: (index: number) => void;
  color: string;
  emissive: string; // 保留兼容
  name: string;
  isActive: boolean;
  distanceScale: number;
  glowTexture: THREE.Texture;
};

export function Star({
  position,
  index,
  onClick,
  color,
  emissive, // eslint-disable-line @typescript-eslint/no-unused-vars
  name,
  isActive,
  distanceScale,
  glowTexture,
}: StarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null); // 亮内核
  const outerRef = useRef<THREE.Mesh>(null); // 外光晕
  const [hovered, setHovered] = useState(false);

  // 每颗星的随机参数
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const twinkleSpeed = useMemo(() => 0.6 + Math.random() * 0.7, []);
  const baseScale = useMemo(() => 0.4 + Math.random() * 0.4, []);
  const hueJitter = useMemo(() => (Math.random() - 0.5) * 0.1, []);
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

  // 材质（加法混合，关深度测试让边缘更柔）
  const mkMat = (opacity: number) =>
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      color: brightColor,
    });

  const innerMat = useMemo(() => mkMat(0.42), [glowTexture, brightColor]);
  const outerMat = useMemo(() => mkMat(0.16), [glowTexture, brightColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const enlarged = hovered || isActive ? 1.85 : 1;
    const pulse = 0.6 + 0.4 * Math.sin(t * twinkleSpeed + phase);
    const scale = baseScale * distanceScale * (0.85 + 0.15 * pulse) * enlarged;

    // 尺寸阻尼：内核更小更亮，外圈更大更淡
    if (innerRef.current) {
      const s = innerRef.current.scale.x || 1;
      const target = scale * 2.2;
      const next = THREE.MathUtils.damp(s, target, 6, 1 / 60);
      innerRef.current.scale.set(next, next, next);
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.36 * distanceScale * (0.85 + 0.15 * pulse);
    }
    if (outerRef.current) {
      const s = outerRef.current.scale.x || 1;
      const target = scale * 4.2;
      const next = THREE.MathUtils.damp(s, target, 5, 1 / 60);
      outerRef.current.scale.set(next, next, next);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 * distanceScale * (0.85 + 0.15 * pulse);
    }

    // 轻微漂移
    if (groupRef.current) {
      groupRef.current.position.x += Math.sin(t * 0.7 + index) * 0.0005;
      groupRef.current.position.y += Math.cos(t * 0.9 + index) * 0.0005;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 双层光球：外晕在下，内核在上（都参与交互） */}
      <Billboard>
        <mesh
          ref={outerRef}
          onClick={() => onClick(index)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1, 1]} />
          {/* @ts-ignore */}
          <primitive object={outerMat} attach="material" />
        </mesh>
      </Billboard>

      <Billboard>
        <mesh
          ref={innerRef}
          onClick={() => onClick(index)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1, 1]} />
          {/* @ts-ignore */}
          <primitive object={innerMat} attach="material" />
        </mesh>
      </Billboard>

      {(hovered || isActive) && (
        <Html
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
          position={[0, 0.8, 0]}
          zIndexRange={[1, 0]} // ★ 低
        >
          <div
            className="rounded-md bg-black/40 px-3 py-1 text-center text-sm font-semibold text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-md"
            style={{
              letterSpacing: '0.5px',
              textShadow: '0 0 6px rgba(255,255,255,0.6)',
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
