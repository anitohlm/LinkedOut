"use client";

import { motion } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import UniverseIcon from "@/components/UniverseIcon";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const GOLD = "#e8c97e";

const DECISION_META: Record<string, { label: string; color: string }> = {
  accept: { label: "Accepted", color: "#4ecdc4" },
  negotiate: { label: "Negotiating", color: "#e8c97e" },
  decline: { label: "Declined", color: "#f07070" },
};

export default function MultiverseOffers({ state, transitionTo }: Props) {
  const offers = Object.entries(state.cachedInvitations || {}) as [string, any][];

  const openOffer = (uid: string) => transitionTo("multiverse-invitations", { selectedUniverse: uid });

  return (
    <div style={{ minHeight: "100vh", background: "#06070f", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "url('/universe-art/offers-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(6,7,12,0.42) 0%, rgba(6,7,12,0.58) 50%, rgba(6,7,12,0.82) 100%)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/logo.png" alt="LinkedOut" style={{ height: 26, width: "auto", display: "block" }} />
        </button>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "60px 40px 100px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <img src="/universe-icons/multiverse-offers.png" alt="" width={72} height={72} style={{ width: 72, height: 72, objectFit: "contain" }} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>
            Recruitment Across Realities
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 600, letterSpacing: "0.05em", color: "#fff", margin: "0 0 14px" }}>
            Multiverse Offers
          </h1>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Every reality you&apos;ve touched has sent for you. Review the positions your alternate selves have been offered.
          </p>
        </motion.div>

        {/* Offers */}
        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ textAlign: "center", padding: "60px 24px", borderRadius: 18,
              background: "linear-gradient(160deg, rgba(17,19,30,0.7), rgba(9,11,19,0.85))", border: `1px solid ${GOLD}22` }}>
            <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>
              No offers yet. Explore your universes and meet their recruiters —<br />
              their invitations will gather here.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {offers.map(([uid, inv], i) => {
              const u = getUniverse(uid as UniverseType);
              const decision = state.invitationDecisions?.[uid];
              const dm = decision ? DECISION_META[decision] : null;
              return (
                <motion.button key={uid}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.4) }}
                  onClick={() => openOffer(uid)}
                  style={{ textAlign: "left", cursor: "pointer", position: "relative", overflow: "hidden",
                    borderRadius: 18, padding: "22px 24px", display: "flex", alignItems: "flex-start", gap: 18,
                    background: `linear-gradient(135deg, ${u.color}12, rgba(9,11,19,0.9))`,
                    border: `1px solid ${u.color}33`, boxShadow: `0 20px 50px -28px ${u.color}66`,
                    fontFamily: "Sora, sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${u.color}77`; el.style.boxShadow = `0 26px 60px -24px ${u.color}99`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${u.color}33`; el.style.boxShadow = `0 20px 50px -28px ${u.color}66`; }}
                >
                  {/* Universe emblem */}
                  <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    background: `radial-gradient(circle at 40% 35%, ${u.color}26, rgba(8,10,18,0.6))`, border: `1px solid ${u.color}55` }}>
                    <UniverseIcon id={uid} size={30} color={u.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: u.color }}>{u.title}</span>
                      {dm && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                          padding: "2px 8px", borderRadius: 100, background: `${dm.color}1f`, color: dm.color, border: `1px solid ${dm.color}44` }}>
                          {dm.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px", marginBottom: 2 }}>
                      {inv?.opportunityTitle || "Position offered"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 10 }}>{inv?.factionName || "Unknown Faction"}</div>
                    <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {(inv?.description || "").replace(/\\n/g, " ").slice(0, 180)}
                    </p>
                  </div>

                  <div style={{ flexShrink: 0, alignSelf: "center", width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", background: `${u.color}1f`, border: `1px solid ${u.color}55` }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={u.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
