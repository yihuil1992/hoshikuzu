'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type CameraPhase = 'idle' | 'focusing' | 'restoring';

export type CameraFocusProps = {
  controlsRef: React.RefObject<any>;
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

  // 进入聚焦当下的方向与距离（保证拖拽后再点也能居中）
  const focusDir = useRef(new THREE.Vector3());
  const focusDist = useRef(0);

  const mode = useRef<CameraPhase>('idle');
  const wasActive = useRef(false);

  // 记录最近一次用于聚焦的目标位置（用于检测目标切换）
  const lastFocusTarget = useRef(new THREE.Vector3(NaN, NaN, NaN));

  const setPhase = (p: CameraPhase) => {
    if (mode.current !== p) {
      mode.current = p;
      onPhaseChange?.(p);
    }
  };

  // 聚焦动画进行中如用户开始拖拽，则取消动画（交出控制）
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      if (mode.current === 'focusing') setPhase('idle');
    };
    controls.addEventListener?.('start', onStart);
    return () => controls.removeEventListener?.('start', onStart);
  }, [controlsRef]);

  // 进入/离开聚焦 + 目标切换时的再聚焦
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 工具函数：基于“当前相机与当前 controls.target”刷新聚焦向量与距离
    const refreshFocusVector = () => {
      focusDir.current.copy(camera.position).sub(controls.target).normalize();
      focusDist.current = camera.position.distanceTo(controls.target);
    };

    if (active && target) {
      // 1) 首次进入聚焦：记录恢复用视角，并进入 focusing
      if (!wasActive.current) {
        prevCam.current.copy(camera.position);
        prevTarget.current.copy(controls.target);
        refreshFocusVector();
        lastFocusTarget.current.copy(target);
        setPhase('focusing');
      } else {
        // 2) 已在聚焦状态下点了另一颗星：检测目标是否变化，变化则重新聚焦
        if (!target.equals(lastFocusTarget.current)) {
          // 不覆盖 prevCam/prevTarget，确保最后关闭还能回到最初视角
          refreshFocusVector();
          lastFocusTarget.current.copy(target);
          setPhase('focusing');
        }
      }
    } else if (!active && wasActive.current) {
      // 离开聚焦 → 恢复
      setPhase('restoring');
    }

    wasActive.current = active;
  }, [active, target, camera, controlsRef]);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (mode.current === 'focusing' && target) {
      const desiredPos = new THREE.Vector3()
        .copy(target)
        .add(focusDir.current.clone().multiplyScalar(focusDist.current * zoomFactor));

      const k = Math.min(1, dt * inDamp);
      camera.position.lerp(desiredPos, k);
      controls.target.lerp(target, k);
      camera.lookAt(controls.target);

      if (
        camera.position.distanceTo(desiredPos) < 0.01 &&
        controls.target.distanceTo(target) < 0.005
      ) {
        setPhase('idle');
      }
    }

    if (mode.current === 'restoring') {
      const k = Math.min(1, dt * outDamp);
      camera.position.lerp(prevCam.current, k);
      controls.target.lerp(prevTarget.current, k);
      camera.lookAt(controls.target);

      if (
        camera.position.distanceTo(prevCam.current) < 0.01 &&
        controls.target.distanceTo(prevTarget.current) < 0.005
      ) {
        setPhase('idle');
      }
    }
  });

  return null;
}
