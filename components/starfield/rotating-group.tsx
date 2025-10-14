'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, PropsWithChildren } from 'react';
import * as THREE from 'three';

export function RotatingGroup({
  children,
  paused = false,
}: PropsWithChildren<{ paused?: boolean }>) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current && !paused) {
      ref.current.rotation.y += 0.001;
      ref.current.rotation.x += 0.0005;
    }
  });
  return <group ref={ref}>{children}</group>;
}
