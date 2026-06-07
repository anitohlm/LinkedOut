"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { getTier } from "@/lib/stability";
import { H } from "@/lib/historian";
import { TimelineWarningBanner } from "./StabilityHUD";
import HistorianObservation from "./HistorianObservation";
import Landing from "./screens/Landing";
import ResumeUpload from "./screens/ResumeUpload";
import TimelineScan from "./screens/TimelineScan";
import MultiverseCalibration from "./screens/MultiverseCalibration";
import UniverseDiscovery from "./screens/UniverseDiscovery";
import IdentityReconstruction from "./screens/IdentityReconstruction";
import FutureTransmission from "./screens/FutureTransmission";
import MultiverseInvitations from "./screens/MultiverseInvitations";
import LegendarySelf from "./screens/LegendarySelf";
import VillainSelf from "./screens/VillainSelf";
import ButterflyEffect from "./screens/ButterflyEffect";
import CouncilOfSelves from "./screens/CouncilOfSelves";
import Chronicle from "./screens/Chronicle";

const initialState: AppState = {
  currentScreen: "landing",
  resumeFile: null,
  resumeText: null,
  resumeAnalysis: null,
  selectedUniverse: null,
  allProfiles: {} as any,
  allFutureSelves: {} as any,
  conversations: {} as any,
  timelineState: { stability: 100, status: "stable" },
  legendarySelves: {} as any,
  villainSelves: {} as any,
  butterFlyDecisions: [],
  invitations: [],
  shareCard: null,
  councilMessages: [],
  councilSpecials: [],
  councilConcluded: false,
  cachedInvitations: {},
  invitationDecisions: {},
  transmissions: {},
  interviews: {},
  explored: [],
  usedButterfly: false,
  universeActivity: {},
  shadowCuriosity: 0,
  lastInterceptTurn: -99,
  historianLog: [],
  chronicleEditions: [],
};

const SAVE_KEY = "linkedout_save_v1";

export function AppOrchestrator() {
  const [state, setState] = useState<AppState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Save / Resume ──────────────────────────────────────────────────
  const savedRef = useRef<AppState | null>(null);
  const [savedExists, setSavedExists] = useState(false);
  const hydrated = useRef(false);

  // Load any saved game on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed?.resumeAnalysis) { savedRef.current = parsed; setSavedExists(true); }
      }
    } catch {}
    hydrated.current = true;
  }, []);

  // Auto-save active games (only once a resume has been analyzed — avoids
  // clobbering an existing save with the empty initial state on mount).
  useEffect(() => {
    if (!hydrated.current || !state.resumeAnalysis) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, resumeFile: null }));
    } catch {}
  }, [state]);

  const resumeGame = useCallback(() => {
    if (savedRef.current) {
      const s = savedRef.current;
      setIsTransitioning(true);
      setTimeout(() => { setState(s); setIsTransitioning(false); }, 400);
    }
  }, []);

  const clearSave = useCallback(() => {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    savedRef.current = null;
    setSavedExists(false);
  }, []);

  // Timeline stability change feedback
  const stability = state.timelineState.stability;
  const prevStability = useRef(stability);
  const [toast, setToast] = useState<{ value: number; delta: number; message: string; key: number } | null>(null);

  useEffect(() => {
    const prev = prevStability.current;
    if (stability !== prev) {
      const delta = stability - prev;
      const message = state.stabilityMessage || (delta > 0 ? "The futures briefly align." : "The timeline shifts.");
      setToast({ value: stability, delta, message, key: Date.now() });
      prevStability.current = stability;
      // Clear the message from state so it doesn't persist
      if (state.stabilityMessage) setState(s => ({ ...s, stabilityMessage: null }));
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [stability]);

  // Hide global HUD chrome on entry / landing screens
  const showChrome = !["landing", "upload-resume", "timeline-scan"].includes(state.currentScreen);

  // ── The Multiversal Historian ──────────────────────────────────────
  const [obsQueue, setObsQueue] = useState<string[]>([]);
  const [currentObs, setCurrentObs] = useState<string | null>(null);

  // Enqueue a text string for the floating observation toast (does NOT log — logging is done at call site)
  const showObservation = useCallback((text: string) => {
    setObsQueue(q => [...q, text]);
  }, []);

  // Log a specific entry to the historian record + show as floating toast
  const logAndObserve = useCallback((text: string) => {
    setObsQueue(q => [...q, text]);
    setState(prev => ({
      ...prev,
      historianLog: [...(prev.historianLog || []), { text, ts: Date.now() }],
    }));
  }, []);

  // Pull next observation from the queue when idle
  useEffect(() => {
    if (!currentObs && obsQueue.length) {
      setCurrentObs(obsQueue[0]);
      setObsQueue(q => q.slice(1));
    }
  }, [obsQueue, currentObs]);

  // Watch for pendingObservation set by screen components
  useEffect(() => {
    if (state.pendingObservation) {
      showObservation(state.pendingObservation);
      setState(prev => ({ ...prev, pendingObservation: null }));
    }
  }, [state.pendingObservation, showObservation]);

  // Watch stability tier crossings — log specific text with actual values
  const prevTierLabel = useRef(getTier(stability).label);
  const prevTierStability = useRef(stability);
  useEffect(() => {
    const tier = getTier(stability);
    if (tier.label !== prevTierLabel.current) {
      const rose = stability > prevTierStability.current;
      let text: string;
      if (tier.status === "collapse") text = H.stabilityCollapsed(stability);
      else if (tier.status === "harmonized") text = H.stabilityHarmonized(stability);
      else text = H.stabilityTierCrossed(tier.label, stability, rose ? "rose" : "fell");
      logAndObserve(text);
      prevTierLabel.current = tier.label;
    }
    prevTierStability.current = stability;
  }, [stability, logAndObserve]);

  // Watch story milestones (screen-based, fire once each)
  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    const s = state.currentScreen;
    if (s === "universe-discovery" && Object.keys(state.allProfiles || {}).length >= 6) {
      if (!seen.current.has("multiverse")) {
        seen.current.add("multiverse");
        logAndObserve("All six timelines have been mapped. The multiverse is now fully charted.");
      }
    }
  }, [state.currentScreen, state.allProfiles, logAndObserve]);

  const transitionTo = useCallback(
    (screen: AppScreenState, updates?: Partial<AppState>) => {
      setIsTransitioning(true);
      setTimeout(() => {
        setState((prev) => {
          const next = { ...prev, currentScreen: screen, ...updates };
          // Save immediately with the fully merged state so navigation never loses progress
          if (next.resumeAnalysis) {
            try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...next, resumeFile: null })); } catch {}
          }
          return next;
        });
        setIsTransitioning(false);
      }, 600);
    },
    []
  );

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const renderScreen = () => {
    const screenProps = { state, transitionTo, updateState };

    switch (state.currentScreen) {
      case "landing":
        return <Landing {...screenProps} savedExists={savedExists} onResume={resumeGame} onNewGame={clearSave} savedScreen={savedRef.current?.currentScreen} />;
      case "upload-resume":
        return <ResumeUpload {...screenProps} />;
      case "timeline-scan":
        return <TimelineScan {...screenProps} />;
      case "multiverse-calibration":
        return <MultiverseCalibration {...screenProps} />;
      case "universe-discovery":
        return <UniverseDiscovery {...screenProps} />;
      case "identity-reconstruction":
        return <IdentityReconstruction {...screenProps} />;
      case "future-transmission":
        return <FutureTransmission {...screenProps} />;
      case "multiverse-invitations":
        return <MultiverseInvitations {...screenProps} />;
      case "legendary-self":
        return <LegendarySelf {...screenProps} />;
      case "villain-self":
        return <VillainSelf {...screenProps} />;
      case "butterfly-effect":
        return <ButterflyEffect {...screenProps} />;
      case "council-of-selves":
        return <CouncilOfSelves {...screenProps} />;
      case "chronicle":
        return <Chronicle {...screenProps} />;
      default:
        return <Landing {...screenProps} />;
    }
  };

  return (
    <>
      {/* Persistent low-stability warning banner */}
      {showChrome && <TimelineWarningBanner stability={stability} />}

      {/* The Multiversal Historian observes */}
      <AnimatePresence>
        {showChrome && currentObs && (
          <HistorianObservation key={currentObs} text={currentObs} onDone={() => setCurrentObs(null)} />
        )}
      </AnimatePresence>

      {/* Stability change toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", bottom: 24, left: 24, zIndex: 1100,
              padding: "14px 20px", borderRadius: 14, minWidth: 220, maxWidth: 300,
              background: "rgba(8,9,13,0.97)", border: `1px solid ${toast.delta > 0 ? "rgba(78,205,196,0.35)" : "rgba(240,112,112,0.3)"}`,
              backdropFilter: "blur(16px)",
              boxShadow: toast.delta > 0 ? "0 8px 32px -8px rgba(78,205,196,0.3)" : "0 8px 32px -8px rgba(240,112,112,0.25)",
            }}
          >
            {/* Delta badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: toast.delta > 0 ? "rgba(78,205,196,0.15)" : "rgba(240,112,112,0.12)",
                color: toast.delta > 0 ? "var(--cyan2)" : "var(--rose2)",
              }}>
                {toast.delta > 0 ? "▲" : "▼"} {toast.delta > 0 ? "+" : ""}{toast.delta}
              </div>
              <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Timeline Stability · {toast.value}%
              </span>
            </div>
            {/* Narrative message */}
            <p style={{
              fontFamily: "Crimson Pro, serif", fontStyle: "italic",
              fontSize: 14, lineHeight: 1.55, color: "var(--text2)", margin: 0,
            }}>
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          minHeight: "100vh",
          transition: "opacity 0.5s",
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        {renderScreen()}
      </div>
    </>
  );
}
