"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import tabs to avoid SSR issues with browser APIs
const VFMTab      = dynamic(() => import("./components/VFMTab"),      { ssr: false });
const LSTMTab     = dynamic(() => import("./components/LSTMTab"),     { ssr: false });
const AnalyzerTab = dynamic(() => import("./components/AnalyzerTab"), { ssr: false });

const TABS = [
  { id: "vfm",      label: "Virtual Flow Meter",    sub: "Random Forest Physics Simulator" },
  { id: "lstm",     label: "7-Day LSTM Forecaster",  sub: "Deep Learning Time-Series"       },
  { id: "analyzer", label: "Daily Report Analyzer",  sub: "Anomaly Detection & RCA"         },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("vfm");

  return (
    <div className="min-h-screen">
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800/70 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">WellSense AI</h1>
            <p className="text-xs text-gray-500 mt-0.5">Multi-Output Production Prediction Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-xs text-gray-400">API Connected</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Production Intelligence Platform
          </h2>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Predict six simultaneous production metrics (W_GAS, S_GAS, LPG_VOL, LPG_MASS,
            COND_VOL, COND_MASS) using a trained Random Forest model and a 7-day LSTM forecaster.
            Detect anomalies in daily field reports and pinpoint faulty sensors automatically.
          </p>
        </div>

        {/* ── Tab navigation ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-indigo-700 bg-indigo-950/60 shadow-lg shadow-indigo-900/30"
                  : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/70"
              }`}
            >
              <div className={`text-sm font-semibold mb-0.5 ${activeTab === tab.id ? "text-indigo-300" : "text-gray-300"}`}>
                {tab.label}
              </div>
              <div className="text-xs text-gray-500">{tab.sub}</div>
            </button>
          ))}
        </div>

        {/* ── Tab content panel ──────────────────────────────────────────────── */}
        <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-8">
          {/* Section title */}
          <div className="mb-8 pb-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {TABS.find((t) => t.id === activeTab)?.sub}
            </p>
          </div>

          {activeTab === "vfm"      && <VFMTab />}
          {activeTab === "lstm"     && <LSTMTab />}
          {activeTab === "analyzer" && <AnalyzerTab />}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-xs text-gray-600">
            WellSense AI — Oil Well Production Prediction
          </p>
          <p className="text-xs text-gray-600">
            Backend: <code className="text-gray-500">http://localhost:8000/api</code>
          </p>
        </footer>
      </main>
    </div>
  );
}
