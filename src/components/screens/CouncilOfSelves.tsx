"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, UniverseType } from "@/types";
import { getUniverse } from "@/lib/universes";
import { sendCouncilMessage, generateLegendarySelf, generateVillainSelf } from "@/lib/agents/useAgents";
import InspirationBar from "@/components/InspirationBar";
import UniverseIcon from "@/components/UniverseIcon";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

interface Member {
  key: string;                 // universeId OR "legendary" / "shadow"
  kind: "universe" | "legendary" | "shadow";
  name: string;
  displayName: string;         // shown under the avatar
  title: string;
  personality: string;
  philosophy: string;
  universeId?: UniverseType;
}
interface Msg { role: "user" | "council"; content: string; speaker?: string; metaKey?: string; }

const SPECIAL: Record<string, { emoji: string; color: string; label: string }> = {
  legendary: { emoji: "👑", color: "#e8c97e", label: "Legendary" },
  shadow: { emoji: "🌑", color: "#f07070", label: "Shadow" },
};
const clean = (t: string) =>
  (t || "")
    .replace(/\\n/g, "\n")
    .replace(/^\s*\[[^\]]+\]\s*[:\-]?\s*/, "") // strip a leading "[Speaker]:" prefix
    .trim();

function metaFor(key?: string) {
  if (!key) return { emoji: "✦", color: "#9d91ff", label: "" };
  if (SPECIAL[key]) return SPECIAL[key];
  try { const u = getUniverse(key as UniverseType); return { emoji: u.emoji, color: u.color, label: u.title.split(" ")[0] }; }
  catch { return { emoji: "✦", color: "#9d91ff", label: "" }; }
}

export default function CouncilOfSelves({ state, transitionTo, updateState }: Props) {
  const universeProfiles = Object.values(state.allProfiles || {}).filter(Boolean) as any[];

  const [specials, setSpecials] = useState<Member[]>(state.councilSpecials || []);
  const [gathering, setGathering] = useState(!(state.councilSpecials && state.councilSpecials.length));
  const [messages, setMessages] = useState<Msg[]>(state.councilMessages || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState((state.councilMessages || []).filter(m => m.role === "council").length);
  const [concluding, setConcluding] = useState(!!state.councilConcluded);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInit = useRef(false);

  // 6 universe members + 2 special seats
  const universeMembers: Member[] = universeProfiles.map(p => ({
    key: p.universeId, kind: "universe", name: p.alternativeName, displayName: p.alternativeName,
    title: p.profession, personality: p.personalityProfile, philosophy: p.careerTrajectory, universeId: p.universeId,
  }));
  const members: Member[] = [...specials, ...universeMembers];

  useEffect(() => {
    if (!universeProfiles.length || !state.resumeAnalysis) { transitionTo("universe-discovery"); return; }
    if (hasInit.current) return;
    hasInit.current = true;
    // Already have special seats from a previous visit — don't regenerate
    if (specials.length) { setGathering(false); return; }
    (async () => {
      try {
        const [leg, vil] = await Promise.all([
          generateLegendarySelf(state.resumeAnalysis!).catch(() => null),
          generateVillainSelf(state.resumeAnalysis!).catch(() => null),
        ]);
        const firstName = state.resumeAnalysis!.firstName || (state.resumeAnalysis!.name || "").split(" ")[0] || "You";
        // Keep the real first name; give each a short themed surname/epithet.
        const legName = `${firstName} the Ascended`;
        const vilRaw = (vil as any)?.name as string | undefined;
        const vilSurname = vilRaw && vilRaw.split(" ").length > 1 ? vilRaw.split(" ").slice(1).join(" ") : "Vale";
        const vilName = `${firstName} ${vilSurname}`;
        const seats: Member[] = [];
        if (leg) seats.push({
          key: "legendary", kind: "legendary",
          name: legName, displayName: legName,
          title: (leg as any).title || "The Legendary Timeline",
          personality: (leg as any).inspirationalNarrative?.slice(0, 400) || "Radiant, certain, at peace with their greatness.",
          philosophy: (leg as any).definingQuote || (leg as any).historicalImpact || "Everything aligned.",
        });
        if (vil) seats.push({
          key: "shadow", kind: "shadow",
          name: vilName, displayName: vilName,
          title: (vil as any).title || "The Shadow Timeline",
          personality: (vil as any).philosophy?.slice(0, 400) || "Cold, persuasive, certain they were right.",
          philosophy: (vil as any).alternateWorldview || "Ambition was worth the cost.",
        });
        setSpecials(seats);
        updateState({ councilSpecials: seats });
      } finally {
        setGathering(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Persist conversation to global state so it survives navigation
  useEffect(() => {
    updateState({ councilMessages: messages, councilConcluded: concluding });
  }, [messages, concluding]);

  const allMembers = members.map(m => ({ name: m.name, universe: metaFor(m.key).label, title: m.title }));

  // Recap of prior Future Transmission conversations + interview profile — the council's memory
  const buildSharedMemory = () => {
    const lines: string[] = [];

    // Interview answer profile (what they fear, value, dream of)
    const interviews = state.interviews || {};
    const profile: Record<string, string> = {};
    Object.values(interviews).forEach((iv: any) => Object.assign(profile, iv?.answers || {}));
    if (Object.keys(profile).length) {
      lines.push("WHAT THEY'VE TOLD US ABOUT THEMSELVES:\n" +
        Object.entries(profile).map(([k, v]) => `- ${k}: ${String(v).replace(/_/g, " ")}`).join("\n"));
    }

    // Prior transmission recaps
    const t = state.transmissions || {};
    Object.entries(t).forEach(([uid, conv]) => {
      const msgs = (conv as any)?.messages || [];
      if (!msgs.length) return;
      const who = (conv as any)?.futureSelf?.name || getUniverse(uid as UniverseType).title;
      const recap = msgs.slice(-3).map((m: any) => `${m.role === "user" ? "Them" : who}: ${m.content}`).join("\n");
      lines.push(`— With ${who} (${getUniverse(uid as UniverseType).title}):\n${recap}`);
    });
    return lines.join("\n\n").slice(0, 2500);
  };

  const speakerPayload = (m: Member) => ({
    universeId: m.key,
    futureSelf: { name: m.name, universeId: m.key, title: m.title, personality: m.personality, philosophy: m.philosophy },
  });

  // Pick a rotating panel of 3 distinct members to speak this round
  const panelFor = (round: number): Member[] => {
    const n = members.length;
    if (n <= 3) return members;
    const picks: Member[] = [];
    const seen = new Set<number>();
    [0, 1, 2].forEach(k => {
      let idx = (round * 2 + k * 3) % n;
      while (seen.has(idx)) idx = (idx + 1) % n;
      seen.add(idx);
      picks.push(members[idx]);
    });
    return picks;
  };

  const ask = async (closing = false) => {
    const userMsg = closing ? "[The user asks the council to help them decide.]" : input.trim();
    if ((!userMsg && !closing) || loading) return;
    if (!closing) { setInput(""); setMessages(prev => [...prev, { role: "user", content: userMsg }]); }
    setLoading(true);

    // Build a local running transcript so each speaker hears the ones before them
    let running = closing
      ? [...messages]
      : [...messages, { role: "user" as const, content: userMsg }];

    const panel = panelFor(turn);

    try {
      for (let i = 0; i < panel.length; i++) {
        const m = panel[i];
        const isLast = i === panel.length - 1;
        const res = await sendCouncilMessage({
          userMessage: userMsg,
          speaker: speakerPayload(m),
          allMembers,
          conversationHistory: running.map(msg => ({
            role: msg.role === "council" ? "future-self" : msg.role,
            content: msg.content, speaker: (msg as any).speaker,
          })),
          isClosing: closing && isLast,
          sharedMemory: buildSharedMemory(),
          timelineStability: state.timelineState.stability,
        });
        const cleaned = (res.message || "").replace(/^\s*\[[^\]]+\]\s*[:\-]?\s*/, "").trim();
        const meta = metaFor(m.key);
        const msg = { role: "council" as const, content: cleaned, speaker: m.name, metaKey: m.key };
        running = [...running, msg];
        setMessages(prev => [...prev, msg]);
        // beat between speakers — roundtable pacing
        if (!isLast) await new Promise(r => setTimeout(r, 700));
      }
      setTurn(t => t + 1);
      if (closing) setConcluding(true);
    } catch {
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
        {/* Avatars — special seats on top, universe selves below */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          {/* Top tier: Legendary + Shadow */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: specials.length ? 20 : 0, minHeight: specials.length ? 0 : 0 }}>
            {gathering ? (
              <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "var(--text3)", gap: 8 }}>
                <UniverseIcon id="legendary" size={18} color="#e8c97e" />
                <UniverseIcon id="shadow" size={18} color="#f07070" />
                summoning your Legendary & Shadow selves…
              </div>
            ) : (
              specials.map((m, i) => {
                const meta = metaFor(m.key);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 16, margin: "0 auto 8px",
                      background: `linear-gradient(135deg, ${meta.color}55, ${meta.color}22)`, border: `1.5px solid ${meta.color}66`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 24px ${meta.color}40`,
                    }}>
                      <UniverseIcon id={m.key} size={26} color={meta.color} strokeWidth={1.4} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, lineHeight: 1.2, maxWidth: 110 }}>
                      {m.displayName}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                      {meta.label}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Bottom tier: 6 universe selves */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            {universeMembers.map((m, i) => {
              const meta = metaFor(m.key);
              return (
                <div key={i} style={{ textAlign: "center", width: 76 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, margin: "0 auto 6px",
                    background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}15)`, border: `1px solid ${meta.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <UniverseIcon id={m.key} size={19} color={meta.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text2)", lineHeight: 1.2 }}>
                    {m.displayName}
                  </div>
                  <div style={{ fontSize: 8.5, color: meta.color, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                    {meta.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="council-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, padding: "40px 20px", lineHeight: 1.7 }}>
              Every version of you has gathered — the lives you could live, your greatest self, and your shadow.
              <br /><br />Speak, and they will <em>debate</em> — each arguing for the future they became. When you&apos;re ready, conclude the council and choose.
            </div>
          )}
          <AnimatePresence>
            {messages.map((m, i) => {
              const meta = m.role === "council" ? metaFor(m.metaKey) : null;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%" }}>
                    {m.role === "council" && m.speaker && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: meta?.color || "var(--violet2)", marginBottom: 4, marginLeft: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, verticalAlign: "middle" }}>
                        <UniverseIcon id={m.metaKey || "medieval"} size={12} color={meta?.color || "var(--violet2)"} strokeWidth={1.8} />
                        {m.speaker}
                      </span>
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
        {concluding && !state.selectedUniverse ? (
          <div style={{ padding: "16px 0 24px" }}>
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
              Which future are you willing to become?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {universeMembers.map((m, i) => {
                const u = getUniverse(m.universeId!);
                return (
                  <button key={i} onClick={() => chooseFinal(m.universeId!)}
                    style={{ padding: 12, borderRadius: 12, cursor: "pointer", textAlign: "center",
                      background: `${u.color}12`, border: `1px solid ${u.color}30`, color: "var(--text)",
                      fontFamily: "Sora, sans-serif", fontSize: 12, fontWeight: 600 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                      <UniverseIcon id={m.universeId!} size={20} color={u.color} strokeWidth={1.5} />
                    </div>
                    {u.title.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px 0 24px" }}>
            {messages.some(m => m.role === "council") && (
              <InspirationBar
                question={[...messages].reverse().find(m => m.role === "council")?.content || ""}
                universeKey={[...messages].reverse().find(m => m.role === "council")?.metaKey || "galactic"}
                speakerName="the Council"
                mode="council"
                accent="#9d91ff"
                resumeSummary={state.resumeAnalysis?.summary || state.resumeAnalysis?.timelineSignature}
                skills={state.resumeAnalysis?.skills}
                stability={state.timelineState.stability}
                onPick={(t) => setInput(t)}
              />
            )}
            <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") ask(); }}
              placeholder={gathering ? "The council is still gathering..." : "Ask the council..."}
              disabled={gathering}
              style={{ flex: 1, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border2)",
                borderRadius: 12, color: "var(--text)", fontFamily: "Sora, sans-serif", fontSize: 14, outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--violet)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
            />
            <button onClick={() => ask(false)} disabled={loading || !input.trim() || gathering}
              style={{ padding: "0 22px", borderRadius: 12, border: "none",
                background: input.trim() && !loading && !gathering ? "var(--violet)" : "var(--surface)",
                color: input.trim() && !loading && !gathering ? "#fff" : "var(--text3)",
                fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600, cursor: input.trim() && !loading && !gathering ? "pointer" : "default" }}>
              Send
            </button>
            {state.selectedUniverse ? (
              <button onClick={() => transitionTo("chronicle")}
                style={{ padding: "0 18px", borderRadius: 12, border: "1px solid var(--gold)",
                  background: "transparent", color: "var(--gold)",
                  fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Chronicle →
              </button>
            ) : messages.length >= 2 && (
              <button onClick={() => ask(true)} disabled={loading}
                style={{ padding: "0 18px", borderRadius: 12, border: "1px solid var(--violet2)",
                  background: "transparent", color: "var(--violet2)",
                  fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Conclude →
              </button>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
