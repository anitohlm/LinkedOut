"use client";

import UniverseIcon from "@/components/UniverseIcon";
import { UniverseType } from "@/types";

/**
 * WorldEra — the specific civilization + era a self lives in, shown beneath the universe name.
 *
 * One shared presentation so the world reads identically on the Universe Discovery cards,
 * the Identity Reconstruction hero, and the Future Transmission header.
 *
 *   The Crimson Archipelago · Season of Black Sails
 *   "A network of free islands governed by legendary captains."
 *
 * Hierarchy is carried by size + weight + spacing (not color alone): the world name is the
 * anchor (semibold), the era is a quieter qualifier (muted), the description wraps freely.
 */
interface Props {
  universeId: UniverseType;
  worldName?: string;
  eraName?: string;
  worldDescription?: string;
  accent: string;
  size?: "sm" | "md";
  showDescription?: boolean;
  /** Optional uppercase caption above the line, e.g. "Realm & Era" */
  label?: string;
}

const clean = (t?: string) => (t || "").replace(/\\n/g, " ").trim();

export default function WorldEra({
  universeId,
  worldName,
  eraName,
  worldDescription,
  accent,
  size = "md",
  showDescription = false,
  label,
}: Props) {
  if (!clean(worldName)) return null;
  const sm = size === "sm";

  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text3)",
            marginBottom: 5,
          }}
        >
          {label}
        </div>
      )}

      {/* World · Era */}
      <div style={{ display: "flex", alignItems: "center", gap: sm ? 6 : 8, flexWrap: "wrap", rowGap: 2 }}>
        <UniverseIcon id={universeId} size={sm ? 12 : 14} color={accent} strokeWidth={1.6} />
        <span style={{ fontSize: sm ? 13 : 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.1px" }}>
          {clean(worldName)}
        </span>
        {clean(eraName) && (
          <>
            <span aria-hidden style={{ color: accent, opacity: 0.55, fontSize: sm ? 12 : 14, lineHeight: 1 }}>
              ·
            </span>
            <span style={{ fontSize: sm ? 12 : 13, fontWeight: 500, color: "var(--text3)", letterSpacing: "0.01em" }}>
              {clean(eraName)}
            </span>
          </>
        )}
      </div>

      {showDescription && clean(worldDescription) && (
        <p
          style={{
            fontFamily: "Crimson Pro, serif",
            fontStyle: "italic",
            fontSize: sm ? 12.5 : 14,
            lineHeight: 1.55,
            color: "var(--text3)",
            margin: `${sm ? 5 : 7}px 0 0`,
            maxWidth: 460,
          }}
        >
          {clean(worldDescription)}
        </p>
      )}
    </div>
  );
}
