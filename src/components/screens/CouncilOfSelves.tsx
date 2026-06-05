"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import { sendCouncilMessage } from "@/lib/agents/useAgents";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

interface Msg { role: "user" | "council"; content: string; speaker?: string; universeId?: UniverseType; }
const clean = (t: string) => (t || "").replace(/\\n/g, "\n").trim();

export default function CouncilOfSelves({ state, transitionTo, updateState }: Props) {
  // Council members built from all generated universe profiles
  const members = Object.values(state.allProfiles || {}).filter(Boolean) as any[];

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [concluding, setConcluding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!members.length || !state.resumeAnalysis) transitionTo("universe-discovery");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const allMembers = members.map(p => ({
    name: p.alternativeName, universe: getUniverse(p.universeId).title, title: p.profession,
  }));

  const speakerFor = (idx: number) => {
    const p = members[idx % members.length];
    return {
      universeId: p.universeId as UniverseType,
      futureSelf: {
        name: p.alternativeName, universeId: p.universeId, title: p.profession,
        personality: p.personalityProfile, philosophy: p.careerTrajectory,
      },
    };
  };

  const ask = async (closing = false) => {
    const userMsg = closing ? "[Conclude the council. Ask me the final question.]" : input.trim();
    if (!userMsg || loading) return;
    if (!closing) { setInput(""); setMessages(prev => [...prev, { role: "user", content: userMsg }]); }
    setLoading(true);
    try {
      const speaker = speakerFor(turn);
      const res = await sendCouncilMessage({
        userMessage: userMsg,
        speaker,
        allMembers,
        conversationHistory: messages.map(m => ({ role: m.role === "council" ? "future-self" : m.role, content: m.content, speaker: m.speaker })),
        isClosing: closing,
      });
      setMessages(prev => [...prev, { role: "council", content: res.message, speaker: res.speakerName, universeId: res.universeId }]);
      setTurn(t => t + 1);
      if (closing) setConcluding(true);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "council", content: "...the council falls silent for a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const chooseFinal = (universeId: UniverseType) => {
    updateState({ selectedUniverse: universeId });
    transitionTo("chronicle", { selectedUniverse: universeId });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(124,110,247,0.1), transparent 55%), var(--bg)" }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => transitionTo("universe-discovery")}
          style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 14, fontFamily: "Sora, sans-serif" }}>← Back</button>
        <span style={{ fontSize: 13, color: "var(--text3)" }}>⚖️ The Council of Selves</span>
        <span style={{ width: 50 }} />
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 0", position: "relative", zIndex: 1, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
        {/* Council avatars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          {members.map((p, i) => {
            const u = getUniverse(p.universeId);
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, margin: "0 auto 6px",
                  background: `linear-gradient(135deg, ${u.color}40, ${u.color}18)`, border: `1px solid ${u.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{u.emoji}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", maxWidth: 64, lineHeight: 1.2 }}>
                  {u.title.split(" ")[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, padding: "40px 20px", lineHeight: 1.7 }}>
              Every version of you has gathered. They have answers — but they came to ask you something.
              <br /><br />Speak, and the council will respond.
            </div>
          )}
          <AnimatePresence>
            {messages.map((m, i) => {
              const u = m.universeId ? getUniverse(m.universeId) : null;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%" }}>
                    {m.role === "council" && m.speaker && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: u?.color || "var(--violet2)", marginBottom: 4, marginLeft: 4 }}>
                        {u?.emoji} {m.speaker}
                      </div>
                    )}
                    <div style={{
                      padding: "14px 18px", borderRadius: 16, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
                      ...(m.role === "user"
                        ? { background: "var(--violet)", color: "#fff", borderBottomRightRadius: 4 }
                        : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderBottomLeftRadius: 4 }),
                    }}>
                      {clean(m.content)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "14px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 5 }}>
                {[0, 1, 2].map(d => (
                  <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet2)", display: "inline-block" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final choice OR input */}
        {concluding ? (
          <div style={{ padding: "16px 0 24px" }}>
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
              Which future are you willing to become?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {members.map((p, i) => {
                const u = getUniverse(p.universeId);
                return (
                  <button key={i} onClick={() => chooseFinal(p.universeId)}
                    style={{
                      padding: 14, borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: `${u.color}12`, border: `1px solid ${u.color}30`, color: "var(--text)",
                      fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600,
                    }}>
                    {u.emoji} {p.alternativeName}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px 0 24px", display: "flex", gap: 10 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") ask(); }}
              placeholder="Ask the council..."
              style={{ flex: 1, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border2)",
                borderRadius: 12, color: "var(--text)", fontFamily: "Sora, sans-serif", fontSize: 14, outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--violet)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
            />
            <button onClick={() => ask(false)} disabled={loading || !input.trim()}
              style={{ padding: "0 22px", borderRadius: 12, border: "none",
                background: input.trim() && !loading ? "var(--violet)" : "var(--surface)",
                color: input.trim() && !loading ? "#fff" : "var(--text3)",
                fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, cursor: input.trim() && !loading ? "pointer" : "default" }}>
              Send
            </button>
            {messages.length >= 2 && (
              <button onClick={() => ask(true)} disabled={loading}
                style={{ padding: "0 18px", borderRadius: 12, border: "1px solid var(--violet2)",
                  background: "transparent", color: "var(--violet2)",
                  fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Conclude →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
