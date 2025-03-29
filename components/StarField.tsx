'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';
import { Anchor, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OrbitControls, Stars, Html, Trail } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import NextLink from 'next/link';

function getRandomPosition(radius = 4) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  );
}

function generateStarName() {
  const syllables = [
    'ka',
    'lu',
    'ra',
    'zo',
    'me',
    'shi',
    'to',
    'na',
    've',
    'xi',
  ];
  const name = Array.from(
    { length: 3 },
    () => syllables[Math.floor(Math.random() * syllables.length)],
  ).join('');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Star({
  position,
  index,
  onClick,
  color,
  emissive,
  name,
  isSelected,
  distanceScale,
}: {
  position: THREE.Vector3;
  index: number;
  onClick: (index: number) => void;
  color: string;
  emissive: string;
  name: string;
  isSelected: boolean;
  distanceScale: number;
}) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (ref.current) {
      const scale = (hovered || isSelected ? 1.8 : 1) * distanceScale;
      ref.current.scale.setScalar(scale);
      ref.current.position.x += Math.sin(Date.now() * 0.001 + index) * 0.0005;
      ref.current.position.y += Math.cos(Date.now() * 0.001 + index) * 0.0005;
    }
  });

  return (
    <group position={position}>
      <Trail width={1} length={4} color={color} attenuation={(t) => t * t}>
        <mesh
          ref={ref}
          onClick={() => onClick(index)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1.5 * distanceScale}
            transparent
            opacity={distanceScale}
          />
        </mesh>
      </Trail>
      {(hovered || isSelected) && (
        <Html
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
          position={[0, 0.4, 0]}
        >
          <div
            style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center' }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
      ref.current.rotation.x += 0.0005;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function StarField() {
  const [selected, setSelected] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const stars = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const position = getRandomPosition();
        const distance = position.length();
        const distanceScale = THREE.MathUtils.clamp(1 - distance / 15, 0.4, 1);
        return {
          position,
          index: i,
          color: new THREE.Color(
            `hsl(${Math.random() * 360}, 100%, 80%)`,
          ).getStyle(),
          emissive: new THREE.Color(
            `hsl(${Math.random() * 360}, 100%, 60%)`,
          ).getStyle(),
          name: generateStarName(),
          distanceScale,
        };
      }),
    [],
  );

  const handleClick = (index: number) => {
    setSelected(index);
    open();
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '2%',
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <Text size="xl" fw={700} c="white">
          Hoshikuzu Starfield
        </Text>
      </div>

      <Anchor
        href={'/privacy-policy'}
        component={NextLink}
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          color: 'white',
          fontSize: '0.9rem',
          opacity: 0.7,
          zIndex: 20,
          textDecoration: 'underline',
        }}
      >
        Privacy Policy
      </Anchor>

      <Canvas style={{ width: '100vw', height: '100vh', background: 'black' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            intensity={1.5}
          />
        </EffectComposer>

        <OrbitControls enableZoom={true} />
        <Stars radius={50} depth={50} count={5000} factor={4} fade speed={1} />

        <RotatingGroup>
          {stars.map((star) => (
            <Star
              key={star.index}
              position={star.position}
              index={star.index}
              onClick={handleClick}
              color={star.color}
              emissive={star.emissive}
              name={star.name}
              isSelected={selected === star.index}
              distanceScale={star.distanceScale}
            />
          ))}
        </RotatingGroup>
      </Canvas>

      <Modal opened={opened} onClose={close} title="星星信息" centered>
        <Text size="lg" ta="center">
          你点击了{' '}
          <strong>{selected !== null ? stars[selected].name : ''}</strong> 🌟
        </Text>
      </Modal>
    </>
  );
}
