'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

import type { RefObject } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type CameraPhase = 'idle' | 'focusing' | 'restoring';

export type CameraFocusProps = {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  target: THREE.Vector3 | null;
  active: boolean;
  zoomFactor?: number;
  inDamp?: number;
  outDamp?: number;
  onPhaseChange?: (p: CameraPhase) => void;
};

/** 相机聚焦/恢复（支持 onPhaseChange；聚焦时可拖拽；目标切换时会重新聚焦） */
export default function CameraFocus({
  controlsRef,
  target,
  active,
  zoomFactor = 0.65,
  inDamp = 3.8,
  outDamp = 3.2,
  onPhaseChange,
}: CameraFocusProps) {
  const { camera } = useThree();

  const prevCam = useRef(new THREE.Vector3());
  const prevTarget = useRef(new THREE.Vector3());
  const startCam = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endCam = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const progress = useRef(1);

  const mode = useRef<CameraPhase>('idle');
  const wasActive = useRef(false);

  // 记录最近一次用于聚焦的目标位置（用于检测目标切换）
  const lastFocusTarget = useRef(new THREE.Vector3(NaN, NaN, NaN));

  const setPhase = useCallback((p: CameraPhase) => {
    if (mode.current !== p) {
      mode.current = p;
      onPhaseChange?.(p);
    }
  }, [onPhaseChange]);

  // 聚焦动画进行中如用户开始拖拽，则取消动画（交出控制）
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      if (mode.current === 'focusing') setPhase('idle');
    };
    controls.addEventListener?.('start', onStart);
    return () => controls.removeEventListener?.('start', onStart);
  }, [controlsRef, setPhase]);

  // 进入/离开聚焦 + 目标切换时的再聚焦
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const beginMove = (nextTarget: THREE.Vector3, speed: CameraPhase) => {
      const focusDir = new THREE.Vector3().copy(camera.position).sub(controls.target);
      const focusDist = focusDir.length();
      if (focusDist > 0.0001) {
        focusDir.normalize();
      } else {
        focusDir.set(0, 0, 1);
      }

      startCam.current.copy(camera.position);
      startTarget.current.copy(controls.target);
      endTarget.current.copy(nextTarget);
      const minDistance = controls.minDistance || 0;
      const desiredDistance = Math.max(focusDist * zoomFactor, minDistance);
      endCam.current.copy(nextTarget).add(focusDir.multiplyScalar(desiredDistance));
      progress.current = 0;
      setPhase(speed);
    };

    if (active && target) {
      // 1) 首次进入聚焦：记录恢复用视角，并进入 focusing
      if (!wasActive.current) {
        prevCam.current.copy(camera.position);
        prevTarget.current.copy(controls.target);
        lastFocusTarget.current.copy(target);
        beginMove(target, 'focusing');
      } else {
        // 2) 已在聚焦状态下点了另一颗星：检测目标是否变化，变化则重新聚焦
        if (!target.equals(lastFocusTarget.current)) {
          // 不覆盖 prevCam/prevTarget，确保最后关闭还能回到最初视角
          lastFocusTarget.current.copy(target);
          beginMove(target, 'focusing');
        }
      }
    } else if (!active && wasActive.current) {
      // 离开聚焦 → 恢复
      startCam.current.copy(camera.position);
      startTarget.current.copy(controls.target);
      endCam.current.copy(prevCam.current);
      endTarget.current.copy(prevTarget.current);
      progress.current = 0;
      setPhase('restoring');
    }

    wasActive.current = active;
  }, [active, target, camera, controlsRef, setPhase, zoomFactor]);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (mode.current === 'focusing') {
      progress.current = Math.min(1, progress.current + dt * inDamp);
      const t = 1 - Math.pow(1 - progress.current, 4);
      camera.position.lerpVectors(startCam.current, endCam.current, t);
      controls.target.lerpVectors(startTarget.current, endTarget.current, t);
      camera.lookAt(controls.target);

      if (progress.current >= 1) {
        setPhase('idle');
      }
    }

    if (mode.current === 'restoring') {
      progress.current = Math.min(1, progress.current + dt * outDamp);
      const t = 1 - Math.pow(1 - progress.current, 4);
      camera.position.lerpVectors(startCam.current, endCam.current, t);
      controls.target.lerpVectors(startTarget.current, endTarget.current, t);
      camera.lookAt(controls.target);

      if (progress.current >= 1) {
        setPhase('idle');
      }
    }
  });

  return null;
}
