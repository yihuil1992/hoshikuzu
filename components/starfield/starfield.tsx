'use client';

import { OrbitControls, Stars, Sparkles, Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlendFunction } from 'postprocessing';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

import { Button } from '@/components/ui/button';
import { presetStars } from '@/constants/star-presets';
import { useRadialGlowTexture } from '@/hooks/use-radial-glow-texture';
import {
  computeSafeRadius,
  getRandomPosition,
  randOnDisk,
  samplePositionsOnDisk,
} from '@/lib/helpers';

import CameraFocus, { CameraPhase } from './camera-focus'; // ★ 引入独立组件
import { RotatingGroup } from './rotating-group';
import { Star } from './star';

export default function StarField() {
  const router = useRouter();
  const glowTexture = useRadialGlowTexture();
  const controlsRef = useRef<any>(null);

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
    const rMin = SAFE_RADIUS * 0.35; // 内圈（避免挤在中心）
    const rMax = SAFE_RADIUS; // 外圈（保证屏内可见）
    const minDist = SAFE_RADIUS * 0.18; // ★ 最小间距（可调：0.12 ~ 0.22 都挺好）

    const positions = samplePositionsOnDisk(presetStars.length, rMin, rMax, minDist);

    return presetStars.map((s, i) => ({
      ...s,
      position: positions[i],
    }));
  }, [SAFE_RADIUS]);

  // 选中 & 面板
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleStarClick = (index: number) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false); // 进入 restoring，回到原视角
    setSelectedIndex(null);
  };

  return (
    <>
      {/* 3D 背景层 */}
      <div className="fixed inset-0 z-0">
        <Canvas
          gl={{ alpha: false }}
          camera={{ position: [0, 0, 9.5], fov: 50 }}
          onPointerMissed={() => {
            if (open) handleClose();
          }}
        >
          <color attach="background" args={['#03040a']} />
          <fog attach="fog" args={['#02030a', 15, 45]} />

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.05} luminanceSmoothing={1.1} intensity={1.6} />
            <Vignette eskil={false} offset={0.18} darkness={0.6} />
            <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.035} />
          </EffectComposer>

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
            target={selectedStar ? (selectedStar.position as THREE.Vector3) : null}
            active={open}
            zoomFactor={0.6}
            inDamp={4.2}
            outDamp={3.2}
            onPhaseChange={setPhase} // ★ 回调阶段
          />

          <Stars radius={70} depth={60} count={7000} factor={3.5} fade speed={0.8} />
          <Sparkles size={2} speed={0.3} count={40} scale={30} opacity={0.35} color="#8fd7ff" />

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
                glowTexture={glowTexture}
              />
            ))}

            {/* 选中星体上的 Html 面板（高 zIndex；不 occlude） */}
            {open && selectedStar && (
              <Html
                position={selectedStar.position.toArray()}
                sprite
                center
                distanceFactor={7}
                pointerEvents="auto"
                zIndexRange={[100, 0]}
              >
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="select-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/10"
                  style={{ minWidth: 240, maxWidth: 320, boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}
                >
                  <div className="mb-2 text-center text-sm font-semibold">{selectedStar.name}</div>
                  <div className="text-xs text-white/80">{selectedStar.description}</div>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(selectedStar.url);
                      }}
                    >
                      打开
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                      }}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </Html>
            )}
          </RotatingGroup>
        </Canvas>
      </div>

      {/* 前景 UI 层（不挡拖拽；真正可点元素单独开 pointer-events） */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
          <Link
            href="/privacy-policy"
            className="underline text-white/80 hover:text-white pointer-events-auto"
          >
            Privacy Policy
          </Link>
          <span className="text-white/30">•</span>
          <Link
            href="/terms-of-service"
            className="underline text-white/80 hover:text-white pointer-events-auto"
          >
            Terms
          </Link>
        </div>
      </div>
    </>
  );
}
