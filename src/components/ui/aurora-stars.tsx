"use client";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export function AuroraStars() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Stars radius={50} count={2500} factor={4} fade speed={2} />
    </Canvas>
  );
}
