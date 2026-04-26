'use client';

/* eslint-disable react/no-unknown-property */

import { OrbitControls, Stars, Sparkles, Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { presetStars } from '@/constants/star-presets';
import {
  computeSafeRadius,
} from '@/lib/helpers';

import CameraFocus, { CameraPhase } from './camera-focus'; // ★ 引入独立组件
import { RotatingGroup } from './rotating-group';
import { Star } from './star';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export default function StarField() {
  const router = useRouter();
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
          [0.08, 0.34, 0],
          [0.56, 0.18, 0],
          [-0.34, -0.34, 0],
          [0.36, -0.52, 0],
        ]
      : [
          [0.22, 0.2, 0],
          [-0.28, -0.16, 0],
          [0.24, -0.42, 0],
          [-0.18, 0.44, 0],
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
    () => THREE.MathUtils.clamp(Math.sqrt(36 / Math.max(presetStars.length, 1)), 0.7, 3.2),
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

  return (
    <>
      {/* 3D 背景层 */}
      <div className="fixed inset-0 z-0 bg-[#02040a]">
        <Canvas
          className="absolute inset-0"
          gl={{ alpha: false }}
          camera={{ position: [0, 0, 9.5], fov: 50 }}
          onPointerMissed={() => {
            if (open) handleClose();
          }}
        >
          <color attach="background" args={['#02040a']} />
          <fog attach="fog" args={['#02040a', 12, 42]} />

          <ambientLight intensity={0.42} />
          <pointLight position={[-7, 6, 8]} intensity={1.3} color="#f5f0dc" />
          <pointLight position={[6, -4, 5]} intensity={0.55} color="#9ad7d8" />

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

          <Stars radius={76} depth={64} count={5600} factor={3.1} fade speed={0.55} />
          <Sparkles size={1.4} speed={0.18} count={34} scale={28} opacity={0.24} color="#b9e4ee" />

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
                    className="relative translate-x-12 translate-y-8 select-none border border-white/14 bg-[#05070d]/76 px-4 py-3 text-white shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-[#05070d]/64"
                    style={{
                      minWidth: 260,
                      maxWidth: 340,
                      boxShadow: '0 22px 70px rgba(0,0,0,0.54), 0 0 34px rgba(170,215,220,0.12)',
                    }}
                  >
                    <div className="pointer-events-none absolute -left-10 top-1/2 hidden h-px w-10 bg-gradient-to-l from-white/34 to-transparent sm:block" />
                    <div className="pointer-events-none absolute -left-12 top-1/2 hidden size-1 -translate-y-1/2 rounded-full bg-white/55 shadow-[0_0_12px_rgba(220,240,255,0.8)] sm:block" />

                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <div
                          className="text-[10px] font-semibold uppercase text-white/42"
                          style={{ letterSpacing: '0.22em' }}
                        >
                          signal {String((selectedIndex ?? 0) + 1).padStart(2, '0')}
                        </div>
                        <div
                          className="mt-1 text-sm font-semibold uppercase text-white/92"
                          style={{ letterSpacing: '0.14em' }}
                        >
                          {selectedStar.name}
                        </div>
                      </div>
                      <button
                        className="pointer-events-auto grid size-7 place-items-center border border-white/12 text-sm leading-none text-white/50 transition-colors hover:border-white/24 hover:text-white/88"
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

                    <div className="mb-3 h-px bg-gradient-to-r from-white/18 via-white/8 to-transparent" />

                    <div className="text-xs leading-relaxed text-white/70">{selectedStar.description}</div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase text-white/34" style={{ letterSpacing: '0.18em' }}>
                        mapped object
                      </div>
                      <Button
                        size="sm"
                        className="h-7 border border-white/15 bg-white/90 px-3 text-[11px] uppercase text-[#05070d] hover:bg-white"
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
        <section className="absolute left-6 top-6 max-w-[min(26rem,calc(100vw-3rem))] text-white sm:left-10 sm:top-9">
          <div className="mb-4 h-px w-20 bg-gradient-to-r from-white/55 to-transparent" />
          <p
            className="mb-3 text-[10px] font-medium uppercase text-white/48"
            style={{ letterSpacing: '0.24em' }}
          >
            stardust index
          </p>
          <h1 className="text-4xl font-light leading-none text-white/92 drop-shadow-[0_2px_18px_rgba(0,0,0,0.82)] sm:text-6xl">
            ほしくず
          </h1>
          <p className="mt-4 max-w-72 text-sm leading-6 text-white/64 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)] sm:text-[15px]">
            Quiet signals, small tools, and drifting experiments gathered into one night sky.
          </p>
        </section>

        <div className="absolute bottom-5 right-5 flex items-center gap-3 pointer-events-none sm:bottom-7 sm:right-7">
          <Link
            href="/privacy-policy"
            className="pointer-events-auto text-[11px] font-medium uppercase text-white/48 transition-colors hover:text-white/88"
            style={{ letterSpacing: '0.12em' }}
          >
            Privacy
          </Link>
          <span className="text-white/18">/</span>
          <Link
            href="/terms-of-service"
            className="pointer-events-auto text-[11px] font-medium uppercase text-white/48 transition-colors hover:text-white/88"
            style={{ letterSpacing: '0.12em' }}
          >
            Terms
          </Link>
        </div>
      </div>
    </>
  );
}
