"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";

interface ResumeUploadProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

const analyzeMessages = [
  "Analyzing career history...",
  "Identifying transferable skills...",
  "Mapping alternate destinies...",
  "Building multiverse profiles...",
  "Calibrating destiny scores...",
];

export default function ResumeUpload({ state, transitionTo, updateState }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(analyzeMessages[0]);

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    // New resume = new user — clear all previously generated AI content
    updateState({
      resumeText,
      resumeAnalysis: null,
      allProfiles: {},
      allFutureSelves: {},
      legendarySelves: {},
      villainSelves: {},
      butterflyCache: undefined,
      cachedInvitations: {},
      invitationDecisions: {},
      transmissions: {},
      interviews: {},
      councilMessages: [],
      councilSpecials: [],
      councilConcluded: false,
      usedButterfly: false,
      butterFlyDecisions: [],
      historianLog: [],
      chronicleEditions: [],
      acceptedPositions: [],
      activeTitle: undefined,
    });

    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < analyzeMessages.length) {
        setAnalyzeMsg(analyzeMessages[i]);
      } else {
        clearInterval(iv);
        setTimeout(() => transitionTo("timeline-scan", { resumeText }), 600);
      }
    }, 700);
  };

  const charCount = resumeText.length;
  const hasEnoughText = charCount > 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 64 }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(8,9,13,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <button
          onClick={() => transitionTo("landing")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 500,
            cursor: "pointer", background: "none", border: "none", color: "var(--text2)",
            fontFamily: "Sora, sans-serif", transition: "color 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
        >
          ← Back
        </button>
        <button onClick={() => transitionTo("landing")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", fontFamily: "Sora, sans-serif" }}>
          Linked<span style={{ color: "var(--violet2)" }}>Out</span>
        </button>
      </nav>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 680, margin: "0 auto", padding: "60px 40px" }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 16 }}>
          Step 1 of 3
        </p>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginBottom: 8, color: "var(--text)" }}>
          Begin Your Journey
        </h2>
        <p style={{ color: "var(--text2)", marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
          Paste your resume below. We&apos;ll figure out who you could&apos;ve been.
        </p>

        {!isAnalyzing ? (
          <>
            {/* Textarea */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder={`Paste your resume text here...\n\nInclude your work experience, skills, education, and achievements for the best multiverse results.`}
                rows={22}
                style={{
                  width: "100%",
                  minHeight: "60vh",
                  padding: "20px",
                  background: "var(--bg2)",
                  border: `1px solid ${hasEnoughText ? "var(--border2)" : "var(--border)"}`,
                  borderRadius: 16,
                  color: "var(--text)",
                  fontFamily: "Sora, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  outline: "none",
                  resize: "vertical",
                  transition: "border 0.2s",
                  caretColor: "var(--violet2)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--violet)")}
                onBlur={e => (e.currentTarget.style.borderColor = hasEnoughText ? "var(--border2)" : "var(--border)")}
              />
              {/* Char count */}
              <div style={{
                position: "absolute", bottom: 12, right: 16,
                fontSize: 11, color: charCount > 50 ? "var(--text3)" : "var(--border3)",
                transition: "color 0.2s",
              }}>
                {charCount.toLocaleString()} chars
              </div>
            </div>

            {/* Helper text */}
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24, lineHeight: 1.5 }}>
              Tip: Copy everything — job titles, bullet points, skills, dates. The more detail, the richer your alternate universe profiles.
            </p>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!hasEnoughText}
              style={{
                width: "100%", padding: 16,
                background: hasEnoughText ? "var(--violet)" : "var(--surface)",
                border: "none", borderRadius: 12,
                color: hasEnoughText ? "#fff" : "var(--text3)",
                fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 600,
                cursor: hasEnoughText ? "pointer" : "not-allowed",
                transition: "all 0.25s",
                opacity: hasEnoughText ? 1 : 0.5,
              }}
              onMouseEnter={e => {
                if (!hasEnoughText) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet2)";
                b.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                if (!hasEnoughText) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "var(--violet)";
                b.style.transform = "translateY(0)";
              }}
            >
              {hasEnoughText ? "Analyze My Profile →" : "Paste your resume to continue"}
            </button>
          </>
        ) : (
          /* Analyzing state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 0" }}
          >
            <div style={{
              fontSize: 48, marginBottom: 24, display: "inline-block",
              animation: "spin-slow 3s linear infinite",
            }}>
              ⚙️
            </div>
            <p style={{ fontSize: 16, color: "var(--text2)", marginBottom: 8 }}>{analyzeMsg}</p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>This will just take a moment...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
