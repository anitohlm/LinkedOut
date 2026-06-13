"use client";

import React from "react";
import { motion } from "framer-motion";

interface Props {
  id: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Universes with dedicated full-color emblem art (rendered as images, not SVG).
const IMAGE_ICONS = new Set(["medieval", "cyberpunk", "pirate", "dragon", "galactic", "vampire"]);

export default function UniverseIcon({ id, size = 20, color = "currentColor", strokeWidth = 1.5 }: Props) {
  // Use the dedicated emblem artwork when available.
  if (IMAGE_ICONS.has(id)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/universe-icons/${id}.png`}
        alt=""
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
      />
    );
  }

  const s = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const sf = { ...s, fill: color, fillOpacity: 0.15 };

  const paths: Record<string, React.ReactNode> = {
    medieval: (
      // Shield with ornate crown + checkmark
      <>
        <path d="M12 2L3 6.5v6C3 17.8 7 21.5 12 23c5-1.5 9-5.2 9-10.5v-6L12 2z" {...sf} />
        <path d="M12 2L3 6.5v6C3 17.8 7 21.5 12 23c5-1.5 9-5.2 9-10.5v-6L12 2z" {...s} />
        <path d="M8 12.5l2.5 2.5 5-5" {...s} strokeWidth={strokeWidth * 1.2} />
        <path d="M9 7h1.5M13.5 7H15M12 5.5v2" {...s} strokeWidth={strokeWidth * 0.8} />
      </>
    ),
    cyberpunk: (
      // Hexagon with glowing circuit trace
      <>
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" {...sf} />
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" {...s} />
        <path d="M7 12h2.5l1.5-2.5 2 5 1.5-2.5H17" {...s} strokeWidth={strokeWidth * 1.1} />
        <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
      </>
    ),
    pirate: (
      // Anchor with rope loop
      <>
        <circle cx="12" cy="6.5" r="2.5" {...sf} />
        <circle cx="12" cy="6.5" r="2.5" {...s} />
        <path d="M12 9v12" {...s} />
        <path d="M6.5 12.5h11" {...s} />
        <path d="M6.5 21.5a5.5 5.5 0 010-5" {...s} />
        <path d="M17.5 21.5a5.5 5.5 0 000-5" {...s} />
        <path d="M8 6.5H5M19 6.5h-3" {...s} strokeWidth={strokeWidth * 0.8} />
      </>
    ),
    dragon: (
      // Dragon flame with inner core
      <>
        <path d="M12 22c-4.5 0-7-3.5-7-7 0-4.5 3.5-6.5 3.5-10C10 7 10 9.5 12 11c.5-2.5 2.5-5 3.5-6 0 3.5 3.5 5.5 3.5 10 0 3.5-2.5 7-7 7z" {...sf} />
        <path d="M12 22c-4.5 0-7-3.5-7-7 0-4.5 3.5-6.5 3.5-10C10 7 10 9.5 12 11c.5-2.5 2.5-5 3.5-6 0 3.5 3.5 5.5 3.5 10 0 3.5-2.5 7-7 7z" {...s} />
        <path d="M12 18c-1.5 0-2.5-1.2-2.5-2.5 0-1.8 1.5-2.5 1.5-4C12 12.5 12 13.5 12 14.5c.3-1 1-2 1.5-2.5 0 1.5 1 2.2 1 3.5C14.5 16.8 13.5 18 12 18z" fill={color} fillOpacity={0.4} stroke="none" />
      </>
    ),
    galactic: (
      // Planet with orbit rings
      <>
        <circle cx="12" cy="12" r="3.5" {...sf} />
        <circle cx="12" cy="12" r="3.5" {...s} />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.5" {...s} strokeWidth={strokeWidth * 0.9} />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.5" transform="rotate(55 12 12)" {...s} strokeWidth={strokeWidth * 0.7} strokeOpacity={0.5} />
        <circle cx="18" cy="9.5" r="1" fill={color} stroke="none" fillOpacity={0.7} />
      </>
    ),
    vampire: (
      // Moon phase animation: full → waning crescent → new moon → waxing crescent → full
      // Shadow disc (slightly larger than moon) slides L↔R to reveal/hide the lit surface
      <>
        <defs>
          <mask id="moon-phase-mask">
            {/* Moon disc defines the visible area */}
            <circle cx="12" cy="12" r="9.5" fill="white" />
            {/* Shadow disc eats into it — r must be ≥ moon r to fully cover at center */}
            <motion.circle
              cx="12" cy="12" r="10"
              fill="black"
              animate={{ x: [-9, -4, 0, 4, 9, 4, 0, -4, -9] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1],
              }}
            />
          </mask>
        </defs>

        {/* Dark disc base — always rendered, visible as "new moon" silhouette */}
        <circle cx="12" cy="12" r="9.5" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={strokeWidth * 0.5} strokeOpacity={0.3} />

        {/* Bright lit surface — only the unmasked crescent shows through */}
        <circle cx="12" cy="12" r="9.5" fill={color} fillOpacity={0.75} stroke="none" mask="url(#moon-phase-mask)" />
        {/* Hard stroke on the lit crescent edge for extra sharpness */}
        <circle cx="12" cy="12" r="9.5" fill="none" stroke={color} strokeWidth={strokeWidth} strokeOpacity={0.9} mask="url(#moon-phase-mask)" />

        {/* Two fang drips below the moon */}
        <path d="M10.5 20.5l-1-3M13.5 20.5l1-3" fill="none" stroke={color} strokeWidth={strokeWidth * 0.85} strokeLinecap="round" strokeOpacity={0.75} />
      </>
    ),
    legendary: (
      // Crown with gems
      <>
        <path d="M3 18l2.5-9 3.5 4.5L12 5l3 8.5 3.5-4.5L21 18H3z" {...sf} />
        <path d="M3 18l2.5-9 3.5 4.5L12 5l3 8.5 3.5-4.5L21 18H3z" {...s} />
        <path d="M3 18h18" {...s} />
        <circle cx="12" cy="10" r="1" fill={color} stroke="none" />
        <circle cx="7" cy="13" r="0.8" fill={color} stroke="none" fillOpacity={0.6} />
        <circle cx="17" cy="13" r="0.8" fill={color} stroke="none" fillOpacity={0.6} />
      </>
    ),
    shadow: (
      // Eye with slash
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" {...s} />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" {...s} />
        <line x1="1" y1="1" x2="23" y2="23" {...s} />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {paths[id] ?? (
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
      )}
    </svg>
  );
}
