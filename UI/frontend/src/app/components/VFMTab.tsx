"use client";

import { useState } from "react";
import { FEATURES, TARGETS, type FeatureInputs, type TargetOutputs, predictProduction, type Feature } from "../../lib/api";

// Slider config: label, min, max, default, step
const SLIDER_CONFIG: Record<string, { label: string; min: number; max: number; defaultVal: number; step: number; unit: string }> = {
  HOURS: { label: "HOURS",  min: 0,   max: 24,  defaultVal: 24,   step: 0.5,  unit: "h"   },
  WHP:   { label: "WHP",    min: 0,   max: 300, defaultVal: 80,   step: 1,    unit: "bar" },
  WHT:   { label: "WHT",    min: 0,   max: 150, defaultVal: 65,   step: 1,    unit: "°C"  },
  WLP:   { label: "WLP",    min: 0,   max: 150, defaultVal: 25,   step: 1,    unit: "bar" },
  H2O:   { label: "H2O",   min: 0,   max: 100, defaultVal: 8,    step: 0.5,  unit: ""    },
  WATER: { label: "WATER",  min: 0,   max: 200, defaultVal: 15,   step: 1,    unit: ""    },
};

const TARGET_LABELS: Record<string, { label: string; unit: string }> = {
  W_GAS:    { label: "W GAS",    unit: "m³"  },
  S_GAS:    { label: "S GAS",    unit: "m³"  },
  LPG_VOL:  { label: "LPG VOL",  unit: "m³"  },
  LPG_MASS: { label: "LPG MASS", unit: "kg"  },
  COND_VOL: { label: "COND VOL", unit: "m³"  },
  COND_MASS:{ label: "COND MASS",unit: "kg"  },
};

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-2">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-light inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-light inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-oil-light inline-block" />
    </span>
  );
}

export default function VFMTab() {
  const initInputs = () =>
    Object.fromEntries(FEATURES.map((f) => [f, SLIDER_CONFIG[f].defaultVal])) as FeatureInputs;

  const [inputs, setInputs]   = useState<FeatureInputs>(initInputs);
  const [results, setResults] = useState<TargetOutputs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSlider = (feature: string, value: number) => {
    setInputs((prev) => ({ ...prev, [feature]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictProduction(inputs);
      setResults(data.predictions);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Backend unreachable — ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      <p className="text-oil-mist mb-8 text-sm leading-relaxed max-w-2xl font-body">
        Adjust the operating parameters using the sliders below. The Random Forest model will
        instantly compute all six production metrics from the given wellhead conditions.
      </p>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {FEATURES.map((feat) => {
          const cfg = SLIDER_CONFIG[feat];
          return (
            <div key={feat} className="bg-oil-deep/80 backdrop-blur border border-oil-border rounded-xl p-5 hover:border-oil-smoke transition-colors">
              <div className="flex justify-between mb-3">
                <span className="text-[10px] font-semibold text-oil-smoke uppercase tracking-widest font-mono">
                  {cfg.label}
                </span>
                <span className="text-sm font-mono font-bold text-oil-amber">
                  {inputs[feat as Feature]}{cfg.unit}
                </span>
              </div>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={inputs[feat as Feature]}
                onChange={(e) => handleSlider(feat, parseFloat(e.target.value))}
                className="w-full accent-oil-amber"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-oil-smoke font-mono">{cfg.min}{cfg.unit}</span>
                <span className="text-xs text-oil-smoke font-mono">{cfg.max}{cfg.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predict button */}
      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full md:w-auto px-8 py-4 bg-oil-amber hover:bg-oil-gold disabled:opacity-60 disabled:cursor-not-allowed text-oil-black font-mono tracking-widest text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading ? <>Running<LoadingDots /></> : "Run RF Prediction →"}
        </span>
      </button>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-lg border border-oil-rust/50 bg-oil-rust/10 text-red-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-12 animate-fade-up">
          <h3 className="text-[10px] font-semibold text-oil-smoke uppercase tracking-widest font-mono mb-4">
            Predicted Production Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TARGETS.map((t) => (
              <div
                key={t}
                className="bg-oil-surface/50 border border-oil-border rounded-xl p-5 hover:bg-oil-surface transition-colors duration-300 relative overflow-hidden"
              >
                <div className="text-[10px] text-oil-smoke tracking-widest mb-1 font-mono uppercase">
                  {TARGET_LABELS[t].label}
                </div>
                <div className="text-2xl font-black font-display text-oil-light">
                  {results[t].toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-oil-mist mt-1 font-mono">{TARGET_LABELS[t].unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
