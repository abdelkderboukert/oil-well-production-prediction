"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Dynamically import tabs to avoid SSR issues with browser APIs
const VFMTab      = dynamic(() => import("../components/VFMTab"),      { ssr: false });
const LSTMTab     = dynamic(() => import("../components/LSTMTab"),     { ssr: false });
const AnalyzerTab = dynamic(() => import("../components/AnalyzerTab"), { ssr: false });

const TABS = [
  { id: "vfm",      label: "Virtual Flow Meter",    sub: "Random Forest Physics Simulator" },
  { id: "lstm",     label: "7-Day LSTM Forecaster",  sub: "Deep Learning Time-Series"       },
  { id: "analyzer", label: "Daily Report Analyzer",  sub: "Anomaly Detection & RCA"         },
] as const;

type TabId = typeof TABS[number]["id"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("vfm");

  return (
    <div className="min-h-screen bg-oil-black flex flex-col noise">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-24 w-full relative z-10 mt-12">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-3">
            <span className="font-mono text-[10px] tracking-widest uppercase text-oil-amber border border-oil-amber/30 px-3 py-1 inline-block bg-oil-amber/5">
              Production Intelligence Workspace
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-oil-light mb-4">
            Analysis Dashboard
          </h1>
          <p className="text-oil-mist max-w-2xl leading-relaxed text-sm font-body">
            Predict six simultaneous production metrics using our trained Random Forest model and a 7-day LSTM forecaster. Detect anomalies in daily field reports and pinpoint faulty sensors automatically.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-left px-6 py-5 border transition-all duration-300 relative overflow-hidden group ${
                activeTab === tab.id
                  ? "border-oil-amber bg-oil-amber/10 shadow-[0_0_20px_rgba(212,136,42,0.15)]"
                  : "border-oil-border bg-oil-surface/40 hover:border-oil-smoke hover:bg-oil-surface"
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-oil-amber/10 to-transparent" />
              )}
              <div className="relative z-10">
                <div className={`text-sm font-bold tracking-wide mb-1 transition-colors ${activeTab === tab.id ? "text-oil-amber" : "text-oil-light group-hover:text-oil-mist"}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-oil-smoke">{tab.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <div className="bg-oil-deep/80 backdrop-blur-md border border-oil-border p-8 min-h-[500px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-oil-amber opacity-[0.02] blur-3xl rounded-full" />
          {/* Section title */}
          <div className="mb-8 pb-6 border-b border-oil-border relative z-10">
            <h3 className="text-xl font-bold font-display text-oil-light tracking-wide">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-[10px] uppercase font-mono tracking-widest text-oil-smoke mt-2">
              {TABS.find((t) => t.id === activeTab)?.sub}
            </p>
          </div>

          <div className="relative z-10">
            {activeTab === "vfm"      && <VFMTab />}
            {activeTab === "lstm"     && <LSTMTab />}
            {activeTab === "analyzer" && <AnalyzerTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
