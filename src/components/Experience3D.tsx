'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Text, 
  Environment, 
  OrbitControls,
  Stars,
  PerspectiveCamera,
  ContactShadows,
  Instances,
  Instance
} from '@react-three/drei';
import * as THREE from 'three';

function CurrencyParticles({ count = 50 }: { count?: number }) {
  const symbols = ['$', '€', '£', '¥'];
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        speed: Math.random() * 0.5 + 0.1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number]
      });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {particles.map((p, i) => (
        <CurrencyItem key={i} {...p} />
      ))}
    </group>
  );
}

function CurrencyItem({ position, speed, symbol, rotation }: { position: [number, number, number], speed: number, symbol: string, rotation: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.01;
    ref.current.rotation.y += 0.01;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <Text
        fontSize={0.5}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf"
      >
        {symbol}
      </Text>
    </group>
  );
}

function CentralLens() {
  const mesh = useRef<THREE.Mesh>(null);
  const scanLineRef = useRef<THREE.Group>(null);
  const config = {
    backside: true,
    backsideThickness: 0.3,
    transmission: 1,
    thickness: 0.5,
    roughness: 0,
    chromaticAberration: 0.2,
    anisotropy: 1,
    distortion: 0.5,
    distortionScale: 1.0,
    temporalDistortion: 0.1,
    clearcoat: 1,
    attenuationDistance: 0.5,
    attenuationColor: '#ffffff',
    color: '#3b82f6',
  };

  useFrame((state) => {
    if (!mesh.current || !scanLineRef.current) return;
    mesh.current.rotation.y += 0.005;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    
    // Scan line animation
    scanLineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 2.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        <mesh ref={mesh}>
          <sphereGeometry args={[2.2, 64, 64]} />
          <MeshTransmissionMaterial {...config} />
        </mesh>
        
        {/* Pulsing Scan Line */}
        <group ref={scanLineRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.3, 0.015, 16, 100]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function ConnectionLines({ count = 20 }: { count?: number }) {
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const p1 = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
      const p2 = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
      temp.push({ p1, p2 });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {lines.map((l, i) => (
        <Line key={i} start={l.p1} end={l.p2} />
      ))}
    </group>
  );
}

function Line({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) {
  const ref = useRef<THREE.Line>(null);
  const points = useMemo(() => [start, end], [start, end]);
  
  useFrame((state) => {
    if (!ref.current) return;
    (ref.current.material as THREE.LineBasicMaterial).opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <line ref={ref as any}>
      <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color="#8b5cf6" transparent opacity={0.1} />
    </line>
  );
}

export default function ExperienceScene() {
  return (
    <div className="h-screen w-full bg-slate-950">
      <Canvas dpr={[1, 2]} shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <CurrencyParticles count={40} />
        <ConnectionLines count={30} />
        <CentralLens />
        
        <ContactShadows 
          position={[0, -4.5, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={4.5} 
        />
        
        <Environment preset="city" />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />
      </Canvas>
      
    </div>
  );
}
