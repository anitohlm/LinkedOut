"use client";

import { motion } from "framer-motion";
import { getTier } from "@/lib/stability";

export function StabilityHUD({ stability }: { stability: number }) {
  const tier = getTier(stability);
  const critical = tier.status === "critical" || tier.status === "collapse";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.1 }}>
          Timeline <span style={{ color: tier.color, fontWeight: 600 }}>{stability}%</span>
        </div>
        <div style={{ fontSize: 9, color: tier.color, letterSpacing: "0.04em", textTransform: "uppercase",
          animation: critical ? "glitch-flicker 2s infinite" : "none" }}>
          {tier.label}
        </div>
      </div>
      {/* Mini bar */}
      <div style={{ width: 56, height: 4, borderRadius: 4, background: "var(--surface3)", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${stability}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: tier.color, borderRadius: 4,
            boxShadow: critical ? `0 0 8px ${tier.color}` : "none" }}
        />
      </div>
    </div>
  );
}

/** Full-width warning banner shown at low stability. */
export function TimelineWarningBanner({ stability }: { stability: number }) {
  const tier = getTier(stability);
  if (tier.status === "stable") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 45,
        background: `${tier.color}14`, borderBottom: `1px solid ${tier.color}40`,
        backdropFilter: "blur(10px)", padding: "8px 40px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}
    >
      <span style={{ color: tier.color, fontSize: 13, fontWeight: 600,
        animation: tier.status === "collapse" ? "glitch-flicker 1.5s infinite" : "none" }}>
        ⚠ {tier.label}
      </span>
      <span style={{ color: "var(--text3)", fontSize: 12 }}>{tier.effect}</span>
    </motion.div>
  );
}
