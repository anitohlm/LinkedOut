"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppState, AppScreenState, AlternateProfile } from "@/types";

interface IdentityReconstructionProps {
  state: AppState;
  transitionTo: (screen: AppScreenState, updates?: any) => void;
  updateState: (updates: any) => void;
}

export default function IdentityReconstruction({
  state,
  transitionTo,
  updateState,
}: IdentityReconstructionProps) {
  const profile = state.selectedUniverse ? state.allProfiles?.[state.selectedUniverse] ?? null : null;
  const isLoading = false;
  const error = !profile ? "Profile not found" : null;

  useEffect(() => {}, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-dark-950 to-blue-900/20" />
        </div>

        <motion.div
          className="relative z-10 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-6xl mb-4">🌀</div>
          <p className="text-gray-300 text-lg">Reconstructing identity...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-dark-950 overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-dark-950 to-blue-900/20" />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-2xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-400 mb-6">{error || "Failed to load profile"}</p>
          <motion.button
            onClick={() => transitionTo("universe-discovery")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-500 hover:to-blue-500 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Back to Universe Selection
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const universe = state.selectedUniverse;
  const universe_config = require("@/lib/universes").getUniverse(universe);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-dark-950 overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${universe_config.gradientFrom} ${universe_config.gradientTo} opacity-20`}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-transparent to-dark-950" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 px-4 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back button */}
        <motion.button
          variants={itemVariants}
          onClick={() => transitionTo("universe-discovery")}
          className="mb-8 px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </motion.button>

        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{universe_config.emoji}</span>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">
                  <span className="text-gradient">{profile.alternativeName}</span>
                </h1>
                <p className="text-gray-400 text-lg mt-2">
                  {universe_config.title}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Profile Card */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="glass rounded-lg p-8 backdrop-blur-xl sticky top-20">
                {/* Profession Badge */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
                    Profession
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {profile.profession}
                  </h2>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Seniority
                    </p>
                    <p className="text-white capitalize">
                      {state.resumeAnalysis?.seniority}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Timeline Signature
                    </p>
                    <p className="text-gray-300 text-sm font-mono truncate">
                      {state.resumeAnalysis?.timelineSignature.substring(0, 16)}...
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => {
                    updateState({ selectedUniverse: universe });
                    transitionTo("future-transmission", {
                      selectedUniverse: universe,
                    });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Future Transmission
                </motion.button>
              </div>
            </motion.div>

            {/* Right Column - Details */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 space-y-8"
            >
              {/* Biography */}
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Biography</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.biography}
                </p>
              </div>

              {/* Personality Profile */}
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">
                  Personality Profile
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {profile.personalityProfile}
                </p>
              </div>

              {/* Timeline Story */}
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">
                  Timeline Story
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.timelineStory}
                </p>
              </div>

              {/* Career Trajectory */}
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">
                  Career Trajectory
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {profile.careerTrajectory}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Radar Scores Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="glass rounded-lg p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-white mb-8">
                Competency Matrix
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(profile.radarScores).map(([skill, score]) => (
                  <div key={skill}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 capitalize text-sm">
                        {skill}
                      </p>
                      <p className="text-white font-bold text-sm">{score}%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${universe_config.gradientFrom.replace("from-", "from-")} ${universe_config.gradientTo.replace("to-", "to-")}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Achievements & Competencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Achievements */}
            <motion.div variants={itemVariants}>
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  Achievements
                </h3>
                <ul className="space-y-3">
                  {profile.achievements.map((achievement, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-purple-400 mt-1">✦</span>
                      <span className="text-gray-300">{achievement}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Competencies */}
            <motion.div variants={itemVariants}>
              <div className="glass rounded-lg p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-6">
                  Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.competencies.map((comp, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm border border-white/20 hover:border-purple-400/50 transition-colors"
                    >
                      {comp}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Footer */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <motion.button
              onClick={() => transitionTo("universe-discovery")}
              className="px-6 py-3 glass rounded-lg text-white hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              ← Choose Another Universe
            </motion.button>

            <motion.button
              onClick={() => {
                updateState({ selectedUniverse: universe });
                transitionTo("future-transmission", {
                  selectedUniverse: universe,
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-500 hover:to-blue-500 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              Begin Transmission →
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
