'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ 
  position, 
  color, 
  speed = 1, 
  distort = 0.4, 
  radius = 1 
}: { 
  position: [number, number, number]; 
  color: string; 
  speed?: number; 
  distort?: number;
  radius?: number;
}) {
  return (
    <Float speed={speed * 2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[radius, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={radius}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);

  // Parallax effect on mouse move
  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = state.mouse;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.2, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.2, 0.1);
  });

  return (
    <group ref={group}>
      <FloatingShape 
        position={[-4, 2, -2]} 
        color="#8b5cf6" // Purple
        speed={1.2} 
        distort={0.3} 
        radius={1.2} 
      />
      <FloatingShape 
        position={[4, -1, -3]} 
        color="#3b82f6" // Blue
        speed={0.8} 
        distort={0.5} 
        radius={1.5} 
      />
      <FloatingShape 
        position={[0, 0, -5]} 
        color="#10b981" // Emerald
        speed={1.5} 
        distort={0.4} 
        radius={0.8} 
      />
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full opacity-40">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Scene />
      </Canvas>
    </div>
  );
}
