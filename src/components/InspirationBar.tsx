"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSuggestions } from "@/lib/agents/useAgents";

interface Props {
  question: string;            // the open-ended question just asked
  universeKey: string;
  speakerName: string;
  mode: "future" | "council";
  accent: string;
  resumeSummary?: string;
  skills?: string[];
  answersRecap?: string;
  relationshipStage?: string;
  stability?: number;
  recentIntercept?: boolean;
  onPick: (text: string) => void;
}

export default function InspirationBar(props: Props) {
  const { question, universeKey, speakerName, mode, accent, onPick } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const lastQuestion = useRef<string>("");

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    // Refetch when the question changes (intercept state is folded into the key)
    const key = `${props.recentIntercept ? "X|" : ""}${question}`;
    if (suggestions.length && lastQuestion.current === key) return;
    setLoading(true);
    try {
      const res = await getSuggestions({
        question, universeKey, speakerName, mode,
        resumeSummary: props.resumeSummary, skills: props.skills,
        answersRecap: props.answersRecap, relationshipStage: props.relationshipStage,
        stability: props.stability, recentIntercept: props.recentIntercept,
      });
      setSuggestions(res.suggestions || []);
      lastQuestion.current = key;
    } catch {
      setSuggestions(["I want more than this", "I'm afraid I'm wasting my potential", "I keep playing it safe"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={toggle}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer", padding: "2px 0",
          color: open ? accent : "var(--text3)", fontFamily: "Sora, sans-serif", fontSize: 12, fontWeight: 500,
          transition: "color 0.2s",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: "pulse-glow 2s infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/></svg>
        Need inspiration?
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 10 }}>
              {loading ? (
                <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ animation: "pulse-glow 1s infinite" }}>✦</span> reading you...
                </span>
              ) : (
                suggestions.map((s, i) => (
                  <motion.button
                    key={s + i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => onPick(s)}
                    style={{
                      padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                      background: `${accent}12`, border: `1px solid ${accent}33`, color: "var(--text2)",
                      fontFamily: "Sora, sans-serif", fontSize: 13, transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${accent}22`; b.style.color = "var(--text)"; b.style.borderColor = `${accent}66`; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${accent}12`; b.style.color = "var(--text2)"; b.style.borderColor = `${accent}33`; }}
                  >
                    {s}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
