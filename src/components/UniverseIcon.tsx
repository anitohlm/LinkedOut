"use client";

import React from "react";

interface Props {
  id: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function UniverseIcon({ id, size = 20, color = "currentColor", strokeWidth = 1.5 }: Props) {
  const s = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

  const paths: Record<string, React.ReactNode> = {
    medieval: (
      // Shield with crown mark
      <>
        <path d="M12 3L4 7v5c0 5 3.6 8.5 8 10 4.4-1.5 8-5 8-10V7L12 3z" {...s} />
        <path d="M9 11l2 2 4-4" {...s} />
      </>
    ),
    cyberpunk: (
      // Hexagon with circuit pulse
      <>
        <path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9L12 3z" {...s} />
        <path d="M8 12h2l1-2 2 4 1-2h2" {...s} />
      </>
    ),
    pirate: (
      // Anchor
      <>
        <circle cx="12" cy="7" r="2.5" {...s} />
        <path d="M12 9.5V20" {...s} />
        <path d="M7 13h10" {...s} />
        <path d="M7 20c0-2.5 2-4 5-4s5 1.5 5 4" {...s} />
      </>
    ),
    dragon: (
      // Flame
      <>
        <path d="M12 21c-4 0-6-3-6-6 0-4 3-6 3-9 1.5 2 1.5 4 3 5 .5-2 2-4 3-5 0 3 3 5 3 9 0 3-2 6-6 6z" {...s} />
      </>
    ),
    galactic: (
      // Orbit rings + center dot
      <>
        <ellipse cx="12" cy="12" rx="9" ry="3.5" {...s} />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" {...s} />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" {...s} />
        <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      </>
    ),
    vampire: (
      // Moon crescent
      <>
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" {...s} />
      </>
    ),
    legendary: (
      // Crown
      <>
        <path d="M3 17l2.5-8L9 13l3-7 3 7 3.5-4L21 17H3z" {...s} />
        <path d="M3 17h18" {...s} />
      </>
    ),
    shadow: (
      // Eye with slash / hidden self
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
