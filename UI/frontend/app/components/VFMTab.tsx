"use client";

import { useState } from "react";
import { FEATURES, TARGETS, type FeatureInputs, type TargetOutputs, predictProduction } from "../lib/api";

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
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
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
    <div className="animate-in">
      <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-2xl">
        Adjust the operating parameters using the sliders below. The Random Forest model will
        instantly compute all six production metrics from the given wellhead conditions.
      </p>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {FEATURES.map((feat) => {
          const cfg = SLIDER_CONFIG[feat];
          return (
            <div key={feat} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {cfg.label}
                </span>
                <span className="text-sm font-mono font-bold text-indigo-400">
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
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600">{cfg.min}{cfg.unit}</span>
                <span className="text-xs text-gray-600">{cfg.max}{cfg.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predict button */}
      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-700/50 flex items-center gap-2"
      >
        {loading ? <>Running Prediction<LoadingDots /></> : "Run Random Forest Prediction"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-lg border border-yellow-800 bg-yellow-950/40 text-yellow-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-8 animate-in">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Predicted Production Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TARGETS.map((t) => (
              <div
                key={t}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-800 transition-colors duration-200"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {TARGET_LABELS[t].label}
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {results[t].toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-600 mt-1">{TARGET_LABELS[t].unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
