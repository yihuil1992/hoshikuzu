'use client';

/* eslint-disable react/no-unknown-property */

import { Html, Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as THREEGPU from 'three/webgpu';

import { useRadialGlowTexture } from '@/hooks/use-radial-glow-texture';
import { planet } from '@/lib/tsl-planet';

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

type ArchivePlanetProfile = {
  scale: number;
  iterations: number;
  levelSea: number;
  levelMountain: number;
  balanceWater: number;
  balanceSand: number;
  balanceSnow: number;
  colorDeep: THREE.Color;
  colorShallow: THREE.Color;
  colorBeach: THREE.Color;
  colorGrass: THREE.Color;
  colorForest: THREE.Color;
  colorSnow: THREE.Color;
  shell: THREE.Color;
  emissive: THREE.Color;
  roughness: number;
  metalness: number;
};

type MeshStandardNodeMaterialLike = THREE.MeshStandardMaterial & {
  colorNode: unknown;
};

const MeshStandardNodeMaterial = (
  THREEGPU as unknown as {
    MeshStandardNodeMaterial: new (
      params: THREE.MeshStandardMaterialParameters,
    ) => MeshStandardNodeMaterialLike;
  }
).MeshStandardNodeMaterial;

function seededUnit(seed: number, salt: number) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function archivePlanetProfile(index: number, baseColor: THREE.Color): ArchivePlanetProfile {
  const variant = index % 5;
  const tint = baseColor.clone().lerp(new THREE.Color('#7fb1b0'), 0.42);

  const profiles: ArchivePlanetProfile[] = [
    {
      scale: 2.25,
      iterations: 6,
      levelSea: 0.18,
      levelMountain: 0.56,
      balanceWater: 0.16,
      balanceSand: 0.62,
      balanceSnow: 0.24,
      colorDeep: new THREE.Color('#52687a'),
      colorShallow: new THREE.Color('#8faeb8'),
      colorBeach: new THREE.Color('#ded2af'),
      colorGrass: tint.clone().lerp(new THREE.Color('#94ae9d'), 0.42),
      colorForest: new THREE.Color('#718895'),
      colorSnow: new THREE.Color('#f0ecd8'),
      shell: new THREE.Color('#d7e4dc'),
      emissive: new THREE.Color('#425869'),
      roughness: 0.86,
      metalness: 0.02,
    },
    {
      scale: 1.55,
      iterations: 5,
      levelSea: 0.42,
      levelMountain: 0.74,
      balanceWater: 0.62,
      balanceSand: 0.18,
      balanceSnow: 0.5,
      colorDeep: new THREE.Color('#607f8a'),
      colorShallow: new THREE.Color('#a5c0c4'),
      colorBeach: new THREE.Color('#e6dcc1'),
      colorGrass: new THREE.Color('#96b6a6'),
      colorForest: new THREE.Color('#708a90'),
      colorSnow: new THREE.Color('#f4efd8'),
      shell: new THREE.Color('#bad5d3'),
      emissive: new THREE.Color('#53727d'),
      roughness: 0.74,
      metalness: 0.01,
    },
    {
      scale: 3.1,
      iterations: 7,
      levelSea: 0.16,
      levelMountain: 0.58,
      balanceWater: 0.18,
      balanceSand: 0.48,
      balanceSnow: 0.2,
      colorDeep: new THREE.Color('#746a80'),
      colorShallow: new THREE.Color('#aa93a2'),
      colorBeach: new THREE.Color('#dfc0aa'),
      colorGrass: new THREE.Color('#c49c9a'),
      colorForest: new THREE.Color('#83758b'),
      colorSnow: new THREE.Color('#f3ddbf'),
      shell: new THREE.Color('#efd0b8'),
      emissive: new THREE.Color('#7d6475'),
      roughness: 0.68,
      metalness: 0.02,
    },
    {
      scale: 2,
      iterations: 6,
      levelSea: 0.3,
      levelMountain: 0.82,
      balanceWater: 0.36,
      balanceSand: 0.28,
      balanceSnow: 0.82,
      colorDeep: new THREE.Color('#6d7888'),
      colorShallow: new THREE.Color('#aebcc0'),
      colorBeach: new THREE.Color('#dddcc9'),
      colorGrass: new THREE.Color('#b4c0b9'),
      colorForest: new THREE.Color('#8a9ca4'),
      colorSnow: new THREE.Color('#f7f4e8'),
      shell: new THREE.Color('#e1ece8'),
      emissive: new THREE.Color('#637584'),
      roughness: 0.92,
      metalness: 0,
    },
    {
      scale: 1.2,
      iterations: 4,
      levelSea: 0.52,
      levelMountain: 0.84,
      balanceWater: 0.34,
      balanceSand: 0.22,
      balanceSnow: 0.58,
      colorDeep: new THREE.Color('#81776d'),
      colorShallow: new THREE.Color('#b4aa91'),
      colorBeach: new THREE.Color('#e7d391'),
      colorGrass: new THREE.Color('#c8bd7e'),
      colorForest: new THREE.Color('#a09682'),
      colorSnow: new THREE.Color('#f4e8c7'),
      shell: new THREE.Color('#f5f0dc'),
      emissive: new THREE.Color('#8d8063'),
      roughness: 0.58,
      metalness: 0.04,
    },
  ];

  return profiles[variant];
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
  const [coreTexture] = useTexture(['/star-assets/active/core-circle-05.png']);
  const glowTexture = useRadialGlowTexture();
  const groupRef = useRef<THREE.Group>(null);
  const hitRef = useRef<THREE.Mesh>(null); // 透明点击热区
  const innerRef = useRef<THREE.Mesh>(null); // 柔光光晕
  const planetRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const hoverMix = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    [coreTexture, glowTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
    });
  }, [coreTexture, glowTexture]);

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

  const planetBaseColor = useMemo(
    () =>
      baseColor
        .clone()
        .offsetHSL(hueJitter * 0.7, -0.12, 0.04)
        .lerp(new THREE.Color('#5c9299'), 0.34)
        .lerp(new THREE.Color('#172033'), 0.08),
    [baseColor, hueJitter],
  );
  const signalColor = useMemo(
    () =>
      baseColor
        .clone()
        .offsetHSL(hueJitter * 1.2, 0, 0.18)
        .lerp(new THREE.Color('#fff'), 0.18),
    [baseColor, hueJitter],
  );
  const planetProfile = useMemo(
    () => archivePlanetProfile(index, planetBaseColor),
    [planetBaseColor, index],
  );
  const planetPalette = useMemo(
    () => ({
      colorDeep: planetProfile.colorDeep,
      colorShallow: planetProfile.colorShallow,
      colorBeach: planetProfile.colorBeach,
      colorGrass: planetProfile.colorGrass,
      colorForest: planetProfile.colorForest,
      colorSnow: planetProfile.colorSnow,
    }),
    [planetProfile],
  );
  const planetMat = useMemo(() => {
    const material = new MeshStandardNodeMaterial({
      color: planetBaseColor,
      roughness: planetProfile.roughness,
      metalness: planetProfile.metalness,
    });
    material.colorNode = planet({
      scale: planetProfile.scale,
      iterations: planetProfile.iterations,
      levelSea: planetProfile.levelSea,
      levelMountain: planetProfile.levelMountain,
      balanceWater: planetProfile.balanceWater,
      balanceSand: planetProfile.balanceSand,
      balanceSnow: planetProfile.balanceSnow,
      colorDeep: planetPalette.colorDeep,
      colorShallow: planetPalette.colorShallow,
      colorBeach: planetPalette.colorBeach,
      colorGrass: planetPalette.colorGrass,
      colorForest: planetPalette.colorForest,
      colorSnow: planetPalette.colorSnow,
      seed: index * 41.17 + 7.3,
    });
    material.emissive = planetProfile.emissive;
    material.emissiveIntensity = isArchive ? 0.28 : 0.36;
    return material;
  }, [index, isArchive, planetBaseColor, planetPalette, planetProfile]);
  const shellMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: isArchive ? planetProfile.shell : signalColor.clone().lerp(new THREE.Color('#b9e4ee'), 0.22),
        transparent: true,
        opacity: isArchive ? 0.08 : 0.025,
        blending: isArchive ? THREE.NormalBlending : THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [isArchive, planetProfile, signalColor],
  );

  const innerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: isArchive ? coreTexture : glowTexture,
        color: isArchive
          ? planetBaseColor.clone().lerp(new THREE.Color('#172033'), 0.34)
          : signalColor.clone().lerp(new THREE.Color('#f8fdff'), 0.55),
        transparent: true,
        opacity: isArchive ? 0.24 : 0.76,
        blending: isArchive ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [coreTexture, glowTexture, isArchive, planetBaseColor, signalColor],
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
    const restingScale =
      baseScale * densityScale * distanceScale * modeScale * (0.85 + 0.15 * pulse);
    const scale = restingScale * enlarged;

    // 尺寸阻尼：内核更小更亮，外圈更大更淡
    if (innerRef.current) {
      const s = innerRef.current.scale.x || 1;
      const target = scale * (isArchive ? 0.14 : 0.96);
      const next = THREE.MathUtils.damp(s, target, 6, dt);
      innerRef.current.scale.set(next, next, next);
      if (!isArchive) {
        innerRef.current.rotation.z = Math.sin(t * 0.18 + phase) * 0.08;
      }
      const innerMaterial = innerRef.current.material as THREE.MeshBasicMaterial;
      innerMaterial.opacity =
        (isArchive ? 0.1 : 0.68) *
        distanceScale *
        (0.9 + 0.1 * pulse);
    }
    if (planetRef.current) {
      const s = planetRef.current.scale.x || 1;
      const target = scale * (isArchive ? 0.18 + hoverMix.current * 0.035 : 0.23 + hoverMix.current * 0.04);
      const next = THREE.MathUtils.damp(s, target, 7, dt);
      planetRef.current.scale.set(next, next, next);
      planetRef.current.rotation.y += dt * (0.12 + seededUnit(index, 9) * 0.08);
      planetRef.current.rotation.x = Math.sin(t * 0.11 + phase) * 0.08;
    }
    if (shellRef.current) {
      const s = shellRef.current.scale.x || 1;
      const target =
        isArchive
          ? scale * (0.205 + hoverMix.current * 0.05)
          : restingScale * 0.255;
      const next = THREE.MathUtils.damp(s, target, 7, dt);
      shellRef.current.scale.set(next, next, next);
      const shellMaterial = shellRef.current.material as THREE.MeshBasicMaterial;
      shellMaterial.opacity = isArchive ? 0.045 + hoverMix.current * 0.075 : 0;
    }
    if (hitRef.current) {
      const target = scale * (isArchive ? 0.64 : 0.7);
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
        <mesh ref={innerRef} renderOrder={isArchive ? 0 : 20}>
          <planeGeometry args={[1, 1]} />
          <primitive object={innerMat} attach="material" />
        </mesh>
      </Billboard>

      <mesh ref={planetRef} rotation={[0.08, phase, -0.12]}>
        <icosahedronGeometry args={[1, 8]} />
        <primitive object={planetMat} attach="material" />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 32, 16]} />
        <primitive object={shellMat} attach="material" />
      </mesh>

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
