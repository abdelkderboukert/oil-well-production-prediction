"use client";

import { useState, useEffect, useCallback } from "react";
import { TARGETS, type ForecastHistoryRow, type TargetOutputs, forecastWell, fetchWells } from "../lib/api";

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-2">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white inline-block" />
    </span>
  );
}

function MiniChart({
  history,
  forecast,
  target,
}: {
  history: ForecastHistoryRow[];
  forecast: TargetOutputs;
  target: string;
}) {
  const key = target as keyof ForecastHistoryRow;
  const histVals = history.map((r) => Number(r[key]));
  const forecastVal = forecast[target as keyof TargetOutputs];
  const allVals = [...histVals, forecastVal];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;

  const W = 560;
  const H = 160;
  const padX = 40;
  const padY = 20;

  const toX = (i: number, total: number) =>
    padX + (i / (total - 1)) * (W - padX * 2);
  const toY = (v: number) =>
    H - padY - ((v - min) / range) * (H - padY * 2);

  const histPoints = histVals.map((v, i) => ({ x: toX(i, 9), y: toY(v) }));
  const forecastPoint = { x: toX(8, 9), y: toY(forecastVal) };

  const histPath = histPoints
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(" ");

  const connectPath = `M${histPoints[histPoints.length - 1].x},${
    histPoints[histPoints.length - 1].y
  } L${forecastPoint.x},${forecastPoint.y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 mt-4">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={padX}
          x2={W - padX}
          y1={toY(min + frac * range)}
          y2={toY(min + frac * range)}
          stroke="#1f2937"
          strokeWidth="1"
        />
      ))}
      {/* Historical line */}
      <path d={histPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Forecast connector (dashed) */}
      <path
        d={connectPath}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        strokeLinejoin="round"
      />
      {/* Historical dots */}
      {histPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
      ))}
      {/* Forecast dot */}
      <circle cx={forecastPoint.x} cy={forecastPoint.y} r="6" fill="#10b981" stroke="#064e3b" strokeWidth="2" />
      {/* Labels */}
      {histPoints.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#6b7280">
          Day {i + 1}
        </text>
      ))}
      <text x={forecastPoint.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#10b981">
        Tomorrow
      </text>
    </svg>
  );
}

export default function LSTMTab() {
  const [wells, setWells]       = useState<string[]>([]);
  const [selectedWell, setSelectedWell] = useState<string>("");
  const [loading, setLoading]   = useState(false);
  const [wellsLoading, setWellsLoading] = useState(true);
  const [result, setResult]     = useState<{ forecast: TargetOutputs; history: ForecastHistoryRow[] } | null>(null);
  const [chartTarget, setChartTarget] = useState<string>("W_GAS");
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setWellsLoading(true);
    fetchWells()
      .then((w) => {
        setWells(w);
        if (w.length > 0) setSelectedWell(w[0]);
      })
      .finally(() => setWellsLoading(false));
  }, []);

  const handleForecast = useCallback(async () => {
    if (!selectedWell) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await forecastWell(selectedWell);
      setResult({ forecast: data.forecast, history: data.history });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedWell]);

  return (
    <div className="animate-in">
      <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-2xl">
        Select a well from the database. The system fetches the last 7 days of production records,
        scales them, and runs them through the LSTM network to forecast tomorrow&apos;s outputs.
      </p>

      {/* Well selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Well
          </label>
          {wellsLoading ? (
            <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedWell}
              onChange={(e) => { setSelectedWell(e.target.value); setResult(null); }}
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            >
              {wells.length === 0 && (
                <option value="">No wells in database</option>
              )}
              {wells.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-end">
          <button
            onClick={handleForecast}
            disabled={loading || !selectedWell || wellsLoading}
            className="px-8 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40 flex items-center"
          >
            {loading ? <>Forecasting<LoadingDots /></> : "Run LSTM Forecast"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-800 bg-yellow-950/40 text-yellow-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-in space-y-8">
          {/* Forecast metrics */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Forecast — Tomorrow&apos;s Production for {selectedWell}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TARGETS.map((t) => (
                <div
                  key={t}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-800 transition-colors duration-200"
                >
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.replace("_", " ")}</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {result.forecast[t].toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Trend Visualization
              </h3>
              <select
                value={chartTarget}
                onChange={(e) => setChartTarget(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition"
              >
                {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-5 text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5 bg-indigo-500" /> Historical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-0.5 bg-emerald-500 border-dashed border-t-2" /> Forecast
              </span>
            </div>
            <MiniChart
              history={result.history}
              forecast={result.forecast}
              target={chartTarget}
            />
          </div>

          {/* History table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Last 7 Days — Historical Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-xs text-gray-500 font-semibold">DATE</th>
                    {TARGETS.map((t) => (
                      <th key={t} className="px-4 py-3 text-xs text-gray-500 font-semibold whitespace-nowrap">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.history.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-gray-300 text-xs font-mono">{row.date}</td>
                      {TARGETS.map((t) => (
                        <td key={t} className="px-4 py-2.5 text-gray-300 text-xs font-mono">
                          {Number(row[t as keyof ForecastHistoryRow]).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
