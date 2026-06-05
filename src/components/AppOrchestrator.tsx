"use client";

import { useState, useCallback } from "react";
import { AppState, AppScreenState } from "@/types";
import Landing from "./screens/Landing";
import ResumeUpload from "./screens/ResumeUpload";
import TimelineScan from "./screens/TimelineScan";
import MultiverseCalibration from "./screens/MultiverseCalibration";
import UniverseDiscovery from "./screens/UniverseDiscovery";
import IdentityReconstruction from "./screens/IdentityReconstruction";
import FutureTransmission from "./screens/FutureTransmission";
import MultiverseInvitations from "./screens/MultiverseInvitations";

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
};

export function AppOrchestrator() {
  const [state, setState] = useState<AppState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        return <Landing {...screenProps} />;
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
      default:
        return <Landing {...screenProps} />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        transition: "opacity 0.5s",
        opacity: isTransitioning ? 0 : 1,
      }}
    >
      {renderScreen()}
    </div>
  );
}
