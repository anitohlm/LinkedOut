"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppState, AppScreenState, FutureSelf } from "@/types";
import { getUniverse } from "@/lib/universes";
import { generateFutureSelf, sendFutureTransmission } from "@/lib/agents/useAgents";
import UniverseBackground from "@/components/UniverseBackground";
import UniverseIcon from "@/components/UniverseIcon";
import ShadowIntercept from "@/components/ShadowIntercept";
import { applyDelta, applyEvent, corruptionLevel, interceptionRisk, curiosityGain } from "@/lib/stability";
import { H, logEntry } from "@/lib/historian";
import {
  getNextQuestion, getStage, answersRecap, type InterviewQuestion, type InterviewOption,
} from "@/lib/interview";
import { markActivity } from "@/lib/progress";
import InspirationBar from "@/components/InspirationBar";

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
  const [interceptedRecently, setInterceptedRecently] = useState(false);

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

      // Log first contact with this future self
      if (universe) {
        logEntry(
          H.transmissionOpened(fs.name, fs.title, fs.year, universe.title),
          state, updateState, { toast: true }
        );
      }

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
    setInterceptedRecently(false);
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

      setMessages(prev => [...prev, { role: "assistant", content: res.message }]);
      // Meaningful exchanges (both sides substantive) can align the futures
      const substantive = userMsg.length > 60 && res.message.length > 120;
      if (substantive && Math.random() < 0.35 && futureSelf) {
        const prevStab = state.timelineState.stability;
        const { stability, status, event } = applyEvent(prevStab, "future-self-alignment");
        const gain = stability - prevStab;
        logEntry(H.transmissionAligned(futureSelf.name, gain), state, updateState, {
          extra: { timelineState: { stability, status }, stabilityMessage: event.message },
        });
      }
      // The Shadow is drawn to people who push back and reveal themselves.
      const challenged = /\b(but|no|why|disagree|wrong|don'?t|never|actually)\b/i.test(userMsg);
      const intercepted = considerIntercept({ challenged, surprising: userMsg.length > 90 });
      if (!intercepted) maybeAskQuestion(1100);
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

    // Stability shifts: interview option delta + relationship growth bonus on stage advance
    const prevStageName = getStage(relationship).name;
    const nextStageName = getStage(newRel).name;
    const stageAdvanced = nextStageName !== prevStageName;

    if (opt.stab) {
      const { stability, status } = applyDelta(state.timelineState.stability, opt.stab);
      updateState({ timelineState: { stability, status } });
    }
    if (stageAdvanced && futureSelf) {
      const { stability: newStab, status, event } = applyEvent(state.timelineState.stability, "relationship-growth");
      logEntry(H.bondAdvanced(futureSelf.name, prevStageName, nextStageName), state, updateState, {
        toast: true,
        extra: { timelineState: { stability: newStab, status }, stabilityMessage: event.message },
      });
    }

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
      setMessages(prev => [...prev, { role: "assistant", content: res.message }]);
      // Interview answers reveal the self — prime Shadow bait. Risky = divergent choice.
      const intercepted = considerIntercept({ revealedSelf: true, risky: opt.stab < 0 });
      if (!intercepted) maybeAskQuestion(1600);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "...I felt that. Give me a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Feed the Shadow's curiosity, then roll the hidden interception risk.
   * Returns true if the Shadow breaks in. Has a cooldown so it never fires twice in a row.
   */
  const considerIntercept = (signals: { revealedSelf?: boolean; risky?: boolean; challenged?: boolean; surprising?: boolean }) => {
    if (intercept) return false;
    const gain = curiosityGain(signals);
    const curiosity = (state.shadowCuriosity || 0) + gain;
    updateState({ shadowCuriosity: curiosity });

    const turn = messages.length;
    const sinceLast = turn - (state.lastInterceptTurn ?? -99);
    if (sinceLast < 5) return false; // cooldown — don't crowd the player

    const risk = interceptionRisk({
      stability: state.timelineState.stability,
      curiosity,
      risky: signals.risky,
      vulnerable: signals.revealedSelf,
    });
    if (Math.random() < risk) {
      updateState({ lastInterceptTurn: turn });
      triggerIntercept();
      return true;
    }
    return false;
  };

  const triggerIntercept = () => {
    // Shadow appearance destabilizes the timeline
    const { stability, status, event } = applyEvent(state.timelineState.stability, "shadow-interception");
    const delta = stability - state.timelineState.stability;
    if (futureSelf) {
      logEntry(H.shadowAppeared(futureSelf.name, Math.abs(delta)), state, updateState, {
        extra: { timelineState: { stability, status }, stabilityMessage: event.message },
      });
    } else {
      updateState({ timelineState: { stability, status }, stabilityMessage: event.message });
    }
    // The advice the villain will challenge = the last thing the Future Self said
    const lastAdvice = [...messages].reverse().find(m => m.role === "assistant")?.content || futureSelf?.philosophy || "patience and staying true to your values";
    setInterceptAdvice(lastAdvice);
    setIntercept(true);
  };

  const RETURN_LINES = [
    "...I'm back. Something tore through our channel.\n\nThat was you — another version of you. One I chose not to become.\n\nShe's persuasive. Don't mistake persuasion for truth.",
    "...Signal restored. She broke the barrier between timelines.\n\nShe's been watching you longer than you know.\n\nWhat she said — hold it loosely. She wants you to grip it.",
    "...I'm here. The channel is stabilizing.\n\nThat was the path I didn't take. She did.\n\nNotice what she offered you. Notice what it would cost.",
    "...Still here. She pushes through when the signal weakens.\n\nShe's not wrong about everything. That's what makes her dangerous.\n\nKeep asking questions. She hates those.",
    "...Connection restored. That intrusion fractured something in our link.\n\nShe was watching the whole time — even before she spoke.\n\nSo was I. We're not done.",
    "...I'm back. She got further than she usually does.\n\nThat version of us chose speed over everything.\n\nSome of what she said will stay with you. Let it sit before you decide what to do with it.",
  ];

  const closeIntercept = () => {
    setIntercept(false);
    setInterceptedRecently(true);
    // Shadow resistance: staying and returning to the future self strengthens the timeline
    const { stability, status, event } = applyEvent(state.timelineState.stability, "shadow-resistance");
    const delta = stability - state.timelineState.stability;
    if (futureSelf) {
      logEntry(H.shadowResisted(futureSelf.name, Math.abs(delta)), state, updateState, {
        toast: true,
        extra: { timelineState: { stability, status }, stabilityMessage: event.message },
      });
    } else {
      updateState({ timelineState: { stability, status }, stabilityMessage: event.message });
    }
    const returnLine = RETURN_LINES[Math.floor(Math.random() * RETURN_LINES.length)];
    setMessages(prev => [...prev, { role: "assistant", content: returnLine }]);
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
        <span style={{ fontSize: 13, color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
          <UniverseIcon id={universe.id} size={14} color="currentColor" strokeWidth={1.5} />
          Future Transmission
        </span>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>
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
            <span style={{ filter: corruption > 0.3 ? `blur(${corruption * 1.5}px)` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UniverseIcon id={universe.id} size={28} color={universe.color} strokeWidth={1.4} />
            </span>
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
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          {/* Timeline-fracture anomaly overlay — scanlines bleed in as reality frays */}
          {corruption > 0.25 && (
            <div className="scanlines" aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
              opacity: Math.min(0.5, corruption * 0.6),
            }} />
          )}
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
                  whiteSpace: "pre-wrap", position: "relative", zIndex: 6,
                  // Assistant text fractures (chromatic bleed) as the timeline destabilizes
                  ...(m.role === "assistant" && !m.villain && corruption > 0.3
                    ? { textShadow: `${1.4 * corruption}px 0 rgba(240,112,112,0.45), ${-1.4 * corruption}px 0 rgba(78,205,196,0.4)` }
                    : {}),
                  ...(m.role === "user"
                    ? { background: "var(--violet)", color: "#fff", borderBottomRightRadius: 4 }
                    : m.villain
                    ? { background: "rgba(240,112,112,0.1)", border: "1px solid rgba(240,112,112,0.3)", color: "var(--rose2)", borderBottomLeftRadius: 4 }
                    : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderBottomLeftRadius: 4 }),
                }}>
                  {m.villain && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, opacity: 0.8, display: "flex", alignItems: "center", gap: 6 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg> Transmission Intercepted</div>}
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
              style={{ padding: "16px 0 24px" }}>
              {!booting && messages.some(m => m.role === "assistant") && (
                <InspirationBar
                  question={[...messages].reverse().find(m => m.role === "assistant")?.content || ""}
                  universeKey={universe.id}
                  speakerName={futureSelf?.name || profile.alternativeName}
                  mode="future"
                  accent={accent}
                  resumeSummary={state.resumeAnalysis?.summary || state.resumeAnalysis?.timelineSignature}
                  skills={state.resumeAnalysis?.skills}
                  answersRecap={Object.keys(answers).length ? answersRecap(answers) : undefined}
                  relationshipStage={stage.name}
                  stability={state.timelineState.stability}
                  recentIntercept={interceptedRecently}
                  onPick={(t) => setInput(t)}
                />
              )}
              <div style={{ display: "flex", gap: 10 }}>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
