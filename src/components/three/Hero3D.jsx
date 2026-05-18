import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingGeometry() {
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame(({ pointer, clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * Math.PI * 0.3,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * Math.PI * 0.15,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.5}>
        {/* Plato principal - torus ornamentado */}
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <torusKnotGeometry args={[1.2, 0.3, 128, 32, 2, 3]} />
          <MeshDistortMaterial
            color="#ee7a12"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.9}
            emissive="#441100"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      {/* Partículas orbitales */}
      <Float speed={3} rotationIntensity={0.8} floatIntensity={2}>
        <mesh position={[2.5, 0.5, 0]}>
          <icosahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#f19433" emissive="#ff6a00" emissiveIntensity={1.5} />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.8}>
        <mesh position={[-2.2, -0.3, 0.5]}>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#fad7a5" emissive="#ffaa00" emissiveIntensity={1} />
        </mesh>
      </Float>
      <Float speed={4} rotationIntensity={1} floatIntensity={2.2}>
        <mesh position={[1.8, -1.5, -0.5]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#ee7a12" emissive="#ff4400" emissiveIntensity={1.2} />
        </mesh>
      </Float>
      <Float speed={3.5} rotationIntensity={0.7} floatIntensity={2.5}>
        <mesh position={[-1.5, 1.8, 0.3]}>
          <dodecahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color="#df6008" emissive="#cc3300" emissiveIntensity={1} />
        </mesh>
      </Float>

      {/* Aro decorativo inferior */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

export default function Hero3D({ className = '' }) {
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1.5} color="#ffaa00" />
        <pointLight position={[-5, -2, 3]} intensity={0.6} color="#ee7a12" />
        <pointLight position={[0, 0, -5]} intensity={0.3} color="#441100" />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}
