'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Text, 
  Environment, 
  OrbitControls,
  Stars,
  PerspectiveCamera,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';

function CurrencyParticles({ count = 60 }: { count?: number }) {
  const symbols = ['$', 'AI', 'INTEL', 'BURN', 'SAVE'];
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25
        ] as [number, number, number],
        speed: Math.random() * 0.4 + 0.1,
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
    ref.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.005;
    ref.current.rotation.y += 0.005;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <Text
        fontSize={0.2}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf"
        fillOpacity={0.2}
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
    backsideThickness: 0.5,
    transmission: 1,
    thickness: 1,
    roughness: 0,
    chromaticAberration: 0.5,
    anisotropy: 1,
    distortion: 0.5,
    distortionScale: 1.5,
    temporalDistortion: 0.2,
    clearcoat: 1,
    attenuationDistance: 1,
    attenuationColor: '#ffffff',
    color: '#0ea5e9',
  };

  useFrame((state) => {
    if (!mesh.current || !scanLineRef.current) return;
    mesh.current.rotation.y += 0.003;
    mesh.current.rotation.z += 0.001;
    
    // Scan line animation
    scanLineRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 2.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <group>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[2.5, 15]} />
          <MeshTransmissionMaterial {...config} />
        </mesh>
        
        {/* Pulsing Scan Line */}
        <group ref={scanLineRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.8, 0.02, 16, 100]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
        </group>

        {/* Outer Rings */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[4, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[3.5, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

function ConnectionLines({ count = 40 }: { count?: number }) {
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const p1 = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
      const p2 = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
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
    (ref.current.material as THREE.LineBasicMaterial).opacity = 0.05 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
  });

  return (
    <line ref={ref as any}>
      <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color="#3b82f6" transparent opacity={0.05} />
    </line>
  );
}

export default function ExperienceScene() {
  return (
    <div className="h-screen w-full bg-[#050505]">
      <Canvas dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={45} />
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#0ea5e9" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <CurrencyParticles count={50} />
        <ConnectionLines count={40} />
        <CentralLens />
        
        <ContactShadows 
          position={[0, -5, 0]} 
          opacity={0.3} 
          scale={30} 
          blur={3} 
          far={10} 
        />
        
        <Environment preset="night" />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.3} 
        />
      </Canvas>
    </div>
  );
}
