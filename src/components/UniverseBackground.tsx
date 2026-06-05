"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UniverseType } from "@/types";

interface Props {
  universeId: UniverseType;
  color: string;
}

/**
 * Themed ambient background that adapts to each universe.
 * Pure CSS gradients + blurred blobs + a per-theme motif layer.
 * Sits behind content at z-index 0 and never blocks interaction.
 */
export default function UniverseBackground({ universeId, color }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base vignette tint */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${color}14, transparent 60%), var(--bg)`,
      }} />

      {/* Breathing accent blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: 520, height: 420, borderRadius: "50%",
          background: color, filter: "blur(120px)",
        }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: 460, height: 460, borderRadius: "50%",
          background: color, filter: "blur(130px)",
        }}
      />

      {/* Per-universe motif */}
      <ThemeMotif universeId={universeId} color={color} />

      {/* Bottom fade so content stays readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 30%, var(--bg) 95%)",
      }} />
    </div>
  );
}

function ThemeMotif({ universeId, color }: Props) {
  switch (universeId) {
    case "galactic":
      return <Starfield color={color} />;
    case "cyberpunk":
      return <NeonGrid color={color} />;
    case "pirate":
      return <Waves color={color} />;
    case "dragon":
      return <Embers color={color} />;
    case "vampire":
      return <Mist color={color} />;
    case "medieval":
      return <GoldDust color={color} />;
    default:
      return null;
  }
}

/* ── Galactic: drifting stars ── */
function Starfield({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    for (let i = 0; i < 70; i++) {
      const s = document.createElement("div");
      const size = Math.random() * 2 + 1;
      Object.assign(s.style, {
        position: "absolute", borderRadius: "50%",
        background: Math.random() > 0.7 ? color : "#fff",
        width: `${size}px`, height: `${size}px`,
        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
        opacity: String(Math.random() * 0.6 + 0.1),
        animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 4}s`,
      });
      c.appendChild(s);
    }
    return () => { c.innerHTML = ""; };
  }, [color]);
  return <div ref={ref} style={{ position: "absolute", inset: 0 }} />;
}

/* ── Cyberpunk: perspective neon grid ── */
function NeonGrid({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.18, perspective: "400px", overflow: "hidden" }}>
      <div style={{
        position: "absolute", bottom: 0, left: "-50%", width: "200%", height: "70%",
        backgroundImage: `linear-gradient(${color}55 1px, transparent 1px), linear-gradient(90deg, ${color}55 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        transform: "rotateX(60deg)",
        transformOrigin: "bottom",
        maskImage: "linear-gradient(to top, black, transparent 80%)",
        WebkitMaskImage: "linear-gradient(to top, black, transparent 80%)",
      }} />
    </div>
  );
}

/* ── Pirate: layered ocean waves ── */
function Waves({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", overflow: "hidden", opacity: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", bottom: `${i * 18}px`, left: "-10%", width: "120%", height: 120,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 100%, ${color}${20 - i * 6}, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Dragon: rising embers ── */
function Embers({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    for (let i = 0; i < 30; i++) {
      const e = document.createElement("div");
      const size = Math.random() * 3 + 1.5;
      Object.assign(e.style, {
        position: "absolute", borderRadius: "50%",
        background: color, boxShadow: `0 0 6px ${color}`,
        width: `${size}px`, height: `${size}px`,
        bottom: `-10px`, left: `${Math.random() * 100}%`,
        opacity: String(Math.random() * 0.5 + 0.2),
        animation: `ember-rise ${6 + Math.random() * 6}s linear infinite`,
        animationDelay: `${Math.random() * 6}s`,
      });
      c.appendChild(e);
    }
    return () => { c.innerHTML = ""; };
  }, [color]);
  return (
    <>
      <style>{`@keyframes ember-rise { 0% { transform: translateY(0) translateX(0); opacity: 0 } 10% { opacity: .6 } 100% { transform: translateY(-100vh) translateX(30px); opacity: 0 } }`}</style>
      <div ref={ref} style={{ position: "absolute", inset: 0 }} />
    </>
  );
}

/* ── Vampire: slow gothic mist ── */
function Mist({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.4 }}>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          animate={{ x: ["-20%", "20%", "-20%"], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 16 + i * 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: `${20 + i * 40}%`, left: 0, width: "140%", height: 200,
            background: `radial-gradient(ellipse, ${color}30, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Medieval: floating gold dust ── */
function GoldDust({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    for (let i = 0; i < 24; i++) {
      const d = document.createElement("div");
      const size = Math.random() * 2 + 1;
      Object.assign(d.style, {
        position: "absolute", borderRadius: "50%",
        background: color, boxShadow: `0 0 4px ${color}`,
        width: `${size}px`, height: `${size}px`,
        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
        opacity: String(Math.random() * 0.4 + 0.15),
        animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
      });
      c.appendChild(d);
    }
    return () => { c.innerHTML = ""; };
  }, [color]);
  return <div ref={ref} style={{ position: "absolute", inset: 0 }} />;
}
