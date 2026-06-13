"use client";

import { useEffect, useState } from "react";
import UniverseArtwork from "@/components/UniverseArtwork";

/**
 * UniverseArtworkBackground — scenic background anchored to the bottom of the profile page.
 * Universes with a real photo in /public/universe-art/<id>.png use that image (cover, faded upward).
 * Others fall back to the SVG artwork scaled to viewport width.
 */
const VIEWBOX_W = 400;

const PHOTO_UNIVERSES: Record<string, string> = {
  medieval: "/universe-art/medieval.png",
  cyberpunk: "/universe-art/cyberpunk.png",
  galactic: "/universe-art/galactic.png",
  pirate: "/universe-art/pirate.png",
  dragon: "/universe-art/dragon.png",
  vampire: "/universe-art/vampire.png",
};

// Universes where the photo should render without the upward fade mask
const NO_MASK: Set<string> = new Set([]);

// Per-universe background-position override (default: "center bottom")
const BG_POSITION: Record<string, string> = {
  dragon: "center top",
};

export default function UniverseArtworkBackground({
  universeId,
  color,
}: {
  universeId: string;
  color: string;
}) {
  const photo = PHOTO_UNIVERSES[universeId];
  const noMask = NO_MASK.has(universeId);

  const [scale, setScale] = useState(3.6);

  useEffect(() => {
    if (photo) return; // photo path needs no scaling
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScale((window.innerWidth / VIEWBOX_W) * 1.05);
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [photo]);

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
      {photo ? (
        /* Photo background — full cover, optionally faded upward */
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: "cover",
            backgroundPosition: BG_POSITION[universeId] ?? "center bottom",
            ...(noMask ? {} : {
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)",
            }),
          }}
        />
      ) : (
        /* SVG artwork scaled to viewport width */
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
      )}

      {/* Horizon accent glow */}
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
