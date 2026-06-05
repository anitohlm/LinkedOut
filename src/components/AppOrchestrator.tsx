"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppState, AppScreenState } from "@/types";
import { getTier } from "@/lib/stability";
import { historianLine, type HistorianEvent } from "@/lib/historian";
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
  const [toast, setToast] = useState<{ value: number; delta: number; key: number } | null>(null);

  useEffect(() => {
    const prev = prevStability.current;
    if (stability !== prev) {
      const delta = stability - prev;
      setToast({ value: stability, delta, key: Date.now() });
      prevStability.current = stability;
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [stability]);

  // Hide global HUD chrome on entry / landing screens
  const showChrome = !["landing", "upload-resume", "timeline-scan"].includes(state.currentScreen);

  // ── The Multiversal Historian ──────────────────────────────────────
  const firstName = state.resumeAnalysis?.firstName || (state.resumeAnalysis?.name || "").split(" ")[0] || "they";
  const [obsQueue, setObsQueue] = useState<string[]>([]);
  const [currentObs, setCurrentObs] = useState<string | null>(null);
  const observe = useCallback((event: HistorianEvent) => {
    setObsQueue(q => [...q, historianLine(event, firstName)]);
  }, [firstName]);

  // Pull next observation from the queue when idle
  useEffect(() => {
    if (!currentObs && obsQueue.length) {
      setCurrentObs(obsQueue[0]);
      setObsQueue(q => q.slice(1));
    }
  }, [obsQueue, currentObs]);

  // Watch stability tier crossings (own ref so it isn't clobbered by the toast effect)
  const prevTierLabel = useRef(getTier(stability).label);
  const prevTierStability = useRef(stability);
  useEffect(() => {
    const tier = getTier(stability);
    if (tier.label !== prevTierLabel.current) {
      const rose = stability > prevTierStability.current;
      if (tier.status === "critical" || tier.status === "collapse") observe("timeline-critical");
      else if (rose) observe("stability-rose");
      else observe("stability-fell");
      prevTierLabel.current = tier.label;
    }
    prevTierStability.current = stability;
  }, [stability, observe]);

  // Watch story milestones (screen-based, fire once each)
  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    const s = state.currentScreen;
    const fireOnce = (key: string, event: HistorianEvent) => {
      if (!seen.current.has(key)) { seen.current.add(key); observe(event); }
    };
    if (s === "universe-discovery" && Object.keys(state.allProfiles || {}).length >= 6) fireOnce("multiverse", "multiverse-born");
    if (s === "future-transmission") fireOnce("transmission", "first-transmission");
    if (s === "council-of-selves") fireOnce("council", "divergence-approaching");
    if (s === "chronicle") fireOnce("final", "final-choice");
  }, [state.currentScreen, state.allProfiles, observe]);

  const transitionTo = useCallback(
    (screen: AppScreenState, updates?: Partial<AppState>) => {
      setIsTransitioning(true);
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          currentScreen: screen,
          ...updates,
        }));
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

  const tier = getTier(stability);

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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 1100,
              display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 12,
              background: "rgba(14,16,24,0.95)", border: `1px solid ${tier.color}55`,
              backdropFilter: "blur(12px)", boxShadow: `0 8px 32px -8px ${tier.color}55`,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Timeline Stability</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: tier.color }}>{toast.value}%</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: toast.delta < 0 ? "var(--rose2)" : "var(--cyan2)" }}>
              {toast.delta < 0 ? "▼" : "▲"} {Math.abs(toast.delta)}
            </span>
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
