'use client';

/* eslint-disable react/no-unknown-property */

import { OrbitControls, Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

import { useStandaloneTheme } from '@/components/standalone-theme';
import { Button } from '@/components/ui/button';
import { presetStars } from '@/constants/star-presets';
import {
  computeSafeRadius,
} from '@/lib/helpers';
import { cn } from '@/lib/utils';

import CameraFocus, { CameraPhase } from './camera-focus'; // ★ 引入独立组件
import { RotatingGroup } from './rotating-group';
import { Star } from './star';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

function seededUnit(seed: number, salt: number) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function ArchiveChartBackdrop() {
  const latitudeGeometries = useMemo(() => {
    const radius = 22;
    const segments = 144;
    const latitudes = [-60, -45, -30, -15, 0, 15, 30, 45, 60];

    return latitudes.map((latitude) => {
      const points: THREE.Vector3[] = [];
      const phi = THREE.MathUtils.degToRad(latitude);
      const y = Math.sin(phi) * radius;
      const ringRadius = Math.cos(phi) * radius;

      for (let i = 0; i < segments; i += 1) {
        const a = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * ringRadius, y, Math.sin(a) * ringRadius));
      }

      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points, true),
        segments,
        0.026,
        4,
        true,
      );
    });
  }, []);

  const longitudeGeometries = useMemo(() => {
    const radius = 22;
    const segments = 144;
    const longitudes = Array.from({ length: 12 }, (_, index) => index * 15);

    return longitudes.map((longitude) => {
      const points: THREE.Vector3[] = [];
      const theta = THREE.MathUtils.degToRad(longitude);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      for (let i = 0; i < segments; i += 1) {
        const a = (i / segments) * Math.PI * 2;
        const r1 = Math.cos(a) * radius;
        points.push(new THREE.Vector3(r1 * cosTheta, Math.sin(a) * radius, r1 * sinTheta));
      }

      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points, true),
        segments,
        0.026,
        4,
        true,
      );
    });
  }, []);

  const dotGeometry = useMemo(() => {
    const positions: number[] = [];
    const radius = 21.8;
    const latitudes = [-30, 0, 30];
    const longitudes = Array.from({ length: 14 }, (_, index) => index * (360 / 14));

    for (const latitude of latitudes) {
      const phi = THREE.MathUtils.degToRad(latitude);
      const y = Math.sin(phi) * radius;
      const ringRadius = Math.cos(phi) * radius;

      for (const longitude of longitudes) {
        const theta = THREE.MathUtils.degToRad(longitude);
        positions.push(Math.cos(theta) * ringRadius, y, Math.sin(theta) * ringRadius);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  return (
    <group renderOrder={-10} rotation={[0.52, -0.62, 0.28]}>
      {latitudeGeometries.map((geometry, index) => (
        <mesh key={`latitude-${index}`} geometry={geometry}>
          <meshBasicMaterial color="#d5dbd6" depthWrite={false} depthTest={false} />
        </mesh>
      ))}
      {longitudeGeometries.map((geometry, index) => (
        <mesh key={`longitude-${index}`} geometry={geometry}>
          <meshBasicMaterial color="#d0d7d2" depthWrite={false} depthTest={false} />
        </mesh>
      ))}
      <points geometry={dotGeometry}>
        <pointsMaterial
          color="#243040"
          transparent
          opacity={0.68}
          size={0.105}
          sizeAttenuation
          depthWrite={false}
          depthTest
        />
      </points>
    </group>
  );
}

function NightStarBackdrop() {
  const starGeometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const colorA = new THREE.Color('#f8fafc');
    const colorB = new THREE.Color('#aad7dc');
    const colorC = new THREE.Color('#f5f0dc');

    for (let i = 0; i < 1800; i += 1) {
      const r1 = seededUnit(i, 11);
      const r2 = seededUnit(i, 23);
      const r3 = seededUnit(i, 37);
      const theta = r1 * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.clamp(r2 * 2 - 1, -1, 1));
      const radius = 32 + r3 * 18;
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.cos(phi) * radius;
      const z = Math.sin(phi) * Math.sin(theta) * radius;
      positions.push(x, y, z);

      const color = colorA.clone().lerp(colorB, r2 * 0.32).lerp(colorC, r3 * 0.12);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <points geometry={starGeometry} renderOrder={-20}>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.74}
        size={1.18}
        sizeAttenuation={false}
        depthWrite={false}
        depthTest={false}
        fog={false}
      />
    </points>
  );
}

export default function StarField() {
  const router = useRouter();
  const { mode, toggleMode } = useStandaloneTheme();
  const isArchive = mode === 'archive';
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const [aspect, setAspect] = useState(16 / 9);
  useEffect(() => {
    const onResize = () => setAspect(window.innerWidth / window.innerHeight);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const SAFE_RADIUS = useMemo(() => {
    const cameraZ = 9.5; // 你的 Canvas 相机 z
    const fov = 50; // 你的 Canvas fov
    return computeSafeRadius(fov, aspect, cameraZ, 0.82);
  }, [aspect]);

  const stars = useMemo(() => {
    const wide = aspect > 1.15;
    const composition = wide
      ? [
          [-0.18, 0.5, 0],
          [0.7, 0.24, 0],
          [-0.56, -0.42, 0],
          [0.46, -0.66, 0],
        ]
      : [
          [0.34, 0.32, 0],
          [-0.42, -0.1, 0],
          [0.28, -0.62, 0],
          [-0.26, 0.62, 0],
        ];

    const positions = composition.map(
      ([x, y, z]) => new THREE.Vector3(x * SAFE_RADIUS, y * SAFE_RADIUS, z),
    );

    return presetStars.map((s, i) => ({
      ...s,
      position: positions[i],
      prominence: i === 2 ? 1.18 : i === 1 ? 1.05 : 0.92,
    }));
  }, [SAFE_RADIUS, aspect]);

  const starDensityScale = useMemo(
    () => THREE.MathUtils.clamp(Math.sqrt(64 / Math.max(presetStars.length, 1)), 0.9, 4.6),
    [],
  );
  const starWorldPositionRefs = useMemo(
    () => presetStars.map(() => ({ current: new THREE.Vector3() })),
    [],
  );

  // 选中 & 面板
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);
  const selectedStar = selectedIndex !== null ? stars[selectedIndex] : null;

  // 相机阶段由 CameraFocus 回调驱动
  const [phase, setPhase] = useState<CameraPhase>('idle');

  // 仅在 restoring 禁用拖拽，其它阶段都允许（聚焦时也能拖）
  useEffect(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.enabled = phase !== 'restoring';
    c.update?.();
  }, [phase]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSelectedIndex(null);
        setFocusTarget(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleStarClick = (index: number, worldPosition: THREE.Vector3) => {
    setSelectedIndex(index);
    setFocusTarget(worldPosition.clone());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false); // 进入 restoring，回到原视角
    setSelectedIndex(null);
    setFocusTarget(null);
  };

  const scene = isArchive
    ? {
        background: '#f7f8f3',
        foreground: '#172033',
        muted: '#66727f',
        faint: 'rgba(23, 32, 51, 0.18)',
        panel: 'rgba(255, 255, 252, 0.78)',
        line: 'rgba(36, 48, 64, 0.18)',
        accent: '#477c86',
        primary: '#172033',
        primaryText: '#f7f8f3',
      }
    : {
        background: '#02040a',
        foreground: '#f8fafc',
        muted: 'rgba(255, 255, 255, 0.64)',
        faint: 'rgba(255, 255, 255, 0.18)',
        panel: 'rgba(5, 7, 13, 0.76)',
        line: 'rgba(255, 255, 255, 0.14)',
        accent: '#aad7dc',
        primary: '#f5f0dc',
        primaryText: '#02040a',
      };

  return (
    <>
      {/* 3D 背景层 */}
      <div
        className={cn(
          'fixed inset-0 z-0 transition-colors duration-300',
          isArchive ? 'bg-[#f7f8f3]' : 'bg-[#02040a]',
        )}
      >
        <Canvas
          className="absolute inset-0"
          gl={async (props) => {
            const { WebGPURenderer } = await import('three/webgpu');
            const renderer = new WebGPURenderer({
              ...props,
              alpha: false,
              antialias: true,
            });
            await renderer.init();
            return renderer;
          }}
          camera={{ position: [0, 0, 9.5], fov: 50 }}
          onPointerMissed={() => {
            if (open) handleClose();
          }}
        >
          <color attach="background" args={[scene.background]} />
          <fog attach="fog" args={[scene.background, isArchive ? 18 : 12, isArchive ? 60 : 42]} />

          <ambientLight intensity={isArchive ? 0.72 : 0.42} />
          <pointLight position={[-7, 6, 8]} intensity={isArchive ? 0.65 : 1.3} color="#f5f0dc" />
          <pointLight position={[6, -4, 5]} intensity={isArchive ? 0.28 : 0.55} color="#9ad7d8" />

          <OrbitControls
            ref={controlsRef}
            enabled={phase !== 'restoring'}
            minDistance={6}
            maxDistance={18}
            enableDamping
            dampingFactor={0.08}
          />

          <CameraFocus
            controlsRef={controlsRef}
            target={focusTarget}
            active={open}
            zoomFactor={0.13}
            inDamp={5.4}
            outDamp={3.2}
            onPhaseChange={setPhase} // ★ 回调阶段
          />

          {isArchive ? (
            <ArchiveChartBackdrop />
          ) : (
            <NightStarBackdrop />
          )}

          <Suspense fallback={null}>
            {/* 聚焦时暂停整体自转 */}
            <RotatingGroup paused={open}>
              {stars.map((star, i) => (
                <Star
                  key={i}
                  position={star.position}
                  index={i}
                  onClick={handleStarClick}
                  color={star.color}
                  emissive={star.emissive}
                  name={star.name}
                  distanceScale={1}
                  isActive={open && selectedIndex === i}
                  prominence={star.prominence}
                  densityScale={starDensityScale}
                  worldPositionRef={starWorldPositionRefs[i]}
                  themeMode={mode}
                  suppressHoverLabel={open}
                />
              ))}

              {/* 选中星体上的 Html 面板（高 zIndex；不 occlude） */}
              {open && selectedStar && (
                <Html
                  position={selectedStar.position.toArray()}
                  sprite
                  center
                  transform={false}
                  distanceFactor={7}
                  pointerEvents="auto"
                  zIndexRange={[100, 0]}
                >
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                      'atlas-panel-enter relative translate-x-12 translate-y-8 select-none border px-4 py-3 shadow-lg backdrop-blur-md',
                      isArchive
                        ? 'border-[rgba(36,48,64,0.18)] bg-[rgba(255,255,252,0.82)] text-[#172033] supports-[backdrop-filter]:bg-[rgba(255,255,252,0.74)]'
                        : 'border-white/14 bg-[#05070d]/76 text-white supports-[backdrop-filter]:bg-[#05070d]/64',
                    )}
                    style={{
                      minWidth: 260,
                      maxWidth: 340,
                      boxShadow: isArchive
                        ? '0 18px 46px rgba(36,48,64,0.12)'
                        : '0 22px 70px rgba(0,0,0,0.54), 0 0 34px rgba(170,215,220,0.12)',
                    }}
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute -left-10 top-1/2 hidden h-px w-10 bg-gradient-to-l to-transparent sm:block',
                        isArchive ? 'from-[rgba(36,48,64,0.34)]' : 'from-white/34',
                      )}
                    />
                    <div
                      className={cn(
                        'pointer-events-none absolute -left-12 top-1/2 hidden size-1 -translate-y-1/2 rounded-full sm:block',
                        isArchive
                          ? 'bg-[#477c86]/65 shadow-[0_0_8px_rgba(71,124,134,0.24)]'
                          : 'bg-white/55 shadow-[0_0_12px_rgba(220,240,255,0.8)]',
                      )}
                    />

                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <div
                          className={cn(
                            'text-[10px] font-semibold uppercase',
                            isArchive ? 'text-[#66727f]' : 'text-white/42',
                          )}
                          style={{ letterSpacing: '0.22em' }}
                        >
                          signal {String((selectedIndex ?? 0) + 1).padStart(2, '0')}
                        </div>
                        <div
                          className={cn(
                            'mt-1 text-sm font-semibold uppercase',
                            isArchive ? 'text-[#172033]' : 'text-white/92',
                          )}
                          style={{ letterSpacing: '0.14em' }}
                        >
                          {selectedStar.name}
                        </div>
                      </div>
                      <button
                        className={cn(
                          'pointer-events-auto grid size-7 place-items-center border text-sm leading-none transition-colors',
                          isArchive
                            ? 'border-[rgba(36,48,64,0.16)] text-[#66727f] hover:border-[rgba(36,48,64,0.28)] hover:text-[#172033]'
                            : 'border-white/12 text-white/50 hover:border-white/24 hover:text-white/88',
                        )}
                        type="button"
                        aria-label="Close star details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                        }}
                      >
                        x
                      </button>
                    </div>

                    <div
                      className={cn(
                        'mb-3 h-px bg-gradient-to-r to-transparent',
                        isArchive
                          ? 'from-[rgba(36,48,64,0.18)] via-[rgba(36,48,64,0.08)]'
                          : 'from-white/18 via-white/8',
                      )}
                    />

                    <div
                      className={cn(
                        'text-xs leading-relaxed',
                        isArchive ? 'text-[#66727f]' : 'text-white/70',
                      )}
                    >
                      {selectedStar.description}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div
                        className={cn(
                          'text-[10px] uppercase',
                          isArchive ? 'text-[#8a94a0]' : 'text-white/34',
                        )}
                        style={{ letterSpacing: '0.18em' }}
                      >
                        mapped object
                      </div>
                      <Button
                        size="sm"
                        className={cn(
                          'h-7 px-3 text-[11px] uppercase',
                          isArchive
                            ? 'border border-[#172033] bg-[#172033] text-[#f7f8f3] hover:bg-[#172033]/90'
                            : 'border border-white/15 bg-white/90 text-[#05070d] hover:bg-white',
                        )}
                        style={{ letterSpacing: '0.12em' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(selectedStar.url);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </Html>
              )}
            </RotatingGroup>
          </Suspense>
        </Canvas>
      </div>

      {/* 前景 UI 层（不挡拖拽；真正可点元素单独开 pointer-events） */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <section
          className={cn(
            'absolute left-6 top-6 max-w-[min(26rem,calc(100vw-3rem))] sm:left-10 sm:top-9',
            isArchive ? 'text-[#172033]' : 'text-white',
          )}
        >
          <div
            className={cn(
              'mb-4 h-px w-20 bg-gradient-to-r to-transparent',
              isArchive ? 'from-[rgba(36,48,64,0.48)]' : 'from-white/55',
            )}
          />
          <p
            className={cn(
              'mb-3 text-[10px] font-medium uppercase',
              isArchive ? 'text-[#66727f]' : 'text-white/48',
            )}
            style={{ letterSpacing: '0.24em' }}
          >
            stardust index
          </p>
          <h1
            className={cn(
              'text-4xl font-light leading-none sm:text-6xl',
              isArchive
                ? 'text-[#172033]'
                : 'text-white/92 drop-shadow-[0_2px_18px_rgba(0,0,0,0.82)]',
            )}
          >
            ほしくず
          </h1>
          <p
            className={cn(
              'mt-4 max-w-72 text-sm leading-6 sm:text-[15px]',
              isArchive
                ? 'text-[#66727f]'
                : 'text-white/64 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]',
            )}
          >
            Quiet signals, small tools, and drifting experiments gathered into one night sky.
          </p>
        </section>

        <div className="absolute bottom-5 right-5 flex items-center gap-3 pointer-events-none sm:bottom-7 sm:right-7">
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              'pointer-events-auto text-[11px] font-medium uppercase transition-colors',
              isArchive ? 'text-[#66727f] hover:text-[#172033]' : 'text-white/48 hover:text-white/88',
            )}
            style={{ letterSpacing: '0.12em' }}
          >
            {isArchive ? 'Archive Sheet' : 'Night Atlas'}
          </button>
          <span className={isArchive ? 'text-[#8a94a0]' : 'text-white/18'}>/</span>
          <Link
            href="/privacy-policy"
            className={cn(
              'pointer-events-auto text-[11px] font-medium uppercase transition-colors',
              isArchive ? 'text-[#66727f] hover:text-[#172033]' : 'text-white/48 hover:text-white/88',
            )}
            style={{ letterSpacing: '0.12em' }}
          >
            Privacy
          </Link>
          <span className={isArchive ? 'text-[#8a94a0]' : 'text-white/18'}>/</span>
          <Link
            href="/terms-of-service"
            className={cn(
              'pointer-events-auto text-[11px] font-medium uppercase transition-colors',
              isArchive ? 'text-[#66727f] hover:text-[#172033]' : 'text-white/48 hover:text-white/88',
            )}
            style={{ letterSpacing: '0.12em' }}
          >
            Terms
          </Link>
        </div>
      </div>
    </>
  );
}
