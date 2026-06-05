"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import { generateRecruiter } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

interface Invitation {
  id: string;
  universeId: UniverseType;
  factionName: string;
  opportunityTitle: string;
  salutation?: string;
  description: string;
  benefits?: Array<{ icon: string; text: string }>;
  sign?: string;
  options?: { accept: string; negotiate: string; decline: string };
}

export default function MultiverseInvitations({ state, transitionTo, updateState }: Props) {
  const universeId = state.selectedUniverse;
  const universe = universeId ? getUniverse(universeId) : null;
  const profile = universeId ? state.allProfiles?.[universeId] : null;

  const cached = universeId ? state.cachedInvitations?.[universeId] : null;
  const [invitations, setInvitations] = useState<Invitation[]>(cached ? [cached] : []);
  const [loading, setLoading] = useState(!cached);
  const [openId, setOpenId] = useState<string | null>(cached ? cached.id : null);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<"accept" | "negotiate" | "decline" | null>(
    universeId ? state.invitationDecisions?.[universeId] ?? null : null
  );
  const hasInit = useRef(false);

  // Universe-themed mailbox titles
  const MAILBOX = {
    medieval: { eyebrow: "Sealed by Royal Decree", title: "The Royal Court", sub: "Houses of the realm seek your service." },
    cyberpunk: { eyebrow: "Encrypted Channel", title: "Corp Inbox", sub: "Megacorps are bidding for your clearance." },
    pirate: { eyebrow: "Carried by the Tide", title: "The Captain's Quarters", sub: "Fleets and crews want you aboard." },
    dragon: { eyebrow: "Etched in Ancient Scale", title: "The Covenant Hall", sub: "Ancient orders extend their pacts." },
    galactic: { eyebrow: "Transmitted Across Sectors", title: "Command Relay", sub: "Federations are drafting your commission." },
    vampire: { eyebrow: "Written in Crimson", title: "The Midnight Court", sub: "Covenants of the night summon you." },
  } as const;
  const mailbox = universeId ? MAILBOX[universeId] : { eyebrow: "Incoming", title: "Offers", sub: "" };

  useEffect(() => {
    if (!state.resumeAnalysis || !universeId || !profile) {
      transitionTo("universe-discovery");
      return;
    }
    if (hasInit.current) return;
    hasInit.current = true;
    if (cached) { setLoading(false); return; } // already generated — reuse it
    load();
  }, []);

  const load = async () => {
    try {
      const inv = await generateRecruiter(profile as any, universeId!);
      setInvitations([inv as Invitation]);
      // Cache so we never regenerate this universe's offer
      updateState({ cachedInvitations: { ...(state.cachedInvitations || {}), [universeId!]: inv } });
    } catch (e: any) {
      setError(e.message || "Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  const decide = (choice: "accept" | "negotiate" | "decline" | null) => {
    setDecision(choice);
    if (universeId) {
      const next = { ...(state.invitationDecisions || {}) };
      if (choice) next[universeId] = choice; else delete next[universeId];
      updateState({ invitationDecisions: next });
    }
  };

  const open = invitations.find(i => i.id === openId);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)",
      }}>
        <button onClick={() => transitionTo("identity-reconstruction")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>
          ← Back
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </span>
        <span style={{ fontSize: 13, color: "var(--text3)" }}>
          {universe?.emoji} {universe?.title}
        </span>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>
            {mailbox.eyebrow}
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
            {mailbox.title}
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 16 }}>
            {loading ? `Drafting your offer from ${universe?.title}...` : mailbox.sub}
          </p>
        </motion.div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse-glow 1.5s infinite" }}>{universe?.emoji}</div>
            Summoning your offer from {universe?.title}...
          </div>
        )}
        {error && <div style={{ textAlign: "center", color: "var(--rose2)", padding: "40px 0" }}>{error}</div>}

        {/* Message list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {invitations.map((inv, i) => {
            const u = getUniverse(inv.universeId);
            return (
              <motion.div key={inv.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setOpenId(openId === inv.id ? null : inv.id)}
                style={{
                  background: "var(--surface)", border: `1px solid ${openId === inv.id ? u.color + "40" : "var(--border)"}`,
                  borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${u.color}18`, border: `1px solid ${u.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>{u.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{inv.factionName}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{inv.opportunityTitle} · {u.title}</div>
                  </div>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: u.color }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: openId === inv.id ? 0 : 0,
                  display: openId === inv.id ? "none" : "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {(inv.description || "").replace(/\\n/g, " ").slice(0, 160)}...
                </p>

                {/* Expanded */}
                <AnimatePresence>
                  {openId === inv.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}>
                      {inv.salutation && (
                        <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 16, color: "var(--text2)", marginBottom: 16, marginTop: 4 }}>
                          {inv.salutation}
                        </p>
                      )}
                      <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, marginBottom: 20, whiteSpace: "pre-wrap" }}>
                        {(inv.description || "").replace(/\\n/g, "\n")}
                      </p>
                      {inv.benefits && inv.benefits.length > 0 && (
                        <div style={{ background: "var(--bg2)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>What they offer</p>
                          {inv.benefits.map((b, bi) => (
                            <div key={bi} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text2)", padding: "5px 0" }}>
                              <span style={{ fontSize: 16 }}>{b.icon}</span>{b.text}
                            </div>
                          ))}
                        </div>
                      )}
                      {inv.sign && (
                        <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 14, color: "var(--text3)", marginBottom: 20 }}>
                          — {inv.sign}
                        </p>
                      )}

                      {/* Decision actions */}
                      {!decision ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <button onClick={() => decide("accept")}
                            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                              background: u.color, color: "#0a0a0a", fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 700 }}>
                            ✓ Accept
                          </button>
                          <button onClick={() => decide("negotiate")}
                            style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                              background: "transparent", border: `1px solid ${u.color}55`, color: u.color,
                              fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600 }}>
                            ⇄ Negotiate
                          </button>
                          <button onClick={() => decide("decline")}
                            style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                              background: "transparent", border: "1px solid var(--border2)", color: "var(--text3)",
                              fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600 }}>
                            ✕ Ignore
                          </button>
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          onClick={e => e.stopPropagation()}
                          style={{ marginTop: 4, padding: 18, borderRadius: 12,
                            background: decision === "decline" ? "var(--bg2)" : `${u.color}10`,
                            border: `1px solid ${decision === "decline" ? "var(--border)" : u.color + "30"}` }}>
                          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                            color: decision === "decline" ? "var(--text3)" : u.color, marginBottom: 8 }}>
                            {decision === "accept" ? "✓ You accepted" : decision === "negotiate" ? "⇄ You negotiated" : "✕ You declined"}
                          </p>
                          <p style={{ fontFamily: "Crimson Pro, serif", fontStyle: "italic", fontSize: 15, color: "var(--text2)", lineHeight: 1.6 }}>
                            {inv.options?.[decision === "decline" ? "decline" : decision] || "The choice is made."}
                          </p>
                          <button onClick={() => decide(null)}
                            style={{ marginTop: 12, background: "none", border: "none", color: "var(--text3)",
                              fontSize: 12, cursor: "pointer", fontFamily: "Sora, sans-serif", textDecoration: "underline" }}>
                            Reconsider
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
