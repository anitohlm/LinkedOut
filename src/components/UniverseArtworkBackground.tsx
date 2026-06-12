"use client";

import { useEffect, useState } from "react";
import UniverseArtwork from "@/components/UniverseArtwork";

/**
 * UniverseArtworkBackground — reuses a universe's scenic card artwork as a skyline anchored
 * to the BOTTOM of the profile page. It scales responsively to fill the viewport WIDTH at the
 * artwork's natural 2.5:1 aspect (viewBox is 400 wide), so it grows with the screen. Full-colour
 * with live animation, faded upward so it MERGES into the ambient UniverseBackground above.
 *
 * Transparent layer (no own fill) meant to sit ON TOP of <UniverseBackground/>. Decorative
 * (aria-hidden); the artwork itself honours prefers-reduced-motion.
 */
const VIEWBOX_W = 400; // UniverseArtwork SVG viewBox width

export default function UniverseArtworkBackground({
  universeId,
  color,
}: {
  universeId: string;
  color: string;
}) {
  // Fill the viewport width at the artwork's natural aspect → larger on bigger screens.
  // SSR-safe desktop default, corrected on mount and on resize (rAF-throttled).
  const [scale, setScale] = useState(3.6);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // ×1.05 overscan so the skyline always reaches both edges (no rounding gaps).
        setScale((window.innerWidth / VIEWBOX_W) * 1.05);
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Scenic skyline pinned to the bottom, scaled to viewport width, faded upward */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${scale})`,
          transformOrigin: "bottom center",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 14%, rgba(0,0,0,0) 84%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 14%, rgba(0,0,0,0) 84%)",
          willChange: "transform",
        }}
      >
        <UniverseArtwork id={universeId} color={color} visited hovering={false} />
      </div>

      {/* Horizon accent glow — ties the skyline to the universe colour */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 95% 45% at 50% 100%, ${color}1f 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
