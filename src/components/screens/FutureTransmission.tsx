"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, FutureSelf } from "@/types";
import { getUniverse } from "@/lib/universes";
import { generateFutureSelf, sendFutureTransmission } from "@/lib/agents/useAgents";
import UniverseBackground from "@/components/UniverseBackground";
import ShadowIntercept from "@/components/ShadowIntercept";
import { applyDelta, corruptionLevel } from "@/lib/stability";
import {
  getNextQuestion, getStage, answersRecap, type InterviewQuestion, type InterviewOption,
} from "@/lib/interview";
import { markActivity } from "@/lib/progress";

interface Props {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

interface Msg {
  role: "user" | "assistant" | "system";
  content: string;
  villain?: boolean;
}

export default function FutureTransmission({ state, transitionTo, updateState }: Props) {
  const universeId = state.selectedUniverse;
  const profile = universeId ? state.allProfiles?.[universeId] : null;
  const universe = universeId ? getUniverse(universeId) : null;

  const saved = universeId ? state.transmissions?.[universeId] : null;

  const [futureSelf, setFutureSelf] = useState<FutureSelf | null>(saved?.futureSelf || null);
  const [messages, setMessages] = useState<Msg[]>(saved?.messages || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(!saved);
  const [error, setError] = useState<string | null>(null);
  const [intercept, setIntercept] = useState(false);
  const [interceptAdvice, setInterceptAdvice] = useState("");

  // Interview state (restored from global)
  const savedInterview = universeId ? state.interviews?.[universeId] : null;
  const [answers, setAnswers] = useState<Record<string, string>>(savedInterview?.answers || {});
  const [relationship, setRelationship] = useState<number>(savedInterview?.relationship || 0);
  const [asked, setAsked] = useState<string[]>(savedInterview?.asked || []);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const hasInit = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stage = getStage(relationship);

  const firstName = state.resumeAnalysis?.firstName || (state.resumeAnalysis?.name || "").split(" ")[0] || "You";

  const accent = universe?.color || "#7c6ef7";

  useEffect(() => {
    if (!universeId || !profile || !state.resumeAnalysis) {
      transitionTo("universe-discovery");
      return;
    }
    if (hasInit.current) return;
    hasInit.current = true;
    markActivity(state, updateState, universeId, "future");
    if (saved && saved.messages?.length) { setBooting(false); return; } // restore prior conversation
    boot();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Persist conversation per universe so it survives navigation & is retrievable by other agents
  useEffect(() => {
    if (universeId && futureSelf && messages.length) {
      updateState({
        transmissions: { ...(state.transmissions || {}), [universeId]: { futureSelf, messages } },
      });
    }
  }, [messages, futureSelf]);

  // Persist interview state
  useEffect(() => {
    if (universeId) {
      updateState({
        interviews: { ...(state.interviews || {}), [universeId]: { answers, relationship, asked } },
      });
    }
  }, [answers, relationship, asked]);

  // After the Future Self speaks, alternate into asking a question
  const maybeAskQuestion = (delay = 900) => {
    if (question || !universeId) return;
    const q = getNextQuestion(universeId, asked);
    if (!q) return;
    setTimeout(() => setQuestion(q), delay);
  };

  const boot = async () => {
    try {
      // Agent 3 setup — create the Future Self
      const fs = await generateFutureSelf(
        state.resumeAnalysis!,
        universeId!,
        profile!.alternativeName,
        profile!.profession
      );
      setFutureSelf(fs);
      setBooting(false);

      // Opening transmission
      setLoading(true);
      const res = await sendFutureTransmission({
        userMessage: "[The connection opens. Greet your past self for the first time.]",
        futureSelf: fs,
        resumeAnalysis: state.resumeAnalysis!,
        conversationHistory: [],
        timelineStability: state.timelineState.stability,
      });
      setMessages([{ role: "assistant", content: res.message }]);
      setLoading(false);
      maybeAskQuestion(1400);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Transmission failed. Try again.");
      setBooting(false);
    }
  };

  const send = async () => {
    if (!input.trim() || loading || !futureSelf) return;
    const userMsg = input.trim();
    setInput("");
    const history = messages.filter(m => m.role !== "system").map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await sendFutureTransmission({
        userMessage: userMsg,
        futureSelf,
        resumeAnalysis: state.resumeAnalysis!,
        conversationHistory: history,
        timelineStability: state.timelineState.stability,
        interviewAnswers: Object.keys(answers).length ? answersRecap(answers) : undefined,
        relationshipStage: stage.name,
      });

      if (res.isVillainIntercept) {
        // The Shadow Self hijacks the channel — full-screen cinematic takeover
        triggerIntercept();
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: res.message }]);
        maybeAskQuestion(1100);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: "...the signal broke. Say that again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (q: InterviewQuestion, opt: InterviewOption) => {
    if (picked || loading) return;
    setPicked(opt.id);

    // Compute new relationship + stability
    const newAnswers = { ...answers, [q.dimension]: opt.value };
    const newRel = relationship + opt.rel;

    // brief selection animation, then commit
    await new Promise(r => setTimeout(r, 450));

    setAnswers(newAnswers);
    setRelationship(newRel);
    setAsked(prev => [...prev, q.id]);
    if (opt.stab) updateState({ timelineState: applyDelta(state.timelineState.stability, opt.stab) });

    // Record the exchange + the reward feedback in the transcript
    const fb = `Relationship +${opt.rel}` + (opt.stab ? `  ·  Timeline Stability ${opt.stab > 0 ? "+" : ""}${opt.stab}` : "");
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: q.prompt },
      { role: "user", content: opt.label },
      { role: "system", content: fb },
    ]);
    setQuestion(null);
    setPicked(null);

    // Future Self reacts to the answer
    setLoading(true);
    try {
      const history = [...messages, { role: "assistant" as const, content: q.prompt }, { role: "user" as const, content: opt.label }]
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
      const res = await sendFutureTransmission({
        userMessage: opt.label,
        futureSelf: futureSelf!,
        resumeAnalysis: state.resumeAnalysis!,
        conversationHistory: history,
        timelineStability: state.timelineState.stability,
        interviewAnswers: answersRecap(newAnswers),
        relationshipStage: getStage(newRel).name,
        stabilityShift: opt.stab,
        answeredQuestion: q.prompt,
      });
      if (res.isVillainIntercept) triggerIntercept();
      else {
        setMessages(prev => [...prev, { role: "assistant", content: res.message }]);
        maybeAskQuestion(1600);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "...I felt that. Give me a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerIntercept = () => {
    // The advice the villain will challenge = the last thing the Future Self said
    const lastAdvice = [...messages].reverse().find(m => m.role === "assistant")?.content || futureSelf?.philosophy || "patience and staying true to your values";
    setInterceptAdvice(lastAdvice);
    setIntercept(true);
  };

  const closeIntercept = () => {
    setIntercept(false);
    // The intrusion destabilizes the timeline
    updateState({ timelineState: applyDelta(state.timelineState.stability, -10) });
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "...I'm back. Something forced its way into our channel.\n\nThat was you — another you. The one I became when I stopped listening to myself.\n\nDon't let her have the last word.",
    }]);
  };

  const corruption = corruptionLevel(state.timelineState.stability);

  if (!universe || !profile) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64, position: "relative" }}>
      <UniverseBackground universeId={universe.id} color={accent} />

      {/* Shadow Self intercept — full-screen cinematic takeover */}
      <AnimatePresence>
        {intercept && (
          <ShadowIntercept firstName={firstName} futureMeAdvice={interceptAdvice} onClose={closeIntercept} />
        )}
      </AnimatePresence>

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
        <span style={{ fontSize: 13, color: "var(--text3)" }}>{universe.emoji} Future Transmission</span>
        {/* Demo control: force a Shadow intercept */}
        <button
          onClick={() => !intercept && !booting && triggerIntercept()}
          title="Shadow intercept"
          style={{
            background: "none", border: "1px solid rgba(240,112,112,0.25)", borderRadius: 8,
            padding: "5px 10px", color: "rgba(240,112,112,0.7)", cursor: "pointer",
            fontSize: 13, fontFamily: "Sora, sans-serif",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,112,112,0.6)"; (e.currentTarget as HTMLButtonElement).style.color = "#f07070"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,112,112,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,112,112,0.7)"; }}
        >
          ⚠
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 0", position: "relative", zIndex: 1, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
        {/* Header — who you're talking to */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0, position: "relative", overflow: "hidden",
            background: `linear-gradient(135deg, ${accent}40, ${accent}20)`, border: `1px solid ${accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            filter: corruption > 0 ? `saturate(${1 - corruption * 0.6}) contrast(${1 + corruption * 0.5})` : "none",
            animation: corruption > 0.5 ? "glitch-shift 0.4s steps(2) infinite" : "none",
          }}>
            <span style={{ filter: corruption > 0.3 ? `blur(${corruption * 1.5}px)` : "none" }}>{universe.emoji}</span>
            {corruption > 0.2 && <div className="scanlines" style={{ position: "absolute", inset: 0, opacity: corruption * 0.7 }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              {futureSelf?.name || profile.alternativeName}
            </div>
            <div style={{ fontSize: 13, color: accent }}>
              {futureSelf ? `${futureSelf.title} · Year ${futureSelf.year}` : "Establishing temporal link..."}
            </div>
          </div>
          {/* Relationship stage */}
          <div style={{ textAlign: "right", minWidth: 130 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Bond
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 6 }}>{stage.name}</div>
            <div style={{ width: 120, height: 3, background: "var(--surface3)", borderRadius: 4, overflow: "hidden", marginLeft: "auto" }}>
              <motion.div animate={{ width: `${Math.round(stage.progress * 100)}%` }} transition={{ duration: 0.6 }}
                style={{ height: "100%", background: accent, borderRadius: 4 }} />
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {booting && (
            <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, padding: "40px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse-glow 1.5s infinite" }}>🌀</div>
              Reaching across the timeline...
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", color: "var(--rose2)", fontSize: 14, padding: "40px 0" }}>{error}</div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              m.role === "system" ? (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                    padding: "5px 14px", borderRadius: 100,
                    background: `${accent}14`, border: `1px solid ${accent}33`, color: accent,
                  }}>
                    ✦ {m.content}
                  </span>
                </motion.div>
              ) : (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "14px 18px", borderRadius: 16, fontSize: 14, lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  ...(m.role === "user"
                    ? { background: "var(--violet)", color: "#fff", borderBottomRightRadius: 4 }
                    : m.villain
                    ? { background: "rgba(240,112,112,0.1)", border: "1px solid rgba(240,112,112,0.3)", color: "var(--rose2)", borderBottomLeftRadius: 4 }
                    : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderBottomLeftRadius: 4 }),
                }}>
                  {m.villain && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>⚠ Transmission Intercepted</div>}
                  {m.content.replace(/\\n/g, "\n")}
                </div>
              </motion.div>
              )
            ))}
          </AnimatePresence>

          {loading && !booting && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "14px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: 5 }}>
                {[0, 1, 2].map(d => (
                  <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview question card OR free-text input */}
        <AnimatePresence mode="wait">
          {question ? (
            <motion.div key="question"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ padding: "12px 0 24px" }}>
              {/* Question card */}
              <div style={{
                background: `linear-gradient(135deg, ${accent}12, var(--surface))`,
                border: `1px solid ${accent}40`, borderRadius: 18, padding: "20px 22px", marginBottom: 12,
                boxShadow: `0 8px 32px -12px ${accent}55`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, animation: "pulse-glow 1.5s infinite" }} />
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>
                    {futureSelf?.name?.split(" ")[0] || "They"} asks
                  </span>
                </div>
                <p style={{ fontFamily: "Crimson Pro, serif", fontSize: 19, lineHeight: 1.5, color: "var(--text)", fontStyle: "italic" }}>
                  &ldquo;{question.prompt}&rdquo;
                </p>
              </div>

              {/* Options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {question.options.map((opt, i) => {
                  const isPicked = picked === opt.id;
                  const dimmed = picked && !isPicked;
                  return (
                    <motion.button key={opt.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: dimmed ? 0.3 : 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => handleSelect(question, opt)}
                      disabled={!!picked || loading}
                      whileHover={!picked ? { scale: 1.015 } : {}}
                      style={{
                        textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: picked ? "default" : "pointer",
                        background: isPicked ? accent : "var(--surface)",
                        border: `1px solid ${isPicked ? accent : "var(--border2)"}`,
                        color: isPicked ? "#0a0a0a" : "var(--text)",
                        fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 500,
                        display: "flex", alignItems: "center", gap: 10, transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseEnter={e => { if (!picked) (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }}
                      onMouseLeave={e => { if (!picked) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)"; }}
                    >
                      <span style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isPicked ? "rgba(0,0,0,0.15)" : `${accent}18`, color: isPicked ? "#0a0a0a" : accent,
                      }}>{String.fromCharCode(65 + i)}</span>
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "16px 0 24px", display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
                placeholder={booting ? "Connecting..." : "Speak to your future self..."}
                disabled={booting || !!error || loading}
                style={{
                  flex: 1, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border2)",
                  borderRadius: 12, color: "var(--text)", fontFamily: "Sora, sans-serif", fontSize: 14, outline: "none",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = accent)}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
              <button onClick={send} disabled={loading || booting || !input.trim()}
                style={{
                  padding: "0 24px", borderRadius: 12, border: "none",
                  background: input.trim() && !loading ? "var(--violet)" : "var(--surface)",
                  color: input.trim() && !loading ? "#fff" : "var(--text3)",
                  fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 600,
                  cursor: input.trim() && !loading ? "pointer" : "default",
                }}>
                Send
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
