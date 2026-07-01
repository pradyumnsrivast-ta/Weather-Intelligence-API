import React from "react";
import { WeatherIntelligenceResponse } from "../types";
import { WeatherIcon } from "./WeatherIcons";
import { motion, AnimatePresence } from "motion/react";

interface AIPanelProps {
  analysis: WeatherIntelligenceResponse | null;
  isLoading: boolean;
  cityName: string;
  loadingStep: string;
}

export function AIPanel({ analysis, isLoading, cityName, loadingStep }: AIPanelProps) {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden border border-slate-800">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with intelligence indicator */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <WeatherIcon name="Sparkles" size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-100">Weather Intelligence Panel</h2>
            <p className="text-xs text-slate-400">Meteorological Analysis Index • LOCAL_CALC</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-1 rounded-md border border-slate-700/50">
          SECURE_INTELLI_NODE
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <WeatherIcon name="Sparkles" size={24} className="animate-pulse" />
              </div>
            </div>
            <p className="font-display font-medium text-slate-200">Analyzing weather telemetry...</p>
            <p className="text-sm text-emerald-400 font-mono mt-2 min-h-[1.5rem] transition-all duration-300">
              ⚡ {loadingStep}
            </p>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Overview Box */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <WeatherIcon name="Info" size={14} className="text-slate-400" />
                <span>Current Condition Overview</span>
              </div>
              <p className="text-lg font-display text-slate-200 leading-relaxed font-light">
                {analysis.currentOverview}
              </p>
            </div>

            {/* Weekly Forecast Narrative */}
            <div className="space-y-2 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <WeatherIcon name="TrendingUp" size={14} />
                <span>7-Day Trend Narrative</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {analysis.forecastBreakdown}
              </p>
            </div>

            {/* Alerts Section - conditional visual cue */}
            {analysis.smartRecommendations.alerts && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-300">
                <div className="p-1.5 bg-rose-500/20 rounded-lg shrink-0 mt-0.5">
                  <WeatherIcon name="ShieldAlert" size={16} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-rose-400">Active Weather Advisory</h4>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    {analysis.smartRecommendations.alerts}
                  </p>
                </div>
              </div>
            )}

            {/* Actionable Recommendations Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Clothing Selection Card */}
              <div className="bg-slate-950/40 hover:bg-slate-950/60 transition-colors border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400/10 rounded-xl text-amber-400 shrink-0">
                    <WeatherIcon name="Shirt" size={18} />
                  </div>
                  <h3 className="font-display font-medium text-sm text-slate-200">Clothing & Gear</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {analysis.smartRecommendations.clothing}
                </p>
              </div>

              {/* Outdoor Activities Advice Card */}
              <div className="bg-slate-950/40 hover:bg-slate-950/60 transition-colors border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-400/10 rounded-xl text-blue-400 shrink-0">
                    <WeatherIcon name="Compass" size={18} />
                  </div>
                  <h3 className="font-display font-medium text-sm text-slate-200">Smart Plans & Activities</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {analysis.smartRecommendations.activities}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <WeatherIcon name="Sparkles" size={32} className="text-slate-700" />
            <p className="text-sm">Search for a city above to activate weather intelligence analysis.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
